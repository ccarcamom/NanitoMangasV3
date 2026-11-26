import { useCallback, useEffect, useState } from 'react'
import * as defaultApi from '../api/index.js'

// `api` lets specs pass a fake { listProducts }. Devuelve { data, loading, error, reload }.
export const useProducts = (api = defaultApi) => {
  const [state, setState] = useState({ data: [], loading: true, error: null })
  const [tick, setTick] = useState(0)
  useEffect(() => {
    let live = true
    api.listProducts().then(
      (data) => live && setState({ data, loading: false, error: null }),
      (error) => live && setState((s) => ({ ...s, loading: false, error })),
    )
    return () => { live = false }
  }, [api, tick])
  const reload = useCallback(() => setTick((t) => t + 1), [])
  return { ...state, reload }
}
