import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { pickRandomPage } from '../lib/memes/sampler.js'
import { drawMeme } from '../lib/memes/render.js'
import MemeEditor from './MemeEditor.jsx'
import { clearPreviewCache } from '../components/memes/previewCache.js'

vi.mock('../lib/memes/sampler.js', () => ({ pickRandomPage: vi.fn() }))
vi.mock('../lib/memes/render.js', () => ({ drawMeme: vi.fn() }))

const products = [
  { id: 'manga-1', name: 'Vagabond - Tomo 1', categoryId: 'mangas' },
  { id: 'funko-1', name: 'Funko', categoryId: 'funko' },
]
const page = {
  productId: 'manga-1', language: 'es', pageIndex: 2, url: '/mdx/img?u=1',
  bubbles: [{ x: 0.1, y: 0.1, w: 0.3, h: 0.2 }, { x: 0.5, y: 0.5, w: 0.2, h: 0.2 }],
}
const img = { width: 100, height: 150, naturalWidth: 100, naturalHeight: 150 }

const setup = (extra = {}) => {
  const api = { listProducts: vi.fn().mockResolvedValue(products), createMeme: vi.fn().mockResolvedValue({ id: 'm1' }), updateMeme: vi.fn() }
  const find = vi.fn().mockResolvedValue({ language: 'es', pages: ['/a', '/b', '/c'] })
  const loadImage = vi.fn().mockResolvedValue(img)
  render(<MemoryRouter><MemeEditor api={api} find={find} loadImage={loadImage} {...extra} /></MemoryRouter>)
  return { api, find, loadImage }
}
const lastBubbles = () => drawMeme.mock.calls.at(-1)[2]

