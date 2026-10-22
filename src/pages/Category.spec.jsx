import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'
import Category from './Category.jsx'

const mk = (id, extra) => ({ id, name: `Prod ${id}`, brand: 'B', categoryId: 'mangas', genre: null, price: 1000, salePrice: null, stock: 3, image: '/i.svg', isNew: false, ...extra })
const products = [
  mk('a', { genre: 'shonen' }), mk('b'),
  mk('c', { categoryId: 'funko', isNew: true }), mk('d', { isNew: true }),
]
let api
const setup = (url, onlyNew = false) => render(
  <MemoryRouter initialEntries={[url]}>
    <CartProvider api={api}>
      <Routes>
        <Route path="/categoria/:categoryId" element={<Category products={products} />} />
        <Route path="/novedades" element={<Category products={products} onlyNew={onlyNew} />} />
      </Routes>
    </CartProvider>
  </MemoryRouter>,
)

describe('Category', () => {
  beforeEach(() => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    api = { ...productsApi, ...createCartApi(storage, productsApi) }
  })
  afterEach(cleanup)

  it('lista la categoría con su título', () => {
    setup('/categoria/mangas')
    expect(screen.getByRole('heading', { level: 1, name: 'Mangas' })).toBeTruthy()
    expect(screen.queryByText('Prod c')).toBeNull()
  })

  it('?genero=shonen filtra', () => {
    setup('/categoria/mangas?genero=shonen')
    expect(screen.getByText('Prod a')).toBeTruthy()
    expect(screen.queryByText('Prod b')).toBeNull()
  })

  it('?genero= desconocido actúa como "Todos"', () => {
    setup('/categoria/mangas?genero=nada')
    expect(screen.getByText('Prod a')).toBeTruthy()
    expect(screen.getByText('Prod b')).toBeTruthy()
    expect(screen.getByText('Prod d')).toBeTruthy()
  })

  it('"Quitar filtros" limpia ?genero= y vuelve a mostrar todo', () => {
    setup('/categoria/mangas?genero=seinen')
    expect(screen.queryByText('Prod a')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtros' }))
    expect(screen.getByText('Prod a')).toBeTruthy()
    expect(screen.getByText('Prod b')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Quitar filtros' })).toBeNull()
  })

  it('categoría inexistente muestra el estado vacío', () => {
    setup('/categoria/nada')
    expect(screen.getAllByText('Categoría no encontrada').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeTruthy()
  })

  it('onlyNew lista solo isNew de todas las categorías', () => {
    setup('/novedades', true)
    expect(screen.getByRole('heading', { level: 1, name: 'Novedades' })).toBeTruthy()
    expect(screen.getByText('Prod c')).toBeTruthy()
    expect(screen.getByText('Prod d')).toBeTruthy()
    expect(screen.queryByText('Prod a')).toBeNull()
  })
})
