import { placeOrder } from './orders.js'

describe('api/orders', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('placeOrder_409_OUT_OF_STOCK_llega_como_error_con_codigo', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 409, error: 'OUT_OF_STOCK:manga-1', message: 'sin stock' }), { status: 409 })))
    const err = await placeOrder({ items: [{ productId: 'manga-1', qty: 9 }] }).catch((e) => e)
    expect(err.status).toBe(409)
    expect(err.code).toBe('OUT_OF_STOCK:manga-1')
    expect(err.message).toBe('OUT_OF_STOCK:manga-1')
  })
})
