# NanitoMangas: documento de diseño

Fecha: 2026-10-21. Estado: borrador para aprobación.

## 1. Qué es y por qué

NanitoMangas es una tienda online de artículos geek/otaku (mangas, Funko Pop, accesorios). Es un proyecto del curso Fullstack 2 con entrega el 2026-10-22, pero se diseña y construye como si fuera una tienda real. La primera versión debe estar **completa**: navegar, buscar, comprar (pago ficticio), cuentas de usuario y un panel de administración funcionan de punta a punta.

El catálogo real lo cargará el equipo después. Esta entrega es una **plantilla**: la estructura, el diseño y la lógica, con productos de relleno.

Referencia de diseño: neotokyo.cl (fuentes, organización armónica de la portada, carruseles). Con una paleta propia, más neutra.

## 2. Objetivos

- Una tienda fácil e intuitiva de navegar, con carruseles de productos en la portada.
- Estilo minimalista pero simpático: el carácter "geek" viene de micro-animaciones, no de saturar color.
- Flujo de compra completo: carro, checkout con envío y pago ficticios, confirmación, historial de pedidos.
- Cuentas: registro, inicio y cierre de sesión, perfil.
- Panel de administración: el administrador crea, edita y elimina productos (y puede ver usuarios y pedidos).
- Pruebas unitarias con Jasmine y Karma (lo exige el profesor), con mocks y reporte de cobertura.
- Diseño responsivo con Bootstrap (lo exige el profesor).
- Una capa de datos en JavaScript con CRUD que simula la base de datos (lo exige el profesor).

## 3. No-objetivos

- Servidor o base de datos real. Todo vive en el navegador (`localStorage`).
- Pagos reales, integración con Webpay/Mercado Pago/Flow, despacho real.
- Catálogo real, fotos reales de productos, logo (aún no existe).
- Pruebas end-to-end.
- Servidor real. La rúbrica menciona "integrado con el backend" en la presentación: se asume que la capa de datos simulada cumple ese rol (por confirmar con el profesor).
- Publicar en AWS, Vercel o GitHub. Se trabaja solo en local.

## 4. Anti-objetivos (sería un fracaso aunque "funcione")

- Que parezca plantilla genérica de IA (degradados morados, tarjetas idénticas, emojis como íconos).
- Que se rompa en celular.
- Que el código de datos quede tan pegado a `localStorage` que pasar a un servidor obligue a reescribir las pantallas.
- Productos inventados con nombres de franquicias reales en el catálogo de relleno.

## 5. Restricciones

- **Stack (decidido por el usuario):** React + Vite, últimas versiones, con Bootstrap 5.3. Motivo: fallas de seguridad del 2026-10-14 en Next.js y en `react-server-dom-*` (React 19.0.0 a 19.3.0). Este proyecto no usa Server Components ni Next.js, y React queda en 19.3.1 o superior.
- Versiones verificadas en npm el 2026-10-21: react/react-dom 19.3.1, vite 8.3.5, @vitejs/plugin-react 6.1.2, react-router 8.5.0 (requiere Node >=22.22), gsap 3.15.0, @gsap/react 2.1.2, @phosphor-icons/react 2.1.10, bootstrap 5.3.8, react-bootstrap 2.10.10, @testing-library/react 16.3.3.
- **Datos (decidido por el usuario):** solo en el navegador, `localStorage`.
- **Animación (regla del usuario):** GSAP (`@gsap/react`, hook `useGSAP`). Respetar `prefers-reduced-motion` con `gsap.matchMedia()`.
- **Hosting:** ninguno por ahora, solo local (`npm run dev` y `npm run build`).
- **Pruebas (rúbrica del profesor):** Jasmine + Karma, no Vitest. Piden 10 pruebas unitarias que verifiquen lógica y comportamiento de componentes, configuración del entorno, uso de mocks, análisis de resultados y cobertura de código. Versiones npm verificadas el 2026-10-21: karma 6.4.4, jasmine-core 7.0.2, karma-jasmine 5.1.0, karma-chrome-launcher 3.2.0, karma-coverage 2.2.1; `karma-vite` 1.0.5 solo soporta Vite 2 a 5 (verificado), así que no sirve con Vite 8: Karma usa `karma-webpack` 5.0.1 con Babel (y `babel-plugin-istanbul` para la cobertura). Las pruebas corren en Chrome headless (Chrome está instalado en /Applications).
- **Responsivo (rúbrica del profesor):** Bootstrap 5.3 (verificado 5.3.8). Se evalúa explícitamente cómo se aplicó en móvil, tablet y escritorio.
- **Componentes React (rúbrica del profesor):** una sola responsabilidad por componente, nombres claros, props para datos y funciones, estado solo cuando hace falta, JSX legible.
- **Entregables del profesor:** enlace de GitHub público, proyecto comprimido, documento ERS v2 y documento de cobertura de testing. Cada integrante presenta (15 min + 5 de preguntas).
- Idioma español (Chile), moneda CLP con formato `$11.990`.
- Carpeta: `~/Desktop/fullstack2/nanitomangas`.

