import { render, screen, cleanup } from '@testing-library/react'
import { createFakeAdminApi } from '../../api/fakeAdminApi.js'
import { flush } from '../../../test/flush.js'
import AdminOrders from './AdminOrders.jsx'

const order = (id, createdAt, total, method = 'despacho') => ({
  id, createdAt, total, status: 'pagado', userId: null, email: `${id}@mail.cl`,
  buyer: { name: `Comprador ${id}`, rut: '1-9' },
  delivery: { method, address: null },
  items: [{ productId: 'a', name: 'A', unitPrice: 1, qty: 2 }, { productId: 'b', name: 'B', unitPrice: 1, qty: 1 }],
})

describe('AdminOrders', () => {
  afterEach(cleanup)

  it('lista el más nuevo primero con total formateado; la tabla tiene nombre', async () => {
    const { api } = createFakeAdminApi({
      orders: [order('NM-000001', '2026-10-01T10:00:00Z', 11990), order('NM-000002', '2026-10-03T10:00:00Z', 25980, 'retiro')],
    })
    render(<AdminOrders api={api} />)
    await flush()
    expect(screen.getByRole('table', { name: 'Pedidos' })).toBeTruthy()
    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(rows[1].textContent).toContain('NM-000002')
    expect(rows[2].textContent).toContain('NM-000001')
    expect(rows[1].textContent).toContain('$25.980')
    expect(rows[1].textContent).toContain('Retiro')
    expect(rows[2].textContent).toContain('Despacho')
    expect(rows[1].textContent).toContain('NM-000002@mail.cl')
  })

  it('sin pedidos muestra el estado vacío', async () => {
    render(<AdminOrders api={createFakeAdminApi().api} />)
    await flush()
    expect(screen.getByRole('heading', { name: 'Todavía no hay pedidos' })).toBeTruthy()
  })

  it('si falla la carga muestra el error', async () => {
    render(<AdminOrders api={{ listOrders: async () => { throw new Error('x') } }} />)
    await flush()
    expect(screen.getByText('No pudimos cargar los pedidos')).toBeTruthy()
  })
})
