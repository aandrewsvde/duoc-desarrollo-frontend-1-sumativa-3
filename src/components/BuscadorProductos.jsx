/**
 * BuscadorProductos — Filtros del catálogo.
 *
 * Los campos son "controlados": su valor lo manda el estado que vive en App,
 * y cada cambio se comunica hacia arriba por PROPS. Así el estado del filtro
 * tiene un único dueño y no puede desincronizarse.
 *
 * @param {string}   props.busqueda        Texto buscado.
 * @param {Function} props.onBuscar        Se llama con el nuevo texto.
 * @param {string}   props.categoria       Categoría seleccionada.
 * @param {Function} props.onCategoria     Se llama con la nueva categoría.
 * @param {string[]} props.categorias      Categorías disponibles.
 * @param {number}   props.totalMostrados  Productos visibles tras filtrar.
 * @param {number}   props.totalCatalogo   Productos del catálogo completo.
 */
function BuscadorProductos({
  busqueda,
  onBuscar,
  categoria,
  onCategoria,
  categorias,
  totalMostrados,
  totalCatalogo,
}) {
  const hayFiltros = busqueda !== '' || categoria !== 'todas'

  return (
    <section className="row g-3 align-items-end mb-4" aria-label="Filtros del catálogo">

      <div className="col-12 col-md-5">
        <label className="form-label small fw-semibold" htmlFor="campo-busqueda">
          Buscar producto
        </label>
        <input
          id="campo-busqueda"
          type="search"
          className="form-control"
          placeholder="Escribe el nombre de un juego…"
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="col-12 col-md-4">
        <label className="form-label small fw-semibold" htmlFor="filtro-categoria">
          Categoría
        </label>
        <select
          id="filtro-categoria"
          className="form-select"
          value={categoria}
          onChange={(e) => onCategoria(e.target.value)}
        >
          <option value="todas">Todas las categorías</option>
          {/* Las opciones se generan desde los datos, no se escriben a mano. */}
          {categorias.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="col-12 col-md-3">
        {/* RENDERIZADO CONDICIONAL: el botón de limpiar solo aparece cuando
            hay algún filtro activo. */}
        {hayFiltros && (
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => {
              onBuscar('')
              onCategoria('todas')
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      <div className="col-12">
        <p className="text-secondary small mb-0" aria-live="polite">
          Mostrando {totalMostrados} de {totalCatalogo} producto(s).
        </p>
      </div>

    </section>
  )
}

export default BuscadorProductos
