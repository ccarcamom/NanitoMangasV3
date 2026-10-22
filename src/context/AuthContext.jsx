import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as data from '../data/index.js'

export const AuthContext = createContext(null)

// Nunca exponemos el hash fuera de la capa de datos.
const strip = (u) => {
  if (!u) return null
  const { passwordHash, ...safe } = u // eslint-disable-line no-unused-vars
  return safe
}

// `api` = users + session functions; specs inject one built on a fake storage.
export function AuthProvider({ children, api = data }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const sync = () => {
      const id = api.getSessionUserId()
      setUser(strip(id ? api.getUser(id) : null))
    }
    sync()
    setReady(true)
    return api.subscribeUsers(sync) // perfil editado o usuario borrado desde el admin
  }, [api])

  const register = useCallback(async (input) => {
    const created = await api.registerUser(input)
    api.setSession(created.id)
    setUser(strip(created))
    return strip(created)
  }, [api])

  const login = useCallback(async (email, password) => {
    const found = await api.loginUser(email, password)
    api.setSession(found.id)
    setUser(strip(found))
    return strip(found)
  }, [api])

  const logout = useCallback(() => {
    api.clearSession()
    setUser(null)
  }, [api])

  const updateProfile = useCallback((patch) => {
    const updated = strip(api.updateProfile(user.id, patch))
    setUser(updated)
    return updated
  }, [api, user])

  const value = useMemo(
    () => ({ user, ready, register, login, logout, updateProfile }),
    [user, ready, register, login, logout, updateProfile],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
