import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import Offers from './pages/Offers.jsx'
import Search from './pages/Search.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import PaymentFailed from './pages/PaymentFailed.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import AdminRoutes from './pages/admin/AdminRoutes.jsx'
import NotFound from './pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="categoria/:categoryId" element={<Category />} />
        <Route path="novedades" element={<Category onlyNew />} />
        <Route path="ofertas" element={<Offers />} />
        <Route path="buscar" element={<Search />} />
        <Route path="producto/:id" element={<ProductDetail />} />
        <Route path="carro" element={<Cart />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="ingresar" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="compra-exitosa/:orderId" element={<OrderSuccess />} />
        <Route path="pago-fallido" element={<PaymentFailed />} />
        <Route path="cuenta" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="admin/*" element={<AdminRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
