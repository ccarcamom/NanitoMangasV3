# NanitoMangas

Tienda online de mangas, Funko Pop, figuras y accesorios. Proyecto del curso Fullstack 2 (DSY1104).

Es una aplicación React que consume un backend propio en Spring Boot: un API Gateway y tres microservicios (administración, vendedores y clientes) sobre MongoDB, en el repositorio hermano `nanitomangas-backend`. Se puede navegar el catálogo, buscar, filtrar, leer un avance de manga, comprar con pago ficticio, crear una cuenta, ver pedidos, administrar productos como vendedor o administrador, y crear memes sobre páginas de manga. Los roles son invitado, CLIENTE, VENDEDOR y ADMIN, con JWT de acceso y renovación.

Los documentos de la entrega (ERS, APIs, integración, manual de usuario y cobertura de testing) se entregan como documentos aparte.

## Stack

| Uso | Paquete | Versión |
|---|---|---|
| Interfaz | react, react-dom | 19.3.1 |
| Empaquetado y servidor de desarrollo | vite, @vitejs/plugin-react | 8.3.5, 6.1.2 |
| Rutas | react-router | 8.5.0 |
| Grilla y responsivo | bootstrap, react-bootstrap | 5.3.8, 2.10.10 |
| Animaciones | gsap, @gsap/react | 3.15.0, 2.1.2 |
| Íconos | @phosphor-icons/react | 2.1.10 |
| Fuentes autoalojadas | @fontsource/montserrat, @fontsource/lato | 5.3.0 |
| Lector de avances | react-comic-viewer | 1.3.0 |
| Pruebas | vitest, @vitest/coverage-v8, jsdom | 4.1.12, 4.1.12, 31.0.1 |
| Pruebas de componentes | @testing-library/react, @testing-library/dom | 16.3.3, 10.4.2 |

## Requisitos

- Node.js 22.22 o superior (lo exige react-router 8). Probado con Node 24.

## Instalar y ejecutar

1. **Backend** (carpeta `nanitomangas-backend`, requiere Docker):

```bash
docker compose up -d --build   # MongoDB 7, tres servicios y gateway en http://localhost:8080
```

   Swagger de cada servicio: http://localhost:8081/swagger-ui.html (administración), http://localhost:8082/swagger-ui.html (vendedores), http://localhost:8083/swagger-ui.html (clientes).

2. **Frontend** (esta carpeta):

```bash
npm install
npm run dev        # abre la tienda en http://localhost:5173; el proxy de Vite envía /api y /auth a http://localhost:8080
npm test           # corre las pruebas (Vitest + jsdom)
npm run coverage   # corre las pruebas y genera la cobertura
npm run build      # genera la versión de producción en dist/
npm run preview    # sirve dist/ para revisarla (con el proxy de MangaDex)
```

- `npm run coverage` deja el reporte en `coverage/`. Abrir `coverage/index.html` para verlo por carpeta y archivo.
- `npm run test:watch` deja Vitest abierto y vuelve a correr las pruebas al guardar.
- `npm run build` muestra un aviso de que el archivo JavaScript supera 500 kB. Es solo una recomendación de Vite, no un error.

Sobre las dependencias: `npm audit --omit=dev` da 0 vulnerabilidades, es decir, ninguna afecta al sitio publicado.

## Estructura de carpetas

```
nanitomangas/
  index.html             página base (aplica el tema guardado antes de pintar)
  vite.config.js         Vite (proxy al gateway y a MangaDex) y Vitest (jsdom, cobertura v8)
  vite/mangadexProxy.js  middleware del servidor de desarrollo que reenvía a MangaDex
  test/setup.js          preparación común de las pruebas (limpieza y APIs que jsdom no trae)
  public/img/            imágenes de los productos
  src/
    main.jsx             punto de entrada; único archivo que importa CSS
    App.jsx, routes.jsx  proveedores (tema, sesión, carro) y rutas
    styles/              tokens de color y estilos propios sobre Bootstrap
    api/                 cliente REST: request con token y renovación, auth, productos, pedidos, usuarios, memes
    lib/                 lógica pura: precios, envío, validaciones, catálogo, pago simulado, MangaDex
    lib/memes/           detección de globos, dibujo del meme y sorteo de página
    data/                solo carro, tema (localStorage) y categorías y banners
    context/             contextos de tema, sesión y carro
    hooks/               productos, avance de manga y animaciones GSAP
    components/          layout, tienda, formularios, comunes, checkout, cuenta, memes
    pages/               una página por ruta; admin/ y vendedor/ para los paneles
```

