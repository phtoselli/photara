import type { IToolDefinition } from '../core/tool.types'
import type { CropState } from './crop.types'
import { applyCrop } from './crop.processor'
import CropTool from './CropTool.vue'

export default {
  id: 'crop',
  label: 'Cortar',
  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>',
  description: 'Selecione a área desejada e corte sua imagem',
  order: 2,

  component: CropTool,

  initialState: (): CropState => ({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  }),

  processor: applyCrop,

  reset: (_currentState, originalImage): CropState => ({
    x: 0,
    y: 0,
    width: originalImage.naturalWidth,
    height: originalImage.naturalHeight,
  }),

  validate: (state): boolean | string => {
    if (state.width < 20 || state.height < 20) {
      return 'Área de corte mínima: 20x20px'
    }
    return true
  },

  capabilities: {
    interactive: true,
    chainable: true,
  },
} satisfies IToolDefinition<CropState>
