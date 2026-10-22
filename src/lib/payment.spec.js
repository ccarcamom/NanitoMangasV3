import { simulatePayment } from './payment.js'

const card = (over = {}) => ({ number: '4242 4242 4242 4242', expiry: '12/99', cvv: '123', ...over })

describe('simulatePayment', () => {
  it('tarjeta válida: ok', async () => { expect(await simulatePayment(card(), 0)).toEqual({ ok: true }) })
  it('4000 0000 0000 0002 es rechazada', async () => {
    expect(await simulatePayment(card({ number: '4000000000000002' }), 0)).toEqual({ ok: false, reason: 'CARD_DECLINED' })
    expect(await simulatePayment(card({ number: '4000 0000 0000 0002' }), 0)).toEqual({ ok: false, reason: 'CARD_DECLINED' })
  })
  it('Luhn inválido, vencimiento o CVV malos: CARD_INVALID', async () => {
    const bad = { ok: false, reason: 'CARD_INVALID' }
    expect(await simulatePayment(card({ number: '4242 4242 4242 4243' }), 0)).toEqual(bad)
    expect(await simulatePayment(card({ expiry: '01/20' }), 0)).toEqual(bad)
    expect(await simulatePayment(card({ cvv: '12' }), 0)).toEqual(bad)
  })
})
