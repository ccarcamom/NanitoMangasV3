// Misma origen (proxy /mdx): el lienzo no se contamina y getImageData funciona.
export const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = () => reject(new Error('IMAGE_LOAD'))
  img.src = url
})

export const toImageData = (img) => {
  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth || img.width
  canvas.height = img.naturalHeight || img.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0)
  return ctx.getImageData(0, 0, canvas.width, canvas.height)
}
