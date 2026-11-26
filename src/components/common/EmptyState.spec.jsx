import { render, screen, cleanup } from '@testing-library/react'
import EmptyState from './EmptyState.jsx'

describe('EmptyState', () => {
  afterEach(cleanup)

  it('muestra título y acción opcional', () => {
    render(<EmptyState title="Nada" action={<button>Volver</button>} />)
    expect(screen.getByRole('heading', { name: 'Nada' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy()
  })

  it('omite la acción si no se da', () => {
    const { container } = render(<EmptyState title="Nada" />)
    expect(container.querySelector('button')).toBeNull()
  })
})
