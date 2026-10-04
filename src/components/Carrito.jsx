import { formatearPrecio } from '../utils/formato'

/**
 * Carrito — Panel con el detalle de los productos seleccionados.
 *
 * Muestra una línea por producto, con los controles para ajustar cantidades.
 * El estado del carrito vive en App; aquí solo se dibuja y se avisa hacia
 * arriba de lo que el usuario quiere hacer.
 *
 * @param {Array}    props.lineas      Líneas del carrito: { producto, cantidad }.
 * @param {number}   props.unidades    Unidades totales.
 * @param {number}   props.total       Monto total.
 * @param {Function} props.onSumar     Suma una unidad de un producto.
 * @param {Function} props.onRestar    Resta una unidad de un producto.
 * @param {Function} props.onEliminar  Quita por completo un producto.
 * @param {Function} props.onVaciar    Vacía el carrito.
 */
function Carrito({ lineas, unidades, total, onSumar, onRestar, onEliminar, onVaciar }) {

  // RENDERIZADO CONDICIONAL: el mensaje de carrito vacío que pide la
  // actividad. Si no hay nada, se corta aquí y no se dibuja la lista.
  if (lineas.length === 0) {
    return (
      <section id="panel-carrito" className="card shadow-sm" aria-label="Carrito de compras">
        <div className="card-body text-center py-5">
          <p className="h5 mb-2">Tu carrito está vacío</p>
          <p className="text-secondary mb-0">
            Agrega productos desde el catálogo y aparecerán aquí.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="panel-carrito" className="card shadow-sm" aria-label="Carrito de compras">

      <div className="card-header bg-marca text-light d-flex justify-content-between align-items-center">
        <h2 className="h5 mb-0">Carrito de compras</h2>
        <span className="badge text-bg-warning">{unidades} unidad(es)</span>
      </div>

      <ul className="list-group list-group-flush">
        {lineas.map(({ producto, cantidad }) => (
          <li key={producto.id} className="list-group-item">
            <div className="d-flex justify-content-between align-items-start gap-3">

              <div>
                <p className="fw-semibold mb-1">{producto.nombre}</p>
                <p className="small text-secondary mb-0">
                  {cantidad} × {formatearPrecio(producto.precio)}
                </p>
              </div>

              <div className="text-end">
                <p className="fw-bold mb-1">
                  {formatearPrecio(producto.precio * cantidad)}
                </p>
                <div className="btn-group btn-group-sm" role="group"
                     aria-label={`Ajustar cantidad de ${producto.nombre}`}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => onRestar(producto.id)}
                    aria-label={`Quitar una unidad de ${producto.nombre}`}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => onSumar(producto.id)}
                    aria-label={`Agregar una unidad de ${producto.nombre}`}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => onEliminar(producto.id)}
                    aria-label={`Eliminar ${producto.nombre} del carrito`}
                  >
                    Quitar
                  </button>
                </div>
              </div>

            </div>
          </li>
        ))}
      </ul>

      <div className="card-footer">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="fw-semibold">Total</span>
          <span className="h4 fw-bold text-exito mb-0">{formatearPrecio(total)}</span>
        </div>
        <button type="button" className="btn btn-outline-danger w-100" onClick={onVaciar}>
          Vaciar carrito
        </button>
      </div>

    </section>
  )
}

export default Carrito
