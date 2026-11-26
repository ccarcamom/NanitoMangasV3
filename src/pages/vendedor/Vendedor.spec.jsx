import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../api/fakeAuthApi.js'
import { createFakeAdminApi } from '../../api/fakeAdminApi.js'
import { seedProducts } from '../../data/seed.js'
import { flush } from '../../../test/flush.js'
import VendedorRoutes from './VendedorRoutes.jsx'

const item = (productId, name, sellerId) => ({ productId, name, unitPrice: 1000, qty: 2, sellerId })
const order = { id: 'NM-000007', createdAt: '2026-10-03T10:00:00Z', total: 5000, status: 'pagado', email: 'c@mail.cl', buyer: { name: 'Cata', rut: '1-9' }, delivery: { method: 'retiro' }, items: [item('p1', 'Mío', 'u-vend')] }

describe('VendedorRoutes', () => {
  let auth
  const setup = async (path, admin) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider api={auth.api}>
          <Routes>
            <Route path="/vendedor/*" element={<VendedorRoutes api={admin.api} />} />
            <Route path="/ingresar/personal" element={<p>pantalla ingresar</p>} />
            <Route path="/" element={<p>inicio</p>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    await flush()
  }
  beforeEach(() => { auth = createFakeAuthApi() })
  afterEach(cleanup)

  it('vendedor_ve_solo_sus_productos', async () => {
    await auth.api.loginUser('vendedor@nanitomangas.cl', 'Vendedor1234')
    const admin = createFakeAdminApi({
      me: 'u-vend',
      products: [
        { ...seedProducts[0], id: 'p1', name: 'Mío', sellerId: 'u-vend' },
        { ...seedProducts[0], id: 'p2', name: 'Ajeno', sellerId: 'otro' },
      ],
    })
    await setup('/vendedor', admin)
    expect(screen.getByText('Mío')).toBeTruthy()
    expect(screen.queryByText('Ajeno')).toBeNull()
    expect(screen.getByRole('link', { name: 'Editar Mío' }).getAttribute('href')).toBe('/vendedor/productos/p1')
  })

  it('vendedor_pedidos_lista_solo_sus_items', async () => {
    await auth.api.loginUser('vendedor@nanitomangas.cl', 'Vendedor1234')
    const admin = createFakeAdminApi({ me: 'u-vend', orders: [], sellerOrders: [order] })
    await setup('/vendedor/pedidos', admin)
    const row = screen.getByText('NM-000007').closest('tr')
    expect(row.textContent).toContain('2 x Mío')
    expect(row.textContent).toContain('$2.000')
  })

  it('cliente va a / e invitado a /ingresar/personal', async () => {
    await setup('/vendedor', createFakeAdminApi())
    expect(screen.getByText('pantalla ingresar')).toBeTruthy()
    cleanup()
    await auth.api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    await setup('/vendedor', createFakeAdminApi())
    expect(screen.getByText('inicio')).toBeTruthy()
  })
})
