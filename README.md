# NanitoMangas

Tienda online de mangas, Funko Pop y accesorios. Proyecto del curso Fullstack 2.

Es una plantilla completa y funcional: se puede navegar el catálogo, buscar, filtrar, comprar con pago ficticio, crear una cuenta, ver el historial de pedidos y administrar productos desde un panel. Los productos son de relleno ("Manga 1", "Funko Pop 1"...) para que el equipo cargue después el catálogo real.

Todo funciona en el navegador: no hay servidor. Una capa de datos en JavaScript (`src/data/`) simula la base de datos con funciones CRUD sobre `localStorage`.

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
| Pruebas | vitest, @vitest/coverage-v8, jsdom | 4.1.12, 4.1.12, 31.0.1 |
| Pruebas de componentes | @testing-library/react, @testing-library/dom | 16.3.3, 10.4.2 |

## Requisitos

- Node.js 22.22 o superior (lo exige react-router 8). Probado con Node 24.

## Instalar y ejecutar

```bash
npm install
npm run dev        # abre la tienda en http://localhost:5173
npm test           # corre las pruebas (Vitest + jsdom)
npm run coverage   # corre las pruebas y genera la cobertura
npm run build      # genera la versión de producción en dist/
npm run preview    # sirve dist/ para revisarla
```

- `npm run coverage` deja el reporte de cobertura en `coverage/`. Abrir `coverage/index.html` en el navegador para verlo por carpeta y archivo.
- `npm run test:watch` deja Vitest abierto y vuelve a correr las pruebas al guardar.
- `npm run build` muestra un aviso de que el archivo JavaScript supera 500 kB. Es solo una recomendación de Vite (dividir el código), no un error.

Sobre las dependencias: `npm audit --omit=dev` da 0 vulnerabilidades, es decir, ninguna afecta al sitio publicado.

## Estructura de carpetas

```
nanitomangas/
  index.html             página base (aplica el tema guardado antes de pintar)
  vite.config.js         configuración de Vite y de Vitest (jsdom, cobertura v8)
  test/setup.js          preparación común de las pruebas (limpieza y APIs que jsdom no trae)
  public/img/            imagen de relleno de los productos
  docs/                  diseño, capturas responsivas e inventario de pruebas
  src/
    main.jsx             punto de entrada; único archivo que importa CSS
    App.jsx, routes.jsx  proveedores (tema, sesión, carro) y rutas
    styles/              tokens de color y estilos propios sobre Bootstrap
    lib/                 lógica pura: precios, envío, validaciones, catálogo, pago simulado
    data/                capa de datos: CRUD sobre localStorage, siembra inicial
    context/             contextos de tema, sesión y carro
    hooks/               productos y animaciones GSAP
    components/          layout, tienda, formularios, comunes, checkout, cuenta
    pages/               una página por ruta; pages/admin/ para el panel
```

Cada archivo de `src/` tiene su prueba al lado (`X.jsx` y `X.spec.jsx`).

## Cuentas y datos

- **Administrador:** `admin@nanitomangas.cl` / `Admin1234`. Entra al panel desde "Mi cuenta" o en `/admin/productos`.
- Cualquier persona puede crear una cuenta de cliente en `/registro`. También se puede comprar como invitado.
- **Los datos viven en el `localStorage` del navegador**, con claves que empiezan con `nanitomangas:` (productos, usuarios, sesión, carro, pedidos, tema). La primera vez que se abre la tienda se siembran los productos de relleno y el administrador.
- **Reiniciar la tienda:** en las herramientas del navegador (Application o Almacenamiento, Local Storage) borrar las claves `nanitomangas:*` y recargar. También sirve ejecutar en la consola:
  `Object.keys(localStorage).filter((k) => k.startsWith('nanitomangas:')).forEach((k) => localStorage.removeItem(k))`

## Pago de prueba

El pago es simulado: valida el formato de la tarjeta (incluido el algoritmo de Luhn) pero no cobra nada.

| Tarjeta | Vencimiento | CVV | Resultado |
|---|---|---|---|
| 4242 4242 4242 4242 | 12/30 | 123 | Pago aprobado, se crea el pedido |
| 4000 0000 0000 0002 | 12/30 | 123 | Pago rechazado, el carro queda intacto |

Los datos de la tarjeta nunca se guardan.

## Cargar productos y datos reales

- **Productos:** desde el panel de administración (`/admin/productos`: crear, editar, eliminar; la imagen se indica por URL), o editando `seedProducts` en `src/data/seed.js`. Los cambios a `seed.js` se ven después de reiniciar la tienda (borrar las claves `nanitomangas:*`), porque la siembra solo ocurre con el almacenamiento vacío.
- **Categorías y géneros de manga:** `categories` en `src/data/seed.js`.
- **Banners de la portada:** `banners` en `src/data/seed.js` (título, texto, imagen, botón y enlace).
- **Envío:** `SHIPPING` en `src/lib/shipping.js` (tarifa fija de despacho $3.990, gratis desde $40.000; el retiro en tienda es gratis).
- **Datos de contacto y redes del pie:** `src/components/layout/Footer.jsx` (hoy son de relleno).

## Diseño responsivo con Bootstrap

Bootstrap 5.3 aporta la grilla, las utilidades y el comportamiento responsivo; el aspecto (colores, fuentes, píldoras, tarjetas) viene de una hoja propia. Hay capturas en 375, 768 y 1280 px, en modo claro y oscuro, en `docs/capturas/`.

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

## Límites de la demo

- **Contraseñas:** se guardan con hash SHA-256 (Web Crypto) y nunca en texto plano, pero es una **simulación**: sin sal ni servidor, no es seguridad real.
- **Pedidos por URL:** cualquier pedido se puede abrir por su dirección (`/compra-exitosa/NM-000001`) en el mismo navegador. No expone datos ajenos porque todo vive en el `localStorage` de ese navegador; con un servidor real habría que verificar que el pedido sea del usuario.
- **Pago:** es simulado y ocurre antes de crear el pedido. Si el stock cambiara justo entre ambos pasos, en un sistema real habría que reembolsar; aquí no hay cobro.
- **Nada sale del navegador:** no hay servidor, correo ni pasarela de pago. El formulario de contacto solo confirma en pantalla.
- Los datos se comparten entre pestañas del mismo navegador, pero no entre navegadores o equipos distintos.
