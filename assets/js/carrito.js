/* ==========================================================================
   carrito.js — Lógica del carrito de compras
   Asignatura : Desarrollo Frontend I (PFY2201) — Experiencia 2, Semana 6
   Autor      : Agustín Andrews

   Este módulo contiene SOLO lógica: no toca el DOM ni conoce Bootstrap.
   Separarlo de app.js permite reutilizar y probar estas funciones de forma
   aislada, y mantiene un único lugar donde vive el estado del carrito.
   Se expone al resto de la aplicación a través del objeto global `Carrito`.
   ========================================================================== */

const Carrito = (function () {
    'use strict';

    /**
     * Estado interno del carrito.
     * Cada elemento tiene la forma { producto: {...}, cantidad: Number }.
     * Es privado: solo se modifica mediante las funciones expuestas abajo.
     */
    let lineas = [];

    /**
     * Busca la línea del carrito que corresponde a un producto.
     * @param {number} id Identificador del producto.
     * @returns {object|undefined} La línea encontrada, o undefined.
     */
    function buscarLinea(id) {
        return lineas.find(function (linea) {
            return linea.producto.id === id;
        });
    }

    /**
     * Agrega un producto al carrito. Si ya estaba, incrementa su cantidad
     * en lugar de duplicar la línea.
     * @param {object} producto Producto proveniente del catálogo.
     * @returns {number} La cantidad que quedó para ese producto.
     */
    function agregar(producto) {
        if (!producto || typeof producto.id !== 'number') {
            throw new Error('Producto inválido: se esperaba un objeto con id numérico.');
        }

        const existente = buscarLinea(producto.id);

        if (existente) {
            existente.cantidad += 1;
            return existente.cantidad;
        }

        lineas.push({ producto: producto, cantidad: 1 });
        return 1;
    }

    /**
     * Descuenta una unidad de un producto. Si llega a cero, elimina la línea.
     * @param {number} id Identificador del producto.
     */
    function quitarUnidad(id) {
        const linea = buscarLinea(id);
        if (!linea) {
            return;
        }

        linea.cantidad -= 1;

        if (linea.cantidad <= 0) {
            eliminar(id);
        }
    }

    /**
     * Elimina por completo un producto del carrito, sin importar su cantidad.
     * @param {number} id Identificador del producto.
     */
    function eliminar(id) {
        lineas = lineas.filter(function (linea) {
            return linea.producto.id !== id;
        });
    }

    /** Deja el carrito sin productos. */
    function vaciar() {
        lineas = [];
    }

    /**
     * Devuelve una copia de las líneas, para que quien la reciba no pueda
     * alterar el estado interno por accidente.
     * @returns {Array<object>} Copia de las líneas del carrito.
     */
    function obtenerLineas() {
        return lineas.map(function (linea) {
            return { producto: linea.producto, cantidad: linea.cantidad };
        });
    }

    /**
     * Suma todas las unidades del carrito (no la cantidad de líneas).
     * @returns {number} Total de unidades.
     */
    function contarUnidades() {
        return lineas.reduce(function (suma, linea) {
            return suma + linea.cantidad;
        }, 0);
    }

    /**
     * Calcula el monto total del carrito.
     * @returns {number} Total en pesos chilenos.
     */
    function calcularTotal() {
        return lineas.reduce(function (suma, linea) {
            return suma + linea.producto.precio * linea.cantidad;
        }, 0);
    }

    /** @returns {boolean} true si no hay ningún producto agregado. */
    function estaVacio() {
        return lineas.length === 0;
    }

    // API pública del módulo
    return {
        agregar: agregar,
        quitarUnidad: quitarUnidad,
        eliminar: eliminar,
        vaciar: vaciar,
        obtenerLineas: obtenerLineas,
        contarUnidades: contarUnidades,
        calcularTotal: calcularTotal,
        estaVacio: estaVacio
    };
})();

/* ==========================================================================
   Utilidades de formato — reutilizables desde cualquier parte del proyecto
   ========================================================================== */

const Formato = {
    /**
     * Formatea un número como precio en pesos chilenos.
     * @param {number} monto Valor numérico.
     * @returns {string} Por ejemplo, "$ 29.990".
     */
    precio: function (monto) {
        const numero = Number(monto) || 0;
        return '$ ' + numero.toLocaleString('es-CL');
    },

    /**
     * Normaliza un texto para comparar sin distinguir mayúsculas ni tildes.
     * Se usa en la búsqueda, para que "orbita" encuentre "Órbita Cero".
     * @param {string} texto Texto de entrada.
     * @returns {string} Texto en minúsculas y sin tildes.
     */
    normalizar: function (texto) {
        return String(texto || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .trim();
    }
};
