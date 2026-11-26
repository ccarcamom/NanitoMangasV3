import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import MemeLibrary from './MemeLibrary.jsx'

const products = [{ id: 'manga-1', name: 'Vagabond - Tomo 1', categoryId: 'mangas' }]
const memes = [
  { id: 'm1', productId: 'manga-1', language: 'es', pageIndex: 2, bubbles: [{ text: 'hola' }], createdAt: '2026-11-25T10:00:00Z' },
  { id: 'm2', productId: 'manga-1', language: 'es', pageIndex: 0, bubbles: [{ text: 'chao' }], createdAt: '2026-11-25T11:00:00Z' },
]
const Probe = () => { const l = useLocation(); return <p data-testid="probe">{l.pathname} {l.state?.meme?.id}</p> }

const setup = (list) => {
  const api = {
    listProducts: vi.fn().mockResolvedValue(products),
    listMyMemes: vi.fn().mockResolvedValue(list),
    deleteMeme: vi.fn().mockResolvedValue(null),
  }
  render(
    <MemoryRouter initialEntries={['/memes/biblioteca']}>
      <Routes>
        <Route path="/memes/biblioteca" element={<MemeLibrary api={api} />} />
        <Route path="/memes/crear" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
  )
  return api
}

describe('MemeLibrary', () => {
  afterEach(cleanup)

  it('MemeLibrary_lista_edita_y_borra', async () => {
    const api = setup(memes)
    expect(await screen.findByText('hola')).toBeTruthy()
    expect(screen.getAllByText(/Vagabond - Tomo 1/)).toHaveLength(2)
    fireEvent.click(screen.getByRole('button', { name: 'Borrar meme 1' }))
    expect(api.deleteMeme).not.toHaveBeenCalled()
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(api.deleteMeme).toHaveBeenCalledWith('m1'))
    await waitFor(() => expect(screen.queryByText('hola')).toBeNull())
    expect(screen.getByText('chao')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Editar meme 1' }))
    expect(screen.getByTestId('probe').textContent).toBe('/memes/crear m2')
  })

  it('MemeLibrary_vacia_muestra_estado_vacio_con_enlace_a_Crear', async () => {
    setup([])
    expect(await screen.findByText(/aún no tienes memes/i)).toBeTruthy()
    const links = screen.getAllByRole('link', { name: 'Crear meme' })
    expect(links[0].getAttribute('href')).toBe('/memes/crear')
  })

  it('un fallo de carga muestra error', async () => {
    const api = { listProducts: vi.fn().mockResolvedValue([]), listMyMemes: vi.fn().mockRejectedValue(new Error('x')), deleteMeme: vi.fn() }
    render(<MemoryRouter><MemeLibrary api={api} /></MemoryRouter>)
    expect(await screen.findByRole('alert')).toBeTruthy()
  })

  it('cancelar_la_confirmacion_no_borra', async () => {
    const api = setup(memes)
    fireEvent.click(await screen.findByRole('button', { name: 'Borrar meme 1' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(api.deleteMeme).not.toHaveBeenCalled()
  })
})
