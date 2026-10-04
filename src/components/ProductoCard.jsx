import { formatearPrecio, rutaPublica } from '../utils/formato'

/**
 * ProductoCard — Tarjeta de un producto del catálogo.
 *
 * Recibe todo por PROPS y no guarda estado propio. El mismo componente sirve
 * para los seis productos, que es justamente la ventaja de los componentes
 * reutilizables.
 *
 * @param {object}   props.producto   Datos del producto a mostrar.
 * @param {boolean}  props.enCarrito  Si el producto ya está en el carrito.
 * @param {number}   props.cantidad   Unidades de este producto en el carrito.
 * @param {Function} props.onAgregar  Se llama con el producto al agregarlo.
 */
function ProductoCard({ producto, enCarrito, cantidad, onAgregar }) {
  const sinStock = producto.stock === 0

  return (
    <div className="col">
      <article className="card h-100 shadow-sm tarjeta-producto">

        <img
          src={rutaPublica(producto.imagen)}
          className="card-img-top"
          alt={`Portada del videojuego ${producto.nombre}`}
          loading="lazy"
        />

        <div className="card-body d-flex flex-column">

          <p className="mb-2">
            <span className="badge text-bg-secondary">{producto.categoria}</span>{' '}
            {/* RENDERIZADO CONDICIONAL: la insignia de stock cambia de texto
                y de color según haya o no unidades disponibles. */}
            {sinStock ? (
              <span className="badge text-bg-danger">Sin stock</span>
            ) : (
              <span className="badge text-bg-success">Stock: {producto.stock}</span>
            )}
          </p>

          <h3 className="card-title h5">{producto.nombre}</h3>
          <p className="card-text small text-secondary">{producto.descripcion}</p>

          <p className="h4 fw-bold text-exito mt-auto mb-3">
            {formatearPrecio(producto.precio)}
          </p>

          {/* RENDERIZADO CONDICIONAL: el botón "Agregar al carrito" se
              convierte en "En el carrito" cuando el producto ya fue agregado,
              cambiando también su color. Es el caso que pide la actividad. */}
          <button
            type="button"
            className={`btn w-100 fw-semibold ${enCarrito ? 'btn-success' : 'btn-warning'}`}
            onClick={() => onAgregar(producto)}
            disabled={sinStock}
          >
            {sinStock
              ? 'No disponible'
              : enCarrito
                ? `En el carrito (${cantidad}) · Agregar otro`
                : 'Agregar al carrito'}
          </button>

        </div>
      </article>
    </div>
  )
}

export default ProductoCard
