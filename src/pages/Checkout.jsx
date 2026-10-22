import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { placeOrder } from '../data/index.js'
import { simulatePayment } from '../lib/payment.js'
import { formatCLP } from '../lib/money.js'
import { isValidEmail, isValidRut, normalizeRut } from '../lib/validators.js'
import EmptyState from '../components/common/EmptyState.jsx'
import AddressFields from '../components/forms/AddressFields.jsx'
import CardForm, { validateCard } from '../components/forms/CardForm.jsx'
import BuyerFields from '../components/checkout/BuyerFields.jsx'
import DeliveryOptions from '../components/checkout/DeliveryOptions.jsx'
import CheckoutSummary from '../components/checkout/CheckoutSummary.jsx'

const DEFAULT_DEPS = { placeOrder, simulatePayment }
const BLANK_ADDRESS = { street: '', comuna: '', region: '' }
// Orden visual de los campos: el primero con error recibe el foco.
const FIELD_IDS = {
  name: 'buyer-name', email: 'buyer-email', rut: 'buyer-rut',
  street: 'ship-street', region: 'ship-region', comuna: 'ship-comuna',
  number: 'card-number', expiry: 'card-expiry', cvv: 'card-cvv',
}
const GENERIC_ERROR = 'No pudimos completar la compra. Intenta de nuevo.'

const validate = ({ buyer, method, address, card }) => ({
  ...(!buyer.name.trim() && { name: 'Ingresa tu nombre.' }),
  ...(!isValidEmail(buyer.email.trim()) && { email: 'Ingresa un correo válido.' }),
  ...(!isValidRut(buyer.rut) && { rut: 'Ingresa un RUT válido.' }),
  ...(method === 'despacho' && !address.street.trim() && { street: 'Ingresa tu calle y número.' }),
  ...(method === 'despacho' && !address.region && { region: 'Selecciona una región.' }),
  ...(method === 'despacho' && !address.comuna && { comuna: 'Selecciona una comuna.' }),
  ...validateCard(card),
})

function CheckoutForm({ user, cart, deps }) {
  const navigate = useNavigate()
  const [buyer, setBuyer] = useState({ name: user?.name ?? '', email: user?.email ?? '', rut: user?.rut ?? '' })
  const [method, setMethod] = useState('despacho')
  const [address, setAddress] = useState(user?.address ?? BLANK_ADDRESS)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' }) // solo en memoria, nunca se persiste
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false)

  const { lines, missing } = cart
  const totals = cart.totals(method)
  const blocked = missing.length > 0 || lines.some((l) => l.product.stock === 0 || l.qty > l.product.stock)

  // Corregir un campo borra su error; el resto sigue visible hasta el próximo envío.
  const edit = (setter, prev) => (next) => {
    setter(next)
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => next[k] === prev[k])))
  }

  const release = (message) => {
    setFailure(message)
    busy.current = false
    setSubmitting(false)
  }

  const submit = async (e) => {
    e.preventDefault()
    if (busy.current || blocked) return
    const found = validate({ buyer, method, address, card })
    setErrors(found)
    setFailure(null)
    const first = Object.keys(FIELD_IDS).find((k) => found[k])
    if (first) {
      document.getElementById(FIELD_IDS[first])?.focus()
      return
    }
    busy.current = true
    setSubmitting(true)
    let payment
    try {
      payment = await deps.simulatePayment(card)
    } catch {
      return release(GENERIC_ERROR)
    }
    if (!payment.ok) {
      navigate('/pago-fallido', { state: { reason: payment.reason } })
      return
    }
    try {
      const order = deps.placeOrder({
        userId: user?.id ?? null,
        email: buyer.email.trim().toLowerCase(),
        buyer: { name: buyer.name.trim(), rut: normalizeRut(buyer.rut) },
        delivery: { method, address: method === 'despacho' ? { ...address, street: address.street.trim() } : null },
      })
      navigate(`/compra-exitosa/${order.id}`, { replace: true })
    } catch (err) {
      const [code, productId] = String(err?.message).split(':')
      // EMPTY_CART cae aquí: con el carro vacío el formulario se desmonta y se ve el estado vacío.
      if (code !== 'OUT_OF_STOCK') return release(GENERIC_ERROR)
      const name = lines.find((l) => l.product.id === productId)?.product.name ?? 'Un producto'
      release(`${name} ya no tiene stock suficiente. Revisa tu carro.`)
    }
  }

  return (
    <form onSubmit={submit} noValidate>
      {blocked && (
        <div className="alert-nm" role="alert">
          <p className="mb-0">Hay productos sin stock suficiente o que ya no están disponibles. Revisa tu carro antes de pagar.</p>
          <Link to="/carro">Ir al carro</Link>
        </div>
      )}
      {failure && (
        <div className="alert-nm" role="alert">
          <p className="mb-0">{failure}</p>
          {failure !== GENERIC_ERROR && <Link to="/carro">Ir al carro</Link>}
        </div>
      )}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <section className="checkout__section" aria-labelledby="checkout-buyer">
            <h2 id="checkout-buyer" className="h4">Datos del comprador</h2>
            <BuyerFields value={buyer} onChange={edit(setBuyer, buyer)} errors={errors} />
          </section>
          <section className="checkout__section" aria-labelledby="checkout-delivery">
            <h2 id="checkout-delivery" className="h4">Entrega</h2>
            <DeliveryOptions value={method} onChange={setMethod} />
            {method === 'despacho' && <AddressFields idPrefix="ship" value={address} onChange={edit(setAddress, address)} errors={errors} />}
          </section>
          <section className="checkout__section" aria-labelledby="checkout-payment">
            <h2 id="checkout-payment" className="h4">Pago</h2>
            <p className="checkout__note">Pago simulado: no se realiza ningún cobro real</p>
            <CardForm value={card} onChange={edit(setCard, card)} errors={errors} />
          </section>
        </div>
        <div className="col-12 col-lg-5">
          <CheckoutSummary lines={lines} totals={totals} method={method}>
            <button type="submit" className="btn btn-primary w-100" disabled={submitting || blocked}>
              {submitting ? 'Procesando…' : `Pagar ${formatCLP(totals.total)}`}
            </button>
          </CheckoutSummary>
        </div>
      </div>
    </form>
  )
}

// `deps` = { placeOrder, simulatePayment }; specs inject spies.
export default function Checkout({ deps = DEFAULT_DEPS }) {
  const cart = useCart()
  const { user, ready } = useAuth()
  if (!ready) return null
  const empty = cart.lines.length === 0 && cart.missing.length === 0
  return (
    <section className="container page">
      <h1 className="page__title">Pagar</h1>
      {empty
        ? <EmptyState title="Tu carro está vacío" text="Agrega productos para pagar." action={<Link className="btn btn-primary" to="/">Ver productos</Link>} />
        : <CheckoutForm key={user?.id ?? 'guest'} user={user} cart={cart} deps={deps} />}
    </section>
  )
}
