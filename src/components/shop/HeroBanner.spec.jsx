import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import HeroBanner from './HeroBanner.jsx'

const banners = [
  { id: 'a', title: 'Primero', text: 'Texto A', image: '/a.jpg', ctaLabel: 'Ir a A', to: '/ofertas' },
  { id: 'b', title: 'Segundo', text: 'Texto B', image: '/b.jpg', ctaLabel: 'Ir a B', to: '/novedades' },
]

describe('HeroBanner', () => {
  afterEach(cleanup)

  it('renderiza un slide por banner con título, imagen y CTA hacia su ruta', () => {
    const { container } = render(<MemoryRouter><HeroBanner banners={banners} /></MemoryRouter>)
    expect(container.querySelectorAll('.carousel-item').length).toBe(2)
    expect(screen.getAllByRole('heading', { level: 1, hidden: true }).length).toBe(1)
    expect(screen.getByText('Segundo')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ir a A', hidden: true }).getAttribute('href')).toBe('/ofertas')
    expect(screen.getByRole('link', { name: 'Ir a B', hidden: true }).getAttribute('href')).toBe('/novedades')
    expect(container.querySelector('img').getAttribute('alt')).toBe('Primero')
  })

  it('la primera imagen es prioritaria (LCP) y las demás cargan perezosas', () => {
    const { container } = render(<MemoryRouter><HeroBanner banners={banners} /></MemoryRouter>)
    const [a, b] = container.querySelectorAll('img')
    expect(a.getAttribute('fetchpriority')).toBe('high')
    expect(a.getAttribute('loading')).toBe('eager')
    expect(b.getAttribute('fetchpriority')).toBeNull()
    expect(b.getAttribute('loading')).toBe('lazy')
  })
})
