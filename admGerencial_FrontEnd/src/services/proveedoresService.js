import { apiFetch } from './api';

export const proveedoresService = {
  // Traer el listado de cuentas con saldos pendientes (GET)
  obtenerDeudas: async () => {
    const respuesta = await apiFetch('/proveedores/deudas/');
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  },

  // Enviar la estructura del pago al proveedor (POST)
  registrarPago: async (datosPago) => {
    const respuesta = await apiFetch('/proveedores/pagos/', {
      method: 'POST',
      body: JSON.stringify(datosPago)
    });
    return respuesta;
  }
};