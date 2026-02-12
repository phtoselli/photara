import { markRaw } from 'vue'
import type { IToolDefinition } from './tool.types'

/**
 * Registry pattern - mantém catálogo de todas as ferramentas disponíveis
 */
class ToolRegistry {
  private tools: Map<string, IToolDefinition> = new Map()

  /**
   * Registra uma ferramenta no sistema
   */
  register(definition: IToolDefinition): void {
    if (this.tools.has(definition.id)) {
      console.warn(`Tool ${definition.id} already registered. Skipping.`)
      return
    }

    // markRaw para evitar reatividade desnecessária em componentes
    this.tools.set(definition.id, {
      ...definition,
      component: markRaw(definition.component),
    })

    console.log(`✓ Tool registered: ${definition.id}`)
  }

  /**
   * Remove uma ferramenta (útil para HMR)
   */
  unregister(id: string): void {
    this.tools.delete(id)
  }

  /**
   * Retorna ferramenta por ID
   */
  get(id: string): IToolDefinition | undefined {
    return this.tools.get(id)
  }

  /**
   * Lista todas as ferramentas ordenadas
   */
  getAll(): IToolDefinition[] {
    return Array.from(this.tools.values())
      .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
  }

  /**
   * Verifica se uma ferramenta existe
   */
  has(id: string): boolean {
    return this.tools.has(id)
  }

  /**
   * Limpa todas as ferramentas (útil para testes)
   */
  clear(): void {
    this.tools.clear()
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry()
