import { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { isValidRut, normalizeRut } from '../../lib/validators.js'
import FormField from '../forms/FormField.jsx'
import AddressFields from '../forms/AddressFields.jsx'

const blank = { street: '', comuna: '', region: '' }

const validate = (v) => {
  const filled = Object.values(v.address).some((x) => x.trim())
  return {
    ...(!v.name.trim() && { name: 'Ingresa tu nombre.' }),
    ...(v.rut.trim() && !isValidRut(v.rut) && { rut: 'Ingresa un RUT válido.' }),
    ...(filled && !v.address.street.trim() && { street: 'Ingresa tu calle y número.' }),
    ...(filled && !v.address.region && { region: 'Selecciona una región.' }),
    ...(filled && !v.address.comuna && { comuna: 'Selecciona una comuna.' }),
  }
}

export default function ProfileForm() {
  const { user, updateProfile } = useAuth()
  const [values, setValues] = useState({ name: user.name, rut: user.rut ?? '', address: user.address ?? blank })
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  const edit = (patch) => { setValues({ ...values, ...patch }); setSaved(false) }

  const submit = (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setSaved(false)
    if (Object.keys(found).length) return
    const filled = Object.values(values.address).some((x) => x.trim())
    updateProfile({
      name: values.name.trim(),
      rut: values.rut.trim() ? normalizeRut(values.rut) : '',
      address: filled ? values.address : null,
    })
    setSaved(true)
  }

  return (
    <form onSubmit={submit} noValidate>
      {saved && <div className="notice" role="status">Cambios guardados</div>}
      <FormField id="name" label="Nombre" autoComplete="name" value={values.name} error={errors.name} onChange={(e) => edit({ name: e.target.value })} />
      <FormField id="rut" label="RUT" autoComplete="off" placeholder="12.345.678-5" value={values.rut} error={errors.rut} onChange={(e) => edit({ rut: e.target.value })} />
      <AddressFields idPrefix="profile" value={values.address} errors={errors} onChange={(address) => edit({ address })} />
      <button type="submit" className="btn btn-primary">Guardar cambios</button>
    </form>
  )
}
