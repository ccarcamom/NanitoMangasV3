import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { findPreview, PreviewError } from '../lib/mangadex.js'
import Reader from './Reader.jsx'

// El visor real usa ResizeObserver y pantalla completa; aquí basta saber qué páginas y dirección recibe.
vi.mock('react-comic-viewer', () => ({
  ComicViewer: ({ pages, direction }) => <div data-testid="viewer" data-direction={direction}>{pages.length} páginas</div>,
}))
vi.mock('../lib/mangadex.js', async (original) => ({ ...(await original()), findPreview: vi.fn() }))

const products = [
  { id: 'manga-1', name: 'Vagabond - Tomo 1', categoryId: 'mangas', genre: 'seinen' },
  { id: 'otro', name: 'Otro - Tomo 1', categoryId: 'mangas', genre: 'shonen' },
]
const setup = (id) => render(
  <MemoryRouter initialEntries={[`/leer/${id}`]}>
    <Routes><Route path="/leer/:id" element={<Reader products={products} />} /></Routes>
  </MemoryRouter>,
)

describe('Reader', () => {
  // vi.fn() conserva el historial entre pruebas. Con llaves: si devuelve el mock, Vitest lo llama como limpieza.
  beforeEach(() => { findPreview.mockReset() })
  afterEach(cleanup)

  it('mientras busca muestra el esqueleto de carga', () => {
    findPreview.mockReturnValue(new Promise(() => {}))
    setup('manga-1')
    expect(screen.getByRole('status', { name: 'Cargando avance' })).toBeTruthy()
    expect(screen.getByRole('heading', { level: 1, name: 'Vagabond - Tomo 1' })).toBeTruthy()
  })

  it('con el avance listo muestra el visor de derecha a izquierda', async () => {
    findPreview.mockResolvedValue({ chapter: '1', language: 'es-la', pages: ['/a', '/b', '/c'] })
    setup('manga-1')
    const viewer = await screen.findByTestId('viewer')
    expect(viewer.textContent).toBe('3 páginas')
    expect(viewer.getAttribute('data-direction')).toBe('rtl')
    expect(screen.queryByRole('status')).toBeNull()
    expect(findPreview.mock.calls[0][0]).toBe('Vagabond - Tomo 1')
  })

  it('con varios idiomas muestra el selector y pide el idioma elegido', async () => {
    findPreview.mockResolvedValueOnce({ chapter: '1', language: 'es', languages: ['es', 'en'], pages: ['/a'] })
    setup('manga-1')
    const select = await screen.findByRole('combobox', { name: 'Idioma' })
    expect(select.value).toBe('es')
    findPreview.mockResolvedValueOnce({ chapter: '1', language: 'en', languages: ['en'], pages: ['/a', '/b'] })
    fireEvent.change(select, { target: { value: 'en' } })
    await waitFor(() => expect(screen.getByTestId('viewer').textContent).toBe('2 páginas'))
    expect(findPreview.mock.calls[1][1].language).toBe('en')
    expect(screen.getByRole('combobox', { name: 'Idioma' }).value).toBe('en')
  })

  it('con un solo idioma no muestra el selector', async () => {
    findPreview.mockResolvedValue({ chapter: '1', language: 'es', languages: ['es'], pages: ['/a'] })
    setup('manga-1')
    await screen.findByTestId('viewer')
    expect(screen.queryByRole('combobox', { name: 'Idioma' })).toBeNull()
  })

  it('sin avance disponible lo explica y vuelve al producto', async () => {
    findPreview.mockRejectedValue(new PreviewError('no-preview'))
    setup('manga-1')
    expect(await screen.findByText('Este manga no tiene avance disponible')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Volver al producto' }).getAttribute('href')).toBe('/producto/manga-1')
    expect(screen.queryByTestId('viewer')).toBeNull()
  })

  it('si falla la conexión ofrece reintentar y el segundo intento carga el avance', async () => {
    findPreview.mockRejectedValueOnce(new PreviewError('network')).mockResolvedValueOnce({ chapter: '2', language: 'en', pages: ['/a'] })
    setup('manga-1')
    fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }))
    expect(screen.getByRole('status', { name: 'Cargando avance' })).toBeTruthy()
    await waitFor(() => expect(screen.getByTestId('viewer')).toBeTruthy())
    expect(findPreview).toHaveBeenCalledTimes(2)
  })

  it('las migas llevan al inicio, a la categoría y al producto', async () => {
    findPreview.mockResolvedValue({ chapter: '1', language: 'es', pages: ['/a'] })
    setup('manga-1')
    await screen.findByTestId('viewer')
    expect(screen.getByRole('link', { name: 'Inicio' }).getAttribute('href')).toBe('/')
    expect(screen.getByRole('link', { name: 'Mangas' }).getAttribute('href')).toBe('/categoria/mangas')
    expect(screen.getByRole('link', { name: 'Vagabond - Tomo 1' }).getAttribute('href')).toBe('/producto/manga-1')
    expect(screen.getByText('Avance').getAttribute('aria-current')).toBe('page')
  })

  it('cambiar de producto vuelve a buscar el avance del nuevo', async () => {
    findPreview.mockResolvedValue({ chapter: '1', language: 'es', pages: ['/a'] })
    render(
      <MemoryRouter initialEntries={['/leer/manga-1']}>
        <Link to="/leer/otro">Ir al otro</Link>
        <Routes><Route path="/leer/:id" element={<Reader products={products} />} /></Routes>
      </MemoryRouter>,
    )
    await screen.findByTestId('viewer')
    fireEvent.click(screen.getByRole('link', { name: 'Ir al otro' }))
    expect(screen.getByRole('status', { name: 'Cargando avance' })).toBeTruthy() // el estado anterior no se arrastra
    await screen.findByTestId('viewer')
    expect(findPreview.mock.calls.map(([name]) => name)).toEqual(['Vagabond - Tomo 1', 'Otro - Tomo 1'])
    expect(screen.getByRole('heading', { level: 1, name: 'Otro - Tomo 1' })).toBeTruthy()
  })

  it('id inexistente muestra el estado vacío con enlace a la tienda y no busca nada', () => {
    setup('nada')
    expect(screen.getByRole('heading', { level: 1, name: 'Producto no encontrado' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ir a la tienda' }).getAttribute('href')).toBe('/')
    expect(findPreview).not.toHaveBeenCalled()
  })
})
