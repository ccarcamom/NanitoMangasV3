import { METHODS } from '../shop/CartSummary.jsx'

export default function DeliveryOptions({ value, onChange }) {
  return (
    <div className="delivery-options" role="radiogroup" aria-label="Método de entrega">
      {METHODS.map(([method, label]) => (
        <label key={method} className={`delivery-option${value === method ? ' is-active' : ''}`}>
          <input type="radio" name="delivery" value={method} checked={value === method} onChange={() => onChange(method)} /> {label}
        </label>
      ))}
    </div>
  )
}
