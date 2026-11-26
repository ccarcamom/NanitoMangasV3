import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from 'react'
import * as defaultProductsApi from '../api/index.js'
import { storage } from '../data/storage.js'
import { createCartApi } from '../data/cart.js'
import { useProducts } from '../hooks/useProducts.js'
import { cartTotals } from '../lib/cartMath.js'

const CartContext = createContext(null)

// El carro vive en localStorage; el tope por stock usa los productos que cargó el proveedor.
const stockCache = new Map()
const defaultCart = createCartApi(storage, { getProduct: (id) => stockCache.get(id) })

// `api` = funciones del carro; `productsApi` = { listProducts }. Las pruebas inyectan dobles.
export function CartProvider({ children, api = defaultCart, productsApi = api.listProducts ? api : defaultProductsApi }) {
  const items = useSyncExternalStore(api.subscribeCart, api.getCart)
  const { data: products, loading, error, reload } = useProducts(productsApi)

  useEffect(() => {
    stockCache.clear()
    products.forEach((p) => stockCache.set(p.id, p))
  }, [products])

  const value = useMemo(() => {
    const byId = new Map(products.map((p) => [p.id, p]))
    const lines = []
    const missing = []
    // mientras cargan los productos no se declara nada como "no disponible"
    if (!loading && !error) {
      items.forEach(({ productId, qty }) => {
        const product = byId.get(productId)
        if (product) lines.push({ product, qty })
        else missing.push(productId)
      })
    }
    return {
      lines,
      missing,
      loading,
      error,
      reload,
      blocked: missing.length > 0 || lines.some((l) => l.qty > l.product.stock),
      count: (loading || error ? items : lines.map((l) => ({ qty: l.qty }))).reduce((n, i) => n + i.qty, 0),
      add: (productId, qty = 1) => api.addToCart(productId, qty),
      setQty: (productId, qty) => api.setQty(productId, qty),
      remove: (productId) => api.removeFromCart(productId),
      clear: () => api.clearCart(),
      totals: (method) => cartTotals(lines, method),
    }
  }, [items, products, loading, error, reload, api])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
