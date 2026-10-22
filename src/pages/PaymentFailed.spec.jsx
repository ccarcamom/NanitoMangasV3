import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import PaymentFailed from './PaymentFailed.jsx'

const setup = (state) => render(
  <MemoryRouter initialEntries={[{ pathname: '/pago-fallido', state }]}><PaymentFailed /></MemoryRouter>,
)

describe('PaymentFailed', () => {
  afterEach(cleanup)

  it('CARD_DECLINED muestra el rechazo del banco y los botones', () => {
    setup({ reason: 'CARD_DECLINED' })
    expect(screen.getByRole('heading', { level: 1, name: 'No se pudo realizar el pago' })).toBeTruthy()
    expect(screen.getByText('Tu banco rechazó el pago.')).toBeTruthy()
    expect(screen.getByText(/Tu carro sigue intacto/)).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Reintentar pago' }).getAttribute('href')).toBe('/checkout')
    expect(screen.getByRole('link', { name: 'Volver al carro' }).getAttribute('href')).toBe('/carro')
  })

  it('CARD_INVALID muestra datos inválidos', () => {
    setup({ reason: 'CARD_INVALID' })
    expect(screen.getByText('Los datos de la tarjeta no son válidos.')).toBeTruthy()
  })

  it('visita directa muestra el mensaje genérico', () => {
    setup(undefined)
    expect(screen.getByText('El pago no se completó.')).toBeTruthy()
  })
})
