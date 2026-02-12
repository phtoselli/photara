export type VignetteDirection = 'radial' | 'left' | 'right' | 'top' | 'bottom'

export interface VignetteState {
  direction: VignetteDirection
  color: string
  intensity: number
  spread: number
}
