import { useSyncExternalStore } from 'react'
import * as data from '../../data/index.js'
import { formatCLP } from '../../lib/money.js'
import { rowsOrEmpty } from './AdminTable.jsx'

// `api` = { subscribeOrders, listOrders }; specs inject one over a fake storage. Newest first.
export default function AdminOrders({ api = data }) {
  const orders = [...useSyncExternalStore(api.subscribeOrders, api.listOrders)].sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))
  return (
    <section>
      <h1 className="page__title">Pedidos</h1>
      {rowsOrEmpty(orders, 'Todavía no hay pedidos', 'Pedidos',
        ['Número', 'Fecha', 'Comprador', 'Entrega', 'Ítems', 'Total', 'Estado'],
        (o) => (
          <tr key={o.id}>
            <td><strong>{o.id}</strong></td>
            <td>{new Date(o.createdAt).toLocaleDateString('es-CL')}</td>
            <td>{o.buyer.name}<br /><span className="text-secondary">{o.email}</span></td>
            <td>{o.delivery.method === 'retiro' ? 'Retiro' : 'Despacho'}</td>
            <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
            <td>{formatCLP(o.total)}</td>
            <td className="text-capitalize">{o.status}</td>
          </tr>
        ))}
    </section>
  )
}
