import { useRef, useState } from 'react'

// El estado llega tarde: el ref frena el doble clic. `lock()` devuelve false si ya hay un envío en curso.
export function useSubmitLock() {
  const busy = useRef(false)
  const [pending, setPending] = useState(false)
  const lock = () => {
    if (busy.current) return false
    busy.current = true
    setPending(true)
    return true
  }
  const unlock = () => {
    busy.current = false
    setPending(false)
  }
  return { pending, lock, unlock }
}
