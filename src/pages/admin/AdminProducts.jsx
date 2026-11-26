import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Plus } from '@phosphor-icons/react'
import * as defaultApi from '../../api/index.js'
import { useAsync } from '../../hooks/useAsync.js'
import { normalizeText } from '../../lib/catalog.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import { loadingOrError } from './AdminTable.jsx'
import { productFailure } from './apiErrors.js'
import ProductRow from './ProductRow.jsx'

// `api` = { listProducts | listMyProducts, deleteProduct }; `mine` = solo los del vendedor; `base` = prefijo de las rutas.
export default function AdminProducts({ api = defaultApi, base = '/admin', mine = false }) {
  const state = useAsync(mine ? api.listMyProducts : api.listProducts, api)
  const [failure, setFailure] = useState(null)
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState(null)
  const [notice, setNotice] = useState(useLocation().state?.notice ?? null)

  const q = normalizeText(query)
  const status = loadingOrError(state, 'los productos')
  const shown = (state.data ?? []).filter((p) => normalizeText(`${p.name} ${p.brand}`).includes(q))

  const confirmDelete = async () => {
    const { id } = target
    setTarget(null)
    setFailure(null)
    try {
      await api.deleteProduct(id)
      state.setData(state.data.filter((p) => p.id !== id))
      setNotice('Producto eliminado')
    } catch (err) {
      setFailure(productFailure(err, 'No pudimos eliminar el producto'))
    }
  }

  return (
    <section>
      <div className="admin__head">
        <h1 className="page__title">Productos</h1>
        <Link to={`${base}/productos/nuevo`} className="btn btn-primary"><Plus size={18} aria-hidden="true" /> Nuevo producto</Link>
      </div>
      {failure && <div className="alert-nm" role="alert"><p className="mb-0">{failure}</p></div>}
      <p role="status" className="admin__notice" hidden={!notice}>{notice}</p>
      <input
        type="search" className="form-control admin__search" placeholder="Buscar por nombre o marca"
        aria-label="Buscar productos" value={query} onChange={(e) => setQuery(e.target.value)}
      />
      {status ?? (shown.length === 0 ? (
        <EmptyState title="No hay productos" />
      ) : (
        <div className="table-responsive">
          <table className="table align-middle admin__table" aria-label="Productos">
            <thead>
              <tr>
                <th scope="col"><span className="visually-hidden">Imagen</span></th>
                <th scope="col">Nombre</th><th scope="col" className="d-none d-lg-table-cell">Marca</th><th scope="col">Categoría</th>
                <th scope="col">Precio</th><th scope="col">Stock</th><th scope="col">Marcas</th>
                <th scope="col"><span className="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>{shown.map((p) => <ProductRow key={p.id} product={p} base={base} onDelete={setTarget} />)}</tbody>
          </table>
        </div>
      ))}
      <ConfirmDialog
        show={target !== null}
        title="Eliminar producto"
        message={target && `¿Eliminar ${target.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        onConfirm={confirmDelete}
        onCancel={() => setTarget(null)}
      />
    </section>
  )
}
