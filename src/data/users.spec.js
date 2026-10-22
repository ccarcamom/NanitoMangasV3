import { createStorage } from './storage.js'
import { createUsersApi } from './users.js'
import { fakeBackend } from './fakeBackend.js'
import { ADMIN_EMAIL, ADMIN_PASSWORD } from './seed.js'

const make = () => createUsersApi(createStorage(fakeBackend()))
const ana = { name: 'Ana', email: '  ANA@x.cl ', password: 'Secreto123' }

describe('users', () => {
  it('registerUser normaliza el correo, hashea y asigna rol customer', async () => {
    const api = make()
    const u = await api.registerUser(ana)
    expect(u.email).toBe('ana@x.cl')
    expect(u.role).toBe('customer')
    expect(u.rut).toBe('')
    expect(u.address).toBeNull()
    expect(u.passwordHash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(api.listUsers())).not.toContain('Secreto123')
    expect(api.getUser(u.id).name).toBe('Ana')
  })
  it('rechaza correo repetido sin mayusculas ni espacios', async () => {
    const api = make()
    await api.registerUser(ana)
    await expectAsync(api.registerUser({ ...ana, email: 'ana@x.cl' })).toBeRejectedWithError('EMAIL_TAKEN')
  })
  it('dos registros paralelos con el mismo correo crean una sola cuenta', async () => {
    const api = make()
    const r = await Promise.allSettled([api.registerUser(ana), api.registerUser(ana)])
    expect(r.filter((x) => x.status === 'fulfilled').length).toBe(1)
    const rej = r.filter((x) => x.status === 'rejected')
    expect(rej.length).toBe(1)
    expect(rej[0].reason.message).toBe('EMAIL_TAKEN')
    expect(api.listUsers().filter((u) => u.email === 'ana@x.cl').length).toBe(1)
  })
  it('loginUser funciona con credenciales correctas (correo sin normalizar)', async () => {
    const api = make()
    const u = await api.registerUser(ana)
    expect((await api.loginUser('ANA@x.cl ', 'Secreto123')).id).toBe(u.id)
  })
  it('loginUser rechaza contrasena errada y correo desconocido', async () => {
    const api = make()
    await api.registerUser(ana)
    await expectAsync(api.loginUser('ana@x.cl', 'mala')).toBeRejectedWithError('INVALID_CREDENTIALS')
    await expectAsync(api.loginUser('nadie@x.cl', 'Secreto123')).toBeRejectedWithError('INVALID_CREDENTIALS')
  })
  it('el admin sembrado inicia sesion y es admin', async () => {
    const u = await make().loginUser(ADMIN_EMAIL, ADMIN_PASSWORD)
    expect(u.role).toBe('admin')
    expect(u.id).toBe('user-admin')
  })
  it('updateProfile solo cambia name, rut y address', async () => {
    const api = make()
    const u = await api.registerUser(ana)
    const address = { street: 'Calle 1', comuna: 'Santiago', region: 'RM' }
    const r = api.updateProfile(u.id, { name: 'Ana B', rut: '12345678-5', address, role: 'admin', email: 'x@x.cl', passwordHash: 'z' })
    expect(r.name).toBe('Ana B')
    expect(r.rut).toBe('12345678-5')
    expect(r.address).toEqual(address)
    expect(r.role).toBe('customer')
    expect(r.email).toBe('ana@x.cl')
    expect(r.passwordHash).toBe(u.passwordHash)
  })
  it('subscribeUsers avisa al registrar', async () => {
    const api = make()
    const cb = jasmine.createSpy('cb')
    api.subscribeUsers(cb)
    await api.registerUser(ana)
    expect(cb).toHaveBeenCalled()
  })
})
