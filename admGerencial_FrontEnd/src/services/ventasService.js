import { apiFetch } from './api';

export const ventasService = {
  // Crear una nueva venta (POST)
  crear: async (datosVenta) => {
    const respuesta = await apiFetch('/ventas/', {
      method: 'POST',
      body: JSON.stringify(datosVenta)
    });
    return respuesta;
  }
};