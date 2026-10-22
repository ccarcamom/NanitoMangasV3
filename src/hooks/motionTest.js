// Ayuda solo para pruebas: simula window.matchMedia respondiendo por consulta.
export function mockReducedMotion(reduce) {
  return spyOn(window, 'matchMedia').and.callFake((query) => ({
    matches: query.includes('no-preference') ? !reduce : query.includes('reduce') ? reduce : false,
    media: query,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  }))
}
