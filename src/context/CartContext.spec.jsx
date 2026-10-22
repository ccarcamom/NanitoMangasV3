import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext.jsx'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'

function Probe() {
  const { count, lines, missing, add, totals } = useCart()
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="lines">{lines.length}</span>
      <span data-testid="missing">{missing.join(',')}</span>
      <span data-testid="subtotal">{totals('retiro').subtotal}</span>
      <button type="button" onClick={() => add('manga-1')}>add</button>
    </div>
  )
}

describe('CartContext', () => {
  let api
  beforeEach(() => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    api = { ...productsApi, ...createCartApi(storage, productsApi) }
  })
  afterEach(cleanup)

  it('add aumenta count y recalcula las líneas', () => {
    render(<CartProvider api={api}><Probe /></CartProvider>)
    expect(screen.getByTestId('count').textContent).toBe('0')
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('count').textContent).toBe('2')
    expect(screen.getByTestId('lines').textContent).toBe('1')
    const price = api.getProduct('manga-1').salePrice ?? api.getProduct('manga-1').price
    expect(screen.getByTestId('subtotal').textContent).toBe(String(price * 2))
  })

  it('saca de lines un producto borrado y lo informa en missing', () => {
    render(<CartProvider api={api}><Probe /></CartProvider>)
    fireEvent.click(screen.getByText('add'))
    act(() => { api.deleteProduct('manga-1') })
    expect(screen.getByTestId('lines').textContent).toBe('0')
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('missing').textContent).toBe('manga-1')
  })
})
