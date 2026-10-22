import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../data/fakeAuthApi.js'
import { createFakeAdminApi } from '../../data/fakeAdminApi.js'
import AdminRoutes from './AdminRoutes.jsx'

describe('AdminRoutes', () => {
  let auth, admin
  const setup = (path = '/admin/productos') => render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider api={auth.api}>
        <Routes>
          <Route path="/admin/*" element={<AdminRoutes api={admin.api} />} />
          <Route path="/ingresar" element={<p>pantalla ingresar</p>} />
          <Route path="/" element={<p>inicio</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  beforeEach(() => { auth = createFakeAuthApi(); admin = createFakeAdminApi() })
  afterEach(cleanup)

  it('invitado va a /ingresar', async () => {
    setup()
    expect(await screen.findByText('pantalla ingresar')).toBeTruthy()
  })

  it('cliente va a /', async () => {
    const u = await auth.api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    auth.api.setSession(u.id)
    setup()
    expect(await screen.findByText('inicio')).toBeTruthy()
  })

  it('admin ve productos y el menú; /admin redirige a productos', async () => {
    auth.api.setSession('user-admin')
    setup('/admin')
    expect(await screen.findByRole('heading', { name: 'Productos', level: 1 })).toBeTruthy()
    expect(screen.getByText('One Piece - Tomo 1')).toBeTruthy() // datos de la API inyectada
    expect(screen.getByRole('link', { name: 'Usuarios' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Pedidos' })).toBeTruthy()
  })

  it('ruta desconocida dentro del admin muestra sección no encontrada', async () => {
    auth.api.setSession('user-admin')
    setup('/admin/nada')
    expect(await screen.findByRole('heading', { name: 'Sección no encontrada' })).toBeTruthy()
  })
})
