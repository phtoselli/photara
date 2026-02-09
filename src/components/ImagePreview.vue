<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import type { Tool, CropArea } from '../types'

const props = defineProps<{
  image: HTMLImageElement | null
  activeTool: Tool
  cropArea: CropArea
  showOriginal: boolean
  processImage: () => HTMLCanvasElement | null
  previewTrigger?: string
}>()

const emit = defineEmits<{
  'update:cropArea': [area: CropArea]
}>()

const container = ref<HTMLDivElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const displayScale = ref(1)

// Crop interaction state
const isDragging = ref(false)
const dragType = ref<'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w' | null>(null)
const dragStart = ref({ x: 0, y: 0 })
const cropStart = ref<CropArea>({ x: 0, y: 0, width: 0, height: 0 })

function updateCanvas() {
  if (!canvas.value || !props.image) return
  const el = canvas.value
  const ctn = container.value
  if (!ctn) return

  const ctnW = ctn.clientWidth - 32
  const ctnH = ctn.clientHeight - 32

  // Decide what to render
  const showEdited = !props.showOriginal && props.activeTool !== 'crop'
  let sourceCanvas: HTMLCanvasElement | null = null

  if (showEdited) {
    sourceCanvas = props.processImage()
  }

  const srcW = sourceCanvas ? sourceCanvas.width : props.image.naturalWidth
  const srcH = sourceCanvas ? sourceCanvas.height : props.image.naturalHeight

  const scale = Math.min(ctnW / srcW, ctnH / srcH, 1)
  displayScale.value = props.showOriginal || props.activeTool === 'crop'
    ? Math.min(ctnW / props.image.naturalWidth, ctnH / props.image.naturalHeight, 1)
    : scale

  const drawW = Math.round(srcW * scale)
  const drawH = Math.round(srcH * scale)

  el.width = drawW
  el.height = drawH
  el.style.width = drawW + 'px'
  el.style.height = drawH + 'px'

  const ctx = el.getContext('2d')
  if (!ctx) return

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.clearRect(0, 0, drawW, drawH)

  if (showEdited && sourceCanvas) {
    ctx.drawImage(sourceCanvas, 0, 0, drawW, drawH)
  } else {
    ctx.drawImage(props.image, 0, 0, drawW, drawH)
    if (props.activeTool === 'crop' && !props.showOriginal) {
      drawCropOverlay(ctx, drawW, drawH)
    }
  }
}

function drawCropOverlay(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
  const s = displayScale.value
  const cx = props.cropArea.x * s
  const cy = props.cropArea.y * s
  const cw = props.cropArea.width * s
  const ch = props.cropArea.height * s

  // Dim outside crop
  ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.fillRect(0, 0, canvasW, cy)
  ctx.fillRect(0, cy + ch, canvasW, canvasH - cy - ch)
  ctx.fillRect(0, cy, cx, ch)
  ctx.fillRect(cx + cw, cy, canvasW - cx - cw, ch)

  // Crop border
  ctx.strokeStyle = '#E8794A'
  ctx.lineWidth = 2
  ctx.strokeRect(cx, cy, cw, ch)

  // Rule of thirds
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 1
  for (let i = 1; i <= 2; i++) {
    ctx.beginPath()
    ctx.moveTo(cx + (cw * i) / 3, cy)
    ctx.lineTo(cx + (cw * i) / 3, cy + ch)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(cx, cy + (ch * i) / 3)
    ctx.lineTo(cx + cw, cy + (ch * i) / 3)
    ctx.stroke()
  }

  // Corner handles
  const handleSize = 10
  ctx.fillStyle = '#E8794A'
  const corners: [number, number][] = [
    [cx, cy],
    [cx + cw, cy],
    [cx, cy + ch],
    [cx + cw, cy + ch],
  ]
  for (const [hx, hy] of corners) {
    ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize)
  }
}

function getCanvasCoords(e: MouseEvent): { x: number; y: number } {
  if (!canvas.value) return { x: 0, y: 0 }
  const rect = canvas.value.getBoundingClientRect()
  return {
    x: (e.clientX - rect.left) / displayScale.value,
    y: (e.clientY - rect.top) / displayScale.value,
  }
}

