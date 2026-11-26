import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import * as defaultApi from '../api/index.js'
import { newestFirst } from '../lib/dates.js'
import ProfileForm from '../components/account/ProfileForm.jsx'
import OrderList from '../components/account/OrderList.jsx'

// `ordersApi` = { listMyOrders }; specs inject a fake.
export default function Profile({ ordersApi = defaultApi }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState(null)
  const userId = user?.id
  useEffect(() => {
    if (!userId) return undefined
    let live = true
    ordersApi.listMyOrders().then((list) => live && setOrders([...list].sort(newestFirst)), () => live && setOrders([]))
    return () => { live = false }
  }, [ordersApi, userId])
  if (!user) return null // ProtectedRoute ya redirige; esto cubre el instante del cierre de sesión

  const exit = () => { logout(); navigate('/') }

  return (
    <section className="container page page--narrow">
      <h1 className="page__title">Mi cuenta</h1>
      <p className="text-secondary">{user.email}</p>
      {user.role === 'ADMIN' && <p><Link to="/admin">Ir al panel de administración</Link></p>}
      {user.role === 'VENDEDOR' && <p><Link to="/vendedor">Ir al panel de vendedor</Link></p>}
      <ProfileForm key={user.id} />
      <button type="button" className="btn btn-outline-secondary mt-3" onClick={exit}>Cerrar sesión</button>
      <h2 className="h4 page__section">Mis pedidos</h2>
      {orders && <OrderList orders={orders} />}
    </section>
  )
}
