import { render, screen, cleanup, act } from '@testing-library/react'
import { ADMIN_SEED_HASH } from '../../data/seed.js'
import { createFakeAdminApi } from '../../data/fakeAdminApi.js'
import AdminUsers from './AdminUsers.jsx'

describe('AdminUsers', () => {
  let fake
  beforeEach(() => { fake = createFakeAdminApi() })
  afterEach(cleanup)

  it('lista usuarios, RUT o guion, y nunca el passwordHash; la tabla tiene nombre', async () => {
    const ana = await fake.usersApi.registerUser({ name: 'Ana Pérez', email: 'ana@mail.cl', password: 'Clave1234' })
    fake.usersApi.updateProfile(ana.id, { rut: '12345678-5' })
    const { container } = render(<AdminUsers api={fake.api} />)
    expect(screen.getByRole('heading', { name: 'Usuarios', level: 1 })).toBeTruthy()
    expect(screen.getByRole('table', { name: 'Usuarios' })).toBeTruthy()
    expect(screen.getAllByRole('row')).toHaveLength(3)
    expect(screen.getByText('ana@mail.cl')).toBeTruthy()
    expect(screen.getByText('12345678-5')).toBeTruthy()
    expect(screen.getByText('-')).toBeTruthy()
    expect(container.innerHTML).not.toContain(ADMIN_SEED_HASH)
    expect(container.innerHTML).not.toContain(fake.usersApi.getUser(ana.id).passwordHash)
  })

  it('se actualiza cuando cambia la fuente inyectada', async () => {
    render(<AdminUsers api={fake.api} />)
    expect(screen.getAllByRole('row')).toHaveLength(2)
    await act(async () => { await fake.usersApi.registerUser({ name: 'Luis', email: 'luis@mail.cl', password: 'Clave1234' }) })
    expect(screen.getByText('luis@mail.cl')).toBeTruthy()
  })
})
