import { formatearPrecio, rutaPublica } from '../utils/formato'

/**
 * Header — Barra de navegación superior.
 *
 * Es un componente de presentación: no tiene estado propio, todo lo recibe
 * por PROPS desde App. Así puede reutilizarse y es fácil de razonar.
 *
 * @param {number}   props.unidades        Unidades totales en el carrito.
 * @param {number}   props.total           Monto total del carrito.
 * @param {boolean}  props.carritoVisible  Si el panel del carrito está abierto.
 * @param {Function} props.onToggleCarrito Alterna la visibilidad del carrito.
 */
function Header({ unidades, total, carritoVisible, onToggleCarrito }) {
  return (
    <header>
      <nav className="navbar navbar-expand-sm navbar-dark bg-marca sticky-top shadow">
        <div className="container">

          <span className="navbar-brand d-flex align-items-center gap-2 mb-0">
            <img
              src={rutaPublica('img/logo-pixelforge.svg')}
              alt="Logotipo de PixelForge Games"
              width="36"
              height="36"
            />
            <span className="fw-bold">PixelForge Games</span>
          </span>

          <div className="d-flex align-items-center gap-3">

            {/* RENDERIZADO CONDICIONAL: el total solo aparece si hay productos.
                El operador && muestra el elemento únicamente cuando la
                condición es verdadera. */}
            {unidades > 0 && (
              <span className="text-warning fw-semibold d-none d-sm-inline">
                {formatearPrecio(total)}
              </span>
            )}

            {/* RENDERIZADO CONDICIONAL: el botón cambia de texto y de estilo
                según si el carrito está abierto o cerrado. */}
            <button
              type="button"
              className={`btn position-relative ${carritoVisible ? 'btn-warning' : 'btn-outline-light'}`}
              onClick={onToggleCarrito}
              aria-expanded={carritoVisible}
              aria-controls="panel-carrito"
            >
              {carritoVisible ? 'Ocultar carrito' : 'Ver carrito'}

              {unidades > 0 && (
                <span
                  className="badge rounded-pill text-bg-danger position-absolute top-0 start-100 translate-middle"
                  aria-label={`${unidades} unidades en el carrito`}
                >
                  {unidades}
                </span>
              )}
            </button>
          </div>

        </div>
      </nav>
    </header>
  )
}

export default Header
