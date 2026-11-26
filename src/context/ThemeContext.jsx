import { createContext, useContext, useLayoutEffect, useState } from 'react'
import { storage as defaultStorage } from '../data/storage.js'

const ThemeContext = createContext(null)

export function ThemeProvider({ children, storage = defaultStorage }) {
  const [theme, setTheme] = useState(() => (storage.read('theme', 'light') === 'dark' ? 'dark' : 'light'))

  useLayoutEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme)
    storage.write('theme', theme)
  }, [theme, storage])

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
