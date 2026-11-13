import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../data/fakeAuthApi.js'
import Register from './Register.jsx'

const setup = (api) => render(
  <MemoryRouter initialEntries={['/registro']}>
    <AuthProvider api={api}>
      <Routes>
        <Route path="/registro" element={<Register />} />
        <Route path="/cuenta" element={<p>cuenta</p>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>,
)
const fill = ({ name = 'Ana', email = 'ana@mail.cl', pass = 'Clave1234', confirm = pass }) => {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: name } })
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: pass } })
  fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: confirm } })
  fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
}

describe('Register', () => {
  let api
  beforeEach(() => { api = createFakeAuthApi().api })
  afterEach(cleanup)

  it('contraseña débil muestra el error y no llama al servicio', () => {
    const spy = vi.spyOn(api, 'registerUser')
    setup(api)
    fill({ pass: 'abc' })
    expect(screen.getAllByText('La contraseña debe tener al menos 8 caracteres, una letra y un número.').length).toBe(1)
    expect(screen.getByLabelText('Contraseña').getAttribute('aria-describedby')).toBe('password-error')
    expect(spy).not.toHaveBeenCalled()
  })

  it('contraseñas distintas muestran error', () => {
    const spy = vi.spyOn(api, 'registerUser')
    setup(api)
    fill({ pass: 'Clave1234', confirm: 'Clave12345' })
    expect(screen.getByText('Las contraseñas no coinciden.')).toBeTruthy()
    expect(spy).not.toHaveBeenCalled()
  })

  it('correo repetido muestra el aviso bajo el campo', async () => {
    setup(api)
    fill({ email: 'Admin@NanitoMangas.cl' })
    const msg = await screen.findByText('Este correo ya está registrado')
    const input = screen.getByLabelText('Correo')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe(msg.id)
    expect(msg.id).toBe('email-error')
  })

  it('la regla de contraseña se muestra como ayuda enlazada al campo', () => {
    setup(api)
    const hint = screen.getByText('La contraseña debe tener al menos 8 caracteres, una letra y un número.')
    expect(screen.getByLabelText('Contraseña').getAttribute('aria-describedby')).toBe(hint.id)
  })

  it('dos envíos seguidos antes de que responda el servicio lo llaman una sola vez', () => {
    const spy = vi.spyOn(api, 'registerUser').mockReturnValue(new Promise(() => {}))
    setup(api)
    fill({})
    const form = screen.getByRole('button', { name: 'Crear cuenta' }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('datos válidos crean la cuenta, inician sesión y van a /cuenta', async () => {
    setup(api)
    fill({})
    await screen.findByText('cuenta')
    expect(api.getSessionUserId()).not.toBeNull()
  })
})
