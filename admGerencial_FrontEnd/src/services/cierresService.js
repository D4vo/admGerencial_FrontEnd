import { apiFetch } from './api'

export const cierresService = {
  obtenerHistorial: async () => {
    return await apiFetch('/cierres/')
  },
  preview: async (periodo) => {
    return await apiFetch(`/cierres/preview/${periodo}`)
  },
  detalle: async (cierreId) => {
    return await apiFetch(`/cierres/${cierreId}`)
  },
  ejecutar: async (datos) => {
    return await apiFetch('/cierres/', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },
}
