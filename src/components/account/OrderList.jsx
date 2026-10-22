import { Link } from 'react-router'
import { formatCLP } from '../../lib/money.js'
import EmptyState from '../common/EmptyState.jsx'

export default function OrderList({ orders }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="Todavía no tienes pedidos"
        action={<Link to="/" className="btn btn-primary">Ver productos</Link>}
      />
    )
  }
  return (
    <ul className="orders">
      {orders.map((o) => (
        <li key={o.id} className="order">
          <div className="order__head">
            <strong className="order__id">{o.id}</strong>
            <span>{new Date(o.createdAt).toLocaleDateString('es-CL')}</span>
            <span className="order__status">{o.status}</span>
            <strong className="order__total">{formatCLP(o.total)}</strong>
          </div>
          <ul className="order__items">
            {o.items.map((i) => <li key={i.productId}>{i.qty} x {i.name}</li>)}
          </ul>
        </li>
      ))}
    </ul>
  )
}
