import { apiFetch } from './api';

export const cuentasService = {
  // 1. Listar todas las cuentas contables
  obtenerTodas: async () => {
    const respuesta = await apiFetch('/cuentas/');
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  },

  // 2. Crear una cuenta nueva (POST)
  crear: async (nuevaCuenta) => {
    const respuesta = await apiFetch('/cuentas/', {
      method: 'POST',
      body: JSON.stringify(nuevaCuenta)
    });
    return respuesta;
  },

  // 3. NUEVO: Actualizar una cuenta existente (PUT)
  actualizar: async (id, cuentaActualizada) => {
    const respuesta = await apiFetch(`/cuentas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cuentaActualizada)
    });
    return respuesta;
  }
};