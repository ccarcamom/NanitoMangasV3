// Busca el avance (primer capítulo con páginas) de un manga del catálogo en MangaDex.
// Todas las peticiones pasan por el proxy local de vite/mangadexProxy.js.
// MangaDex clasifica series comerciales para adultos (p. ej. Vagabond) como 'erotica'. Si se excluye,
// la búsqueda no las encuentra y devuelve OTRA obra de nombre parecido. 'pornographic' queda siempre fuera.
const RATINGS = ['safe', 'suggestive', 'erotica']
const LANGUAGES = ['es', 'es-la', 'en'] // orden de preferencia
const FEED_SIZE = 20
const MAX_PAGES = 8 // es un avance: solo las primeras páginas
const MAX_CHAPTERS = 5 // cuántos capítulos se prueban antes de rendirse

export class PreviewError extends Error {
  // code: 'no-preview' (no hay avance) | 'network' (falló la conexión)
  constructor(code) {
    super(code)
    this.code = code
  }
}

// "One Piece - Tomo 1" -> "One Piece"
export const searchTitle = (productName) => productName.replace(/\s+-\s+Tomo\s+\d+\s*$/i, '').trim()

const toQuery = (params) => {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) [].concat(value).forEach((v) => query.append(key, v))
  return query.toString()
}

const chapterNumber = (chapter) => Number.parseFloat(chapter.attributes.chapter) || 0
const rankOf = (code) => {
  const rank = LANGUAGES.indexOf(code)
  return rank === -1 ? LANGUAGES.length : rank
}
const languageRank = (chapter) => rankOf(chapter.attributes.translatedLanguage)

// "pt-br" -> "Portugués (Brasil)". MangaDex escribe el español latino como "es-la"; el estándar es es-419.
const names = new Intl.DisplayNames('es', { type: 'language' })
export const languageName = (code) => {
  try {
    const name = names.of(code === 'es-la' ? 'es-419' : code)
    return name.charAt(0).toUpperCase() + name.slice(1)
  } catch {
    return code
  }
}

// `language` fija el idioma; sin él se prefiere es/es-la/en y, si no sirven, cualquiera. `languages` = idiomas con páginas alojadas.
export async function findPreview(productName, { fetchFn = fetch, base = '/mdx', signal, language } = {}) {
  // null = 404; cualquier otro fallo es 'network'. Un AbortError se deja pasar tal cual.
  const getJson = async (path, params) => {
    let res
    try {
      res = await fetchFn(`${base}/api${path}${params ? `?${toQuery(params)}` : ''}`, { signal })
    } catch (error) {
      throw error.name === 'AbortError' ? error : new PreviewError('network')
    }
    if (res.status === 404) return null
    if (!res.ok) throw new PreviewError('network')
    return res.json()
  }

  const found = await getJson('/manga', {
    title: searchTitle(productName), limit: 1, 'order[relevance]': 'desc', 'contentRating[]': RATINGS,
  })
  const manga = found?.data?.[0]
  if (!manga) throw new PreviewError('no-preview')

  const feedCandidates = async (languages) => {
    const feed = await getJson(`/manga/${manga.id}/feed`, {
      limit: FEED_SIZE, 'order[chapter]': 'asc', includeExternalUrl: 0, 'contentRating[]': RATINGS,
      ...(languages && { 'translatedLanguage[]': languages }),
    })
    return (feed?.data ?? [])
      .filter((c) => c.attributes.pages > 0)
      .sort((a, b) => chapterNumber(a) - chapterNumber(b) || languageRank(a) - languageRank(b))
  }
  // Las ediciones oficiales (p. ej. One Piece) casi no tienen capítulos propios en es/en: si ninguno sirve, se acepta cualquier idioma.
  // Los 5 intentos son en total, no por pasada.
  const lists = language ? [await feedCandidates([language])] : await Promise.all([feedCandidates(LANGUAGES), feedCandidates(null)])
  const languages = [...new Set(lists.flat().map((c) => c.attributes.translatedLanguage))].sort((a, b) => rankOf(a) - rankOf(b))
  let tried = 0
  for (const candidates of lists) {
    for (const chapter of candidates) {
      if (tried >= MAX_CHAPTERS) throw new PreviewError('no-preview')
      tried += 1
      const server = await getJson(`/at-home/server/${chapter.id}`)
      const files = server?.chapter?.dataSaver
      if (!files?.length) continue
      const { hash } = server.chapter
      return {
        chapter: chapter.attributes.chapter, // null en un one-shot
        language: chapter.attributes.translatedLanguage,
        languages,
        pages: files.slice(0, MAX_PAGES).map((file) => `${base}/img?u=${encodeURIComponent(`${server.baseUrl}/data-saver/${hash}/${file}`)}`),
      }
    }
  }
  throw new PreviewError('no-preview')
}