## 6. Diseño visual (aprobado en maqueta, "opción B v4")

**Regla: el aspecto aprobado no cambia por usar Bootstrap.** Bootstrap aporta grilla, utilidades y comportamiento responsivo. Los colores, fuentes, bordes redondeados, tarjetas, botones píldora y animaciones se definen en una hoja propia que sobrescribe las variables de Bootstrap (`--bs-*`), de modo que el resultado se vea igual a la maqueta. No se dejan componentes de Bootstrap con su estilo por defecto.

- **Tipografía:** Montserrat (títulos, menú, botones, precios; negrita, menú en mayúsculas) + Lato (textos). Autoalojadas (p. ej. `@fontsource`), no `<link>` a Google Fonts.
- **Colores:** un solo acento naranja (~`#F2711C`) + blanco roto + casi negro (`#18181B`). Texto sobre botones naranjos en negro. Precios en un naranja más oscuro que cumpla contraste AA sobre blanco (~`#C2410C`). Nada de negro o blanco puros.
- **Modo:** claro por defecto, con botón para cambiar a oscuro (Bootstrap `data-bs-theme`). La elección se recuerda en `localStorage`. Mismo naranja en ambos modos; tokens como variables CSS.
- **Forma:** bordes redondeados en tarjetas (~12-16px) y botones tipo píldora en todo el sitio.
- **Íconos:** Phosphor (`@phosphor-icons/react`), una sola familia. Sin emojis.
- **Cabecera:** fila 1 con logo (texto "NanitoMangas" hasta que exista logo), buscador ancho tipo píldora, ícono de cuenta, botón de tema y bolsa del carro con contador naranja. Fila 2: menú de categorías con desplegables; ítem activo subrayado en naranja. En celular: menú hamburguesa y buscador debajo del logo.
- **Animaciones (moderadas, todas con motivo):**
  - Tarjetas de producto se levantan e inclinan levemente al pasar el mouse.
  - Al añadir al carro, la bolsa del carro da un rebote y el contador cambia.
  - Carruseles con flechas y arrastre/deslizamiento.
  - Entrada suave de secciones al hacer scroll.
  - Todo se desactiva con `prefers-reduced-motion`.

## 7. Páginas

Tienda:
1. **Portada:** banner con flechas (promociones, editable como datos), franja de 3 datos (medios de pago, retiro en tienda, redes), carruseles "Novedades", "Más vendidos" y "De vuelta en stock", fila de logos de editoriales/marcas (placeholders), pie.
2. **Categoría / listado:** grilla de productos, filtro por subcategoría (género), orden por precio/nombre, estado vacío.
3. **Búsqueda:** resultados por nombre, marca/editorial y categoría.
4. **Ficha de producto:** foto, editorial/marca, título, precio, stock, descripción, cantidad, "Añadir al carro"; productos relacionados.
5. **Carro:** cambiar cantidades, quitar, subtotal, envío, total.
6. **Checkout:** datos del comprador y dirección de envío (región/comuna de Chile) y opciones de entrega (despacho o retiro en tienda), con pago ficticio (formulario de tarjeta que valida formato pero no cobra). Si el usuario inició sesión, sus datos se rellenan solos. Pago simulado con resultado exitoso o fallido.
   - **Compra exitosa:** resumen del pedido y número de pedido.
   - **Pago fallido:** mensaje claro y opción de reintentar sin perder el carro.
7. **Cuenta:** registro, login, perfil, historial de pedidos.
8. **Ofertas:** todos los productos con descuento (el producto tiene precio normal y precio de oferta, marcado por el administrador).
9. **Contacto** y **404**.

Administración (solo rol admin, ruta protegida):
10. **Productos:** listado, crear, editar, eliminar (con confirmación). Imagen por URL.
11. **Usuarios** y **Pedidos:** listado de solo lectura (cambiar estado de pedido es opcional).

## 8. Categorías

- **Mangas**, con subcategorías por género: Shonen, Seinen, Shojo, Josei, Kodomo (lista editable como datos).
- **Funko Pop**, categoría completa.
- **Accesorios**.
- **Novedades** (filtro de productos marcados como nuevos).

## 9. Catálogo de relleno

Productos genéricos sin nombres reales: "Manga 1", "Funko Pop 1", "Figura 1", "Accesorio 1"…, con precios de ejemplo e imagen placeholder neutra. Suficientes para llenar los carruseles y probar filtros (unos 4-6 por categoría, al menos uno agotado). La tarjeta agotada muestra "Agotado" y "Ver detalles" en vez de "Añadir al carro".

