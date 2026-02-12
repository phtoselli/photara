import type { IToolDefinition } from '../core/tool.types'
import type { ExpandState } from './expand.types'
import { applyExpand } from './expand.processor'
import ExpandTool from './ExpandTool.vue'

export default {
  id: 'expand',
  label: 'Expandir',
  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><polyline points="21 15 21 21 15 21"/><polyline points="3 9 3 3 9 3"/></svg>',
  description: 'Adicione bordas coloridas ao redor da imagem',
  order: 3,

  component: ExpandTool,

  initialState: (): ExpandState => ({
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    fillColor: '#000000',
    linkSides: true,
  }),

  processor: applyExpand,

  reset: (currentState): ExpandState => ({
    ...currentState,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    fillColor: '#000000',
    linkSides: true,
  }),

  capabilities: {
    chainable: true,
  },
} satisfies IToolDefinition<ExpandState>
