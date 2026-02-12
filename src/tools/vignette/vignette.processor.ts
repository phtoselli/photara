import type { VignetteState } from './vignette.types'

/**
 * Função pura de processamento de vignette
 * Input: imagem + estado → Output: canvas processado
 */
export function applyVignette(
  image: HTMLImageElement,
  state: VignetteState
): HTMLCanvasElement {
  const imgW = image.naturalWidth
  const imgH = image.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = imgW
  canvas.height = imgH
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0)

  const { direction, color, intensity, spread } = state
  const alpha = Math.min(intensity / 100, 1)
  const passes = intensity > 100 ? Math.ceil(intensity / 100) : 1
  const lastPassAlpha = intensity > 100 ? (intensity % 100) / 100 || 1 : alpha

  const r = parseInt(color.slice(1, 3), 16)
  const g = parseInt(color.slice(3, 5), 16)
  const b = parseInt(color.slice(5, 7), 16)

  for (let pass = 0; pass < passes; pass++) {
    const passAlpha = pass === passes - 1 ? lastPassAlpha : 1
    let gradient: CanvasGradient

    if (direction === 'radial') {
      const cx = imgW / 2
      const cy = imgH / 2
      const maxDim = Math.max(imgW, imgH)
      const r1 = Math.max(imgW, imgH) * (spread / 200)
      const r2 = maxDim * 1.5
      gradient = ctx.createRadialGradient(cx, cy, r1, cx, cy, r2)
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`)
      gradient.addColorStop(1, `rgba(${r},${g},${b},${passAlpha})`)
    } else if (direction === 'left') {
      const x1 = imgW * (spread / 200)
      const x2 = imgW
      gradient = ctx.createLinearGradient(x1, 0, x2, 0)
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`)
      gradient.addColorStop(1, `rgba(${r},${g},${b},${passAlpha})`)
    } else if (direction === 'right') {
      const x1 = imgW - imgW * (spread / 200)
      const x2 = 0
      gradient = ctx.createLinearGradient(x1, 0, x2, 0)
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`)
      gradient.addColorStop(1, `rgba(${r},${g},${b},${passAlpha})`)
    } else if (direction === 'top') {
      const y1 = imgH * (spread / 200)
      const y2 = imgH
      gradient = ctx.createLinearGradient(0, y1, 0, y2)
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`)
      gradient.addColorStop(1, `rgba(${r},${g},${b},${passAlpha})`)
    } else {
      const y1 = imgH - imgH * (spread / 200)
      const y2 = 0
      gradient = ctx.createLinearGradient(0, y1, 0, y2)
      gradient.addColorStop(0, `rgba(${r},${g},${b},0)`)
      gradient.addColorStop(1, `rgba(${r},${g},${b},${passAlpha})`)
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, imgW, imgH)
  }

  return canvas
}
