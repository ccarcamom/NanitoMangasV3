import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import SearchBar from './SearchBar.jsx'

describe('SearchBar', () => {
  afterEach(cleanup)

  const setup = () => {
    const onSearch = vi.fn()
    render(<SearchBar onSearch={onSearch} />)
    return { onSearch, input: screen.getByRole('searchbox', { name: 'Buscar productos' }) }
  }

  it('envía el texto escrito sin espacios sobrantes', () => {
    const { onSearch, input } = setup()
    fireEvent.change(input, { target: { value: '  naruto ' } })
    fireEvent.submit(input.form)
    expect(onSearch).toHaveBeenCalledExactlyOnceWith('naruto')
  })

  it('no envía una búsqueda vacía o solo con espacios', () => {
    const { onSearch, input } = setup()
    fireEvent.submit(input.form)
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(input.form)
    expect(onSearch).not.toHaveBeenCalled()
  })
})
