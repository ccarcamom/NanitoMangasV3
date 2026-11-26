import AdminProducts from '../admin/AdminProducts.jsx'

// Misma tabla del administrador, pero solo con los productos del vendedor.
export default function VendedorProductos({ api }) {
  return <AdminProducts api={api} base="/vendedor" mine />
}
