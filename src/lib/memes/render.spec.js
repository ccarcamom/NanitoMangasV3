import { describe, it, expect, vi } from 'vitest'
import { drawMeme } from './render'

describe('drawMeme', () => {
  it('drawMeme_llama_fillText_con_el_color_y_la_fuente', () => {
    const ctx = {
      drawImage: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(), save: vi.fn(), restore: vi.fn(),
      measureText: vi.fn((t) => ({ width: t.length * 10 })),
      font: '', fillStyle: '', textAlign: '', textBaseline: '',
    }
    const fonts = []
    const colors = []
    ctx.fillText.mockImplementation(() => { fonts.push(ctx.font); colors.push(ctx.fillStyle) })
    const image = { width: 200, height: 300 }
    drawMeme(ctx, image, [{
      x: 0.1, y: 0.1, w: 0.5, h: 0.3, background: '#ffffff',
      text: 'hola mundo cruel', fontFamily: 'Bangers', fontSize: 20, color: '#ff0000',
    }])
    expect(ctx.drawImage).toHaveBeenCalledWith(image, 0, 0, 200, 300)
    expect(ctx.fillRect).toHaveBeenCalledWith(20, 30, 100, 90)
    expect(ctx.fillText).toHaveBeenCalled()
    expect(fonts[0]).toContain('Bangers')
    expect(fonts[0]).toContain('20px')
    expect(colors[0]).toBe('#ff0000')
    // ancho 100 y 10 px por letra: "hola mundo cruel" no cabe en una línea
    expect(ctx.fillText.mock.calls.length).toBeGreaterThan(1)
  })

  it('no_escribe_si_el_recuadro_no_tiene_texto', () => {
    const ctx = { drawImage: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(), save: vi.fn(), restore: vi.fn(), measureText: vi.fn(() => ({ width: 1 })) }
    drawMeme(ctx, { width: 10, height: 10 }, [{ x: 0, y: 0, w: 1, h: 1, background: '#fff' }])
    expect(ctx.fillText).not.toHaveBeenCalled()
  })

  const mk = () => ({
    drawImage: vi.fn(), fillRect: vi.fn(), fillText: vi.fn(), save: vi.fn(), restore: vi.fn(),
    measureText: vi.fn((t) => ({ width: t.length * 10 })),
  })
  const bub = (text) => ({ x: 0, y: 0, w: 1, h: 1, background: '#fff', text, fontSize: 10 })

  it('usa_save_y_restore', () => {
    const ctx = mk()
    drawMeme(ctx, { width: 100, height: 100 }, [bub('hola')])
    expect(ctx.save).toHaveBeenCalledTimes(1)
    expect(ctx.restore).toHaveBeenCalledTimes(1)
  })

  it('parte_palabras_mas_anchas_que_el_recuadro', () => {
    const ctx = mk()
    drawMeme(ctx, { width: 100, height: 100 }, [bub('x'.repeat(30))])
    const lines = ctx.fillText.mock.calls.map((c) => c[0])
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.every((l) => l.length * 10 <= 92)).toBe(true)
    expect(lines.join('')).toBe('x'.repeat(30))
  })

  it('no_llama_fillText_con_parrafos_vacios', () => {
    const ctx = mk()
    drawMeme(ctx, { width: 100, height: 100 }, [bub('uno\n\ndos')])
    expect(ctx.fillText.mock.calls.map((c) => c[0])).toEqual(['uno', 'dos'])
  })
})
