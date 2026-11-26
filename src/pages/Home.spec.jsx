import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createFakeShop } from '../api/fakeShop.js'
import { flush } from '../../test/flush.js'
import Home from './Home.jsx'

const mk = (id, flags) => ({ id, name: `Prod ${id}`, brand: 'B', price: 1000, salePrice: null, stock: 3, image: '/i.svg', isNew: false, isBestSeller: false, isRestock: false, ...flags })
const banners = [{ id: 'b', title: 'Banner uno', text: 't', image: '/b.jpg', ctaLabel: 'Ir', to: '/ofertas' }]
let api
const setup = (products) => render(
  <MemoryRouter><CartProvider api={api}><Home products={products} banners={banners} /></CartProvider></MemoryRouter>,
)

describe('Home', () => {
  beforeEach(() => {
    api = createFakeShop().api
  })
  afterEach(cleanup)

  it('muestra los tres carruseles, y la franja informativa', async () => {
    setup([mk('a', { isNew: true }), mk('b', { isBestSeller: true }), mk('c', { isRestock: true })])
    await flush()
    ;['Novedades', 'Más vendidos', 'De vuelta en stock'].forEach((t) => {
      expect(screen.getByRole('heading', { level: 2, name: t })).toBeTruthy()
    })
    expect(screen.getByRole('region', { name: 'Información de la tienda' })).toBeTruthy()
  })

  it('omite un carrusel sin productos', async () => {
    setup([mk('a', { isNew: true }), mk('b', { isBestSeller: true })])
    await flush()
    expect(screen.queryByRole('heading', { name: 'De vuelta en stock' })).toBeNull()
  })

  it('las secciones salen en orden y "Ver todo" de Novedades va a /novedades', async () => {
    setup([mk('a', { isNew: true }), mk('b', { isBestSeller: true }), mk('c', { isRestock: true })])
    await flush()
    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)
    const order = ['Novedades', 'Más vendidos', 'De vuelta en stock'].map((t) => titles.indexOf(t))
    expect(order[0]).toBeGreaterThanOrEqual(0)
    expect(order).toEqual([...order].sort((x, y) => x - y))
    const section = screen.getByRole('heading', { level: 2, name: 'Novedades' }).closest('section')
    expect(within(section).getByRole('link', { name: /Ver todo/ }).getAttribute('href')).toBe('/novedades')
  })

  it('"Añadir al carro" de una tarjeta agrega ese producto al carro', async () => {
    setup([mk('manga-1', { isNew: true })])
    await flush()
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carro' }))
    expect(api.getCart()).toEqual([{ productId: 'manga-1', qty: 1 }])
  })
})
