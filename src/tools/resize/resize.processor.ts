import type { ResizeState } from './resize.types'

/**
 * Função pura de processamento de resize
 * Input: imagem + estado → Output: canvas processado
 */
export function applyResize(
  image: HTMLImageElement,
  state: ResizeState
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = state.width
  canvas.height = state.height

  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, state.width, state.height)

  return canvas
}
