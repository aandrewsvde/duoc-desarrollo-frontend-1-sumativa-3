/**
 * EstadoCarga — Mensajes de carga, error y lista vacía.
 *
 * Centraliza en un solo lugar los tres estados "no felices" del catálogo, en
 * vez de repetir el mismo JSX en cada componente que los necesite.
 *
 * @param {boolean}  props.cargando   Si la petición está en curso.
 * @param {string}   props.error      Mensaje de error, o null si no hubo.
 * @param {Function} props.onReintentar Vuelve a lanzar la carga.
 */
function EstadoCarga({ cargando, error, onReintentar }) {

  // RENDERIZADO CONDICIONAL: mientras carga, un indicador de progreso.
  if (cargando) {
    return (
      <div className="text-center py-5" role="status">
        <div className="spinner-border text-warning" aria-hidden="true"></div>
        <p className="mt-3 text-secondary mb-0">Cargando el catálogo…</p>
      </div>
    )
  }

  // RENDERIZADO CONDICIONAL: si algo falló, un mensaje claro con la causa
  // probable y un botón para reintentar sin recargar la página.
  if (error) {
    return (
      <div className="alert alert-warning shadow-sm" role="alert">
        <h2 className="h5 alert-heading">No pudimos cargar el catálogo</h2>
        <p className="mb-2">
          Los productos se leen desde un archivo JSON y la petición no llegó a
          destino.
        </p>
        <p className="mb-3 small text-secondary">Detalle técnico: {error}</p>
        <button type="button" className="btn btn-warning fw-semibold" onClick={onReintentar}>
          Reintentar
        </button>
      </div>
    )
  }

  // Si no hay nada que informar, el componente no renderiza nada.
  return null
}

export default EstadoCarga
