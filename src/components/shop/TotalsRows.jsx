import { formatCLP } from '../../lib/money.js'

// Subtotal, envío y total. Con `method` en "despacho", un envío de $0 se muestra como "Gratis".
export default function TotalsRows({ totals: { subtotal, shipping, total }, method }) {
  return (
    <dl className="cart-summary__rows">
      <div><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
      <div><dt>Envío</dt><dd>{method === 'despacho' && shipping === 0 ? 'Gratis' : formatCLP(shipping)}</dd></div>
      <div className="cart-summary__total"><dt>Total</dt><dd className="text-price">{formatCLP(total)}</dd></div>
    </dl>
  )
}
