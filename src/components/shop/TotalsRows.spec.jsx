import { render, screen, cleanup } from '@testing-library/react'
import TotalsRows from './TotalsRows.jsx'

const totals = { subtotal: 50000, shipping: 0, total: 50000 }

describe('TotalsRows', () => {
  afterEach(cleanup)

  it('con despacho y envío 0 muestra "Gratis"', () => {
    render(<TotalsRows totals={totals} method="despacho" />)
    expect(screen.getByText('Gratis')).toBeTruthy()
  })

  it('sin método (o con retiro) muestra el monto del envío', () => {
    render(<TotalsRows totals={totals} />)
    expect(screen.queryByText('Gratis')).toBeNull()
    expect(screen.getByText('Envío').nextSibling.textContent).toMatch(/\$\s?0/)
  })
})
