import { render, screen, cleanup, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../api/fakeAuthApi.js'
import { createFakeShop } from '../api/fakeShop.js'
import OrderSuccess from './OrderSuccess.jsx'

const order = {
  id: 'NM-000001', userId: null, email: 'ana@mail.cl', buyer: { name: 'Ana Pérez', rut: '12345678-5' },
  delivery: { method: 'despacho', address: { street: 'Calle 1', comuna: 'Viña del Mar', region: 'Región de Valparaíso' } },
  items: [{ productId: 'manga-1', name: 'Manga 1', unitPrice: 10990, qty: 2 }, { productId: 'manga-2', name: 'Manga 2', unitPrice: 9990, qty: 1 }],
  subtotal: 31970, shipping: 3990, total: 35960, createdAt: '2026-10-21T15:00:00.000Z', status: 'pagado',
}

describe('OrderSuccess', () => {
  let auth
  const setup = (id, getOrder, state) => render(
    <MemoryRouter initialEntries={[{ pathname: `/compra-exitosa/${id}`, state }]}>
      <AuthProvider api={auth}>
        <Routes><Route path="/compra-exitosa/:orderId" element={<OrderSuccess getOrder={getOrder} />} /></Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  const lookup = async (id) => (id === order.id ? order : null)
  beforeEach(() => { auth = createFakeAuthApi().api; sessionStorage.clear() })
  afterEach(cleanup)

  it('muestra número, comprador, entrega, ítems y totales del pedido guardado', async () => {
    setup('NM-000001', lookup, { order })
    await screen.findByText('NM-000001')
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
    expect(screen.getByRole('link', { name: 'Seguir comprando' }).getAttribute('href')).toBe('/')
    expect(screen.queryByRole('link', { name: 'Ver mis pedidos' })).toBeNull()
  })

  it('con sesión muestra "Ver mis pedidos"', async () => {
    await auth.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    setup('NM-000001', lookup)
    expect((await screen.findByRole('link', { name: 'Ver mis pedidos' })).getAttribute('href')).toBe('/cuenta')
  })

  it('id desconocido muestra "Pedido no encontrado"', async () => {
    await auth.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    setup('NM-999999', lookup)
    expect(await screen.findByText('Pedido no encontrado')).toBeTruthy()
    expect(screen.queryByText('Subtotal')).toBeNull()
  })

  it('muestra el pedido que llega por la navegación sin pedirlo otra vez', async () => {
    const getOrder = vi.fn()
    setup('NM-000001', getOrder, { order })
    expect(await screen.findByText('NM-000001')).toBeTruthy()
    expect(screen.getByText('Total').nextSibling.textContent).toBe('$35.960') // total del servidor
    expect(getOrder).not.toHaveBeenCalled()
  })

  it('recargar dos veces muestra el mismo pedido sin crear otro ni tocar stock', async () => {
    const { ordersApi, productsApi } = createFakeShop()
    const placed = await ordersApi.placeOrder({ email: 'a@b.cl', buyer: { name: 'Ana', rut: '12345678-5' }, delivery: { method: 'retiro', address: null }, items: [{ productId: 'manga-1', qty: 2 }] })
    await auth.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    const spy = vi.spyOn(ordersApi, 'placeOrder')
    const stock = productsApi.getProduct('manga-1').stock
    setup(placed.id, ordersApi.getOrder)
    await screen.findByText(placed.id)
    cleanup()
    setup(placed.id, ordersApi.getOrder)
    expect(await screen.findByText(placed.id)).toBeTruthy()
    expect(spy).not.toHaveBeenCalled()
    expect((await ordersApi.listMyOrders()).length).toBe(1)
    expect(productsApi.getProduct('manga-1').stock).toBe(stock)
  })

  it('recarga de invitado muestra el comprobante desde sessionStorage', async () => {
    sessionStorage.setItem('nm:last-order', JSON.stringify(order))
    const getOrder = vi.fn()
    setup('NM-000001', getOrder)
    expect(await screen.findByText('NM-000001')).toBeTruthy()
    expect(screen.getByText('Total').nextSibling.textContent).toBe('$35.960')
    expect(getOrder).not.toHaveBeenCalled()
  })

  it('si el id de la URL no coincide con el guardado muestra "Pedido no encontrado"', async () => {
    sessionStorage.setItem('nm:last-order', JSON.stringify(order))
    setup('NM-000002', vi.fn())
    expect(await screen.findByText('Pedido no encontrado')).toBeTruthy()
  })

  it('con sesión se prefiere getOrder al pedido guardado', async () => {
    await auth.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    sessionStorage.setItem('nm:last-order', JSON.stringify({ ...order, total: 1 }))
    setup('NM-000001', async () => order)
    expect(await screen.findByText('NM-000001')).toBeTruthy()
    expect(screen.getByText('Total').nextSibling.textContent).toBe('$35.960')
  })
})
