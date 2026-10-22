import { useState } from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import CardForm, { validateCard } from './CardForm.jsx'

const blank = { number: '', expiry: '', cvv: '' }
function Harness({ errors }) {
  const [value, setValue] = useState(blank)
  return <CardForm value={value} onChange={setValue} errors={errors} />
}

describe('CardForm', () => {
  afterEach(cleanup)

  it('agrupa el número en bloques de 4 y descarta lo que no es dígito', () => {
    render(<Harness />)
    const input = screen.getByLabelText('Número de tarjeta')
    fireEvent.change(input, { target: { value: '4242a42424242424299999' } })
    expect(input.value).toBe('4242 4242 4242 4242 999')
    expect(input.getAttribute('autocomplete')).toBe('cc-number')
    expect(input.getAttribute('inputmode')).toBe('numeric')
  })

  it('vencimiento inserta la barra y CVV acepta 3 o 4 dígitos', () => {
    render(<Harness />)
    fireEvent.change(screen.getByLabelText('Vencimiento (MM/AA)'), { target: { value: '1230' } })
    expect(screen.getByLabelText('Vencimiento (MM/AA)').value).toBe('12/30')
    fireEvent.change(screen.getByLabelText('CVV'), { target: { value: 'a12345' } })
    expect(screen.getByLabelText('CVV').value).toBe('1234')
  })

  it('número inválido: el error aparece bajo el campo número', () => {
    const errors = validateCard({ number: '4242 4242 4242 4241', expiry: '12/30', cvv: '123' })
    expect(Object.keys(errors)).toEqual(['number'])
    render(<Harness errors={errors} />)
    const input = screen.getByLabelText('Número de tarjeta')
    const msg = screen.getByText('Ingresa un número de tarjeta válido.')
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe(msg.id)
  })

  it('validateCard revisa vencimiento y CVV', () => {
    expect(validateCard({ number: '4242424242424242', expiry: '13/30', cvv: '12' })).toEqual({
      expiry: 'Ingresa un vencimiento válido (MM/AA).', cvv: 'Ingresa un CVV de 3 o 4 dígitos.',
    })
  })
})
