import { request } from './http.js'

export const updateProfile = (patch) => request('/api/usuarios/me', { method: 'PUT', body: patch })
export const listUsers = () => request('/api/admin/usuarios')
export const getUser = (id) => request(`/api/admin/usuarios/${encodeURIComponent(id)}`)
export const updateUser = (id, patch) => request(`/api/admin/usuarios/${encodeURIComponent(id)}`, { method: 'PUT', body: patch })
export const deleteUser = (id) => request(`/api/admin/usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' })
