import { render, screen, cleanup } from '@testing-library/react'
import FormField from './FormField.jsx'

describe('FormField', () => {
  afterEach(cleanup)

  it('sin error no muestra mensaje ni marca inválido', () => {
    const { container } = render(<FormField id="x" label="Nombre" />)
    const input = screen.getByLabelText('Nombre')
    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBeNull()
    expect(document.querySelector('.form-field__error')).toBeNull()
    expect(container.textContent).toBe('Nombre')
  })

  it('con error lo muestra y lo vincula con aria-describedby', () => {
    render(<FormField id="x" label="Nombre" error="Falta el nombre" />)
    const input = screen.getByLabelText('Nombre')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(input.getAttribute('aria-describedby')).textContent).toBe('Falta el nombre')
  })

  it('soporta textarea', () => {
    render(<FormField id="m" label="Mensaje" as="textarea" />)
    expect(screen.getByLabelText('Mensaje').tagName).toBe('TEXTAREA')
  })

  it('un select usa form-select (con flecha) y un input form-control', () => {
    render(<><FormField id="r" label="Región" as="select"><option>A</option></FormField><FormField id="n" label="Nombre" /></>)
    expect(screen.getByLabelText('Región').className).toBe('form-select')
    expect(screen.getByLabelText('Nombre').className).toBe('form-control')
  })
})
