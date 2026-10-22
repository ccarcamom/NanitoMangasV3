import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { Plus } from '@phosphor-icons/react'
import * as data from '../../data/index.js'
import { useProducts } from '../../hooks/useProducts.js'
import { normalizeText } from '../../lib/catalog.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx'
import ProductRow from './ProductRow.jsx'

// `api` = { subscribeProducts, getProductsSnapshot, deleteProduct }; specs inject one over a fake storage.
export default function AdminProducts({ api = data }) {
  const products = useProducts(api)
  const [query, setQuery] = useState('')
  const [target, setTarget] = useState(null)
  const [notice, setNotice] = useState(useLocation().state?.notice ?? null)

  const q = normalizeText(query)
  const shown = products.filter((p) => normalizeText(`${p.name} ${p.brand}`).includes(q))

  const confirmDelete = () => {
    api.deleteProduct(target.id)
    setNotice('Producto eliminado')
    setTarget(null)
  }

  return (
    <section>
      <div className="admin__head">
        <h1 className="page__title">Productos</h1>
        <Link to="/admin/productos/nuevo" className="btn btn-primary"><Plus size={18} aria-hidden="true" /> Nuevo producto</Link>
      </div>
      <p role="status" className="admin__notice" hidden={!notice}>{notice}</p>
      <input
        type="search" className="form-control admin__search" placeholder="Buscar por nombre o marca"
        aria-label="Buscar productos" value={query} onChange={(e) => setQuery(e.target.value)}
      />
      {shown.length === 0 ? (
        <EmptyState title="No hay productos" text="Prueba con otra búsqueda o crea uno nuevo." />
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
            <tbody>{shown.map((p) => <ProductRow key={p.id} product={p} onDelete={setTarget} />)}</tbody>
          </table>
        </div>
      )}
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