describe('MemeEditor', () => {
  beforeEach(() => {
    pickRandomPage.mockReset().mockResolvedValue(page)
    drawMeme.mockReset()
    clearPreviewCache()
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}))
  })
  afterEach(cleanup)

  it('cliente_ve_una_pagina_sorteada_con_recuadros_marcados', async () => {
    const { find } = setup()
    expect(await screen.findByRole('button', { name: 'Recuadro 1' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Recuadro 2' })).toBeTruthy()
    expect(document.querySelectorAll('.meme-box')).toHaveLength(2)
    expect(find).toHaveBeenCalledTimes(1) // solo el producto de mangas
    expect(drawMeme).toHaveBeenCalled()
  })

  it('elegir_un_recuadro_y_escribir_actualiza_el_lienzo', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Recuadro 2' }))
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'hola' } })
    await waitFor(() => expect(lastBubbles()).toEqual([expect.objectContaining({ x: 0.5, y: 0.5, text: 'hola' })]))
  })

  it('cambiar_fuente_y_color_actualiza_el_lienzo', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Recuadro 1' }))
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'hola' } })
    fireEvent.change(screen.getByLabelText('Fuente'), { target: { value: 'Impact' } })
    fireEvent.change(screen.getByLabelText('Color del texto'), { target: { value: '#ff0000' } })
    fireEvent.change(screen.getByLabelText('Color de fondo'), { target: { value: '#00ff00' } })
    fireEvent.change(screen.getByLabelText('Tamaño'), { target: { value: '30' } })
    await waitFor(() => expect(lastBubbles()[0]).toMatchObject({ fontFamily: 'Impact', color: '#ff0000', background: '#00ff00', fontSize: 30 }))
  })

  it('sin_paginas_disponibles_muestra_estado_vacio', async () => {
    pickRandomPage.mockResolvedValue(null)
    setup({ find: vi.fn().mockRejectedValue(new Error('no-preview')) })
    expect(await screen.findByText(/no hay páginas disponibles/i)).toBeTruthy()
  })

  it('un fallo al cargar productos muestra error con reintento', async () => {
    const api = { listProducts: vi.fn().mockRejectedValue(new Error('x')) }
    render(<MemoryRouter><MemeEditor api={api} /></MemoryRouter>)
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy()
  })

  it('texto de más de 200 caracteres o tamaño fuera de 8 a 72 bloquea guardar', async () => {
    const { api } = setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Recuadro 1' }))
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'x'.repeat(201) } })
    expect(screen.getByRole('button', { name: 'Guardar' }).disabled).toBe(true)
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'ok' } })
    expect(screen.getByRole('button', { name: 'Guardar' }).disabled).toBe(false)
    fireEvent.change(screen.getByLabelText('Tamaño'), { target: { value: '5' } })
    expect(screen.getByRole('button', { name: 'Guardar' }).disabled).toBe(true)
    expect(api.createMeme).not.toHaveBeenCalled()
  })

  it('guardar_llama_createMeme_con_la_receta', async () => {
    const { api } = setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Recuadro 1' }))
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'hola' } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }))
    await waitFor(() => expect(api.createMeme).toHaveBeenCalledTimes(1))
    expect(api.createMeme).toHaveBeenCalledWith({
      productId: 'manga-1', language: 'es', pageIndex: 2,
      bubbles: [{ x: 0.1, y: 0.1, w: 0.3, h: 0.2, text: 'hola', fontFamily: 'Montserrat', fontSize: 24, color: '#000000', background: '#ffffff' }],
    })
    expect(await screen.findByText('Meme guardado')).toBeTruthy()
  })

  it('exportar_png_llama_toBlob', async () => {
    const toBlob = vi.fn()
    HTMLCanvasElement.prototype.toBlob = toBlob
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Recuadro 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Exportar PNG' }))
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/png')
  })

  it('sin recuadros detectados se puede dibujar uno con el mouse', async () => {
    pickRandomPage.mockResolvedValue(null)
    setup()
    const stage = await screen.findByTestId('meme-stage')
    stage.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 300 })
    fireEvent.pointerDown(stage, { clientX: 20, clientY: 30, pointerId: 1 })
    fireEvent.pointerMove(stage, { clientX: 120, clientY: 150, pointerId: 1 })
    fireEvent.pointerUp(stage, { clientX: 120, clientY: 150, pointerId: 1 })
    expect(await screen.findByRole('button', { name: 'Recuadro 1' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'a mano' } })
    await waitFor(() => expect(lastBubbles()[0]).toMatchObject({ x: 0.1, y: 0.1, w: 0.5, h: 0.4, text: 'a mano' }))
  })

  const twoMangas = [
    { id: 'manga-1', name: 'Vagabond - Tomo 1', categoryId: 'mangas' },
    { id: 'manga-2', name: 'Berserk - Tomo 1', categoryId: 'mangas' },
  ]
  const setupMany = (list) => {
    const api = { listProducts: vi.fn().mockResolvedValue(list), createMeme: vi.fn(), updateMeme: vi.fn() }
    const find = vi.fn().mockResolvedValue({ language: 'es', pages: ['/a', '/b'] })
    render(<MemoryRouter><MemeEditor api={api} find={find} loadImage={vi.fn().mockResolvedValue(img)} /></MemoryRouter>)
    return find
  }

  it('el_sorteo_pide_el_preview_de_un_solo_producto_si_sirve', async () => {
    const find = setupMany(twoMangas)
    await screen.findByRole('button', { name: 'Recuadro 1' })
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('el_sorteo_pasa_al_siguiente_producto_solo_si_el_primero_no_sirve', async () => {
    pickRandomPage.mockReset().mockResolvedValueOnce(null).mockResolvedValue(page)
    const find = setupMany(twoMangas)
    await screen.findByRole('button', { name: 'Recuadro 1' })
    expect(find).toHaveBeenCalledTimes(2)
    expect(find.mock.calls[0][0]).not.toBe(find.mock.calls[1][0])
  })

  it('otra_pagina_reutiliza_el_cache_de_previews', async () => {
    const find = setupMany([twoMangas[0]])
    await screen.findByRole('button', { name: 'Recuadro 1' })
    fireEvent.click(screen.getByRole('button', { name: 'Otra página' }))
    await waitFor(() => expect(pickRandomPage).toHaveBeenCalledTimes(2))
    await screen.findByRole('button', { name: 'Recuadro 1' })
    fireEvent.click(screen.getByRole('button', { name: 'Otra página' }))
    await waitFor(() => expect(pickRandomPage).toHaveBeenCalledTimes(3))
    expect(find).toHaveBeenCalledTimes(1)
  })

  it('doble_clic_en_Guardar_llama_createMeme_una_sola_vez', async () => {
    const { api } = setup()
    api.createMeme.mockReturnValue(new Promise(() => {}))
    fireEvent.click(await screen.findByRole('button', { name: 'Recuadro 1' }))
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'hola' } })
    const btn = screen.getByRole('button', { name: 'Guardar' })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(api.createMeme).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Guardar' }).disabled).toBe(true))
  })

  it('campos_numericos_producen_un_recuadro_valido_y_rechazan_fuera_de_rango', async () => {
    pickRandomPage.mockResolvedValue(null)
    setup()
    await screen.findByTestId('meme-stage')
    const add = screen.getByRole('button', { name: 'Agregar recuadro' })
    const set = (label, v) => fireEvent.change(screen.getByLabelText(label), { target: { value: v } })
    set('X (%)', '10'); set('Y (%)', '20'); set('Ancho (%)', '50'); set('Alto (%)', '30')
    expect(add.disabled).toBe(false)
    set('Ancho (%)', '95') // 10 + 95 > 100
    expect(add.disabled).toBe(true)
    set('Ancho (%)', '50')
    fireEvent.click(add)
    expect(await screen.findByRole('button', { name: 'Recuadro 1' })).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'k' } })
    await waitFor(() => expect(lastBubbles()[0]).toMatchObject({ x: 0.1, y: 0.2, w: 0.5, h: 0.3 }))
  })

  it('el_textarea_tiene_maxLength_y_contador', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Recuadro 1' }))
    const ta = screen.getByLabelText('Texto')
    expect(ta.getAttribute('maxlength')).toBe('200')
    expect(screen.getByText('0/200')).toBeTruthy()
    fireEvent.change(ta, { target: { value: 'abc' } })
    expect(screen.getByText('3/200')).toBeTruthy()
  })
})
