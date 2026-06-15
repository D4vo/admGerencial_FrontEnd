import { apiFetch } from './api';

export const documentosService = {
  // Obtener historial unificado de documentos (Ventas y Compras)
  obtenerHistorial: async () => {
    const respuesta = await apiFetch('/documentos/');
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  },

  // Emitir nota contable para una venta (Interna)
  emitirNotaVenta: async (payload) => {
    const respuesta = await apiFetch('/documentos/notas-venta/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return respuesta;
  },

  // Registrar nota contable para una compra (De proveedor)
  registrarNotaCompra: async (payload) => {
    const respuesta = await apiFetch('/documentos/notas-compra/', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return respuesta;
  }
};