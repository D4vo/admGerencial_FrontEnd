import { apiFetch } from './api'

export const cuentaSistemaService = {
  obtenerConfiguracion: async () => {
    return await apiFetch('/config/cuentas-sistema/')
  },
  actualizarRol: async (rol, cuenta_id) => {
    return await apiFetch(`/config/cuentas-sistema/${rol}`, {
      method: 'PUT',
      body: JSON.stringify({ cuenta_id }),
    })
  },
}
