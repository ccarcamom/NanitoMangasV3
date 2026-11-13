import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ThemeProvider } from '../../context/ThemeContext.jsx'
import { createStorage } from '../../data/storage.js'
import { fakeBackend } from '../../data/fakeBackend.js'
import ThemeToggle from './ThemeToggle.jsx'

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup()
    document.documentElement.removeAttribute('data-bs-theme')
  })

  it('pasa a modo oscuro al hacer clic y guarda la elección', () => {
    const storage = createStorage(fakeBackend())
    vi.spyOn(storage, 'write')
    render(<ThemeProvider storage={storage}><ThemeToggle /></ThemeProvider>)
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light')

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }))

    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
    expect(storage.write).toHaveBeenCalledWith('theme', 'dark')
    expect(storage.read('theme')).toBe('dark')
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeTruthy()
  })

  it('arranca con el tema guardado', () => {
    const storage = createStorage(fakeBackend())
    storage.write('theme', 'dark')
    render(<ThemeProvider storage={storage}><ThemeToggle /></ThemeProvider>)
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('dark')
  })
})
