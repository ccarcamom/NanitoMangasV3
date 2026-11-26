import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import * as defaultApi from '../api/index.js'
import { findPreview } from '../lib/mangadex.js'
import { drawMeme } from '../lib/memes/render.js'
import { pickRandomPage } from '../lib/memes/sampler.js'
import { loadImage as defaultLoadImage, toImageData } from '../components/memes/image.js'
import MemeNav from '../components/memes/MemeNav.jsx'
import FontColorControls, { bubbleError } from '../components/memes/FontColorControls.jsx'
import { useSubmitLock } from '../hooks/useSubmitLock.js'
import { getPreview } from '../components/memes/previewCache.js'
import EmptyState from '../components/common/EmptyState.jsx'

const STYLE = { text: '', fontFamily: 'Montserrat', fontSize: 24, color: '#000000', background: '#ffffff' }
const MIN_BOX = 0.02
const clamp01 = (n) => Math.min(1, Math.max(0, n))
const RECIPE_KEYS = ['x', 'y', 'w', 'h', 'text', 'fontFamily', 'fontSize', 'color', 'background']
const MAX_PRODUCTS = 4
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1])
const toRecipeBubble = (b) => Object.fromEntries(RECIPE_KEYS.map((k) => [k, k === 'fontSize' ? Number(b[k]) : b[k]]))

