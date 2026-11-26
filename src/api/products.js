import { request } from './http.js'

const query = (filters = {}) => {
  const p = new URLSearchParams(Object.entries(filters).filter(([, v]) => v != null && v !== ''))
  return p.size ? `?${p}` : ''
}

export const listProducts = (filters) => request(`/api/productos${query(filters)}`, { auth: false })
export const getProduct = (id) => request(`/api/productos/${encodeURIComponent(id)}`, { auth: false })
export const listMyProducts = () => request('/api/productos/mios')
export const createProduct = (input) => request('/api/productos', { method: 'POST', body: input })
export const updateProduct = (id, patch) => request(`/api/productos/${encodeURIComponent(id)}`, { method: 'PUT', body: patch })
export const deleteProduct = (id) => request(`/api/productos/${encodeURIComponent(id)}`, { method: 'DELETE' })
