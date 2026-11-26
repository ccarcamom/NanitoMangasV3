import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as defaultApi from '../api/index.js'

export const AuthContext = createContext(null)

// `api` = loginUser, registerUser, restoreSession, logout, updateProfile; specs inject un doble.
export function AuthProvider({ children, api = defaultApi }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [signedOut, setSignedOut] = useState(false) // salida voluntaria; ProtectedRoute lleva a la portada
  const loggedOut = useRef(false) // un logout durante restoreSession descarta su resultado

  useEffect(() => {
    let live = true
    api.restoreSession().catch(() => null).then((u) => {
      if (!live) return
      setUser((current) => current ?? (loggedOut.current ? null : u)) // un login más rápido que la restauración no se pisa
      setReady(true)
    })
    // el refresh falló en mitad de la sesión: se cierra sin bucle
    const off = api.onSessionExpired?.(() => setUser(null))
    return () => { live = false; off?.() }
  }, [api])

  const register = useCallback(async (input) => {
    const { user: created } = await api.registerUser(input)
    loggedOut.current = false
    setUser(created)
    setSignedOut(false)
    return created
  }, [api])

  const login = useCallback(async (email, password) => {
    const { user: found } = await api.loginUser(email, password)
    loggedOut.current = false
    setUser(found)
    setSignedOut(false)
    return found
  }, [api])

  const logout = useCallback(() => {
    loggedOut.current = true
    api.logout()
    setSignedOut(true)
    setUser(null)
  }, [api])

  const updateProfile = useCallback(async (patch) => {
    const updated = await api.updateProfile(patch)
    setUser(updated)
    return updated
  }, [api])

  const value = useMemo(
    () => ({ user, ready, signedOut, register, login, logout, updateProfile }),
    [user, ready, signedOut, register, login, logout, updateProfile],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
