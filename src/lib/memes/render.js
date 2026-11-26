// Pinta la página y, en cada recuadro, el fondo y el texto ajustado al ancho.
export function drawMeme(ctx, image, bubbles = []) {
  const W = image.naturalWidth || image.width
  const H = image.naturalHeight || image.height
  ctx.drawImage(image, 0, 0, W, H)
  ctx.save()
  for (const b of bubbles) {
    const x = b.x * W, y = b.y * H, w = b.w * W, h = b.h * H
    ctx.fillStyle = b.background || '#ffffff'
    ctx.fillRect(x, y, w, h)
    if (!b.text) continue
    const size = b.fontSize || 16
    ctx.font = `${size}px ${b.fontFamily || 'sans-serif'}`
    ctx.fillStyle = b.color || '#000000'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    const lines = wrap(ctx, b.text, w * 0.92)
    const lh = size * 1.15
    let ty = y + Math.max(0, (h - lines.length * lh) / 2)
    for (const line of lines) {
      ctx.fillText(line, x + w / 2, ty)
      ty += lh
    }
  }
  ctx.restore()
}

function wrap(ctx, text, maxW) {
  const lines = []
  for (const para of String(text).split('\n')) {
    let cur = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = cur ? `${cur} ${word}` : word
      if (!cur || ctx.measureText(next).width <= maxW) { cur = next; if (ctx.measureText(cur).width <= maxW) continue }
      else { lines.push(cur); cur = word; if (ctx.measureText(cur).width <= maxW) continue }
      // palabra más ancha que el recuadro: se parte por caracteres
      let piece = ''
      for (const ch of cur) {
        if (piece && ctx.measureText(piece + ch).width > maxW) { lines.push(piece); piece = '' }
        piece += ch
      }
      cur = piece
    }
    if (cur) lines.push(cur)
  }
  return lines
}
