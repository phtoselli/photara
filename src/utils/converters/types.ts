/**
 * Interface base para conversores de formato de imagem
 * Cada formato implementa esta interface e é auto-descoberto pelo registry
 */
export interface ImageConverter {
  readonly metadata: ConverterMetadata
  encode(context: EncodingContext): Promise<Blob | null>
  validate?(canvas: HTMLCanvasElement): string | null
}

export interface ConverterMetadata {
  label: string // "PNG", "JPEG"
  extension: string // "png", "jpg"
  mimeType: string // "image/png"
  priority: number // Ordem de exibição (menor = primeiro)
  capabilities: {
    supportsQuality: boolean
    maxDimensions?: { width: number; height: number } | null
    isNative: boolean // Se é suportado nativamente pelo browser
  }
}

export interface EncodingContext {
  canvas: HTMLCanvasElement
  quality: number // 0-100
}
