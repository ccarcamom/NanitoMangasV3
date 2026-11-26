import { Link, useSearchParams } from 'react-router'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../context/CartContext.jsx'
import { searchProducts } from '../lib/catalog.js'
import ProductGrid from '../components/shop/ProductGrid.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

export default function Search({ products: given }) {
  const { data: stored, loading, error } = useProducts()
  const { add } = useCart()
  const q = (useSearchParams()[0].get('q') ?? '').trim()
  const list = searchProducts(given ?? stored, q)
  const home = <Link className="btn btn-primary" to="/">Volver al inicio</Link>
  return (
    <section className="container page">
      {!q ? (
        <>
          <h1 className="page__title">Buscar</h1>
          <EmptyState title="Escribe algo para buscar" />
        </>
      ) : (
        <>
          <h1 className="page__title">Resultados para “{q}”</h1>
          {!given && loading ? (
            <EmptyState title="Cargando productos…" />
          ) : !given && error ? (
            <EmptyState title="No pudimos cargar los productos" />
          ) : list.length === 0 ? (
            <EmptyState title="No encontramos resultados" action={home} />
          ) : (
            <>
              <p className="text-secondary">{list.length} {list.length === 1 ? 'producto' : 'productos'}</p>
              <ProductGrid products={list} onAdd={add} />
            </>
          )}
        </>
      )}
    </section>
  )
}
