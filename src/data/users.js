import { storage as defaultStorage } from './storage.js'
import { createCollection } from './collection.js'
import { seedUsers } from './seed.js'
import { sha256Hex } from '../lib/crypto.js'

const normalize = (email) => String(email).trim().toLowerCase()

export const createUsersApi = (storage) => {
  const col = createCollection(storage, 'users', seedUsers)
  const findByEmail = (email) => col.all().find((u) => u.email === normalize(email))
  return {
    listUsers: () => col.all(),
    getUser: (id) => col.get(id),
    subscribeUsers: (cb) => col.subscribe(cb),
    async registerUser({ name, email, password }) {
      // hash first: check and create must run with no await between them (atomic vs concurrent calls)
      const passwordHash = await sha256Hex(password)
      if (findByEmail(email)) throw new Error('EMAIL_TAKEN')
      return col.create({
        name, email: normalize(email), passwordHash,
        role: 'customer', rut: '', address: null, createdAt: new Date().toISOString(),
      })
    },
    async loginUser(email, password) {
      const user = findByEmail(email)
      if (!user || user.passwordHash !== (await sha256Hex(password))) throw new Error('INVALID_CREDENTIALS')
      return user
    },
    updateProfile(id, { name, rut, address }) {
      const patch = Object.fromEntries(Object.entries({ name, rut, address }).filter(([, v]) => v !== undefined))
      return col.update(id, patch)
    },
  }
}

export const {
  listUsers, getUser, subscribeUsers, registerUser, loginUser, updateProfile,
} = createUsersApi(defaultStorage)
