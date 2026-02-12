import type { ImageConverter, ConverterMetadata, EncodingContext } from './types'

/**
 * AVIF Converter - Formato moderno com excelente compressão, suporte nativo em navegadores modernos
 */
class AvifConverter implements ImageConverter {
  readonly metadata: ConverterMetadata = {
    label: 'AVIF',
    extension: 'avif',
    mimeType: 'image/avif',
    priority: 4,
    capabilities: {
      supportsQuality: true,
      maxDimensions: null,
      isNative: true,
    },
  }

  async encode(context: EncodingContext): Promise<Blob | null> {
    const quality = context.quality / 100 // Canvas API usa 0-1

    return new Promise((resolve) => {
      context.canvas.toBlob(
        (blob) => resolve(blob),
        this.metadata.mimeType,
        quality
      )
    })
  }
}

export default new AvifConverter()
