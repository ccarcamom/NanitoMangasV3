import { describe, it, expect } from 'vitest'
import { detectBubbles } from './bubbles'
import { makePage, paintRect } from './testPage'

describe('detectBubbles', () => {
  it('detecta_un_globo_blanco_con_borde_negro', () => {
    const r = detectBubbles(makePage(200, 300, 60, [[40, 60, 100, 80]]))
    expect(r).toHaveLength(1)
    expect(r[0].x).toBeCloseTo(43 / 200, 2)
    expect(r[0].y).toBeCloseTo(63 / 300, 2)
    expect(r[0].w).toBeCloseTo(94 / 200, 2)
    expect(r[0].h).toBeCloseTo(74 / 300, 2)
  })

  it('ignora_fondo_blanco_de_toda_la_pagina', () => {
    expect(detectBubbles(makePage(200, 300, 255))).toEqual([])
  })

  it('pagina_toda_negra_devuelve_lista_vacia', () => {
    expect(detectBubbles(makePage(200, 300, 0))).toEqual([])
  })

  it('pagina_sin_globos_devuelve_vacia', () => {
    expect(detectBubbles(makePage(200, 300, 128))).toEqual([])
  })

  it('ordena_por_area_descendente', () => {
    const r = detectBubbles(makePage(200, 300, 60, [[10, 10, 40, 40], [60, 100, 100, 90], [20, 230, 70, 50]]))
    expect(r).toHaveLength(3)
    const areas = r.map((b) => b.w * b.h)
    expect(areas).toEqual([...areas].sort((a, b) => b - a))
  })

  it('reduce_paginas_grandes_y_mantiene_coordenadas_normalizadas', () => {
    const r = detectBubbles(makePage(800, 1200, 60, [[160, 240, 400, 320]]))
    expect(r).toHaveLength(1)
    expect(r[0].x).toBeCloseTo(0.2, 1)
    expect(r[0].w).toBeCloseTo(0.5, 1)
  })

  it('descarta_regiones_menores_a_0_5_por_ciento', () => {
    expect(detectBubbles(makePage(200, 300, 60, [[10, 10, 10, 10]]))).toEqual([])
  })

  it('no_detecta_franja_blanca_delgada_rodeada_de_negro', () => {
    expect(detectBubbles(makePage(200, 300, 0, [[90, 90, 10, 126]]))).toEqual([])
  })

  it('no_detecta_rectangulo_sin_pixeles_oscuros_dentro', () => {
    expect(detectBubbles(makePage(200, 300, 60, [[40, 60, 100, 80, { text: false }]]))).toEqual([])
  })

  it('detecta_globo_eliptico_con_texto', () => {
    expect(detectBubbles(makePage(200, 300, 60, [[40, 60, 120, 80, { ellipse: true }]]))).toHaveLength(1)
  })

  it('detecta_globo_con_proporcion_4_a_1_con_texto', () => {
    expect(detectBubbles(makePage(200, 300, 60, [[20, 100, 160, 50]]))).toHaveLength(1)
  })

  it('no_detecta_region_de_relleno_bajo_tipo_anillo', () => {
    expect(detectBubbles(makePage(200, 300, 60, [[20, 60, 160, 160, { hole: true }]]))).toEqual([])
  })

  it('descarta_globo_que_toca_el_borde_de_la_pagina', () => {
    const p = makePage(200, 300, 60)
    paintRect(p, 0, 100, 80, 80, 255)
    paintRect(p, 30, 130, 30, 15, 0)
    paintRect(p, 80, 100, 3, 80, 0)
    expect(detectBubbles(p)).toEqual([])
  })

  it('tope_de_area_rechaza_20_por_ciento_y_acepta_12_por_ciento', () => {
    expect(detectBubbles(makePage(200, 300, 60, [[40, 60, 126, 106]]))).toEqual([])
    expect(detectBubbles(makePage(200, 300, 60, [[40, 60, 96, 86]]))).toHaveLength(1)
  })

  it('rechaza_panel_blanco_grande_con_dibujo_oscuro_dentro', () => {
    const p = makePage(200, 300, 60, [[30, 60, 136, 116]])
    paintRect(p, 60, 90, 60, 60, 0)
    expect(detectBubbles(p)).toEqual([])
  })

  it('imagen_de_tamano_cero_devuelve_vacia', () => {
    expect(detectBubbles({ data: new Uint8ClampedArray(0), width: 0, height: 0 })).toEqual([])
  })
})
