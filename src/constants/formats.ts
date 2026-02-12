/**
 * Sistema modular de formatos
 * As opções são geradas dinamicamente do converter registry
 */
import { converterRegistry } from '../utils/converters'
import type { FormatOption, DownloadFormatOption } from '../types'

/**
 * Retorna opções de formato para a ferramenta Convert
 * Filtra apenas os formatos principais (PNG, JPEG, WebP)
 */
export function getFormatOptions(): FormatOption[] {
  return converterRegistry
    .getAll()
    .filter(c => ['image/png', 'image/jpeg', 'image/webp'].includes(c.metadata.mimeType))
    .map(c => ({
      label: c.metadata.label,
      value: c.metadata.mimeType as any,
      extension: c.metadata.extension,
    }))
}

/**
 * Retorna todas as opções de formato para download
 * Inclui todos os formatos disponíveis no registry
 */
export function getDownloadFormatOptions(): DownloadFormatOption[] {
  return converterRegistry.getAll().map(c => ({
    label: c.metadata.label,
    value: c.metadata.mimeType as any,
    extension: c.metadata.extension,
  }))
}

