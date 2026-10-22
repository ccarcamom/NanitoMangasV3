import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { isValidEmail } from '../lib/validators.js'
import FormField from '../components/forms/FormField.jsx'

const validate = (v) => ({
  ...(!isValidEmail(v.email.trim()) && { email: 'Ingresa un correo válido.' }),
  ...(!v.password && { password: 'Ingresa tu contraseña.' }),
})

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const busy = useRef(false) // el estado llega tarde: el ref frena el doble clic

  if (user && !submitting) return <Navigate to="/cuenta" replace />

  const bind = (k) => ({ id: k, name: k, value: values[k], error: errors[k], onChange: (e) => setValues({ ...values, [k]: e.target.value }) })

  const submit = async (e) => {
    e.preventDefault()
    if (busy.current) return
    const found = validate(values)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) return
    busy.current = true
    setSubmitting(true)
    try {
      await login(values.email, values.password)
      navigate(location.state?.from?.pathname ?? '/', { replace: true })
    } catch (err) {
      setFormError(err.message === 'INVALID_CREDENTIALS' ? 'Correo o contraseña incorrectos' : 'No pudimos ingresar, intenta de nuevo')
      busy.current = false
      setSubmitting(false)
    }
  }

  return (
    <section className="container page page--narrow">
      <h1 className="page__title">Ingresar</h1>
      <form onSubmit={submit} noValidate>
        {formError && <div className="alert-nm" role="alert">{formError}</div>}
        <FormField label="Correo" type="email" autoComplete="email" {...bind('email')} />
        <FormField label="Contraseña" type="password" autoComplete="current-password" {...bind('password')} />
        <button type="submit" className="btn btn-primary" disabled={submitting}>Ingresar</button>
      </form>
      <p className="page__alt">¿No tienes cuenta? <Link to="/registro">Crea una cuenta</Link></p>
    </section>
  )
}
