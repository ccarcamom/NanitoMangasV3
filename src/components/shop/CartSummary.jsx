import { Link } from 'react-router'
import { formatCLP } from '../../lib/money.js'
import { METHODS, SHIPPING } from '../../lib/shipping.js'
import TotalsRows from './TotalsRows.jsx'

export default function CartSummary({ totals, method, onMethod, blocked }) {
  const left = SHIPPING.freeFrom - totals.subtotal
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
      <TotalsRows totals={totals} method={method} />
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
