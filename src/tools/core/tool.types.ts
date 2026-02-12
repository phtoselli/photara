import type { Component, Ref } from 'vue'
import type { Dimensions } from '../../types'

/**
 * Interface que define o contrato de uma ferramenta
 */
export interface IToolDefinition<TState = any> {
  /** Identificador único da ferramenta */
  id: string

  /** Nome legível para UI */
  label: string

  /** Ícone SVG inline */
  icon: string

  /** Descrição curta para tooltips */
  description?: string

  /** Ordem de exibição (menor = primeiro) */
  order?: number

  /** Componente Vue do painel de controles */
  component: Component

  /** Estado inicial da ferramenta */
  initialState: () => TState

  /** Função de processamento que recebe imagem e estado */
  processor: (image: HTMLImageElement, state: TState) => HTMLCanvasElement

  /** Função de reset que retorna ao estado inicial */
  reset?: (currentState: TState, originalImage: HTMLImageElement) => TState

  /** Validação de estado (opcional) */
  validate?: (state: TState) => boolean | string

  /** Capacidades especiais da ferramenta */
  capabilities?: {
    /** Suporta interação com canvas preview */
    interactive?: boolean
    /** Requer processamento assíncrono */
    async?: boolean
    /** Pode ser aplicada em cadeia com outras */
    chainable?: boolean
  }
}

/**
 * Props padrão que todo componente de tool deve aceitar
 */
export interface IToolPanelProps<TState = any> {
  state: TState
  originalImage: HTMLImageElement
  originalDimensions: Dimensions
}

/**
 * Events padrão que todo componente de tool deve emitir
 */
export interface IToolPanelEmits<TState = any> {
  'update:state': [state: TState]
  'reset': []
}

/**
 * Contexto compartilhado disponível para todas as ferramentas
 */
export interface IToolContext {
  originalImage: Ref<HTMLImageElement | null>
  originalDimensions: Ref<Dimensions>
  fileName: Ref<string>
  fileSize: Ref<number>
}
