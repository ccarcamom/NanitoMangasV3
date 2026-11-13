import { render, screen, cleanup } from '@testing-library/react'
import { bindFields, focusFirstError } from './formHelpers.js'

describe('formHelpers', () => {
  afterEach(cleanup)

  it('bindFields arma las props de un campo y devuelve el objeto completo al cambiar', () => {
    const onChange = vi.fn()
    const bind = bindFields({ name: 'Ana', email: '' }, { email: 'mal' }, onChange, 'buyer-')
    expect(bind('email')).toEqual(expect.objectContaining({ id: 'buyer-email', name: 'email', value: '', error: 'mal' }))
    bind('name').onChange({ target: { value: 'Luis' } })
    expect(onChange).toHaveBeenCalledExactlyOnceWith({ name: 'Luis', email: '' })
  })

  it('focusFirstError enfoca el primer campo con error en el orden de ids', () => {
    render(<><input id="a" /><input id="b" /></>)
    expect(focusFirstError({ b: 'x' }, { a: 'a', b: 'b' })).toBe(true)
    expect(document.activeElement.id).toBe('b')
    expect(focusFirstError({}, { a: 'a', b: 'b' })).toBe(false)
  })
})
