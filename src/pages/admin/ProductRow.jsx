import { Link } from 'react-router'
import { PencilSimple, Trash } from '@phosphor-icons/react'
import { formatCLP } from '../../lib/money.js'
import { getCategory, PRODUCT_FLAGS } from '../../lib/catalog.js'

export default function ProductRow({ product: p, onDelete, base = '/admin' }) {
  const category = getCategory(p.categoryId)?.name ?? p.categoryId
  return (
    <tr>
      <td><img className="admin__thumb" src={p.image} alt="" width="48" height="48" /></td>
      <td>{p.name}</td>
      <td className="d-none d-lg-table-cell">{p.brand}</td>
      <td>{category}</td>
      <td>
        {p.salePrice != null
          ? <><s className="text-secondary">{formatCLP(p.price)}</s> <strong>{formatCLP(p.salePrice)}</strong></>
          : formatCLP(p.price)}
      </td>
      <td>{p.stock}</td>
      <td className="admin__flags-cell">{PRODUCT_FLAGS.filter(([k]) => p[k]).map(([k, label]) => <span key={k} className="admin__pill">{label}</span>)}</td>
      <td className="admin__actions">
        <Link to={`${base}/productos/${p.id}`} className="btn btn-outline-secondary btn-sm" aria-label={`Editar ${p.name}`} title="Editar">
          <PencilSimple size={16} aria-hidden="true" /> <span className="d-none d-xxl-inline">Editar</span>
        </Link>
        <button type="button" className="btn btn-outline-secondary btn-sm" aria-label={`Eliminar ${p.name}`} title="Eliminar" onClick={() => onDelete(p)}>
          <Trash size={16} aria-hidden="true" /> <span className="d-none d-xxl-inline">Eliminar</span>
        </button>
      </td>
    </tr>
  )
}
