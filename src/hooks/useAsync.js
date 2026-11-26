import { useCallback, useEffect, useState } from 'react'

// Carga `fn()` al montar y cuando cambia `key`. Devuelve { data, loading, error, reload, setData }.
export const useAsync = (fn, key) => {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    setState((s) => (s.loading ? s : { ...s, loading: true, error: null }))
    fn().then(
      (data) => live && setState({ data, loading: false, error: null }),
      (error) => live && setState({ data: null, loading: false, error }),
    )
    return () => { live = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  const setData = useCallback((data) => setState((s) => ({ ...s, data })), [])
  return { ...state, reload, setData }
}
