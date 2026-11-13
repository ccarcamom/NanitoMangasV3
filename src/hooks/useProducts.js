import { useSyncExternalStore } from 'react'
import * as data from '../data/index.js'

// `api` lets specs pass a products API built on a fake storage.
export const useProducts = (api = data) => useSyncExternalStore(api.subscribeProducts, api.listProducts)
