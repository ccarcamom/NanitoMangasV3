// Test helper: productos y pedidos en memoria con la forma de src/api/* (más un carro real sobre storage falso).
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createCartApi } from '../data/cart.js'
import { seedProducts } from '../data/seed.js'
import { calcShipping } from '../lib/shipping.js'
import { unitPrice } from '../lib/cartMath.js'
import { ApiError } from './http.js'

// Los mutadores de productos son síncronos a propósito: las pruebas preparan el estado antes de montar.
export const createFakeShop = (initial = seedProducts) => {
  let products = initial.map((p) => ({ ...p }))
  let orders = []
  const backend = fakeBackend()
  const storage = createStorage(backend)
  const productsApi = {
    listProducts: async () => products.map((p) => ({ ...p })),
    getProduct: (id) => products.find((p) => p.id === id),
    updateProduct: (id, patch) => { products = products.map((p) => (p.id === id ? { ...p, ...patch } : p)) },
    deleteProduct: (id) => { products = products.filter((p) => p.id !== id) },
  }
  const cartApi = createCartApi(storage, productsApi)
  // Igual que el servidor: valida todo, calcula envío y total, descuenta stock.
  const ordersApi = {
    async placeOrder({ email, buyer, delivery, items }) {
      const lines = items.map(({ productId, qty }) => {
        const product = productsApi.getProduct(productId)
        if (!product || qty < 1 || product.stock < qty) throw new ApiError(409, `OUT_OF_STOCK:${productId}`)
        return { product, qty }
      })
      if (lines.length === 0) throw new ApiError(400, 'EMPTY_ORDER')
      const lineItems = lines.map(({ product, qty }) => ({ productId: product.id, name: product.name, unitPrice: unitPrice(product), qty }))
      const subtotal = lineItems.reduce((s, i) => s + i.unitPrice * i.qty, 0)
      const shipping = calcShipping(subtotal, delivery.method)
      lines.forEach(({ product, qty }) => productsApi.updateProduct(product.id, { stock: product.stock - qty }))
      const order = {
        id: `NM-${String(orders.length + 1).padStart(6, '0')}`, userId: null, email, buyer, delivery, items: lineItems,
        subtotal, shipping, total: subtotal + shipping, createdAt: new Date().toISOString(), status: 'pagado',
      }
      orders = [...orders, order]
      return order
    },
    listMyOrders: async () => orders,
    getOrder: async (id) => {
      const o = orders.find((x) => x.id === id)
      if (!o) throw new ApiError(404, 'NOT_FOUND')
      return o
    },
  }
  return { backend, storage, productsApi, cartApi, ordersApi, api: { ...productsApi, ...cartApi } }
}
