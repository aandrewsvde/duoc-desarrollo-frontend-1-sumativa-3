import ProductoCard from './ProductoCard'

/**
 * CatalogoProductos — Grilla responsiva de tarjetas.
 *
 * Solo se ocupa de recorrer la lista que recibe y delegar cada elemento a
 * ProductoCard. Toda la lógica de filtrado ocurre antes, en App.
 *
 * @param {Array}    props.productos    Productos que deben mostrarse.
 * @param {Function} props.onAgregar    Se llama con el producto al agregarlo.
 * @param {Function} props.cantidadEnCarrito Devuelve las unidades de un id.
 * @param {Function} props.onLimpiar    Restablece los filtros.
 */
function CatalogoProductos({ productos, onAgregar, cantidadEnCarrito, onLimpiar }) {

  // RENDERIZADO CONDICIONAL: si ningún producto pasa los filtros, en vez de
  // una grilla vacía se muestra una explicación y una salida.
  if (productos.length === 0) {
    return (
      <div className="alert alert-info text-center" role="status">
        <p className="fw-semibold mb-2">Ningún producto coincide con tu búsqueda.</p>
        <p className="small mb-3">Prueba con otro término o revisa el catálogo completo.</p>
        <button type="button" className="btn btn-outline-primary" onClick={onLimpiar}>
          Ver todo el catálogo
        </button>
      </div>
    )
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {productos.map((producto) => {
        const cantidad = cantidadEnCarrito(producto.id)
        return (
          <ProductoCard
            // key ayuda a React a identificar cada tarjeta entre renderizados.
            key={producto.id}
            producto={producto}
            enCarrito={cantidad > 0}
            cantidad={cantidad}
            onAgregar={onAgregar}
          />
        )
      })}
    </div>
  )
}

export default CatalogoProductos
