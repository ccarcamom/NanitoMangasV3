export function paintRect(page, x0, y0, rw, rh, v) {
  const { data, width: w } = page
  for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) {
    const i = (y * w + x) * 4
    data[i] = data[i + 1] = data[i + 2] = v
    data[i + 3] = 255
  }
}

const inEllipse = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1

// rects: [x, y, ancho, alto, opts]; borde negro de 3 px y relleno blanco.
// opts: text (por defecto true, bloque oscuro central), ellipse, hole (anillo con centro negro)
export function makePage(w, h, fill, rects = []) {
  const page = { data: new Uint8ClampedArray(w * h * 4), width: w, height: h }
  paintRect(page, 0, 0, w, h, fill)
  for (const [x, y, rw, rh, opts = {}] of rects) {
    const { text = true, ellipse = false, hole = false } = opts
    const ix = x + 3, iy = y + 3, iw = rw - 6, ih = rh - 6
    if (ellipse) {
      for (let py = y; py < y + rh; py++) for (let px = x; px < x + rw; px++) {
        const outer = inEllipse(px + 0.5, py + 0.5, x + rw / 2, y + rh / 2, rw / 2, rh / 2)
        const inner = inEllipse(px + 0.5, py + 0.5, x + rw / 2, y + rh / 2, rw / 2 - 3, rh / 2 - 3)
        if (outer) paintRect(page, px, py, 1, 1, inner ? 255 : 0)
      }
    } else {
      paintRect(page, x, y, rw, rh, 0)
      paintRect(page, ix, iy, iw, ih, 255)
    }
    const cw = Math.round(iw * 0.5), ch = Math.max(2, Math.round(ih * 0.2))
    if (hole) paintRect(page, ix + Math.round(iw * 0.1), iy + Math.round(ih * 0.1), Math.round(iw * 0.8), Math.round(ih * 0.8), 0)
    else if (text) paintRect(page, ix + Math.round((iw - cw) / 2), iy + Math.round((ih - ch) / 2), cw, ch, 0)
  }
  return page
}
