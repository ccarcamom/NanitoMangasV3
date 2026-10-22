import { luhnCheck, isValidExpiry, isValidCvv } from '../../lib/validators.js'
import FormField from './FormField.jsx'

const digits = (v, max) => v.replace(/\D/g, '').slice(0, max)
const groupNumber = (v) => digits(v, 19).replace(/(\d{4})(?=\d)/g, '$1 ')
const formatExpiry = (v) => {
  const d = digits(v, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export const validateCard = ({ number, expiry, cvv }) => ({
  ...(!luhnCheck(number) && { number: 'Ingresa un número de tarjeta válido.' }),
  ...(!isValidExpiry(expiry) && { expiry: 'Ingresa un vencimiento válido (MM/AA).' }),
  ...(!isValidCvv(cvv) && { cvv: 'Ingresa un CVV de 3 o 4 dígitos.' }),
})

// Los datos de la tarjeta viven solo en el estado del formulario que lo usa: nunca se guardan ni se registran.
export default function CardForm({ value, onChange, errors = {} }) {
  return (
    <>
      <FormField
        id="card-number" label="Número de tarjeta" inputMode="numeric" autoComplete="cc-number"
        placeholder="1234 5678 9012 3456" value={value.number} error={errors.number}
        onChange={(e) => onChange({ ...value, number: groupNumber(e.target.value) })}
      />
      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <FormField
            id="card-expiry" label="Vencimiento (MM/AA)" inputMode="numeric" autoComplete="cc-exp"
            placeholder="MM/AA" value={value.expiry} error={errors.expiry}
            onChange={(e) => onChange({ ...value, expiry: formatExpiry(e.target.value) })}
          />
        </div>
        <div className="col-12 col-sm-6">
          <FormField
            id="card-cvv" label="CVV" inputMode="numeric" autoComplete="cc-csc"
            value={value.cvv} error={errors.cvv}
            onChange={(e) => onChange({ ...value, cvv: digits(e.target.value, 4) })}
          />
        </div>
      </div>
    </>
  )
}
