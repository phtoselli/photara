import type { IToolDefinition } from '../core/tool.types'
import type { ConvertState } from './convert.types'
import { applyConvert } from './convert.processor'
import ConvertTool from './ConvertTool.vue'

export default {
  id: 'convert',
  label: 'Converter',
  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>',
  description: 'Converta entre formatos PNG, JPEG e WebP com controle de qualidade',
  order: 5,

  component: ConvertTool,

  initialState: (): ConvertState => ({
    outputFormat: 'image/png',
    quality: 92,
  }),

  processor: applyConvert,

  reset: (currentState): ConvertState => ({
    ...currentState,
    outputFormat: 'image/png',
    quality: 92,
  }),

  capabilities: {
    chainable: false, // Convert não faz sentido em pipeline
  },
} satisfies IToolDefinition<ConvertState>
