import { ref, computed, reactive } from 'vue'
import { toolRegistry } from '../tools'
import type { IToolDefinition } from '../tools/core/tool.types'
import type { Dimensions } from '../types'
import { createBlob, triggerDownload } from '../utils/download'

export function useImageEditor() {
  const originalImage = ref<HTMLImageElement | null>(null)
  const originalDimensions = ref<Dimensions>({ width: 0, height: 0 })
  const fileName = ref('')
  const fileSize = ref(0)
  const activeTool = ref<string>('resize')

  const toolStates = reactive<Record<string, any>>({})

  const currentTool = computed<IToolDefinition | undefined>(() =>
    toolRegistry.get(activeTool.value)
  )

  const currentToolState = computed(() =>
    toolStates[activeTool.value]
  )

  const hasImage = computed(() => originalImage.value !== null)

  const originalFormat = computed(() => {
    const ext = fileName.value.split('.').pop()?.toLowerCase()
    const formatMap: Record<string, string> = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'webp': 'image/webp',
      'avif': 'image/avif',
      'bmp': 'image/bmp',
      'ico': 'image/x-icon',
    }
    return formatMap[ext || 'png'] || 'image/png'
  })

  function initializeToolStates() {
    const tools = toolRegistry.getAll()

    tools.forEach(tool => {
      if (!toolStates[tool.id]) {
        toolStates[tool.id] = tool.initialState()
      }
    })
  }

  async function loadImage(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      // Revoga objectURL anterior para evitar memory leak
      if (originalImage.value?.src) {
        URL.revokeObjectURL(originalImage.value.src)
      }

      const img = new Image()
      const url = URL.createObjectURL(file)

      fileName.value = file.name
      fileSize.value = file.size

      img.onload = () => {
        originalImage.value = img
        originalDimensions.value = {
          width: img.naturalWidth,
          height: img.naturalHeight
        }

        initializeToolStates()

        const tools = toolRegistry.getAll()
        tools.forEach(tool => {
          if (tool.reset && originalImage.value) {
            toolStates[tool.id] = tool.reset(toolStates[tool.id], originalImage.value)
          }
        })

        resolve()
      }

      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  }

  function clearImage(): void {
    if (originalImage.value?.src) {
      URL.revokeObjectURL(originalImage.value.src)
    }

    originalImage.value = null
    originalDimensions.value = { width: 0, height: 0 }
    fileName.value = ''
    fileSize.value = 0

    Object.keys(toolStates).forEach(key => delete toolStates[key])
  }

  function updateToolState(toolId: string, newState: any): void {
    toolStates[toolId] = newState
  }

  function resetActiveTool(): void {
    const tool = currentTool.value
    if (!tool || !originalImage.value) return

    if (tool.reset) {
      toolStates[tool.id] = tool.reset(toolStates[tool.id], originalImage.value)
    } else {
      toolStates[tool.id] = tool.initialState()
    }
  }

  function processImage(): HTMLCanvasElement | null {
    if (!originalImage.value || !currentTool.value) return null

    const tool = currentTool.value
    const state = toolStates[tool.id]

    if (tool.validate) {
      const validation = tool.validate(state)
      if (validation !== true) {
        console.warn(`Validation failed for ${tool.id}:`, validation)
      }
    }

    try {
      return tool.processor(originalImage.value, state)
    } catch (error) {
      console.error(`Error processing with tool ${tool.id}:`, error)
      return null
    }
  }

  async function processWithPipeline(toolIds: string[]): Promise<HTMLCanvasElement | null> {
    if (!originalImage.value) return null

    let currentCanvas: HTMLCanvasElement | null = null
    let currentImage: HTMLImageElement = originalImage.value

    for (let i = 0; i < toolIds.length; i++) {
      const toolId = toolIds[i]
      const tool = toolRegistry.get(toolId)
      if (!tool) continue

      const state = toolStates[toolId]

      try {
        currentCanvas = tool.processor(currentImage, state)

        // Converte canvas em imagem para próximo passo do pipeline
        if (i < toolIds.length - 1) {
          currentImage = await canvasToImage(currentCanvas)
        }
      } catch (error) {
        console.error(`Pipeline error at tool ${toolId}:`, error)
        break
      }
    }

    return currentCanvas
  }

  async function downloadImageAs(format: string, quality = 92): Promise<void> {
    const canvas = processImage()
    if (!canvas) {
      console.error('No canvas to download')
      return
    }

    const blob = await createBlob(canvas, format, quality)
    if (!blob) {
      console.error('Failed to create blob for format:', format)
      return
    }

    const baseName = fileName.value.replace(/\.[^.]+$/, '')
    triggerDownload(blob, baseName, format)
  }

  return {
    originalImage,
    originalDimensions,
    fileName,
    fileSize,
    activeTool,
    toolStates,
    originalFormat,

    currentTool,
    currentToolState,
    hasImage,

    loadImage,
    clearImage,
    updateToolState,
    resetActiveTool,
    processImage,
    processWithPipeline,
    initializeToolStates,
    downloadImageAs,
  }
}

function canvasToImage(canvas: HTMLCanvasElement): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Failed to convert canvas to image'))
    img.src = canvas.toDataURL()
  })
}
