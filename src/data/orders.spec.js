import { createStorage } from './storage.js'
import { createProductsApi } from './products.js'
import { createCartApi } from './cart.js'
import { createOrdersApi } from './orders.js'
import { fakeBackend } from './fakeBackend.js'
import { calcShipping } from '../lib/shipping.js'

const base = { categoryId: 'mangas', genre: null, brand: 'X', image: '', description: '', isNew: false, isBestSeller: false, isRestock: false }
const buyer = { name: 'Ana', rut: '12345678-5' }
const addr = { street: 'Calle 1', comuna: 'Maipú', region: 'RM' }
const despacho = { method: 'despacho', address: addr }
const retiro = { method: 'retiro', address: null }

const setup = () => {
  const storage = createStorage(fakeBackend())
  const productsApi = createProductsApi(storage)
  productsApi.createProduct({ ...base, id: 'a', name: 'Alfa', price: 10000, salePrice: null, stock: 5 })
  productsApi.createProduct({ ...base, id: 'b', name: 'Beta', price: 8000, salePrice: 6000, stock: 3 })
  const cartApi = createCartApi(storage, productsApi)
  const api = createOrdersApi({ storage, productsApi, cartApi })
  return { productsApi, cartApi, api }
}
const order = (api, over = {}) => api.placeOrder({ userId: null, email: 'a@b.cl', buyer, delivery: despacho, ...over })

describe('orders', () => {
  it('empieza sin pedidos', () => { expect(setup().api.listOrders()).toEqual([]) })

  it('descuenta stock, vacía el carro y calcula totales con precio oferta', () => {
    const { productsApi, cartApi, api } = setup()
    cartApi.addToCart('a', 2); cartApi.addToCart('b', 1)
    const o = order(api)
    expect(o.id).toBe('NM-000001')
    expect(o.status).toBe('pagado')
    expect(o.items).toEqual([
      { productId: 'a', name: 'Alfa', unitPrice: 10000, qty: 2 },
      { productId: 'b', name: 'Beta', unitPrice: 6000, qty: 1 },
    ])
    expect(o.subtotal).toBe(26000)
    expect(o.shipping).toBe(calcShipping(26000, 'despacho'))
    expect(o.total).toBe(o.subtotal + o.shipping)
    expect(Number.isNaN(Date.parse(o.createdAt))).toBe(false)
    expect(productsApi.getProduct('a').stock).toBe(3)
    expect(productsApi.getProduct('b').stock).toBe(2)
    expect(cartApi.getCart()).toEqual([])
    expect(api.getOrder('NM-000001')).toEqual(o)
  })

  it('retiro: envío según calcShipping', () => {
    const { cartApi, api } = setup()
    cartApi.addToCart('a', 1)
    const o = order(api, { delivery: retiro })
    expect(o.shipping).toBe(calcShipping(10000, 'retiro'))
    expect(o.total).toBe(10000 + o.shipping)
  })

  it('ids correlativos', () => {
    const { cartApi, api } = setup()
    cartApi.addToCart('a', 1); order(api)
    cartApi.addToCart('a', 1)
    expect(order(api).id).toBe('NM-000002')
  })

  it('producto borrado: OUT_OF_STOCK, nada cambia', () => {
    const { productsApi, cartApi, api } = setup()
    cartApi.addToCart('a', 2); cartApi.addToCart('b', 1)
    productsApi.deleteProduct('b')
    expect(() => order(api)).toThrowError('OUT_OF_STOCK:b')
    expect(productsApi.getProduct('a').stock).toBe(5)
    expect(cartApi.getCart().length).toBe(2)
    expect(api.listOrders()).toEqual([])
  })

  it('stock insuficiente: OUT_OF_STOCK, sin stock negativo ni cambios', () => {
    const { productsApi, cartApi, api } = setup()
    cartApi.addToCart('a', 2); cartApi.addToCart('b', 3)
    productsApi.updateProduct('b', { stock: 1 })
    expect(() => order(api)).toThrowError('OUT_OF_STOCK:b')
    expect(productsApi.getProduct('a').stock).toBe(5)
    expect(productsApi.getProduct('b').stock).toBe(1)
    expect(cartApi.getCart().length).toBe(2)
    expect(api.listOrders()).toEqual([])
  })

  it('carro vacío: EMPTY_CART', () => {
    const { api } = setup()
    expect(() => order(api)).toThrowError('EMPTY_CART')
    expect(api.listOrders()).toEqual([])
  })

  it('invitado guarda userId null; listOrdersByUser filtra', () => {
    const { cartApi, api } = setup()
    cartApi.addToCart('a', 1); const g = order(api)
    cartApi.addToCart('a', 1); const u1 = order(api, { userId: 'u1' })
    cartApi.addToCart('a', 1); order(api, { userId: 'u2' })
    expect(g.userId).toBeNull()
    expect(api.listOrdersByUser('u1')).toEqual([u1])
    expect(api.listOrdersByUser(null)).toEqual([])
  })

  it('borrar el producto no cambia items[].name', () => {
    const { productsApi, cartApi, api } = setup()
    cartApi.addToCart('a', 1); order(api)
    productsApi.deleteProduct('a')
    expect(api.getOrder('NM-000001').items[0].name).toBe('Alfa')
  })

  it('subscribeOrders avisa al crear un pedido', () => {
    const { cartApi, api } = setup()
    const cb = vi.fn()
    api.subscribeOrders(cb)
    cartApi.addToCart('a', 1); order(api)
    expect(cb).toHaveBeenCalled()
  })
})
