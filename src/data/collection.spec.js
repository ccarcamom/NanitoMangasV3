import { createStorage } from './storage.js'
import { createCollection } from './collection.js'
import { fakeBackend } from './fakeBackend.js'

const seed = [{ id: 'a', n: 1 }, { id: 'b', n: 2 }]
const make = (b = fakeBackend()) => ({ b, c: createCollection(createStorage(b), 'items', seed) })

describe('createCollection', () => {
  it('siembra al estar vacía y persiste la semilla', () => {
    const { b, c } = make()
    expect(c.all()).toEqual(seed)
    expect(b.data['nanitomangas:items']).toBeDefined()
  })
  it('vuelve a sembrar si el JSON está corrupto', () => {
    const { c } = make(fakeBackend({ 'nanitomangas:items': '{roto' }))
    expect(c.all()).toEqual(seed)
  })
  describe('elementos guardados inválidos', () => {
    const load = (v) => createCollection(createStorage(fakeBackend({ 'nanitomangas:items': JSON.stringify(v) })), 'items', seed).all()
    it('descarta [null], [5] y [{}]', () => {
      expect(load([null])).toEqual([])
      expect(load([5])).toEqual([])
      expect(load([{}])).toEqual([])
      expect(load([{ id: 3 }])).toEqual([])
    })
    it('conserva los válidos de un arreglo mezclado', () => {
      expect(load([null, { id: 'x', n: 1 }, 5, {}, { id: 'y' }])).toEqual([{ id: 'x', n: 1 }, { id: 'y' }])
    })
    it('un arreglo vacío guardado sigue vacío (no resiembra)', () => {
      expect(load([])).toEqual([])
    })
  })
  it('no modifica el arreglo semilla', () => {
    const { c } = make()
    c.create({ n: 3 })
    expect(seed.length).toBe(2)
  })
  it('create asigna id y persiste', () => {
    const { b, c } = make()
    const item = c.create({ n: 3 })
    expect(item.id).toEqual(jasmine.any(String))
    expect(c.get(item.id).n).toBe(3)
    expect(JSON.parse(b.data['nanitomangas:items']).length).toBe(3)
  })
  it('create respeta un id dado', () => {
    expect(make().c.create({ id: 'x', n: 9 }).id).toBe('x')
  })
  it('update mezcla campos', () => {
    const { c } = make()
    expect(c.update('a', { n: 5 })).toEqual({ id: 'a', n: 5 })
    expect(c.get('a').n).toBe(5)
  })
  it('update de id inexistente lanza', () => {
    expect(() => make().c.update('nope', {})).toThrow()
  })
  it('remove devuelve true y false si no existe', () => {
    const { c } = make()
    expect(c.remove('a')).toBe(true)
    expect(c.get('a')).toBeUndefined()
    expect(c.remove('a')).toBe(false)
  })
  it('subscribe se llama una vez por cambio y se cancela', () => {
    const { c } = make()
    const cb = jasmine.createSpy('cb')
    const off = c.subscribe(cb)
    c.create({ n: 3 })
    expect(cb).toHaveBeenCalledTimes(1)
    off()
    c.create({ n: 4 })
    expect(cb).toHaveBeenCalledTimes(1)
  })
  it('snapshot conserva la referencia sin cambios y la renueva tras uno', () => {
    const { c } = make()
    const s1 = c.snapshot()
    expect(c.snapshot()).toBe(s1)
    expect(c.all()).toBe(s1)
    c.create({ n: 3 })
    expect(c.snapshot()).not.toBe(s1)
  })
})
