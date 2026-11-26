import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import * as defaultApi from '../api/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCLP } from '../lib/money.js'
import { formatDate } from '../lib/dates.js'
import TotalsRows from '../components/shop/TotalsRows.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Solo muestra el pedido del servidor: recargar nunca crea otro ni toca el stock.
export default function OrderSuccess({ getOrder = defaultApi.getOrder }) {
  const { orderId } = useParams()
  const { user, ready } = useAuth()
  const passed = useLocation().state?.order
  const [fetched, setFetched] = useState({ id: null, order: null })
  const order = passed?.id === orderId ? passed : fetched.id === orderId ? fetched.order : undefined

  // Orden: state de la navegación, getOrder (con sesión), y como respaldo el último pedido guardado si su id coincide.
  useEffect(() => {
    if (passed?.id === orderId || !ready) return undefined
    let live = true
    const saved = () => {
      try {
        const o = JSON.parse(sessionStorage.getItem('nm:last-order'))
        return o?.id === orderId ? o : null
      } catch { return null }
    }
    const lookup = user ? Promise.resolve().then(() => getOrder(orderId)).catch(() => null) : Promise.resolve(null)
    lookup.then((o) => live && setFetched({ id: orderId, order: o ?? saved() }))
    return () => { live = false }
  }, [orderId, passed, getOrder, user, ready])

  if (order === undefined) return null
  if (!order) {
    return (
      <section className="container page">
        <EmptyState title="Pedido no encontrado" action={<Link to="/" className="btn btn-primary">Seguir comprando</Link>} />
      </section>
    )
  }

  const { buyer, delivery } = order
  const address = delivery.address && `${delivery.address.street}, ${delivery.address.comuna}, ${delivery.address.region}`
  return (
    <section className="container page page--narrow">
      <h1 className="page__title">Compra exitosa</h1>
      <dl className="receipt__meta">
        <div><dt>Pedido</dt><dd>{order.id}</dd></div>
        <div><dt>Fecha</dt><dd>{formatDate(order.createdAt)}</dd></div>
        <div><dt>Comprador</dt><dd>{buyer.name}</dd></div>
        <div><dt>Correo</dt><dd>{order.email}</dd></div>
        <div>
          <dt>Entrega</dt>
          <dd>{delivery.method === 'retiro' ? 'Retiro en tienda' : `Despacho a domicilio: ${address}`}</dd>
        </div>
      </dl>
      <ul className="receipt__items" aria-label="Productos">
        {order.items.map((i) => (
          <li key={i.productId}>
            <span><span>{i.name}</span> <span className="line__qty">x {i.qty}</span></span>
            <strong>{formatCLP(i.unitPrice * i.qty)}</strong>
          </li>
        ))}
      </ul>
      <TotalsRows totals={order} />
      <div className="page__actions">
        <Link to="/" className="btn btn-primary">Seguir comprando</Link>
        {user && <Link to="/cuenta" className="btn btn-outline-secondary">Ver mis pedidos</Link>}
      </div>
    </section>
  )
}
