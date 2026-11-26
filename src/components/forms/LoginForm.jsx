import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../../context/AuthContext.jsx'
import { isValidEmail } from '../../lib/validators.js'
import FormField from './FormField.jsx'
import { bindFields } from './formHelpers.js'
import { useSubmitLock } from '../../hooks/useSubmitLock.js'

const validate = (v) => ({
  ...(!isValidEmail(v.email.trim()) && { email: 'Ingresa un correo válido.' }),
  ...(!v.password && { password: 'Ingresa tu contraseña.' }),
})

const STAFF = ['ADMIN', 'VENDEDOR']
const PANELS = { ADMIN: '/admin', VENDEDOR: '/vendedor' }

// Un solo formulario para los dos accesos: `staff` decide qué roles acepta y a dónde lleva.
export default function LoginForm({ staff = false, title, children }) {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const { pending: submitting, lock, unlock } = useSubmitLock()

  const home = (role) => PANELS[role] ?? '/cuenta'
  if (user && !submitting) return <Navigate to={home(user.role)} replace />

  const bind = bindFields(values, errors, setValues)

  const destination = (role) => {
    const from = location.state?.from?.pathname
    if (!PANELS[role]) return from ?? '/'
    return from?.startsWith(PANELS[role]) ? from : PANELS[role]
  }

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setFormError(null)
    if (Object.keys(found).length) return
    if (!lock()) return
    try {
      const { role } = await login(values.email, values.password)
      if (STAFF.includes(role) !== staff) {
        logout() // la cuenta es válida pero de otro acceso: no se deja sesión abierta
        setFormError(staff
          ? <>Esta cuenta es de cliente. Usa el <Link to="/ingresar">acceso de cliente</Link>.</>
          : <>Esta cuenta es de personal. Usa el <Link to="/ingresar/personal">acceso de personal</Link>.</>)
        unlock()
        return
      }
      navigate(destination(role), { replace: true })
    } catch (err) {
      setFormError(err.message === 'INVALID_CREDENTIALS' ? 'Correo o contraseña incorrectos' : 'No pudimos ingresar, intenta de nuevo')
      unlock()
    }
  }

  return (
    <section className="container page page--narrow">
      <h1 className="page__title">{title}</h1>
      <form onSubmit={submit} noValidate>
        {formError && <div className="alert-nm" role="alert"><p className="mb-0">{formError}</p></div>}
        <FormField label="Correo" type="email" autoComplete="email" {...bind('email')} />
        <FormField label="Contraseña" type="password" autoComplete="current-password" {...bind('password')} />
        <button type="submit" className="btn btn-primary" disabled={submitting}>Ingresar</button>
      </form>
      {children}
    </section>
  )
}
