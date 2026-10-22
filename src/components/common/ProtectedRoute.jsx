import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth()
  const location = useLocation()
  if (!ready) return null
  if (!user) return <Navigate to="/ingresar" replace state={{ from: location }} />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}
