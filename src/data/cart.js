import { storage as defaultStorage } from './storage.js'
import { getProduct } from './products.js'

const KEY = 'cart'

// Entero finito o null. Acepta texto numérico ("3"), rechaza NaN, Infinity, null y basura.
const toInt = (q) => {
  const n = typeof q === 'string' && q.trim() !== '' ? Number(q) : q
  return typeof n === 'number' && Number.isFinite(n) ? Math.floor(n) : null
}

// Factory so specs can inject a fake storage and a stub products API.
export const createCartApi = (storage, productsApi) => {
  const stored = storage.read(KEY, [])
  let items = Array.isArray(stored)
    ? stored.filter((i) => i && typeof i.productId === 'string' && Number.isInteger(i.qty) && i.qty >= 1)
    : []
  const listeners = new Set()

  const commit = (next) => {
    items = next
    storage.write(KEY, items)
    listeners.forEach((cb) => cb())
    return items
  }

  const addToCart = (productId, qty = 1) => {
    const n = toInt(qty)
    const stock = productsApi.getProduct(productId)?.stock ?? 0
    if (n === null || n < 1 || stock < 1) return items
    const current = items.find((i) => i.productId === productId)
    const merged = Math.min((current?.qty ?? 0) + n, stock)
    if (current?.qty === merged) return items
    return commit(current
      ? items.map((i) => (i === current ? { ...i, qty: merged } : i))
      : [...items, { productId, qty: merged }])
  }

  const removeFromCart = (productId) => (items.some((i) => i.productId === productId)
    ? commit(items.filter((i) => i.productId !== productId))
    : items)

  const setQty = (productId, qty) => {
    const n = toInt(qty)
    if (n === null || !items.some((i) => i.productId === productId)) return items
    if (n <= 0) return removeFromCart(productId)
    const stock = productsApi.getProduct(productId)?.stock ?? 0
    if (stock < 1) return items // sin stock: el carro lo muestra y el pago lo bloquea
    const next = Math.min(n, stock)
    return commit(items.map((i) => (i.productId === productId ? { ...i, qty: next } : i)))
  }

  return {
    getCart: () => items,
    addToCart,
    setQty,
    removeFromCart,
    clearCart: () => { commit([]) },
    subscribeCart: (cb) => { listeners.add(cb); return () => { listeners.delete(cb) } },
    getCartSnapshot: () => items,
  }
}

export const {
  getCart, addToCart, setQty, removeFromCart, clearCart, subscribeCart, getCartSnapshot,
} = createCartApi(defaultStorage, { getProduct })
