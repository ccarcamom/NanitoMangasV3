# NanitoMangas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Sin commits: el usuario los hace a mano.

**Goal:** Construir la tienda NanitoMangas (React + Vite + Bootstrap, datos en `localStorage`, pruebas Jasmine + Karma) con compra, cuentas y panel de administración completos, funcionando en local.

**Architecture:** SPA con React Router. Una capa de datos en JS (`src/data/`) simula la base de datos con CRUD sobre `localStorage` y es lo único que lo toca. Los componentes la leen por contexto/hooks (`useSyncExternalStore`). La lógica pura (precios, envío, validaciones, filtros) vive en `src/lib/` sin React, para probarla fácil. Bootstrap pone grilla y responsivo; una hoja propia sobrescribe sus variables `--bs-*` para reproducir la maqueta aprobada.

**Tech Stack:** React 19.3.1, Vite 8.3.5, @vitejs/plugin-react 6.1.2, react-router 8.5.0, bootstrap 5.3.8, react-bootstrap 2.10.10, gsap 3.15.0 + @gsap/react 2.1.2, @phosphor-icons/react 2.1.10, @fontsource/montserrat + @fontsource/lato. Pruebas: karma 6.4.4, karma-jasmine 5.1.0, jasmine-core 7.0.2, karma-chrome-launcher 3.2.0, karma-coverage 2.2.1, karma-webpack 5.0.1, webpack 5, babel-loader, @babel/core + preset-env + preset-react, babel-plugin-istanbul, @testing-library/react 16.3.3 (+ @testing-library/dom).

**Spec:** `docs/superpowers/specs/2026-10-21-nanitomangas-design.md`

## Global Constraints

- Idioma español (Chile). Moneda CLP con formato `$11.990`.
- Versiones: las de arriba (verificadas en npm el 2026-10-21). Si algún paquete tiene conflicto de versiones, usar la más reciente compatible y anotarlo en el README. React debe quedar en 19.3.1 o superior. Sin Next.js ni Server Components.
- Todo local: sin GitHub, AWS ni Vercel. **No hacer `git init` ni commits**: el usuario los hace a mano.
- Datos solo en `localStorage` (claves con prefijo `nanitomangas:`). Solo `src/data/storage.js` puede nombrar `localStorage`.
- Bootstrap 5.3 para grilla y responsivo. **El aspecto de la maqueta no cambia**: colores, fuentes, píldoras, tarjetas y animaciones salen de la hoja propia (`src/styles/`), nada con el estilo por defecto de Bootstrap.
- Tokens: naranja `#F2711C`, texto casi negro `#18181B`, fondo blanco roto `#FAFAF9`, precio `#C2410C`, secundario `#6B6B70`. Sin negro ni blanco puros. Un solo acento. Texto negro sobre botones naranjos.
- Tipografía: Montserrat (títulos, menú en mayúsculas, botones, precios) + Lato (texto), autoalojadas con `@fontsource`.
- Íconos: solo `@phosphor-icons/react`. Sin emojis, sin SVG dibujados a mano.
- Modo claro por defecto, botón para oscuro vía `data-bs-theme` en `<html>`, recordado en `localStorage`.
- Bordes: tarjetas 12-16px, botones y buscador en píldora (radio completo), en todo el sitio.
- GSAP (`useGSAP`) para animación, con `gsap.matchMedia()` y `prefers-reduced-motion: reduce` desactivando todo.
- Un componente = una responsabilidad. Props para datos y funciones, estado solo si hace falta. Los componentes no importan CSS: los estilos se importan solo en `src/main.jsx` (así Karma no necesita loaders de CSS).
- Pruebas: `*.spec.js(x)` junto al código, Jasmine (`describe/it/expect/spyOn`), nunca Jest. `npm test` corre Chrome headless y deja cobertura en `coverage/`.
- Sin em-dashes ni en-dashes en texto visible. Un solo texto por intención de botón ("Añadir al carro", "Pagar", "Ver detalles").
- No ejecutar comandos de git. Al terminar cada tarea, dejar los archivos listos y decir cuáles cambió, para que el usuario haga el commit.

## Review Focus

Entradas que el spec no menciona y que probablemente rompan algo; cada una tiene su prueba en la tarea indicada.

1. `localStorage` vacío, bloqueado o con JSON corrupto: la app no se cae y vuelve a sembrar los datos (Tarea 3).
2. Producto del carro borrado por el administrador, o con menos stock que lo pedido al pagar: el pago se bloquea con mensaje, sin crear pedido ni dejar stock negativo (Tareas 6 y 13).
3. Cantidades inválidas (0, negativa, decimal, texto, mayor al stock): se corrigen o rechazan (Tareas 5 y 8).
4. Doble clic en "Pagar" o recargar la pantalla de éxito: un solo pedido y un solo descuento de stock (Tarea 13).
5. Entrar por URL a `/admin` sin sesión o como cliente, o sesión de un usuario que ya no existe: redirige, nunca pantalla en blanco (Tarea 12).

