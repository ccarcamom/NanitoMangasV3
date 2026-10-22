import { render, screen, cleanup, act } from '@testing-library/react'
import { createFakeAdminApi } from '../../data/fakeAdminApi.js'
import AdminOrders from './AdminOrders.jsx'

const order = (id, createdAt, total, method = 'despacho') => ({
  id, createdAt, total, status: 'pagado', userId: null, email: `${id}@mail.cl`,
  buyer: { name: `Comprador ${id}`, rut: '1-9' },
  delivery: { method, address: null },
  items: [{ productId: 'a', name: 'A', unitPrice: 1, qty: 2 }, { productId: 'b', name: 'B', unitPrice: 1, qty: 1 }],
})

describe('AdminOrders', () => {
  afterEach(cleanup)

  it('lista el más nuevo primero con total formateado; la tabla tiene nombre', () => {
    const { api } = createFakeAdminApi({
      orders: [order('NM-000001', '2026-10-01T10:00:00Z', 11990), order('NM-000002', '2026-10-03T10:00:00Z', 25980, 'retiro')],
    })
    render(<AdminOrders api={api} />)
    expect(screen.getByRole('table', { name: 'Pedidos' })).toBeTruthy()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveSize(3)
    expect(rows[1].textContent).toContain('NM-000002')
    expect(rows[2].textContent).toContain('NM-000001')
    expect(rows[1].textContent).toContain('$25.980')
    expect(rows[1].textContent).toContain('Retiro')
    expect(rows[2].textContent).toContain('Despacho')
    expect(rows[1].textContent).toContain('NM-000002@mail.cl')
  })

  it('sin pedidos muestra el estado vacío y se actualiza al hacer un pedido', () => {
    const fake = createFakeAdminApi()
    render(<AdminOrders api={fake.api} />)
    expect(screen.getByRole('heading', { name: 'Todavía no hay pedidos' })).toBeTruthy()
    act(() => {
      fake.cartApi.addToCart(fake.productsApi.listProducts()[0].id, 1)
      fake.ordersApi.placeOrder({ email: 'ana@mail.cl', buyer: { name: 'Ana', rut: '1-9' }, delivery: { method: 'retiro', address: null } })
    })
    expect(screen.getByText('NM-000001')).toBeTruthy()
    expect(screen.getByText('ana@mail.cl')).toBeTruthy()
  })
})
