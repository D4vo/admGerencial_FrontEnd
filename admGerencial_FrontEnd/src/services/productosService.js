import { apiFetch } from './api';

export const productosService = {
  // Función para traer el listado
  obtenerTodos: async () => {
    // Si tu compañero usó el formato {"status": "success", "data": [...]}, 
    // devolvemos solo el array "data" para que el componente trabaje cómodo.
    const respuesta = await apiFetch('/v1/productos/');
    return respuesta.data; 
  }
};