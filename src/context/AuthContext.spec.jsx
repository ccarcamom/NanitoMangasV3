import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import { createFakeAuthApi } from '../api/fakeAuthApi.js'

function Probe() {
  const { user, ready, register, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="ready">{String(ready)}</span>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <span data-testid="json">{JSON.stringify(user)}</span>
      <button type="button" onClick={() => register({ name: 'Ana', email: 'Ana@Mail.cl', password: 'Clave1234' })}>reg</button>
      <button type="button" onClick={() => login('admin@nanitomangas.cl', 'Admin1234')}>login</button>
      <button type="button" onClick={logout}>out</button>
    </div>
  )
}

describe('AuthContext', () => {
  let api
  beforeEach(() => { api = createFakeAuthApi().api })
  afterEach(cleanup)

  it('register inicia sesión y logout la limpia', async () => {
    render(<AuthProvider api={api}><Probe /></AuthProvider>)
    expect((await screen.findByText('true')).dataset.testid).toBe('ready')
    expect(screen.getByTestId('user').textContent).toBe('none')
    fireEvent.click(screen.getByText('reg'))
    expect((await screen.findByText('ana@mail.cl')).dataset.testid).toBe('user')
    expect(await api.restoreSession()).not.toBeNull()
    fireEvent.click(screen.getByText('out'))
    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(await api.restoreSession()).toBeNull()
  })

  it('login con credenciales válidas deja el usuario con su rol', async () => {
    render(<AuthProvider api={api}><Probe /></AuthProvider>)
    fireEvent.click(screen.getByText('login'))
    expect((await screen.findByText('admin@nanitomangas.cl')).dataset.testid).toBe('user')
    expect(JSON.parse(screen.getByTestId('json').textContent).role).toBe('ADMIN')
  })

  it('al montar recupera la sesión guardada', async () => {
    await api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    render(<AuthProvider api={api}><Probe /></AuthProvider>)
    expect((await screen.findByText('admin@nanitomangas.cl')).dataset.testid).toBe('user')
  })

  it('logout antes de que termine restoreSession no deja reaparecer al usuario', async () => {
    let finish
    const slow = { ...api, restoreSession: () => new Promise((r) => { finish = r }) }
    render(<AuthProvider api={slow}><Probe /></AuthProvider>)
    fireEvent.click(screen.getByText('out'))
    await act(async () => { finish({ id: 'u1', email: 'x@y.cl', role: 'CLIENTE' }) })
    expect(screen.getByTestId('ready').textContent).toBe('true')
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('si la renovación de la sesión falla en mitad del uso, cierra la sesión', async () => {
    let expire
    const wired = { ...api, onSessionExpired: (cb) => { expire = cb; return () => {} } }
    await api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    render(<AuthProvider api={wired}><Probe /></AuthProvider>)
    await screen.findByText('admin@nanitomangas.cl')
    act(() => expire())
    expect(screen.getByTestId('user').textContent).toBe('none')
  })
})
