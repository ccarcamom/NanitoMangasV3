import { renderHook, act } from '@testing-library/react'
import { useSubmitLock } from './useSubmitLock.js'

describe('useSubmitLock', () => {
  it('el segundo lock sin unlock devuelve false y unlock lo libera', () => {
    const { result } = renderHook(() => useSubmitLock())
    let first, second
    act(() => { first = result.current.lock(); second = result.current.lock() })
    expect([first, second]).toEqual([true, false])
    expect(result.current.pending).toBe(true)
    act(() => result.current.unlock())
    expect(result.current.pending).toBe(false)
    act(() => { first = result.current.lock() })
    expect(first).toBe(true)
  })
})
