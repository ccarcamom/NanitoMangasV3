import { regions } from './regions.js'

describe('regions', () => {
  it('trae las 16 regiones con 3 a 6 comunas', () => {
    expect(regions.length).toBe(16)
    regions.forEach((r) => {
      expect(r.comunas.length).toBeGreaterThanOrEqual(3)
      expect(r.comunas.length).toBeLessThanOrEqual(6)
    })
  })
})
