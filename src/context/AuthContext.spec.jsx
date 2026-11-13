import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext.jsx'
import { createFakeAuthApi } from '../data/fakeAuthApi.js'

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

  it('register inicia sesión, logout la limpia y el usuario no expone passwordHash', async () => {
    render(<AuthProvider api={api}><Probe /></AuthProvider>)
    await waitFor(() => { if (screen.getByTestId('ready').textContent !== 'true') throw new Error('esperando ready') })
    expect(screen.getByTestId('ready').textContent).toBe('true')
    expect(screen.getByTestId('user').textContent).toBe('none')
    fireEvent.click(screen.getByText('reg'))
    expect((await screen.findByText('ana@mail.cl')).dataset.testid).toBe('user')
    expect(screen.getByTestId('json').textContent).not.toContain('passwordHash')
    expect(api.getSessionUserId()).not.toBeNull()
    fireEvent.click(screen.getByText('out'))
    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(api.getSessionUserId()).toBeNull()
  })

  it('login con credenciales válidas deja el usuario y sin hash', async () => {
    render(<AuthProvider api={api}><Probe /></AuthProvider>)
    fireEvent.click(screen.getByText('login'))
    // el hash de la contraseña (crypto.subtle) termina después del clic en Node: se espera el resultado
    expect((await screen.findByText('admin@nanitomangas.cl')).dataset.testid).toBe('user')
    expect(screen.getByTestId('json').textContent).not.toContain('passwordHash')
  })

  it('al montar recupera la sesión guardada', async () => {
    const u = await api.loginUser('admin@nanitomangas.cl', 'Admin1234')
    api.setSession(u.id)
    render(<AuthProvider api={api}><Probe /></AuthProvider>)
    expect((await screen.findByText('admin@nanitomangas.cl')).dataset.testid).toBe('user')
  })
})
