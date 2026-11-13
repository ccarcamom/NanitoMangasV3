import { render, screen, cleanup, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../data/fakeAuthApi.js'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'
import { createOrdersApi } from '../data/orders.js'
import OrderSuccess from './OrderSuccess.jsx'

const order = {
  id: 'NM-000001', userId: null, email: 'ana@mail.cl', buyer: { name: 'Ana Pérez', rut: '12345678-5' },
  delivery: { method: 'despacho', address: { street: 'Calle 1', comuna: 'Viña del Mar', region: 'Región de Valparaíso' } },
  items: [{ productId: 'manga-1', name: 'Manga 1', unitPrice: 10990, qty: 2 }, { productId: 'manga-2', name: 'Manga 2', unitPrice: 9990, qty: 1 }],
  subtotal: 31970, shipping: 3990, total: 35960, createdAt: '2026-10-21T15:00:00.000Z', status: 'pagado',
}

describe('OrderSuccess', () => {
  let auth
  const setup = (id, getOrder) => render(
    <MemoryRouter initialEntries={[`/compra-exitosa/${id}`]}>
      <AuthProvider api={auth}>
        <Routes><Route path="/compra-exitosa/:orderId" element={<OrderSuccess getOrder={getOrder} />} /></Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  const lookup = (id) => (id === order.id ? order : undefined)
  beforeEach(() => { auth = createFakeAuthApi().api })
  afterEach(cleanup)

  it('muestra número, comprador, entrega, ítems y totales del pedido guardado', () => {
    setup('NM-000001', lookup)
    expect(screen.getByRole('heading', { level: 1, name: 'Compra exitosa' })).toBeTruthy()
    expect(screen.getByText('NM-000001')).toBeTruthy()
    expect(screen.getByText(new Date(order.createdAt).toLocaleDateString('es-CL'))).toBeTruthy()
    expect(screen.getByText('Ana Pérez')).toBeTruthy()
    expect(screen.getByText('ana@mail.cl')).toBeTruthy()
    expect(screen.getByText(/Calle 1, Viña del Mar, Región de Valparaíso/)).toBeTruthy()
    const items = within(screen.getByRole('list', { name: 'Productos' }))
    expect(items.getByText('Manga 1').closest('li').textContent).toContain('x 2')
    expect(items.getByText('$21.980')).toBeTruthy()
    expect(screen.getByText('Subtotal').nextSibling.textContent).toBe('$31.970')
    expect(screen.getByText('Envío').nextSibling.textContent).toBe('$3.990')
    expect(screen.getByText('Total').nextSibling.textContent).toBe('$35.960')
    expect(screen.getByText(/Pago simulado/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Seguir comprando' }).getAttribute('href')).toBe('/')
    expect(screen.queryByRole('link', { name: 'Ver mis pedidos' })).toBeNull()
  })

  it('con sesión muestra "Ver mis pedidos"', async () => {
    const user = await auth.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    auth.setSession(user.id)
    setup('NM-000001', lookup)
    expect((await screen.findByRole('link', { name: 'Ver mis pedidos' })).getAttribute('href')).toBe('/cuenta')
  })

  it('id desconocido muestra "Pedido no encontrado"', () => {
    setup('NM-999999', lookup)
    expect(screen.getByText('Pedido no encontrado')).toBeTruthy()
    expect(screen.queryByText('Subtotal')).toBeNull()
  })

  it('recargar dos veces muestra el mismo pedido sin crear otro ni tocar stock', () => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    const cartApi = createCartApi(storage, productsApi)
    const ordersApi = createOrdersApi({ storage, productsApi, cartApi })
    cartApi.addToCart('manga-1', 2)
    const placed = ordersApi.placeOrder({ email: 'a@b.cl', buyer: { name: 'Ana', rut: '12345678-5' }, delivery: { method: 'retiro', address: null } })
    const spy = vi.spyOn(ordersApi, 'placeOrder')
    const stock = productsApi.getProduct('manga-1').stock
    setup(placed.id, ordersApi.getOrder)
    cleanup()
    setup(placed.id, ordersApi.getOrder)
    expect(screen.getByText(placed.id)).toBeTruthy()
    expect(spy).not.toHaveBeenCalled()
    expect(ordersApi.listOrders().length).toBe(1)
    expect(productsApi.getProduct('manga-1').stock).toBe(stock)
  })
})