Cada archivo de `src/` tiene su prueba al lado (`X.jsx` y `X.spec.jsx`).

## Cuentas, roles y rutas

| Rol | Correo | Contraseña | Acceso |
|---|---|---|---|
| ADMIN | `admin@nanitomangas.cl` | `Admin1234` | entra por `/ingresar/personal`; `/admin/productos`, `/admin/usuarios`, `/admin/pedidos` |
| VENDEDOR | `vendedor@nanitomangas.cl` | `Vendedor1234` | entra por `/ingresar/personal`; `/vendedor/productos`, `/vendedor/pedidos` |
| CLIENTE | se registra en `/registro` | la que elija (8 o más caracteres, una letra y un número) | entra por `/ingresar`; `/cuenta`, `/memes/crear`, `/memes/biblioteca` |

- **Dos accesos:** `/ingresar` es solo para clientes y `/ingresar/personal` solo para administrador y vendedor. Una cuenta con el rol equivocado se rechaza y se cierra la sesión sin dejar tokens ("Esta cuenta es de personal. Usa el acceso de personal." o "Esta cuenta es de cliente. Usa el acceso de cliente."). Tras ingresar, el cliente va a la ruta de origen o a la portada, el administrador a `/admin` y el vendedor a `/vendedor`.
- `/registro` crea solo clientes; `/registro?tipo=vendedor` (enlace "Crear cuenta de vendedor" del acceso de personal) crea un vendedor y lo lleva a `/vendedor`. No se puede crear un administrador desde el sitio.
- Un invitado que abre `/admin` o `/vendedor` va a `/ingresar/personal`; si abre `/cuenta` o `/memes/*`, va a `/ingresar`.
- Se puede comprar como invitado. Los memes son solo para el rol CLIENTE; un rol sin acceso a una ruta vuelve a la portada.
- **Los datos viven en MongoDB** (bases `nm_admin`, `nm_vendedores` y `nm_clientes`). En el navegador solo quedan los tokens, el carro y el tema (`localStorage`, claves `nanitomangas:*`) y el último comprobante (`sessionStorage`). La primera vez se siembran los 17 productos y las dos cuentas.
- **Reiniciar los datos:** `docker compose down -v` en el backend y volver a levantar. Para limpiar el navegador, borrar las claves `nanitomangas:*`.

## Pago de prueba

El pago es simulado: valida el formato de la tarjeta (incluido el algoritmo de Luhn) pero no cobra nada.

| Tarjeta | Vencimiento | CVV | Resultado |
|---|---|---|---|
| 4242 4242 4242 4242 | 12/30 | 123 | Pago aprobado, se crea el pedido |
| 4000 0000 0000 0002 | 12/30 | 123 | Pago rechazado, el carro queda intacto |

Los datos de la tarjeta nunca se guardan.

## Cargar productos y datos reales

- **Productos:** desde el panel de vendedor o administrador (crear, editar, eliminar; la imagen se indica por URL). Los 17 productos semilla están en `DataSeeder` de `ms-vendedores` y solo se cargan con la base vacía.
- **Categorías y géneros de manga:** `categories` en `src/data/seed.js`.
- **Banners de la portada:** `banners` en `src/data/seed.js` (título, texto, imagen, botón y enlace).
- **Envío:** lo calcula el servidor (3.990 CLP, gratis desde 40.000 CLP; el retiro es gratis). La vista previa del carro usa `SHIPPING` en `src/lib/shipping.js`.
- **Datos de contacto y redes del pie:** `src/components/layout/Footer.jsx` (hoy son de relleno).

## Diseño responsivo con Bootstrap

Bootstrap 5.3 aporta la grilla, las utilidades y el comportamiento responsivo; el aspecto (colores, fuentes, píldoras, tarjetas) viene de una hoja propia. Se revisó a 375, 768 y 1280 px, en modo claro y oscuro.

