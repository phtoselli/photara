export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'

export interface ConvertState {
  outputFormat: ImageFormat
  quality: number
}
