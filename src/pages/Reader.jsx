import { Link, useParams } from 'react-router'
import { ComicViewer } from 'react-comic-viewer'
import { useProducts } from '../hooks/useProducts.js'
import { useMangaPreview } from '../hooks/useMangaPreview.js'
import { getCategory } from '../lib/catalog.js'
import { languageName } from '../lib/mangadex.js'
import EmptyState from '../components/common/EmptyState.jsx'

// El visor trae sus textos en inglés.
const VIEWER_TEXT = {
  expansion: 'Expandir', normal: 'Normal', fullScreen: 'Pantalla completa', move: 'Mover', thumbnails: 'Miniaturas',
  nextPage: 'Página siguiente', prevPage: 'Página anterior', centerAction: 'Mostrar controles',
  exitFullScreen: 'Salir de pantalla completa', close: 'Cerrar', pageSlider: 'Página',
}

function Preview({ product }) {
  const [state, retry, select] = useMangaPreview(product.name)
  const category = getCategory(product.categoryId)
  const productPath = `/producto/${product.id}`

  return (
    <section className="container page">
      <nav aria-label="Migas de pan" className="crumbs">
        <Link to="/">Inicio</Link>
        {category && <><span aria-hidden="true">/</span><Link to={`/categoria/${category.id}`}>{category.name}</Link></>}
        <span aria-hidden="true">/</span>
        <Link to={productPath}>{product.name}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Avance</span>
      </nav>
      <h1 className="page__title">{product.name}</h1>

      {state.languages?.length > 1 && (
        <label className="reader__languages">
          <span className="visually-hidden">Idioma</span>
          <select className="form-select" value={state.language ?? ''} onChange={(e) => select(e.target.value)}>
            {state.languages.map((code) => <option key={code} value={code}>{languageName(code)}</option>)}
          </select>
        </label>
      )}

      {state.status === 'loading' && <div className="reader__skeleton" role="status" aria-label="Cargando avance" />}

      {state.status === 'ready' && (
        <>
          <div className="reader__stage">
            <ComicViewer pages={state.data.pages} direction="rtl" text={VIEWER_TEXT} />
          </div>
        </>
      )}

      {state.status === 'empty' && (
        <EmptyState
          title="Este manga no tiene avance disponible"
          action={<Link className="btn btn-primary" to={productPath}>Volver al producto</Link>}
        />
      )}

      {state.status === 'error' && (
        <EmptyState
          title="No pudimos cargar el avance"
          action={<button type="button" className="btn btn-primary" onClick={retry}>Reintentar</button>}
        />
      )}
    </section>
  )
}

export default function Reader({ products: given }) {
  const { data: stored, loading } = useProducts()
  const { id } = useParams()
  const product = (given ?? stored).find((p) => p.id === id)

  if (!product && !given && loading) return <section className="container page"><EmptyState title="Cargando producto…" /></section>

  if (!product) {
    return (
      <section className="container page">
        <h1 className="page__title">Producto no encontrado</h1>
        <EmptyState title="Ese producto no existe o ya no está a la venta." action={<Link className="btn btn-primary" to="/">Ir a la tienda</Link>} />
      </section>
    )
  }
  return <Preview key={id} product={product} />
}
