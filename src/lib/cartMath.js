import { calcShipping } from './shipping.js'

export const unitPrice = (product) => product.salePrice ?? product.price

export const cartTotals = (lines, method) => {
  const subtotal = lines.reduce((sum, { product, qty }) => sum + unitPrice(product) * qty, 0)
  const shipping = calcShipping(subtotal, method)
  return { subtotal, shipping, total: subtotal + shipping }
}
