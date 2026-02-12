import type { IToolDefinition } from '../core/tool.types'
import type { VignetteState } from './vignette.types'
import { applyVignette } from './vignette.processor'
import VignetteTool from './VignetteTool.vue'

export default {
  id: 'vignette',
  label: 'Vinheta',
  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6" opacity="0.5"/><circle cx="12" cy="12" r="2" opacity="0.3"/></svg>',
  description: 'Aplique efeito de vinheta para destacar o centro da imagem',
  order: 4,

  component: VignetteTool,

  initialState: (): VignetteState => ({
    direction: 'radial',
    color: '#000000',
    intensity: 70,
    spread: 50,
  }),

  processor: applyVignette,

  reset: (currentState): VignetteState => ({
    ...currentState,
    direction: 'radial',
    color: '#000000',
    intensity: 70,
    spread: 50,
  }),

  capabilities: {
    chainable: true,
  },
} satisfies IToolDefinition<VignetteState>
