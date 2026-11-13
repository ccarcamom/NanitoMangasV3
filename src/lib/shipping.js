export const METHODS = [['despacho', 'Despacho a domicilio'], ['retiro', 'Retiro en tienda']]

export const SHIPPING = { flat: 3990, freeFrom: 40000 }

export const calcShipping = (subtotal, method) => {
  if (method === 'retiro' || subtotal <= 0) return 0
  return subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flat
}
