import { useState } from 'react'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import AddressFields from './AddressFields.jsx'

function Host({ errors }) {
  const [value, setValue] = useState({ street: '', comuna: '', region: '' })
  return <AddressFields value={value} onChange={setValue} errors={errors} />
}
const comunas = () => [...screen.getByLabelText('Comuna').querySelectorAll('option')].map((o) => o.textContent)

describe('AddressFields', () => {
  afterEach(cleanup)

  it('cambiar la región actualiza las comunas y reinicia la elegida', () => {
    render(<Host />)
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Región Metropolitana de Santiago' } })
    expect(comunas()).toContain('Santiago')
    fireEvent.change(screen.getByLabelText('Comuna'), { target: { value: 'Santiago' } })
    expect(screen.getByLabelText('Comuna').value).toBe('Santiago')
    fireEvent.change(screen.getByLabelText('Región'), { target: { value: 'Región de Valparaíso' } })
    expect(comunas()).toContain('Viña del Mar')
    expect(comunas()).not.toContain('Santiago')
    expect(screen.getByLabelText('Comuna').value).toBe('')
  })

  it('muestra los errores bajo cada campo', () => {
    render(<Host errors={{ street: 'Falta la calle.', comuna: 'Falta la comuna.' }} />)
    expect(screen.getByText('Falta la calle.')).toBeTruthy()
    expect(screen.getByText('Falta la comuna.')).toBeTruthy()
  })
})
