// @vitest-environment node
import { Writable } from 'node:stream'
import { isAllowedApiPath, isAllowedImageUrl, mangadexHandler } from './mangadexProxy.js'

const UUID = '391c1555-36ee-423f-a65d-cb5f8abd5286'

const mkRes = () => {
  const chunks = []
  const res = new Writable({ write(chunk, _enc, cb) { chunks.push(chunk); cb() } })
  res.headers = {}
  res.setHeader = (name, value) => { res.headers[name.toLowerCase()] = value }
  res.text = () => Buffer.concat(chunks).toString()
  return res
}
const run = async (method, url) => {
  const res = mkRes()
  const finished = new Promise((resolve) => res.on('finish', resolve))
  await mangadexHandler({ method, url }, res)
  await finished
  return res
}

describe('isAllowedApiPath', () => {
  it('permite búsqueda, capítulos de un manga y servidor de páginas', () => {
    expect(isAllowedApiPath('/manga')).toBe(true)
    expect(isAllowedApiPath(`/manga/${UUID}/feed`)).toBe(true)
    expect(isAllowedApiPath(`/at-home/server/${UUID}`)).toBe(true)
  })

  it('rechaza el resto de la API, escrituras y rutas con basura', () => {
    for (const path of ['/auth/login', '/user/me', '/manga/random', `/manga/${UUID}`, `/manga/${UUID}/feed/extra`, '/at-home/server/x', '/manga/../user', '']) {
      expect(isAllowedApiPath(path)).toBe(false)
    }
  })
})

describe('isAllowedImageUrl', () => {
  it('permite el CDN principal y los nodos de MangaDex@Home (con su puerto)', () => {
    expect(isAllowedImageUrl('https://uploads.mangadex.org/data-saver/abc/1.jpg')).toBe(true)
    expect(isAllowedImageUrl('https://aaa.bbb.mangadex.network:30305/data/abc/1.png')).toBe(true)
  })

  it('rechaza otros hosts, parecidos, http, credenciales, puertos del CDN y rutas ajenas', () => {
    for (const url of [
      'https://evil.com/data/abc/1.jpg',
      'https://mangadex.org.evil.com/data/abc/1.jpg',
      'https://evilmangadex.network/data/abc/1.jpg',
      'https://uploads.mangadex.org@evil.com/data/abc/1.jpg',
      'https://user:pass@uploads.mangadex.org/data/abc/1.jpg',
      'http://uploads.mangadex.org/data/abc/1.jpg',
      'https://uploads.mangadex.org:8443/data/abc/1.jpg',
      'https://uploads.mangadex.org/covers/abc/1.jpg',
      'https://127.0.0.1/data/abc/1.jpg',
      'no es una url',
      null,
    ]) {
      expect(isAllowedImageUrl(url)).toBe(false)
    }
  })
})

describe('mangadexHandler', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('solo acepta GET', async () => {
    expect((await run('POST', '/api/manga')).statusCode).toBe(405)
  })

  it('rutas desconocidas dan 404', async () => {
    expect((await run('GET', '/otra')).statusCode).toBe(404)
  })

  it('una ruta de la API no permitida da 403 sin llamar a MangaDex', async () => {
    const fetchFn = vi.fn()
    vi.stubGlobal('fetch', fetchFn)
    expect((await run('GET', '/api/auth/login')).statusCode).toBe(403)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('reenvía la búsqueda a api.mangadex.org con User-Agent propio y sin seguir redirecciones', async () => {
    const fetchFn = vi.fn(async () => new Response('{"data":[]}', { status: 200, headers: { 'content-type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchFn)
    const res = await run('GET', '/api/manga?title=Vagabond&limit=1')
    expect(fetchFn.mock.calls[0][0]).toBe('https://api.mangadex.org/manga?title=Vagabond&limit=1')
    expect(fetchFn.mock.calls[0][1].headers['User-Agent']).toMatch(/^NanitoMangas/)
    expect(fetchFn.mock.calls[0][1].redirect).toBe('error')
    expect(res.statusCode).toBe(200)
    expect(res.text()).toBe('{"data":[]}')
  })

  it('imagen permitida: la entrega con caché; si no es imagen da 502', async () => {
    const img = encodeURIComponent('https://uploads.mangadex.org/data-saver/abc/1.jpg')
    vi.stubGlobal('fetch', vi.fn(async () => new Response('bytes', { status: 200, headers: { 'content-type': 'image/jpeg' } })))
    const ok = await run('GET', `/img?u=${img}`)
    expect(ok.statusCode).toBe(200)
    expect(ok.headers['content-type']).toBe('image/jpeg')
    expect(ok.headers['cache-control']).toBe('public, max-age=3600')
    expect(ok.text()).toBe('bytes')

    vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } })))
    expect((await run('GET', `/img?u=${img}`)).statusCode).toBe(502)
  })

  it('imagen de un host no permitido da 403 sin llamar a nadie', async () => {
    const fetchFn = vi.fn()
    vi.stubGlobal('fetch', fetchFn)
    expect((await run('GET', `/img?u=${encodeURIComponent('https://evil.com/data/a/1.jpg')}`)).statusCode).toBe(403)
    expect((await run('GET', '/img')).statusCode).toBe(403)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('si MangaDex falla o se cae la conexión responde 502', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed') }))
    expect((await run('GET', '/api/manga?title=x')).statusCode).toBe(502)
  })
})