Además: correo con mayúsculas o espacios no debe duplicar cuentas (Tarea 4), el RUT acepta puntos, guion y K (Tarea 2), y la búsqueda ignora tildes y mayúsculas (Tarea 8).

---

## Mapa de archivos

```
nanitomangas/
  karma.conf.cjs, test/index.js, package.json, vite.config.js, index.html, README.md
  public/img/placeholder.svg
  src/
    main.jsx, App.jsx, routes.jsx
    styles/ theme.css (tokens + overrides --bs-*), layout.css, components.css, pages.css
    lib/ money.js validators.js shipping.js cartMath.js catalog.js payment.js crypto.js
    data/ storage.js collection.js seed.js products.js users.js session.js cart.js orders.js index.js
    context/ ThemeContext.jsx CartContext.jsx AuthContext.jsx
    hooks/ useProducts.js useReveal.js useBounce.js
    components/ layout/ (Header, SearchBar, CartButton, ThemeToggle, Footer, InfoStrip)
                shop/ (ProductCard, ProductGrid, ProductCarousel, QuantityInput, HeroBanner, BrandStrip, FilterBar)
                forms/ (FormField, CardForm, AddressFields) common/ (ConfirmDialog, EmptyState, ProtectedRoute)
    pages/ Home Category Offers Search ProductDetail Cart Checkout OrderSuccess PaymentFailed
           Login Register Profile Contact NotFound
    pages/admin/ AdminLayout AdminProducts ProductForm AdminUsers AdminOrders
```

Cada archivo `X.jsx` o `x.js` lleva su `X.spec.jsx` o `x.spec.js` al lado.

## Modelos (usados por todas las tareas)

- **Product:** `{ id, name, brand, categoryId: 'mangas'|'funko'|'accesorios', genre: 'shonen'|'seinen'|'shojo'|'josei'|'kodomo'|null, price: number, salePrice: number|null, stock: number, image: string, description: string, isNew: boolean, isBestSeller: boolean, isRestock: boolean }`
- **User:** `{ id, name, email (minúsculas), passwordHash, role: 'admin'|'customer', rut: string, address: {street, comuna, region}|null, createdAt: string }`
- **CartItem:** `{ productId, qty }`
- **Order:** `{ id: 'NM-000001', userId: string|null, email, buyer: {name, rut}, delivery: {method: 'despacho'|'retiro', address: {street, comuna, region}|null}, items: [{productId, name, unitPrice, qty}], subtotal, shipping, total, createdAt, status: 'pagado' }`
- **Category:** `{ id, name, genres: [{id, name}] }`. **Banner:** `{ id, title, text, image, ctaLabel, to }`.

---

### Task 1: Proyecto, Bootstrap y entorno Karma + Jasmine con cobertura

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `karma.conf.cjs`, `test/index.js`, `src/main.jsx`, `src/App.jsx`, `src/lib/money.js`, `src/lib/money.spec.js`, `.gitignore`
- Mantener: `docs/` (el scaffold se crea en una carpeta temporal y se mueve a la raíz).

**Interfaces:**
- Produces: `formatCLP(amount: number): string` en `src/lib/money.js`. Scripts `dev`, `build`, `test`, `test:watch`. Carpeta `coverage/` con `index.html` y `lcov.info`.

- [ ] **Step 1:** Crear el proyecto Vite + React en una carpeta temporal, moverlo a la raíz sin tocar `docs/`, instalar las dependencias de la sección Tech Stack `package.json` con `"type": "module"`.
- [ ] **Step 2:** Configurar Karma en `karma.conf.cjs`: frameworks `jasmine` y `webpack`; `files: ['test/index.js']` preprocesado con webpack y sourcemap; webpack `mode: 'development'` con `babel-loader` para `.js/.jsx` (preset-env, preset-react con runtime automático, `babel-plugin-istanbul` solo sobre `src/` excluyendo `*.spec.*`); `test/index.js` carga todo con `require.context('../src', true, /\.spec\.jsx?$/)`; navegador `ChromeHeadless` con `CHROME_BIN` por defecto `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`; reporteros `progress` y `coverage` (html, lcov y text-summary en `coverage/`). Scripts: `"test": "karma start karma.conf.cjs --single-run"`, `"test:watch": "karma start karma.conf.cjs"`.
- [ ] **Step 3: Escribir la prueba que falla** en `src/lib/money.spec.js`: `formatCLP(11990)` devuelve `'$11.990'`; `formatCLP(0)` devuelve `'$0'`; `formatCLP(1234567)` devuelve `'$1.234.567'`.
- [ ] **Step 4:** Ejecutar `npm test`. Esperado: FALLA porque `formatCLP` no existe (el entorno sí arranca).
- [ ] **Step 5:** Implementar `formatCLP` en `src/lib/money.js` con `Intl.NumberFormat('es-CL', {style:'currency', currency:'CLP'})`.
- [ ] **Step 6:** `npm test` en verde y `coverage/index.html` muestra `money.js` con su nombre de archivo (no un bundle). Si la cobertura muestra solo el bundle o `webpack://`, corregir la config antes de seguir: es la base de todas las demás tareas. `npm run build` sin errores.
- [ ] **Step 7:** Importar Bootstrap CSS y `@fontsource` (Montserrat 600/700/800, Lato 400/700) en `src/main.jsx`; `App.jsx` muestra un título de prueba. Verificar con `npm run dev` que carga.

