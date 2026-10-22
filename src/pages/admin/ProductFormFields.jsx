import FormField from '../../components/forms/FormField.jsx'
import { categories } from '../../data/seed.js'

export const FIELD_IDS = {
  name: 'pf-name', brand: 'pf-brand', categoryId: 'pf-category', genre: 'pf-genre',
  price: 'pf-price', salePrice: 'pf-sale', stock: 'pf-stock', image: 'pf-image',
}
const CHECKS = [['isNew', 'Nuevo'], ['isBestSeller', 'Más vendido'], ['isRestock', 'Reingreso']]

export default function ProductFormFields({ value: v, errors, onChange }) {
  const set = (key) => (e) => onChange({ [key]: e.target.value })
  const genres = categories.find((c) => c.id === v.categoryId)?.genres ?? []
  const text = (key, label, extra = {}) => (
    <FormField id={FIELD_IDS[key]} label={label} value={v[key]} onChange={set(key)} error={errors[key]} {...extra} />
  )
  return (
    <>
      {text('name', 'Nombre', { autoComplete: 'off' })}
      {text('brand', 'Marca', { autoComplete: 'off' })}
      <FormField id={FIELD_IDS.categoryId} label="Categoría" as="select" value={v.categoryId} error={errors.categoryId}
        onChange={(e) => onChange({ categoryId: e.target.value, genre: '' })}>
        <option value="">Selecciona una categoría</option>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </FormField>
      {genres.length > 0 && (
        <FormField id={FIELD_IDS.genre} label="Género" as="select" value={v.genre} error={errors.genre} onChange={set('genre')}>
          <option value="">Selecciona un género</option>
          {genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </FormField>
      )}
      {text('price', 'Precio', { inputMode: 'numeric' })}
      {text('salePrice', 'Precio de oferta (opcional)', { inputMode: 'numeric' })}
      {text('stock', 'Stock', { inputMode: 'numeric' })}
      {text('image', 'Imagen (URL)', { inputMode: 'url' })}
      <FormField id="pf-description" label="Descripción (opcional)" as="textarea" rows={4} value={v.description} onChange={set('description')} />
      <fieldset className="admin__flags">
        <legend className="form-label">Marcas</legend>
        {CHECKS.map(([key, label]) => (
          <div className="form-check form-check-inline" key={key}>
            <input id={`pf-${key}`} type="checkbox" className="form-check-input" checked={v[key]} onChange={(e) => onChange({ [key]: e.target.checked })} />
            <label htmlFor={`pf-${key}`} className="form-check-label">{label}</label>
          </div>
        ))}
      </fieldset>
    </>
  )
}
