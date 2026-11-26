import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from '../../context/ThemeContext.jsx'
import { CartProvider } from '../../context/CartContext.jsx'
import { createFakeShop } from '../../api/fakeShop.js'
import { AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../api/fakeAuthApi.js'
import Layout from './Layout.jsx'

describe('Layout', () => {
  afterEach(cleanup)

  it('no incluye la franja informativa (solo la portada la muestra)', () => {
    const { storage, api } = createFakeShop()
    render(
      <MemoryRouter initialEntries={['/x']}>
        <ThemeProvider storage={storage}><AuthProvider api={createFakeAuthApi().api}><CartProvider api={api}>
          <Routes><Route element={<Layout />}><Route path="x" element={<p>Contenido</p>} /></Route></Routes>
        </CartProvider></AuthProvider></ThemeProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText('Contenido')).toBeTruthy()
    expect(screen.queryByRole('region', { name: 'Información de la tienda' })).toBeNull()
    expect(screen.getByRole('link', { name: 'Saltar al contenido' }).getAttribute('href')).toBe('#contenido')
    expect(screen.getByRole('main').id).toBe('contenido')
  })
})
