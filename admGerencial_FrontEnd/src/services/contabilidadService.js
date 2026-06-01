import { apiFetch } from './api';

export const contabilidadService = {
  // Obtener todos los asientos del libro diario
  obtenerLibroDiario: async () => {
    // Apuntamos al endpoint que se ve en tu imagen
    const respuesta = await apiFetch('/contabilidad/libro-diario/');
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  }
};