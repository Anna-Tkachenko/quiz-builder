// A "visual" value can be an emoji OR an image (URL / data URI / local path).
export const isImageValue = (v) =>
  typeof v === 'string' && /^(https?:\/\/|data:image\/|\.?\/)/.test(v.trim())
