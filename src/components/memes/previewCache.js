// Previews de MangaDex ya pedidos (nombre -> resultado), para no repetir peticiones entre sorteos y visitas.
const cache = new Map()
export const getPreview = async (name, find) => {
  if (!cache.has(name)) cache.set(name, await find(name, {}))
  return cache.get(name)
}
export const clearPreviewCache = () => cache.clear()
