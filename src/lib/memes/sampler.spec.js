import { describe, it, expect, vi } from 'vitest'
import { pickRandomPage } from './sampler'
import { makePage } from './testPage'

const good = makePage(200, 300, 60, [[40, 60, 100, 80]])
const bad = makePage(200, 300, 0)
const cand = (n) => ({ productId: 'p' + n, language: 'es', pageIndex: n, url: 'u' + n })

describe('pickRandomPage', () => {
  it('pickRandomPage_descarta_paginas_sin_recuadros', async () => {
    const loadImage = vi.fn(async (url) => (url === 'u1' ? good : bad))
    const r = await pickRandomPage([cand(0), cand(1), cand(2)], loadImage, () => 0)
    expect(r.productId).toBe('p1')
    expect(r.url).toBe('u1')
    expect(r.bubbles.length).toBeGreaterThan(0)
  })

  it('pickRandomPage_devuelve_null_si_ninguna_califica', async () => {
    const loadImage = vi.fn(async () => bad)
    const r = await pickRandomPage([cand(0), cand(1)], loadImage, Math.random)
    expect(r).toBeNull()
    expect(loadImage.mock.calls.length).toBeLessThanOrEqual(6)
  })

  it('devuelve_null_sin_candidatas_y_tolera_fallos_de_carga', async () => {
    expect(await pickRandomPage([], vi.fn())).toBeNull()
    const loadImage = vi.fn(async () => { throw new Error('404') })
    expect(await pickRandomPage([cand(0)], loadImage)).toBeNull()
  })
})
