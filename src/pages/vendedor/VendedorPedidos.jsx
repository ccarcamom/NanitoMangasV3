import * as defaultApi from '../../api/index.js'
import { useAsync } from '../../hooks/useAsync.js'
import { formatCLP } from '../../lib/money.js'
import { formatDate, newestFirst } from '../../lib/dates.js'
import { loadingOrError, rowsOrEmpty } from '../admin/AdminTable.jsx'

const sellerTotal = (items) => items.reduce((n, i) => n + i.unitPrice * i.qty, 0)

// `api` = { listSellerOrders }: el servidor ya deja solo los ítems del vendedor.
export default function VendedorPedidos({ api = defaultApi }) {
  const state = useAsync(api.listSellerOrders, api)
  const status = loadingOrError(state, 'los pedidos')
  return (
    <section>
      <h1 className="page__title">Pedidos</h1>
      {status ?? rowsOrEmpty([...state.data].sort(newestFirst), 'Todavía no hay pedidos', 'Pedidos',
        ['Número', 'Fecha', 'Entrega', 'Ítems', 'Total'],
        (o) => (
          <tr key={o.id}>
            <td><strong>{o.id}</strong></td>
            <td>{formatDate(o.createdAt)}</td>
            <td>{o.delivery.method === 'retiro' ? 'Retiro' : 'Despacho'}</td>
            <td><ul className="list-unstyled mb-0">{o.items.map((i) => <li key={i.productId}>{i.qty} x {i.name}</li>)}</ul></td>
            <td>{formatCLP(sellerTotal(o.items))}</td>
          </tr>
        ))}
    </section>
  )
}
