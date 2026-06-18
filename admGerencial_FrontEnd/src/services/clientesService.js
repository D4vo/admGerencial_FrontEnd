import { apiFetch } from './api';

export const clientesService = {
  // Obtener todo el directorio de clientes
  obtenerClientes: async () => {
    const respuesta = await apiFetch('/clientes/');
    // Si la respuesta es un array directo, lo devuelve; si no, intenta capturar la propiedad data
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  },

  // Registrar un nuevo cliente fiscal en la base de datos
  crearCliente: async (datosCliente) => {
    const respuesta = await apiFetch('/clientes/', {
      method: 'POST',
      body: JSON.stringify(datosCliente)
    });
    return respuesta;
  }
};