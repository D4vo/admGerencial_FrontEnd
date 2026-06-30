import { apiFetch } from './api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  },

  // Descargar el PDF de una nota de crédito/débito emitida sobre una venta
  descargarNota: async (docId) => {
    try {
      const response = await fetch(`${BASE_URL}/documentos/${docId}/imprimir`);

      if (!response.ok) {
        throw new Error('Error al generar el PDF de la nota');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nota_${docId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar la nota:', error);
      throw error;
    }
  }
};