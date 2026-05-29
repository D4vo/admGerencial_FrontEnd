import { apiFetch } from './api';

export const productosService = {
  // 1. Listar todos los productos
  obtenerTodos: async () => {
    const respuesta = await apiFetch('/productos/');
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  },

  // 2. Crear un producto nuevo (POST)
  crear: async (nuevoProducto) => {
    const respuesta = await apiFetch('/productos/', {
      method: 'POST',
      body: JSON.stringify(nuevoProducto)
    });
    return respuesta;
  },

  // 3. NUEVO: Actualizar un producto existente (PUT)
  actualizar: async (id, productoActualizado) => {
    const respuesta = await apiFetch(`/productos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productoActualizado)
    });
    return respuesta;
  }
};