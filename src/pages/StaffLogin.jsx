import { Link } from 'react-router'
import LoginForm from '../components/forms/LoginForm.jsx'

export default function StaffLogin() {
  return (
    <LoginForm staff title="Acceso de personal">
      <p className="page__alt">¿Eres cliente? <Link to="/ingresar">Ingresar como cliente</Link></p>
      <p className="page__alt"><Link to="/registro?tipo=vendedor">Crear cuenta de vendedor</Link></p>
    </LoginForm>
  )
}
