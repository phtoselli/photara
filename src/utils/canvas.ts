import type { CropArea, ExpandPadding, VignetteSettings } from '../types'

export function applyResize(
  image: HTMLImageElement,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, width, height)
  return canvas
}

export function applyCrop(
  image: HTMLImageElement,
  cropArea: CropArea,
): HTMLCanvasElement {
  const { x, y, width, height } = cropArea
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)
  return canvas
}

export function applyExpand(
  image: HTMLImageElement,
  padding: ExpandPadding,
  fillColor: string,
): HTMLCanvasElement {
  const { top, right, bottom, left } = padding
  const imgW = image.naturalWidth
  const imgH = image.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = imgW + left + right
  canvas.height = imgH + top + bottom
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = fillColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, left, top)
  return canvas
}

export function applyVignette(
  image: HTMLImageElement,
  settings: VignetteSettings,
): HTMLCanvasElement {
  const imgW = image.naturalWidth
  const imgH = image.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = imgW
  canvas.height = imgH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0)

  const { direction, color, intensity, spread } = settings
  const alpha = Math.min(intensity / 100, 1)
  const passes = intensity > 100 ? Math.ceil(intensity / 100) : 1
  const lastPassAlpha = intensity > 100 ? (intensity % 100) / 100 || 1 : alpha

  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)
  const spreadFactor = spread / 100

  for (let pass = 0; pass < passes; pass++) {
    const passAlpha = pass < passes - 1 ? 1 : lastPassAlpha
    const colorStart = `rgba(${r},${g},${b},${passAlpha})`
    const colorEnd = `rgba(${r},${g},${b},0)`

    if (direction === 'radial') {
      drawRadialVignette(ctx, imgW, imgH, spreadFactor, colorStart, colorEnd)
    } else {
      drawLinearVignette(ctx, imgW, imgH, direction, spreadFactor, colorStart, colorEnd)
    }
  }

  return canvas
}

export function drawOriginal(image: HTMLImageElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0)
  return canvas
}

function drawRadialVignette(
  ctx: CanvasRenderingContext2D,
  imgW: number,
  imgH: number,
  spreadFactor: number,
  colorStart: string,
  colorEnd: string,
) {
  const cx = imgW / 2
  const cy = imgH / 2
  const maxRadius = Math.sqrt(cx * cx + cy * cy)
  const innerRadius = maxRadius * Math.max(0, 1 - spreadFactor)
  const grad = ctx.createRadialGradient(cx, cy, innerRadius, cx, cy, maxRadius)
  grad.addColorStop(0, colorEnd)
  grad.addColorStop(1, colorStart)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, imgW, imgH)
}

function drawLinearVignette(
  ctx: CanvasRenderingContext2D,
  imgW: number,
  imgH: number,
  direction: 'left' | 'right' | 'top' | 'bottom',
  spreadFactor: number,
  colorStart: string,
  colorEnd: string,
) {
  const isHorizontal = direction === 'left' || direction === 'right'
  const size = Math.min(Math.max(imgW, imgH) * spreadFactor, isHorizontal ? imgW : imgH)
  let grad: CanvasGradient

  if (direction === 'left') {
    grad = ctx.createLinearGradient(0, 0, size, 0)
    grad.addColorStop(0, colorStart)
    grad.addColorStop(1, colorEnd)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, imgH)
  } else if (direction === 'right') {
    grad = ctx.createLinearGradient(imgW, 0, imgW - size, 0)
    grad.addColorStop(0, colorStart)
    grad.addColorStop(1, colorEnd)
    ctx.fillStyle = grad
    ctx.fillRect(imgW - size, 0, size, imgH)
  } else if (direction === 'top') {
    grad = ctx.createLinearGradient(0, 0, 0, size)
    grad.addColorStop(0, colorStart)
    grad.addColorStop(1, colorEnd)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, imgW, size)
  } else {
    grad = ctx.createLinearGradient(0, imgH, 0, imgH - size)
    grad.addColorStop(0, colorStart)
    grad.addColorStop(1, colorEnd)
    ctx.fillStyle = grad
    ctx.fillRect(0, imgH - size, imgW, size)
  }
}
