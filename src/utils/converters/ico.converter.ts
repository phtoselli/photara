import type { ImageConverter, ConverterMetadata, EncodingContext } from './types'
import { encodeICO } from './base/helpers'

/**
 * ICO Converter - Formato de ícone, encoder customizado
 * Limita dimensões a 256x256 e embute PNG
 */
class IcoConverter implements ImageConverter {
  readonly metadata: ConverterMetadata = {
    label: 'ICO',
    extension: 'ico',
    mimeType: 'image/x-icon',
    priority: 6,
    capabilities: {
      supportsQuality: false,
      maxDimensions: { width: 256, height: 256 },
      isNative: false, // Encoder customizado
    },
  }

  async encode(context: EncodingContext): Promise<Blob | null> {
    try {
      return await encodeICO(context.canvas)
    } catch (error) {
      console.error('ICO encoding failed:', error)
      return null
    }
  }

  validate(canvas: HTMLCanvasElement): string | null {
    if (canvas.width > 256 || canvas.height > 256) {
      return 'ICO será redimensionado para 256x256 (máximo suportado)'
    }
    return null
  }
}

export default new IcoConverter()
