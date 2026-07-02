import { apiFetch } from './api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const construirQueryString = (filtros = {}) => {
  const params = new URLSearchParams()
  if (filtros.periodo) params.set('periodo', filtros.periodo)
  if (filtros.fecha_desde) params.set('fecha_desde', filtros.fecha_desde)
  if (filtros.fecha_hasta) params.set('fecha_hasta', filtros.fecha_hasta)
  return params.toString()
}

const descargarArchivo = async (url, nombreArchivo) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al generar el archivo')
  }
  const blob = await response.blob()
  const objectUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = objectUrl
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  window.URL.revokeObjectURL(objectUrl)
}

export const contabilidadService = {
  obtenerLibroDiario: async (filtros = {}) => {
    const params = new URLSearchParams()
    if (filtros.periodo) params.set('periodo', filtros.periodo)
    if (filtros.fecha_desde) params.set('fecha_desde', filtros.fecha_desde)
    if (filtros.fecha_hasta) params.set('fecha_hasta', filtros.fecha_hasta)
    const qs = params.toString()
    const url = `/contabilidad/libro-diario/${qs ? '?' + qs : ''}`
    const respuesta = await apiFetch(url)
    return Array.isArray(respuesta) ? respuesta : respuesta.data || []
  },

  obtenerLibroMayor: async (filtros = {}) => {
    const params = new URLSearchParams()
    if (filtros.periodo) params.set('periodo', filtros.periodo)
    if (filtros.fecha_desde) params.set('fecha_desde', filtros.fecha_desde)
    if (filtros.fecha_hasta) params.set('fecha_hasta', filtros.fecha_hasta)
    const qs = params.toString()
    const url = `/contabilidad/libro-mayor/${qs ? '?' + qs : ''}`
    const respuesta = await apiFetch(url)
    return Array.isArray(respuesta) ? respuesta : respuesta.data || []
  },

  descargarLibroDiarioExcel: async (filtros = {}) => {
    const qs = construirQueryString(filtros)
    const url = `${BASE_URL}/contabilidad/libro-diario/exportar${qs ? '?' + qs : ''}`
    await descargarArchivo(url, 'libro_diario.xlsx')
  },

  descargarLibroMayorExcel: async (filtros = {}) => {
    const qs = construirQueryString(filtros)
    const url = `${BASE_URL}/contabilidad/libro-mayor/exportar${qs ? '?' + qs : ''}`
    await descargarArchivo(url, 'libro_mayor.xlsx')
  },

  registrarInicioActividades: async (datosInicio) => {
    return await apiFetch('/capital/', { method: 'POST', body: JSON.stringify(datosInicio) })
  },

  registrarAsientoManual: async (payload) => {
    return await apiFetch('/contabilidad/asientos-manuales', { method: 'POST', body: JSON.stringify(payload) })
  },

  obtenerBalance: async (fecha = null) => {
    const url = fecha ? `/contabilidad/balance?fecha=${fecha}` : '/contabilidad/balance'
    return await apiFetch(url)
  },
}
