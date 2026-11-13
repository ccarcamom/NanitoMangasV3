import { regions } from './regions.js'

describe('regions', () => {
  it('trae las 16 regiones y las 346 comunas de Chile', () => {
    expect(regions.length).toBe(16)
    expect(regions.flatMap((r) => r.comunas).length).toBe(346)
  })

  it('no repite comunas dentro de una región', () => {
    regions.forEach((r) => expect(new Set(r.comunas).size).toBe(r.comunas.length))
  })
})
