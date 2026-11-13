import { formatCLP } from '../../lib/money.js'
import { unitPrice } from '../../lib/cartMath.js'
import TotalsRows from '../shop/TotalsRows.jsx'

export default function CheckoutSummary({ lines, totals, method, children }) {
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
      <TotalsRows totals={totals} method={method} />
      {children}
    </section>
  )
}
