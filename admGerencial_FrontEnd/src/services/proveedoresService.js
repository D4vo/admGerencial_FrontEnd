import { apiFetch } from './api'

export const proveedoresService = {
  // Maestro de proveedores
  obtenerTodos: async () => {
    return await apiFetch('/proveedores/maestro/')
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
  eliminar: async (id) => {
    return await apiFetch(`/proveedores/maestro/${id}`, {
      method: 'DELETE',
    })
  },

  // Deudas y pagos
  obtenerDeudas: async () => {
    const respuesta = await apiFetch('/proveedores/deudas/')
    return Array.isArray(respuesta) ? respuesta : respuesta.data || []
  },
  registrarPago: async (datosPago) => {
    return await apiFetch('/proveedores/pagos/', {
      method: 'POST',
      body: JSON.stringify(datosPago),
    })
  },
}
