import { request, setTokens, clearTokens, getTokens, SessionExpiredError } from './http.js'

const POST = 'POST'

export async function loginUser(email, password) {
  const { accessToken, refreshToken, user } = await request('/auth/login', { method: POST, body: { email, password }, auth: false })
  setTokens({ accessToken, refreshToken })
  return { user }
}

export async function registerUser({ name, email, password, role }) {
  const created = await request('/auth/register', { method: POST, body: { name, email, password, ...(role && { role }) }, auth: false })
  if (created?.accessToken) {
    setTokens(created)
    return { user: created.user }
  }
  return loginUser(email, password) // el contrato no dice que el registro devuelva tokens
}

export async function restoreSession() {
  if (!getTokens()?.accessToken) return null
  try {
    return await request('/auth/me')
  } catch (err) {
    if (err instanceof SessionExpiredError || err.status === 401) { clearTokens(); return null }
    throw err
  }
}

export const logout = () => clearTokens()
