import { useEffect, useState } from 'react'
import { findPreview } from '../lib/mangadex.js'

const LOADING = { status: 'loading' }

// status: 'loading' | 'ready' (data) | 'empty' (no hay avance) | 'error' (conexión).
// `languages` se conserva del primer resultado y `language` es el idioma mostrado o pedido. `retry` reintenta y `select(code)` cambia de idioma.
export function useMangaPreview(productName, find = findPreview) {
  const [state, setState] = useState(LOADING)
  const [attempt, setAttempt] = useState(0)
  const [chosen, setChosen] = useState()

  useEffect(() => {
    const controller = new AbortController()
    find(productName, { signal: controller.signal, language: chosen })
      .then((data) => setState((s) => ({ status: 'ready', data, language: data.language, languages: s.languages ?? data.languages })))
      .catch((error) => {
        if (error.name === 'AbortError') return
        const empty = error.code === 'no-preview'
        // un idioma elegido que no trae páginas se quita de la lista
        setState((s) => ({ status: empty ? 'empty' : 'error', language: s.language, languages: empty && chosen ? s.languages?.filter((l) => l !== chosen) : s.languages }))
      })
    return () => controller.abort()
  }, [productName, find, attempt, chosen])

  const reload = (language) => setState((s) => ({ status: 'loading', language, languages: s.languages }))
  const retry = () => {
    reload(chosen)
    setAttempt((n) => n + 1)
  }
  const select = (code) => {
    reload(code)
    setChosen(code)
  }
  return [state, retry, select]
}
