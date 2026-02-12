/**
 * Helper functions for custom image format encoders
 * Used by converters that don't have native browser support
 */

/**
 * Encodes a canvas to BMP format
 * BMP is not natively supported by canvas.toBlob()
 */
export function encodeBMP(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d')!
  const { width, height } = canvas
  const imageData = ctx.getImageData(0, 0, width, height)
  const { data } = imageData

  // BMP uses rows padded to 4-byte boundaries (24-bit = 3 bytes per pixel)
  const rowSize = Math.ceil((width * 3) / 4) * 4
  const pixelArraySize = rowSize * height
  const fileSize = 54 + pixelArraySize

  const buffer = new ArrayBuffer(fileSize)
  const view = new DataView(buffer)

  // File header (14 bytes)
  view.setUint8(0, 0x42) // 'B'
  view.setUint8(1, 0x4d) // 'M'
  view.setUint32(2, fileSize, true)
  view.setUint32(6, 0, true)
  view.setUint32(10, 54, true)

  // DIB header (40 bytes - BITMAPINFOHEADER)
  view.setUint32(14, 40, true)
  view.setInt32(18, width, true)
  view.setInt32(22, height, true)
  view.setUint16(26, 1, true) // color planes
  view.setUint16(28, 24, true) // bits per pixel
  view.setUint32(30, 0, true) // no compression
  view.setUint32(34, pixelArraySize, true)
  view.setUint32(38, 2835, true) // ~72 DPI horizontal
  view.setUint32(42, 2835, true) // ~72 DPI vertical
  view.setUint32(46, 0, true)
  view.setUint32(50, 0, true)

  // Pixel data (bottom-to-top, BGR order)
  const pixels = new Uint8Array(buffer, 54)
  for (let y = 0; y < height; y++) {
    const srcRow = height - 1 - y // BMP is bottom-up
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcRow * width + x) * 4
      const dstIdx = y * rowSize + x * 3
      pixels[dstIdx] = data[srcIdx + 2]!     // B
      pixels[dstIdx + 1] = data[srcIdx + 1]! // G
      pixels[dstIdx + 2] = data[srcIdx]!     // R
    }
    // Row padding bytes are already 0 from ArrayBuffer initialization
  }

  return new Blob([buffer], { type: 'image/bmp' })
}

/**
 * Encodes a canvas to ICO format
 * ICO supports embedded PNG data (modern format)
 */
export function encodeICO(canvas: HTMLCanvasElement): Promise<Blob> {
  // ICO supports embedded PNG data (modern format)
  // Max ICO dimension is 256x256, resize if needed
  let source = canvas
  if (canvas.width > 256 || canvas.height > 256) {
    const scale = Math.min(256 / canvas.width, 256 / canvas.height)
    const w = Math.round(canvas.width * scale)
    const h = Math.round(canvas.height * scale)
    source = document.createElement('canvas')
    source.width = w
    source.height = h
    const ctx = source.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(canvas, 0, 0, w, h)
  }

  return new Promise((resolve) => {
    source.toBlob((pngBlob) => {
      if (!pngBlob) {
        resolve(new Blob([], { type: 'image/x-icon' }))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const pngData = new Uint8Array(reader.result as ArrayBuffer)
        const w = source.width >= 256 ? 0 : source.width
        const h = source.height >= 256 ? 0 : source.height

        // ICO: 6-byte header + 16-byte directory entry + PNG data
        const icoSize = 22 + pngData.length
        const buffer = new ArrayBuffer(icoSize)
        const view = new DataView(buffer)

        // ICONDIR header
        view.setUint16(0, 0, true)           // reserved
        view.setUint16(2, 1, true)           // type: ICO
        view.setUint16(4, 1, true)           // 1 image

        // ICONDIRENTRY
        view.setUint8(6, w)                  // width (0 = 256)
        view.setUint8(7, h)                  // height (0 = 256)
        view.setUint8(8, 0)                  // palette size
        view.setUint8(9, 0)                  // reserved
        view.setUint16(10, 1, true)          // color planes
        view.setUint16(12, 32, true)         // bits per pixel
        view.setUint32(14, pngData.length, true) // image size
        view.setUint32(18, 22, true)         // data offset

        // PNG data
        const arr = new Uint8Array(buffer)
        arr.set(pngData, 22)

        resolve(new Blob([buffer], { type: 'image/x-icon' }))
      }
      reader.readAsArrayBuffer(pngBlob)
    }, 'image/png')
  })
}
