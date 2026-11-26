import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { createFakeShop } from './api/fakeShop.js'
import { createFakeAuthApi } from './api/fakeAuthApi.js'
import AppRoutes from './routes.jsx'

vi.mock('./pages/MemeEditor.jsx', () => ({ default: () => <p>editor de memes</p> }))
vi.mock('./pages/MemeLibrary.jsx', () => ({ default: () => <p>biblioteca de memes</p> }))
vi.mock('./pages/Home.jsx', () => ({ default: () => <p>pantalla inicio</p> }))
vi.mock('./pages/Login.jsx', () => ({ default: () => <p>pantalla ingresar</p> }))

const renderAt = async (path, login) => {
  const { storage, api } = createFakeShop()
  const auth = createFakeAuthApi().api
  if (login) await auth.loginUser(...login)
  else cleanup()
  render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider storage={storage}><AuthProvider api={auth}><CartProvider api={api}><AppRoutes /></CartProvider></AuthProvider></ThemeProvider>
    </MemoryRouter>,
  )
}

describe('rutas de memes', () => {
  afterEach(cleanup)

  it.each(['/memes/crear', '/memes/biblioteca'])('sin_sesion_redirige_a_ingresar %s', async (path) => {
    await renderAt(path)
    await screen.findByText('pantalla ingresar')
  })

  it.each(['/memes/crear', '/memes/biblioteca'])('rol_VENDEDOR_vuelve_al_inicio %s', async (path) => {
    await renderAt(path, ['vendedor@nanitomangas.cl', 'Vendedor1234'])
    await screen.findByText('pantalla inicio')
  })

  it('un cliente entra a ambas páginas', async () => {
    const auth = createFakeAuthApi().api
    await auth.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
    const { storage, api } = createFakeShop()
    render(
      <MemoryRouter initialEntries={['/memes/biblioteca']}>
        <ThemeProvider storage={storage}><AuthProvider api={auth}><CartProvider api={api}><AppRoutes /></CartProvider></AuthProvider></ThemeProvider>
      </MemoryRouter>,
    )
    await screen.findByText('biblioteca de memes')
  })
})
