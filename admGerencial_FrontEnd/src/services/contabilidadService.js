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
  },
  // 3. NUEVO: Registrar el inicio de actividades (POST)
  registrarInicioActividades: async (datosInicio) => {
    const respuesta = await apiFetch('/capital/', {
      method: 'POST',
      body: JSON.stringify(datosInicio)
    });
    return respuesta;
  },
  // NUEVO: Registrar un Asiento Contable Manual (POST)
  registrarAsientoManual: async (payload) => {
    const respuesta = await apiFetch('/contabilidad/asientos-manuales', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return respuesta;
  }
};