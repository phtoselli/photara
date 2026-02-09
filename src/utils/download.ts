import type { DownloadFormat } from '../types'
import { DOWNLOAD_FORMAT_OPTIONS } from '../constants/formats'
import { canvasToBMP, canvasToICO } from './encoders'

export async function createBlob(
  canvas: HTMLCanvasElement,
  format: DownloadFormat,
  quality: number,
): Promise<Blob | null> {
  if (format === 'image/bmp') {
    return canvasToBMP(canvas)
  }

  if (format === 'image/x-icon') {
    return canvasToICO(canvas)
  }

  // Native canvas formats: png, jpeg, webp, avif
  return new Promise<Blob | null>((resolve) => {
    const q = format === 'image/png' ? undefined : quality / 100
    canvas.toBlob((blob) => resolve(blob), format, q)
  })
}

export function triggerDownload(blob: Blob, baseName: string, format: DownloadFormat) {
  const ext = DOWNLOAD_FORMAT_OPTIONS.find(f => f.value === format)?.extension ?? 'png'
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}-edited.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function extensionToDownloadFormat(ext: string | undefined): DownloadFormat {
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'avif') return 'image/avif'
  if (ext === 'bmp') return 'image/bmp'
  if (ext === 'ico') return 'image/x-icon'
  return 'image/png'
}
