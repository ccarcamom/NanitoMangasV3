const PREFIX = 'nanitomangas:'

const defaultBackend = () => {
  try { return window.localStorage } catch { return undefined } // acceso bloqueado
}

export const createStorage = (backend = defaultBackend()) => ({
  read(key, fallback) {
    try {
      const raw = backend.getItem(PREFIX + key)
      return raw === null || raw === undefined ? fallback : JSON.parse(raw)
    } catch { return fallback }
  },
  write(key, value) {
    try { backend.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* cuota llena o bloqueado */ }
  },
  remove(key) {
    try { backend.removeItem(PREFIX + key) } catch { /* nada que hacer */ }
  },
  // El evento "storage" solo llega cuando OTRA pestaña escribe (key null = la borraron toda).
  watch(key, cb) {
    const onStorage = (e) => { if (e.key === null || e.key === PREFIX + key) cb() }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  },
})

export const storage = createStorage()
