import { categories } from '../data/seed.js'
import { unitPrice } from './cartMath.js'

export const normalizeText = (s) =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

export function searchProducts(products, query) {
  const q = normalizeText(query)
  if (!q) return []
  return products.filter((p) => {
    const cat = categories.find((c) => c.id === p.categoryId)
    return [p.name, p.brand, p.categoryId, cat?.name].some((f) => normalizeText(f).includes(q))
  })
}

export const filterProducts = (products, { categoryId, genre, onlyOffers, onlyNew } = {}) =>
  products.filter((p) =>
    (!categoryId || p.categoryId === categoryId) &&
    (!genre || p.genre === genre) &&
    (!onlyOffers || p.salePrice != null) &&
    (!onlyNew || p.isNew))

export function sortProducts(products, key) {
  const list = [...products]
  if (key === 'price-asc') return list.sort((a, b) => unitPrice(a) - unitPrice(b))
  if (key === 'price-desc') return list.sort((a, b) => unitPrice(b) - unitPrice(a))
  if (key === 'name') return list.sort((a, b) => a.name.localeCompare(b.name, 'es'))
  return list
}
