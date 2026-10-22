import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { isValidEmail, isValidPassword } from '../lib/validators.js'
import FormField from '../components/forms/FormField.jsx'

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
  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false)

  if (user && !submitting) return <Navigate to="/cuenta" replace />

  const bind = (k) => ({ id: k, name: k, value: values[k], error: errors[k], onChange: (e) => setValues({ ...values, [k]: e.target.value }) })

  const submit = async (e) => {
    e.preventDefault()
    if (busy.current) return
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length) return
    busy.current = true
    setSubmitting(true)
    try {
      await register({ name: values.name.trim(), email: values.email, password: values.password })
      navigate('/cuenta', { replace: true })
    } catch (err) {
      setErrors({ email: err.message === 'EMAIL_TAKEN' ? 'Este correo ya está registrado' : 'No pudimos crear la cuenta, intenta de nuevo' })
      busy.current = false
      setSubmitting(false)
    }
  }

  return (
    <section className="container page page--narrow">
      <h1 className="page__title">Crear cuenta</h1>
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
      <p className="page__alt">¿Ya tienes cuenta? <Link to="/ingresar">Ingresa</Link></p>
    </section>
  )
}
