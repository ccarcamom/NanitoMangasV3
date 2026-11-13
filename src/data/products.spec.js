import { createStorage } from './storage.js'
import { createProductsApi } from './products.js'
import { fakeBackend } from './fakeBackend.js'

const input = { name: 'Manga X', brand: 'Editorial 1', categoryId: 'mangas', genre: 'shonen', price: 9990, salePrice: null, stock: 3, image: '/img/placeholder.svg', description: 'd', isNew: false, isBestSeller: false, isRestock: false }
const make = () => createProductsApi(createStorage(fakeBackend()))

describe('products', () => {
  it('createProduct + listProducts incluye el nuevo', () => {
    const api = make()
    const p = api.createProduct(input)
    expect(api.listProducts().some((x) => x.id === p.id)).toBe(true)
    expect(api.getProduct(p.id).name).toBe('Manga X')
  })
  it('updateProduct cambia price', () => {
    const api = make()
    const p = api.createProduct(input)
    expect(api.updateProduct(p.id, { price: 5000 }).price).toBe(5000)
  })
  it('deleteProduct lo quita', () => {
    const api = make()
    const p = api.createProduct(input)
    expect(api.deleteProduct(p.id)).toBe(true)
    expect(api.getProduct(p.id)).toBeUndefined()
  })
  it('subscribe y la lista cambian de referencia al escribir', () => {
    const api = make()
    const cb = vi.fn()
    const off = api.subscribeProducts(cb)
    const s = api.listProducts()
    api.createProduct(input)
    expect(cb).toHaveBeenCalledTimes(1)
    expect(api.listProducts()).not.toBe(s)
    off()
  })
  it('exporta la API por defecto', async () => {
    const m = await import('./products.js')
    ;['listProducts', 'getProduct', 'createProduct', 'updateProduct', 'deleteProduct', 'subscribeProducts'].forEach((k) => expect(typeof m[k]).toBe('function'))
  })
})
