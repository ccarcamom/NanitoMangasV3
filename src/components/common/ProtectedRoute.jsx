import { useRef } from 'react'
import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext.jsx'

// `roles` = lista permitida; `role` = un solo rol (compatibilidad).
export default function ProtectedRoute({ role, roles = role ? [role] : null, children }) {
  const { user, ready, signedOut } = useAuth()
  const hadUser = useRef(false) // una página fresca de invitado no es una salida voluntaria
  if (user) hadUser.current = true
  const location = useLocation()
  if (!ready) return null
  if (!user && signedOut && hadUser.current) return <Navigate to="/" replace />
  const staffOnly = roles && !roles.includes('CLIENTE')
  if (!user) return <Navigate to={staffOnly ? '/ingresar/personal' : '/ingresar'} replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