---

### Task 2: Validaciones

**Files:** Create `src/lib/validators.js`, `src/lib/validators.spec.js`

**Interfaces:**
- Produces (todas puras, sin React):
  - `isValidEmail(value: string): boolean`
  - `isValidPassword(value: string): boolean` (mínimo 8 caracteres, al menos una letra y un número)
  - `normalizeRut(value: string): string | null` (devuelve `'12345678-5'` sin puntos, `null` si no tiene forma de RUT)
  - `isValidRut(value: string): boolean` (dígito verificador módulo 11, acepta `K`/`k`, puntos y guion)
  - `luhnCheck(cardNumber: string): boolean` (ignora espacios)
  - `isValidExpiry(value: string, now?: Date): boolean` (`MM/AA`, mes 01-12, no vencida)
  - `isValidCvv(value: string): boolean` (3 o 4 dígitos)

- [ ] **Step 1: Pruebas que fallan:** `isValidEmail('a@b.cl')` true; `'a@b'`, `''`, `'a b@c.cl'` false. `isValidPassword('Abcdef12')` true; `'abcdefgh'` y `'Ab1'` false. `isValidRut('12.345.678-5')`, `'12345678-5'`, `'11.111.111-1'` true; `'12345678-9'` false; `'7.775.756-K'` y `'7775756-k'` true; `normalizeRut('12.345.678-5')` es `'12345678-5'` y `normalizeRut('abc')` es `null`. `luhnCheck('4242 4242 4242 4242')` true; `'4242424242424241'` false. `isValidExpiry('12/99', new Date(2026,9,21))` true; `'01/20'` y `'13/30'` false. `isValidCvv('123')` true, `'12'` false.
- [ ] **Step 2:** `npm test` falla. **Step 3:** Implementar las funciones. **Step 4:** `npm test` en verde.

---

### Task 3: Núcleo de datos, semilla y productos (CRUD)

**Files:** Create `src/data/storage.js`, `collection.js`, `seed.js`, `products.js` y sus `.spec.js`.

**Interfaces:**
- Produces:
  - `createStorage(backend?: Storage): { read(key, fallback), write(key, value), remove(key) }` con prefijo `nanitomangas:`; JSON corrupto, `backend` que lanza error o cuota llena devuelven `fallback` sin lanzar. Instancia por defecto `storage` usando `window.localStorage`.
  - `createCollection(storage, key, seedItems: unknown[]): { all(): T[], get(id), create(item): T, update(id, patch): T, remove(id): boolean, subscribe(cb): () => void, snapshot(): T[] }`. `create` asigna `id` con `crypto.randomUUID()` si falta. Cada cambio guarda y avisa a los suscriptores. `snapshot()` devuelve la misma referencia mientras no haya cambios (requisito de `useSyncExternalStore`). Si la clave no existe o está corrupta, se siembra con `seedItems`.
  - `seed.js` exporta `categories`, `banners`, `brands` (6 placeholders "Editorial 1..6"), `seedProducts` (sección 9 del spec: 4 a 6 por categoría, genéricos, uno agotado como mínimo, banderas `isNew/isBestSeller/isRestock` repartidas, 3 con `salePrice`, imagen `/img/placeholder.svg`), `ADMIN_EMAIL = 'admin@nanitomangas.cl'`, `ADMIN_PASSWORD = 'Admin1234'`, `ADMIN_SEED_HASH` (SHA-256 hex de `Admin1234`, se completa en la Tarea 4) y `seedUsers`. Los banners usan fotos de Unsplash ya verificadas como ejemplo (ver abajo).
  - `products.js`: `listProducts(): Product[]`, `getProduct(id): Product|undefined`, `createProduct(input: Omit<Product,'id'>): Product`, `updateProduct(id, patch): Product`, `deleteProduct(id): boolean`, `subscribeProducts(cb): () => void`, `getProductsSnapshot(): Product[]`.
- Banners de ejemplo: `https://images.unsplash.com/photo-1621478374422-35206faeddfb?auto=format&fit=crop&w=1000&h=660&q=80` (figuras en estantería) y `...photo-1762446263732-c0951619a834...` (manga). Texto genérico, sin nombres de franquicias.

