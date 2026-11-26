export const categories = [
  {
    id: 'mangas',
    name: 'Mangas',
    genres: [
      { id: 'shonen', name: 'Shonen' },
      { id: 'seinen', name: 'Seinen' },
    ],
  },
  { id: 'funko', name: 'Funko Pop', genres: [] },
  { id: 'figuras', name: 'Figuras', genres: [] },
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
    text: 'Shonen y seinen en un solo lugar.',
    image: 'https://images.unsplash.com/photo-1762446263732-c0951619a834?auto=format&fit=crop&w=1000&h=660&q=80',
    ctaLabel: 'Ver mangas',
    to: '/categoria/mangas',
  },
]

export const seedProducts = [
  { id: 'manga-1', name: 'One Piece - Tomo 1', brand: 'Ivrea', categoryId: 'mangas', genre: 'shonen', price: 10990, salePrice: null, stock: 12, image: '/img/OnePiece_1_IVREAAR.jpg', description: 'Luffy se lanza al mar para convertirse en el Rey de los Piratas.', isNew: true, isBestSeller: true, isRestock: false },
  { id: 'manga-2', name: 'Vagabond - Tomo 1', brand: 'Panini Manga', categoryId: 'mangas', genre: 'seinen', price: 12990, salePrice: 9990, stock: 8, image: '/img/Vagabond_1_IVREAAR.jpg', description: 'La historia de Miyamoto Musashi y su camino de la espada.', isNew: false, isBestSeller: true, isRestock: true },
  { id: 'manga-3', name: 'Chainsaw Man - Tomo 1', brand: 'Norma', categoryId: 'mangas', genre: 'shonen', price: 9990, salePrice: null, stock: 0, image: '/img/ChainsawMan_1_IVREAAR.jpg', description: 'Denji, un joven endeudado, se fusiona con su demonio motosierra.', isNew: true, isBestSeller: false, isRestock: true },
  { id: 'manga-4', name: '20th Century Boys - Tomo 1', brand: 'Planeta Cómic', categoryId: 'mangas', genre: 'seinen', price: 14990, salePrice: null, stock: 5, image: '/img/20thCenturyBoys_1_PlanetaComic.jpg', description: 'Un grupo de amigos de la infancia enfrenta una misteriosa secta.', isNew: false, isBestSeller: true, isRestock: false },
  { id: 'manga-5', name: 'Atelier of Witch Hat - Tomo 1', brand: 'Milky Way', categoryId: 'mangas', genre: 'seinen', price: 9500, salePrice: null, stock: 20, image: '/img/AtelierOfWitchHat_1_MILKYWAY.jpg', description: 'Coco sueña con ser maga y entra en un mundo de magia oculta.', isNew: true, isBestSeller: false, isRestock: false },
  { id: 'manga-6', name: 'Dandadan - Tomo 1', brand: 'Ivrea', categoryId: 'mangas', genre: 'shonen', price: 12990, salePrice: 10990, stock: 7, image: '/img/Dandadan_1_IVREAAR.jpg', description: 'Fantasmas y alienígenas se cruzan en la vida de dos estudiantes.', isNew: false, isBestSeller: false, isRestock: true },
  { id: 'manga-7', name: 'Buenas Noches Punpun - Tomo 1', brand: 'Ivrea', categoryId: 'mangas', genre: 'seinen', price: 10990, salePrice: null, stock: 6, image: '/img/BuenasNochesPunpun_IVREAAR.jpg', description: 'Punpun crece entre la inocencia y la crudeza de la adolescencia.', isNew: true, isBestSeller: false, isRestock: false },
  { id: 'manga-8', name: 'Dorohedoro - Tomo 1', brand: 'Panini Manga', categoryId: 'mangas', genre: 'seinen', price: 12990, salePrice: null, stock: 6, image: '/img/Dorohedoro_1_PANINI.jpg', description: 'Caiman, con cabeza de reptil y sin memoria, busca al mago que lo transformó.', isNew: false, isBestSeller: false, isRestock: false },
  { id: 'manga-9', name: 'Los Diarios de la Boticaria - Tomo 1', brand: 'Panini Manga', categoryId: 'mangas', genre: 'seinen', price: 9990, salePrice: null, stock: 8, image: '/img/LosDiariosDeLaBoticaria_1_PANINI.jpg', description: 'Maomao resuelve misterios con sus conocimientos de boticaria en el palacio.', isNew: false, isBestSeller: false, isRestock: false },
  { id: 'funko-1', name: 'Funko Pop Brook', brand: 'One Piece', categoryId: 'funko', genre: null, price: 19990, salePrice: null, stock: 6, image: '/img/brook_funko.webp', description: 'Funko Pop de Brook, el músico de los Sombrero de Paja.', isNew: true, isBestSeller: true, isRestock: false },
  { id: 'funko-2', name: 'Funko Pop Luffy', brand: 'One Piece', categoryId: 'funko', genre: null, price: 21990, salePrice: 17990, stock: 4, image: '/img/luffy_funko.webp', description: 'Funko Pop de Monkey D. Luffy, capitán de los Sombrero de Paja.', isNew: false, isBestSeller: true, isRestock: true },
  { id: 'funko-3', name: 'Funko Pop Nami', brand: 'One Piece', categoryId: 'funko', genre: null, price: 19990, salePrice: null, stock: 9, image: '/img/nami_funko.webp', description: 'Funko Pop de Nami, la navegante de los Sombrero de Paja.', isNew: true, isBestSeller: false, isRestock: false },
  { id: 'funko-4', name: 'Funko Pop Sanji', brand: 'One Piece', categoryId: 'funko', genre: null, price: 24990, salePrice: null, stock: 3, image: '/img/sanji_funko.webp', description: 'Funko Pop de Sanji, el cocinero de los Sombrero de Paja.', isNew: false, isBestSeller: false, isRestock: true },
  { id: 'acc-1', name: 'Figura Ace 18 cm', brand: 'One Piece', categoryId: 'figuras', genre: null, price: 34990, salePrice: null, stock: 2, image: '/img/ace.webp', description: 'Figura de Portgas D. Ace de 18 cm de alto.', isNew: true, isBestSeller: true, isRestock: false },
  { id: 'acc-2', name: 'Figura Luffy 18 cm', brand: 'One Piece', categoryId: 'figuras', genre: null, price: 29990, salePrice: null, stock: 5, image: '/img/luffy.webp', description: 'Figura de Monkey D. Luffy de 18 cm de alto.', isNew: false, isBestSeller: true, isRestock: false },
  { id: 'acc-3', name: 'Aretes de Zoro', brand: 'One Piece', categoryId: 'accesorios', genre: null, price: 12990, salePrice: null, stock: 15, image: '/img/aretes_zoro.webp', description: 'Aretes inspirados en los pendientes de Roronoa Zoro.', isNew: false, isBestSeller: false, isRestock: true },
  { id: 'acc-4', name: 'Moledor Nika', brand: 'One Piece', categoryId: 'accesorios', genre: null, price: 14990, salePrice: null, stock: 10, image: '/img/fruta_moledor.webp', description: 'Moledor inspirado en la fruta de Luffy en modo Nika.', isNew: true, isBestSeller: false, isRestock: true },
]
