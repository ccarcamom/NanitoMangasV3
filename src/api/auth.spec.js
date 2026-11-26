import { setTokens, getTokens } from './http.js'
import { loginUser, registerUser, restoreSession, logout } from './auth.js'

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('api/auth', () => {
  beforeEach(() => { localStorage.clear() })
  afterEach(() => { vi.unstubAllGlobals() })

  it('restoreSession_con_token_valido_devuelve_usuario', async () => {
    setTokens({ accessToken: 'A', refreshToken: 'R' })
    const fetchMock = vi.fn().mockResolvedValue(json(200, { id: 'u1', email: 'a@b.cl', role: 'CLIENTE' }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await restoreSession()).toMatchObject({ id: 'u1', role: 'CLIENTE' })
    expect(fetchMock.mock.calls[0][0]).toBe('/auth/me')
  })

  it('restoreSession_sin_token_devuelve_null', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await restoreSession()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('restoreSession_con_sesion_vencida_devuelve_null', async () => {
    setTokens({ accessToken: 'A', refreshToken: 'R' })
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(401, { status: 401, error: 'X' })))
    expect(await restoreSession()).toBeNull()
    expect(getTokens()).toBeNull()
  })

  it('loginUser_guarda_tokens_y_devuelve_user; logout los borra', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json(200, { accessToken: 'A', refreshToken: 'R', user: { id: 'u1' } })))
    expect(await loginUser('a@b.cl', 'x')).toEqual({ user: { id: 'u1' } })
    expect(getTokens()).toEqual({ accessToken: 'A', refreshToken: 'R' })
    logout()
    expect(getTokens()).toBeNull()
  })

  it('registerUser_sin_tokens_en_la_respuesta_inicia_sesion_con_login', async () => {
    const fetchMock = vi.fn(async (url) => (url === '/auth/register' ? json(201, { id: 'u2' }) : json(200, { accessToken: 'A', refreshToken: 'R', user: { id: 'u2' } })))
    vi.stubGlobal('fetch', fetchMock)
    expect(await registerUser({ name: 'Ana', email: 'a@b.cl', password: 'Clave1234' })).toEqual({ user: { id: 'u2' } })
    expect(fetchMock.mock.calls.map(([u]) => u)).toEqual(['/auth/register', '/auth/login'])
  })
})
