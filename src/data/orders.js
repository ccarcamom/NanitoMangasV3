import { storage as defaultStorage } from './storage.js'
import { createCollection } from './collection.js'
import { getProduct, updateProduct } from './products.js'
import { getCart, clearCart } from './cart.js'
import { calcShipping } from '../lib/shipping.js'
import { unitPrice } from '../lib/cartMath.js'

const nextId = (orders) => {
  const max = orders.reduce((m, o) => Math.max(m, Number(o.id.slice(3)) || 0), 0)
  return `NM-${String(max + 1).padStart(6, '0')}`
}

// Factory so specs can inject a fake storage and stub products/cart APIs.
export const createOrdersApi = ({ storage, productsApi, cartApi }) => {
  const col = createCollection(storage, 'orders', [])

  const placeOrder = ({ userId = null, email, buyer, delivery }) => {
    const cart = cartApi.getCart()
    if (cart.length === 0) throw new Error('EMPTY_CART')
    // Validar todo antes de tocar nada (todo o nada).
    const lines = cart.map(({ productId, qty }) => {
      const product = productsApi.getProduct(productId)
      if (!product || product.stock < qty) throw new Error(`OUT_OF_STOCK:${productId}`)
      return { product, qty }
    })
    const items = lines.map(({ product, qty }) => ({
      productId: product.id, name: product.name, unitPrice: unitPrice(product), qty,
    }))
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0)
    const shipping = calcShipping(subtotal, delivery.method)
    lines.forEach(({ product, qty }) => productsApi.updateProduct(product.id, { stock: product.stock - qty }))
    const order = col.create({
      id: nextId(col.all()),
      userId: userId ?? null,
      email,
      buyer,
      delivery,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      createdAt: new Date().toISOString(),
      status: 'pagado',
    })
    cartApi.clearCart()
    return order
  }

  return {
    placeOrder,
    listOrders: () => col.all(),
    listOrdersByUser: (userId) => (userId == null ? [] : col.all().filter((o) => o.userId === userId)),
    getOrder: (id) => col.get(id),
    subscribeOrders: (cb) => col.subscribe(cb),
  }
}

export const {
  placeOrder, listOrders, listOrdersByUser, getOrder, subscribeOrders,
} = createOrdersApi({
  storage: defaultStorage,
  productsApi: { getProduct, updateProduct },
  cartApi: { getCart, clearCart },
})
