import { seedProducts, categories, banners, seedUsers, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SEED_HASH } from './seed.js'

describe('seed', () => {
  it('cada categoría tiene al menos 2 productos', () => {
    categories.forEach((c) => expect(seedProducts.filter((p) => p.categoryId === c.id).length).toBeGreaterThanOrEqual(2))
  })
  it('hay un agotado y tres en oferta', () => {
    expect(seedProducts.some((p) => p.stock === 0)).toBe(true)
    expect(seedProducts.filter((p) => p.salePrice != null && p.salePrice < p.price).length).toBeGreaterThanOrEqual(3)
  })
  it('cada carrusel tiene al menos 3', () => {
    ;['isNew', 'isBestSeller', 'isRestock'].forEach((f) => expect(seedProducts.filter((p) => p[f]).length).toBeGreaterThanOrEqual(3))
  })
  it('los mangas cubren los dos géneros y los demás no tienen género', () => {
    const genres = categories.find((c) => c.id === 'mangas').genres.map((g) => g.id)
    expect(genres).toEqual(['shonen', 'seinen'])
    genres.forEach((g) => expect(seedProducts.some((p) => p.genre === g)).toBe(true))
    expect(seedProducts.filter((p) => p.categoryId !== 'mangas').every((p) => p.genre === null)).toBe(true)
  })
  it('productos con forma válida e ids únicos', () => {
    expect(new Set(seedProducts.map((p) => p.id)).size).toBe(seedProducts.length)
    seedProducts.forEach((p) => {
      expect(Number.isInteger(p.price)).toBe(true)
      expect(p.image).toMatch(/^\/img\//)
      expect(typeof p.description).toBe('string')
    })
  })
  it('banners y admin', () => {
    expect(banners.length).toBe(2)
    expect(ADMIN_EMAIL).toBe('admin@nanitomangas.cl')
    expect(ADMIN_PASSWORD).toBe('Admin1234')
    expect(ADMIN_SEED_HASH).toMatch(/^[0-9a-f]{64}$/)
    expect(seedUsers[0]).toEqual(expect.objectContaining({ id: 'user-admin', role: 'admin', email: ADMIN_EMAIL, passwordHash: ADMIN_SEED_HASH }))
  })
})
