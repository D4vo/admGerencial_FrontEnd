import { apiFetch } from './api'

export const dashboardService = {
  obtener: async () => {
    return await apiFetch('/dashboard/')
  },
}
