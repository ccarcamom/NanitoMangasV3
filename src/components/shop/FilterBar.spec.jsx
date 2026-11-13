import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import FilterBar from './FilterBar.jsx'

const genres = [{ id: 'shonen', name: 'Shonen' }, { id: 'seinen', name: 'Seinen' }]

describe('FilterBar', () => {
  afterEach(cleanup)

  it('cambiar orden informa { sort }', () => {
    const onChange = vi.fn()
    render(<FilterBar genres={genres} sort="name" genre={null} onChange={onChange} />)
    fireEvent.change(screen.getByLabelText('Ordenar por'), { target: { value: 'price-asc' } })
    expect(onChange).toHaveBeenCalledWith({ sort: 'price-asc' })
  })

  it('clic en un género informa { genre } y marca el activo', () => {
    const onChange = vi.fn()
    render(<FilterBar genres={genres} sort="name" genre="seinen" onChange={onChange} />)
    fireEvent.click(screen.getByRole('button', { name: 'Shonen' }))
    expect(onChange).toHaveBeenCalledWith({ genre: 'shonen' })
    expect(screen.getByRole('button', { name: 'Seinen' }).getAttribute('aria-pressed')).toBe('true')
    fireEvent.click(screen.getByRole('button', { name: 'Todos' }))
    expect(onChange).toHaveBeenCalledWith({ genre: null })
  })

  it('sin géneros no muestra chips', () => {
    render(<FilterBar genres={[]} sort="name" genre={null} onChange={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Todos' })).toBeNull()
  })
})
