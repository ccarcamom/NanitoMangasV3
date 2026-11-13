import { useRef } from 'react'
import { render, cleanup } from '@testing-library/react'
import { ScrollTrigger } from '../lib/gsap.js'
import { useReveal } from './useReveal.js'
import { mockReducedMotion } from './motionTest.js'

function Box({ plain }) {
  const ref = useRef(null)
  useReveal(ref)
  return (
    <div ref={ref} data-testid="wrap">
      <div style={{ height: 3000 }} />
      {plain ? null : <><p data-reveal>a</p><p data-reveal>b</p></>}
    </div>
  )
}

describe('useReveal', () => {
  afterEach(() => { cleanup(); ScrollTrigger.killAll() })

  it('con reduce no toca los estilos y no crea triggers', () => {
    mockReducedMotion(true)
    const { container } = render(<Box />)
    container.querySelectorAll('[data-reveal]').forEach((el) => expect(el.style.opacity).toBe(''))
    expect(ScrollTrigger.getAll().length).toBe(0)
  })

  it('sin reduce oculta lo que esta bajo el pliegue y registra triggers', () => {
    mockReducedMotion(false)
    // jsdom no calcula layout: se simula que los bloques estan bajo el pliegue para que el trigger quede pendiente
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
      const top = this.hasAttribute('data-reveal') ? 3000 : 0
      return { top, bottom: top + 20, left: 0, right: 100, width: 100, height: 20, x: 0, y: top }
    })
    const { container } = render(<Box />)
    container.querySelectorAll('[data-reveal]').forEach((el) => expect(el.style.opacity).toBe('0'))
    expect(ScrollTrigger.getAll().length).toBeGreaterThan(0)
  })

  it('anima el propio elemento si no tiene hijos data-reveal', () => {
    mockReducedMotion(false)
    const { getByTestId } = render(<Box plain />)
    expect(getByTestId('wrap').style.opacity).toBe('0')
  })

  it('al desmontar no quedan triggers', () => {
    mockReducedMotion(false)
    const { unmount } = render(<Box />)
    unmount()
    expect(ScrollTrigger.getAll().length).toBe(0)
  })
})
