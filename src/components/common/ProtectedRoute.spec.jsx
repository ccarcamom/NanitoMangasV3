import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { AuthContext, AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../data/fakeAuthApi.js'
import ProtectedRoute from './ProtectedRoute.jsx'

const Probe = () => { const { state } = useLocation(); return <p>origen {state?.from?.pathname}</p> }

const renderAt = (api, role) => render(
  <MemoryRouter initialEntries={['/secreto']}>
    <AuthProvider api={api}>
      <Routes>
        <Route path="/ingresar" element={<Probe />} />
        <Route path="/" element={<p>inicio</p>} />
        <Route path="/secreto" element={<ProtectedRoute role={role}><p>contenido secreto</p></ProtectedRoute>} />
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

  it('cliente en ruta admin redirige a /', async () => {
    const u = await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    api.setSession(u.id)
    renderAt(api, 'admin')
    await screen.findByText('inicio')
  })

  it('cliente ve una ruta sin rol', async () => {
    const u = await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    api.setSession(u.id)
    renderAt(api)
    await screen.findByText('contenido secreto')
  })

  it('admin ve el contenido', async () => {
    const u = await api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    api.setSession(u.id)
    renderAt(api, 'admin')
    await screen.findByText('contenido secreto')
  })

  it('sesión de un usuario inexistente equivale a sin sesión', async () => {
    api.setSession('no-existe')
    renderAt(api, 'admin')
    await screen.findByText('origen /secreto')
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
