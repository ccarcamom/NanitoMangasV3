import { Link, useParams } from 'react-router'
import * as data from '../data/index.js'
import { useAuth } from '../context/AuthContext.jsx'
import { formatCLP } from '../lib/money.js'
import { formatDate } from '../lib/dates.js'
import TotalsRows from '../components/shop/TotalsRows.jsx'
import EmptyState from '../components/common/EmptyState.jsx'

// Solo lee el pedido guardado: recargar nunca crea otro ni toca el stock.
export default function OrderSuccess({ getOrder = data.getOrder }) {
  const { orderId } = useParams()
  const { user } = useAuth()
  const order = getOrder(orderId)

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
      <div className="notice" role="status">Pago simulado: no se realizó ningún cobro real.</div>
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
