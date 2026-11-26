// Test helper: productos, usuarios y pedidos en memoria con la forma de src/api/*; `me` es quien opera.
import { seedProducts } from '../data/seed.js'
import { ApiError } from './http.js'

export const createFakeAdminApi = ({ products = seedProducts, users = [], orders = [], sellerOrders = orders, me = 'u-admin' } = {}) => {
  let P = products.map((p) => ({ sellerId: 'u-vend', ...p }))
  let U = users.map((u) => ({ active: true, ...u }))
  const find = (id) => P.find((p) => p.id === id)
  const api = {
    listProducts: async () => P.map((p) => ({ ...p })),
    listMyProducts: async () => P.filter((p) => p.sellerId === me).map((p) => ({ ...p })),
    getProduct: async (id) => {
      if (!find(id)) throw new ApiError(404, 'NOT_FOUND')
      return { ...find(id) }
    },
    createProduct: async (input) => {
      const created = { ...input, id: `p-${P.length + 1}`, sellerId: me }
      P = [...P, created]
      return created
    },
    updateProduct: async (id, patch) => {
      P = P.map((p) => (p.id === id ? { ...p, ...patch } : p))
      return find(id)
    },
    deleteProduct: async (id) => { P = P.filter((p) => p.id !== id) },
    listUsers: async () => U.map((u) => ({ ...u })),
    updateUser: async (id, patch) => {
      U = U.map((u) => (u.id === id ? { ...u, ...patch } : u))
      return U.find((u) => u.id === id)
    },
    deleteUser: async (id) => {
      if (id === me || U.find((u) => u.id === id)?.seed) throw new ApiError(409, 'FORBIDDEN_SELF_OR_SEED')
      U = U.filter((u) => u.id !== id)
    },
    listOrders: async () => orders,
    listSellerOrders: async () => sellerOrders,
  }
  return { api }
}
