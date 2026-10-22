import { formatCLP } from './money.js'

describe('formatCLP', () => {
  it('formatea miles con punto', () => expect(formatCLP(11990)).toBe('$11.990'))
  it('formatea cero', () => expect(formatCLP(0)).toBe('$0'))
  it('formatea millones', () => expect(formatCLP(1234567)).toBe('$1.234.567'))
})
