import { Readable } from 'node:stream'

// Proxy local para MangaDex (solo `npm run dev` y `npm run preview`).
// MangaDex no envía CORS a otros sitios, bloquea imágenes con hotlink y exige un User-Agent propio.
// Por eso el navegador habla con /mdx/... y este middleware reenvía la petición.
const API = 'https://api.mangadex.org'
const USER_AGENT = 'NanitoMangas-class-exercise/0.1'
const TIMEOUT_MS = 15000

// Solo lo que usa el lector: búsqueda, capítulos de un manga y servidor de páginas.
const API_PATH = /^\/(manga(\/[0-9a-f-]{36}\/feed)?|at-home\/server\/[0-9a-f-]{36})$/
const IMAGE_PATH = /^\/(data|data-saver)\//

export const isAllowedApiPath = (path) => API_PATH.test(path)

export function isAllowedImageUrl(raw) {
  let url
  try { url = new URL(raw) } catch { return false }
  if (url.protocol !== 'https:' || url.username || url.password) return false
  if (!IMAGE_PATH.test(url.pathname)) return false
  // Los nodos de MangaDex@Home usan puertos propios; el CDN principal solo el 443.
  if (url.hostname.endsWith('.mangadex.network')) return true
  return url.hostname === 'uploads.mangadex.org' && url.port === ''
}

const fail = (res, code) => { res.statusCode = code; res.end() }

async function forward(res, target, { onlyImages = false } = {}) {
  // redirect: 'error' evita que una redirección saque la petición de los hosts permitidos.
  const upstream = await fetch(target, { headers: { 'User-Agent': USER_AGENT }, redirect: 'error', signal: AbortSignal.timeout(TIMEOUT_MS) })
  const type = upstream.headers.get('content-type') ?? ''
  if (onlyImages && !type.startsWith('image/')) return fail(res, 502)
  res.statusCode = upstream.status
  res.setHeader('Content-Type', type)
  if (onlyImages) res.setHeader('Cache-Control', 'public, max-age=3600')
  if (!upstream.body) return res.end()
  const body = Readable.fromWeb(upstream.body)
  body.on('error', () => res.destroy())
  body.pipe(res)
}

export async function mangadexHandler(req, res) {
  if (req.method !== 'GET') return fail(res, 405)
  const url = new URL(req.url, 'http://localhost')
  try {
    if (url.pathname.startsWith('/api/')) {
      const path = url.pathname.slice('/api'.length)
      return isAllowedApiPath(path) ? await forward(res, API + path + url.search) : fail(res, 403)
    }
    if (url.pathname === '/img') {
      const target = url.searchParams.get('u')
      return isAllowedImageUrl(target) ? await forward(res, target, { onlyImages: true }) : fail(res, 403)
    }
    return fail(res, 404)
  } catch {
    return fail(res, 502)
  }
}

export function mangadexProxy() {
  // Sin `return`: Vite ejecuta como hook posterior cualquier función que devuelva configureServer.
  const attach = (server) => { server.middlewares.use('/mdx', mangadexHandler) }
  return { name: 'mangadex-proxy', configureServer: attach, configurePreviewServer: attach }
}
