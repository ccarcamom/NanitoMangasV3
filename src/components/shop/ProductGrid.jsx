import EmptyState from '../common/EmptyState.jsx'
import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products, onAdd }) {
  if (products.length === 0) {
    return <EmptyState title="No encontramos productos" />
  }
  return (
    <div className="row g-3 g-lg-4">
      {products.map((p) => (
        <div key={p.id} className="col-6 col-md-4 col-lg-3">
          <ProductCard product={p} onAdd={onAdd} />
        </div>
      ))}
    </div>
  )
}
