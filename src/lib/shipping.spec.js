import { SHIPPING, calcShipping } from './shipping.js'

describe('calcShipping', () => {
  it('constantes', () => { expect(SHIPPING).toEqual({ flat: 3990, freeFrom: 40000 }) })
  it('despacho bajo el umbral cobra tarifa plana', () => { expect(calcShipping(10000, 'despacho')).toBe(3990) })
  it('despacho gratis desde el umbral', () => { expect(calcShipping(40000, 'despacho')).toBe(0) })
  it('borde del umbral: 39999 cobra y 40000 es gratis', () => {
    expect(calcShipping(39999, 'despacho')).toBe(3990)
    expect(calcShipping(40000, 'despacho')).toBe(0)
  })
  it('retiro es gratis', () => { expect(calcShipping(10000, 'retiro')).toBe(0) })
  it('subtotal 0 no cobra', () => { expect(calcShipping(0, 'despacho')).toBe(0) })
})
