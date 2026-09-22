/* ==========================================================================
   app.js — Capa de interfaz: Fetch API, manipulación del DOM y eventos
   Asignatura : Desarrollo Frontend I (PFY2201) — Experiencia 2, Semana 6
   Autor      : Agustín Andrews

   Responsabilidades de este archivo:
     1. Cargar el catálogo desde un archivo JSON local con la Fetch API.
     2. Validar la respuesta y mostrar mensajes de error amigables.
     3. Construir el catálogo en el DOM a partir de los datos recibidos.
     4. Gestionar los eventos del usuario (click y submit, entre otros).
     5. Mantener sincronizadas las tres vistas del carrito.

   La lógica del carrito vive en carrito.js; aquí solo se la consume.
   ========================================================================== */

(function () {
    'use strict';

    /* ----------------------------------------------------------------------
       1. CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
       ---------------------------------------------------------------------- */

    const RUTA_CATALOGO = 'assets/data/productos.json';

    /** Catálogo completo tal como llegó del JSON. Es la fuente de verdad. */
    let catalogo = [];

    /** Filtros activos. El catálogo visible se deriva siempre de aquí. */
    const filtros = {
        texto: '',
        categoria: 'todas'
    };

    /** Referencias a los nodos del DOM que se usan más de una vez. */
    const dom = {
        grilla: document.getElementById('grillaProductos'),
        cargador: document.getElementById('cargador'),
        zonaError: document.getElementById('zonaError'),
        estadoCatalogo: document.getElementById('estadoCatalogo'),
        filtroCategoria: document.getElementById('filtroCategoria'),
        menuCategorias: document.getElementById('menuCategorias'),
        formBusqueda: document.getElementById('formBusqueda'),
        campoBusqueda: document.getElementById('campoBusqueda'),
        contadorCarrito: document.getElementById('contadorCarrito'),
        listaCarrito: document.getElementById('listaCarrito'),
        mensajeCarritoVacio: document.getElementById('mensajeCarritoVacio'),
        totalCarrito: document.getElementById('totalCarrito'),
        listaResumen: document.getElementById('listaResumen'),
        mensajeResumen: document.getElementById('mensajeResumen'),
        totalResumen: document.getElementById('totalResumen'),
        unidadesResumen: document.getElementById('unidadesResumen'),
        btnVaciarCarrito: document.getElementById('btnVaciarCarrito'),
        btnPagar: document.getElementById('btnPagar'),
        modalProducto: document.getElementById('modalProducto'),
        cuerpoModalProducto: document.getElementById('cuerpoModalProducto'),
        tituloModalProducto: document.getElementById('tituloModalProducto'),
        btnAgregarDesdeModal: document.getElementById('btnAgregarDesdeModal'),
        zonaToasts: document.getElementById('zonaToasts')
    };

    /** Producto que se está mostrando en el modal de detalle. */
    let productoEnModal = null;


    /* ----------------------------------------------------------------------
       2. CARGA DE DATOS CON FETCH API Y GESTIÓN DE ERRORES
       ---------------------------------------------------------------------- */

    /**
     * Pide el catálogo al archivo JSON local usando la Fetch API.
     * Devuelve una promesa que resuelve con el arreglo de productos ya
     * validado, o que se rechaza con un error de mensaje claro.
     * @returns {Promise<Array<object>>}
     */
    function pedirCatalogo() {
        return fetch(RUTA_CATALOGO)
            .then(function (respuesta) {
                // fetch solo rechaza ante fallos de red: un 404 llega aquí
                // como respuesta "exitosa", así que hay que comprobarlo.
                if (!respuesta.ok) {
                    throw new Error(
                        'El servidor respondió ' + respuesta.status + ' (' + respuesta.statusText + ').'
                    );
                }
                return respuesta.json();
            })
            .then(function (datos) {
                return validarCatalogo(datos);
            });
    }

    /**
     * Comprueba que el JSON recibido tenga la forma esperada antes de usarlo.
     * Evita que un archivo mal formado rompa el renderizado más adelante.
     * @param {object} datos Contenido del archivo JSON.
     * @returns {Array<object>} Productos válidos.
     */
    function validarCatalogo(datos) {
        if (!datos || !Array.isArray(datos.productos)) {
            throw new Error('El archivo JSON no contiene un arreglo "productos".');
        }

        if (datos.productos.length === 0) {
            throw new Error('El catálogo llegó vacío: no hay productos que mostrar.');
        }

        // Se descarta cualquier producto al que le falten campos obligatorios.
        const validos = datos.productos.filter(function (producto) {
            return producto
                && typeof producto.id === 'number'
                && typeof producto.nombre === 'string'
                && typeof producto.precio === 'number';
        });

        if (validos.length === 0) {
            throw new Error('Ningún producto del archivo tiene el formato esperado.');
        }

        return validos;
    }

    /**
     * Inicia la carga del catálogo y conecta el resultado con la interfaz.
     * Es la función que se vuelve a llamar cuando el usuario reintenta.
     */
    function cargarCatalogo() {
        mostrarCargador(true);
        ocultarError();

        pedirCatalogo()
            .then(function (productos) {
                catalogo = productos;
                poblarFiltroCategorias(catalogo);
                renderizarCatalogo();
            })
            .catch(function (error) {
                // Se registra el detalle técnico en consola para depurar...
                console.error('No fue posible cargar el catálogo:', error);
                // ...y se muestra al usuario un mensaje comprensible.
                mostrarError(error);
            })
            .finally(function () {
                mostrarCargador(false);
            });
    }

    /**
     * Muestra u oculta el indicador de carga.
     * @param {boolean} visible
     */
    function mostrarCargador(visible) {
        dom.cargador.classList.toggle('d-none', !visible);
    }

    /**
     * Presenta un mensaje de error amigable, con la causa probable y un
     * botón para reintentar la carga.
     * @param {Error} error Error capturado durante la carga.
     */
    function mostrarError(error) {
        // Abrir el archivo con doble clic (protocolo file://) impide que el
        // navegador lea el JSON por seguridad. Es la causa más habitual, así
        // que se explica de forma explícita en lugar de dar un error genérico.
        const esArchivoLocal = window.location.protocol === 'file:';

        const explicacion = esArchivoLocal
            ? 'Abriste la página con doble clic. Por seguridad, el navegador no permite leer archivos JSON así.'
            : 'No pudimos leer el archivo del catálogo (' + RUTA_CATALOGO + ').';

        const solucion = esArchivoLocal
            ? 'Levanta un servidor local en la carpeta del proyecto (<code>python3 -m http.server 8000</code>) y abre <code>http://localhost:8000</code>.'
            : 'Revisa que el archivo exista y vuelve a intentarlo.';

        dom.zonaError.className = 'alert alert-warning border-warning shadow-sm';
        dom.zonaError.innerHTML =
            '<h2 class="h5 alert-heading">No pudimos cargar el catálogo</h2>' +
            '<p class="mb-2">' + explicacion + '</p>' +
            '<p class="mb-2 small">' + solucion + '</p>' +
            '<p class="mb-3 small text-secondary">Detalle técnico: ' + error.message + '</p>' +
            '<button class="btn btn-warning fw-semibold" type="button" id="btnReintentar">Reintentar</button>';

        dom.zonaError.classList.remove('d-none');
        dom.estadoCatalogo.textContent = 'El catálogo no está disponible en este momento.';
        dom.grilla.innerHTML = '';

        // El botón se crea recién ahora, por eso el listener se asocia aquí.
        document.getElementById('btnReintentar')
            .addEventListener('click', cargarCatalogo);
    }

    /** Oculta la zona de errores. */
    function ocultarError() {
        dom.zonaError.classList.add('d-none');
        dom.zonaError.innerHTML = '';
    }


    /* ----------------------------------------------------------------------
       3. CONSTRUCCIÓN DEL CATÁLOGO EN EL DOM
       ---------------------------------------------------------------------- */

    /**
     * Aplica los filtros activos sobre el catálogo completo.
     * @returns {Array<object>} Productos que deben mostrarse.
     */
    function filtrarProductos() {
        const texto = Formato.normalizar(filtros.texto);

        return catalogo.filter(function (producto) {
            const coincideCategoria = filtros.categoria === 'todas'
                || producto.categoria === filtros.categoria;

            const coincideTexto = texto === ''
                || Formato.normalizar(producto.nombre).includes(texto)
                || Formato.normalizar(producto.categoria).includes(texto)
                || Formato.normalizar(producto.descripcion).includes(texto);

            return coincideCategoria && coincideTexto;
        });
    }

    /**
     * Crea la tarjeta (card de Bootstrap) de un producto.
     * Se construye con createElement en lugar de innerHTML para que el
     * contenido del JSON nunca se interprete como HTML.
     * @param {object} producto
     * @returns {HTMLElement} Columna lista para insertarse en la grilla.
     */
    function crearTarjeta(producto) {
        const columna = document.createElement('div');
        columna.className = 'col';

        const tarjeta = document.createElement('article');
        tarjeta.className = 'card h-100 shadow-sm tarjeta-producto';

        // --- Imagen de portada ---
        const imagen = document.createElement('img');
        imagen.src = producto.imagen;
        imagen.className = 'card-img-top';
        imagen.alt = 'Portada del videojuego ' + producto.nombre;
        imagen.loading = 'lazy';
        tarjeta.appendChild(imagen);

        // --- Cuerpo de la tarjeta ---
        const cuerpo = document.createElement('div');
        cuerpo.className = 'card-body d-flex flex-column';

        const etiquetas = document.createElement('p');
        etiquetas.className = 'mb-2';
        etiquetas.innerHTML =
            '<span class="badge text-bg-secondary">' + producto.categoria + '</span> ' +
            (producto.stock > 0
                ? '<span class="badge text-bg-success">Stock: ' + producto.stock + '</span>'
                : '<span class="badge text-bg-danger">Sin stock</span>');
        cuerpo.appendChild(etiquetas);

        const titulo = document.createElement('h3');
        titulo.className = 'card-title h5';
        titulo.textContent = producto.nombre;
        cuerpo.appendChild(titulo);

        const descripcion = document.createElement('p');
        descripcion.className = 'card-text small text-secondary';
        descripcion.textContent = producto.descripcion;
        cuerpo.appendChild(descripcion);

        const precio = document.createElement('p');
        precio.className = 'h4 fw-bold text-exito mt-auto mb-3';
        precio.textContent = Formato.precio(producto.precio);
        cuerpo.appendChild(precio);

        // --- Botones de acción ---
        const acciones = document.createElement('div');
        acciones.className = 'd-grid gap-2';

        const btnAgregar = document.createElement('button');
        btnAgregar.type = 'button';
        btnAgregar.className = 'btn btn-warning fw-semibold';
        btnAgregar.textContent = 'Agregar al carrito';
        // data-* permite identificar el producto desde el manejador de click.
        btnAgregar.dataset.accion = 'agregar';
        btnAgregar.dataset.id = producto.id;
        btnAgregar.disabled = producto.stock === 0;

        const btnDetalle = document.createElement('button');
        btnDetalle.type = 'button';
        btnDetalle.className = 'btn btn-outline-secondary';
        btnDetalle.textContent = 'Ver detalle';
        btnDetalle.dataset.accion = 'detalle';
        btnDetalle.dataset.id = producto.id;

        acciones.appendChild(btnAgregar);
        acciones.appendChild(btnDetalle);
        cuerpo.appendChild(acciones);

        tarjeta.appendChild(cuerpo);
        columna.appendChild(tarjeta);

        return columna;
    }

    /**
     * Vuelve a dibujar la grilla de productos según los filtros activos.
     * Usa un DocumentFragment para insertar todas las tarjetas en una sola
     * operación sobre el DOM, en vez de una por una.
     */
    function renderizarCatalogo() {
        const visibles = filtrarProductos();

        dom.grilla.innerHTML = '';

        if (visibles.length === 0) {
            dom.estadoCatalogo.textContent = 'Ningún producto coincide con tu búsqueda.';
            dom.grilla.appendChild(crearAvisoSinResultados());
            return;
        }

        const fragmento = document.createDocumentFragment();
        visibles.forEach(function (producto) {
            fragmento.appendChild(crearTarjeta(producto));
        });
        dom.grilla.appendChild(fragmento);

        dom.estadoCatalogo.textContent =
            'Mostrando ' + visibles.length + ' de ' + catalogo.length + ' producto(s).';
    }

    /**
     * Construye el aviso que se muestra cuando ningún producto coincide.
     * @returns {HTMLElement}
     */
    function crearAvisoSinResultados() {
        const columna = document.createElement('div');
        columna.className = 'col-12';
        columna.innerHTML =
            '<div class="alert alert-info text-center mb-0">' +
            '<p class="mb-2 fw-semibold">No encontramos productos con esos criterios.</p>' +
            '<p class="mb-3 small">Prueba con otro término o revisa el catálogo completo.</p>' +
            '<button class="btn btn-outline-primary" type="button" id="btnLimpiarFiltros">Ver todo el catálogo</button>' +
            '</div>';

        columna.querySelector('#btnLimpiarFiltros')
            .addEventListener('click', limpiarFiltros);

        return columna;
    }

    /**
     * Rellena el <select> de categorías con los valores presentes en el JSON,
     * en lugar de dejarlos escritos a mano en el HTML.
     * @param {Array<object>} productos
     */
    function poblarFiltroCategorias(productos) {
        const categorias = [...new Set(productos.map(function (p) {
            return p.categoria;
        }))].sort();

        categorias.forEach(function (categoria) {
            const opcion = document.createElement('option');
            opcion.value = categoria;
            opcion.textContent = categoria;
            dom.filtroCategoria.appendChild(opcion);
        });
    }

    /** Restablece búsqueda y categoría, y vuelve a dibujar el catálogo. */
    function limpiarFiltros() {
        filtros.texto = '';
        filtros.categoria = 'todas';
        dom.campoBusqueda.value = '';
        dom.filtroCategoria.value = 'todas';
        renderizarCatalogo();
    }


    /* ----------------------------------------------------------------------
       4. VISTAS DEL CARRITO
       Una sola función redibuja las tres proyecciones (contador, panel
       lateral y resumen de la página) a partir del mismo estado.
       ---------------------------------------------------------------------- */

    /** Redibuja todas las vistas del carrito. */
    function renderizarCarrito() {
        const lineas = Carrito.obtenerLineas();
        const unidades = Carrito.contarUnidades();
        const total = Carrito.calcularTotal();

        actualizarContador(unidades);
        renderizarPanelCarrito(lineas, total);
        renderizarResumen(lineas, unidades, total);
    }

    /**
     * Actualiza la insignia con el número de unidades en la barra superior.
     * @param {number} unidades
     */
    function actualizarContador(unidades) {
        dom.contadorCarrito.textContent = unidades;
        dom.contadorCarrito.classList.toggle('d-none', unidades === 0);
    }

    /**
     * Dibuja el detalle del carrito dentro del panel lateral.
     * @param {Array<object>} lineas
     * @param {number} total
     */
    function renderizarPanelCarrito(lineas, total) {
        dom.listaCarrito.innerHTML = '';
        dom.mensajeCarritoVacio.classList.toggle('d-none', lineas.length > 0);
        dom.btnVaciarCarrito.disabled = lineas.length === 0;
        dom.btnPagar.disabled = lineas.length === 0;
        dom.totalCarrito.textContent = Formato.precio(total);

        const fragmento = document.createDocumentFragment();

        lineas.forEach(function (linea) {
            const item = document.createElement('li');
            item.className = 'list-group-item px-0';

            const fila = document.createElement('div');
            fila.className = 'd-flex justify-content-between align-items-start gap-2';

            const info = document.createElement('div');
            const nombre = document.createElement('p');
            nombre.className = 'fw-semibold mb-1';
            nombre.textContent = linea.producto.nombre;
            const detalle = document.createElement('p');
            detalle.className = 'small text-secondary mb-0';
            detalle.textContent = linea.cantidad + ' x ' + Formato.precio(linea.producto.precio);
            info.appendChild(nombre);
            info.appendChild(detalle);

            const derecha = document.createElement('div');
            derecha.className = 'text-end';
            const subtotal = document.createElement('p');
            subtotal.className = 'fw-bold mb-1';
            subtotal.textContent = Formato.precio(linea.producto.precio * linea.cantidad);
            derecha.appendChild(subtotal);

            const grupo = document.createElement('div');
            grupo.className = 'btn-group btn-group-sm';
            grupo.setAttribute('role', 'group');
            grupo.setAttribute('aria-label', 'Ajustar cantidad de ' + linea.producto.nombre);
            grupo.appendChild(crearBotonCarrito('−', 'restar', linea.producto.id, 'btn-outline-secondary', 'Quitar una unidad de ' + linea.producto.nombre));
            grupo.appendChild(crearBotonCarrito('+', 'sumar', linea.producto.id, 'btn-outline-secondary', 'Agregar una unidad de ' + linea.producto.nombre));
            grupo.appendChild(crearBotonCarrito('Quitar', 'eliminar', linea.producto.id, 'btn-outline-danger', 'Eliminar ' + linea.producto.nombre + ' del carrito'));
            derecha.appendChild(grupo);

            fila.appendChild(info);
            fila.appendChild(derecha);
            item.appendChild(fila);
            fragmento.appendChild(item);
        });

        dom.listaCarrito.appendChild(fragmento);
    }

    /**
     * Fábrica de botones para las líneas del carrito.
     * @param {string} texto Texto visible del botón.
     * @param {string} accion Valor de data-accion.
     * @param {number} id Identificador del producto.
     * @param {string} estilo Clase de color de Bootstrap.
     * @param {string} etiqueta Texto accesible del botón.
     * @returns {HTMLButtonElement}
     */
    function crearBotonCarrito(texto, accion, id, estilo, etiqueta) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn ' + estilo;
        boton.textContent = texto;
        boton.dataset.accion = accion;
        boton.dataset.id = id;
        boton.setAttribute('aria-label', etiqueta);
        return boton;
    }

    /**
     * Dibuja el resumen del carrito en la sección fija de la página.
     * @param {Array<object>} lineas
     * @param {number} unidades
     * @param {number} total
     */
    function renderizarResumen(lineas, unidades, total) {
        dom.listaResumen.innerHTML = '';
        dom.totalResumen.textContent = Formato.precio(total);
        dom.unidadesResumen.textContent = unidades;

        if (lineas.length === 0) {
            dom.mensajeResumen.textContent = 'Tu carrito está vacío. Agrega productos desde el catálogo.';
            return;
        }

        dom.mensajeResumen.textContent =
            'Llevas ' + lineas.length + ' producto(s) distinto(s), ' + unidades + ' unidad(es) en total.';

        const fragmento = document.createDocumentFragment();

        lineas.forEach(function (linea) {
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';

            const izquierda = document.createElement('span');
            izquierda.textContent = linea.producto.nombre;

            const derecha = document.createElement('span');
            derecha.className = 'text-nowrap';
            derecha.innerHTML =
                '<span class="badge text-bg-secondary me-2">x' + linea.cantidad + '</span>' +
                '<strong>' + Formato.precio(linea.producto.precio * linea.cantidad) + '</strong>';

            item.appendChild(izquierda);
            item.appendChild(derecha);
            fragmento.appendChild(item);
        });

        dom.listaResumen.appendChild(fragmento);
    }


    /* ----------------------------------------------------------------------
       5. NOTIFICACIONES Y MODAL DE DETALLE
       ---------------------------------------------------------------------- */

    /**
     * Muestra una notificación emergente (toast de Bootstrap).
     * @param {string} mensaje Texto a mostrar.
     * @param {string} [tipo='success'] Color de Bootstrap: success, danger, etc.
     */
    function notificar(mensaje, tipo) {
        const estilo = tipo || 'success';

        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-bg-' + estilo + ' border-0';
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        toast.innerHTML =
            '<div class="d-flex">' +
            '<div class="toast-body"></div>' +
            '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>' +
            '</div>';
        toast.querySelector('.toast-body').textContent = mensaje;

        dom.zonaToasts.appendChild(toast);

        const instancia = new bootstrap.Toast(toast, { delay: 2500 });
        instancia.show();

        // Se elimina del DOM al terminar, para no acumular nodos invisibles.
        toast.addEventListener('hidden.bs.toast', function () {
            toast.remove();
        });
    }

    /**
     * Rellena y abre el modal con el detalle de un producto.
     * @param {object} producto
     */
    function abrirModalProducto(producto) {
        productoEnModal = producto;
        dom.tituloModalProducto.textContent = producto.nombre;

        dom.cuerpoModalProducto.innerHTML =
            '<div class="row g-4 align-items-center">' +
            '  <div class="col-md-5">' +
            '    <img class="img-fluid rounded" alt="" src="">' +
            '  </div>' +
            '  <div class="col-md-7">' +
            '    <p class="descripcion-modal"></p>' +
            '    <ul class="list-group list-group-flush mb-3">' +
            '      <li class="list-group-item px-0"><strong>Categoría:</strong> <span data-campo="categoria"></span></li>' +
            '      <li class="list-group-item px-0"><strong>Plataforma:</strong> <span data-campo="plataforma"></span></li>' +
            '      <li class="list-group-item px-0"><strong>Clasificación:</strong> <span data-campo="clasificacion"></span></li>' +
            '      <li class="list-group-item px-0"><strong>Stock:</strong> <span data-campo="stock"></span></li>' +
            '    </ul>' +
            '    <p class="h3 fw-bold text-exito mb-0" data-campo="precio"></p>' +
            '  </div>' +
            '</div>';

        // Los valores se asignan con textContent para no inyectar HTML.
        const imagen = dom.cuerpoModalProducto.querySelector('img');
        imagen.src = producto.imagen;
        imagen.alt = 'Portada del videojuego ' + producto.nombre;

        dom.cuerpoModalProducto.querySelector('.descripcion-modal').textContent = producto.descripcion;
        dom.cuerpoModalProducto.querySelector('[data-campo="categoria"]').textContent = producto.categoria;
        dom.cuerpoModalProducto.querySelector('[data-campo="plataforma"]').textContent = producto.plataforma;
        dom.cuerpoModalProducto.querySelector('[data-campo="clasificacion"]').textContent = producto.clasificacion;
        dom.cuerpoModalProducto.querySelector('[data-campo="stock"]').textContent =
            producto.stock > 0 ? producto.stock + ' unidades' : 'Sin stock';
        dom.cuerpoModalProducto.querySelector('[data-campo="precio"]').textContent = Formato.precio(producto.precio);

        dom.btnAgregarDesdeModal.disabled = producto.stock === 0;

        bootstrap.Modal.getOrCreateInstance(dom.modalProducto).show();
    }

    /**
     * Busca un producto del catálogo por su identificador.
     * @param {number} id
     * @returns {object|undefined}
     */
    function buscarProducto(id) {
        return catalogo.find(function (producto) {
            return producto.id === id;
        });
    }

    /**
     * Agrega un producto al carrito y refresca la interfaz.
     * @param {number} id Identificador del producto.
     */
    function agregarAlCarrito(id) {
        const producto = buscarProducto(id);

        if (!producto) {
            notificar('No encontramos ese producto en el catálogo.', 'danger');
            return;
        }

        if (producto.stock === 0) {
            notificar(producto.nombre + ' está sin stock.', 'danger');
            return;
        }

        Carrito.agregar(producto);
        renderizarCarrito();
        notificar(producto.nombre + ' se agregó al carrito.');
    }


    /**
     * Devuelve el foco al botón de cierre del panel lateral.
     *
     * Hace falta porque al vaciar o pagar, los botones que acaban de usarse
     * quedan deshabilitados y el navegador manda el foco al <body>. Con el
     * foco fuera del panel, Bootstrap deja de recibir la tecla Escape y el
     * usuario que navega con teclado no puede cerrarlo.
     */
    function devolverFocoAlPanel() {
        const cerrar = document.querySelector('#panelCarrito .btn-close');
        if (cerrar) {
            cerrar.focus();
        }
    }


    /* ----------------------------------------------------------------------
       6. EVENTOS
       Los eventos de las tarjetas y del carrito se registran por delegación:
       un único listener en el contenedor atiende a los botones que se crean
       dinámicamente, sin tener que volver a asociarlos en cada renderizado.
       ---------------------------------------------------------------------- */

    /** Conecta todos los manejadores de eventos de la aplicación. */
    function registrarEventos() {

        // --- Evento CLICK sobre el catálogo (agregar o ver detalle) ---
        dom.grilla.addEventListener('click', function (evento) {
            const boton = evento.target.closest('button[data-accion]');
            if (!boton) {
                return;
            }

            const id = Number(boton.dataset.id);

            if (boton.dataset.accion === 'agregar') {
                agregarAlCarrito(id);
            } else if (boton.dataset.accion === 'detalle') {
                const producto = buscarProducto(id);
                if (producto) {
                    abrirModalProducto(producto);
                }
            }
        });

        // --- Evento CLICK dentro del panel del carrito ---
        dom.listaCarrito.addEventListener('click', function (evento) {
            const boton = evento.target.closest('button[data-accion]');
            if (!boton) {
                return;
            }

            const id = Number(boton.dataset.id);
            const accion = boton.dataset.accion;

            if (accion === 'sumar') {
                agregarAlCarrito(id);
            } else if (accion === 'restar') {
                Carrito.quitarUnidad(id);
                renderizarCarrito();
            } else if (accion === 'eliminar') {
                const producto = buscarProducto(id);
                Carrito.eliminar(id);
                renderizarCarrito();
                notificar((producto ? producto.nombre : 'El producto') + ' se quitó del carrito.', 'secondary');
            }
        });

        // --- Evento SUBMIT del formulario de búsqueda ---
        dom.formBusqueda.addEventListener('submit', function (evento) {
            // Evita que el navegador recargue la página al enviar.
            evento.preventDefault();

            const termino = dom.campoBusqueda.value.trim();

            // Validación: no tiene sentido buscar con un solo carácter.
            if (termino.length === 1) {
                notificar('Escribe al menos dos caracteres para buscar.', 'danger');
                return;
            }

            filtros.texto = termino;
            renderizarCatalogo();

            if (termino === '') {
                notificar('Mostrando el catálogo completo.', 'secondary');
            }

            document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
        });

        // --- Filtro por categoría desde el <select> ---
        dom.filtroCategoria.addEventListener('change', function (evento) {
            filtros.categoria = evento.target.value;
            renderizarCatalogo();
        });

        // --- Filtro por categoría desde el menú desplegable de la barra ---
        dom.menuCategorias.addEventListener('click', function (evento) {
            const opcion = evento.target.closest('button[data-categoria]');
            if (!opcion) {
                return;
            }

            filtros.categoria = opcion.dataset.categoria;
            dom.filtroCategoria.value = filtros.categoria;
            renderizarCatalogo();
            document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' });
        });

        // --- Botón "Agregar al carrito" dentro del modal de detalle ---
        dom.btnAgregarDesdeModal.addEventListener('click', function () {
            if (productoEnModal) {
                agregarAlCarrito(productoEnModal.id);
                bootstrap.Modal.getOrCreateInstance(dom.modalProducto).hide();
            }
        });

        // --- Vaciar el carrito ---
        dom.btnVaciarCarrito.addEventListener('click', function () {
            if (Carrito.estaVacio()) {
                return;
            }
            Carrito.vaciar();
            renderizarCarrito();
            notificar('Vaciaste el carrito.', 'secondary');
            devolverFocoAlPanel();
        });

        // --- Simulación del pago ---
        dom.btnPagar.addEventListener('click', function () {
            const total = Carrito.calcularTotal();
            notificar('Compra simulada por ' + Formato.precio(total) + '. ¡Gracias!', 'success');
            Carrito.vaciar();
            renderizarCarrito();
            devolverFocoAlPanel();
        });
    }


    /* ----------------------------------------------------------------------
       7. ARRANQUE DE LA APLICACIÓN
       ---------------------------------------------------------------------- */

    /** Punto de entrada: se ejecuta cuando el DOM ya está disponible. */
    function iniciar() {
        registrarEventos();
        renderizarCarrito();
        cargarCatalogo();
    }

    document.addEventListener('DOMContentLoaded', iniciar);
})();
