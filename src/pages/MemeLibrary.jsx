import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import * as defaultApi from '../api/index.js'
import MemeNav from '../components/memes/MemeNav.jsx'
import ConfirmDialog from '../components/common/ConfirmDialog.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

export default function MemeLibrary({ api = defaultApi }) {
  const navigate = useNavigate()
  const [state, setState] = useState({ status: 'loading', memes: [], products: [] })
  const [message, setMessage] = useState('')
  const [toDelete, setToDelete] = useState(null)

  const load = useCallback(() => {
    setState((s) => ({ ...s, status: 'loading' }))
    Promise.all([api.listMyMemes(), api.listProducts()]).then(
      ([memes, products]) => setState({ status: 'ready', memes, products }),
      () => setState((s) => ({ ...s, status: 'error' })),
    )
  }, [api])
  useEffect(load, [load])

  const nameOf = (id) => state.products.find((p) => p.id === id)?.name ?? 'Manga'
  const remove = async (meme) => {
    setToDelete(null)
    try {
      await api.deleteMeme(meme.id)
      setState((s) => ({ ...s, memes: s.memes.filter((m) => m.id !== meme.id) }))
      setMessage('Meme borrado')
    } catch {
      setMessage('No se pudo borrar el meme')
    }
  }

  return (
    <section className="container page">
      <h1 className="page__title">Biblioteca de memes</h1>
      <MemeNav />
      <p role="status" className="visually-hidden">{message}</p>

      {state.status === 'loading' && <div className="reader__skeleton" role="status" aria-label="Cargando memes" />}
      {state.status === 'error' && (
        <div className="empty-state">
          <p role="alert" className="h5 mb-0">No se pudieron cargar tus memes</p>
          <button type="button" className="btn btn-primary" onClick={load}>Reintentar</button>
        </div>
      )}
      {state.status === 'ready' && state.memes.length === 0 && (
        <EmptyState title="Aún no tienes memes" action={<Link className="btn btn-primary" to="/memes/crear">Crear meme</Link>} />
      )}
      {state.status === 'ready' && state.memes.length > 0 && (
        <ul className="meme-list">
          {state.memes.map((m, i) => (
            <li key={m.id} className="meme-item">
              <div>
                <strong>{nameOf(m.productId)}</strong>
                <span className="meme-item__meta"> · página {m.pageIndex + 1}</span>
                <ul className="meme-item__texts">
                  {m.bubbles.filter((b) => b.text).map((b, j) => <li key={j}>{b.text}</li>)}
                </ul>
              </div>
              <div className="meme-item__actions">
                <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Editar meme ${i + 1}`} onClick={() => navigate('/memes/crear', { state: { meme: m } })}>Editar</button>
                <button type="button" className="btn btn-sm btn-outline-secondary" aria-label={`Borrar meme ${i + 1}`} onClick={() => setToDelete(m)}>Borrar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        show={Boolean(toDelete)}
        title="Eliminar meme"
        message="¿Eliminar este meme de tu biblioteca?"
        confirmLabel="Eliminar"
        onConfirm={() => remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
    </section>
  )
}
