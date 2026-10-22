import { render, screen, cleanup } from '@testing-library/react'
import BrandStrip from './BrandStrip.jsx'

describe('BrandStrip', () => {
  afterEach(cleanup)

  it('muestra el título y una celda por editorial', () => {
    render(<BrandStrip brands={['Uno', 'Dos']} />)
    expect(screen.getByRole('heading', { name: 'Nuestras editoriales' })).toBeTruthy()
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual(['Uno', 'Dos'])
  })
})
