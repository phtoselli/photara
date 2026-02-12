export type Tool = string

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

export type DownloadFormat = string

export interface DownloadFormatOption {
  label: string
  value: DownloadFormat
  extension: string
}
