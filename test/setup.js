import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Con globals activado @testing-library no limpia solo; Karma tampoco, cada spec lo hacia a mano.
afterEach(cleanup)

// jsdom no trae matchMedia ni scrollBy; GSAP y el carrusel los usan. Cada spec los reemplaza segun lo que pruebe.
// La guarda es para las pruebas que corren en entorno node (vite/*.spec.js), donde no hay window.
if (typeof window !== 'undefined') {
  window.matchMedia ??= (query) => ({
    matches: false, media: query, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
  })
  Element.prototype.scrollBy ??= function scrollBy() {}
}
