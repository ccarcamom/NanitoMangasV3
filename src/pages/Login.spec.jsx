import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../data/fakeAuthApi.js'
import Login from './Login.jsx'

const setup = (api, entry = '/ingresar') => render(
  <MemoryRouter initialEntries={[entry]}>
    <AuthProvider api={api}>
      <Routes>
        <Route path="/ingresar" element={<Login />} />
        <Route path="/" element={<p>inicio</p>} />
        <Route path="/cuenta" element={<p>cuenta</p>} />
        <Route path="/pedido" element={<p>pedido</p>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>,
)
const fill = (email, pass) => {
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: pass } })
}

describe('Login', () => {
  let api
  beforeEach(() => { api = createFakeAuthApi().api })
  afterEach(cleanup)

  it('credenciales malas muestran el error del formulario', async () => {
    setup(api)
    fill('admin@nanitomangas.cl', 'incorrecta1')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Correo o contraseña incorrectos')
  })

  it('correo inválido o contraseña vacía no llama al servicio', () => {
    const spy = spyOn(api, 'loginUser').and.callThrough()
    setup(api)
    fill('mal', '')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(spy).not.toHaveBeenCalled()
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeTruthy()
  })

  it('credenciales con correo desconocido muestran el mismo aviso', async () => {
    setup(api)
    fill('nadie@mail.cl', 'Clave1234')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect((await screen.findByRole('alert')).textContent).toBe('Correo o contraseña incorrectos')
  })

  it('dos envíos seguidos antes de que responda el servicio lo llaman una sola vez', () => {
    const spy = spyOn(api, 'loginUser').and.returnValue(new Promise(() => {}))
    setup(api)
    fill('admin@nanitomangas.cl', 'Admin1234')
    const form = screen.getByRole('button', { name: 'Ingresar' }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('tras ingresar vuelve a la ruta de origen (state.from)', async () => {
    setup(api, { pathname: '/ingresar', state: { from: { pathname: '/pedido' } } })
    fill('admin@nanitomangas.cl', 'Admin1234')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    await screen.findByText('pedido')
  })

  it('doble clic llama al servicio una sola vez y entra', async () => {
    const spy = spyOn(api, 'loginUser').and.callThrough()
    setup(api)
    fill('admin@nanitomangas.cl', 'Admin1234')
    const btn = screen.getByRole('button', { name: 'Ingresar' })
    fireEvent.click(btn)
    fireEvent.click(btn)
    await screen.findByText('inicio')
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('con sesión iniciada redirige a /cuenta', async () => {
    const u = await api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    api.setSession(u.id)
    setup(api)
    await waitFor(() => expect(screen.getByText('cuenta')).toBeTruthy())
  })
})
