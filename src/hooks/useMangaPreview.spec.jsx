import { renderHook, waitFor, act } from '@testing-library/react'
import { useMangaPreview } from './useMangaPreview.js'
import { PreviewError } from '../lib/mangadex.js'

const DATA = { chapter: '1', language: 'es', pages: ['/a.jpg'] }

describe('useMangaPreview', () => {
  it('parte cargando y pasa a ready con los datos', async () => {
    const find = vi.fn().mockResolvedValue(DATA)
    const { result } = renderHook(() => useMangaPreview('Vagabond - Tomo 1', find))
    expect(result.current[0].status).toBe('loading')
    await waitFor(() => expect(result.current[0]).toEqual({ status: 'ready', data: DATA, language: 'es' }))
    expect(find.mock.calls[0][0]).toBe('Vagabond - Tomo 1')
  })

  it('no-preview pasa a empty y cualquier otro fallo a error', async () => {
    const empty = renderHook(() => useMangaPreview('X', vi.fn().mockRejectedValue(new PreviewError('no-preview'))))
    await waitFor(() => expect(empty.result.current[0].status).toBe('empty'))
    const broken = renderHook(() => useMangaPreview('X', vi.fn().mockRejectedValue(new PreviewError('network'))))
    await waitFor(() => expect(broken.result.current[0].status).toBe('error'))
  })

  it('retry vuelve a cargar y puede terminar bien', async () => {
    const find = vi.fn().mockRejectedValueOnce(new PreviewError('network')).mockResolvedValueOnce(DATA)
    const { result } = renderHook(() => useMangaPreview('X', find))
    await waitFor(() => expect(result.current[0].status).toBe('error'))
    act(() => result.current[1]())
    expect(result.current[0].status).toBe('loading')
    await waitFor(() => expect(result.current[0].status).toBe('ready'))
    expect(find).toHaveBeenCalledTimes(2)
  })

  it('al desmontar cancela la petición y no toca el estado', async () => {
    let signal
    const find = vi.fn((_name, options) => { signal = options.signal; return new Promise(() => {}) })
    const { unmount } = renderHook(() => useMangaPreview('X', find))
    unmount()
    expect(signal.aborted).toBe(true)
  })

  it('un AbortError no se convierte en error visible', async () => {
    const find = vi.fn().mockRejectedValue(new DOMException('abort', 'AbortError'))
    const { result } = renderHook(() => useMangaPreview('X', find))
    await act(async () => { await Promise.resolve() })
    expect(result.current[0].status).toBe('loading')
  })

  it('select pide otro idioma, conserva la lista del primer resultado y marca el idioma', async () => {
    const find = vi.fn()
      .mockResolvedValueOnce({ ...DATA, languages: ['es', 'en', 'fr'] })
      .mockResolvedValueOnce({ chapter: '1', language: 'fr', languages: ['fr'], pages: ['/f.jpg'] })
    const { result } = renderHook(() => useMangaPreview('X', find))
    await waitFor(() => expect(result.current[0].status).toBe('ready'))
    act(() => result.current[2]('fr'))
    expect(result.current[0]).toEqual({ status: 'loading', language: 'fr', languages: ['es', 'en', 'fr'] })
    await waitFor(() => expect(result.current[0].status).toBe('ready'))
    expect(find.mock.calls[1][1].language).toBe('fr')
    expect(result.current[0].languages).toEqual(['es', 'en', 'fr'])
    expect(result.current[0].language).toBe('fr')
  })

  it('un idioma elegido sin páginas se quita de la lista', async () => {
    const find = vi.fn()
      .mockResolvedValueOnce({ ...DATA, languages: ['es', 'en'] })
      .mockRejectedValueOnce(new PreviewError('no-preview'))
    const { result } = renderHook(() => useMangaPreview('X', find))
    await waitFor(() => expect(result.current[0].status).toBe('ready'))
    act(() => result.current[2]('en'))
    await waitFor(() => expect(result.current[0].status).toBe('empty'))
    expect(result.current[0].languages).toEqual(['es'])
  })
})
