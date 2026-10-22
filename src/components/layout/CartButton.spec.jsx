import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { gsap } from '../../lib/gsap.js'
import { mockReducedMotion } from '../../hooks/motionTest.js'
import CartButton from './CartButton.jsx'

describe('CartButton', () => {
  afterEach(cleanup)

  it('muestra el contador y enlaza al carro', () => {
    render(<MemoryRouter><CartButton count={3} /></MemoryRouter>)
    const link = screen.getByRole('link', { name: 'Carro, 3 productos' })
    expect(link.getAttribute('href')).toBe('/carro')
    expect(link.querySelector('.cart-badge').textContent).toBe('3')
  })

  it('rebota la bolsa al cambiar el contador sin animar al montar', () => {
    mockReducedMotion(false)
    const ui = (n) => <MemoryRouter><CartButton count={n} /></MemoryRouter>
    const { container, rerender } = render(ui(0))
    const bag = container.querySelector('.cart-btn__bag')
    expect(gsap.getTweensOf(bag).length > 0).toBe(false)
    rerender(ui(1))
    expect(gsap.getTweensOf(bag).length > 0).toBe(true)
    gsap.killTweensOf(bag)
  })

  it('oculta el contador en 0', () => {
    render(<MemoryRouter><CartButton count={0} /></MemoryRouter>)
    const link = screen.getByRole('link', { name: 'Carro vacío' })
    expect(link.querySelector('.cart-badge')).toBeNull()
  })
})
