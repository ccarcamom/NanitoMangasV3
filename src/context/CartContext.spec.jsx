import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext.jsx'
import { createFakeShop } from '../api/fakeShop.js'
import { flush } from '../../test/flush.js'

function Probe() {
  const { count, lines, missing, loading, add, reload, totals } = useCart()
  return (
    <div>
      <span data-testid="count">{count}</span>
      <span data-testid="lines">{lines.length}</span>
      <span data-testid="missing">{missing.join(',')}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="subtotal">{totals('retiro').subtotal}</span>
      <button type="button" onClick={() => add('manga-1')}>add</button>
      <button type="button" onClick={reload}>reload</button>
    </div>
  )
}

describe('CartContext', () => {
  let api
  beforeEach(() => { api = createFakeShop().api })
  afterEach(cleanup)

  it('add aumenta count y recalcula las líneas', async () => {
    render(<CartProvider api={api}><Probe /></CartProvider>)
    await flush()
    expect(screen.getByTestId('count').textContent).toBe('0')
    fireEvent.click(screen.getByText('add'))
    fireEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('count').textContent).toBe('2')
    expect(screen.getByTestId('lines').textContent).toBe('1')
    const price = api.getProduct('manga-1').salePrice ?? api.getProduct('manga-1').price
    expect(screen.getByTestId('subtotal').textContent).toBe(String(price * 2))
  })

  it('saca de lines un producto borrado (al recargar) y lo informa en missing', async () => {
    render(<CartProvider api={api}><Probe /></CartProvider>)
    await flush()
    fireEvent.click(screen.getByText('add'))
    act(() => { api.deleteProduct('manga-1') })
    fireEvent.click(screen.getByText('reload'))
    await flush()
    expect(screen.getByTestId('lines').textContent).toBe('0')
    expect(screen.getByTestId('count').textContent).toBe('0')
    expect(screen.getByTestId('missing').textContent).toBe('manga-1')
  })

  it('mientras cargan los productos no declara nada como no disponible', async () => {
    api.addToCart('manga-1', 1)
    render(<CartProvider api={api}><Probe /></CartProvider>)
    expect(screen.getByTestId('loading').textContent).toBe('true')
    expect(screen.getByTestId('missing').textContent).toBe('')
    expect(screen.getByTestId('count').textContent).toBe('1')
    await flush()
    expect(screen.getByTestId('loading').textContent).toBe('false')
    expect(screen.getByTestId('lines').textContent).toBe('1')
  })
})
