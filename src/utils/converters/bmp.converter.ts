import type { ImageConverter, ConverterMetadata, EncodingContext } from './types'
import { encodeBMP } from './base/helpers'

/**
 * BMP Converter - Formato legado sem compressão, encoder customizado
 */
class BmpConverter implements ImageConverter {
  readonly metadata: ConverterMetadata = {
    label: 'BMP',
    extension: 'bmp',
    mimeType: 'image/bmp',
    priority: 5,
    capabilities: {
      supportsQuality: false, // BMP não suporta compressão
      maxDimensions: null,
      isNative: false, // Encoder customizado
    },
  }

  async encode(context: EncodingContext): Promise<Blob | null> {
    try {
      return encodeBMP(context.canvas)
    } catch (error) {
      console.error('BMP encoding failed:', error)
      return null
    }
  }
}

export default new BmpConverter()