- [ ] **Step 1: Pruebas que fallan** (con un `Storage` falso hecho con spies/objeto, nunca el real): `read` devuelve el `fallback` cuando el JSON está corrupto (**Review Focus 1**) y cuando `backend.getItem` lanza error; `write` no lanza si `setItem` lanza. `createCollection` siembra al estar vacía; `create` asigna id y persiste; `update` mezcla campos; `remove` devuelve false si no existe; `subscribe` se llama una vez por cambio y deja de llamarse tras cancelar; `snapshot()` conserva referencia sin cambios y la renueva tras uno. Productos: `createProduct` + `listProducts` incluye el nuevo; `updateProduct` cambia `price`; `deleteProduct` lo quita; la semilla contiene al menos un producto con `stock === 0`, tres con `salePrice` menor que `price`, y ninguna categoría queda con menos de 4.
- [ ] **Step 2:** `npm test` falla. **Step 3:** Implementar. **Step 4:** `npm test` en verde.

---

### Task 4: Usuarios, sesión y hash de contraseña

**Files:** Create `src/lib/crypto.js`, `src/data/users.js`, `src/data/session.js` y sus `.spec.js`. Modify `src/data/seed.js` (completar `ADMIN_SEED_HASH`).

**Interfaces:**
- Produces:
  - `sha256Hex(text: string): Promise<string>` (Web Crypto, hex en minúsculas)
  - `registerUser({name, email, password}): Promise<User>`; rechaza con `Error('EMAIL_TAKEN')` si el correo ya existe (comparación sin mayúsculas ni espacios); guarda `email` normalizado, `role: 'customer'`, `passwordHash`.
  - `loginUser(email, password): Promise<User>`; rechaza con `Error('INVALID_CREDENTIALS')`.
  - `updateProfile(id, {name?, rut?, address?}): User`, `listUsers(): User[]`, `getUser(id): User|undefined`, `subscribeUsers(cb)`.
  - `getSessionUserId(): string|null`, `setSession(id)`, `clearSession()`.

- [ ] **Step 1: Pruebas que fallan:** `sha256Hex('abc')` es `'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'`; `sha256Hex('Admin1234')` es igual a `ADMIN_SEED_HASH`; `registerUser` no guarda la contraseña en texto plano; registrar `'  ANA@x.cl '` y luego `'ana@x.cl'` rechaza con `EMAIL_TAKEN`; `loginUser` con contraseña errada rechaza con `INVALID_CREDENTIALS`; el admin sembrado puede iniciar sesión y tiene `role: 'admin'`; `getSessionUserId()` devuelve `null` si el usuario guardado en sesión ya no existe (**Review Focus 5**).
- [ ] **Step 2:** `npm test` falla. **Step 3:** Calcular el hash de `Admin1234`, completar `ADMIN_SEED_HASH` e implementar. **Step 4:** `npm test` en verde.

---

### Task 5: Carro de compras, envío y totales

**Files:** Create `src/lib/shipping.js`, `src/lib/cartMath.js`, `src/data/cart.js` y sus `.spec.js`.

**Interfaces:**
- Produces:
  - `SHIPPING = { flat: 3990, freeFrom: 40000 }`; `calcShipping(subtotal: number, method: 'despacho'|'retiro'): number` (retiro 0; subtotal 0 es 0; despacho gratis si `subtotal >= freeFrom`).
  - `unitPrice(product: Product): number` (`salePrice ?? price`); `cartTotals(lines: {product: Product, qty: number}[], method): {subtotal, shipping, total}`.
  - `cart.js`: `getCart(): CartItem[]`, `addToCart(productId, qty = 1): CartItem[]`, `setQty(productId, qty): CartItem[]`, `removeFromCart(productId): CartItem[]`, `clearCart(): void`, `subscribeCart(cb)`, `getCartSnapshot()`. La cantidad se corrige a un entero entre 1 y el stock; `setQty` con 0 o menos quita la línea.

- [ ] **Step 1: Pruebas que fallan:** `calcShipping(10000,'despacho')` 3990; `(40000,'despacho')` 0; `(10000,'retiro')` 0; `(0,'despacho')` 0. `unitPrice` usa la oferta si existe. `cartTotals` suma bien con una línea en oferta y otra normal. Carro (**Review Focus 3**): `addToCart` dos veces suma; pedir más que el stock se corrige al stock; `qty` `0`, `-2`, `2.7` y `NaN` no dejan cantidades inválidas (se ignora o se corrige a entero válido); un producto agotado no se puede añadir; `setQty(id, 0)` quita la línea; el carro sobrevive a recrear el módulo (se lee de `localStorage`).
- [ ] **Step 2:** `npm test` falla. **Step 3:** Implementar. **Step 4:** `npm test` en verde.

---

### Task 6: Pedidos y pago simulado

