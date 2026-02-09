import { ref, computed } from 'vue'
import type { Tool, Dimensions, CropArea, ImageFormat, ExpandPadding, VignetteSettings, DownloadFormat } from '../types'
import { FORMAT_OPTIONS } from '../constants/formats'
import { applyResize, applyCrop, applyExpand, applyVignette, drawOriginal } from '../utils/canvas'
import { createBlob, triggerDownload, extensionToDownloadFormat } from '../utils/download'

export function useImageProcessor() {
  // Image state
  const originalImage = ref<HTMLImageElement | null>(null)
  const originalDimensions = ref<Dimensions>({ width: 0, height: 0 })
  const fileName = ref('')
  const fileSize = ref(0)
  const activeTool = ref<Tool>('resize')

  // Resize state
  const resizeWidth = ref(0)
  const resizeHeight = ref(0)
  const lockAspectRatio = ref(true)
  const aspectRatio = ref(1)

  // Crop state
  const cropArea = ref<CropArea>({ x: 0, y: 0, width: 0, height: 0 })

  // Expand state
  const expandPadding = ref<ExpandPadding>({ top: 0, right: 0, bottom: 0, left: 0 })
  const expandFillColor = ref('#000000')
  const expandLinkSides = ref(true)

  // Vignette state
  const vignetteSettings = ref<VignetteSettings>({
    direction: 'radial',
    color: '#000000',
    intensity: 70,
    spread: 50,
  })

  // Convert state
  const outputFormat = ref<ImageFormat>('image/png')
  const quality = ref(92)

  // Computed
  const hasImage = computed(() => originalImage.value !== null)

  const currentFormatOption = computed(() =>
    FORMAT_OPTIONS.find(f => f.value === outputFormat.value) ?? FORMAT_OPTIONS[0]
  )

  const originalFormat = computed<DownloadFormat>(() => {
    const ext = fileName.value.split('.').pop()?.toLowerCase()
    return extensionToDownloadFormat(ext)
  })

  // Image loading
  function loadImage(file: File) {
    return new Promise<void>((resolve) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      fileName.value = file.name
      fileSize.value = file.size

      img.onload = () => {
        originalImage.value = img
        originalDimensions.value = { width: img.naturalWidth, height: img.naturalHeight }
        resizeWidth.value = img.naturalWidth
        resizeHeight.value = img.naturalHeight
        aspectRatio.value = img.naturalWidth / img.naturalHeight
        cropArea.value = { x: 0, y: 0, width: img.naturalWidth, height: img.naturalHeight }

        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext === 'jpg' || ext === 'jpeg') outputFormat.value = 'image/jpeg'
        else if (ext === 'webp') outputFormat.value = 'image/webp'
        else outputFormat.value = 'image/png'

        resolve()
      }
      img.src = url
    })
  }

  function clearImage() {
    if (originalImage.value?.src) {
      URL.revokeObjectURL(originalImage.value.src)
    }
    originalImage.value = null
    originalDimensions.value = { width: 0, height: 0 }
    fileName.value = ''
    fileSize.value = 0
  }

  // Resize helpers
  function updateResizeWidth(w: number) {
    resizeWidth.value = Math.max(1, Math.round(w))
    if (lockAspectRatio.value) {
      resizeHeight.value = Math.max(1, Math.round(resizeWidth.value / aspectRatio.value))
    }
  }

  function updateResizeHeight(h: number) {
    resizeHeight.value = Math.max(1, Math.round(h))
    if (lockAspectRatio.value) {
      resizeWidth.value = Math.max(1, Math.round(resizeHeight.value * aspectRatio.value))
    }
  }

  function applyResizePercent(percent: number) {
    const w = Math.round(originalDimensions.value.width * percent / 100)
    const h = Math.round(originalDimensions.value.height * percent / 100)
    resizeWidth.value = Math.max(1, w)
    resizeHeight.value = Math.max(1, h)
  }

  // Reset helpers
  function resetResize() {
    resizeWidth.value = originalDimensions.value.width
    resizeHeight.value = originalDimensions.value.height
  }

  function resetCrop() {
    if (originalImage.value) {
      cropArea.value = {
        x: 0,
        y: 0,
        width: originalImage.value.naturalWidth,
        height: originalImage.value.naturalHeight,
      }
    }
  }

  function resetExpand() {
    expandPadding.value = { top: 0, right: 0, bottom: 0, left: 0 }
  }

  function resetVignette() {
    vignetteSettings.value = {
      direction: 'radial',
      color: '#000000',
      intensity: 70,
      spread: 50,
    }
  }

  // Processing — delegates to pure canvas functions
  function processImage(): HTMLCanvasElement | null {
    if (!originalImage.value) return null

    switch (activeTool.value) {
      case 'resize':
        return applyResize(originalImage.value, resizeWidth.value, resizeHeight.value)
      case 'crop':
        return applyCrop(originalImage.value, cropArea.value)
      case 'vignette':
        return applyVignette(originalImage.value, vignetteSettings.value)
      case 'expand':
        return applyExpand(originalImage.value, expandPadding.value, expandFillColor.value)
      default:
        return drawOriginal(originalImage.value)
    }
  }

  // Download
  function getProcessedBlob(format?: ImageFormat): Promise<Blob | null> {
    const canvas = processImage()
    if (!canvas) return Promise.resolve(null)

    const fmt = format ?? outputFormat.value
    return new Promise((resolve) => {
      const q = fmt === 'image/png' ? undefined : quality.value / 100
      canvas.toBlob((blob) => resolve(blob), fmt, q)
    })
  }

  async function downloadImageAs(format: DownloadFormat) {
    const canvas = processImage()
    if (!canvas) return

    const blob = await createBlob(canvas, format, quality.value)
    if (!blob) return

    const baseName = fileName.value.replace(/\.[^.]+$/, '')
    triggerDownload(blob, baseName, format)
  }

  async function downloadImage() {
    await downloadImageAs(outputFormat.value)
  }

  return {
    originalImage,
    originalDimensions,
    fileName,
    fileSize,
    activeTool,
    resizeWidth,
    resizeHeight,
    lockAspectRatio,
    cropArea,
    expandPadding,
    expandFillColor,
    expandLinkSides,
    vignetteSettings,
    outputFormat,
    quality,
    hasImage,
    currentFormatOption,
    originalFormat,
    loadImage,
    clearImage,
    updateResizeWidth,
    updateResizeHeight,
    applyResizePercent,
    resetResize,
    resetCrop,
    resetExpand,
    resetVignette,
    processImage,
    getProcessedBlob,
    downloadImage,
    downloadImageAs,
  }
}
