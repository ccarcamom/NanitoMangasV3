import { Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from '../../components/common/ProtectedRoute.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import * as data from '../../data/index.js'
import AdminLayout from './AdminLayout.jsx'
import AdminProducts from './AdminProducts.jsx'
import ProductForm from './ProductForm.jsx'
import AdminUsers from './AdminUsers.jsx'
import AdminOrders from './AdminOrders.jsx'

// `api` = products + users + orders functions; specs inject one over a fake storage.
export default function AdminRoutes({ api = data }) {
  return (
    <Routes>
      <Route element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<AdminProducts api={api} />} />
        <Route path="productos/nuevo" element={<ProductForm api={api} />} />
        <Route path="productos/:id" element={<ProductForm api={api} />} />
        <Route path="usuarios" element={<AdminUsers api={api} />} />
        <Route path="pedidos" element={<AdminOrders api={api} />} />
        <Route path="*" element={<EmptyState title="Sección no encontrada" />} />
      </Route>
    </Routes>
  )
}
