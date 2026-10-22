import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { ThemeProvider } from '../../context/ThemeContext.jsx'
import { CartProvider } from '../../context/CartContext.jsx'
import { createStorage } from '../../data/storage.js'
import { fakeBackend } from '../../data/fakeBackend.js'
import { createProductsApi } from '../../data/products.js'
import { createCartApi } from '../../data/cart.js'
import { AuthContext, AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../data/fakeAuthApi.js'
import Header from './Header.jsx'

describe('Header', () => {
  afterEach(() => {
    cleanup()
    document.documentElement.removeAttribute('data-bs-theme')
  })

  it('muestra el logo y los 7 enlaces del menú', () => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    const api = { ...productsApi, ...createCartApi(storage, productsApi) }
    render(
      <MemoryRouter initialEntries={['/ofertas']}>
        <ThemeProvider storage={storage}>
          <AuthProvider api={createFakeAuthApi().api}>
            <CartProvider api={api}><Header /></CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /NanitoMangas/ }).getAttribute('href')).toBe('/')
    const nav = screen.getByRole('navigation', { name: 'Menú principal' })
    const labels = [...nav.querySelectorAll('.nav-link')].map((a) => a.textContent.trim())
    expect(labels).toEqual(['Inicio', 'Mangas', 'Funko Pop', 'Figuras', 'Accesorios', 'Ofertas', 'Novedades', 'Contacto'])
    expect(nav.querySelector('.nav-link.active').textContent).toBe('Ofertas')
  })

  describe('cuenta', () => {
    const renderWith = (authApi) => {
      const storage = createStorage(fakeBackend())
      const productsApi = createProductsApi(storage)
      const api = { ...productsApi, ...createCartApi(storage, productsApi) }
      return render(
        <MemoryRouter>
          <ThemeProvider storage={storage}>
            <AuthProvider api={authApi}>
              <CartProvider api={api}><Header /></CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>,
      )
    }

    it('sin sesión muestra "Ingresar" y no "Salir"', async () => {
      renderWith(createFakeAuthApi().api)
      const link = await screen.findByRole('link', { name: 'Ingresar' })
      expect(link.getAttribute('href')).toBe('/ingresar')
      expect(screen.queryByRole('button', { name: 'Salir' })).toBeNull()
    })

    it('con sesión muestra el primer nombre y "Salir" que cierra la sesión', async () => {
      const { api } = createFakeAuthApi()
      const u = await api.registerUser({ name: 'Ana Pérez', email: 'ana@mail.cl', password: 'Clave1234' })
      api.setSession(u.id)
      renderWith(api)
      const link = await screen.findByRole('link', { name: /Ana/ })
      expect(link.textContent).not.toContain('Pérez')
      expect(link.getAttribute('href')).toBe('/cuenta')
      fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
      expect(await screen.findByRole('link', { name: 'Ingresar' })).toBeTruthy()
      expect(api.getSessionUserId()).toBeNull()
    })
  })

  describe('antes de que la sesión esté lista', () => {
    it('no muestra "Ingresar" ni "Salir" hasta que ready es true', () => {
      const storage = createStorage(fakeBackend())
      const productsApi = createProductsApi(storage)
      const api = { ...productsApi, ...createCartApi(storage, productsApi) }
      render(
        <MemoryRouter>
          <ThemeProvider storage={storage}>
            <AuthContext.Provider value={{ user: null, ready: false }}>
              <CartProvider api={api}><Header /></CartProvider>
            </AuthContext.Provider>
          </ThemeProvider>
        </MemoryRouter>,
      )
      expect(screen.queryByRole('link', { name: 'Ingresar' })).toBeNull()
      expect(screen.queryByRole('button', { name: 'Salir' })).toBeNull()
    })
  })

  describe('navegación', () => {
    const Where = () => { const l = useLocation(); return <output data-testid="where">{l.pathname + l.search}</output> }
    const setup = () => {
      const storage = createStorage(fakeBackend())
      const productsApi = createProductsApi(storage)
      const api = { ...productsApi, ...createCartApi(storage, productsApi) }
      return render(
        <MemoryRouter>
          <ThemeProvider storage={storage}>
            <AuthProvider api={createFakeAuthApi().api}>
              <CartProvider api={api}><Header /><Where /></CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>,
      )
    }

    it('el desplegable de Mangas enlaza cada género y "Ver todo"', () => {
      setup()
      fireEvent.click(screen.getByRole('button', { name: /Mangas/ }))
      const nav = screen.getByRole('navigation', { name: 'Menú principal' })
      const hrefs = [...nav.querySelectorAll('.dropdown-item')].map((a) => a.getAttribute('href'))
      expect(hrefs.length).toBeGreaterThan(1)
      hrefs.slice(0, -1).forEach((h) => expect(h).toMatch(/^\/categoria\/mangas\?genero=[a-z]+$/))
      expect(hrefs.at(-1)).toBe('/categoria/mangas')
      expect(within(nav).getByRole('link', { name: 'Ver todo' }).getAttribute('href')).toBe('/categoria/mangas')
    })

    it('sin sesión el enlace de cuenta va a /ingresar, no a /cuenta', async () => {
      setup()
      const link = await screen.findByRole('link', { name: 'Ingresar' })
      expect(link.getAttribute('href')).toBe('/ingresar')
      expect(document.querySelector('a[href="/cuenta"]')).toBeNull()
    })

    it('enviar la búsqueda navega a /buscar?q=...', () => {
      setup()
      const [box] = screen.getAllByRole('searchbox', { name: 'Buscar productos' })
      fireEvent.change(box, { target: { value: 'one piece' } })
      fireEvent.submit(box.form)
      expect(screen.getByTestId('where').textContent).toBe('/buscar?q=one%20piece')
    })

    it('los dos buscadores (escritorio y móvil) comparten el texto', () => {
      setup()
      const boxes = screen.getAllByRole('searchbox', { name: 'Buscar productos' })
      expect(boxes.length).toBe(2)
      fireEvent.change(boxes[0], { target: { value: 'naruto' } })
      expect(boxes[1].value).toBe('naruto')
      fireEvent.change(boxes[1], { target: { value: 'berserk' } })
      expect(boxes[0].value).toBe('berserk')
    })
  })
})