function getHandleAtPoint(px: number, py: number): typeof dragType.value {
  const { x, y, width, height } = props.cropArea
  const threshold = 12 / displayScale.value

  const nearLeft = Math.abs(px - x) < threshold
  const nearRight = Math.abs(px - (x + width)) < threshold
  const nearTop = Math.abs(py - y) < threshold
  const nearBottom = Math.abs(py - (y + height)) < threshold

  if (nearTop && nearLeft) return 'nw'
  if (nearTop && nearRight) return 'ne'
  if (nearBottom && nearLeft) return 'sw'
  if (nearBottom && nearRight) return 'se'
  if (nearTop) return 'n'
  if (nearBottom) return 's'
  if (nearLeft) return 'w'
  if (nearRight) return 'e'

  if (px > x && px < x + width && py > y && py < y + height) return 'move'
  return null
}

function onMouseDown(e: MouseEvent) {
  if (props.activeTool !== 'crop' || !props.image || props.showOriginal) return
  const coords = getCanvasCoords(e)
  const handle = getHandleAtPoint(coords.x, coords.y)
  if (!handle) return

  isDragging.value = true
  dragType.value = handle
  dragStart.value = coords
  cropStart.value = { ...props.cropArea }
  e.preventDefault()
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value || !props.image) return

  const coords = getCanvasCoords(e)
  const dx = coords.x - dragStart.value.x
  const dy = coords.y - dragStart.value.y
  const imgW = props.image.naturalWidth
  const imgH = props.image.naturalHeight

  let { x, y, width, height } = cropStart.value

  if (dragType.value === 'move') {
    x = Math.max(0, Math.min(imgW - width, x + dx))
    y = Math.max(0, Math.min(imgH - height, y + dy))
  } else {
    if (dragType.value?.includes('w')) {
      const newX = Math.max(0, Math.min(x + width - 20, x + dx))
      width = width + (x - newX)
      x = newX
    }
    if (dragType.value?.includes('e')) {
      width = Math.max(20, Math.min(imgW - x, width + dx))
    }
    if (dragType.value?.includes('n')) {
      const newY = Math.max(0, Math.min(y + height - 20, y + dy))
      height = height + (y - newY)
      y = newY
    }
    if (dragType.value?.includes('s')) {
      height = Math.max(20, Math.min(imgH - y, height + dy))
    }
  }

  emit('update:cropArea', {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(width),
    height: Math.round(height),
  })
}

function onMouseUp() {
  isDragging.value = false
  dragType.value = null
}

function getCursorForTool(e: MouseEvent): string {
  if (props.activeTool !== 'crop' || props.showOriginal) return 'default'
  const coords = getCanvasCoords(e)
  const handle = getHandleAtPoint(coords.x, coords.y)
  const cursors: Record<string, string> = {
    nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
    n: 'n-resize', s: 's-resize', w: 'w-resize', e: 'e-resize',
    move: 'move',
  }
  return handle ? (cursors[handle] || 'crosshair') : 'crosshair'
}

function onCanvasMouseMove(e: MouseEvent) {
  if (canvas.value) {
    canvas.value.style.cursor = getCursorForTool(e)
  }
  onMouseMove(e)
}

watch(() => [props.image, props.activeTool, props.cropArea, props.showOriginal, props.previewTrigger], () => {
  requestAnimationFrame(updateCanvas)
}, { deep: true })

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  updateCanvas()
  if (container.value) {
    resizeObserver = new ResizeObserver(() => updateCanvas())
    resizeObserver.observe(container.value)
  }
  window.addEventListener('mouseup', onMouseUp)
  window.addEventListener('mousemove', onMouseMove)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousemove', onMouseMove)
})
</script>

<template>
  <div ref="container" class="preview-container">
    <div class="canvas-wrapper" v-if="image">
      <canvas
        ref="canvas"
        @mousedown="onMouseDown"
        @mousemove="onCanvasMouseMove"
      />
    </div>
    <div v-else class="no-image">
      <span>Nenhuma imagem carregada</span>
    </div>
  </div>
</template>

<style scoped>
.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--surface-sunken);
  border-radius: 12px;
  position: relative;

  background-image:
    linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
    linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.02) 75%),
    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.02) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}

.canvas-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

canvas {
  display: block;
  border-radius: 4px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.no-image {
  color: var(--text-muted);
  font-size: 14px;
}
</style>
