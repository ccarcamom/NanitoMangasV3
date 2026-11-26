import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../api/fakeAuthApi.js'
import { createFakeAdminApi } from '../../api/fakeAdminApi.js'
import AdminRoutes from './AdminRoutes.jsx'

describe('AdminRoutes', () => {
  let auth, admin
  const setup = (path = '/admin/productos') => render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider api={auth.api}>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes api={admin.api} />} />
          <Route path="/ingresar/personal" element={<p>pantalla ingresar</p>} />
          <Route path="/" element={<p>inicio</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  beforeEach(() => { auth = createFakeAuthApi(); admin = createFakeAdminApi() })
  afterEach(cleanup)

  it('invitado va a /ingresar/personal', async () => {
    setup()
    expect(await screen.findByText('pantalla ingresar')).toBeTruthy()
  })

  it('cliente va a /', async () => {
    await auth.api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    setup()
    expect(await screen.findByText('inicio')).toBeTruthy()
  })

  it('vendedor_no_puede_abrir_admin_redirige', async () => {
    await auth.api.loginUser('vendedor@nanitomangas.cl', 'Vendedor1234')
    setup()
    expect(await screen.findByText('inicio')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Productos', level: 1 })).toBeNull()
  })

  it('admin ve productos y el menú; /admin redirige a productos', async () => {
    await auth.api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    setup('/admin')
    expect(await screen.findByRole('heading', { name: 'Productos', level: 1 })).toBeTruthy()
    expect(await screen.findByText('One Piece - Tomo 1')).toBeTruthy() // datos de la API inyectada
    expect(screen.getByRole('link', { name: 'Usuarios' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pedidos' })).toBeTruthy()
  })

  it('ruta desconocida dentro del admin muestra sección no encontrada', async () => {
    await auth.api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    setup('/admin/nada')
    expect(await screen.findByRole('heading', { name: 'Sección no encontrada' })).toBeTruthy()
  })
})
