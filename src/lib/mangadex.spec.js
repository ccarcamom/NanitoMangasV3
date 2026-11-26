import { findPreview, languageName, PreviewError, searchTitle } from './mangadex.js'

const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body })
const MANGA = { data: [{ id: 'm1' }] }
const chapter = (id, number, lang = 'es-la', pages = 20) => ({ id, attributes: { chapter: number, translatedLanguage: lang, pages } })
const atHome = (hash = 'h1', files = ['1.png', '2.png']) => json({ baseUrl: 'https://n1.mangadex.network:443', chapter: { hash, dataSaver: files } })

// Responde según un trozo de la URL pedida; lo que no esté en la tabla da 404.
const mockFetch = (table) => vi.fn(async (url) => {
  const hit = Object.entries(table).find(([part]) => url.includes(part))
  return hit ? hit[1] : json({}, 404)
})

describe('searchTitle', () => {
  it('quita el sufijo "- Tomo N" y deja el resto igual', () => {
    expect(searchTitle('One Piece - Tomo 1')).toBe('One Piece')
    expect(searchTitle('20th Century Boys - Tomo 12')).toBe('20th Century Boys')
    expect(searchTitle('Dorohedoro')).toBe('Dorohedoro')
  })
})

describe('findPreview', () => {
  it('arma el avance con el primer capítulo y las páginas pasan por el proxy', async () => {
    const fetchFn = mockFetch({
      '/manga?': json(MANGA),
      '/manga/m1/feed': json({ data: [chapter('c2', '2'), chapter('c1', '1')] }),
      '/at-home/server/c1': atHome(),
    })
    const preview = await findPreview('Vagabond - Tomo 1', { fetchFn })
    expect(preview.chapter).toBe('1')
    expect(preview.language).toBe('es-la')
    expect(preview.pages).toEqual([
      `/mdx/img?u=${encodeURIComponent('https://n1.mangadex.network:443/data-saver/h1/1.png')}`,
      `/mdx/img?u=${encodeURIComponent('https://n1.mangadex.network:443/data-saver/h1/2.png')}`,
    ])
  })

  it('el avance se corta en 8 páginas', async () => {
    const files = Array.from({ length: 12 }, (_, i) => `${i + 1}.png`)
    const fetchFn = mockFetch({ '/manga?': json(MANGA), '/manga/m1/feed': json({ data: [chapter('c1', '1')] }), '/at-home/server/c1': atHome('h1', files) })
    expect((await findPreview('X', { fetchFn })).pages).toHaveLength(8)
  })

  it('busca por el título sin "Tomo", sin pornographic, y sin capítulos externos', async () => {
    const fetchFn = mockFetch({ '/manga?': json({ data: [] }) })
    await findPreview('One Piece - Tomo 1', { fetchFn }).catch(() => {})
    const search = new URL(fetchFn.mock.calls[0][0], 'http://local').searchParams
    expect(search.get('title')).toBe('One Piece')
    // 'erotica' debe estar: sin él, series como Vagabond no se encuentran y la búsqueda devuelve otra obra
    expect(search.getAll('contentRating[]')).toEqual(['safe', 'suggestive', 'erotica'])

    const withFeed = mockFetch({ '/manga?': json(MANGA), '/manga/m1/feed': json({ data: [] }) })
    await findPreview('X', { fetchFn: withFeed }).catch(() => {})
    const feed = new URL(withFeed.mock.calls[1][0], 'http://local').searchParams
    expect(feed.get('includeExternalUrl')).toBe('0')
    expect(feed.getAll('contentRating[]')).toEqual(['safe', 'suggestive', 'erotica'])
    expect(feed.getAll('contentRating[]')).not.toContain('pornographic')
  })

  it('con el mismo número de capítulo prefiere español sobre inglés', async () => {
    const fetchFn = mockFetch({
      '/manga?': json(MANGA),
      '/manga/m1/feed': json({ data: [chapter('en1', '1', 'en'), chapter('es1', '1', 'es')] }),
      '/at-home/server/es1': atHome(),
      '/at-home/server/en1': atHome(),
    })
    expect((await findPreview('X', { fetchFn })).language).toBe('es')
  })

  it('ignora capítulos sin páginas y salta los que el servidor no tiene (404)', async () => {
    const fetchFn = mockFetch({
      '/manga?': json(MANGA),
      '/manga/m1/feed': json({ data: [chapter('vacio', '1', 'es', 0), chapter('roto', '2'), chapter('bueno', '3')] }),
      '/at-home/server/bueno': atHome(),
    })
    const preview = await findPreview('X', { fetchFn })
    expect(preview.chapter).toBe('3')
    expect(fetchFn.mock.calls.some(([url]) => url.includes('/at-home/server/vacio'))).toBe(false)
  })

  it('si ningún capítulo en es/en sirve, acepta cualquier otro idioma', async () => {
    const fetchFn = vi.fn(async (url) => {
      if (url.includes('/manga?')) return json(MANGA)
      if (url.includes('/feed')) return json({ data: url.includes('translatedLanguage') ? [chapter('viejo', '1191', 'en')] : [chapter('pt1', '1', 'pt-br')] })
      return url.includes('/at-home/server/pt1') ? atHome() : json({}, 404) // 'viejo' da 404
    })
    expect((await findPreview('X', { fetchFn })).language).toBe('pt-br')
  })

  it('devuelve los idiomas con páginas, los preferidos primero', async () => {
    const fetchFn = mockFetch({
      '/manga?': json(MANGA),
      '/manga/m1/feed': json({ data: [chapter('f1', '1', 'fr'), chapter('en1', '1', 'en'), chapter('vacio', '1', 'de', 0), chapter('es1', '1', 'es')] }),
      '/at-home/server/es1': atHome(),
    })
    expect((await findPreview('X', { fetchFn })).languages).toEqual(['es', 'en', 'fr'])
  })

  it('con `language` pide solo ese idioma', async () => {
    const fetchFn = mockFetch({ '/manga?': json(MANGA), '/manga/m1/feed': json({ data: [chapter('f1', '1', 'fr')] }), '/at-home/server/f1': atHome() })
    const preview = await findPreview('X', { fetchFn, language: 'fr' })
    expect(preview.language).toBe('fr')
    const feeds = fetchFn.mock.calls.filter(([url]) => url.includes('/feed'))
    expect(feeds).toHaveLength(1)
    expect(feeds[0][0]).toContain('translatedLanguage%5B%5D=fr')
  })

  it('un one-shot trae capítulo null', async () => {
    const fetchFn = mockFetch({
      '/manga?': json(MANGA), '/manga/m1/feed': json({ data: [chapter('c', null)] }), '/at-home/server/c': atHome(),
    })
    expect((await findPreview('X', { fetchFn })).chapter).toBeNull()
  })

  it('sin resultados, sin capítulos o sin páginas legibles: no-preview', async () => {
    const cases = [
      { '/manga?': json({ data: [] }) },
      { '/manga?': json(MANGA), '/manga/m1/feed': json({ data: [] }) },
      { '/manga?': json(MANGA), '/manga/m1/feed': json({ data: [chapter('c1', '1')] }) },
      { '/manga?': json(MANGA), '/manga/m1/feed': json({ data: [chapter('c1', '1')] }), '/at-home/server/c1': atHome('h', []) },
    ]
    for (const table of cases) {
      await expect(findPreview('X', { fetchFn: mockFetch(table) })).rejects.toMatchObject({ code: 'no-preview' })
    }
  })

  it('solo prueba los primeros 5 capítulos antes de rendirse', async () => {
    const data = Array.from({ length: 8 }, (_, i) => chapter(`c${i}`, String(i + 1)))
    const fetchFn = mockFetch({ '/manga?': json(MANGA), '/manga/m1/feed': json({ data }) })
    await expect(findPreview('X', { fetchFn })).rejects.toMatchObject({ code: 'no-preview' })
    expect(fetchFn.mock.calls.filter(([url]) => url.includes('/at-home/'))).toHaveLength(5)
  })

  it('si falla la conexión o MangaDex responde error: network', async () => {
    const offline = vi.fn(async () => { throw new TypeError('fetch failed') })
    await expect(findPreview('X', { fetchFn: offline })).rejects.toMatchObject({ code: 'network' })
    const down = mockFetch({ '/manga?': json({}, 500) })
    await expect(findPreview('X', { fetchFn: down })).rejects.toBeInstanceOf(PreviewError)
  })

  it('un AbortError (se salió de la página) se propaga tal cual, no como network', async () => {
    const aborted = vi.fn(async () => { throw new DOMException('abort', 'AbortError') })
    await expect(findPreview('X', { fetchFn: aborted })).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('pasa la señal de cancelación a cada petición', async () => {
    const controller = new AbortController()
    const fetchFn = mockFetch({ '/manga?': json({ data: [] }) })
    await findPreview('X', { fetchFn, signal: controller.signal }).catch(() => {})
    expect(fetchFn.mock.calls[0][1].signal).toBe(controller.signal)
  })
})

describe('languageName', () => {
  it('da el nombre en español y trata es-la como español latino', () => {
    expect(languageName('en')).toBe('Inglés')
    expect(languageName('es-la')).toMatch(/^Español latino/)
    expect(languageName('pt-br')).toMatch(/^Portugués/)
    expect(languageName('???')).toBe('???')
  })
})
