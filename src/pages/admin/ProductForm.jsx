import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import * as defaultApi from '../../api/index.js'
import { useAsync } from '../../hooks/useAsync.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import { focusFirstError } from '../../components/forms/formHelpers.js'
import { useSubmitLock } from '../../hooks/useSubmitLock.js'
import { loadingOrError } from './AdminTable.jsx'
import { productFailure } from './apiErrors.js'
import ProductFormFields, { FIELD_IDS } from './ProductFormFields.jsx'

const BLANK = {
  name: '', brand: '', categoryId: '', genre: '', price: '', salePrice: '', stock: '', image: '', description: '',
  isNew: false, isBestSeller: false, isRestock: false,
}
const INT = /^\d+$/ // strict: rejects '', 'abc', '10.5', '-1', '1e3'

const fromProduct = (p) => ({
  ...BLANK, ...p, genre: p.genre ?? '', price: String(p.price), stock: String(p.stock),
  salePrice: p.salePrice == null ? '' : String(p.salePrice),
})

const validate = (v) => {
  const price = INT.test(v.price.trim()) ? Number(v.price) : NaN
  const sale = v.salePrice.trim()
  return {
    ...(!v.name.trim() && { name: 'Ingresa el nombre.' }),
    ...(!v.brand.trim() && { brand: 'Ingresa la marca.' }),
    ...(!v.categoryId && { categoryId: 'Selecciona una categoría.' }),
    ...(v.categoryId === 'mangas' && !v.genre && { genre: 'Selecciona un género.' }),
    ...(!(price > 0) && { price: 'Ingresa un precio entero mayor a 0.' }),
    ...(sale && (!INT.test(sale) || Number(sale) <= 0
      ? { salePrice: 'Ingresa una oferta entera mayor a 0.' }
      : price > 0 && Number(sale) >= price && { salePrice: 'La oferta debe ser menor que el precio.' })),
    ...(!INT.test(v.stock.trim()) && { stock: 'Ingresa un stock entero de 0 o más.' }),
    ...(!/^(https?:\/\/|\/)/.test(v.image.trim()) && { image: 'Ingresa una URL que empiece con http://, https:// o /.' }),
  }
}

function Editor({ initial, id, api, base }) {
  const navigate = useNavigate()
  const [value, setValue] = useState(initial)
  const [errors, setErrors] = useState({})
  const [failure, setFailure] = useState(null)
  const { pending: saving, lock, unlock } = useSubmitLock()

  const change = (patch) => {
    setValue((v) => ({ ...v, ...patch }))
    setErrors((e) => Object.fromEntries(Object.entries(e).filter(([k]) => !(k in patch) && !(k === 'genre' && 'categoryId' in patch))))
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(value)
    setErrors(found)
    if (focusFirstError(found, FIELD_IDS)) return
    const input = {
      name: value.name.trim(), brand: value.brand.trim(), categoryId: value.categoryId,
      genre: value.categoryId === 'mangas' ? value.genre : null,
      price: Number(value.price), salePrice: value.salePrice.trim() ? Number(value.salePrice) : null,
      stock: Number(value.stock), image: value.image.trim(), description: value.description.trim(),
      isNew: value.isNew, isBestSeller: value.isBestSeller, isRestock: value.isRestock,
    }
    if (!lock()) return
    setFailure(null)
    try {
      await (id ? api.updateProduct(id, input) : api.createProduct(input))
      navigate(`${base}/productos`, { state: { notice: 'Producto guardado' } })
    } catch (err) {
      setFailure(productFailure(err, 'No pudimos guardar el producto. Intenta de nuevo.'))
      unlock()
    }
  }

  return (
    <form onSubmit={submit} noValidate className="admin__form">
      {failure && <div className="alert-nm" role="alert"><p className="mb-0">{failure}</p></div>}
      <ProductFormFields value={value} errors={errors} onChange={change} />
      <div className="page__actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>Guardar producto</button>
        <Link to={`${base}/productos`} className="btn btn-outline-secondary">Cancelar</Link>
      </div>
    </form>
  )
}

function EditProduct({ id, api, base }) {
  const state = useAsync(() => api.getProduct(id), id)
  const status = state.error?.status === 404 ? null : loadingOrError(state, 'el producto')
  return (
    <section>
      <h1 className="page__title">Editar producto</h1>
      {status ?? (state.data
        ? <Editor key={id} id={id} initial={fromProduct(state.data)} api={api} base={base} />
        : <EmptyState title="Producto no encontrado" action={<Link to={`${base}/productos`} className="btn btn-primary">Volver a productos</Link>} />)}
    </section>
  )
}

// `api` = { createProduct, updateProduct, getProduct }; `base` = prefijo de las rutas; specs inject spies.
export default function ProductForm({ api = defaultApi, base = '/admin' }) {
  const { id } = useParams()
  if (id) return <EditProduct id={id} api={api} base={base} />
  return (
    <section>
      <h1 className="page__title">Nuevo producto</h1>
      <Editor key="new" initial={BLANK} api={api} base={base} />
    </section>
  )
}
