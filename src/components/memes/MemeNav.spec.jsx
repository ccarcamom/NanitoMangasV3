import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import MemeNav from './MemeNav.jsx'

const Where = () => <p data-testid="where">{useLocation().pathname}</p>

describe('MemeNav', () => {
  afterEach(cleanup)

  it('MemeNav_marca_la_pestaña_activa_y_navega_entre_Crear_y_Biblioteca', () => {
    render(<MemoryRouter initialEntries={['/memes/crear']}><MemeNav /><Where /></MemoryRouter>)
    const crear = screen.getByRole('link', { name: 'Crear' })
    const lib = screen.getByRole('link', { name: 'Biblioteca' })
    expect(crear.getAttribute('aria-current')).toBe('page')
    expect(lib.getAttribute('aria-current')).toBeNull()
    fireEvent.click(lib)
    expect(screen.getByTestId('where').textContent).toBe('/memes/biblioteca')
    expect(screen.getByRole('link', { name: 'Biblioteca' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Crear' }).getAttribute('aria-current')).toBeNull()
  })
})
