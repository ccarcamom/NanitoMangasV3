import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { AuthContext, AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../api/fakeAuthApi.js'
import ProtectedRoute from './ProtectedRoute.jsx'

const Probe = ({ staff }) => { const { state } = useLocation(); return <p>{staff && 'personal '}origen {state?.from?.pathname}</p> }

const renderAt = (api, role, roles) => render(
  <MemoryRouter initialEntries={['/secreto']}>
    <AuthProvider api={api}>
      <Routes>
        <Route path="/ingresar" element={<Probe />} />
        <Route path="/ingresar/personal" element={<Probe staff />} />
        <Route path="/" element={<p>inicio</p>} />
        <Route path="/secreto" element={<ProtectedRoute role={role} roles={roles}><p>contenido secreto</p></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>,
)

describe('ProtectedRoute', () => {
  let api
  beforeEach(() => { api = createFakeAuthApi().api })
  afterEach(cleanup)

  it('sin sesión redirige a /ingresar', async () => {
    renderAt(api)
    await screen.findByText('origen /secreto')
    expect(screen.queryByText('contenido secreto')).toBeNull()
  })

  it('invitado_en_ruta_de_personal_va_a_ingresar_personal_con_from', async () => {
    renderAt(api, 'ADMIN')
    await screen.findByText('personal origen /secreto')
    cleanup()
    renderAt(api, undefined, ['VENDEDOR', 'ADMIN'])
    await screen.findByText('personal origen /secreto')
  })

  it('invitado_en_ruta_de_cliente_va_a_ingresar', async () => {
    renderAt(api, undefined, ['CLIENTE'])
    await screen.findByText('origen /secreto')
    expect(screen.queryByText('personal origen /secreto')).toBeNull()
  })

  it('cliente en ruta admin redirige a /', async () => {
    await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    renderAt(api, 'ADMIN')
    await screen.findByText('inicio')
  })

  it('cliente ve una ruta sin rol', async () => {
    await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    renderAt(api)
    await screen.findByText('contenido secreto')
  })

  it('admin ve el contenido', async () => {
    await api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    renderAt(api, 'ADMIN')
    await screen.findByText('contenido secreto')
  })

  it('ProtectedRoute_roles_permite_y_niega', async () => {
    await api.loginUser('vendedor@nanitomangas.cl', 'Vendedor1234')
    renderAt(api, undefined, ['VENDEDOR', 'ADMIN'])
    await screen.findByText('contenido secreto')
    cleanup()
    renderAt(api, undefined, ['ADMIN'])
    await screen.findByText('inicio')
    expect(screen.queryByText('contenido secreto')).toBeNull()
  })

  it('sesión de un usuario inexistente equivale a sin sesión', async () => {
    renderAt(api, 'ADMIN')
    await screen.findByText('personal origen /secreto')
  })

  it('mientras no está listo no renderiza nada', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/secreto']}>
        <AuthContext.Provider value={{ user: null, ready: false }}>
          <Routes>
            <Route path="/ingresar" element={<p>pantalla ingresar</p>} />
            <Route path="/secreto" element={<ProtectedRoute><p>contenido secreto</p></ProtectedRoute>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    )
    // ready queda en false (contexto fijo): ni contenido ni redirección a /ingresar.
    expect(container.textContent).toBe('')
    expect(screen.queryByText('pantalla ingresar')).toBeNull()
  })
})
