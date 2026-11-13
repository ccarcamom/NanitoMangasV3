import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import ProductCard from './ProductCard.jsx'

const base = { id: 'manga-1', name: 'Berserk 1', brand: 'Norma', price: 11990, salePrice: null, stock: 4, image: '/img/placeholder.svg' }
const setup = (p, onAdd = () => {}) => render(<MemoryRouter><ProductCard product={{ ...base, ...p }} onAdd={onAdd} /></MemoryRouter>)

describe('ProductCard', () => {
  afterEach(cleanup)

  it('muestra marca, nombre, imagen y precio', () => {
    setup()
    expect(screen.getByText('Norma')).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Berserk 1' }).getAttribute('loading')).toBe('lazy')
    expect(screen.getByText('$11.990')).toBeTruthy()
    expect(screen.getAllByRole('link')[0].getAttribute('href')).toBe('/producto/manga-1')
  })

  it('muestra "Agotado" solo con stock 0 y cambia el botón a "Ver detalles"', () => {
    setup({ stock: 0 })
    expect(screen.getByText('Agotado')).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Añadir al carro' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Ver detalles' }).getAttribute('href')).toBe('/producto/manga-1')
  })

  it('con stock no muestra "Agotado"', () => {
    setup()
    expect(screen.queryByText('Agotado')).toBeNull()
    expect(screen.getByRole('button', { name: 'Añadir al carro' })).toBeTruthy()
  })

  it('tacha el precio normal solo con oferta', () => {
    const { container } = setup({ salePrice: 9990 })
    expect(container.querySelector('s').textContent).toBe('$11.990')
    expect(screen.getByText('$9.990')).toBeTruthy()
    cleanup()
    const r = setup()
    expect(r.container.querySelector('s')).toBeNull()
  })

  it('al hacer clic en "Añadir al carro" llama onAdd con el id', () => {
    const onAdd = vi.fn()
    setup({}, onAdd)
    fireEvent.click(screen.getByRole('button', { name: 'Añadir al carro' }))
    expect(onAdd).toHaveBeenCalledWith('manga-1')
  })
})
