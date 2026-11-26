import * as defaultApi from '../../api/index.js'
import { useAsync } from '../../hooks/useAsync.js'
import { formatCLP } from '../../lib/money.js'
import { formatDate, newestFirst } from '../../lib/dates.js'
import { loadingOrError, rowsOrEmpty } from './AdminTable.jsx'

// `api` = { listOrders }; specs inject a fake. Newest first.
export default function AdminOrders({ api = defaultApi }) {
  const state = useAsync(api.listOrders, api)
  const status = loadingOrError(state, 'los pedidos')
  return (
    <section>
      <h1 className="page__title">Pedidos</h1>
      {status ?? rowsOrEmpty([...state.data].sort(newestFirst), 'Todavía no hay pedidos', 'Pedidos',
        ['Número', 'Fecha', 'Comprador', 'Entrega', 'Ítems', 'Total', 'Estado'],
        (o) => (
          <tr key={o.id}>
            <td><strong>{o.id}</strong></td>
            <td>{formatDate(o.createdAt)}</td>
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
