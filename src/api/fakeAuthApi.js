// Test helper: auth API en memoria con la misma forma que src/api/auth.js (las pruebas no tocan la red).
const SEED = [
  { id: 'u-admin', name: 'Administrador', email: 'admin@nanitomangas.cl', password: 'Admin1234', role: 'ADMIN', rut: '', address: null },
  { id: 'u-vend', name: 'Vendedor', email: 'vendedor@nanitomangas.cl', password: 'Vendedor1234', role: 'VENDEDOR', rut: '', address: null },
]
const strip = ({ password, ...user }) => user // eslint-disable-line no-unused-vars

export const createFakeAuthApi = () => {
  const users = SEED.map((u) => ({ ...u }))
  let current = null
  const api = {
    async loginUser(email, password) {
      const found = users.find((u) => u.email === String(email).trim().toLowerCase())
      if (!found || found.password !== password) throw new Error('INVALID_CREDENTIALS')
      current = found
      return { user: strip(found) }
    },
    async registerUser({ name, email, password, role = 'CLIENTE' }) {
      const mail = String(email).trim().toLowerCase()
      if (users.some((u) => u.email === mail)) throw new Error('EMAIL_TAKEN')
      current = { id: `u-${users.length + 1}`, name, email: mail, password, role, rut: '', address: null }
      users.push(current)
      return { user: strip(current) }
    },
    async restoreSession() { return current ? strip(current) : null },
    logout() { current = null },
    async updateProfile(patch) {
      Object.assign(current, patch)
      return strip(current)
    },
  }
  return { api, users }
}
