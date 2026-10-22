import { useRef } from 'react'
import { Link } from 'react-router'
import { ShoppingBag } from '@phosphor-icons/react'
import { useBounce } from '../../hooks/useBounce.js'

export default function CartButton({ count }) {
  const bag = useRef(null)
  useBounce(bag, count)
  return (
    <Link to="/carro" className="icon-btn cart-btn" aria-label={count > 0 ? `Carro, ${count} productos` : 'Carro vacío'}>
      <span ref={bag} className="cart-btn__bag"><ShoppingBag size={24} aria-hidden="true" /></span>
      {count > 0 && <span className="cart-badge" aria-hidden="true">{count}</span>}
    </Link>
  )
}
