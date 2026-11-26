import { renderHook, waitFor, act } from '@testing-library/react'
import { useProducts } from './useProducts.js'

describe('useProducts', () => {
  it('parte cargando y entrega los datos', async () => {
    const api = { listProducts: vi.fn().mockResolvedValue([{ id: 'a' }]) }
    const { result } = renderHook(() => useProducts(api))
    expect(result.current).toMatchObject({ data: [], loading: true, error: null })
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 'a' }])
  })

  it('si la API falla expone el error y deja la lista vacía', async () => {
    const api = { listProducts: vi.fn().mockRejectedValue(new Error('red')) }
    const { result } = renderHook(() => useProducts(api))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error.message).toBe('red')
    expect(result.current.data).toEqual([])
  })

  it('reload vuelve a pedir la lista', async () => {
    const api = { listProducts: vi.fn().mockResolvedValueOnce([{ id: 'a' }]).mockResolvedValueOnce([{ id: 'b' }]) }
    const { result } = renderHook(() => useProducts(api))
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'a' }]))
    act(() => result.current.reload())
    await waitFor(() => expect(result.current.data).toEqual([{ id: 'b' }]))
  })
})
