import { Navigate, Route, Routes } from 'react-router'
import ProtectedRoute from '../../components/common/ProtectedRoute.jsx'
import EmptyState from '../../components/common/EmptyState.jsx'
import * as defaultApi from '../../api/index.js'
import VendedorLayout from './VendedorLayout.jsx'
import VendedorProductos from './VendedorProductos.jsx'
import VendedorPedidos from './VendedorPedidos.jsx'
import ProductForm from '../admin/ProductForm.jsx'

// `api` = products + orders functions; specs inject a fake.
export default function VendedorRoutes({ api = defaultApi }) {
  return (
    <Routes>
      <Route element={<ProtectedRoute roles={['VENDEDOR']}><VendedorLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="productos" replace />} />
        <Route path="productos" element={<VendedorProductos api={api} />} />
        <Route path="productos/nuevo" element={<ProductForm api={api} base="/vendedor" />} />
        <Route path="productos/:id" element={<ProductForm api={api} base="/vendedor" />} />
        <Route path="pedidos" element={<VendedorPedidos api={api} />} />
        <Route path="*" element={<EmptyState title="Sección no encontrada" />} />
      </Route>
    </Routes>
  )
}
