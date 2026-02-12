import type { ConvertState } from './convert.types'

/**
 * Função de processamento de convert
 * Convert não altera a imagem, apenas define formato/qualidade para export
 * Retorna a imagem original sem modificações
 */
export function applyConvert(
  image: HTMLImageElement,
  _state: ConvertState
): HTMLCanvasElement {
  // Convert não processa a imagem, apenas define metadados de export
  // Retorna original sem modificações
  const canvas = document.createElement('canvas')
  canvas.width = image.naturalWidth
  canvas.height = image.naturalHeight

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, 0, 0)

  return canvas
}
