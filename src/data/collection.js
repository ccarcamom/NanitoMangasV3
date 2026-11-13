export const createCollection = (storage, key, seedItems) => {
  // Descarta basura guardada (null, números, objetos sin id string); no cambia cuándo se resiembra.
  const load = () => {
    const stored = storage.read(key, null)
    return Array.isArray(stored) ? stored.filter((i) => i && typeof i.id === 'string') : null
  }
  let items = load()
  if (!items) {
    items = [...seedItems]
    storage.write(key, items)
  }
  const listeners = new Set()
  // otra pestaña escribió: se vuelve a leer para no pisar sus cambios con una copia vieja
  storage.watch(key, () => {
    items = load() ?? items
    listeners.forEach((cb) => cb())
  })

  const commit = (next) => {
    items = next
    storage.write(key, items)
    listeners.forEach((cb) => cb())
  }

  return {
    all: () => items,
    get: (id) => items.find((i) => i.id === id),
    create(item) {
      const created = { ...item, id: item.id ?? crypto.randomUUID() }
      commit([...items, created])
      return created
    },
    update(id, patch) {
      const current = items.find((i) => i.id === id)
      if (!current) throw new Error(`No existe el elemento ${id}`)
      const updated = { ...current, ...patch, id }
      commit(items.map((i) => (i.id === id ? updated : i)))
      return updated
    },
    remove(id) {
      if (!items.some((i) => i.id === id)) return false
      commit(items.filter((i) => i.id !== id))
      return true
    },
    subscribe(cb) {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
  }
}
