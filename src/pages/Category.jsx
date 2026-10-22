import { Link, useParams, useSearchParams } from 'react-router'
import { categories as seedCategories } from '../data/seed.js'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../context/CartContext.jsx'
import { filterProducts, sortProducts } from '../lib/catalog.js'
import FilterBar from '../components/shop/FilterBar.jsx'
import ProductGrid from '../components/shop/ProductGrid.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

export default function Category({ products: given, categories = seedCategories, onlyNew = false }) {
  const stored = useProducts()
  const { add } = useCart()
  const { categoryId } = useParams()
  const [params, setParams] = useSearchParams()
  const category = categories.find((c) => c.id === categoryId)

  if (!onlyNew && !category) {
    return (
      <section className="container page">
        <h1 className="page__title">Categoría no encontrada</h1>
        <EmptyState title="Categoría no encontrada" text="Esa sección no existe." action={<Link className="btn btn-primary" to="/">Volver al inicio</Link>} />
      </section>
    )
  }

  const genres = category?.genres ?? []
  const genre = genres.some((g) => g.id === params.get('genero')) ? params.get('genero') : null
  const sort = params.get('orden') ?? 'name'
  const list = sortProducts(filterProducts(given ?? stored, onlyNew ? { onlyNew: true } : { categoryId, genre }), sort)
  const change = ({ genre: g, sort: s }) => {
    const next = new URLSearchParams(params)
    const set = (k, v) => (v ? next.set(k, v) : next.delete(k))
    if (g !== undefined) set('genero', g)
    if (s !== undefined) set('orden', s)
    setParams(next)
  }

  return (
    <section className="container page">
      <h1 className="page__title">{onlyNew ? 'Novedades' : category.name}</h1>
      <FilterBar genres={genres} sort={sort} genre={genre} onChange={change} />
      <div className="page__grid">
        {list.length === 0 && genre ? (
          <EmptyState title="No hay productos con ese filtro" action={<button type="button" className="btn btn-primary" onClick={() => change({ genre: null })}>Quitar filtros</button>} />
        ) : <ProductGrid products={list} onAdd={add} />}
      </div>
    </section>
  )
}
