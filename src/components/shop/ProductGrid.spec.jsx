import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProductGrid from './ProductGrid.jsx'

const mk = (id) => ({ id, name: `Prod ${id}`, brand: 'B', price: 1000, salePrice: null, stock: 3, image: '/i.svg' })

describe('ProductGrid', () => {
  afterEach(cleanup)

  it('renderiza una tarjeta por producto', () => {
    render(<MemoryRouter><ProductGrid products={[mk('a'), mk('b'), mk('c')]} onAdd={() => {}} /></MemoryRouter>)
    expect(screen.getAllByRole('button', { name: 'Añadir al carro' }).length).toBe(3)
  })

  it('sin productos muestra EmptyState', () => {
    render(<MemoryRouter><ProductGrid products={[]} onAdd={() => {}} /></MemoryRouter>)
    expect(screen.getByText('No encontramos productos')).toBeTruthy()
  })
})
