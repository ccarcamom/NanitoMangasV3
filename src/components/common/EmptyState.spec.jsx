import { render, screen, cleanup } from '@testing-library/react'
import EmptyState from './EmptyState.jsx'

describe('EmptyState', () => {
  afterEach(cleanup)

  it('muestra título, texto y acción opcionales', () => {
    render(<EmptyState title="Nada" text="Prueba otra cosa" action={<button>Volver</button>} />)
    expect(screen.getByRole('heading', { name: 'Nada' })).toBeTruthy()
    expect(screen.getByText('Prueba otra cosa')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy()
  })

  it('omite texto y acción si no se dan', () => {
    const { container } = render(<EmptyState title="Nada" />)
    expect(container.querySelector('p')).toBeNull()
  })
})
