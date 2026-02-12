/**
 * Sistema Modular de Converters
 * Auto-descobre e registra todos os formatos de imagem disponíveis
 */

import { converterRegistry } from './registry'

export { converterRegistry }
export type { ImageConverter, ConverterMetadata, EncodingContext } from './types'

/**
 * Inicializa o sistema de converters
 * Deve ser chamado no main.ts antes do app iniciar
 */
export function registerAllConverters(): void {
  converterRegistry.initialize()
}
