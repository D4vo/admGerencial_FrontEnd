import { apiFetch } from './api'

export const proveedoresService = {
  // Maestro de proveedores (por defecto, solo activos)
  obtenerTodos: async (incluirInactivos = false) => {
    const query = incluirInactivos ? '?incluir_inactivos=true' : ''
    return await apiFetch(`/proveedores/maestro/${query}`)
  },
  crear: async (datos) => {
    return await apiFetch('/proveedores/maestro/', {
      method: 'POST',
      body: JSON.stringify(datos),
    })
  },
  actualizar: async (id, datos) => {
    return await apiFetch(`/proveedores/maestro/${id}`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    })
  },
  // Dar de baja o reactivar un proveedor
  cambiarEstado: async (id, activo) => {
    return await apiFetch(`/proveedores/maestro/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    })
  },

  // Deudas y pagos
  obtenerDeudas: async () => {
    const respuesta = await apiFetch('/proveedores/deudas/')
    return Array.isArray(respuesta) ? respuesta : respuesta.data || []
  },
  obtenerMovimientos: async (id) => {
    return await apiFetch(`/proveedores/${id}/movimientos`)
  },
  registrarPago: async (datosPago) => {
    return await apiFetch('/proveedores/pagos/', {
      method: 'POST',
      body: JSON.stringify(datosPago),
    })
  },
}
