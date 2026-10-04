import { useState, useEffect, useMemo } from 'react'

import Header from './components/Header'
import BuscadorProductos from './components/BuscadorProductos'
import CatalogoProductos from './components/CatalogoProductos'
import EstadoCarga from './components/EstadoCarga'
import Carrito from './components/Carrito'
import Footer from './components/Footer'

import { useProductos } from './hooks/useProductos'
import { normalizar } from './utils/formato'

/**
 * App — Componente raíz de la aplicación.
 *
 * Concentra el estado que más de un componente necesita y lo reparte hacia
 * abajo por props. Los componentes hijos solo avisan de lo que el usuario
 * hizo; quien decide cómo cambia el estado es siempre este componente.
 *
 * Hooks que se usan aquí:
 *   - useProductos : hook propio que encapsula el useEffect del fetch.
 *   - useState     : carrito, búsqueda, categoría y visibilidad del carrito.
 *   - useEffect    : sincroniza el título de la pestaña con el carrito.
 *   - useMemo      : evita recalcular el filtrado en cada renderizado.
 */
function App() {

  // ---------------------------------------------------------------------
  // 1. ESTADO: catálogo cargado desde el JSON
  //    El hook useProductos contiene el useEffect que hace el fetch.
  // ---------------------------------------------------------------------
  const { productos, cargando, error, recargar } = useProductos()

  // ---------------------------------------------------------------------
  // 2. ESTADO: productos seleccionados en el carrito
  //    Cada línea tiene la forma { producto, cantidad }.
  // ---------------------------------------------------------------------
  const [carrito, setCarrito] = useState([])

  // ---------------------------------------------------------------------
  // 3. ESTADO: elementos interactivos de la interfaz
  // ---------------------------------------------------------------------
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('todas')
  // Controla el botón que alterna entre "Ver carrito" y "Ocultar carrito".
  const [carritoVisible, setCarritoVisible] = useState(false)

  // ---------------------------------------------------------------------
  // 4. VALORES DERIVADOS
  //    No se guardan en estado: se calculan desde el estado existente, que
  //    es la única fuente de verdad. Así no pueden quedar desincronizados.
  // ---------------------------------------------------------------------

  const unidades = carrito.reduce((suma, linea) => suma + linea.cantidad, 0)

  const total = carrito.reduce(
    (suma, linea) => suma + linea.producto.precio * linea.cantidad,
    0,
  )

  // Categorías únicas, tomadas de los propios datos.
  const categorias = useMemo(
    () => [...new Set(productos.map((p) => p.categoria))].sort(),
    [productos],
  )

  // Catálogo tras aplicar búsqueda y categoría. useMemo evita repetir este
  // trabajo cuando el componente se vuelve a renderizar por otra causa,
  // como abrir el carrito.
  const productosFiltrados = useMemo(() => {
    const texto = normalizar(busqueda)

    return productos.filter((producto) => {
      const coincideCategoria = categoria === 'todas' || producto.categoria === categoria
      const coincideTexto =
        texto === '' ||
        normalizar(producto.nombre).includes(texto) ||
        normalizar(producto.categoria).includes(texto) ||
        normalizar(producto.descripcion).includes(texto)

      return coincideCategoria && coincideTexto
    })
  }, [productos, busqueda, categoria])

  // ---------------------------------------------------------------------
  // 5. EFECTO SECUNDARIO: el título de la pestaña refleja el carrito
  //    Se ejecuta cada vez que cambia el número de unidades, gracias al
  //    array de dependencias.
  // ---------------------------------------------------------------------
  useEffect(() => {
    document.title =
      unidades > 0
        ? `(${unidades}) PixelForge Games`
        : 'PixelForge Games | Tienda de videojuegos'
  }, [unidades])

  // ---------------------------------------------------------------------
  // 6. ACCIONES SOBRE EL CARRITO
  //    Todas crean un arreglo nuevo en vez de modificar el existente: React
  //    detecta el cambio comparando referencias, así que mutar el estado
  //    anterior no provocaría un nuevo renderizado.
  // ---------------------------------------------------------------------

  /** Agrega un producto; si ya estaba, suma una unidad. */
  function agregarAlCarrito(producto) {
    setCarrito((actual) => {
      const existente = actual.find((linea) => linea.producto.id === producto.id)

      if (existente) {
        return actual.map((linea) =>
          linea.producto.id === producto.id
            ? { ...linea, cantidad: linea.cantidad + 1 }
            : linea,
        )
      }

      return [...actual, { producto, cantidad: 1 }]
    })
  }

  /** Suma una unidad a un producto que ya está en el carrito. */
  function sumarUnidad(id) {
    setCarrito((actual) =>
      actual.map((linea) =>
        linea.producto.id === id ? { ...linea, cantidad: linea.cantidad + 1 } : linea,
      ),
    )
  }

  /** Resta una unidad y elimina la línea si llega a cero. */
  function restarUnidad(id) {
    setCarrito((actual) =>
      actual
        .map((linea) =>
          linea.producto.id === id ? { ...linea, cantidad: linea.cantidad - 1 } : linea,
        )
        .filter((linea) => linea.cantidad > 0),
    )
  }

  /** Quita un producto del carrito sin importar su cantidad. */
  function eliminarDelCarrito(id) {
    setCarrito((actual) => actual.filter((linea) => linea.producto.id !== id))
  }

  /** Deja el carrito sin productos. */
  function vaciarCarrito() {
    setCarrito([])
  }

  /** Unidades de un producto concreto, para pintar el estado del botón. */
  function cantidadEnCarrito(id) {
    const linea = carrito.find((l) => l.producto.id === id)
    return linea ? linea.cantidad : 0
  }

  /** Restablece los filtros del catálogo. */
  function limpiarFiltros() {
    setBusqueda('')
    setCategoria('todas')
  }

  // ---------------------------------------------------------------------
  // 7. INTERFAZ
  // ---------------------------------------------------------------------
  return (
    <div className="d-flex flex-column min-vh-100">

      <Header
        unidades={unidades}
        total={total}
        carritoVisible={carritoVisible}
        onToggleCarrito={() => setCarritoVisible((v) => !v)}
      />

      <main className="container flex-grow-1 py-4">

        <h1 className="h2 fw-bold text-marca">Catálogo de videojuegos</h1>
        <p className="text-secondary">
          Los productos se cargan dinámicamente desde un archivo JSON con
          <code> useEffect</code>.
        </p>

        {/* RENDERIZADO CONDICIONAL: el panel del carrito aparece solo cuando
            el usuario lo pide con el botón de la barra superior. */}
        {carritoVisible && (
          <div className="mb-4">
            <Carrito
              lineas={carrito}
              unidades={unidades}
              total={total}
              onSumar={sumarUnidad}
              onRestar={restarUnidad}
              onEliminar={eliminarDelCarrito}
              onVaciar={vaciarCarrito}
            />
          </div>
        )}

        {/* RENDERIZADO CONDICIONAL: mientras carga o si hubo un error se
            muestra EstadoCarga; solo cuando hay datos se dibuja el catálogo. */}
        {cargando || error ? (
          <EstadoCarga cargando={cargando} error={error} onReintentar={recargar} />
        ) : (
          <>
            <BuscadorProductos
              busqueda={busqueda}
              onBuscar={setBusqueda}
              categoria={categoria}
              onCategoria={setCategoria}
              categorias={categorias}
              totalMostrados={productosFiltrados.length}
              totalCatalogo={productos.length}
            />

            <CatalogoProductos
              productos={productosFiltrados}
              onAgregar={agregarAlCarrito}
              cantidadEnCarrito={cantidadEnCarrito}
              onLimpiar={limpiarFiltros}
            />
          </>
        )}

      </main>

      <Footer />
    </div>
  )
}

export default App
