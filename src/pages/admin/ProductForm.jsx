import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import * as data from '../../data/index.js'
import EmptyState from '../../components/common/EmptyState.jsx'
import { focusFirstError } from '../../components/forms/formHelpers.js'
import { useSubmitLock } from '../../hooks/useSubmitLock.js'
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

function Editor({ initial, id, api }) {
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
      navigate('/admin/productos', { state: { notice: 'Producto guardado' } })
    } catch {
      setFailure('No pudimos guardar el producto. Intenta de nuevo.')
      unlock()
    }
  }

  return (
    <form onSubmit={submit} noValidate className="admin__form">
      {failure && <div className="alert-nm" role="alert"><p className="mb-0">{failure}</p></div>}
      <ProductFormFields value={value} errors={errors} onChange={change} />
      <div className="page__actions">
        <button type="submit" className="btn btn-primary" disabled={saving}>Guardar producto</button>
        <Link to="/admin/productos" className="btn btn-outline-secondary">Cancelar</Link>
      </div>
    </form>
  )
}

// `api` = { createProduct, updateProduct, getProduct }; specs inject spies.
export default function ProductForm({ api = data }) {
  const { id } = useParams()
  const product = id ? api.getProduct(id) : null
  if (id && !product) {
    return (
      <section>
        <h1 className="page__title">Editar producto</h1>
        <EmptyState title="Producto no encontrado" action={<Link to="/admin/productos" className="btn btn-primary">Volver a productos</Link>} />
      </section>
    )
  }
  return (
    <section>
      <h1 className="page__title">{id ? 'Editar producto' : 'Nuevo producto'}</h1>
      <Editor key={id ?? 'new'} id={id} initial={product ? fromProduct(product) : BLANK} api={api} />
    </section>
  )
}
