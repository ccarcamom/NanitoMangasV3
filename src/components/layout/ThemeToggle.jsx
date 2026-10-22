import { Moon, Sun } from '@phosphor-icons/react'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const dark = theme === 'dark'
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
      {dark ? <Sun size={24} aria-hidden="true" /> : <Moon size={24} aria-hidden="true" />}
    </button>
  )
}
