import { regions } from '../../lib/regions.js'
import FormField from './FormField.jsx'

// value.region / value.comuna hold the visible names (what orders store).
export default function AddressFields({ value, onChange, errors = {}, idPrefix = 'addr' }) {
  const comunas = regions.find((r) => r.name === value.region)?.comunas ?? []
  return (
    <>
      <FormField
        id={`${idPrefix}-street`} label="Calle y número" autoComplete="street-address"
        value={value.street} error={errors.street}
        onChange={(e) => onChange({ ...value, street: e.target.value })}
      />
      <FormField
        id={`${idPrefix}-region`} label="Región" as="select" autoComplete="address-level1"
        value={value.region} error={errors.region}
        onChange={(e) => onChange({ ...value, region: e.target.value, comuna: '' })}
      >
        <option value="">Selecciona una región</option>
        {regions.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
      </FormField>
      <FormField
        id={`${idPrefix}-comuna`} label="Comuna" as="select" autoComplete="address-level2"
        value={value.comuna} error={errors.comuna} disabled={!value.region}
        onChange={(e) => onChange({ ...value, comuna: e.target.value })}
      >
        <option value="">Selecciona una comuna</option>
        {comunas.map((c) => <option key={c} value={c}>{c}</option>)}
      </FormField>
    </>
  )
}
