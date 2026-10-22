import { Link, useParams } from 'react-router'
import { categories } from '../data/seed.js'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../context/CartContext.jsx'
import { formatCLP } from '../lib/money.js'
import BuyBox from '../components/shop/BuyBox.jsx'
import ProductGrid from '../components/shop/ProductGrid.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

const stockLabel = (n) => (n === 0 ? 'Agotado' : n <= 5 ? `Quedan ${n} ${n === 1 ? 'unidad' : 'unidades'}` : 'Disponible')

export default function ProductDetail({ products: given }) {
  const stored = useProducts()
  const { add } = useCart()
  const { id } = useParams()
  const all = given ?? stored
  const product = all.find((p) => p.id === id)

  if (!product) {
    return (
      <section className="container page">
        <h1 className="page__title">Producto no encontrado</h1>
        <EmptyState title="Producto no encontrado" text="Ese producto no existe o ya no está a la venta." action={<Link className="btn btn-primary" to="/">Ir a la tienda</Link>} />
      </section>
    )
  }

  const { name, brand, price, salePrice, stock, image, description, categoryId, genre } = product
  const category = categories.find((c) => c.id === categoryId)
  const genreName = category?.genres.find((g) => g.id === genre)?.name
  const related = all.filter((p) => p.categoryId === categoryId && p.id !== id).slice(0, 4)

  return (
    <section className="container page">
      <nav aria-label="Migas de pan" className="crumbs">
        <Link to="/">Inicio</Link>
        {category && <><span aria-hidden="true">/</span><Link to={`/categoria/${category.id}`}>{category.name}</Link></>}
        <span aria-hidden="true">/</span>
        <span aria-current="page">{name}</span>
      </nav>
      <div className="row g-4 g-lg-5">
        <div className="col-12 col-md-5">
          <img className="detail__img" src={image} alt={name} width="600" height="800" />
        </div>
        <div className="col-12 col-md-7 detail__info">
          <small className="detail__brand">{brand}</small>
          <h1 className="page__title mb-0">{name}</h1>
          {category && <p className="detail__meta">{genreName ? `${category.name} · ${genreName}` : category.name}</p>}
          <p className="detail__price">
            <span className="text-price">{formatCLP(salePrice ?? price)}</span>
            {salePrice != null && (
              <>
                <s className="product-card__old">{formatCLP(price)}</s>
                <span className="detail__pill">-{Math.round((1 - salePrice / price) * 100)}%</span>
              </>
            )}
          </p>
          <p className={`detail__stock${stock <= 5 ? ' is-low' : ''}`}>{stockLabel(stock)}</p>
          <p>{description}</p>
          <BuyBox key={id} product={product} />
        </div>
      </div>
      {related.length > 0 && (
        <section className="detail__related" aria-labelledby="related-title">
          <h2 id="related-title" className="h3">Productos relacionados</h2>
          <ProductGrid products={related} onAdd={add} />
        </section>
      )}
    </section>
  )
}