- **Grilla (`row` / `col-*`):** la grilla de productos usa `col-6 col-md-4 col-lg-3` (2 columnas en celular, 3 en tablet, 4 en escritorio). El carro (`col-lg-8` + `col-lg-4`) y el checkout (`col-lg-7` + `col-lg-5`) ponen el resumen al lado en escritorio y debajo en celular. La ficha de producto usa `col-md-5` + `col-md-7`. El pie usa `col-6`/`col-12`, `col-sm-6` y `col-lg-3` con `order-*` para reordenar columnas en celular.
- **`table-responsive`:** las tablas del panel de administración se desplazan dentro de su caja en pantallas angostas, sin ensanchar la página. Debajo de `lg` se oculta la columna Marca (`d-none d-lg-table-cell`) y debajo de `xxl` los botones de fila muestran solo el ícono.
- **Componentes de react-bootstrap:** `Navbar` con `expand="lg"` y `Offcanvas` (menú lateral en celular, botón hamburguesa), `NavDropdown` (géneros de Mangas), `Carousel` (banner de la portada) y `Modal` (confirmación al eliminar un producto).
- **Utilidades:** `d-none` / `d-lg-flex` (buscador en la cabecera o debajo del logo según el ancho), `g-*` para los espacios de la grilla, `visually-hidden`, márgenes y alineación (`mb-*`, `align-middle`).
- **Variables `--bs-*` sobrescritas en `src/styles/theme.css`:** fondo, texto, bordes, enlaces, color primario y anillo de foco apuntan a los tokens propios (`--nm-accent` naranja `#F2711C`, `--nm-ink`, `--nm-paper`, etc.). El modo oscuro usa el `data-bs-theme="dark"` de Bootstrap en `<html>` y redefine esos mismos tokens. Botones (`--bs-btn-*`), menú desplegable (`--bs-dropdown-*`), formularios y estados de error también se ajustan por variables, para que nada quede con el azul por defecto de Bootstrap.
- **Media queries propias:** en `src/styles/` se ajustan detalles por ancho (cabecera compacta bajo 576 px, líneas del carro, botones de tarjeta a todo el ancho).

## Animaciones (GSAP)

- `@gsap/react` (`useGSAP`) con `gsap.matchMedia()`: la bolsa del carro rebota al añadir un producto (`src/hooks/useBounce.js`) y las secciones de la portada entran al hacer scroll con ScrollTrigger (`src/hooks/useReveal.js`).
- Con `prefers-reduced-motion: reduce` las animaciones GSAP no se crean, el carrusel desplaza sin animación y las transiciones CSS se anulan.
- Las tarjetas de producto se levantan e inclinan al pasar el mouse (CSS), también desactivado con movimiento reducido.

## Accesibilidad

Enlace "Saltar al contenido", foco visible naranja en todos los controles, etiquetas en cada campo con el error vinculado (`aria-describedby`) y foco en el primer error al enviar, botones de ícono con nombre accesible, diálogo de confirmación con nombre y cierre con Escape, un solo `h1` por página y objetivos táctiles de 44 px en los controles principales del celular.

tos.
## Pruebas

`npm test` ejecuta 408 pruebas en 69 archivos (Vitest + jsdom). Cobertura (`npm run coverage`, proveedor v8): 94,28 % de sentencias, 89,29 % de ramas, 91,56 % de funciones y 96,81 % de líneas. El detalle por carpeta y el tipo de pruebas están en el documento de cobertura de testing. El backend tiene sus propias pruebas (`mvn test` en cada servicio).

## Limitaciones conocidas

- **Lector de avances y editor de memes:** dependen del proxy de MangaDex (`vite/mangadexProxy.js`), que solo existe con `npm run dev` y `npm run preview`. No funcionan en un hosting estático ni con `dist/` servido por otro servidor.
- **MangaDex:** su contenido es de terceros; se usa solo como ejercicio local y no se almacena (de un meme solo se guarda la receta: página, recuadros y estilo). La detección de globos es aproximada: puede fallar o sobrar un recuadro, por eso se pueden dibujar a mano.
- **Pago:** es simulado en el navegador y ocurre antes de crear el pedido; no hay cobro ni pasarela. Los datos de la tarjeta nunca se guardan ni se envían.
- **Sesión:** los tokens están en `localStorage`; el token de renovación no se revoca hasta que vence (7 días).
- **Compra de invitado:** el comprobante se recupera al recargar solo en la misma pestaña (`sessionStorage`).
- **Contacto:** el formulario solo confirma en pantalla; no envía correo.
- **Pedidos:** no tienen cambio de estado (siempre `pagado`) y el número se calcula como máximo + 1.
