import { useLayoutEffect, useState } from 'react'
import { Link } from 'react-router'
import { useCart } from '../context/CartContext.jsx'
import CartLine from '../components/shop/CartLine.jsx'
import CartSummary from '../components/shop/CartSummary.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

export default function Cart() {
  const { lines, missing, blocked, setQty, remove, totals } = useCart()
  const [method, setMethod] = useState('despacho')
  const [adjusted, setAdjusted] = useState([])

  // Líneas por sobre el stock se bajan al stock disponible (stock 0 no se puede ajustar). No hace bucle: tras el ajuste qty <= stock.
  useLayoutEffect(() => {
    const over = lines.filter((l) => l.product.stock > 0 && l.qty > l.product.stock)
    if (over.length === 0) return
    over.forEach((l) => setQty(l.product.id, l.product.stock))
    setAdjusted((ids) => [...new Set([...ids, ...over.map((l) => l.product.id)])])
  }, [lines, setQty])

  if (lines.length === 0 && missing.length === 0) {
    return (
      <section className="container page">
        <h1 className="page__title">Tu carro</h1>
        <EmptyState title="Tu carro está vacío" text="Agrega productos para verlos aquí." action={<Link className="btn btn-primary" to="/">Ver productos</Link>} />
      </section>
    )
  }

  return (
    <section className="container page">
      <h1 className="page__title">Tu carro</h1>
      {missing.length > 0 && (
        <div className="alert-nm" role="alert">
          <strong>Algunos productos ya no están disponibles</strong>
          <button type="button" className="btn btn-outline-dark btn-sm" aria-label="Quitar no disponibles" onClick={() => missing.forEach(remove)}>Quitar</button>
        </div>
      )}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <ul className="cart-lines">
            {lines.map(({ product, qty }) => (
              <CartLine key={product.id} product={product} qty={qty} onQty={(n) => setQty(product.id, n)} onRemove={() => remove(product.id)} adjusted={adjusted.includes(product.id)} />
            ))}
          </ul>
        </div>
        <div className="col-12 col-lg-4">
          {lines.length > 0 && <CartSummary totals={totals(method)} method={method} onMethod={setMethod} blocked={blocked} />}
        </div>
      </div>
    </section>
  )
}
