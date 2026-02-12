import type { ExpandState } from './expand.types'

/**
 * Função pura de processamento de expand
 * Input: imagem + estado → Output: canvas processado
 */
export function applyExpand(
  image: HTMLImageElement,
  state: ExpandState
): HTMLCanvasElement {
  const { top, right, bottom, left } = state.padding
  const imgW = image.naturalWidth
  const imgH = image.naturalHeight

  const canvas = document.createElement('canvas')
  canvas.width = imgW + left + right
  canvas.height = imgH + top + bottom

  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = state.fillColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(image, left, top)

  return canvas
}
