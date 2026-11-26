import { request, getTokens, setTokens, SessionExpiredError, onSessionExpired } from './http.js'

const json = (status, body) => new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

describe('http.request', () => {
  beforeEach(() => { localStorage.clear(); setTokens({ accessToken: 'A1', refreshToken: 'R1' }) })
  afterEach(() => { vi.unstubAllGlobals() })

  it('request_agrega_Authorization', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { ok: 1 }))
    vi.stubGlobal('fetch', fetchMock)
    expect(await request('/api/pedidos/mios')).toEqual({ ok: 1 })
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer A1')
  })

  it('ante_401_refresca_una_vez_y_reintenta', async () => {
    const fetchMock = vi.fn(async (url, opts) => {
      if (url === '/auth/refresh') return json(200, { accessToken: 'A2', refreshToken: 'R2' })
      return opts.headers.Authorization === 'Bearer A2' ? json(200, { ok: 2 }) : json(401, { status: 401, error: 'TOKEN_EXPIRED' })
    })
    vi.stubGlobal('fetch', fetchMock)
    expect(await request('/api/pedidos/mios')).toEqual({ ok: 2 })
    expect(fetchMock.mock.calls.filter(([u]) => u === '/auth/refresh')).toHaveLength(1)
    expect(JSON.parse(fetchMock.mock.calls.find(([u]) => u === '/auth/refresh')[1].body)).toEqual({ refreshToken: 'R1' })
    expect(getTokens()).toEqual({ accessToken: 'A2', refreshToken: 'R2' })
  })

  it('si_el_refresh_falla_cierra_sesion_y_no_hace_bucle', async () => {
    const fetchMock = vi.fn(async (url) => (url === '/auth/refresh' ? json(401, { status: 401, error: 'INVALID_TOKEN' }) : json(401, { status: 401, error: 'TOKEN_EXPIRED' })))
    vi.stubGlobal('fetch', fetchMock)
    const expired = vi.fn()
    const off = onSessionExpired(expired)
    await expect(request('/api/pedidos/mios')).rejects.toBeInstanceOf(SessionExpiredError)
    off()
    expect(fetchMock).toHaveBeenCalledTimes(2) // la petición y un único refresh
    expect(getTokens()).toBeNull()
    expect(expired).toHaveBeenCalledTimes(1)
  })

  it('un_401_tras_el_reintento_no_hace_otro_refresh', async () => {
    const fetchMock = vi.fn(async (url) => (url === '/auth/refresh' ? json(200, { accessToken: 'A2', refreshToken: 'R2' }) : json(401, { status: 401, error: 'X' })))
    vi.stubGlobal('fetch', fetchMock)
    await expect(request('/api/x')).rejects.toMatchObject({ status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('dos_401_simultaneos_comparten_un_solo_refresh', async () => {
    const fetchMock = vi.fn(async (url, opts) => {
      if (url === '/auth/refresh') return json(200, { accessToken: 'A2', refreshToken: 'R2' })
      return opts.headers.Authorization === 'Bearer A2' ? json(200, { url }) : json(401, { status: 401, error: 'TOKEN_EXPIRED' })
    })
    vi.stubGlobal('fetch', fetchMock)
    const [a, b] = await Promise.all([request('/api/a'), request('/api/b')])
    expect([a.url, b.url]).toEqual(['/api/a', '/api/b'])
    expect(fetchMock.mock.calls.filter(([u]) => u === '/auth/refresh')).toHaveLength(1)
  })

  it('auth_false_no_manda_token_ni_refresca', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(401, { status: 401, error: 'INVALID_CREDENTIALS', message: 'no' }))
    vi.stubGlobal('fetch', fetchMock)
    await expect(request('/auth/login', { method: 'POST', body: { a: 1 }, auth: false })).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', message: 'INVALID_CREDENTIALS', status: 401 })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBeUndefined()
    expect(fetchMock.mock.calls[0][1].body).toBe('{"a":1}')
  })

  it('un_refresh_que_lanza_de_inmediato_no_deja_una_promesa_pegada', async () => {
    let refreshCalls = 0
    const fetchMock = vi.fn(async (url) => {
      if (url === '/auth/refresh') { refreshCalls += 1; throw new TypeError('network') }
      return json(401, { status: 401, error: 'X' })
    })
    vi.stubGlobal('fetch', fetchMock)
    await expect(request('/api/a')).rejects.toBeInstanceOf(TypeError)
    await expect(request('/api/b')).rejects.toBeInstanceOf(TypeError)
    expect(refreshCalls).toBe(2) // la segunda petición vuelve a intentar
  })

  it('un_error_de_red_en_el_refresh_conserva_los_tokens', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => { if (url === '/auth/refresh') throw new TypeError('network'); return json(401, {}) }))
    const expired = vi.fn()
    const off = onSessionExpired(expired)
    await expect(request('/api/a')).rejects.toBeInstanceOf(TypeError)
    off()
    expect(getTokens()).toEqual({ accessToken: 'A1', refreshToken: 'R1' })
    expect(expired).not.toHaveBeenCalled()
  })

  it('un_400_en_el_refresh_cierra_sesion_y_un_500_no', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => (url === '/auth/refresh' ? json(500, { error: 'BOOM' }) : json(401, {}))))
    await expect(request('/api/a')).rejects.toMatchObject({ status: 500 })
    expect(getTokens()).not.toBeNull()
    vi.stubGlobal('fetch', vi.fn(async (url) => (url === '/auth/refresh' ? json(400, { error: 'BAD' }) : json(401, {}))))
    await expect(request('/api/a')).rejects.toBeInstanceOf(SessionExpiredError)
    expect(getTokens()).toBeNull()
  })
})
