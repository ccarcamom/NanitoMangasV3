import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'
import Offers from './Offers.jsx'

const mk = (id, salePrice) => ({ id, name: `Prod ${id}`, brand: 'B', categoryId: 'mangas', price: 1000, salePrice, stock: 3, image: '/i.svg' })
let api
const setup = (products) => render(<MemoryRouter><CartProvider api={api}><Offers products={products} /></CartProvider></MemoryRouter>)

describe('Offers', () => {
  beforeEach(() => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    api = { ...productsApi, ...createCartApi(storage, productsApi) }
  })
  afterEach(cleanup)

  it('solo lista productos con oferta', () => {
    setup([mk('a', 800), mk('b', null), mk('c', 1500)])
    expect(screen.getByRole('heading', { level: 1, name: 'Ofertas' })).toBeTruthy()
    expect(screen.getByText('Prod a')).toBeTruthy()
    expect(screen.queryByText('Prod b')).toBeNull()
    expect(screen.queryByText('Prod c')).toBeNull()
  })

  it('sin ofertas muestra el estado vacío', () => {
    setup([mk('b', null)])
    expect(screen.getByText('Por ahora no hay ofertas')).toBeTruthy()
  })
})
