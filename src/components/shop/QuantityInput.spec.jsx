import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import QuantityInput from './QuantityInput.jsx'

const setup = (props) => {
  const onChange = jasmine.createSpy('onChange')
  render(<QuantityInput value={1} max={3} onChange={onChange} {...props} />)
  return onChange
}
const type = (v) => fireEvent.change(screen.getByRole('spinbutton'), { target: { value: v } })

describe('QuantityInput', () => {
  afterEach(cleanup)

  it('valor sobre el máximo informa max', () => {
    const onChange = setup()
    type('99')
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('0, negativo y vacío informan 1', () => {
    const onChange = setup({ value: 2 })
    for (const v of ['0', '-1', '']) {
      onChange.calls.reset()
      type(v)
      expect(onChange).toHaveBeenCalledWith(1)
    }
  })

  it('decimales se redondean hacia abajo', () => {
    const onChange = setup()
    type('2.7')
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('botones restar y sumar respetan los límites', () => {
    const onChange = setup({ value: 2 })
    fireEvent.click(screen.getByRole('button', { name: 'Sumar uno' }))
    expect(onChange).toHaveBeenCalledWith(3)
    fireEvent.click(screen.getByRole('button', { name: 'Restar uno' }))
    expect(onChange).toHaveBeenCalledWith(1)
  })

  it('en el máximo no se puede sumar; en 1 no se puede restar', () => {
    setup({ value: 3 })
    expect(screen.getByRole('button', { name: 'Sumar uno' }).disabled).toBe(true)
    cleanup()
    setup({ value: 1 })
    expect(screen.getByRole('button', { name: 'Restar uno' }).disabled).toBe(true)
  })

  it('con max menor a 1 queda deshabilitado', () => {
    setup({ max: 0 })
    expect(screen.getByRole('spinbutton').disabled).toBe(true)
  })
})
