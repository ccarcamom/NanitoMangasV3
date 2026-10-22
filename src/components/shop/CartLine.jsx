import { Link } from 'react-router'
import { Trash } from '@phosphor-icons/react'
import { formatCLP } from '../../lib/money.js'
import { unitPrice } from '../../lib/cartMath.js'
import QuantityInput from './QuantityInput.jsx'

export default function CartLine({ product, qty, onQty, onRemove, adjusted }) {
  const short = qty > product.stock
  return (
    <li className={`cart-line${short ? ' is-short' : ''}`}>
      <Link to={`/producto/${product.id}`}><img className="cart-line__img" src={product.image} alt={product.name} width="72" height="96" /></Link>
      <div className="cart-line__info">
        <small className="product-card__brand">{product.brand}</small>
        <Link to={`/producto/${product.id}`} className="cart-line__name">{product.name}</Link>
        <span className="cart-line__unit">{formatCLP(unitPrice(product))} c/u</span>
        {adjusted && !short && <span className="cart-line__note" role="status">Ajustamos la cantidad al stock disponible</span>}
        {short && <span className="cart-line__warn" role="alert">Sin stock suficiente</span>}
      </div>
      <QuantityInput value={qty} max={product.stock} onChange={onQty} />
      <strong className="cart-line__total text-price">{formatCLP(unitPrice(product) * qty)}</strong>
      <button type="button" className="btn btn-link cart-line__remove" aria-label={`Quitar ${product.name}`} onClick={onRemove}>
        <Trash size={18} aria-hidden="true" /> Quitar
      </button>
    </li>
  )
}
