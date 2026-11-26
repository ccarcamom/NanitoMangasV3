import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../api/fakeAuthApi.js'
import StaffLogin from './StaffLogin.jsx'

const setup = (api, entry = '/ingresar/personal') => render(
  <MemoryRouter initialEntries={[entry]}>
    <AuthProvider api={api}>
      <Routes>
        <Route path="/ingresar/personal" element={<StaffLogin />} />
        <Route path="/ingresar" element={<p>acceso cliente</p>} />
        <Route path="/" element={<p>inicio</p>} />
        <Route path="/admin" element={<p>panel admin</p>} />
        <Route path="/admin/pedidos" element={<p>admin pedidos</p>} />
        <Route path="/vendedor" element={<p>panel vendedor</p>} />
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
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
const ADMIN = ['admin@nanitomangas.cl', 'Admin1234']
const VEND = ['vendedor@nanitomangas.cl', 'Vendedor1234']

describe('StaffLogin', () => {
  let api
  beforeEach(() => { api = createFakeAuthApi().api })
  afterEach(cleanup)

  it('admin_entra_y_va_a_admin', async () => {
    setup(api)
    expect(screen.getByRole('heading', { name: 'Acceso de personal' })).toBeTruthy()
    fill(...ADMIN)
    submit()
    await screen.findByText('panel admin')
  })

  it('vendedor_entra_y_va_a_vendedor', async () => {
    setup(api)
    fill(...VEND)
    submit()
    await screen.findByText('panel vendedor')
  })

  it('respeta_state_from_bajo_su_panel', async () => {
    setup(api, { pathname: '/ingresar/personal', state: { from: { pathname: '/admin/pedidos' } } })
    fill(...ADMIN)
    submit()
    await screen.findByText('admin pedidos')
    cleanup()
    api.logout()
    setup(api, { pathname: '/ingresar/personal', state: { from: { pathname: '/pedido' } } })
    fill(...ADMIN)
    submit()
    await screen.findByText('panel admin')
  })

  it('cuenta_de_cliente_se_rechaza_y_no_deja_tokens', async () => {
    await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    api.logout()
    setup(api)
    fill('ana@mail.cl', 'Clave1234')
    submit()
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Esta cuenta es de cliente. Usa el acceso de cliente.')
    expect(within(alert).getByRole('link', { name: 'acceso de cliente' }).getAttribute('href')).toBe('/ingresar')
    expect(await api.restoreSession()).toBeNull()
  })

  it('credenciales_malas_muestran_el_error', async () => {
    setup(api)
    fill(ADMIN[0], 'incorrecta1')
    submit()
    expect((await screen.findByRole('alert')).textContent).toBe('Correo o contraseña incorrectos')
  })

  it('doble_envio_llama_una_vez', () => {
    const spy = vi.spyOn(api, 'loginUser').mockReturnValue(new Promise(() => {}))
    setup(api)
    fill(...ADMIN)
    const form = screen.getByRole('button', { name: 'Ingresar' }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('con_sesion_redirige_segun_rol', async () => {
    await api.loginUser(...VEND)
    setup(api)
    await screen.findByText('panel vendedor')
    cleanup()
    await api.loginUser(...ADMIN)
    setup(api)
    await screen.findByText('panel admin')
    cleanup()
    await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    setup(api)
    await waitFor(() => expect(screen.getByText('cuenta')).toBeTruthy())
  })

  it('enlaces_a_cliente_y_a_registro_de_vendedor', () => {
    setup(api)
    expect(screen.getByRole('link', { name: 'Ingresar como cliente' }).getAttribute('href')).toBe('/ingresar')
    expect(screen.getByRole('link', { name: 'Crear cuenta de vendedor' }).getAttribute('href')).toBe('/registro?tipo=vendedor')
  })
})
