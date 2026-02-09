import type { FormatOption, DownloadFormatOption } from '../types'

export const FORMAT_OPTIONS: FormatOption[] = [
  { label: 'PNG', value: 'image/png', extension: 'png' },
  { label: 'JPEG', value: 'image/jpeg', extension: 'jpg' },
  { label: 'WebP', value: 'image/webp', extension: 'webp' },
]

export const DOWNLOAD_FORMAT_OPTIONS: DownloadFormatOption[] = [
  { label: 'PNG', value: 'image/png', extension: 'png' },
  { label: 'JPG', value: 'image/jpeg', extension: 'jpg' },
  { label: 'WebP', value: 'image/webp', extension: 'webp' },
  { label: 'AVIF', value: 'image/avif', extension: 'avif' },
  { label: 'BMP', value: 'image/bmp', extension: 'bmp' },
  { label: 'ICO', value: 'image/x-icon', extension: 'ico' },
]
