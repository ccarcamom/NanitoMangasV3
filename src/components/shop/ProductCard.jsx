import { Link } from 'react-router'
import { formatCLP } from '../../lib/money.js'

export default function ProductCard({ product, onAdd }) {
  const { id, name, brand, price, salePrice, stock, image } = product
  const soldOut = stock === 0
  const to = `/producto/${id}`
  return (
    <article className={`product-card${soldOut ? ' is-sold-out' : ''}`}>
      <Link to={to} className="product-card__media">
        <img src={image} alt={name} width="600" height="800" loading="lazy" />
        {soldOut && <span className="product-card__badge">Agotado</span>}
      </Link>
      <small className="product-card__brand">{brand}</small>
      <h3 className="product-card__name"><Link to={to}>{name}</Link></h3>
      <p className="product-card__price">
        {salePrice != null ? (
          <>
            <span className="text-price">{formatCLP(salePrice)}</span>
            <s className="product-card__old">{formatCLP(price)}</s>
          </>
        ) : (
          <span className="text-price">{formatCLP(price)}</span>
        )}
      </p>
      {soldOut ? (
        <Link to={to} className="btn btn-outline-dark btn-sm">Ver detalles</Link>
      ) : (
        <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => onAdd(id)}>Añadir al carro</button>
      )}
    </article>
  )
}
