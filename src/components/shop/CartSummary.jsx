import { Link } from 'react-router'
import { formatCLP } from '../../lib/money.js'
import { SHIPPING } from '../../lib/shipping.js'

export const METHODS = [['despacho', 'Despacho a domicilio'], ['retiro', 'Retiro en tienda']]

export default function CartSummary({ totals, method, onMethod, blocked }) {
  const { subtotal, shipping, total } = totals
  const left = SHIPPING.freeFrom - subtotal
  return (
    <section className="cart-summary" aria-labelledby="summary-title">
      <h2 id="summary-title" className="h4">Resumen</h2>
      <fieldset className="cart-summary__methods">
        <legend className="visually-hidden">Método de entrega</legend>
        {METHODS.map(([value, label]) => (
          <label key={value} className="cart-summary__method">
            <input type="radio" name="method" value={value} checked={method === value} onChange={() => onMethod(value)} /> {label}
          </label>
        ))}
      </fieldset>
      <dl className="cart-summary__rows">
        <div><dt>Subtotal</dt><dd>{formatCLP(subtotal)}</dd></div>
        <div><dt>Envío</dt><dd>{method === 'despacho' && shipping === 0 ? 'Gratis' : formatCLP(shipping)}</dd></div>
        <div className="cart-summary__total"><dt>Total</dt><dd className="text-price">{formatCLP(total)}</dd></div>
      </dl>
      {method === 'despacho' && left > 0 && <p className="cart-summary__hint">Te faltan {formatCLP(left)} para envío gratis</p>}
      <Link
        to="/checkout"
        className={`btn btn-primary w-100${blocked ? ' disabled' : ''}`}
        aria-disabled={blocked || undefined}
        tabIndex={blocked ? -1 : undefined}
        onClick={(e) => blocked && e.preventDefault()}
      >Ir a pagar</Link>
    </section>
  )
}
