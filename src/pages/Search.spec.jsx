import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'
import Search from './Search.jsx'

const products = [{ id: 'a', name: 'Naruto 1', brand: 'Panini', categoryId: 'mangas', price: 1000, salePrice: null, stock: 3, image: '/i.svg' }]
let api
const setup = (q) => render(<MemoryRouter initialEntries={[`/buscar?q=${encodeURIComponent(q)}`]}><CartProvider api={api}><Search products={products} /></CartProvider></MemoryRouter>)

describe('Search', () => {
  beforeEach(() => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    api = { ...productsApi, ...createCartApi(storage, productsApi) }
  })
  afterEach(cleanup)

  it('sin resultados muestra estado vacío con enlace al inicio', () => {
    setup('zzzz')
    expect(screen.getByText('No encontramos resultados')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeTruthy()
  })

  it('con coincidencia lista el producto y la cantidad', () => {
    setup('naruto')
    expect(screen.getByText('Naruto 1')).toBeTruthy()
    expect(screen.getByText('1 producto')).toBeTruthy()
  })

  it('el h1 muestra la consulta', () => {
    setup('naruto')
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Resultados para “naruto”')
  })

  it('q vacío pide escribir algo', () => {
    setup('')
    expect(screen.getByText('Escribe algo para buscar')).toBeTruthy()
  })

  it('caracteres de regex no lanzan error', () => {
    expect(() => setup('(*')).not.toThrow()
    expect(screen.getByText('No encontramos resultados')).toBeTruthy()
  })
})
