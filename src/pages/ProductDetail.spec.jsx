import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'
import ProductDetail from './ProductDetail.jsx'

const mk = (id, extra) => ({ id, name: `Prod ${id}`, brand: 'Marca', categoryId: 'mangas', genre: 'shonen', price: 10000, salePrice: null, stock: 10, image: '/i.svg', description: `Desc ${id}`, isNew: false, ...extra })
const products = [
  mk('a'), mk('manga-1'), mk('sale', { price: 10000, salePrice: 7500 }), mk('out', { stock: 0 }), mk('low', { stock: 3 }),
  mk('r1'), mk('r2'), mk('r3'), mk('r4'), mk('r5'), mk('f1', { categoryId: 'funko', genre: null }),
]
let api
const info = () => within(document.querySelector('.detail__info'))
const setup = (id) => render(
  <MemoryRouter initialEntries={[`/producto/${id}`]}>
    <CartProvider api={api}>
      <Routes><Route path="/producto/:id" element={<ProductDetail products={products} />} /></Routes>
    </CartProvider>
  </MemoryRouter>,
)

describe('ProductDetail', () => {
  beforeEach(() => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    api = { ...productsApi, ...createCartApi(storage, productsApi) }
  })
  afterEach(cleanup)

  it('muestra nombre, marca, categoría, género, descripción y stock', () => {
    setup('a')
    expect(screen.getByRole('heading', { level: 1, name: 'Prod a' })).toBeTruthy()
    expect(screen.getAllByText('Marca').length).toBeGreaterThan(0)
    expect(screen.getByText('Mangas · Shonen')).toBeTruthy()
    expect(screen.getByText('Desc a')).toBeTruthy()
    expect(screen.getByText('Disponible')).toBeTruthy()
  })

  it('con pocas unidades avisa cuántas quedan', () => {
    setup('low')
    expect(screen.getByText('Quedan 3 unidades')).toBeTruthy()
  })

  it('agotado: muestra aviso, sin cantidad ni "Añadir al carro"', () => {
    setup('out')
    expect(screen.getAllByText('Agotado').length).toBeGreaterThan(0)
    expect(info().queryByRole('button', { name: 'Añadir al carro' })).toBeNull()
    expect(info().queryByRole('spinbutton')).toBeNull()
  })

  it('id inexistente muestra el estado vacío con enlace a la tienda', () => {
    setup('nada')
    expect(screen.getAllByText('Producto no encontrado').length).toBe(2)
    expect(screen.getByRole('link', { name: 'Ir a la tienda' }).getAttribute('href')).toBe('/')
  })

  it('"Añadir al carro" agrega la cantidad elegida y confirma con enlace al carro', () => {
    setup('manga-1') // id real de la semilla: el carro valida contra el stock guardado
    fireEvent.click(info().getByRole('button', { name: 'Sumar uno' }))
    fireEvent.click(info().getByRole('button', { name: 'Añadir al carro' }))
    expect(api.getCart()).toEqual([{ productId: 'manga-1', qty: 2 }])
    expect(screen.getByText('Añadido al carro')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver carro' }).getAttribute('href')).toBe('/carro')
  })

  it('con oferta tacha el precio normal y muestra el descuento calculado', () => {
    setup('sale')
    expect(document.querySelector('.detail__info s').textContent).toBe('$10.000')
    expect(screen.getAllByText('$7.500').length).toBeGreaterThan(0)
    expect(screen.getByText('-25%')).toBeTruthy()
  })

  it('sin oferta no hay precio tachado ni descuento', () => {
    setup('a')
    expect(document.querySelector('.detail__info s')).toBeNull()
    expect(screen.queryByText(/^-\d+%$/)).toBeNull()
  })

  it('relacionados: misma categoría, máximo 4, sin el producto actual', () => {
    setup('a')
    const region = screen.getByRole('region', { name: 'Productos relacionados' })
    const names = within(region).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(names.length).toBe(4)
    expect(names).not.toContain('Prod a')
    expect(names).not.toContain('Prod f1')
  })

  it('sin relacionados oculta la sección', () => {
    setup('f1')
    expect(screen.queryByRole('region', { name: 'Productos relacionados' })).toBeNull()
  })
})
