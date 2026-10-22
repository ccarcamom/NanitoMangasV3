import { createStorage } from './storage.js'
import { fakeBackend } from './fakeBackend.js'

describe('createStorage', () => {
  it('escribe y lee con prefijo', () => {
    const b = fakeBackend()
    const s = createStorage(b)
    s.write('a', { x: 1 })
    expect(b.data['nanitomangas:a']).toBe('{"x":1}')
    expect(s.read('a', null)).toEqual({ x: 1 })
  })
  it('devuelve fallback si la clave no existe', () => {
    expect(createStorage(fakeBackend()).read('z', 'fb')).toBe('fb')
  })
  it('devuelve fallback con JSON corrupto', () => {
    const s = createStorage(fakeBackend({ 'nanitomangas:a': '{no json' }))
    expect(s.read('a', [])).toEqual([])
  })
  it('devuelve fallback si getItem lanza', () => {
    const b = { getItem: () => { throw new Error('bloqueado') } }
    expect(createStorage(b).read('a', 7)).toBe(7)
  })
  it('write no lanza si setItem lanza', () => {
    const b = { setItem: () => { throw new Error('cuota') } }
    expect(() => createStorage(b).write('a', 1)).not.toThrow()
  })
  it('remove elimina y no lanza si el backend falla', () => {
    const b = fakeBackend()
    const s = createStorage(b)
    s.write('a', 1)
    s.remove('a')
    expect(s.read('a', null)).toBeNull()
    expect(() => createStorage({ removeItem: () => { throw new Error('x') } }).remove('a')).not.toThrow()
  })
})
