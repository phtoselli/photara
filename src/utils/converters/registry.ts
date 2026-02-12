import type { ImageConverter } from './types'

/**
 * Singleton registry para gerenciar conversores de formato
 * Auto-descobre todos os arquivos *.converter.ts
 */
class ConverterRegistry {
  private converters = new Map<string, ImageConverter>()
  private initialized = false

  register(converter: ImageConverter): void {
    this.converters.set(converter.metadata.mimeType, converter)
  }

  get(mimeType: string): ImageConverter | undefined {
    return this.converters.get(mimeType)
  }

  getAll(): ImageConverter[] {
    return Array.from(this.converters.values()).sort(
      (a, b) => a.metadata.priority - b.metadata.priority
    )
  }

  getFormatOptions(): Array<{
    label: string
    value: string
    extension: string
  }> {
    return this.getAll().map(converter => ({
      label: converter.metadata.label,
      value: converter.metadata.mimeType,
      extension: converter.metadata.extension,
    }))
  }

  supports(mimeType: string): boolean {
    return this.converters.has(mimeType)
  }

  /**
   * Inicializa o registry com auto-discovery (síncrono — glob usa eager: true)
   */
  initialize(): void {
    if (this.initialized) return

    const modules = import.meta.glob<{ default: ImageConverter }>(
      './*.converter.ts',
      { eager: true }
    )

    for (const [_path, module] of Object.entries(modules)) {
      this.register(module.default)
    }

    this.initialized = true
  }
}

export const converterRegistry = new ConverterRegistry()
