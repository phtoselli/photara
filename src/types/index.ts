export type Tool = 'resize' | 'crop' | 'expand' | 'vignette' | 'convert'

export type VignetteDirection = 'radial' | 'left' | 'right' | 'top' | 'bottom'

export interface VignetteSettings {
  direction: VignetteDirection
  color: string
  intensity: number
  spread: number
}

export interface ExpandPadding {
  top: number
  right: number
  bottom: number
  left: number
}

export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export interface Dimensions {
  width: number
  height: number
}

export interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export interface FormatOption {
  label: string
  value: ImageFormat
  extension: string
}

export type DownloadFormat =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/avif'
  | 'image/bmp'
  | 'image/x-icon'

export interface DownloadFormatOption {
  label: string
  value: DownloadFormat
  extension: string
}
