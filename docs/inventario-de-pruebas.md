# Inventario de pruebas unitarias

Material de apoyo para el documento de cobertura de testing de NanitoMangas.

## Resultado actual

`npm test` ejecuta **312 pruebas en 56 archivos `*.spec`**, todas en verde (Chrome headless).

| Métrica | Cobertura | Detalle |
|---|---|---|
| Statements (sentencias) | 98,6 % | 922 de 935 |
| Branches (ramas) | 89,07 % | 522 de 586 |
| Functions (funciones) | 97,74 % | 346 de 354 |
| Lines (líneas) | 98,94 % | 750 de 758 |

El reporte completo queda en `coverage/index.html` (abrir en el navegador; se puede navegar por carpeta y archivo y ver las líneas no cubiertas en rojo). También se genera `coverage/lcov.info`.

## Pruebas por carpeta

| Carpeta | Qué se prueba | Archivos | Bloques `it` |
|---|---|---|---|
| `src/lib/` | Lógica pura: precios, envío, validaciones, catálogo, pago simulado, hash | 8 | 38 |
| `src/data/` | Capa de datos (CRUD sobre `localStorage` simulado), siembra, sesión, carro, pedidos | 8 | 67 |
| `src/context/` y `src/hooks/` | Contextos (carro, sesión) y animaciones GSAP | 4 | 13 |
| `src/components/` | Componentes: tarjetas, grilla, carrusel, formularios, cabecera, diálogo | 18 | 63 |
| `src/pages/` | Páginas completas: portada, listados, ficha, carro, checkout, cuentas, administración | 18 | 117 |

Algunas pruebas se generan en bucle (por ejemplo, una por campo inválido del checkout), por eso el total ejecutado (312) es mayor que la suma de bloques `it` escritos a mano (298).

## Tipos de prueba con ejemplos

| Tipo | Qué demuestra | Ejemplos (archivo y nombre del `it`) |
|---|---|---|
| Renderizado | Que la interfaz muestra lo que corresponde, incluido el renderizado condicional | `src/components/shop/ProductGrid.spec.jsx`: "renderiza una tarjeta por producto" y "sin productos muestra EmptyState". `src/components/shop/ProductCard.spec.jsx`: "muestra \"Agotado\" solo con stock 0 y cambia el botón a \"Ver detalles\"". `src/components/forms/FormField.spec.jsx`: "sin error no muestra mensaje ni marca inválido" |
| Propiedades (props) | Que el componente usa los datos y funciones que recibe | `src/components/shop/ProductCard.spec.jsx`: "muestra marca, nombre, imagen y precio" y "tacha el precio normal solo con oferta". `src/components/shop/QuantityInput.spec.jsx`: "con max menor a 1 queda deshabilitado" |
| Estado | Que el estado cambia al interactuar | `src/context/CartContext.spec.jsx`: "add aumenta count y recalcula las líneas". `src/components/layout/ThemeToggle.spec.jsx`: "pasa a modo oscuro al hacer clic y guarda la elección". `src/pages/Checkout.spec.jsx`: "corregir un campo borra solo su error" |
| Eventos | Que un clic o envío llama a la función correcta (con spy) | `src/components/shop/ProductCard.spec.jsx`: "al hacer clic en \"Añadir al carro\" llama onAdd con el id". `src/components/common/ConfirmDialog.spec.jsx`: "onConfirm solo con el botón de confirmar". `src/components/layout/SearchBar.spec.jsx`: "envía el texto escrito sin espacios sobrantes" |
| Lógica pura | Funciones sin React: entradas y salidas | `src/lib/money.spec.js`: "formatea miles con punto". `src/lib/shipping.spec.js`: "borde del umbral: 39999 cobra y 40000 es gratis". `src/lib/validators.spec.js`: "isValidRut" y "luhnCheck" |
| Capa de datos | CRUD y reglas de negocio sobre almacenamiento simulado | `src/data/users.spec.js`: "rechaza correo repetido sin mayusculas ni espacios" y "dos registros paralelos con el mismo correo crean una sola cuenta". `src/data/storage.spec.js`: "devuelve fallback con JSON corrupto" |
| Mocks | Aislar el componente de lo externo (almacenamiento, pago, navegador) | `src/pages/Checkout.spec.jsx`: "RUT inválido muestra el error, enfoca el campo y no llama a simulatePayment" (pago simulado con `jasmine.createSpy`). `src/data/storage.spec.js`: "devuelve fallback si getItem lanza" (backend falso que falla). `src/hooks/useReveal.spec.jsx`: "con reduce no toca los estilos y no crea triggers" (`spyOn(window, 'matchMedia')`) |

