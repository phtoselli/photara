import type { IToolDefinition } from '../core/tool.types'
import type { ResizeState } from './resize.types'
import { applyResize } from './resize.processor'
import ResizeTool from './ResizeTool.vue'

export default {
  id: 'resize',
  label: 'Redimensionar',
  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
  description: 'Altere as dimensões da imagem mantendo ou não a proporção',
  order: 1,

  component: ResizeTool,

  initialState: (): ResizeState => ({
    width: 0,
    height: 0,
    lockAspectRatio: true,
    aspectRatio: 1,
  }),

  processor: applyResize,

  reset: (currentState, originalImage): ResizeState => ({
    ...currentState,
    width: originalImage.naturalWidth,
    height: originalImage.naturalHeight,
    aspectRatio: originalImage.naturalWidth / originalImage.naturalHeight,
  }),

  validate: (state): boolean | string => {
    if (state.width < 1 || state.height < 1) {
      return 'Dimensões devem ser maiores que 0'
    }
    if (state.width > 10000 || state.height > 10000) {
      return 'Dimensões máximas: 10000px'
    }
    return true
  },

  capabilities: {
    chainable: true,
  },
} satisfies IToolDefinition<ResizeState>
