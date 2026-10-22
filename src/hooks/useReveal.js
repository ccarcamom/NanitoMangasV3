// Proposito: la entrada suave de cada bloque da jerarquia y orientacion mientras se hace scroll.
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap.js'

export function useReveal(ref) {
  useGSAP(() => {
    const el = ref.current
    if (!el) return
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const found = el.querySelectorAll('[data-reveal]')
      const kids = found.length ? found : [el]
      gsap.set(kids, { opacity: 0, y: 24 })
      // un trigger por hijo: cada bloque entra cuando llega a la vista, no todos a la vez
      ScrollTrigger.batch(kids, {
        start: 'top 85%',
        once: true,
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08,
          // clearProps evita que un transform en linea pise el hover CSS de las tarjetas
          clearProps: 'opacity,transform',
        }),
      })
    })
    return () => mm.revert()
  }, { scope: ref, dependencies: [] })
}
