import type { IToolDefinition } from './core/tool.types'
import { toolRegistry } from './core/registry'

/**
 * Auto-discovery de ferramentas usando Vite glob import
 *
 * Cada ferramenta deve exportar um objeto "default" como IToolDefinition
 * de seu arquivo tool.config.ts
 */
const toolModules = import.meta.glob<{ default: IToolDefinition }>(
  './*/tool.config.ts',
  { eager: true }
)

/**
 * Registra automaticamente todas as ferramentas encontradas
 */
export function registerAllTools(): void {
  Object.entries(toolModules).forEach(([path, module]) => {
    try {
      const toolDefinition = module.default

      if (!toolDefinition || !toolDefinition.id) {
        console.error(`Invalid tool definition at ${path}`)
        return
      }

      toolRegistry.register(toolDefinition)
    } catch (error) {
      console.error(`Failed to register tool from ${path}:`, error)
    }
  })

  console.log(`\n🔧 Registered ${toolRegistry.getAll().length} tools\n`)
}

// Export registry para acesso externo
export { toolRegistry }
export * from './core/tool.types'
