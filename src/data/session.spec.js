import { createStorage } from './storage.js'
import { createUsersApi } from './users.js'
import { createSessionApi } from './session.js'
import { fakeBackend } from './fakeBackend.js'

const make = () => {
  const storage = createStorage(fakeBackend())
  const users = createUsersApi(storage)
  return { users, session: createSessionApi(storage, users) }
}

describe('session', () => {
  it('es null sin sesion', () => {
    expect(make().session.getSessionUserId()).toBeNull()
  })
  it('setSession y clearSession', () => {
    const { session } = make()
    session.setSession('user-admin')
    expect(session.getSessionUserId()).toBe('user-admin')
    session.clearSession()
    expect(session.getSessionUserId()).toBeNull()
  })
  it('es null si el usuario guardado ya no existe', () => {
    const { session } = make()
    session.setSession('fantasma')
    expect(session.getSessionUserId()).toBeNull()
  })
})
