import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { seedProducts } from '../../data/seed.js'
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
      createProduct: jasmine.createSpy('createProduct').and.callFake((i) => ({ ...i, id: 'new' })),
      updateProduct: jasmine.createSpy('updateProduct'),
      getProduct: (id) => (id === existing.id ? existing : undefined),
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
    const arg = api.createProduct.calls.mostRecent().args[0]
    expect(arg.price).toBe(9990)
    expect(arg.stock).toBe(5)
    expect(arg.salePrice).toBeNull()
    expect(arg.categoryId).toBe('funko')
    expect(arg.genre).toBeNull()
    expect(arg.isNew).toBeTrue()
    expect(arg.isBestSeller).toBeFalse()
    expect(await screen.findByText('lista /admin/productos Producto guardado')).toBeTruthy()
  })

  it('oferta mayor o igual al precio da error y no guarda', () => {
    setup()
    fill({ 'Precio de oferta (opcional)': '9990' })
    save()
    expect(screen.getByText('La oferta debe ser menor que el precio.')).toBeTruthy()
    expect(api.createProduct).not.toHaveBeenCalled()
  })

  for (const bad of ['', 'abc', '10.5', '-1', '1e3']) {
    it(`precio inválido "${bad}" muestra error`, () => {
      setup()
      fill({ Precio: bad })
      save()
      expect(screen.getByText('Ingresa un precio entero mayor a 0.')).toBeTruthy()
      expect(api.createProduct).not.toHaveBeenCalled()
      expect(document.activeElement).toBe(screen.getByLabelText('Precio'))
    })
  }

  for (const bad of ['0', 'abc', '10.5']) {
    it(`oferta inválida "${bad}" muestra error`, () => {
      setup()
      fill({ 'Precio de oferta (opcional)': bad })
      save()
      expect(screen.getByText('Ingresa una oferta entera mayor a 0.')).toBeTruthy()
      expect(api.createProduct).not.toHaveBeenCalled()
    })
  }

  it('oferta por encima del precio da error', () => {
    setup()
    fill({ 'Precio de oferta (opcional)': '20000' })
    save()
    expect(screen.getByText('La oferta debe ser menor que el precio.')).toBeTruthy()
  })

  for (const bad of ['abc', '-1', '1e3']) {
    it(`stock inválido "${bad}" muestra error`, () => {
      setup()
      fill({ Stock: bad })
      save()
      expect(screen.getByText('Ingresa un stock entero de 0 o más.')).toBeTruthy()
      expect(api.createProduct).not.toHaveBeenCalled()
    })
  }

  for (const ok of ['http://x/y.png', 'https://x/y.png', '/img/p.svg']) {
    it(`URL "${ok}" se acepta`, () => {
      setup()
      fill({ 'Imagen (URL)': ok })
      save()
      expect(api.createProduct).toHaveBeenCalledTimes(1)
      expect(api.createProduct.calls.mostRecent().args[0].image).toBe(ok)
    })
  }

  it('stock inválido y cero válido', () => {
    setup()
    fill({ Stock: '2.5' })
    save()
    expect(screen.getByText('Ingresa un stock entero de 0 o más.')).toBeTruthy()
    change('Stock', '0')
    save()
    expect(api.createProduct.calls.mostRecent().args[0].stock).toBe(0)
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
    expect(api.createProduct.calls.mostRecent().args[0].genre).toBeNull()
    change('Categoría', 'mangas')
    expect(screen.getByLabelText('Género').value).toBe('')
  })

  it('editar carga valores y llama updateProduct con el id', () => {
    setup('/admin/productos/manga-2')
    expect(screen.getByRole('heading', { name: 'Editar producto', level: 1 })).toBeTruthy()
    expect(screen.getByLabelText('Nombre').value).toBe(existing.name)
    expect(screen.getByLabelText('Precio de oferta (opcional)').value).toBe('9990')
    change('Precio', '15000')
    change('Precio de oferta (opcional)', '')
    save()
    expect(api.updateProduct).toHaveBeenCalledTimes(1)
    const [id, patch] = api.updateProduct.calls.mostRecent().args
    expect(id).toBe('manga-2')
    expect(patch.price).toBe(15000)
    expect(patch.salePrice).toBeNull()
  })

  it('id desconocido muestra el estado vacío', () => {
    setup('/admin/productos/nada')
    expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeTruthy()
  })

  it('doble envío llama al servicio una vez', async () => {
    const d = deferred()
    api.createProduct.and.returnValue(d.promise)
    setup()
    fill()
    const form = screen.getByRole('button', { name: 'Guardar producto' }).closest('form')
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(api.createProduct).toHaveBeenCalledTimes(1)
    d.resolve({ id: 'x' })
    expect(await screen.findByText(/lista \/admin\/productos/)).toBeTruthy()
  })

  it('Cancelar vuelve a la lista', () => {
    setup()
    fireEvent.click(screen.getByRole('link', { name: 'Cancelar' }))
    expect(screen.getByText('lista /admin/productos')).toBeTruthy()
  })
})
