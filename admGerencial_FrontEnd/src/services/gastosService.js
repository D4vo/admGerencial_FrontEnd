import { apiFetch } from './api'

export const gastosService = {
  obtenerTodos: async () => {
    return await apiFetch('/gastos/')
  },
  crear: async (datosGasto) => {
    return await apiFetch('/gastos/', {
      method: 'POST',
      body: JSON.stringify(datosGasto),
    })
  },
}
