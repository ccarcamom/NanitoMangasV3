import { render, screen, cleanup, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'
import Cart from './Cart.jsx'

// API propia sobre un storage falso: ningún spec toca el localStorage real.
let api
const setup = () => render(<MemoryRouter><CartProvider api={api}><Cart /></CartProvider></MemoryRouter>)
const summary = () => within(screen.getByRole('region', { name: 'Resumen' }))
const payLink = () => screen.getByRole('link', { name: 'Ir a pagar' })

describe('Cart', () => {
  beforeEach(() => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    api = { ...productsApi, ...createCartApi(storage, productsApi) }
  })
  afterEach(cleanup)

  it('carro vacío: estado vacío con enlace a la tienda y sin "Ir a pagar"', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: 'Tu carro' })).toBeTruthy()
    expect(screen.getByText('Tu carro está vacío')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver productos' }).getAttribute('href')).toBe('/')
    expect(screen.queryByRole('link', { name: 'Ir a pagar' })).toBeNull()
    expect(screen.queryByRole('region', { name: 'Resumen' })).toBeNull()
  })

  it('cambiar la cantidad actualiza el total de la línea y el Total', () => {
    api.addToCart('manga-1', 1) // $10.990
    setup()
    expect(summary().getByText('Subtotal').nextSibling.textContent).toBe('$10.990')
    fireEvent.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(screen.getAllByText('$21.980').length).toBeGreaterThan(0)
    expect(summary().getByText('Total').nextSibling.textContent).toBe('$25.970') // + envío $3.990
  })

  it('"Quitar" elimina la línea', () => {
    api.addToCart('manga-1', 1)
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Quitar One Piece - Tomo 1' }))
    expect(screen.getByText('Tu carro está vacío')).toBeTruthy()
  })

  it('"Retiro en tienda" deja el envío en $0 y cambia el total', () => {
    api.addToCart('manga-1', 1)
    setup()
    expect(summary().getByText('Envío').nextSibling.textContent).toBe('$3.990')
    expect(screen.getByText(/Te faltan \$29\.010 para envío gratis/)).toBeTruthy()
    fireEvent.click(screen.getByRole('radio', { name: 'Retiro en tienda' }))
    expect(summary().getByText('Envío').nextSibling.textContent).toBe('$0')
    expect(summary().getByText('Total').nextSibling.textContent).toBe('$10.990')
    expect(screen.queryByText(/Te faltan/)).toBeNull()
  })

  it('despacho gratis sobre el umbral muestra "Gratis"', () => {
    api.addToCart('funko-1', 2) // $39.980
    api.addToCart('manga-1', 1)
    setup()
    expect(summary().getByText('Envío').nextSibling.textContent).toBe('Gratis')
  })

  it('"Ir a pagar" enlaza a /checkout', () => {
    api.addToCart('manga-1', 1)
    setup()
    expect(screen.getByRole('link', { name: 'Ir a pagar' }).getAttribute('href')).toBe('/checkout')
  })

  it('producto borrado: avisa, permite quitarlo y bloquea el pago', () => {
    api.addToCart('funko-1', 1)
    api.addToCart('manga-1', 1)
    api.deleteProduct('funko-1')
    setup()
    expect(screen.getByText('Algunos productos ya no están disponibles')).toBeTruthy()
    expect(payLink().getAttribute('aria-disabled')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Quitar no disponibles' }))
    expect(screen.queryByText('Algunos productos ya no están disponibles')).toBeNull()
    expect(payLink().getAttribute('aria-disabled')).toBeNull()
  })

  it('varios productos borrados: un único botón accesible que los quita todos', () => {
    api.addToCart('funko-1', 1)
    api.addToCart('accesorio-1', 1)
    api.addToCart('manga-1', 1)
    api.deleteProduct('funko-1')
    api.deleteProduct('accesorio-1')
    setup()
    const buttons = screen.getAllByRole('button', { name: /no disponibles?/ })
    expect(buttons.length).toBe(1)
    expect(buttons[0].getAttribute('aria-label')).toBe('Quitar no disponibles')
    fireEvent.click(buttons[0])
    expect(screen.queryByText('Algunos productos ya no están disponibles')).toBeNull()
    expect(api.getCart()).toEqual([{ productId: 'manga-1', qty: 1 }])
  })

  it('cantidad sobre el stock: se ajusta al stock, avisa, totales coherentes y pago habilitado', () => {
    api.addToCart('manga-1', 3) // $10.990 c/u
    api.updateProduct('manga-1', { stock: 2 })
    setup()
    expect(api.getCart()).toEqual([{ productId: 'manga-1', qty: 2 }])
    expect(screen.getByRole('spinbutton').value).toBe('2')
    expect(screen.getByText('Ajustamos la cantidad al stock disponible')).toBeTruthy()
    expect(screen.getAllByText('$21.980').length).toBeGreaterThan(1) // línea y Subtotal
    expect(summary().getByText('Subtotal').nextSibling.textContent).toBe('$21.980')
    expect(screen.queryByText('Sin stock suficiente')).toBeNull()
    expect(payLink().getAttribute('aria-disabled')).toBeNull()
  })

  it('línea sin stock: queda marcada y el pago bloqueado', () => {
    api.addToCart('manga-1', 3)
    api.updateProduct('manga-1', { stock: 0 })
    setup()
    expect(screen.getByText('Sin stock suficiente')).toBeTruthy()
    expect(screen.queryByText('Ajustamos la cantidad al stock disponible')).toBeNull()
    expect(payLink().getAttribute('aria-disabled')).toBe('true')
  })
})
