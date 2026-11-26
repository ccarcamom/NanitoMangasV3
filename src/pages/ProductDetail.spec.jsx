import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createFakeShop } from '../api/fakeShop.js'
import { flush } from '../../test/flush.js'
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
    api = createFakeShop().api
  })
  afterEach(cleanup)

  it('muestra nombre, marca, categoría, género, descripción y stock', async () => {
    setup('a')
    await flush()
    expect(screen.getByRole('heading', { level: 1, name: 'Prod a' })).toBeTruthy()
    expect(screen.getAllByText('Marca').length).toBeGreaterThan(0)
    expect(screen.getByText('Mangas · Shonen')).toBeTruthy()
    expect(screen.getByText('Desc a')).toBeTruthy()
    expect(screen.getByText('Disponible')).toBeTruthy()
  })

  it('con pocas unidades avisa cuántas quedan', async () => {
    setup('low')
    await flush()
    expect(screen.getByText('Quedan 3 unidades')).toBeTruthy()
  })

  it('agotado: muestra aviso, sin cantidad ni "Añadir al carro"', async () => {
    setup('out')
    await flush()
    expect(screen.getAllByText('Agotado').length).toBeGreaterThan(0)
    expect(info().queryByRole('button', { name: 'Añadir al carro' })).toBeNull()
    expect(info().queryByRole('spinbutton')).toBeNull()
  })

  it('id inexistente muestra el estado vacío con enlace a la tienda', async () => {
    setup('nada')
    await flush()
    expect(screen.getAllByText('Producto no encontrado')).toHaveLength(1)
    expect(screen.getByText('Ese producto no existe o ya no está a la venta.')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ir a la tienda' }).getAttribute('href')).toBe('/')
  })

  it('"Añadir al carro" agrega la cantidad elegida y confirma con enlace al carro', async () => {
    setup('manga-1') // id real de la semilla: el carro valida contra el stock guardado
    await flush()
    fireEvent.click(info().getByRole('button', { name: 'Sumar uno' }))
    fireEvent.click(info().getByRole('button', { name: 'Añadir al carro' }))
    expect(api.getCart()).toEqual([{ productId: 'manga-1', qty: 2 }])
    expect(screen.getByText('Añadido al carro')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver carro' }).getAttribute('href')).toBe('/carro')
  })

  it('con oferta tacha el precio normal y muestra el descuento calculado', async () => {
    setup('sale')
    await flush()
    expect(document.querySelector('.detail__info s').textContent).toBe('$10.000')
    expect(screen.getAllByText('$7.500').length).toBeGreaterThan(0)
    expect(screen.getByText('-25%')).toBeTruthy()
  })

  it('sin oferta no hay precio tachado ni descuento', async () => {
    setup('a')
    await flush()
    expect(document.querySelector('.detail__info s')).toBeNull()
    expect(screen.queryByText(/^-\d+%$/)).toBeNull()
  })

  it('los mangas ofrecen "Leer avance" hacia el lector; otras categorías no', async () => {
    setup('a')
    await flush()
    expect(screen.getByRole('link', { name: 'Leer avance' }).getAttribute('href')).toBe('/leer/a')
    cleanup()
    setup('f1')
    await flush()
    expect(screen.queryByRole('link', { name: 'Leer avance' })).toBeNull()
  })

  it('relacionados: misma categoría, máximo 4, sin el producto actual', async () => {
    setup('a')
    await flush()
    const region = screen.getByRole('region', { name: 'Productos relacionados' })
    const names = within(region).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(names.length).toBe(4)
    expect(names).not.toContain('Prod a')
    expect(names).not.toContain('Prod f1')
  })

  it('sin relacionados oculta la sección', async () => {
    setup('f1')
    await flush()
    expect(screen.queryByRole('region', { name: 'Productos relacionados' })).toBeNull()
  })
})
