import { createStorage } from './storage.js'
import { createCartApi } from './cart.js'
import { fakeBackend } from './fakeBackend.js'

const stocks = { a: 5, b: 3, agotado: 0 }
const products = { getProduct: (id) => (id in stocks ? { id, stock: stocks[id] } : undefined) }
const make = (backend = fakeBackend()) => createCartApi(createStorage(backend), products)

describe('cart', () => {
  it('empieza vacío', () => { expect(make().getCart()).toEqual([]) })
  it('addToCart dos veces suma', () => {
    const c = make()
    c.addToCart('a'); c.addToCart('a', 2)
    expect(c.getCart()).toEqual([{ productId: 'a', qty: 3 }])
  })
  it('pedir más que el stock corrige al stock', () => {
    const c = make()
    c.addToCart('b', 99)
    expect(c.getCart()[0].qty).toBe(3)
    c.addToCart('b', 1)
    expect(c.getCart()[0].qty).toBe(3)
  })
  it('qty 0, -2, NaN, Infinity y texto se ignoran', () => {
    const c = make()
    ;[0, -2, NaN, Infinity, 'abc', null].forEach((q) => c.addToCart('a', q))
    expect(c.getCart()).toEqual([])
  })
  it('2.7 se corrige a 2', () => {
    const c = make()
    c.addToCart('a', 2.7)
    expect(c.getCart()[0].qty).toBe(2)
  })
  it('producto agotado o inexistente no se añade', () => {
    const c = make()
    c.addToCart('agotado'); c.addToCart('nope')
    expect(c.getCart()).toEqual([])
  })
  it('setQty(id, 0) quita la línea', () => {
    const c = make()
    c.addToCart('a', 2)
    expect(c.setQty('a', 0)).toEqual([])
  })
  it('setQty corrige a stock y a entero; NaN deja igual', () => {
    const c = make()
    c.addToCart('a', 2)
    expect(c.setQty('a', 50)[0].qty).toBe(5)
    expect(c.setQty('a', 3.9)[0].qty).toBe(3)
    expect(c.setQty('a', NaN)[0].qty).toBe(3)
    expect(c.setQty('a', 'x')[0].qty).toBe(3)
  })
  it('addToCart con texto numérico "3" suma 3 y respeta el stock', () => {
    const c = make()
    c.addToCart('a', '3')
    expect(c.getCart()).toEqual([{ productId: 'a', qty: 3 }])
    c.addToCart('a', '9')
    expect(c.getCart()[0].qty).toBe(5)
  })
  it('setQty de un id ausente deja el carro intacto', () => {
    const c = make()
    c.addToCart('a', 2)
    const before = c.getCart()
    expect(c.setQty('nope', 3)).toBe(before)
    expect(c.getCart()).toEqual([{ productId: 'a', qty: 2 }])
  })
  it('setQty sobre producto sin stock deja la línea intacta', () => {
    const backend = fakeBackend({ 'nanitomangas:cart': JSON.stringify([{ productId: 'agotado', qty: 2 }]) })
    const c = make(backend)
    expect(c.setQty('agotado', 1)).toEqual([{ productId: 'agotado', qty: 2 }])
  })
  it('descarta elementos guardados que no son líneas válidas', () => {
    const load = (v) => make(fakeBackend({ 'nanitomangas:cart': JSON.stringify(v) })).getCart()
    expect(load([null])).toEqual([])
    expect(load([5])).toEqual([])
    expect(load([{}])).toEqual([])
    expect(load([{ productId: 'a', qty: 0 }, { productId: 'a', qty: 1.5 }, { productId: 7, qty: 1 }, { productId: 'a', qty: '2' }])).toEqual([])
    expect(load([null, { productId: 'a', qty: 2 }, {}, { productId: 'b', qty: 1 }]))
      .toEqual([{ productId: 'a', qty: 2 }, { productId: 'b', qty: 1 }])
  })
  it('removeFromCart y clearCart', () => {
    const c = make()
    c.addToCart('a'); c.addToCart('b')
    expect(c.removeFromCart('a')).toEqual([{ productId: 'b', qty: 1 }])
    c.clearCart()
    expect(c.getCart()).toEqual([])
  })
  it('el carro sobrevive a recrear el módulo', () => {
    const backend = fakeBackend()
    make(backend).addToCart('a', 2)
    expect(make(backend).getCart()).toEqual([{ productId: 'a', qty: 2 }])
  })
  it('JSON corrupto o no arreglo da carro vacío', () => {
    expect(make(fakeBackend({ 'nanitomangas:cart': '{mal' })).getCart()).toEqual([])
    expect(make(fakeBackend({ 'nanitomangas:cart': '{"a":1}' })).getCart()).toEqual([])
  })
  it('snapshot conserva la referencia hasta que cambia y notifica', () => {
    const c = make()
    const cb = jasmine.createSpy('cb')
    const off = c.subscribeCart(cb)
    const s1 = c.getCartSnapshot()
    expect(c.getCartSnapshot()).toBe(s1)
    c.addToCart('a')
    expect(c.getCartSnapshot()).not.toBe(s1)
    expect(cb).toHaveBeenCalledTimes(1)
    c.addToCart('agotado')
    expect(cb).toHaveBeenCalledTimes(1)
    off(); c.addToCart('b')
    expect(cb).toHaveBeenCalledTimes(1)
  })
})
