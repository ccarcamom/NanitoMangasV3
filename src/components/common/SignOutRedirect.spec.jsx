import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { AuthProvider, useAuth } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../api/fakeAuthApi.js'
import ProtectedRoute from './ProtectedRoute.jsx'
import { flush } from '../../../test/flush.js'

function Cuenta() {
  const { logout } = useAuth()
  return <button type="button" onClick={logout}>salir</button>
}
function Ingresar() {
  const { login } = useAuth()
  const from = useLocation().state?.from?.pathname
  return <button type="button" onClick={() => login('ana@mail.cl', 'Clave1234')}>{`ingresar desde ${from ?? 'nada'}`}</button>
}

describe('cerrar sesión en una ruta protegida', () => {
  let api
  const setup = async (path = '/cuenta') => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <AuthProvider api={api}>
          <Routes>
            <Route path="/" element={<p>portada</p>} />
            <Route path="/ingresar" element={<Ingresar />} />
            <Route path="/cuenta" element={<ProtectedRoute><Cuenta /></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    )
    await flush()
  }
  beforeEach(async () => {
    api = createFakeAuthApi().api
    await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
  })
  afterEach(cleanup)

  it('termina en la portada', async () => {
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'salir' }))
    await flush()
    expect(screen.getByText('portada')).toBeTruthy()
  })

  it('un invitado que abre /cuenta va a /ingresar con from', async () => {
    api.logout()
    await setup()
    expect(screen.getByRole('button', { name: 'ingresar desde /cuenta' })).toBeTruthy()
  })

  it('tras salir y volver a entrar la marca se limpia: una sesión vencida va a /ingresar', async () => {
    let expire
    api.onSessionExpired = (cb) => { expire = cb; return () => {} }
    await setup()
    fireEvent.click(screen.getByRole('button', { name: 'salir' }))
    await flush()
    expect(screen.getByText('portada')).toBeTruthy()
    cleanup()
    api.logout()
    await api.loginUser('ana@mail.cl', 'Clave1234')
    await setup()
    expect(screen.getByRole('button', { name: 'salir' })).toBeTruthy()
    await act(async () => { expire() })
    expect(screen.getByRole('button', { name: /ingresar desde/ })).toBeTruthy()
  })
})
