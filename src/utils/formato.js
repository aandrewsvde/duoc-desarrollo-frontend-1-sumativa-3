/**
 * formato.js — Funciones puras reutilizables.
 *
 * No dependen de React ni del DOM, así que pueden usarse desde cualquier
 * componente y probarse de forma aislada.
 */

/**
 * Formatea un número como precio en pesos chilenos.
 * @param {number} monto Valor numérico.
 * @returns {string} Por ejemplo, "$ 29.990".
 */
export function formatearPrecio(monto) {
  const numero = Number(monto) || 0
  return `$ ${numero.toLocaleString('es-CL')}`
}

/**
 * Normaliza un texto para comparar sin distinguir mayúsculas ni tildes.
 * Permite que al buscar "orbita" se encuentre "Órbita Cero".
 * @param {string} texto Texto de entrada.
 * @returns {string} Texto en minúsculas, sin tildes y sin espacios sobrantes.
 */
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

/**
 * Construye la URL de un recurso de la carpeta public respetando el `base`
 * configurado en Vite. Es necesario porque en GitHub Pages la aplicación no
 * vive en la raíz del dominio.
 * @param {string} ruta Ruta relativa dentro de public, p. ej. "img/logo.svg".
 * @returns {string} URL utilizable en un atributo src o en fetch.
 */
export function rutaPublica(ruta) {
  return `${import.meta.env.BASE_URL}${ruta}`
}