**Files:** Create `src/lib/payment.js`, `src/data/orders.js`, `src/data/index.js` y sus `.spec.js`.

**Interfaces:**
- Consumes: `getProduct`, `updateProduct`, `getCart`, `clearCart`, `calcShipping`, `unitPrice`.
- Produces:
  - `simulatePayment(card: {number, expiry, cvv}, delayMs = 600): Promise<{ok: true} | {ok: false, reason: 'CARD_INVALID'|'CARD_DECLINED'}>`. Tarjeta que no cumple Luhn, vencimiento o CVV: `CARD_INVALID`. El número de prueba `4000 0000 0000 0002` siempre responde `CARD_DECLINED`. Cualquier otra válida: `ok`.
  - `placeOrder({userId, email, buyer, delivery}): Order`: lee el carro, verifica que cada producto exista y tenga stock suficiente, descuenta el stock, guarda el pedido con copia de nombre y precio unitario, vacía el carro y devuelve el pedido. Si algo falla lanza `Error('OUT_OF_STOCK:<productId>')` o `Error('EMPTY_CART')` **sin cambiar nada** (todo o nada). `id` correlativo `NM-000001`.
  - `listOrders()`, `listOrdersByUser(userId)`, `getOrder(id)`.
  - `src/data/index.js` reexporta todo el módulo de datos.

- [ ] **Step 1: Pruebas que fallan:** pago: tarjeta válida `ok`; `4000000000000002` `CARD_DECLINED`; Luhn inválido `CARD_INVALID`. Pedidos (**Review Focus 2**): `placeOrder` descuenta stock, vacía el carro, calcula `subtotal/shipping/total` correctos y guarda `userId: null` para invitado; si un producto del carro fue borrado, lanza `OUT_OF_STOCK:<id>` y el stock de los demás queda intacto y el carro sin vaciar; con stock menor al pedido lanza lo mismo y no queda stock negativo; carro vacío lanza `EMPTY_CART`; borrar luego un producto no altera `items[].name` del pedido ya hecho; `listOrdersByUser` no devuelve pedidos de invitados ni de otros.
- [ ] **Step 2:** `npm test` falla. **Step 3:** Implementar. **Step 4:** `npm test` en verde.

---

### Task 7: Tema, estilos base y estructura de la tienda

**Files:** Create `src/styles/theme.css`, `layout.css`, `components.css`, `src/context/ThemeContext.jsx`, `src/context/CartContext.jsx`, `src/hooks/useProducts.js`, `src/components/layout/*` (Header, SearchBar, CartButton, ThemeToggle, Footer, InfoStrip), `src/routes.jsx`, `public/img/placeholder.svg`, `src/pages/NotFound.jsx`, specs. Modify `src/main.jsx`, `src/App.jsx`.

**Interfaces:**
- Produces: `ThemeProvider` y `useTheme(): {theme: 'light'|'dark', toggle(): void}` (aplica `data-bs-theme` en `document.documentElement`, persiste en `storage`). `CartProvider` y `useCart(): {lines: {product, qty}[], count: number, add(productId, qty?), setQty(productId, qty), remove(productId), clear(), totals(method)}` (re-calcula al cambiar el carro o los productos). `useProducts(): Product[]` con `useSyncExternalStore`. Rutas: `/`, `/categoria/:categoryId`, `/ofertas`, `/novedades`, `/buscar`, `/producto/:id`, `/carro`, `/checkout`, `/compra-exitosa/:orderId`, `/pago-fallido`, `/ingresar`, `/registro`, `/cuenta`, `/contacto`, `/admin/*`, `*` (404). `Header`: fila 1 con logo de texto "NanitoMangas", `SearchBar` (píldora, envía a `/buscar?q=`), enlace a `/cuenta`, `ThemeToggle`, `CartButton` (bolsa Phosphor con contador naranja); fila 2 con menú Inicio, Mangas (desplegable por género con react-bootstrap), Funko Pop (enlace directo), Accesorios, Ofertas, Novedades, Contacto, ítem activo subrayado en naranja; en celular, menú plegable (Offcanvas) y buscador bajo el logo. `Footer` con 4 columnas e `InfoStrip` con 3 datos (pagos, retiro en tienda, redes) con íconos Phosphor.

- [ ] **Step 1: Pruebas que fallan:** `ThemeToggle` cambia `data-bs-theme` a `dark` al hacer clic y guarda la elección (storage falso con spies); `SearchBar` llama a `onSearch('naruto')` al enviar y no envía vacío; `CartButton` muestra el contador recibido y no lo muestra en 0; `Header` renderiza los 7 enlaces del menú; `useCart().add` aumenta `count`.
- [ ] **Step 2:** `npm test` falla. **Step 3:** Implementar: `theme.css` con los tokens y las sobrescrituras `--bs-*` (colores, radios, fuentes, `.btn-primary` naranja con texto casi negro, formularios y tarjetas redondeados) para claro y oscuro; `placeholder.svg` neutro gris; el resto de los archivos. `main.jsx` importa Bootstrap, fuentes y la hoja propia en ese orden. **Step 4:** `npm test` en verde; `npm run dev` y revisar en el navegador contra la maqueta aprobada, en claro y oscuro.

