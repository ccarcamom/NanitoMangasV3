import { render, screen, fireEvent, cleanup, within } from '@testing-library/react'
import { createFakeAdminApi } from '../../api/fakeAdminApi.js'
import { ApiError } from '../../api/http.js'
import { flush } from '../../../test/flush.js'
import AdminUsers from './AdminUsers.jsx'

const USERS = [
  { id: 'u-admin', name: 'Administrador', email: 'admin@nanitomangas.cl', role: 'ADMIN', rut: '', createdAt: '2026-10-21T00:00:00Z', passwordHash: 'SECRETO', seed: true },
  { id: 'u-ana', name: 'Ana Pérez', email: 'ana@mail.cl', role: 'CLIENTE', rut: '12345678-5', createdAt: '2026-10-22T00:00:00Z', passwordHash: 'SECRETO' },
]

describe('AdminUsers', () => {
  let api
  const setup = async () => {
    const view = render(<AdminUsers api={api} />)
    await flush()
    return view
  }
  const rowOf = (email) => screen.getByText(email).closest('tr')
  beforeEach(() => { api = createFakeAdminApi({ users: USERS }).api })
  afterEach(cleanup)

  it('lista usuarios, RUT o guion, y nunca el passwordHash; la tabla tiene nombre', async () => {
    const { container } = await setup()
    expect(screen.getByRole('heading', { name: 'Usuarios', level: 1 })).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Usuarios' })).toBeTruthy()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByText('12345678-5')).toBeTruthy()
    expect(screen.getByText('-')).toBeTruthy()
    expect(container.innerHTML).not.toContain('SECRETO')
  })

  it('admin_cambia_rol_de_un_usuario', async () => {
    vi.spyOn(api, 'updateUser')
    await setup()
    fireEvent.change(within(rowOf('ana@mail.cl')).getByLabelText('Rol de Ana Pérez'), { target: { value: 'VENDEDOR' } })
    await flush()
    expect(api.updateUser).toHaveBeenCalledExactlyOnceWith('u-ana', { role: 'VENDEDOR', active: true })
    expect(within(rowOf('ana@mail.cl')).getByLabelText('Rol de Ana Pérez').value).toBe('VENDEDOR')
  })

  it('desactivar un usuario manda active false', async () => {
    vi.spyOn(api, 'updateUser')
    await setup()
    fireEvent.click(within(rowOf('ana@mail.cl')).getByLabelText('Activo Ana Pérez'))
    await flush()
    expect(api.updateUser).toHaveBeenCalledExactlyOnceWith('u-ana', { role: 'CLIENTE', active: false })
  })

  it('admin_borra_usuario_con_confirmacion', async () => {
    vi.spyOn(api, 'deleteUser')
    await setup()
    fireEvent.click(within(rowOf('ana@mail.cl')).getByRole('button', { name: /Eliminar/ }))
    expect(await screen.findByText('¿Eliminar a Ana Pérez? Esta acción no se puede deshacer.')).toBeTruthy()
    expect(api.deleteUser).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    await flush()
    expect(api.deleteUser).toHaveBeenCalledExactlyOnceWith('u-ana')
    expect(screen.queryByText('ana@mail.cl')).toBeNull()
  })

  it('borrarse a sí mismo o a uno de semilla muestra un mensaje claro y deja la fila', async () => {
    await setup()
    fireEvent.click(within(rowOf('admin@nanitomangas.cl')).getByRole('button', { name: /Eliminar/ }))
    fireEvent.click(await screen.findByRole('button', { name: 'Eliminar' }))
    await flush()
    expect(screen.getByRole('alert').textContent).toContain('No se puede eliminar tu propia cuenta ni un usuario base')
    expect(screen.getByText('admin@nanitomangas.cl')).toBeTruthy()
  })

  it('cambiar el propio rol con 409 muestra el mensaje específico', async () => {
    api.updateUser = vi.fn().mockRejectedValue(new ApiError(409, 'FORBIDDEN_SELF_OR_SEED'))
    await setup()
    fireEvent.change(within(rowOf('admin@nanitomangas.cl')).getByLabelText('Rol de Administrador'), { target: { value: 'CLIENTE' } })
    await flush()
    expect(screen.getByRole('alert').textContent).toBe('No puedes cambiar tu propio rol ni modificar a un usuario de semilla.')
    expect(within(rowOf('admin@nanitomangas.cl')).getByLabelText('Rol de Administrador').value).toBe('ADMIN')
  })

  it('con 403 al cambiar muestra el aviso de permiso', async () => {
    api.updateUser = vi.fn().mockRejectedValue(new ApiError(403, 'FORBIDDEN'))
    await setup()
    fireEvent.click(within(rowOf('ana@mail.cl')).getByLabelText('Activo Ana Pérez'))
    await flush()
    expect(screen.getByRole('alert').textContent).toBe('No tienes permiso para modificar usuarios.')
  })

  it('los controles de la fila quedan deshabilitados durante la petición', async () => {
    let done
    api.updateUser = vi.fn(() => new Promise((r) => { done = () => r({ role: 'VENDEDOR', active: true }) }))
    await setup()
    const row = rowOf('ana@mail.cl')
    fireEvent.change(within(row).getByLabelText('Rol de Ana Pérez'), { target: { value: 'VENDEDOR' } })
    await flush()
    expect(within(row).getByLabelText('Rol de Ana Pérez').disabled).toBe(true)
    expect(within(row).getByLabelText('Activo Ana Pérez').disabled).toBe(true)
    expect(within(rowOf('admin@nanitomangas.cl')).getByLabelText('Rol de Administrador').disabled).toBe(false)
    done()
    await flush()
    expect(within(row).getByLabelText('Rol de Ana Pérez').disabled).toBe(false)
  })
})
