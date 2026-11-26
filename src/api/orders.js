import { request } from './http.js'

// El token es opcional: sin sesión es compra de invitado.
export const placeOrder = (payload) => request('/api/pedidos', { method: 'POST', body: payload })
export const listMyOrders = () => request('/api/pedidos/mios')
export const getOrder = (id) => request(`/api/pedidos/${encodeURIComponent(id)}`)
export const listOrders = () => request('/api/pedidos')
export const listSellerOrders = () => request('/api/pedidos/vendedor')