## 10. Datos y cuentas

- Un **archivo de datos en JavaScript** (p. ej. `src/data/`) actúa como base de datos simulada, con funciones CRUD (crear, leer, actualizar, eliminar), y es lo único que toca `localStorage`. Los componentes React se conectan a esa capa (hooks o contexto) y la interfaz se actualiza con los cambios. Así, pasar a una API después es reemplazar solo esa capa.
- Entidades: producto, categoría, usuario, carro, pedido.
- Primera carga: si `localStorage` está vacío, se siembra con el catálogo de relleno y un usuario administrador por defecto (credenciales documentadas en el README).
- Contraseñas: se guardan con hash (Web Crypto, SHA-256) y nunca en texto plano. Se documenta que esto es una simulación y no seguridad real.
- Validación de formularios: correo, contraseña mínima, RUT chileno si se pide, tarjeta ficticia (formato y Luhn), campos obligatorios; errores bajo cada campo.
- El checkout descuenta stock.

## 11. Pruebas unitarias (Jasmine + Karma)

Jasmine (describe/it/expect/spies) ejecutado en el navegador con Karma, más cobertura con karma-coverage. Mínimo **10 pruebas** bien estructuradas, y se demuestran en vivo. Deben cubrir los cuatro tipos que sugiere el profesor:
- **Renderizado:** una lista renderiza todos los productos; renderizado condicional (el mensaje de error solo aparece si hay error; "Agotado" solo si no hay stock).
- **Props:** el botón y la tarjeta de producto reciben etiqueta, datos y `onClick`.
- **Estado:** el formulario cambia su estado al escribir; el carro cambia al agregar y quitar.
- **Eventos:** simular clic y comprobar que se llama a la función (con un spy) o cambia el estado.

También lógica pura: formato CLP, validaciones (correo, RUT, tarjeta con Luhn), totales y envío, y la capa de datos (CRUD, registro, login). Uso de **mocks** (spies y un `localStorage` simulado) para aislar los componentes.

Se entrega un **documento de cobertura de testing**: propuesta, qué se cubre, resultados y análisis, con el reporte de karma-coverage. Se ejecutan con `npm test`.

## 12. Entregables

- Proyecto en `~/Desktop/fullstack2/nanitomangas`. Se trabaja solo en local: sin GitHub, sin AWS, sin Vercel. Git local opcional.
- El usuario prepara por su cuenta los entregables del profesor (GitHub público, proyecto comprimido, ERS v2, documento de cobertura de testing). Yo solo dejo el reporte de cobertura que genera Karma.
- README: cómo instalar, ejecutar, probar y credenciales del administrador.
- `npm run build` sin errores; `npm test` en verde.

## 13. Decisiones que tomé yo (revisables)

- React Router para rutas.
- Fuentes autoalojadas con `@fontsource`.
- Hash SHA-256 para contraseñas simuladas.
- Géneros de manga listados en la sección 8.
- Imagen de producto por URL en el admin (sin subida de archivos).
- **Compra (decidido por el usuario):** se puede pagar como invitado, sin cuenta. El checkout pide correo, nombre, RUT y dirección. El pedido de un invitado se guarda con su correo y se muestra en la pantalla de confirmación, pero no tiene historial. Si el comprador inició sesión, el pedido queda asociado a su cuenta y aparece en "Mis pedidos". El carro se guarda en el navegador y se conserva al iniciar sesión.
- **Secciones de la portada:** son marcas que el administrador activa en cada producto: "nuevo", "más vendido" y "reingreso". No se calculan a partir de pedidos ni de historial de stock.
- **Envío (ficticio):** retiro en tienda $0. Despacho: tarifa fija de $3.990, gratis sobre $40.000. Todo definido en una constante, fácil de cambiar.
- **Categorías, géneros y banners:** son datos de siembra (archivo editable). El administrador solo hace CRUD de productos.
- **Sin categoría "Figuras":** "Figura 1", "Figura 2" son nombres de relleno dentro de Accesorios. Funko Pop no tiene subcategorías, así que su menú es un enlace directo, no un desplegable.
- **RUT:** se pide en el checkout, no en el registro. El registro pide nombre, correo y contraseña. El perfil permite editar nombre, RUT y dirección guardada.

## 14. Queda a criterio del constructor

- Cómo se organiza la hoja propia encima de Bootstrap (variables `--bs-*` y tokens de color en variables CSS). Se usa Bootstrap, no Tailwind.
- Implementación del carrusel (CSS scroll-snap + GSAP, o similar), sin añadir librerías pesadas.
- Estructura exacta de carpetas y estado global (Context o similar).
