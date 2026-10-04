/**
 * Footer — Pie de página.
 *
 * Componente estático sin props ni estado. Se mantiene aparte para que App
 * quede centrado en la lógica y no en el marcado.
 */
function Footer() {
  return (
    <footer className="bg-marca text-light py-4 mt-5">
      <div className="container">
        <div className="row g-4">

          <div className="col-md-6">
            <h2 className="h6 text-warning">PixelForge Games</h2>
            <p className="small mb-1">Tienda de videojuegos físicos y digitales.</p>
            <p className="small text-white-50 mb-0">
              Proyecto académico de Desarrollo Frontend I (PFY2201), Semana 8.
            </p>
          </div>

          <div className="col-md-6">
            <h2 className="h6 text-warning">Contacto</h2>
            <address className="small mb-0">
              Avenida Providencia 1234, oficina 502, Santiago<br />
              <a className="link-light" href="mailto:contacto@pixelforgegames.cl">
                contacto@pixelforgegames.cl
              </a>
            </address>
          </div>

        </div>

        <hr className="border-secondary my-3" />

        <p className="text-center small text-white-50 mb-0">
          Copyright © 2026 PixelForge Games · Sitio desarrollado por Agustín Andrews.
        </p>
      </div>
    </footer>
  )
}

export default Footer