---

### Task 8: Catálogo (filtros y búsqueda) y componentes de producto

**Files:** Create `src/lib/catalog.js`, `src/components/shop/{ProductCard,ProductGrid,ProductCarousel,QuantityInput,FilterBar}.jsx`, `src/components/common/EmptyState.jsx` y specs.

**Interfaces:**
- Produces:
  - `normalizeText(s: string): string` (minúsculas, sin tildes, sin espacios dobles).
  - `searchProducts(products, query): Product[]` (por nombre, marca y categoría; consulta vacía devuelve `[]`; caracteres especiales como `(` o `*` no lanzan error).
  - `filterProducts(products, {categoryId?, genre?, onlyOffers?, onlyNew?}): Product[]`; `sortProducts(products, key: 'price-asc'|'price-desc'|'name'): Product[]` (no muta el arreglo).
  - `ProductCard({product, onAdd})`: foto, marca, nombre, precio con `formatCLP` (si hay oferta, precio nuevo y el normal tachado), botón "Añadir al carro" que llama `onAdd(product.id)`; si `stock === 0` muestra "Agotado" y el botón pasa a "Ver detalles" (enlace a la ficha).
  - `ProductGrid({products, onAdd})` (grilla Bootstrap `row`/`col`, vacío muestra `EmptyState`), `ProductCarousel({title, products, onAdd, seeAllTo?})` (fila con `scroll-snap`, flechas anterior/siguiente), `QuantityInput({value, max, onChange})` (acota entre 1 y `max`), `FilterBar({genres, sort, genre, onChange})`.

- [ ] **Step 1: Pruebas que fallan:** `searchProducts(products, 'pokemon')` encuentra "Pokémon" (sin tildes ni mayúsculas) y `searchProducts(p, '(*')` devuelve `[]` sin lanzar; `filterProducts` con `genre: 'shonen'` y con `onlyOffers`; `sortProducts` ordena por precio sin mutar la entrada. Componentes (renderizado condicional, props, eventos): `ProductGrid` renderiza una tarjeta por producto; `ProductCard` muestra "Agotado" solo con `stock === 0`; muestra el precio normal tachado solo con `salePrice`; al hacer clic en "Añadir al carro" se llama al spy `onAdd` con el id; `QuantityInput` con `max=3` y valor `99` informa `3`, y con `0`, `-1`, `''` informa `1` (**Review Focus 3**).
- [ ] **Step 2:** `npm test` falla. **Step 3:** Implementar y añadir los estilos en `components.css` (tarjeta con levantado e inclinación leve al pasar el mouse, desactivada con `prefers-reduced-motion`). **Step 4:** `npm test` en verde.

---

### Task 9: Portada

**Files:** Create `src/components/shop/{HeroBanner,BrandStrip}.jsx`, `src/pages/Home.jsx`, specs.

**Interfaces:**
- Consumes: `banners`, `brands`, `useProducts`, `useCart`, `ProductCarousel`, `InfoStrip`.
- Produces: `HeroBanner({banners})` (Carousel de react-bootstrap con flechas, un texto, una imagen y un botón por banner); `BrandStrip({brands})`; `Home` con orden: banner, `InfoStrip`, carruseles "Novedades" (`isNew`), "Más vendidos" (`isBestSeller`), "De vuelta en stock" (`isRestock`), luego `BrandStrip`. Un carrusel sin productos no se muestra.

- [ ] **Step 1: Pruebas que fallan:** `HeroBanner` renderiza un slide por banner; `Home` con productos de prueba muestra los tres títulos y omite "De vuelta en stock" si ningún producto tiene `isRestock`.
- [ ] **Step 2:** falla. **Step 3:** Implementar; el título del banner de la maqueta ("Figuras nuevas ya en tienda") sale de la semilla. **Step 4:** verde y revisar en el navegador a 375, 768 y 1280 px de ancho.

---

### Task 10: Categorías, ofertas, novedades, búsqueda y contacto

**Files:** Create `src/pages/{Category,Offers,Search,Contact}.jsx`, `src/components/forms/FormField.jsx` y specs.

**Interfaces:**
- Produces: `Category` (lee `:categoryId` y `?genero=`; título, `FilterBar` con orden y género, `ProductGrid`; categoría inexistente muestra `EmptyState`), `Offers` (productos con `salePrice`), la ruta `/novedades` usa el componente `Category` con la propiedad `onlyNew` (todas las categorías, solo productos `isNew`), `Search` (`?q=`; sin resultados muestra `EmptyState` con sugerencia). `FormField({id, label, error, ...inputProps})` (etiqueta arriba, error debajo, `aria-invalid`, `aria-describedby`). `Contact` con nombre, correo, mensaje, valida y muestra confirmación (no envía a ningún lado).

