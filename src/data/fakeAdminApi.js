// Test helper: products + users + orders API over one fake storage (specs never touch the real store).
import { createStorage } from './storage.js'
import { fakeBackend } from './fakeBackend.js'
import { createProductsApi } from './products.js'
import { createUsersApi } from './users.js'
import { createCartApi } from './cart.js'
import { createOrdersApi } from './orders.js'

// `seed` = { key: value } written to the storage before the collections load (e.g. orders).
export const createFakeAdminApi = (seed = {}) => {
  const storage = createStorage(fakeBackend())
  Object.entries(seed).forEach(([key, value]) => storage.write(key, value))
  const productsApi = createProductsApi(storage)
  const usersApi = createUsersApi(storage)
  const cartApi = createCartApi(storage, productsApi)
  const ordersApi = createOrdersApi({ storage, productsApi, cartApi })
  return { storage, productsApi, usersApi, cartApi, ordersApi, api: { ...productsApi, ...usersApi, ...ordersApi } }
}
