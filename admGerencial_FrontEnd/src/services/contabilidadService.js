import { apiFetch } from './api';

export const contabilidadService = {
  // 1. Obtener todos los asientos del libro diario
  obtenerLibroDiario: async () => {
    const respuesta = await apiFetch('/contabilidad/libro-diario/');
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  },

  // 2. NUEVO: Obtener todos los registros del libro mayor
  obtenerLibroMayor: async () => {
    const respuesta = await apiFetch('/contabilidad/libro-mayor/');
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  }
};