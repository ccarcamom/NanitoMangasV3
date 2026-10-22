import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { CartProvider } from '../context/CartContext.jsx'
import { AuthProvider } from '../context/AuthContext.jsx'
import { createFakeAuthApi } from '../data/fakeAuthApi.js'
import { createStorage } from '../data/storage.js'
import { fakeBackend } from '../data/fakeBackend.js'
import { createProductsApi } from '../data/products.js'
import { createCartApi } from '../data/cart.js'
import { createOrdersApi } from '../data/orders.js'
import { simulatePayment } from '../lib/payment.js'
import Checkout from './Checkout.jsx'

function Probe({ label }) {
  const { pathname, state } = useLocation()
  return <p>{`${label} ${pathname} ${state?.reason ?? ''}`.trim()}</p>
}

// Promesa controlable para simular un servicio lento.
const deferred = () => {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

describe('Checkout', () => {
  let backend, storage, productsApi, cartApi, api, auth, deps
  const setup = () => render(
    <MemoryRouter initialEntries={['/checkout']}>
      <AuthProvider api={auth}>
        <CartProvider api={api}>
          <Routes>
            <Route path="/checkout" element={<Checkout deps={deps} />} />
            <Route path="/compra-exitosa/:orderId" element={<Probe label="exito" />} />
            <Route path="/pago-fallido" element={<Probe label="fallo" />} />
            <Route path="/carro" element={<p>carro</p>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
  const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
  const fillBuyer = (rut = '12.345.678-5') => {
    change('Nombre', 'Ana Pérez')
    change('Correo', 'ana@mail.cl')
    change('RUT', rut)
  }
  const fillAddress = () => {
    change('Calle y número', 'Calle 1')
    change('Región', 'Región de Valparaíso')
    change('Comuna', 'Viña del Mar')
  }
  const fillCard = (number = '4242 4242 4242 4242') => {
    change('Número de tarjeta', number)
    change('Vencimiento (MM/AA)', '12/30')
    change('CVV', '123')
  }
  const fill = ({ rut, number } = {}) => { fillBuyer(rut); fillAddress(); fillCard(number) }
  // Pedido real sobre el storage falso y pago real sin espera.
  const useRealDeps = () => {
    const ordersApi = createOrdersApi({ storage, productsApi, cartApi })
    deps = { placeOrder: ordersApi.placeOrder, simulatePayment: (card) => simulatePayment(card, 0) }
    return ordersApi
  }
  // waitFor solo reintenta si el callback lanza; el expect de Jasmine no lanza.
  const waitCalls = (spy, n) => waitFor(() => { if (spy.calls.count() < n) throw new Error(`esperando ${n} llamadas`) })
  const payButton = () => screen.getByRole('button', { name: /^(Pagar|Procesando)/ })
  const summary = () => within(screen.getByRole('region', { name: 'Tu pedido' }))

  beforeEach(() => {
    backend = fakeBackend()
    storage = createStorage(backend)
    productsApi = createProductsApi(storage)
    cartApi = createCartApi(storage, productsApi)
    api = { ...productsApi, ...cartApi }
    auth = createFakeAuthApi().api
    deps = {
      simulatePayment: jasmine.createSpy('simulatePayment').and.resolveTo({ ok: true }),
      placeOrder: jasmine.createSpy('placeOrder').and.returnValue({ id: 'NM-000007' }),
    }
    cartApi.addToCart('manga-1', 2) // 2 x $10.990
  })
  afterEach(cleanup)

  it('carro vacío muestra el estado vacío', () => {
    cartApi.clearCart()
    setup()
    expect(screen.getByText('Tu carro está vacío')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ver productos' }).getAttribute('href')).toBe('/')
    expect(screen.queryByRole('button', { name: /^Pagar/ })).toBeNull()
  })

  it('invitado: campos vacíos, resumen con líneas y total en el botón, aviso de pago simulado', () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: 'Pagar' })).toBeTruthy()
    expect(screen.getByLabelText('Nombre').value).toBe('')
    expect(screen.getByLabelText('Correo').value).toBe('')
    expect(screen.getByLabelText('RUT').value).toBe('')
    expect(screen.getByLabelText('Calle y número').value).toBe('')
    expect(summary().getByText('Manga 1').closest('li').textContent).toContain('x 2')
    expect(summary().getByText('Subtotal').nextSibling.textContent).toBe('$21.980')
    expect(summary().getByText('Envío').nextSibling.textContent).toBe('$3.990')
    expect(summary().getByText('Total').nextSibling.textContent).toBe('$25.970')
    expect(payButton().textContent).toBe('Pagar $25.970')
    expect(screen.getByText('Pago simulado: no se realiza ningún cobro real')).toBeTruthy()
    expect(screen.queryByText(/4000 0000 0000 0002/)).toBeNull()
  })

  it('con sesión rellena nombre, correo, RUT y dirección del perfil', async () => {
    const user = await auth.registerUser({ name: 'Ana Pérez', email: 'ana@mail.cl', password: 'Clave1234' })
    auth.updateProfile(user.id, { rut: '12345678-5', address: { street: 'Calle 1', comuna: 'Viña del Mar', region: 'Región de Valparaíso' } })
    auth.setSession(user.id)
    setup()
    await screen.findByDisplayValue('Ana Pérez')
    expect(screen.getByLabelText('Correo').value).toBe('ana@mail.cl')
    expect(screen.getByLabelText('RUT').value).toBe('12345678-5')
    expect(screen.getByLabelText('Calle y número').value).toBe('Calle 1')
    expect(screen.getByLabelText('Región').value).toBe('Región de Valparaíso')
    expect(screen.getByLabelText('Comuna').value).toBe('Viña del Mar')
  })

  it('RUT inválido muestra el error, enfoca el campo y no llama a simulatePayment', () => {
    setup()
    fill({ rut: '12345678-9' })
    fireEvent.click(payButton())
    expect(screen.getByText('Ingresa un RUT válido.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('RUT'))
    expect(deps.simulatePayment).not.toHaveBeenCalled()
  })

  it('formulario vacío marca cada obligatorio bajo su campo y enfoca el primero', () => {
    setup()
    fireEvent.click(payButton())
    const expected = [
      ['Nombre', 'Ingresa tu nombre.'], ['Correo', 'Ingresa un correo válido.'], ['RUT', 'Ingresa un RUT válido.'],
      ['Calle y número', 'Ingresa tu calle y número.'], ['Región', 'Selecciona una región.'], ['Comuna', 'Selecciona una comuna.'],
      ['Número de tarjeta', 'Ingresa un número de tarjeta válido.'], ['Vencimiento (MM/AA)', 'Ingresa un vencimiento válido (MM/AA).'],
      ['CVV', 'Ingresa un CVV de 3 o 4 dígitos.'],
    ]
    expected.forEach(([label, message]) => {
      const input = screen.getByLabelText(label)
      expect(input.getAttribute('aria-invalid')).withContext(label).toBe('true')
      expect(document.getElementById(input.getAttribute('aria-describedby'))?.textContent).withContext(label).toBe(message)
    })
    expect(document.querySelectorAll('.form-field__error').length).toBe(expected.length)
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre'))
    expect(deps.simulatePayment).not.toHaveBeenCalled()
  })

  ;[
    ['Correo', 'ana@', 'Ingresa un correo válido.'],
    ['Vencimiento (MM/AA)', '13/30', 'Ingresa un vencimiento válido (MM/AA).'],
    ['CVV', '12', 'Ingresa un CVV de 3 o 4 dígitos.'],
    ['Número de tarjeta', '4242 4242 4242 4241', 'Ingresa un número de tarjeta válido.'],
  ].forEach(([label, bad, message]) => {
    it(`${label} inválido (${bad}) no llama a simulatePayment`, () => {
      setup()
      fill()
      change(label, bad)
      fireEvent.click(payButton())
      expect(screen.getByText(message)).toBeTruthy()
      expect(document.activeElement).toBe(screen.getByLabelText(label))
      expect(deps.simulatePayment).not.toHaveBeenCalled()
    })
  })

  it('con "Retiro en tienda" la dirección vacía no se exige y el pago sigue', async () => {
    setup()
    fillBuyer()
    fireEvent.click(screen.getByRole('radio', { name: 'Retiro en tienda' }))
    fillCard()
    fireEvent.click(payButton())
    await screen.findByText('exito /compra-exitosa/NM-000007')
    expect(deps.simulatePayment).toHaveBeenCalledTimes(1)
    expect(deps.placeOrder.calls.argsFor(0)[0].delivery).toEqual({ method: 'retiro', address: null })
  })

  it('corregir un campo borra solo su error', () => {
    setup()
    fireEvent.click(payButton())
    change('Nombre', 'Ana')
    expect(screen.queryByText('Ingresa tu nombre.')).toBeNull()
    expect(screen.getByText('Ingresa un correo válido.')).toBeTruthy()
    expect(screen.getByText('Ingresa un número de tarjeta válido.')).toBeTruthy()
  })

  it('"Retiro en tienda" oculta la dirección, envío $0 y cambia el total', () => {
    setup()
    fireEvent.click(screen.getByRole('radio', { name: 'Retiro en tienda' }))
    expect(screen.queryByLabelText('Calle y número')).toBeNull()
    expect(summary().getByText('Envío').nextSibling.textContent).toBe('$0')
    expect(summary().getByText('Total').nextSibling.textContent).toBe('$21.980')
    expect(payButton().textContent).toBe('Pagar $21.980')
  })

  it('dos envíos sincrónicos llaman una sola vez a simulatePayment y a placeOrder (Review Focus 4)', async () => {
    const pay = deferred()
    deps.simulatePayment.and.returnValue(pay.promise)
    setup()
    fill()
    const form = payButton().closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(deps.simulatePayment).toHaveBeenCalledTimes(1)
    expect(payButton().disabled).toBeTrue()
    expect(payButton().textContent).toBe('Procesando…')
    pay.resolve({ ok: true })
    await screen.findByText('exito /compra-exitosa/NM-000007')
    expect(deps.placeOrder).toHaveBeenCalledTimes(1)
    expect(deps.placeOrder).toHaveBeenCalledWith({
      userId: null, email: 'ana@mail.cl', buyer: { name: 'Ana Pérez', rut: '12345678-5' },
      delivery: { method: 'despacho', address: { street: 'Calle 1', comuna: 'Viña del Mar', region: 'Región de Valparaíso' } },
    })
    const card = deps.simulatePayment.calls.argsFor(0)[0]
    expect(card).toEqual({ number: '4242 4242 4242 4242', expiry: '12/30', cvv: '123' })
  })

  it('OUT_OF_STOCK: avisa nombrando el producto, no navega y el botón vuelve a servir (Review Focus 2)', async () => {
    deps.placeOrder.and.throwError(new Error('OUT_OF_STOCK:manga-1'))
    setup()
    fill()
    fireEvent.click(payButton())
    const alert = await screen.findByText('Manga 1 ya no tiene stock suficiente. Revisa tu carro.')
    expect(within(alert.closest('[role=alert]')).getByRole('link').getAttribute('href')).toBe('/carro')
    expect(screen.queryByText(/exito/)).toBeNull()
    expect(payButton().disabled).toBeFalse()
    expect(payButton().textContent).toBe('Pagar $25.970')
    fireEvent.click(payButton())
    await waitCalls(deps.placeOrder, 2)
    expect(deps.placeOrder).toHaveBeenCalledTimes(2)
    expect(cartApi.getCart()).toEqual([{ productId: 'manga-1', qty: 2 }])
  })

  it('OUT_OF_STOCK de un producto que no está en el carro usa "Un producto"', async () => {
    deps.placeOrder.and.throwError(new Error('OUT_OF_STOCK:otro'))
    setup()
    fill()
    fireEvent.click(payButton())
    expect(await screen.findByText('Un producto ya no tiene stock suficiente. Revisa tu carro.')).toBeTruthy()
  })

  it('otro error muestra el aviso genérico y libera el botón', async () => {
    deps.placeOrder.and.throwError(new Error('BOOM'))
    setup()
    fill()
    fireEvent.click(payButton())
    expect(await screen.findByText('No pudimos completar la compra. Intenta de nuevo.')).toBeTruthy()
    expect(payButton().disabled).toBeFalse()
  })

  it('producto borrado en el carro: aviso y "Pagar" deshabilitado', () => {
    cartApi.addToCart('funko-1', 1)
    productsApi.deleteProduct('funko-1')
    setup()
    const warn = screen.getByText(/Revisa tu carro antes de pagar/).closest('[role=alert]')
    expect(within(warn).getByRole('link').getAttribute('href')).toBe('/carro')
    expect(payButton().disabled).toBeTrue()
    fill()
    fireEvent.submit(payButton().closest('form'))
    expect(deps.simulatePayment).not.toHaveBeenCalled()
  })

  ;[['cantidad sobre el stock', 1], ['producto sin stock', 0]].forEach(([title, stock]) => {
    it(`${title}: aviso, "Pagar" deshabilitado y un submit forzado no paga ni crea pedido`, async () => {
      productsApi.updateProduct('manga-1', { stock }) // el carro ya tiene 2 unidades
      setup()
      expect(screen.getByText(/Revisa tu carro antes de pagar/)).toBeTruthy()
      expect(payButton().disabled).toBeTrue()
      fill()
      fireEvent.submit(payButton().closest('form'))
      await new Promise((r) => setTimeout(r, 0))
      expect(deps.simulatePayment).not.toHaveBeenCalled()
      expect(deps.placeOrder).not.toHaveBeenCalled()
      expect(cartApi.getCart()).toEqual([{ productId: 'manga-1', qty: 2 }])
    })
  })

  it('si simulatePayment rechaza: aviso genérico, sin pedido y el botón vuelve a servir', async () => {
    deps.simulatePayment.and.rejectWith(new Error('red'))
    setup()
    fill()
    fireEvent.click(payButton())
    expect(await screen.findByText('No pudimos completar la compra. Intenta de nuevo.')).toBeTruthy()
    expect(deps.placeOrder).not.toHaveBeenCalled()
    expect(payButton().disabled).toBeFalse()
    expect(payButton().textContent).toBe('Pagar $25.970')
    fireEvent.click(payButton())
    await waitCalls(deps.simulatePayment, 2)
    expect(deps.simulatePayment).toHaveBeenCalledTimes(2)
  })

  it('EMPTY_CART: muestra el carro vacío y no navega', async () => {
    deps.placeOrder.and.callFake(() => { cartApi.clearCart(); throw new Error('EMPTY_CART') })
    setup()
    fill()
    fireEvent.click(payButton())
    expect(await screen.findByText('Tu carro está vacío')).toBeTruthy()
    expect(screen.queryByText(/exito/)).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('CARD_DECLINED va a /pago-fallido con el motivo, sin crear pedido ni vaciar el carro', async () => {
    deps.simulatePayment.and.resolveTo({ ok: false, reason: 'CARD_DECLINED' })
    setup()
    fill({ number: '4000 0000 0000 0002' })
    fireEvent.click(payButton())
    await screen.findByText('fallo /pago-fallido CARD_DECLINED')
    expect(deps.placeOrder).not.toHaveBeenCalled()
    expect(cartApi.getCart()).toEqual([{ productId: 'manga-1', qty: 2 }])
  })

  it('integración: invitado, despacho y producto en oferta guardan el pedido correcto', async () => {
    const ordersApi = useRealDeps()
    cartApi.clearCart()
    cartApi.addToCart('manga-2', 1) // precio 12.990, oferta 9.990, stock 8
    setup()
    fill()
    fireEvent.click(payButton())
    await screen.findByText('exito /compra-exitosa/NM-000001')
    const saved = ordersApi.getOrder('NM-000001')
    expect(saved.userId).toBeNull()
    expect(saved.items).toEqual([{ productId: 'manga-2', name: 'Manga 2', unitPrice: 9990, qty: 1 }])
    expect([saved.subtotal, saved.shipping, saved.total]).toEqual([9990, 3990, 13980])
    expect(saved.delivery).toEqual({ method: 'despacho', address: { street: 'Calle 1', comuna: 'Viña del Mar', region: 'Región de Valparaíso' } })
    expect(productsApi.getProduct('manga-2').stock).toBe(7)
    expect(cartApi.getCart()).toEqual([])
  })

  it('integración: con sesión el pedido guarda el userId y los datos prellenados', async () => {
    const ordersApi = useRealDeps()
    const user = await auth.registerUser({ name: 'Ana Pérez', email: 'ana@mail.cl', password: 'Clave1234' })
    auth.updateProfile(user.id, { rut: '11111111-1', address: { street: 'Av. Siempre 742', comuna: 'Providencia', region: 'Región Metropolitana de Santiago' } })
    auth.setSession(user.id)
    setup()
    await screen.findByDisplayValue('Ana Pérez')
    fillCard()
    fireEvent.click(payButton())
    await screen.findByText('exito /compra-exitosa/NM-000001')
    const saved = ordersApi.getOrder('NM-000001')
    expect(saved.userId).toBe(user.id)
    expect(saved.email).toBe('ana@mail.cl')
    expect(saved.buyer).toEqual({ name: 'Ana Pérez', rut: '11111111-1' })
    expect(saved.delivery.address).toEqual({ street: 'Av. Siempre 742', comuna: 'Providencia', region: 'Región Metropolitana de Santiago' })
    expect(productsApi.getProduct('manga-1').stock).toBe(10)
  })

  it('integración: despacho con subtotal sobre $40.000 tiene envío gratis', async () => {
    const ordersApi = useRealDeps()
    cartApi.addToCart('funko-1', 2) // 2 x 19.990 + 2 x 10.990 = 61.960
    setup()
    expect(summary().getByText('Envío').nextSibling.textContent).toBe('Gratis')
    expect(payButton().textContent).toBe('Pagar $61.960')
    fill()
    fireEvent.click(payButton())
    await screen.findByText('exito /compra-exitosa/NM-000001')
    const saved = ordersApi.getOrder('NM-000001')
    expect([saved.subtotal, saved.shipping, saved.total]).toEqual([61960, 0, 61960])
  })

  it('integración: pago real y pedido real sobre storage falso descuentan stock y vacían el carro', async () => {
    const ordersApi = useRealDeps()
    setup()
    fill()
    fireEvent.click(screen.getByRole('radio', { name: 'Retiro en tienda' }))
    fireEvent.click(payButton())
    await screen.findByText('exito /compra-exitosa/NM-000001')
    expect(productsApi.getProduct('manga-1').stock).toBe(10)
    expect(cartApi.getCart()).toEqual([])
    const saved = ordersApi.getOrder('NM-000001')
    expect(saved.buyer).toEqual({ name: 'Ana Pérez', rut: '12345678-5' })
    expect(saved.delivery).toEqual({ method: 'retiro', address: null })
    expect(saved.total).toBe(21980)
    expect(JSON.stringify(backend.data)).not.toContain('4242')
  })
})
