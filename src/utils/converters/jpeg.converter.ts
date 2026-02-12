import type { ImageConverter, ConverterMetadata, EncodingContext } from './types'

/**
 * JPEG Converter - Formato com compressão com perda, suporte nativo do browser
 */
class JpegConverter implements ImageConverter {
  readonly metadata: ConverterMetadata = {
    label: 'JPEG',
    extension: 'jpg',
    mimeType: 'image/jpeg',
    priority: 2,
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

export default new JpegConverter()
