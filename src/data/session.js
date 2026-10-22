import { storage as defaultStorage } from './storage.js'
import { getUser } from './users.js'

// usersApi shares the storage so a deleted user ends the session (a second collection would cache stale data).
export const createSessionApi = (storage, usersApi) => ({
  getSessionUserId() {
    const id = storage.read('session', null)
    return typeof id === 'string' && usersApi.getUser(id) ? id : null
  },
  setSession: (id) => storage.write('session', id),
  clearSession: () => storage.remove('session'),
})

export const { getSessionUserId, setSession, clearSession } = createSessionApi(defaultStorage, { getUser })
