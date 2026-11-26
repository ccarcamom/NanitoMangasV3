const TOKENS_KEY = 'nanitomangas:tokens'

export class ApiError extends Error {
  constructor(status, code, detail) {
    super(code)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.detail = detail
  }
}
export class SessionExpiredError extends Error {
  constructor() {
    super('SESSION_EXPIRED')
    this.name = 'SessionExpiredError'
  }
}

export const getTokens = () => {
  try { return JSON.parse(localStorage.getItem(TOKENS_KEY)) } catch { return null }
}
export const setTokens = (tokens) => {
  try { localStorage.setItem(TOKENS_KEY, JSON.stringify({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })) } catch { /* almacenamiento bloqueado */ }
}
export const clearTokens = () => {
  try { localStorage.removeItem(TOKENS_KEY) } catch { /* nada que hacer */ }
}

const expiredListeners = new Set()
export const onSessionExpired = (cb) => { expiredListeners.add(cb); return () => expiredListeners.delete(cb) }

const send = (path, { method = 'GET', body, token }) => fetch(path, {
  method,
  headers: {
    ...(body !== undefined && { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
  },
  ...(body !== undefined && { body: JSON.stringify(body) }),
})

// Una sola renovación en vuelo: los 401 simultáneos esperan la misma promesa.
let refreshing = null
const doRefresh = async () => {
  const refreshToken = getTokens()?.refreshToken
  const expire = () => {
    clearTokens()
    expiredListeners.forEach((cb) => cb())
    throw new SessionExpiredError()
  }
  if (!refreshToken) return expire()
  const res = await send('/auth/refresh', { method: 'POST', body: { refreshToken } }) // error de red: se propaga y conserva la sesión
  if (res.status === 401 || res.status === 400) return expire()
  if (!res.ok) throw new ApiError(res.status, `HTTP_${res.status}`)
  setTokens(await res.json())
  return undefined
}
const refresh = () => {
  if (!refreshing) refreshing = doRefresh().finally(() => { refreshing = null })
  return refreshing
}

const parse = async (res) => {
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

// auth:false = ruta pública, sin token ni renovación. Si no, adjunta el token si existe y ante 401 renueva una vez.
export async function request(path, { method, body, auth = true } = {}) {
  let res = await send(path, { method, body, token: auth ? getTokens()?.accessToken : undefined })
  if (res.status === 401 && auth && getTokens()?.refreshToken) {
    await refresh()
    res = await send(path, { method, body, token: getTokens()?.accessToken })
  }
  const data = await parse(res)
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `HTTP_${res.status}`, data?.message)
  return data
}
