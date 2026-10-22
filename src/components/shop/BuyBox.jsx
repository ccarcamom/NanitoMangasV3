import { useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../../context/CartContext.jsx'
import QuantityInput from './QuantityInput.jsx'

export default function BuyBox({ product }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (product.stock === 0) return <p className="notice mb-0" role="status">Agotado</p>

  return (
    <div className="buy-box">
      <div className="buy-box__row">
        <QuantityInput value={qty} max={product.stock} onChange={(n) => { setQty(n); setAdded(false) }} />
        <button type="button" className="btn btn-primary" onClick={() => { add(product.id, qty); setAdded(true) }}>Añadir al carro</button>
      </div>
      {added && (
        <p className="buy-box__ok" role="status">
          Añadido al carro <Link to="/carro">Ver carro</Link>
        </p>
      )}
    </div>
  )
}
