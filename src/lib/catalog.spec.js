import { normalizeText, searchProducts, filterProducts, sortProducts } from './catalog.js'

const mk = (o) => ({ id: 'x', name: 'N', brand: 'B', categoryId: 'mangas', genre: null, price: 1000, salePrice: null, stock: 5, isNew: false, ...o })
const products = [
  mk({ id: 'a', name: 'Pokémon Rojo', brand: 'Panini', genre: 'shonen', price: 9000, salePrice: 7000, isNew: true }),
  mk({ id: 'b', name: 'Berserk', brand: 'Norma', genre: 'seinen', price: 12000 }),
  mk({ id: 'c', name: 'Funko Goku', brand: 'Funko', categoryId: 'funko', price: 15000 }),
  mk({ id: 'd', name: 'Abanico', brand: 'Otra', categoryId: 'accesorios', price: 3000 }),
]

describe('catalog', () => {
  it('normalizeText quita tildes, mayúsculas y espacios dobles', () => {
    expect(normalizeText('  PokÉmon   Rojo ')).toBe('pokemon rojo')
  })

  describe('searchProducts', () => {
    it('encuentra "Pokémon" con "pokemon"', () => {
      expect(searchProducts(products, 'pokemon').map((p) => p.id)).toEqual(['a'])
    })
    it('busca por marca y por categoría', () => {
      expect(searchProducts(products, 'NORMA').map((p) => p.id)).toEqual(['b'])
      expect(searchProducts(products, 'accesorios').map((p) => p.id)).toEqual(['d'])
    })
    it('consulta vacía o en blanco devuelve []', () => {
      expect(searchProducts(products, '')).toEqual([])
      expect(searchProducts(products, '   ')).toEqual([])
    })
    it('caracteres especiales no lanzan error', () => {
      expect(searchProducts(products, '(*')).toEqual([])
      expect(() => searchProducts(products, '[')).not.toThrow()
      expect(() => searchProducts(products, '\\')).not.toThrow()
    })
  })

  describe('filterProducts', () => {
    it('filtra por género', () => {
      expect(filterProducts(products, { genre: 'shonen' }).map((p) => p.id)).toEqual(['a'])
    })
    it('filtra por categoría', () => {
      expect(filterProducts(products, { categoryId: 'funko' }).map((p) => p.id)).toEqual(['c'])
    })
    it('filtra ofertas y novedades', () => {
      expect(filterProducts(products, { onlyOffers: true }).map((p) => p.id)).toEqual(['a'])
      expect(filterProducts(products, { onlyNew: true }).map((p) => p.id)).toEqual(['a'])
    })
    it('sin filtros devuelve todo', () => {
      expect(filterProducts(products, {}).length).toBe(4)
    })
  })

  describe('sortProducts', () => {
    it('ordena por precio efectivo sin mutar la entrada', () => {
      const copy = [...products]
      expect(sortProducts(products, 'price-asc').map((p) => p.id)).toEqual(['d', 'a', 'b', 'c'])
      expect(sortProducts(products, 'price-desc').map((p) => p.id)).toEqual(['c', 'b', 'a', 'd'])
      expect(products).toEqual(copy)
    })
    it('ordena por nombre', () => {
      expect(sortProducts(products, 'name').map((p) => p.id)).toEqual(['d', 'b', 'c', 'a'])
    })
    it('clave desconocida devuelve una copia igual', () => {
      const r = sortProducts(products, 'zzz')
      expect(r).toEqual(products)
      expect(r).not.toBe(products)
    })
  })
})
