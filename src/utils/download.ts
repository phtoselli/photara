import type { DownloadFormat } from '../types'
import { converterRegistry } from './converters'

/**
 * Cria um Blob usando o converter registry
 * Sistema modular que auto-descobre formatos disponíveis
 */
export async function createBlob(
  canvas: HTMLCanvasElement,
  format: DownloadFormat,
  quality: number,
): Promise<Blob | null> {
  const converter = converterRegistry.get(format)

  if (!converter) {
    console.error(`Formato não suportado: ${format}`)
    return null
  }

  try {
    return await converter.encode({ canvas, quality })
  } catch (error) {
    console.error(`Erro ao converter para ${format}:`, error)
    return null
  }
}

/**
 * Faz download do blob com nome apropriado
 */
export function triggerDownload(blob: Blob, baseName: string, format: DownloadFormat) {
  const converter = converterRegistry.get(format)
  const ext = converter?.metadata.extension ?? 'png'

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}-edited.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Converte extensão de arquivo para MIME type
 * Usa o registry para descobrir formatos disponíveis
 */
export function extensionToDownloadFormat(ext: string | undefined): DownloadFormat {
  if (!ext) return 'image/png'

  const normalized = ext.toLowerCase()
  const allConverters = converterRegistry.getAll()

  // Busca por extensão exata
  const byExt = allConverters.find(c => c.metadata.extension === normalized)
  if (byExt) return byExt.metadata.mimeType

  // Casos especiais (jpg -> jpeg)
  if (normalized === 'jpg' || normalized === 'jpeg') {
    const jpeg = allConverters.find(c => c.metadata.mimeType === 'image/jpeg')
    if (jpeg) return jpeg.metadata.mimeType
  }

  if (normalized === 'ico') {
    const ico = allConverters.find(c => c.metadata.mimeType === 'image/x-icon')
    if (ico) return ico.metadata.mimeType
  }

  // Default: PNG
  return 'image/png'
}
