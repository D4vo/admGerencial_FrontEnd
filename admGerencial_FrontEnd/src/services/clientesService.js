import { apiFetch } from './api';

export const clientesService = {
  // Obtener el directorio de clientes (por defecto, solo activos)
  obtenerClientes: async (incluirInactivos = false) => {
    const query = incluirInactivos ? '?incluir_inactivos=true' : '';
    const respuesta = await apiFetch(`/clientes/${query}`);
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
  },

  // Editar los datos de un cliente existente (el CUIT no se modifica)
  actualizarCliente: async (cuit, datosCliente) => {
    const respuesta = await apiFetch(`/clientes/${cuit}`, {
      method: 'PUT',
      body: JSON.stringify(datosCliente)
    });
    return respuesta;
  },

  // Dar de baja o reactivar un cliente
  cambiarEstado: async (cuit, activo) => {
    return await apiFetch(`/clientes/${cuit}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo })
    });
  }
};
