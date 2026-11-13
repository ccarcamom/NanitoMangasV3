import FormField from '../forms/FormField.jsx'
import { bindFields } from '../forms/formHelpers.js'

export default function BuyerFields({ value, onChange, errors = {} }) {
  const bind = bindFields(value, errors, onChange, 'buyer-')
  return (
    <>
      <FormField label="Nombre" autoComplete="name" {...bind('name')} />
      <FormField label="Correo" type="email" autoComplete="email" {...bind('email')} />
      <FormField label="RUT" autoComplete="off" placeholder="12.345.678-5" {...bind('rut')} />
    </>
  )
}
