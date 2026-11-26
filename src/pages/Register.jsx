import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { isValidEmail, isValidPassword } from '../lib/validators.js'
import FormField from '../components/forms/FormField.jsx'
import { bindFields } from '../components/forms/formHelpers.js'
import { useSubmitLock } from '../hooks/useSubmitLock.js'

const PASSWORD_RULE = 'La contraseña debe tener al menos 8 caracteres, una letra y un número.'
const validate = (v) => ({
  ...(!v.name.trim() && { name: 'Ingresa tu nombre.' }),
  ...(!isValidEmail(v.email.trim()) && { email: 'Ingresa un correo válido.' }),
  ...(!isValidPassword(v.password) && { password: PASSWORD_RULE }),
  ...(v.confirm !== v.password && { confirm: 'Las contraseñas no coinciden.' }),
})

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const seller = useSearchParams()[0].get('tipo') === 'vendedor'
  const role = seller ? 'VENDEDOR' : 'CLIENTE'
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const { pending: submitting, lock, unlock } = useSubmitLock()

  if (user && !submitting) return <Navigate to={seller ? '/vendedor' : '/cuenta'} replace />

  const bind = bindFields(values, errors, setValues)

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return
    if (!lock()) return
    try {
      await register({ name: values.name.trim(), email: values.email, password: values.password, role })
      navigate(seller ? '/vendedor' : '/cuenta', { replace: true })
    } catch (err) {
      setErrors({ email: err.message === 'EMAIL_TAKEN' ? 'Este correo ya está registrado' : 'No pudimos crear la cuenta, intenta de nuevo' })
      unlock()
    }
  }

  return (
    <section className="container page page--narrow">
      <h1 className="page__title">{seller ? 'Crear cuenta de vendedor' : 'Crear cuenta'}</h1>
      <form onSubmit={submit} noValidate>
        <FormField label="Nombre" autoComplete="name" {...bind('name')} />
        <FormField label="Correo" type="email" autoComplete="email" {...bind('email')} />
        <FormField
          label="Contraseña" type="password" autoComplete="new-password"
          {...bind('password')} {...(!errors.password && { 'aria-describedby': 'password-hint' })}
        />
        {!errors.password && <p id="password-hint" className="form-field__hint">{PASSWORD_RULE}</p>}
        <FormField label="Confirmar contraseña" type="password" autoComplete="new-password" {...bind('confirm')} />
        <button type="submit" className="btn btn-primary" disabled={submitting}>Crear cuenta</button>
      </form>
      <p className="page__alt">¿Ya tienes cuenta? <Link to={seller ? '/ingresar/personal' : '/ingresar'}>Ingresa</Link></p>
    </section>
  )
}
