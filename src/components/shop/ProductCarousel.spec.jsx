import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { mockReducedMotion } from '../../hooks/motionTest.js'
import ProductCarousel from './ProductCarousel.jsx'

const mk = (id) => ({ id, name: `Prod ${id}`, brand: 'B', price: 1000, salePrice: null, stock: 3, image: '/i.svg' })
const setup = (props = {}) => render(
  <MemoryRouter><ProductCarousel title="Novedades" products={[mk('a'), mk('b')]} onAdd={() => {}} {...props} /></MemoryRouter>,
)

describe('ProductCarousel', () => {
  afterEach(cleanup)

  it('muestra título y una tarjeta por producto', () => {
    setup()
    expect(screen.getByRole('heading', { level: 2, name: 'Novedades' })).toBeTruthy()
    expect(screen.getAllByRole('button', { name: 'Añadir al carro' }).length).toBe(2)
  })

  it('"Ver todo" solo con seeAllTo', () => {
    setup()
    expect(screen.queryByRole('link', { name: 'Ver todo' })).toBeNull()
    cleanup()
    setup({ seeAllTo: '/ofertas' })
    expect(screen.getByRole('link', { name: 'Ver todo' }).getAttribute('href')).toBe('/ofertas')
  })

  it('Siguiente y Anterior llaman scrollBy en la pista', () => {
    const { container } = setup()
    const track = container.querySelector('.carousel-track')
    const spy = spyOn(track, 'scrollBy')
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.calls.mostRecent().args[0].left).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(spy.calls.mostRecent().args[0].left).toBeLessThan(0)
  })

  it('scrollBy respeta prefers-reduced-motion al hacer clic', () => {
    const { container } = setup()
    const track = container.querySelector('.carousel-track')
    const spy = spyOn(track, 'scrollBy')
    const mm = mockReducedMotion(true)
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(spy.calls.mostRecent().args[0].behavior).toBe('auto')
    mm.and.callFake((q) => ({ matches: false, media: q }))
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    expect(spy.calls.mostRecent().args[0].behavior).toBe('smooth')
  })
})
