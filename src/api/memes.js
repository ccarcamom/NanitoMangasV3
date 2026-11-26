import { request } from './http.js'

export const listMyMemes = () => request('/api/memes')
export const createMeme = (recipe) => request('/api/memes', { method: 'POST', body: recipe })
export const updateMeme = (id, recipe) => request(`/api/memes/${encodeURIComponent(id)}`, { method: 'PUT', body: recipe })
export const deleteMeme = (id) => request(`/api/memes/${encodeURIComponent(id)}`, { method: 'DELETE' })
