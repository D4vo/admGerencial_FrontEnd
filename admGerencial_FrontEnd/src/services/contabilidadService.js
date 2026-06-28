import { apiFetch } from './api'

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
