import { Route, Routes } from 'react-router'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import Category from './pages/Category.jsx'
import Search from './pages/Search.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Reader from './pages/Reader.jsx'
import Cart from './pages/Cart.jsx'
import Contact from './pages/Contact.jsx'
import Login from './pages/Login.jsx'
import StaffLogin from './pages/StaffLogin.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'
import Checkout from './pages/Checkout.jsx'
import OrderSuccess from './pages/OrderSuccess.jsx'
import PaymentFailed from './pages/PaymentFailed.jsx'
import ProtectedRoute from './components/common/ProtectedRoute.jsx'
import MemeEditor from './pages/MemeEditor.jsx'
import MemeLibrary from './pages/MemeLibrary.jsx'
import AdminRoutes from './pages/admin/AdminRoutes.jsx'
import VendedorRoutes from './pages/vendedor/VendedorRoutes.jsx'
import NotFound from './pages/NotFound.jsx'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="categoria/:categoryId" element={<Category />} />
        <Route path="novedades" element={<Category onlyNew />} />
        <Route path="ofertas" element={<Category onlyOffers />} />
        <Route path="buscar" element={<Search />} />
        <Route path="producto/:id" element={<ProductDetail />} />
        <Route path="leer/:id" element={<Reader />} />
        <Route path="carro" element={<Cart />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="ingresar" element={<Login />} />
        <Route path="ingresar/personal" element={<StaffLogin />} />
        <Route path="registro" element={<Register />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="compra-exitosa/:orderId" element={<OrderSuccess />} />
        <Route path="pago-fallido" element={<PaymentFailed />} />
        <Route path="cuenta" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="memes/crear" element={<ProtectedRoute roles={['CLIENTE']}><MemeEditor /></ProtectedRoute>} />
        <Route path="memes/biblioteca" element={<ProtectedRoute roles={['CLIENTE']}><MemeLibrary /></ProtectedRoute>} />
        <Route path="admin/*" element={<AdminRoutes />} />
        <Route path="vendedor/*" element={<VendedorRoutes />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