export default function MemeEditor({ api = defaultApi, find = findPreview, loadImage = defaultLoadImage }) {
  const editing = useLocation().state?.meme
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)
  const [state, setState] = useState({ status: 'loading' }) // loading | ready | empty | error
  const [page, setPage] = useState(null)
  const [img, setImg] = useState(null)
  const [bubbles, setBubbles] = useState([])
  const [sel, setSel] = useState(null)
  const [editId, setEditId] = useState(null)
  const [message, setMessage] = useState('')
  const [drawMode, setDrawMode] = useState(false)
  const [draft, setDraft] = useState(null)
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const startRef = useRef(null)
  const { pending, lock, unlock } = useSubmitLock()
  const [manual, setManual] = useState({ x: '10', y: '10', w: '40', h: '20' })

  useEffect(() => {
    let live = true
    const show = (p, image, list, id = null) => {
      if (!live) return
      setPage(p); setImg(image); setBubbles(list); setSel(list.length ? 0 : null); setEditId(id)
      setDrawMode(list.length === 0)
      setMessage(list.length ? `${list.length} recuadros detectados` : 'Sin recuadros detectados')
      setState({ status: 'ready' })
    }
    const run = async () => {
      setState({ status: 'loading' }); setMessage('Buscando una página')
      try {
        const products = await api.listProducts()
        if (editing) {
          const product = products.find((p) => p.id === editing.productId)
          const data = product && await find(product.name, { language: editing.language })
          const url = data?.pages?.[editing.pageIndex]
          if (!url) return live && setState({ status: 'empty' })
          const { id, productId, language, pageIndex } = editing
          return show({ productId, language, pageIndex, url, name: product.name }, await loadImage(url),
            editing.bubbles.map((b) => ({ ...STYLE, ...b })), id)
        }
        // Un producto a la vez: solo se pasa al siguiente si ninguna página del anterior sirve (máx. 4, sin repetir).
        const imgs = new Map()
        const load = async (url) => {
          if (!imgs.has(url)) imgs.set(url, await loadImage(url))
          return imgs.get(url)
        }
        const toData = async (url) => toImageData(await load(url))
        let last = null
        for (const product of shuffle(products.filter((p) => p.categoryId === 'mangas')).slice(0, MAX_PRODUCTS)) {
          if (!live) return
          let data
          try { data = await getPreview(product.name, find) } catch { continue }
          if (!data?.pages?.length) continue
          const pool = data.pages.map((url, pageIndex) => ({ productId: product.id, language: data.language, pageIndex, url }))
          last = { product, pool }
          const picked = await pickRandomPage(pool, toData)
          if (!live) return
          if (picked) return show({ ...picked, name: product.name }, await load(picked.url), picked.bubbles.map((b) => ({ ...b, ...STYLE })))
        }
        // Ninguna página trae recuadros detectables: se ofrece una al azar para dibujarlo a mano.
        if (!last) return live && setState({ status: 'empty' })
        const c = last.pool[Math.floor(Math.random() * last.pool.length)]
        show({ ...c, name: last.product.name }, await load(c.url), [])
      } catch {
        if (live) setState({ status: 'error' })
      }
    }
    run()
    return () => { live = false }
  }, [api, find, loadImage, editing, tick])

  const drawn = useMemo(
    () => bubbles.filter((b) => b.text && !bubbleError(b)).map((b) => ({ ...b, fontSize: Number(b.fontSize) })),
    [bubbles],
  )
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    canvas.width = img.naturalWidth || img.width
    canvas.height = img.naturalHeight || img.height
    const ctx = canvas.getContext('2d')
    if (ctx) drawMeme(ctx, img, drawn)
  }, [img, drawn, state.status])

  const patchSel = (patch) => {
    setBubbles((list) => list.map((b, i) => (i === sel ? { ...b, ...patch } : b)))
    setMessage('')
  }

  const point = (e) => {
    const r = stageRef.current.getBoundingClientRect()
    return [clamp01((e.clientX - r.left) / r.width), clamp01((e.clientY - r.top) / r.height)]
  }
  const rectOf = (a, b) => ({ x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), w: Math.abs(a[0] - b[0]), h: Math.abs(a[1] - b[1]) })
  const onDown = (e) => {
    if (!drawMode) return
    startRef.current = point(e)
    stageRef.current.setPointerCapture?.(e.pointerId)
    setDraft(rectOf(startRef.current, startRef.current))
  }
  const onMove = (e) => { if (startRef.current) setDraft(rectOf(startRef.current, point(e))) }
  const onUp = (e) => {
    if (!startRef.current) return
    const r = rectOf(startRef.current, point(e))
    startRef.current = null
    setDraft(null)
    if (r.w < MIN_BOX || r.h < MIN_BOX) return
    addBubble(r)
  }
  const addBubble = (r) => {
    setSel(bubbles.length)
    setBubbles([...bubbles, { ...r, ...STYLE }])
    setDrawMode(false)
  }
  const num = (k) => Number(manual[k])
  const manualOk = ['x', 'y', 'w', 'h'].every((k) => manual[k] !== '' && Number.isFinite(num(k)) && num(k) >= 0)
    && num('w') > 0 && num('h') > 0 && num('x') + num('w') <= 100 && num('y') + num('h') <= 100

  const withText = bubbles.filter((b) => b.text.trim())
  const valid = withText.length > 0 && withText.every((b) => !bubbleError(b))

  const save = async () => {
    const recipe = { productId: page.productId, language: page.language, pageIndex: page.pageIndex, bubbles: withText.map(toRecipeBubble) }
    if (!lock()) return
    setMessage('Guardando')
    try {
      const saved = editId ? await api.updateMeme(editId, recipe) : await api.createMeme(recipe)
      setEditId(saved?.id ?? editId)
      setMessage('Meme guardado')
    } catch {
      setMessage('No se pudo guardar el meme')
    } finally {
      unlock()
    }
  }

  const exportPng = () => canvasRef.current?.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meme.png'
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')

  const another = () => {
    if (editing) navigate('.', { replace: true, state: null }) // la nueva página ya no es el meme editado
    else setTick((n) => n + 1)
  }
  const retry = () => setTick((n) => n + 1)

  return (
    <section className="container page">
      <h1 className="page__title">Crear meme</h1>
      <MemeNav />
      <p role="status" className={state.status === 'ready' ? 'meme-status' : 'visually-hidden'}>{message}</p>

      {state.status === 'loading' && <div className="reader__skeleton" aria-hidden="true" />}
      {state.status === 'empty' && <EmptyState title="No hay páginas disponibles" />}
      {state.status === 'error' && (
        <div className="empty-state">
          <p role="alert" className="h5 mb-0">No se pudo preparar el editor</p>
          <button type="button" className="btn btn-primary" onClick={retry}>Reintentar</button>
        </div>
      )}

      {state.status === 'ready' && (
        <div className="meme-editor">
          <div className="meme-editor__canvas">
            <p className="meme-editor__source">{page.name} · página {page.pageIndex + 1}</p>
            <div
              ref={stageRef}
              data-testid="meme-stage"
              className={`meme-stage${drawMode ? ' is-drawing' : ''}`}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
            >
              <canvas ref={canvasRef} className="meme-canvas" role="img" aria-label="Página del manga con el meme" />
              {bubbles.map((b, i) => (
                <span key={i} aria-hidden="true" className={`meme-box${i === sel ? ' is-selected' : ''}`}
                  style={{ left: `${b.x * 100}%`, top: `${b.y * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }} />
              ))}
              {draft && <span aria-hidden="true" className="meme-draft" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.w * 100}%`, height: `${draft.h * 100}%` }} />}
            </div>
          </div>

          <div className="meme-editor__panel">
            <div className="meme-bubbles" role="group" aria-label="Recuadros">
              {bubbles.map((_, i) => (
                <button key={i} type="button" className={`btn btn-sm ${i === sel ? 'btn-primary' : 'btn-outline-secondary'}`} aria-pressed={i === sel} onClick={() => setSel(i)}>Recuadro {i + 1}</button>
              ))}
              <button type="button" className={`btn btn-sm ${drawMode ? 'btn-primary' : 'btn-outline-secondary'}`} aria-pressed={drawMode} onClick={() => setDrawMode((d) => !d)}>Dibujar recuadro</button>
            </div>
            {drawMode && (
              <fieldset className="meme-manual">
                <legend className="h6">Recuadro manual</legend>
                <div className="meme-controls__row">
                  {[['x', 'X (%)'], ['y', 'Y (%)'], ['w', 'Ancho (%)'], ['h', 'Alto (%)']].map(([k, label]) => (
                    <div key={k}>
                      <label className="form-label" htmlFor={`meme-m-${k}`}>{label}</label>
                      <input id={`meme-m-${k}`} type="number" min={0} max={100} className="form-control" value={manual[k]} onChange={(e) => setManual({ ...manual, [k]: e.target.value })} aria-invalid={!manualOk} />
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-sm btn-primary mt-2" disabled={!manualOk} onClick={() => addBubble({ x: num('x') / 100, y: num('y') / 100, w: num('w') / 100, h: num('h') / 100 })}>Agregar recuadro</button>
              </fieldset>
            )}
            {sel !== null && bubbles[sel] && <FontColorControls value={bubbles[sel]} onChange={patchSel} />}
            <div className="page__actions">
              <button type="button" className="btn btn-primary" disabled={!valid || pending} onClick={save}>Guardar</button>
              <button type="button" className="btn btn-outline-secondary" onClick={exportPng}>Exportar PNG</button>
              <button type="button" className="btn btn-outline-secondary" onClick={another}>Otra página</button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
