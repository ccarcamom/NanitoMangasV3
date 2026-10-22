import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import Contact from './Contact.jsx'

const fill = (nombre, correo, mensaje) => {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: nombre } })
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: correo } })
  fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: mensaje } })
  fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
}

describe('Contact', () => {
  beforeEach(() => render(<Contact />))
  afterEach(cleanup)

  it('correo inválido muestra error y no confirma', () => {
    fill('Ana', 'ana@', 'Hola, quiero consultar algo')
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy()
    expect(screen.queryByText('Gracias, recibimos tu mensaje')).toBeNull()
  })

  it('mensaje corto y nombre vacío muestran sus errores', () => {
    fill('', 'ana@mail.cl', 'corto')
    expect(screen.getByText('Ingresa tu nombre.')).toBeTruthy()
    expect(screen.getByText('El mensaje debe tener al menos 10 caracteres.')).toBeTruthy()
  })

  it('datos válidos confirman y limpian el formulario', () => {
    fill('Ana', 'ana@mail.cl', 'Hola, quiero consultar algo')
    expect(screen.getByText('Gracias, recibimos tu mensaje')).toBeTruthy()
    expect(screen.getByLabelText('Nombre').value).toBe('')
    expect(screen.getByLabelText('Correo').value).toBe('')
    expect(screen.getByLabelText('Mensaje').value).toBe('')
  })
})
