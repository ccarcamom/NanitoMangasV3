import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../api/fakeAuthApi.js'
import Login from './Login.jsx'

const setup = (api, entry = '/ingresar') => render(
  <MemoryRouter initialEntries={[entry]}>
    <AuthProvider api={api}>
      <Routes>
        <Route path="/ingresar" element={<Login />} />
        <Route path="/ingresar/personal" element={<p>acceso personal</p>} />
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

const CLIENTE = ['ana@mail.cl', 'Clave1234']

describe('Login', () => {
  let api
  beforeEach(async () => {
    api = createFakeAuthApi().api
    await api.registerUser({ name: 'Ana', email: CLIENTE[0], password: CLIENTE[1] })
    api.logout()
  })
  afterEach(cleanup)

  it('credenciales malas muestran el error del formulario', async () => {
    setup(api)
    fill('admin@nanitomangas.cl', 'incorrecta1')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Correo o contraseña incorrectos')
  })

  it('correo inválido o contraseña vacía no llama al servicio', () => {
    const spy = vi.spyOn(api, 'loginUser')
    setup(api)
    fill('mal', '')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(spy).not.toHaveBeenCalled()
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy()
    expect(screen.getByText('Ingresa tu contraseña.')).toBeTruthy()
  })

  it('dos envíos seguidos antes de que responda el servicio lo llaman una sola vez', () => {
    const spy = vi.spyOn(api, 'loginUser').mockReturnValue(new Promise(() => {}))
    setup(api)
    fill('admin@nanitomangas.cl', 'Admin1234')
    const form = screen.getByRole('button', { name: 'Ingresar' }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('cliente_entra_y_va_a_inicio_o_state_from', async () => {
    setup(api)
    fill(...CLIENTE)
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    await screen.findByText('inicio')
    cleanup()
    api.logout()
    setup(api, { pathname: '/ingresar', state: { from: { pathname: '/pedido' } } })
    fill(...CLIENTE)
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    await screen.findByText('pedido')
  })

  it('cuenta_de_personal_en_acceso_de_cliente_se_rechaza_y_no_deja_tokens', async () => {
    setup(api)
    fill('admin@nanitomangas.cl', 'Admin1234')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toBe('Esta cuenta es de personal. Usa el acceso de personal.')
    expect(within(alert).getByRole('link', { name: 'acceso de personal' }).getAttribute('href')).toBe('/ingresar/personal')
    expect(await api.restoreSession()).toBeNull()
    expect(screen.queryByText('cuenta')).toBeNull()
  })

  it('aviso_de_rechazo_es_un_solo_parrafo_con_el_enlace', async () => {
    setup(api)
    fill('admin@nanitomangas.cl', 'Admin1234')
    fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
    const alert = await screen.findByRole('alert')
    const paragraphs = alert.querySelectorAll('p')
    expect(paragraphs.length).toBe(1)
    expect(paragraphs[0].contains(within(alert).getByRole('link'))).toBe(true)
  })

  it('enlace_a_acceso_de_personal_visible', () => {
    setup(api)
    expect(screen.getByRole('link', { name: 'Acceso de personal' }).getAttribute('href')).toBe('/ingresar/personal')
  })

  it('con sesión iniciada redirige a /cuenta', async () => {
    await api.loginUser(...CLIENTE)
    setup(api)
    await waitFor(() => expect(screen.getByText('cuenta')).toBeTruthy())
  })
})
