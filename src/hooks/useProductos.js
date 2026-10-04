import { useState, useEffect, useCallback } from 'react'
import { rutaPublica } from '../utils/formato'

/**
 * useProductos — Hook personalizado que carga el catálogo de productos.
 *
 * Aquí vive el EFECTO SECUNDARIO principal de la aplicación: la petición de
 * datos al archivo JSON. Se encapsula en un hook propio para que el
 * componente que lo use reciba solo el resultado ya listo (productos,
 * cargando, error) y no tenga que ocuparse de la mecánica del fetch.
 *
 * Estados que gestiona con useState:
 *   - productos: la lista del catálogo.
 *   - cargando : true mientras la petición está en curso.
 *   - error    : mensaje legible si algo falla, o null si todo fue bien.
 *
 * @returns {{productos: Array, cargando: boolean, error: string|null, recargar: Function}}
 */
export function useProductos() {
  // --- useState: estado de los datos cargados ---
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Cambiar este número fuerza que el efecto se vuelva a ejecutar, que es
  // como se implementa el botón "Reintentar" sin recargar la página.
  const [intento, setIntento] = useState(0)

  /** Vuelve a lanzar la carga del catálogo. */
  const recargar = useCallback(() => setIntento((n) => n + 1), [])

  // --- useEffect: carga los datos al montar el componente ---
  // El array de dependencias contiene `intento`, así que el efecto se repite
  // cada vez que el usuario pulsa "Reintentar", y solo entonces.
  useEffect(() => {
    // `ignorar` evita actualizar el estado si el componente se desmonta
    // mientras la petición sigue en vuelo (React avisaría de una fuga).
    let ignorar = false

    async function cargarProductos() {
      setCargando(true)
      setError(null)

      try {
        const respuesta = await fetch(rutaPublica('data/productos.json'))

        // fetch solo falla ante errores de red: un 404 llega como respuesta
        // "correcta", así que hay que comprobarlo a mano.
        if (!respuesta.ok) {
          throw new Error(`El servidor respondió ${respuesta.status} (${respuesta.statusText}).`)
        }

        const datos = await respuesta.json()

        if (!datos || !Array.isArray(datos.productos)) {
          throw new Error('El archivo JSON no contiene un arreglo "productos".')
        }

        // Se descarta cualquier producto al que le falten campos obligatorios,
        // para que un dato mal formado no rompa el renderizado.
        const validos = datos.productos.filter(
          (p) => p && typeof p.id === 'number' && typeof p.nombre === 'string' && typeof p.precio === 'number',
        )

        if (validos.length === 0) {
          throw new Error('Ningún producto del archivo tiene el formato esperado.')
        }

        if (!ignorar) {
          setProductos(validos)
        }
      } catch (e) {
        console.error('No fue posible cargar el catálogo:', e)
        if (!ignorar) {
          setError(e.message)
          setProductos([])
        }
      } finally {
        if (!ignorar) {
          setCargando(false)
        }
      }
    }

    cargarProductos()

    // Función de limpieza: React la ejecuta al desmontar o antes de repetir
    // el efecto.
    return () => {
      ignorar = true
    }
  }, [intento])

  return { productos, cargando, error, recargar }
}
