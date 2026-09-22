# PixelForge Games — Tienda de videojuegos con Bootstrap 5 y JavaScript

Actividad **sumativa** de la Semana 6 — *Optimizando la Lógica y Rendimiento de una Página Web con JavaScript*
Asignatura: **Desarrollo Frontend I (PFY2201)** — Experiencia 2
Autor: **Agustín Andrews**

eCommerce de una página construido con **Bootstrap 5.3** para la maquetación responsiva y
**JavaScript** para la interactividad: catálogo cargado con la **Fetch API** desde un archivo JSON
local, búsqueda, filtros y un carrito de compras que manipula el DOM en tiempo real.

---

## Cómo ejecutar el proyecto

> **Importante:** el catálogo se carga con `fetch()`. Por seguridad, los navegadores bloquean esa
> lectura cuando la página se abre con doble clic (protocolo `file://`). Hay que servirla por HTTP.

```bash
cd Agustin_Andrews_PFY2201_Optimizacion_Semana6
python3 -m http.server 8000
```

Luego abre **http://localhost:8000** en el navegador.

Si aun así se abre con doble clic, la página no falla en silencio: muestra un mensaje que explica
la causa y cómo solucionarla. En GitHub Pages funciona directamente, porque ya se sirve por HTTP.

---

## Estructura del proyecto

```
Agustin_Andrews_PFY2201_Optimizacion_Semana6/
├── index.html                     Página principal del eCommerce
├── assets/
│   ├── css/
│   │   └── estilos.css            Personalización sobre Bootstrap
│   ├── js/
│   │   ├── carrito.js             Lógica del carrito (sin DOM)
│   │   └── app.js                 Fetch, render del DOM y eventos
│   ├── img/
│   │   ├── logo-pixelforge.svg    Logotipo
│   │   ├── banner-*.svg           Fondos del carrusel (3)
│   │   └── juego-*.svg            Portadas de producto (6)
│   └── data/
│       └── productos.json         Catálogo que consume la Fetch API
├── capturas/                      Capturas de pantalla de la entrega
├── VERIFICACION.md                Informe de pruebas
└── README.md
```

---

## Qué hace el sitio

### Maquetación con Bootstrap 5.3
Bootstrap se carga **desde CDN** con `integrity` y `crossorigin`, como enseña la guía de la Semana 4.
Componentes utilizados: `navbar` con colapso, `dropdown`, `carousel`, `card`, sistema de
cuadrículas (`row-cols-*`), `modal`, `offcanvas`, `toast`, `alert`, `badge`, `spinner` y
`list-group`. El archivo `estilos.css` solo añade los colores de marca y unos pocos ajustes: la
maquetación y la responsividad las resuelve el framework.

| Dispositivo | Ancho | Tarjetas por fila | Barra de navegación |
|---|---|---|---|
| Móvil | < 768 px | 1 | Colapsada (botón hamburguesa) |
| Tablet | 768 – 991 px | 2 | Colapsada (botón hamburguesa) |
| Escritorio | ≥ 992 px | 3 | Desplegada |

### Barra de navegación
Enlaces a las secciones, menú desplegable de **seis categorías simuladas** que filtran el catálogo,
formulario de búsqueda y botón del carrito con una insignia que muestra las unidades. En pantallas
menores a 992 px se colapsa en el botón hamburguesa.

### Carga de datos con la Fetch API
`app.js` pide `assets/data/productos.json`, comprueba `response.ok`, convierte la respuesta con
`.json()` y valida que traiga un arreglo `productos` con los campos obligatorios antes de usarlo.
Mientras tanto se muestra un `spinner`.

### Gestión de errores
Si algo falla se muestra una alerta con:

1. **Qué pasó**, en lenguaje sencillo.
2. **La causa probable** — detecta si la página se abrió con `file://` y lo explica.
3. **Cómo solucionarlo**, con el comando exacto.
4. El **detalle técnico** (código HTTP o mensaje) en letra pequeña.
5. Un botón **Reintentar** que vuelve a lanzar la carga sin recargar la página.

El detalle completo del error también se registra con `console.error()` para depuración.

### Eventos gestionados

| Evento | Dónde | Qué hace |
|---|---|---|
| `click` | Botón "Agregar al carrito" | Suma el producto al carrito |
| `submit` | Formulario de búsqueda | Filtra el catálogo, con `preventDefault()` |
| `click` | Botón "Ver detalle" | Abre el modal con los datos del producto |
| `click` | Botones +, − y Quitar | Ajustan las cantidades del carrito |
| `click` | Vaciar / Ir a pagar | Dejan el carrito en cero |
| `click` | Menú de categorías | Filtra por categoría |
| `change` | Select de categoría | Filtra por categoría |
| `click` | Botón Reintentar | Reintenta la carga del catálogo |

Los botones de las tarjetas y del carrito se crean dinámicamente, así que sus eventos se registran
por **delegación**: un solo `addEventListener` en el contenedor atiende a todos los botones, en vez
de volver a asociarlos en cada renderizado.

### Manipulación del DOM
Las tarjetas se construyen con `createElement` y se insertan en un `DocumentFragment`, de modo que
la grilla completa entra al DOM en una sola operación. Los textos se asignan con `textContent`, no
con `innerHTML`, para que el contenido del JSON nunca se interprete como HTML.

El carrito tiene **tres vistas** (insignia de la barra, panel lateral y resumen de la página) que se
redibujan desde un mismo estado con una única función, `renderizarCarrito()`, para que no puedan
quedar desincronizadas.

### Organización del código
El JavaScript está dividido en dos archivos con responsabilidades separadas:

- **`carrito.js`** — lógica pura del carrito y utilidades de formato. No toca el DOM ni conoce
  Bootstrap, así que se puede probar de forma aislada. El estado es privado (patrón módulo) y solo
  se modifica a través de la API que expone.
- **`app.js`** — capa de interfaz: Fetch, construcción del DOM y eventos. Va dentro de una IIFE con
  `'use strict'` para no contaminar el ámbito global.

Ambos archivos están comentados por secciones y cada función lleva su bloque JSDoc.

---

## Verificación

Ver **[VERIFICACION.md](VERIFICACION.md)**: 54 comprobaciones automatizadas sobre el sitio en
ejecución, en Chromium y Firefox, incluyendo la simulación de un fallo de carga del JSON.

---

## Publicación en GitHub Pages

Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Semana 6: eCommerce con Bootstrap 5, Fetch API y carrito dinamico"
git branch -M main
```

Crear el repositorio público y subir la rama principal:

```bash
gh repo create pixelforge-games-semana6 --public --source=. --remote=origin --push
```

Publicar el sitio en la rama `gh-pages`:

```bash
git checkout -b gh-pages
git push -u origin gh-pages
git checkout main
```

Después, en **Settings → Pages**, seleccionar la rama `gh-pages` y la carpeta `/ (root)`.
La URL queda como `https://<usuario>.github.io/pixelforge-games-semana6/`.

> Si el push devuelve un error 403, revisa que tu token de GitHub tenga el permiso
> **Contents: Read and write**, o usa SSH en lugar de HTTPS.

---

## Nota sobre el contenido

Los nombres de los videojuegos, los precios y los datos de la tienda son **ficticios** y fueron
creados para esta actividad académica. Las imágenes son SVG generados para el proyecto.
