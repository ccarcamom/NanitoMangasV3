// Test helper: users + session API over a fake storage (specs never touch the real store).
import { createStorage } from './storage.js'
import { fakeBackend } from './fakeBackend.js'
import { createUsersApi } from './users.js'
import { createSessionApi } from './session.js'

export const createFakeAuthApi = () => {
  const storage = createStorage(fakeBackend())
  const usersApi = createUsersApi(storage)
  return { storage, api: { ...usersApi, ...createSessionApi(storage, usersApi) } }
}
