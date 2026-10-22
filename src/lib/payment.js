import { luhnCheck, isValidExpiry, isValidCvv } from './validators.js'

const DECLINED = '4000000000000002'

export const simulatePayment = (card, delayMs = 600) => new Promise((resolve) => {
  const valid = luhnCheck(card.number) && isValidExpiry(card.expiry) && isValidCvv(card.cvv)
  const result = !valid ? { ok: false, reason: 'CARD_INVALID' }
    : String(card.number).replace(/\s/g, '') === DECLINED ? { ok: false, reason: 'CARD_DECLINED' }
      : { ok: true }
  setTimeout(() => resolve(result), delayMs)
})