- [ ] **Step 1: Pruebas que fallan:** `FormField` muestra el mensaje de error solo cuando se recibe `error`; `Offers` solo lista productos con oferta; `Category` con género filtra; `Search` con `q=zzzz` muestra el estado vacío; `Contact` con correo inválido muestra error y no confirma.
- [ ] **Step 2:** falla. **Step 3:** Implementar. **Step 4:** verde.

---

### Task 11: Ficha de producto y carro

**Files:** Create `src/pages/{ProductDetail,Cart}.jsx` y specs.

**Interfaces:**
- Produces: `ProductDetail` (producto desde `:id`, foto, marca, nombre, precio/oferta, stock, descripción, `QuantityInput`, "Añadir al carro", relacionados de la misma categoría; id inexistente muestra `EmptyState`; agotado deshabilita la compra). `Cart` (líneas con `QuantityInput`, quitar, subtotal, envío según método, total, botón "Ir a pagar" hacia `/checkout`; carro vacío muestra `EmptyState` con enlace a la tienda).

- [ ] **Step 1: Pruebas que fallan:** `ProductDetail` con producto agotado no muestra "Añadir al carro"; con id inexistente muestra el estado vacío; `Cart` cambia la cantidad y el total se recalcula; quitar una línea la elimina; carro vacío muestra el estado vacío y no el botón de pago.
- [ ] **Step 2:** falla. **Step 3:** Implementar. **Step 4:** verde.

---

### Task 12: Cuentas: registro, ingreso, perfil y rutas protegidas

**Files:** Create `src/context/AuthContext.jsx`, `src/components/common/ProtectedRoute.jsx`, `src/pages/{Login,Register,Profile}.jsx` y specs. Modify `Header` (nombre del usuario o "Ingresar", "Salir").

**Interfaces:**
- Produces: `AuthProvider` y `useAuth(): {user: User|null, ready: boolean, register(data): Promise<User>, login(email, password): Promise<User>, logout(): void, updateProfile(patch): User}` (al montar lee la sesión; si el usuario ya no existe queda `user: null`). `ProtectedRoute({role?: 'admin', children})`: sin sesión redirige a `/ingresar`; con sesión pero sin el rol redirige a `/`; mientras `ready` es false no renderiza nada (**Review Focus 5**). `Login`, `Register` (nombre, correo, contraseña con `FormField` y validadores; muestra "Este correo ya está registrado" ante `EMAIL_TAKEN`), `Profile` (editar nombre, RUT, dirección; lista "Mis pedidos" con `listOrdersByUser`, vacío con `EmptyState`).

- [ ] **Step 1: Pruebas que fallan:** `ProtectedRoute` sin sesión no renderiza el contenido y redirige a `/ingresar`; cliente en ruta `role="admin"` redirige a `/`; admin ve el contenido; con sesión guardada de un usuario inexistente se comporta como sin sesión; `Register` con contraseña débil muestra error y no llama al servicio (spy); `Login` con credenciales malas muestra "Correo o contraseña incorrectos".
- [ ] **Step 2:** falla. **Step 3:** Implementar. **Step 4:** verde.

---

### Task 13: Checkout, compra exitosa y pago fallido

**Files:** Create `src/components/forms/{CardForm,AddressFields}.jsx`, `src/pages/{Checkout,OrderSuccess,PaymentFailed}.jsx`, `src/lib/regions.js` (regiones y comunas de Chile, lista mínima editable) y specs.

**Interfaces:**
- Consumes: `useCart`, `useAuth`, `simulatePayment`, `placeOrder`, validadores.
- Produces: `Checkout`: datos del comprador (nombre, correo, RUT), entrega (`despacho` con `AddressFields` o `retiro`), resumen con `totals(method)`, `CardForm` (número, vencimiento, CVV). Con sesión iniciada, los campos se rellenan con el perfil. Al pagar: valida todo, deshabilita el botón, llama `simulatePayment`; si `ok`, `placeOrder` y va a `/compra-exitosa/:orderId`; si no, va a `/pago-fallido` sin vaciar el carro. Si `placeOrder` lanza `OUT_OF_STOCK`, muestra qué producto falló y no crea pedido. `OrderSuccess` muestra el resumen guardado del pedido (id inválido muestra `EmptyState`). `PaymentFailed` muestra el motivo y "Reintentar pago".

