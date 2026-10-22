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
})

export const storage = createStorage()
