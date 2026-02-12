import type { ImageConverter, ConverterMetadata, EncodingContext } from './types'

/**
 * WebP Converter - Formato moderno com compressão eficiente, suporte nativo do browser
 */
class WebpConverter implements ImageConverter {
  readonly metadata: ConverterMetadata = {
    label: 'WebP',
    extension: 'webp',
    mimeType: 'image/webp',
    priority: 3,
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

export default new WebpConverter()
