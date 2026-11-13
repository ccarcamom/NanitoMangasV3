# Inventario de pruebas unitarias

Material de apoyo para el documento de cobertura de testing de NanitoMangas.

## Resultado actual

`npm test` ejecuta **303 pruebas en 58 archivos `*.spec`**, todas en verde (Vitest + jsdom).

| Métrica | Cobertura | Detalle |
|---|---|---|
| Statements (sentencias) | 98,24 % | 895 de 911 |
| Branches (ramas) | 92,84 % | 597 de 643 |
| Functions (funciones) | 97,63 % | 330 de 338 |
| Lines (líneas) | 98,65 % | 732 de 742 |

El reporte completo queda en `coverage/index.html` (abrir en el navegador; se puede navegar por carpeta y archivo y ver las líneas no cubiertas en rojo). También se genera `coverage/lcov.info`. La cobertura se calcula con el proveedor v8 de Vitest (`npm run coverage`).

## Pruebas por carpeta

| Carpeta | Qué se prueba | Archivos | Bloques `it` |
|---|---|---|---|
| `src/lib/` | Lógica pura: precios, envío, validaciones, catálogo, pago simulado, hash | 8 | 38 |
| `src/data/` | Capa de datos (CRUD sobre `localStorage` simulado), siembra, sesión, carro, pedidos | 8 | 67 |
| `src/context/` y `src/hooks/` | Contextos (carro, sesión) y animaciones GSAP | 4 | 13 |
| `src/components/` | Componentes: tarjetas, grilla, carrusel, formularios, cabecera, diálogo | 18 | 63 |
| `src/pages/` | Páginas completas: portada, listados, ficha, carro, checkout, cuentas, administración | 18 | 117 |

Algunas pruebas se generan en bucle (por ejemplo, una por valor inválido en el formulario de producto), por eso el total ejecutado (303) es mayor que la suma de bloques `it` escritos a mano (300).

## Tipos de prueba con ejemplos

| Tipo | Qué demuestra | Ejemplos (archivo y nombre del `it`) |
|---|---|---|
| Renderizado | Que la interfaz muestra lo que corresponde, incluido el renderizado condicional | `src/components/shop/ProductGrid.spec.jsx`: "renderiza una tarjeta por producto" y "sin productos muestra EmptyState". `src/components/shop/ProductCard.spec.jsx`: "muestra \"Agotado\" solo con stock 0 y cambia el botón a \"Ver detalles\"". `src/components/forms/FormField.spec.jsx`: "sin error no muestra mensaje ni marca inválido" |
| Propiedades (props) | Que el componente usa los datos y funciones que recibe | `src/components/shop/ProductCard.spec.jsx`: "muestra marca, nombre, imagen y precio" y "tacha el precio normal solo con oferta". `src/components/shop/QuantityInput.spec.jsx`: "con max menor a 1 queda deshabilitado" |
| Estado | Que el estado cambia al interactuar | `src/context/CartContext.spec.jsx`: "add aumenta count y recalcula las líneas". `src/components/layout/ThemeToggle.spec.jsx`: "pasa a modo oscuro al hacer clic y guarda la elección". `src/pages/Checkout.spec.jsx`: "corregir un campo borra solo su error" |
| Eventos | Que un clic o envío llama a la función correcta (con spy) | `src/components/shop/ProductCard.spec.jsx`: "al hacer clic en \"Añadir al carro\" llama onAdd con el id". `src/components/common/ConfirmDialog.spec.jsx`: "onConfirm solo con el botón de confirmar". `src/components/layout/SearchBar.spec.jsx`: "envía el texto escrito sin espacios sobrantes" |
| Lógica pura | Funciones sin React: entradas y salidas | `src/lib/money.spec.js`: "formatea miles con punto". `src/lib/shipping.spec.js`: "borde del umbral: 39999 cobra y 40000 es gratis". `src/lib/validators.spec.js`: "isValidRut" y "luhnCheck" |
| Capa de datos | CRUD y reglas de negocio sobre almacenamiento simulado | `src/data/users.spec.js`: "rechaza correo repetido sin mayusculas ni espacios" y "dos registros paralelos con el mismo correo crean una sola cuenta". `src/data/storage.spec.js`: "devuelve fallback con JSON corrupto" |
| Mocks | Aislar el componente de lo externo (almacenamiento, pago, navegador) | `src/pages/Checkout.spec.jsx`: "RUT inválido muestra el error, enfoca el campo y no llama a simulatePayment" (pago simulado con `vi.fn()`). `src/data/storage.spec.js`: "devuelve fallback si getItem lanza" (backend falso que falla). `src/hooks/useReveal.spec.jsx`: "con reduce no toca los estilos y no crea triggers" (`vi.spyOn(window, 'matchMedia')`) |

