import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import * as data from '../data/index.js'
import ProfileForm from '../components/account/ProfileForm.jsx'
import OrderList from '../components/account/OrderList.jsx'

// `ordersApi` = { listOrdersByUser }; specs inject one over a fake storage.
export default function Profile({ ordersApi = data }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  if (!user) return null // ProtectedRoute ya redirige; esto cubre el instante del cierre de sesión

  const orders = [...ordersApi.listOrdersByUser(user.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const exit = () => { logout(); navigate('/') }

  return (
    <section className="container page page--narrow">
      <h1 className="page__title">Mi cuenta</h1>
      <p className="text-secondary">{user.email}</p>
      {user.role === 'admin' && <p><Link to="/admin">Ir al panel de administración</Link></p>}
      <ProfileForm key={user.id} />
      <button type="button" className="btn btn-outline-secondary mt-3" onClick={exit}>Cerrar sesión</button>
      <h2 className="h4 page__section">Mis pedidos</h2>
      <OrderList orders={orders} />
    </section>
  )
}