## Cómo está configurado el entorno (Karma + Jasmine)

- **Comando:** `npm test` ejecuta `karma start karma.conf.cjs --single-run`. `npm run test:watch` deja Karma mirando cambios.
- **`karma.conf.cjs`:** frameworks `jasmine` y `webpack`; navegador `ChromeHeadless` (usa el Chrome instalado en `/Applications`); reporteros `progress` (consola) y `coverage`.
- **Webpack + Babel:** Karma no usa Vite. Cada archivo pasa por `webpack` con `babel-loader` (`@babel/preset-env` y `@babel/preset-react`), así el JSX funciona en el navegador de pruebas.
- **Cobertura con istanbul:** una segunda regla de `babel-loader` aplica `babel-plugin-istanbul` solo a `src/` y excluye los `*.spec`, para que el reporte muestre los archivos reales y no las pruebas. `karma-coverage` escribe el HTML, `lcov.info` y el resumen de texto en `coverage/`.
- **Descubrimiento de specs:** `test/index.js` usa `require.context('../src', true, /\.spec\.jsx?$/)`, por lo que cualquier `*.spec.js` o `*.spec.jsx` dentro de `src/` se ejecuta sin registrarlo a mano.
- **Sin CSS en las pruebas:** los componentes no importan hojas de estilo (solo `src/main.jsx` lo hace), así Karma no necesita loaders de CSS.
- **Herramientas:** Jasmine (`describe`, `it`, `expect`, `beforeEach`, `spyOn`, `jasmine.createSpy`) y Testing Library (`render`, `screen`, `fireEvent`, `findBy*`). No se usa Jest.

## Uso de mocks

- **`fakeBackend`** (`src/data/fakeBackend.js`): un `localStorage` en memoria. Las pruebas crean `createStorage(fakeBackend())` y se lo inyectan a la capa de datos y a los contextos (`<CartProvider api={...}>`, `<ThemeProvider storage={...}>`), por lo que ninguna prueba toca el almacenamiento real del navegador ni depende del orden de ejecución.
- **`fakeAuthApi` y `fakeAdminApi`** (`src/data/`): versiones de prueba de la API de cuentas y de administración sobre el mismo almacenamiento falso.
- **Spies de Jasmine:** `jasmine.createSpy` reemplaza funciones recibidas por props (`onAdd`, `onSearch`, `onConfirm`) y dependencias inyectadas (`simulatePayment`, `placeOrder` en `Checkout`), para verificar si se llamaron, cuántas veces y con qué datos.
- **`matchMedia` simulado** (`src/hooks/motionTest.js`): `spyOn(window, 'matchMedia')` responde a `prefers-reduced-motion`, para probar que las animaciones GSAP se desactivan con movimiento reducido.
- **Dependencias inyectadas:** las páginas reciben por props opcionales sus datos o funciones (`products`, `api`, `deps`, `getOrder`); en la aplicación real se usan los valores por defecto y en las pruebas se pasan dobles controlados.

## Qué queda sin cubrir y por qué

Las líneas no cubiertas (alrededor del 1 %) son ramas defensivas difíciles de provocar en una prueba unitaria, por ejemplo errores del navegador al leer el almacenamiento dentro de componentes ya cubiertos por la capa de datos, o el retardo por defecto del pago simulado. No hay pruebas end-to-end (fuera de alcance según el documento de diseño); el flujo completo de compra se verificó a mano en el navegador.
