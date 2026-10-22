import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { ThemeProvider } from '../../context/ThemeContext.jsx'
import { CartProvider } from '../../context/CartContext.jsx'
import { createStorage } from '../../data/storage.js'
import { fakeBackend } from '../../data/fakeBackend.js'
import { createProductsApi } from '../../data/products.js'
import { createCartApi } from '../../data/cart.js'
import { AuthProvider } from '../../context/AuthContext.jsx'
import { createFakeAuthApi } from '../../data/fakeAuthApi.js'
import Layout from './Layout.jsx'

describe('Layout', () => {
  afterEach(cleanup)

  it('no incluye la franja informativa (solo la portada la muestra)', () => {
    const storage = createStorage(fakeBackend())
    const productsApi = createProductsApi(storage)
    const api = { ...productsApi, ...createCartApi(storage, productsApi) }
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
