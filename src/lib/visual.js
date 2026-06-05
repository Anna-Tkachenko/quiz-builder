// A "visual" value can be an emoji OR an image (URL / data URI / local path).
export const isImageValue = (v) =>
  typeof v === 'string' && /^(https?:\/\/|data:image\/|\.?\/)/.test(v.trim())

// Read a picked image file, downscale client-side (≤512px) and return a
// data URI via callback — stored inside the quiz JSON, no upload server.
export function readImageFile(file, onDone) {
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      const MAX = 512
      const scale = Math.min(1, MAX / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      onDone(canvas.toDataURL(type, 0.85))
    }
    img.src = reader.result
  }
  reader.readAsDataURL(file)
}
