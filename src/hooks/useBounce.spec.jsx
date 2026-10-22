import { useRef } from 'react'
import { render, cleanup } from '@testing-library/react'
import { gsap } from '../lib/gsap.js'
import { useBounce } from './useBounce.js'
import { mockReducedMotion } from './motionTest.js'

function Dot({ n }) {
  const ref = useRef(null)
  useBounce(ref, n)
  return <span ref={ref} data-testid="dot">{n}</span>
}

describe('useBounce', () => {
  afterEach(cleanup)

  it('no anima al montar', () => {
    mockReducedMotion(false)
    const { getByTestId } = render(<Dot n={0} />)
    expect(gsap.getTweensOf(getByTestId('dot')).length > 0).toBe(false)
  })

  it('anima cuando cambia el trigger', () => {
    mockReducedMotion(false)
    const { getByTestId, rerender } = render(<Dot n={0} />)
    rerender(<Dot n={1} />)
    expect(gsap.getTweensOf(getByTestId('dot')).length > 0).toBe(true)
    gsap.killTweensOf(getByTestId('dot'))
  })

  it('no hace nada con reduce', () => {
    mockReducedMotion(true)
    const { getByTestId, rerender } = render(<Dot n={0} />)
    rerender(<Dot n={1} />)
    expect(gsap.getTweensOf(getByTestId('dot')).length > 0).toBe(false)
  })

  it('se detiene al desmontar', () => {
    mockReducedMotion(false)
    const { getByTestId, rerender, unmount } = render(<Dot n={0} />)
    rerender(<Dot n={1} />)
    const el = getByTestId('dot')
    unmount()
    expect(gsap.getTweensOf(el).length > 0).toBe(false)
  })
})