## Cómo está configurado el entorno (Vitest + jsdom)

- **Comando:** `npm test` ejecuta `vitest run`. `npm run test:watch` deja Vitest mirando cambios y `npm run coverage` agrega el reporte de cobertura.
- **`vite.config.js`:** el bloque `test` usa el mismo `vite.config.js` de la aplicación (plugin de React incluido), así el JSX se compila igual que en la tienda. Activa `globals` (`describe`, `it`, `expect`, `vi`), `environment: 'jsdom'` y `restoreMocks`, que restaura los `vi.spyOn` después de cada prueba.
- **Cobertura con v8:** `@vitest/coverage-v8` mide solo `src/` y excluye los `*.spec`, `motionTest.js` y los dobles `fake*` de `src/data/`. Escribe el HTML, `lcov.info` y el resumen de texto en `coverage/`.
- **`test/setup.js`:** limpia el DOM después de cada prueba y agrega `matchMedia` y `scrollBy`, que jsdom no trae.
- **Descubrimiento de specs:** Vitest ejecuta cualquier `src/**/*.spec.js` o `*.spec.jsx` sin registrarlo a mano.
- **Sin CSS en las pruebas:** los componentes no importan hojas de estilo (solo `src/main.jsx` lo hace).
- **Límite de jsdom:** no calcula layout (`clientWidth` vale 0 y `getBoundingClientRect` devuelve ceros). Las pruebas del carrusel y de `useReveal` simulan esos valores; el comportamiento visual real se revisa a mano en el navegador.
- **Herramientas:** Vitest (`describe`, `it`, `expect`, `beforeEach`, `vi.spyOn`, `vi.fn`) y Testing Library (`render`, `screen`, `fireEvent`, `findBy*`). No se usa Jest.

## Uso de mocks

- **`fakeBackend`** (`src/data/fakeBackend.js`): un `localStorage` en memoria. Las pruebas crean `createStorage(fakeBackend())` y se lo inyectan a la capa de datos y a los contextos (`<CartProvider api={...}>`, `<ThemeProvider storage={...}>`), por lo que ninguna prueba toca el almacenamiento real del navegador ni depende del orden de ejecución.
- **`fakeAuthApi` y `fakeAdminApi`** (`src/data/`): versiones de prueba de la API de cuentas y de administración sobre el mismo almacenamiento falso.
- **Spies de Vitest:** `vi.fn()` reemplaza funciones recibidas por props (`onAdd`, `onSearch`, `onConfirm`) y dependencias inyectadas (`simulatePayment`, `placeOrder` en `Checkout`), para verificar si se llamaron, cuántas veces y con qué datos.
- **`matchMedia` simulado** (`src/hooks/motionTest.js`): `vi.spyOn(window, 'matchMedia')` responde a `prefers-reduced-motion`, para probar que las animaciones GSAP se desactivan con movimiento reducido.
- **Dependencias inyectadas:** las páginas reciben por props opcionales sus datos o funciones (`products`, `api`, `deps`, `getOrder`); en la aplicación real se usan los valores por defecto y en las pruebas se pasan dobles controlados.

## Qué queda sin cubrir y por qué

Las líneas no cubiertas (alrededor del 1 %) son ramas defensivas difíciles de provocar en una prueba unitaria, por ejemplo errores del navegador al leer el almacenamiento dentro de componentes ya cubiertos por la capa de datos, o el retardo por defecto del pago simulado. No hay pruebas end-to-end (fuera de alcance según el documento de diseño); el flujo completo de compra se verificó a mano en el navegador.
