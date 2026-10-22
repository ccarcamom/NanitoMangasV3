import { useState } from 'react'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../context/CartContext.jsx'
import { filterProducts, sortProducts } from '../lib/catalog.js'
import FilterBar from '../components/shop/FilterBar.jsx'
import ProductGrid from '../components/shop/ProductGrid.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

export default function Offers({ products: given }) {
  const stored = useProducts()
  const { add } = useCart()
  const [sort, setSort] = useState('name')
  const list = sortProducts(filterProducts(given ?? stored, { onlyOffers: true }).filter((p) => p.salePrice < p.price), sort)
  return (
    <section className="container page">
      <h1 className="page__title">Ofertas</h1>
      {list.length === 0 ? <EmptyState title="Por ahora no hay ofertas" text="Vuelve pronto, renovamos los descuentos seguido." /> : (
        <>
          <FilterBar genres={[]} sort={sort} onChange={(c) => setSort(c.sort ?? sort)} />
          <div className="page__grid"><ProductGrid products={list} onAdd={add} /></div>
        </>
      )}
    </section>
  )
}
