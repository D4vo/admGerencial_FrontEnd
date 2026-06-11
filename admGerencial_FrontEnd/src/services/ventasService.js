import { apiFetch } from './api';

// Obtenemos la URL base desde las variables de entorno de Vite
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const ventasService = {
  // Crear una nueva venta (POST)
  crear: async (datosVenta) => {
    const respuesta = await apiFetch('/ventas/', {
      method: 'POST',
      body: JSON.stringify(datosVenta)
    });
    return respuesta;
  },

  // Descargar el comprobante PDF (GET)
  descargarTicket: async (ventaId) => {
    try {
      // Hacemos la petición al nuevo endpoint /imprimir
      const response = await fetch(`${BASE_URL}/ventas/${ventaId}/imprimir`);
      
      if (!response.ok) {
        throw new Error('Error al generar el PDF del comprobante');
      }

      // Transformamos la respuesta en un archivo binario (Blob)
      const blob = await response.blob();
      
      // Creamos una URL temporal en la memoria del navegador
      const url = window.URL.createObjectURL(blob);
      
      // Creamos un enlace <a> invisible para forzar la descarga
      const a = document.createElement('a');
      a.href = url;
      a.download = `comprobante_venta_${ventaId}.pdf`; // Nombre del archivo a descargar
      document.body.appendChild(a);
      
      // Simulamos el clic
      a.click();
      
      // Limpiamos el DOM y liberamos la memoria
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Error al descargar el comprobante:", error);
      throw error;
    }
  }
};