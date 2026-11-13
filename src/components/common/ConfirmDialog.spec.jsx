import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ConfirmDialog from './ConfirmDialog.jsx'

describe('ConfirmDialog', () => {
  let onConfirm, onCancel
  const setup = (props = {}) => {
    onConfirm = vi.fn()
    onCancel = vi.fn()
    render(<ConfirmDialog show message="¿Seguro?" onConfirm={onConfirm} onCancel={onCancel} {...props} />)
  }
  afterEach(cleanup)

  it('muestra el mensaje y no llama nada al abrir', async () => {
    setup()
    expect(await screen.findByText('¿Seguro?')).toBeTruthy()
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('onConfirm solo con el botón de confirmar', async () => {
    setup({ confirmLabel: 'Eliminar' })
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('onCancel con Cancelar y no confirma', async () => {
    setup()
    fireEvent.click(await screen.findByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('el diálogo tiene nombre accesible y el cierre se llama Cerrar', async () => {
    setup({ title: 'Eliminar producto' })
    expect(await screen.findByRole('dialog', { name: 'Eliminar producto' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeTruthy()
  })

  it('Escape y el botón cerrar llaman onCancel y nunca onConfirm', async () => {
    setup()
    fireEvent.keyDown(await screen.findByRole('dialog'), { key: 'Escape', code: 'Escape', keyCode: 27 })
    expect(onCancel).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onCancel).toHaveBeenCalledTimes(2)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it('no renderiza nada si show es false', () => {
    setup({ show: false })
    expect(screen.queryByText('¿Seguro?')).toBeNull()
  })
})
