import { formatCLP } from '../../lib/money.js'
import { unitPrice } from '../../lib/cartMath.js'

export default function CheckoutSummary({ lines, totals, method, children }) {
  const { subtotal, shipping, total } = totals
  return (
    <section className="cart-summary checkout-summary" aria-labelledby="checkout-summary-title">
      <h2 id="checkout-summary-title" className="h4">Tu pedido</h2>
      <ul className="checkout-summary__lines">
        {lines.map(({ product, qty }) => (
          <li key={product.id}>
            <span><span>{product.name}</span> <span className="line__qty">x {qty}</span></span>
            <strong>{formatCLP(unitPrice(product) * qty)}</strong>
          </li>
        ))}
      </ul>
      <dl className="cart-summary__rows">
        <div><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
        <div><dt>Envío</dt><dd>{method === 'despacho' && shipping === 0 ? 'Gratis' : formatCLP(shipping)}</dd></div>
        <div className="cart-summary__total"><dt>Total</dt><dd className="text-price">{formatCLP(total)}</dd></div>
      </dl>
      {children}
    </section>
  )
}
