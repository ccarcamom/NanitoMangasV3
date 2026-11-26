import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../api/fakeAuthApi.js'
import Profile from './Profile.jsx'

const order = (id, userId, createdAt, name) => ({
  id, userId, createdAt, status: 'pagado', total: 11990,
  items: [{ productId: 'x', name, unitPrice: 11990, qty: 2 }],
})

describe('Profile', () => {
  let api, user
  const setup = (orders = []) => render(
    <MemoryRouter initialEntries={['/cuenta']}>
      <AuthProvider api={api}>
        <Routes>
          <Route path="/cuenta" element={<Profile ordersApi={{ listMyOrders: async () => orders }} />} />
          <Route path="/" element={<p>inicio</p>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  )
  beforeEach(async () => {
    api = createFakeAuthApi().api
    ;({ user } = await api.registerUser({ name: 'Ana Pérez', email: 'ana@mail.cl', password: 'Clave1234' }))
  })
  afterEach(cleanup)

  it('RUT inválido muestra error y no guarda', async () => {
    const spy = vi.spyOn(api, 'updateProfile')
    setup()
    fireEvent.change(await screen.findByLabelText('RUT'), { target: { value: '12345678-9' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(screen.getByText('Ingresa un RUT válido.')).toBeTruthy()
    expect(spy).not.toHaveBeenCalled()
    expect(screen.queryByText('Cambios guardados')).toBeNull()
  })

  it('guardar válido muestra el aviso y persiste con el RUT normalizado', async () => {
    setup()
    fireEvent.change(await screen.findByLabelText('RUT'), { target: { value: '12.345.678-5' } })
    fireEvent.change(screen.getByLabelText('Calle y número'), { target: { value: 'Calle 1' } })
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Región de Valparaíso' } })
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Viña del Mar' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByText('Cambios guardados')).toBeTruthy()
    const saved = await api.restoreSession()
    expect(saved.rut).toBe('12345678-5')
    expect(saved.address).toEqual({ street: 'Calle 1', comuna: 'Viña del Mar', region: 'Región de Valparaíso' })
  })

  it('Mis pedidos lista los que entrega la API, el más nuevo primero', async () => {
    setup([
      order('NM-000001', user.id, '2026-10-01T10:00:00Z', 'Manga Uno'),
      order('NM-000003', user.id, '2026-10-03T10:00:00Z', 'Manga Tres'),
    ])
    await screen.findByText('NM-000003')
    const ids = [...document.querySelectorAll('.order__id')].map((n) => n.textContent)
    expect(ids).toEqual(['NM-000003', 'NM-000001'])
    expect(screen.getAllByText(/2 x/).length).toBe(2)
  })

  it('sin pedidos muestra el estado vacío', async () => {
    setup()
    expect(await screen.findByText('Todavía no tienes pedidos')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver productos' })).toBeTruthy()
  })

  it('Cerrar sesión limpia la sesión y va al inicio', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Cerrar sesión' }))
    await screen.findByText('inicio')
    expect(await api.restoreSession()).toBeNull()
  })

  it('solo el admin ve el enlace al panel', async () => {
    setup()
    await screen.findByRole('heading', { name: 'Mi cuenta' })
    expect(screen.queryByRole('link', { name: 'Ir al panel de administración' })).toBeNull()
    cleanup()
    await api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    setup()
    expect((await screen.findByRole('link', { name: 'Ir al panel de administración' })).getAttribute('href')).toBe('/admin')
  })
})
