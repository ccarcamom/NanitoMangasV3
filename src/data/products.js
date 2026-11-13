import { storage as defaultStorage } from './storage.js'
import { createCollection } from './collection.js'
import { seedProducts, SEED_VERSION } from './seed.js'

// Factory so specs can inject a fake storage.
export const createProductsApi = (storage) => {
  const col = createCollection(storage, `products-v${SEED_VERSION}`, seedProducts)
  return {
    listProducts: () => col.all(),
    getProduct: (id) => col.get(id),
    createProduct: (input) => col.create(input),
    updateProduct: (id, patch) => col.update(id, patch),
    deleteProduct: (id) => col.remove(id),
    subscribeProducts: (cb) => col.subscribe(cb),
  }
}

export const {
  listProducts, getProduct, createProduct, updateProduct, deleteProduct, subscribeProducts,
} = createProductsApi(defaultStorage)
