import type { CropState } from './crop.types'

/**
 * Função pura de processamento de crop
 * Input: imagem + estado → Output: canvas processado
 */
export function applyCrop(
  image: HTMLImageElement,
  state: CropState
): HTMLCanvasElement {
  const { x, y, width, height } = state

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height)

  return canvas
}
