import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { seedProducts } from '../../data/seed.js'
import { createFakeAdminApi } from '../../api/fakeAdminApi.js'
import { ApiError } from '../../api/http.js'
import { flush } from '../../../test/flush.js'
import AdminProducts from './AdminProducts.jsx'

function Probe() {
  const { pathname } = useLocation()
  return <p>{`ruta ${pathname}`}</p>
}

describe('AdminProducts', () => {
  let api
  const setup = async (state) => {
    const view = render(
    <MemoryRouter initialEntries={[{ pathname: '/admin/productos', state }]}>
      <Routes>
        <Route path="/admin/productos" element={<AdminProducts api={api} />} />
        <Route path="/admin/*" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
    )
    await flush()
    return view
  }
  const rowOf = (name) => screen.getByText(name).closest('tr')
  beforeEach(() => {
    api = createFakeAdminApi({
      products: [
        { ...seedProducts[0], id: 'p1', name: 'Pokémon Vol 1', brand: 'Panini' },
        { ...seedProducts[0], id: 'p2', name: 'Berserk', brand: 'Norma', salePrice: 9990 },
      ],
    }).api
    vi.spyOn(api, 'deleteProduct')
  })
  afterEach(cleanup)

  it('lista una fila por producto y la tabla tiene nombre', async () => {
    await setup()
    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Productos' })).toBeTruthy()
    expect(screen.getAllByRole('row')).toHaveLength(3)
  })

  it('muestra Cargando y luego los productos; si falla ofrece reintentar', async () => {
    api.listProducts = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue([])
    await setup()
    expect(screen.getByText('No pudimos cargar los productos')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await flush()
    expect(screen.getByRole('heading', { name: 'No hay productos' })).toBeTruthy()
  })

  it('filtra por nombre o marca sin tildes ni mayúsculas', async () => {
    await setup()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pokemon' } })
    expect(screen.getAllByRole('row')).toHaveLength(2)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'NORMA' } })
    expect(screen.getByText('Berserk')).toBeTruthy()
    expect(screen.queryByText('Pokémon Vol 1')).toBeNull()
  })

  it('sin resultados muestra el estado vacío', async () => {
    await setup()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(screen.getByRole('heading', { name: 'No hay productos' })).toBeTruthy()
  })

  it('no elimina hasta confirmar y luego llama con el id y quita la fila', async () => {
    await setup()
    const id = 'p2'
    fireEvent.click(within(rowOf('Berserk')).getByRole('button', { name: /Eliminar/ }))
    expect(await screen.findByText('¿Eliminar Berserk? Esta acción no se puede deshacer.')).toBeTruthy()
    expect(api.deleteProduct).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    await flush()
    expect(api.deleteProduct).toHaveBeenCalledExactlyOnceWith(id)
    expect(screen.queryByText('Berserk')).toBeNull()
  })

  for (const [status, text] of [[403, 'No tienes permiso para modificar este producto.'], [404, 'El producto ya no existe.']]) {
    it(`borrar con ${status} muestra "${text}" y deja la fila`, async () => {
      api.deleteProduct.mockRejectedValue(new ApiError(status, 'X'))
      await setup()
      fireEvent.click(within(rowOf('Berserk')).getByRole('button', { name: /Eliminar/ }))
      fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }))
      await flush()
      expect(screen.getByRole('alert').textContent).toBe(text)
      expect(screen.getByText('Berserk')).toBeTruthy()
    })
  }

  it('cancelar deja todo intacto', async () => {
    await setup()
    fireEvent.click(within(rowOf('Berserk')).getByRole('button', { name: /Eliminar/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(api.deleteProduct).not.toHaveBeenCalled()
    expect(screen.getByText('Berserk')).toBeTruthy()
  })

  it('Nuevo producto navega y Editar enlaza al id', async () => {
    await setup()
    const id = 'p2'
    expect(within(rowOf('Berserk')).getByRole('link', { name: /Editar/ }).getAttribute('href')).toBe(`/admin/productos/${id}`)
    fireEvent.click(screen.getByRole('link', { name: 'Nuevo producto' }))
    expect(screen.getByText('ruta /admin/productos/nuevo')).toBeTruthy()
  })

  it('muestra el aviso del router state con role status', async () => {
    await setup({ notice: 'Producto guardado' })
    expect(screen.getByRole('status').textContent).toContain('Producto guardado')
  })
})
