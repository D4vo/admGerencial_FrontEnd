import { apiFetch } from './api';

export const comprasService = {
  // Crear una nueva compra (POST)
  crear: async (datosCompra) => {
    const respuesta = await apiFetch('/compras/', {
      method: 'POST',
      body: JSON.stringify(datosCompra)
    });
    return respuesta;
  }
};