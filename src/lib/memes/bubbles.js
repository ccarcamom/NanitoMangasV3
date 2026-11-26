const MAX_W = 400
const WHITE = 235
const DARK = 140
const MIN_AREA = 0.005
const MAX_AREA = 0.15 // más que eso suele ser un panel de viñeta, no un globo
const MIN_FILL = 0.45 // área del componente / área de su caja: descarta franjas, marcos y anillos
const MIN_BOX_W = 0.05
const MIN_BOX_H = 0.035
const MIN_RATIO = 0.15 // ancho / alto
const MAX_RATIO = 6.5
const TEXT_LUMA = 128
const MIN_TEXT = 0.008 // fracción de la caja con píxeles oscuros (el texto del globo)

// Zonas casi blancas conectadas, rodeadas de oscuro, sin tocar el borde de la página.
export function detectBubbles(imageData) {
  const { data, width: sw, height: sh } = imageData
  if (!sw || !sh) return []
  const scale = Math.min(1, MAX_W / sw)
  const w = Math.max(1, Math.round(sw * scale))
  const h = Math.max(1, Math.round(sh * scale))
  const luma = new Uint8Array(w * h)
  for (let y = 0; y < h; y++) {
    const sy = Math.min(sh - 1, Math.floor(y / scale))
    for (let x = 0; x < w; x++) {
      const i = (sy * sw + Math.min(sw - 1, Math.floor(x / scale))) * 4
      luma[y * w + x] = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000
    }
  }

  const seen = new Uint8Array(w * h)
  const stack = new Int32Array(w * h)
  const out = []
  let edge = false, walls = 0, dark = 0
  let sp = 0
  function visit(n) {
    if (luma[n] >= WHITE) {
      if (!seen[n]) { seen[n] = 1; stack[sp++] = n }
    } else {
      walls++
      if (luma[n] < DARK) dark++
    }
  }
  for (let start = 0; start < w * h; start++) {
    if (seen[start] || luma[start] < WHITE) continue
    sp = 0
    stack[sp++] = start
    seen[start] = 1
    let area = 0, minX = w, minY = h, maxX = 0, maxY = 0
    edge = false; walls = 0; dark = 0
    while (sp) {
      const p = stack[--sp]
      const x = p % w, y = (p - x) / w
      area++
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
      if (x > 0) visit(p - 1); else edge = true
      if (x < w - 1) visit(p + 1); else edge = true
      if (y > 0) visit(p - w); else edge = true
      if (y < h - 1) visit(p + w); else edge = true
    }
    const frac = area / (w * h)
    if (edge || frac < MIN_AREA || frac > MAX_AREA || dark < walls * 0.6) continue
    const bw = maxX - minX + 1, bh = maxY - minY + 1
    const ratio = bw / bh
    if (area / (bw * bh) < MIN_FILL || bw / w < MIN_BOX_W || bh / h < MIN_BOX_H || ratio < MIN_RATIO || ratio > MAX_RATIO) continue
    let text = 0
    for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) if (luma[y * w + x] < TEXT_LUMA) text++
    if (text < bw * bh * MIN_TEXT) continue
    out.push({ x: minX / w, y: minY / h, w: bw / w, h: bh / h })
  }
  return out.sort((a, b) => b.w * b.h - a.w * a.h)
}
