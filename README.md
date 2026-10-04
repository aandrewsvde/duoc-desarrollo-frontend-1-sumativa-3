# PixelForge Games — eCommerce en React

Actividad **sumativa** de la Semana 8 — *Mejorando funcionalidades clave en el eCommerce con React*
Asignatura: **Desarrollo Frontend I (PFY2201)** — Experiencia 3
Autor: **Agustín Andrews**

eCommerce de videojuegos construido con **React 19** y **Vite 8**. La aplicación gestiona su estado
con `useState`, carga el catálogo con `useEffect` y usa **renderizado condicional** para adaptar la
interfaz a lo que está ocurriendo.

**Sitio en línea:** https://aandrewsvde.github.io/duoc-desarrollo-frontend-1-sumativa-3/

---

## Cómo ejecutarlo

```bash
npm install
npm run dev
```

Vite imprime la URL completa al arrancar. Como el `base` está fijado para GitHub Pages, la
aplicación se sirve en `http://localhost:5173/duoc-desarrollo-frontend-1-sumativa-3/`, la misma
ruta que en producción.

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera el build de producción en `dist/` |
| `npm run preview` | Sirve el build tal como quedará publicado |
| `npm run lint` | Revisa el código con oxlint |
| `npm run deploy` | Compila y publica en la rama `gh-pages` |

---

## Estructura del proyecto

```
.
├── index.html
├── vite.config.js              base de GitHub Pages
├── package.json                scripts, incluido deploy
├── public/
│   ├── data/productos.json     catálogo que carga useEffect
│   └── img/                    logotipo y portadas (SVG)
├── src/
│   ├── main.jsx                punto de entrada, importa Bootstrap
│   ├── App.jsx                 estado central y composición
│   ├── index.css               identidad visual sobre Bootstrap
│   ├── components/
│   │   ├── Header.jsx              barra superior y contador
│   │   ├── BuscadorProductos.jsx   filtros de búsqueda y categoría
│   │   ├── CatalogoProductos.jsx   grilla de tarjetas
│   │   ├── ProductoCard.jsx        tarjeta individual
│   │   ├── Carrito.jsx             panel del carrito
│   │   ├── EstadoCarga.jsx         carga y errores
│   │   └── Footer.jsx              pie de página
│   ├── hooks/
│   │   └── useProductos.js     hook propio: useEffect + fetch
│   └── utils/
│       └── formato.js          funciones puras reutilizables
└── capturas/
```

El estado vive en `App.jsx` y baja por **props**; los componentes hijos solo avisan de lo que el
usuario hizo. Así hay un único dueño de cada dato y no pueden desincronizarse.

---

## Dónde está cada cosa

### `useState` — gestión de estados

| Estado | Archivo | Para qué |
|---|---|---|
| `productos` | `hooks/useProductos.js` | La lista del catálogo |
| `cargando`, `error` | `hooks/useProductos.js` | Situación de la petición |
| `carrito` | `App.jsx` | Productos seleccionados |
| `busqueda` | `App.jsx` | Texto del buscador |
| `categoria` | `App.jsx` | Categoría filtrada |
| `carritoVisible` | `App.jsx` | Elemento interactivo: el botón que alterna entre "Ver carrito" y "Ocultar carrito" |

Las acciones del carrito nunca modifican el arreglo existente: crean uno nuevo con `map`, `filter`
o propagación. React compara referencias para detectar cambios, así que mutar el estado anterior no
provocaría un nuevo renderizado.

### `useEffect` — efectos secundarios

1. **`hooks/useProductos.js`** — carga el catálogo desde `public/data/productos.json` al montar el
   componente. Comprueba `response.ok`, valida que el JSON traiga un arreglo `productos` con los
   campos obligatorios, y guarda el resultado en el estado. Incluye función de limpieza para no
   actualizar el estado si el componente se desmonta con la petición en vuelo. Su array de
   dependencias contiene `intento`, que es cómo funciona el botón **Reintentar** sin recargar la
   página.
2. **`App.jsx`** — sincroniza el título de la pestaña con el carrito: pasa a `(3) PixelForge Games`
   cuando hay productos y vuelve al título original al vaciarlo. Depende de `unidades`.

### Renderizado condicional

| Dónde | Qué alterna |
|---|---|
| `ProductoCard.jsx` | "Agregar al carrito" ⇄ "En el carrito (n)", cambiando también el color del botón |
| `ProductoCard.jsx` | Insignia "Stock: n" ⇄ "Sin stock", con el botón deshabilitado |
| `Carrito.jsx` | Mensaje "Tu carrito está vacío" ⇄ lista de productos |
| `Header.jsx` | "Ver carrito" ⇄ "Ocultar carrito"; la insignia y el total solo aparecen si hay productos |
| `App.jsx` | Panel del carrito visible u oculto; catálogo o `EstadoCarga` |
| `EstadoCarga.jsx` | Indicador de carga ⇄ alerta de error con botón de reintento |
| `CatalogoProductos.jsx` | Grilla ⇄ aviso de "ningún producto coincide" |
| `BuscadorProductos.jsx` | El botón "Limpiar filtros" solo aparece si hay algún filtro activo |

---

## Publicación en GitHub Pages

El `base` de `vite.config.js` es lo que hace que funcione. Sin él, el despliegue sube bien pero el
navegador busca los archivos JS y CSS en la raíz del dominio y la página sale en blanco.

```js
base: '/duoc-desarrollo-frontend-1-sumativa-3/'
```

Para publicar:

```bash
npm run deploy
```

Ese script compila y sube el contenido de `dist/` a la rama `gh-pages`. Después, en
**Settings → Pages** del repositorio, la rama debe ser `gh-pages` y la carpeta `/ (root)`.

> Si se renombra el repositorio en GitHub, hay que actualizar `base` en `vite.config.js` y
> `homepage` en `package.json`, o el sitio publicado dejará de cargar.

> Si el push devuelve un error 403, revisa que tu token de GitHub tenga el permiso
> **Contents: Read and write**, o configura el remoto por SSH.

## Nota sobre el contenido

Los nombres de los videojuegos, los precios y los datos de la tienda son **ficticios** y fueron
creados para esta actividad académica. Las portadas son SVG generados para el proyecto.
