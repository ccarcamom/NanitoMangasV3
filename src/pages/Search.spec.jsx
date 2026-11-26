import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createFakeShop } from '../api/fakeShop.js'
import { flush } from '../../test/flush.js'
import Search from './Search.jsx'

const products = [{ id: 'a', name: 'Naruto 1', brand: 'Panini', categoryId: 'mangas', price: 1000, salePrice: null, stock: 3, image: '/i.svg' }]
let api
const setup = (q) => render(<MemoryRouter initialEntries={[`/buscar?q=${encodeURIComponent(q)}`]}><CartProvider api={api}><Search products={products} /></CartProvider></MemoryRouter>)

describe('Search', () => {
  beforeEach(() => {
    api = createFakeShop().api
  })
  afterEach(cleanup)

  it('sin resultados muestra estado vacío con enlace al inicio', async () => {
    setup('zzzz')
    await flush()
    expect(screen.getByText('No encontramos resultados')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toBeTruthy()
  })

  it('con coincidencia lista el producto y la cantidad', async () => {
    setup('naruto')
    await flush()
    expect(screen.getByText('Naruto 1')).toBeTruthy()
    expect(screen.getByText('1 producto')).toBeTruthy()
  })

  it('el h1 muestra la consulta', async () => {
    setup('naruto')
    await flush()
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Resultados para “naruto”')
  })

  it('q vacío pide escribir algo', async () => {
    setup('')
    await flush()
    expect(screen.getByText('Escribe algo para buscar')).toBeTruthy()
  })

  it('caracteres de regex no lanzan error', async () => {
    expect(() => setup('(*')).not.toThrow()
    expect(screen.getByText('No encontramos resultados')).toBeTruthy()
  })
})
