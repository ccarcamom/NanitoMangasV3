import { createContext, useContext, useMemo, useSyncExternalStore } from 'react'
import * as data from '../data/index.js'
import { useProducts } from '../hooks/useProducts.js'
import { cartTotals } from '../lib/cartMath.js'

const CartContext = createContext(null)

// `api` = cart + products functions; specs inject one built on a fake storage.
export function CartProvider({ children, api = data }) {
  const items = useSyncExternalStore(api.subscribeCart, api.getCart)
  const products = useProducts(api)

  const value = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    const lines = []
    const missing = []
    items.forEach(({ productId, qty }) => {
      const product = byId.get(productId)
      if (product) lines.push({ product, qty })
      else missing.push(productId)
    })
    return {
      lines,
      missing,
      blocked: missing.length > 0 || lines.some((l) => l.qty > l.product.stock),
      count: lines.reduce((n, l) => n + l.qty, 0),
      add: (productId, qty = 1) => api.addToCart(productId, qty),
      setQty: (productId, qty) => api.setQty(productId, qty),
      remove: (productId) => api.removeFromCart(productId),
      clear: () => api.clearCart(),
      totals: (method) => cartTotals(lines, method),
    }
  }, [items, products, api])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
