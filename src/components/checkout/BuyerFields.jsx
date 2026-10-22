import FormField from '../forms/FormField.jsx'

export default function BuyerFields({ value, onChange, errors = {} }) {
  const bind = (k) => ({ id: `buyer-${k}`, value: value[k], error: errors[k], onChange: (e) => onChange({ ...value, [k]: e.target.value }) })
  return (
    <>
      <FormField label="Nombre" autoComplete="name" {...bind('name')} />
      <FormField label="Correo" type="email" autoComplete="email" {...bind('email')} />
      <FormField label="RUT" autoComplete="off" placeholder="12.345.678-5" {...bind('rut')} />
    </>
  )
}
