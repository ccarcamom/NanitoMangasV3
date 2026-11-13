import { render, screen, fireEvent, cleanup, within, act } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { seedProducts } from '../../data/seed.js'
import { createFakeAdminApi } from '../../data/fakeAdminApi.js'
import AdminProducts from './AdminProducts.jsx'

function Probe() {
  const { pathname } = useLocation()
  return <p>{`ruta ${pathname}`}</p>
}

describe('AdminProducts', () => {
  let api
  const add = (over) => api.createProduct({ ...seedProducts[0], ...over, id: undefined })
  const setup = (state) => render(
    <MemoryRouter initialEntries={[{ pathname: '/admin/productos', state }]}>
      <Routes>
        <Route path="/admin/productos" element={<AdminProducts api={api} />} />
        <Route path="/admin/*" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
  )
  const rowOf = (name) => screen.getByText(name).closest('tr')
  beforeEach(() => {
    api = createFakeAdminApi().api
    add({ id: 'p1', name: 'Pokémon Vol 1', brand: 'Panini' })
    add({ id: 'p2', name: 'Berserk', brand: 'Norma', salePrice: 9990 })
    vi.spyOn(api, 'deleteProduct')
  })
  afterEach(cleanup)

  it('lista una fila por producto y la tabla tiene nombre', () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Productos', level: 1 })).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Productos' })).toBeTruthy()
    expect(screen.getAllByRole('row')).toHaveLength(api.listProducts().length + 1)
  })

  it('lee de la fuente inyectada y se actualiza cuando cambia', () => {
    setup()
    expect(screen.queryByText('Recién creado')).toBeNull()
    act(() => { add({ name: 'Recién creado' }) })
    expect(screen.getByText('Recién creado')).toBeTruthy()
  })

  it('filtra por nombre o marca sin tildes ni mayúsculas', () => {
    setup()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'pokemon' } })
    expect(screen.getAllByRole('row')).toHaveLength(2)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'NORMA' } })
    expect(screen.getByText('Berserk')).toBeTruthy()
    expect(screen.queryByText('Pokémon Vol 1')).toBeNull()
  })

  it('sin resultados muestra el estado vacío', () => {
    setup()
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(screen.getByRole('heading', { name: 'No hay productos' })).toBeTruthy()
  })

  it('no elimina hasta confirmar y luego llama con el id y quita la fila', async () => {
    setup()
    const id = api.listProducts().find((p) => p.name === 'Berserk').id
    fireEvent.click(within(rowOf('Berserk')).getByRole('button', { name: /Eliminar/ }))
    expect(await screen.findByText('¿Eliminar Berserk? Esta acción no se puede deshacer.')).toBeTruthy()
    expect(api.deleteProduct).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(api.deleteProduct).toHaveBeenCalledExactlyOnceWith(id)
    expect(screen.queryByText('Berserk')).toBeNull()
  })

  it('cancelar deja todo intacto', async () => {
    setup()
    fireEvent.click(within(rowOf('Berserk')).getByRole('button', { name: /Eliminar/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(api.deleteProduct).not.toHaveBeenCalled()
    expect(screen.getByText('Berserk')).toBeTruthy()
  })

  it('Nuevo producto navega y Editar enlaza al id', () => {
    setup()
    const id = api.listProducts().find((p) => p.name === 'Berserk').id
    expect(within(rowOf('Berserk')).getByRole('link', { name: /Editar/ }).getAttribute('href')).toBe(`/admin/productos/${id}`)
    fireEvent.click(screen.getByRole('link', { name: 'Nuevo producto' }))
    expect(screen.getByText('ruta /admin/productos/nuevo')).toBeTruthy()
  })

  it('muestra el aviso del router state con role status', () => {
    setup({ notice: 'Producto guardado' })
    expect(screen.getByRole('status').textContent).toContain('Producto guardado')
  })
})
