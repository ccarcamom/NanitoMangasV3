import { Link } from 'react-router'
import LoginForm from '../components/forms/LoginForm.jsx'

export default function Login() {
  return (
    <LoginForm title="Ingresar">
      <p className="page__alt">¿Eres vendedor o administrador? <Link to="/ingresar/personal">Acceso de personal</Link></p>
      <p className="page__alt">¿No tienes cuenta? <Link to="/registro">Crea una cuenta</Link></p>
    </LoginForm>
  )
}
