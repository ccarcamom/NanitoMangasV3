import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { ThemeProvider } from '../../context/ThemeContext.jsx'
import { CartProvider } from '../../context/CartContext.jsx'
import { createFakeShop } from '../../api/fakeShop.js'
import { AuthContext, AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../api/fakeAuthApi.js'
import Header from './Header.jsx'

describe('Header', () => {
  afterEach(() => {
    cleanup()
    document.documentElement.removeAttribute('data-bs-theme')
  })

  it('muestra el logo y los 7 enlaces del menú', () => {
    const { storage, api } = createFakeShop()
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
    expect(labels).toEqual(['Inicio', 'Mangas', 'Memes', 'Funko Pop', 'Figuras', 'Accesorios', 'Ofertas', 'Novedades', 'Contacto'])
    expect(nav.querySelector('.nav-link.active').textContent).toBe('Ofertas')
  })

  it('Header_Memes_ofrece_Crear_y_Biblioteca', () => {
    const { storage, api } = createFakeShop()
    render(
      <MemoryRouter>
        <ThemeProvider storage={storage}>
          <AuthProvider api={createFakeAuthApi().api}>
            <CartProvider api={api}><Header /></CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Memes/ }))
    expect(screen.getByRole('link', { name: 'Crear' }).getAttribute('href')).toBe('/memes/crear')
    expect(screen.getByRole('link', { name: 'Biblioteca' }).getAttribute('href')).toBe('/memes/biblioteca')
  })

  describe('cuenta', () => {
    const renderWith = (authApi) => {
      const { storage, api } = createFakeShop()
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

    it('sin_sesion_muestra_Ingresar_y_Personal', async () => {
      renderWith(createFakeAuthApi().api)
      expect((await screen.findByRole('link', { name: 'Ingresar' })).getAttribute('href')).toBe('/ingresar')
      expect(screen.getByRole('link', { name: 'Personal' }).getAttribute('href')).toBe('/ingresar/personal')
    })

    it('menu_movil_incluye_Acceso_de_personal', async () => {
      renderWith(createFakeAuthApi().api)
      await screen.findByRole('link', { name: 'Ingresar' })
      const nav = screen.getByRole('navigation', { name: 'Menú principal' })
      const items = [...nav.querySelectorAll('a')]
      expect(items.at(-1).textContent).toBe('Acceso de personal')
      expect(items.at(-1).getAttribute('href')).toBe('/ingresar/personal')
    })

    it('con_sesion_no_muestra_los_accesos', async () => {
      const { api } = createFakeAuthApi()
      await api.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
      renderWith(api)
      await screen.findByRole('link', { name: /Ana/ })
      expect(screen.queryByRole('link', { name: 'Ingresar' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'Personal' })).toBeNull()
      expect(screen.queryByRole('link', { name: 'Acceso de personal' })).toBeNull()
    })

    it('con sesión muestra el primer nombre y "Salir" que cierra la sesión', async () => {
      const { api } = createFakeAuthApi()
      await api.registerUser({ name: 'Ana Pérez', email: 'ana@mail.cl', password: 'Clave1234' })
      renderWith(api)
      const link = await screen.findByRole('link', { name: /Ana/ })
      expect(link.textContent).not.toContain('Pérez')
      expect(link.getAttribute('href')).toBe('/cuenta')
      fireEvent.click(screen.getByRole('button', { name: 'Salir' }))
      expect(await screen.findByRole('link', { name: 'Ingresar' })).toBeTruthy()
      expect(await api.restoreSession()).toBeNull()
    })
  })

  describe('panel', () => {
    it('Header_muestra_enlace_a_panel_segun_rol', async () => {
      const { storage, api } = createFakeShop()
      const auth = createFakeAuthApi().api
      const view = () => render(
        <MemoryRouter>
          <ThemeProvider storage={storage}>
            <AuthProvider api={auth}>
              <CartProvider api={api}><Header /></CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </MemoryRouter>,
      )
      view()
      await screen.findByRole('link', { name: 'Ingresar' })
      expect(screen.queryByRole('link', { name: 'Panel' })).toBeNull()
      cleanup()
      await auth.registerUser({ name: 'Ana', email: 'ana@mail.cl', password: 'Clave1234' })
      view()
      await screen.findByRole('link', { name: /Ana/ })
      expect(screen.queryByRole('link', { name: 'Panel' })).toBeNull()
      cleanup()
      await auth.loginUser('vendedor@nanitomangas.cl', 'Vendedor1234')
      view()
      expect((await screen.findByRole('link', { name: 'Panel' })).getAttribute('href')).toBe('/vendedor')
      cleanup()
      await auth.loginUser('admin@nanitomangas.cl', 'Admin1234')
      view()
      expect((await screen.findByRole('link', { name: 'Panel' })).getAttribute('href')).toBe('/admin')
    })
  })

  describe('antes de que la sesión esté lista', () => {
    it('no muestra "Ingresar" ni "Salir" hasta que ready es true', () => {
      const { storage, api } = createFakeShop()
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
      const { storage, api } = createFakeShop()
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
