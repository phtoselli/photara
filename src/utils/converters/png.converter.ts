import type { ImageConverter, ConverterMetadata, EncodingContext } from './types'

/**
 * PNG Converter - Formato sem perda, suporte nativo do browser
 */
class PngConverter implements ImageConverter {
  readonly metadata: ConverterMetadata = {
    label: 'PNG',
    extension: 'png',
    mimeType: 'image/png',
    priority: 1,
    capabilities: {
      supportsQuality: false, // PNG não usa qualidade
      maxDimensions: null,
      isNative: true,
    },
  }

  async encode(context: EncodingContext): Promise<Blob | null> {
    return new Promise((resolve) => {
      context.canvas.toBlob((blob) => resolve(blob), this.metadata.mimeType)
    })
  }
}

export default new PngConverter()