- [ ] **Step 1: Pruebas que fallan:** `CardForm` con número inválido muestra error bajo el campo; con sesión, `Checkout` arranca con nombre y RUT del perfil; sin sesión, correo y RUT vacíos y el pago con RUT inválido no llama a `simulatePayment` (spy); **doble clic en "Pagar" llama a `placeOrder` una sola vez** (**Review Focus 4**); si `placeOrder` lanza `OUT_OF_STOCK:<id>` se muestra el aviso y no se navega a éxito (**Review Focus 2**); `CARD_DECLINED` navega a `/pago-fallido` y el carro sigue con sus productos; `OrderSuccess` recargado con el mismo id muestra el mismo pedido y no crea otro.
- [ ] **Step 2:** falla. **Step 3:** Implementar. **Step 4:** verde. **Step 5:** Recorrer a mano el flujo completo en el navegador como invitado y como cliente.

---

### Task 14: Panel de administración

**Files:** Create `src/pages/admin/{AdminLayout,AdminProducts,ProductForm,AdminUsers,AdminOrders}.jsx`, `src/components/common/ConfirmDialog.jsx` y specs.

**Interfaces:**
- Produces: `AdminLayout` (menú lateral Productos, Usuarios, Pedidos; solo rol admin vía `ProtectedRoute`). `AdminProducts` (tabla responsiva con buscar, editar, eliminar con `ConfirmDialog({show, message, onConfirm, onCancel})`). `ProductForm` (crear y editar; nombre, marca, categoría, género si es manga, precio, precio de oferta opcional, stock, imagen por URL, descripción, marcas `isNew/isBestSeller/isRestock`; valida precio entero >= 0, oferta menor que el precio, stock entero >= 0, URL no vacía). `AdminUsers` y `AdminOrders` de solo lectura (tablas; correos y totales con `formatCLP`).

- [ ] **Step 1: Pruebas que fallan:** `ProductForm` con oferta mayor o igual que el precio muestra error y no guarda (spy); con datos válidos llama a `createProduct` con precio numérico; `ConfirmDialog` llama a `onConfirm` solo al confirmar y a `onCancel` al cancelar; `AdminProducts` no elimina sin confirmar; `AdminUsers` no muestra `passwordHash`.
- [ ] **Step 2:** falla. **Step 3:** Implementar. **Step 4:** verde. **Step 5:** Entrar como admin en el navegador, crear, editar y eliminar un producto y ver que aparece en la portada y en la categoría.

---

### Task 15: Animaciones con GSAP

**Files:** Create `src/hooks/useReveal.js`, `src/hooks/useBounce.js` y specs. Modify `Home`, `ProductCarousel`, `CartButton`.

**Interfaces:**
- Produces: `useReveal(ref: RefObject<HTMLElement>): void` (entrada suave con ScrollTrigger: opacidad y desplazamiento de 24px, una sola vez); `useBounce(ref, trigger: unknown): void` (rebote del elemento cada vez que cambia `trigger`, usado en la bolsa del carro al cambiar el contador). Ambos con `useGSAP`, `gsap.matchMedia()` y sin efecto bajo `prefers-reduced-motion: reduce`. Antes de implementar, invocar las skills `gsap-react`, `gsap-core`, `gsap-scrolltrigger` y, al terminar, `gsap-performance`.

- [ ] **Step 1: Pruebas que fallan:** con `window.matchMedia` simulado en `reduce`, `useReveal` no modifica los estilos del elemento (queda visible); sin `reduce`, parte con opacidad 0 y se limpia al desmontar (`ScrollTrigger.getAll().length` vuelve a 0).
- [ ] **Step 2:** falla. **Step 3:** Implementar y conectar. **Step 4:** verde; revisar en el navegador que se mueve y que con "reducir movimiento" del sistema queda quieto.

---

### Task 16: Revisión final, responsivo, cobertura y README

**Files:** Create `README.md`. Modify lo que salga de la revisión.

- [ ] **Step 1:** Recorrer el sitio a 375, 768 y 1280 px de ancho, en claro y oscuro (con el navegador), y corregir desbordes, menú móvil, tablas del admin y contraste. Comparar con la maqueta aprobada.
- [ ] **Step 2:** Invocar la skill `web-design-guidelines` sobre `src/` y corregir lo relevante (contraste AA, foco visible, etiquetas, `alt`).
- [ ] **Step 3:** `npm test`: todas verdes, al menos 10 pruebas que cubran renderizado, props, estado y eventos (contarlas), y `coverage/index.html` generado. Anotar el resumen de cobertura (líneas, ramas) en el README para que el usuario lo use en su documento.
- [ ] **Step 4:** `npm run build` sin errores ni advertencias relevantes.
- [ ] **Step 5:** `README.md` con instalación, `npm run dev`, `npm test`, `npm run build`, credenciales del administrador (`admin@nanitomangas.cl` / `Admin1234`), tarjeta de prueba que falla (`4000 0000 0000 0002`), cómo cargar productos reales (panel de administración o `src/data/seed.js`) y la nota de que la seguridad de contraseñas es una simulación. Revisar que no haya em-dashes en texto visible.
