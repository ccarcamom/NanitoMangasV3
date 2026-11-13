// Ayuda solo para pruebas: simula window.matchMedia respondiendo por consulta.
export function mockReducedMotion(reduce) {
  return vi.spyOn(window, 'matchMedia').mockImplementation((query) => ({
    matches: query.includes('no-preference') ? !reduce : query.includes('reduce') ? reduce : false,
    media: query,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
}
