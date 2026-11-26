import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { seedProducts } from '../../data/seed.js'
import { ApiError } from '../../api/http.js'
import ProductForm from './ProductForm.jsx'

function Probe() {
  const { pathname, state } = useLocation()
  return <p>{`lista ${pathname} ${state?.notice ?? ''}`.trim()}</p>
}

const deferred = () => {
  let resolve
  const promise = new Promise((r) => { resolve = r })
  return { promise, resolve }
}

describe('ProductForm', () => {
  let api
  const existing = { ...seedProducts[1], id: 'manga-2' }
  const setup = (entry = '/admin/productos/nuevo') => render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/admin/productos/nuevo" element={<ProductForm api={api} />} />
        <Route path="/admin/productos/:id" element={<ProductForm api={api} />} />
        <Route path="/admin/productos" element={<Probe />} />
      </Routes>
    </MemoryRouter>,
  )
  const change = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
  const fill = (over = {}) => {
    const v = { Nombre: 'Prueba', Marca: 'Marca X', Categoría: 'funko', Precio: '9990', Stock: '5', 'Imagen (URL)': '/img/placeholder.svg', ...over }
    Object.entries(v).forEach(([k, val]) => change(k, val))
  }
  const save = () => fireEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))
  beforeEach(() => {
    api = {
      createProduct: vi.fn().mockImplementation((i) => ({ ...i, id: 'new' })),
      updateProduct: vi.fn(),
      getProduct: vi.fn().mockImplementation(async (id) => {
        if (id !== existing.id) throw new ApiError(404, 'NOT_FOUND')
        return existing
      }),
    }
  })
  afterEach(cleanup)

  it('crear: título y guardado válido con números y salePrice null', async () => {
    setup()
    expect(screen.getByRole('heading', { name: 'Nuevo producto', level: 1 })).toBeTruthy()
    fill()
    fireEvent.click(screen.getByLabelText('Nuevo'))
    save()
    expect(api.createProduct).toHaveBeenCalledTimes(1)
    const arg = api.createProduct.mock.lastCall[0]
    expect(arg.price).toBe(9990)
    expect(arg.stock).toBe(5)
    expect(arg.salePrice).toBeNull()
    expect(arg.categoryId).toBe('funko')
    expect(arg.genre).toBeNull()
    expect(arg.isNew).toBe(true)
    expect(arg.isBestSeller).toBe(false)
    expect(await screen.findByText('lista /admin/productos Producto guardado')).toBeTruthy()
  })

  it('oferta mayor o igual al precio da error y no guarda', () => {
    setup()
    fill({ 'Precio de oferta (opcional)': '9990' })
    save()
    expect(screen.getByText('La oferta debe ser menor que el precio.')).toBeTruthy()
    expect(api.createProduct).not.toHaveBeenCalled()
  })

  for (const bad of ['', '1e3']) {
    it(`precio inválido "${bad}" muestra error`, () => {
      setup()
      fill({ Precio: bad })
      save()
      expect(screen.getByText('Ingresa un precio entero mayor a 0.')).toBeTruthy()
      expect(api.createProduct).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(screen.getByLabelText('Precio'))
    })
  }

  for (const bad of ['0']) {
    it(`oferta inválida "${bad}" muestra error`, () => {
      setup()
      fill({ 'Precio de oferta (opcional)': bad })
      save()
      expect(screen.getByText('Ingresa una oferta entera mayor a 0.')).toBeTruthy()
      expect(api.createProduct).not.toHaveBeenCalled()
    })
  }

  for (const ok of ['https://x/y.png', '/img/p.svg']) {
    it(`URL "${ok}" se acepta`, () => {
      setup()
      fill({ 'Imagen (URL)': ok })
      save()
      expect(api.createProduct).toHaveBeenCalledTimes(1)
      expect(api.createProduct.mock.lastCall[0].image).toBe(ok)
    })
  }

  it('stock inválido y cero válido', () => {
    setup()
    fill({ Stock: '-1' })
    save()
    expect(screen.getByText('Ingresa un stock entero de 0 o más.')).toBeTruthy()
    change('Stock', '0')
    save()
    expect(api.createProduct.mock.lastCall[0].stock).toBe(0)
  })

  it('campos requeridos e imagen inválida', () => {
    setup()
    fill({ Nombre: '', Marca: '', 'Imagen (URL)': 'foto.png' })
    save()
    expect(screen.getByText('Ingresa el nombre.')).toBeTruthy()
    expect(screen.getByText('Ingresa la marca.')).toBeTruthy()
    expect(screen.getByText('Ingresa una URL que empiece con http://, https:// o /.')).toBeTruthy()
    expect(document.activeElement).toBe(screen.getByLabelText('Nombre'))
  })

  it('manga exige género y otra categoría lo limpia', () => {
    setup()
    fill({ Categoría: 'mangas' })
    save()
    expect(screen.getByText('Selecciona un género.')).toBeTruthy()
    expect(api.createProduct).not.toHaveBeenCalled()
    change('Género', 'shonen')
    change('Categoría', 'accesorios')
    expect(screen.queryByLabelText('Género')).toBeNull()
    save()
    expect(api.createProduct.mock.lastCall[0].genre).toBeNull()
    change('Categoría', 'mangas')
    expect(screen.getByLabelText('Género').value).toBe('')
  })

  it('editar carga valores y llama updateProduct con el id', async () => {
    setup('/admin/productos/manga-2')
    expect(await screen.findByRole('heading', { name: 'Editar producto', level: 1 })).toBeTruthy()
    expect(screen.getByLabelText('Nombre').value).toBe(existing.name)
    expect(screen.getByLabelText('Precio de oferta (opcional)').value).toBe('9990')
    change('Precio', '15000')
    change('Precio de oferta (opcional)', '')
    save()
    await waitFor(() => expect(api.updateProduct).toHaveBeenCalledTimes(1))
    const [id, patch] = api.updateProduct.mock.lastCall
    expect(id).toBe('manga-2')
    expect(patch.price).toBe(15000)
    expect(patch.salePrice).toBeNull()
  })

  it('id desconocido muestra el estado vacío', async () => {
    setup('/admin/productos/nada')
    expect(await screen.findByRole('heading', { name: 'Producto no encontrado' })).toBeTruthy()
  })

  it('doble envío llama al servicio una vez', async () => {
    const d = deferred()
    api.createProduct.mockReturnValue(d.promise)
    setup()
    fill()
    const form = screen.getByRole('button', { name: 'Guardar producto' }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(api.createProduct).toHaveBeenCalledTimes(1)
    d.resolve({ id: 'x' })
    expect(await screen.findByText(/lista \/admin\/productos/)).toBeTruthy()
  })

  it('el vendedor guarda y vuelve a su lista', async () => {
    render(
      <MemoryRouter initialEntries={['/vendedor/productos/nuevo']}>
        <Routes>
          <Route path="/vendedor/productos/nuevo" element={<ProductForm api={api} base="/vendedor" />} />
          <Route path="/vendedor/productos" element={<Probe />} />
        </Routes>
      </MemoryRouter>,
    )
    fill()
    save()
    expect(await screen.findByText('lista /vendedor/productos Producto guardado')).toBeTruthy()
  })

  for (const [status, text] of [[403, 'No tienes permiso para modificar este producto.'], [404, 'El producto ya no existe.']]) {
    it(`guardar con ${status} muestra "${text}"`, async () => {
      api.updateProduct.mockRejectedValue(new ApiError(status, 'X'))
      setup('/admin/productos/manga-2')
      await screen.findByLabelText('Nombre')
      save()
      expect((await screen.findByRole('alert')).textContent).toBe(text)
    })
  }

  it('guardar con 400 y detail de texto muestra el mensaje del servidor', async () => {
    api.createProduct.mockRejectedValueOnce(new ApiError(400, 'VALIDATION', 'El precio debe ser mayor a 0'))
    setup()
    fill()
    save()
    expect((await screen.findByRole('alert')).textContent).toBe('El precio debe ser mayor a 0')
  })

  it('guardar con 409 usa el mensaje del servidor y otro error el genérico', async () => {
    api.createProduct.mockRejectedValueOnce(new ApiError(409, 'X', { message: 'Stock inválido' }))
    setup()
    fill()
    save()
    expect((await screen.findByRole('alert')).textContent).toBe('Stock inválido')
    api.createProduct.mockRejectedValueOnce(new Error('boom'))
    save()
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('No pudimos guardar el producto. Intenta de nuevo.'))
  })

  it('Cancelar vuelve a la lista', () => {
    setup()
    fireEvent.click(screen.getByRole('link', { name: 'Cancelar' }))
    expect(screen.getByText('lista /admin/productos')).toBeTruthy()
  })
})
