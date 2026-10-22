const IMG = '/img/placeholder.svg'

export const ADMIN_EMAIL = 'admin@nanitomangas.cl'
export const ADMIN_PASSWORD = 'Admin1234'
// sha256 hex de 'Admin1234' (se verifica en la prueba de crypto.js)
export const ADMIN_SEED_HASH = '60fe74406e7f353ed979f350f2fbb6a2e8690a5fa7d1b0c32983d1d8b3f95f67'

export const categories = [
  {
    id: 'mangas',
    name: 'Mangas',
    genres: [
      { id: 'shonen', name: 'Shonen' },
      { id: 'seinen', name: 'Seinen' },
      { id: 'shojo', name: 'Shojo' },
      { id: 'josei', name: 'Josei' },
      { id: 'kodomo', name: 'Kodomo' },
    ],
  },
  { id: 'funko', name: 'Funko Pop', genres: [] },
  { id: 'accesorios', name: 'Accesorios', genres: [] },
]

export const banners = [
  {
    id: 'banner-1',
    title: 'Figuras nuevas ya en tienda',
    text: 'Descubre las últimas llegadas para tu colección.',
    image: 'https://images.unsplash.com/photo-1621478374422-35206faeddfb?auto=format&fit=crop&w=1000&h=660&q=80',
    ctaLabel: 'Ver novedades',
    to: '/categoria/accesorios',
  },
  {
    id: 'banner-2',
    title: 'Mangas para todos los gustos',
    text: 'Shonen, seinen, shojo, josei y kodomo en un solo lugar.',
    image: 'https://images.unsplash.com/photo-1762446263732-c0951619a834?auto=format&fit=crop&w=1000&h=660&q=80',
    ctaLabel: 'Ver mangas',
    to: '/categoria/mangas',
  },
]

export const brands = [1, 2, 3, 4, 5, 6].map((n) => `Editorial ${n}`)

export const seedProducts = [
  { id: 'manga-1', name: 'Manga 1', brand: 'Editorial 1', categoryId: 'mangas', genre: 'shonen', price: 10990, salePrice: null, stock: 12, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: true, isBestSeller: true, isRestock: false },
  { id: 'manga-2', name: 'Manga 2', brand: 'Editorial 2', categoryId: 'mangas', genre: 'seinen', price: 12990, salePrice: 9990, stock: 8, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: false, isBestSeller: true, isRestock: true },
  { id: 'manga-3', name: 'Manga 3', brand: 'Editorial 3', categoryId: 'mangas', genre: 'shojo', price: 10990, salePrice: null, stock: 0, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: true, isBestSeller: false, isRestock: true },
  { id: 'manga-4', name: 'Manga 4', brand: 'Editorial 4', categoryId: 'mangas', genre: 'josei', price: 11990, salePrice: null, stock: 5, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: false, isBestSeller: true, isRestock: false },
  { id: 'manga-5', name: 'Manga 5', brand: 'Editorial 5', categoryId: 'mangas', genre: 'kodomo', price: 9990, salePrice: null, stock: 20, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: true, isBestSeller: false, isRestock: false },
  { id: 'manga-6', name: 'Manga 6', brand: 'Editorial 6', categoryId: 'mangas', genre: 'shonen', price: 12990, salePrice: 10990, stock: 7, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: false, isBestSeller: false, isRestock: true },
  { id: 'funko-1', name: 'Funko Pop 1', brand: 'Editorial 1', categoryId: 'funko', genre: null, price: 19990, salePrice: null, stock: 6, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: true, isBestSeller: true, isRestock: false },
  { id: 'funko-2', name: 'Funko Pop 2', brand: 'Editorial 2', categoryId: 'funko', genre: null, price: 21990, salePrice: 17990, stock: 4, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: false, isBestSeller: true, isRestock: true },
  { id: 'funko-3', name: 'Funko Pop 3', brand: 'Editorial 3', categoryId: 'funko', genre: null, price: 19990, salePrice: null, stock: 9, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: true, isBestSeller: false, isRestock: false },
  { id: 'funko-4', name: 'Funko Pop 4', brand: 'Editorial 4', categoryId: 'funko', genre: null, price: 24990, salePrice: null, stock: 3, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: false, isBestSeller: false, isRestock: true },
  { id: 'acc-1', name: 'Figura 1', brand: 'Editorial 5', categoryId: 'accesorios', genre: null, price: 34990, salePrice: null, stock: 2, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: true, isBestSeller: true, isRestock: false },
  { id: 'acc-2', name: 'Figura 2', brand: 'Editorial 6', categoryId: 'accesorios', genre: null, price: 29990, salePrice: null, stock: 5, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: false, isBestSeller: true, isRestock: false },
  { id: 'acc-3', name: 'Accesorio 1', brand: 'Editorial 1', categoryId: 'accesorios', genre: null, price: 12990, salePrice: null, stock: 15, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: false, isBestSeller: false, isRestock: true },
  { id: 'acc-4', name: 'Accesorio 2', brand: 'Editorial 2', categoryId: 'accesorios', genre: null, price: 14990, salePrice: null, stock: 10, image: IMG, description: 'Producto de ejemplo para la tienda.', isNew: true, isBestSeller: false, isRestock: true },
]

export const seedUsers = [
  {
    id: 'user-admin',
    name: 'Administrador',
    email: ADMIN_EMAIL,
    passwordHash: ADMIN_SEED_HASH,
    role: 'admin',
    rut: '',
    address: null,
    createdAt: '2026-10-21T00:00:00.000Z',
  },
]
