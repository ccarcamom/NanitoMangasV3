import { unitPrice, cartTotals } from './cartMath.js'

const normal = { id: 'a', price: 10000, salePrice: null }
const oferta = { id: 'b', price: 20000, salePrice: 15000 }

describe('cartMath', () => {
  it('unitPrice usa la oferta si existe', () => {
    expect(unitPrice(oferta)).toBe(15000)
    expect(unitPrice(normal)).toBe(10000)
  })
  it('cartTotals suma una línea en oferta y otra normal', () => {
    const t = cartTotals([{ product: oferta, qty: 2 }, { product: normal, qty: 1 }], 'despacho')
    expect(t).toEqual({ subtotal: 40000, shipping: 0, total: 40000 })
  })
  it('cartTotals suma el envío bajo el umbral', () => {
    expect(cartTotals([{ product: normal, qty: 1 }], 'despacho')).toEqual({ subtotal: 10000, shipping: 3990, total: 13990 })
  })
  it('carro vacío da todo 0', () => {
    expect(cartTotals([], 'despacho')).toEqual({ subtotal: 0, shipping: 0, total: 0 })
  })
})
