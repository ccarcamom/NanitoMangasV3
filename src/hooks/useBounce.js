// Proposito: el rebote es la senal de que el carro cambio (al agregar o quitar).
import { useRef } from 'react'
import { gsap, useGSAP } from '../lib/gsap.js'

export function useBounce(ref, trigger) {
  const prev = useRef(trigger)
  useGSAP(() => {
    if (Object.is(prev.current, trigger)) return
    prev.current = trigger
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.to(ref.current, { keyframes: [{ scale: 1.25, duration: 0.18, ease: 'power2.out' }, { scale: 1, duration: 0.27, ease: 'elastic.out(1, 0.4)' }] })
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [trigger] })
}
