import { apiFetch } from './api';

export const categoriasService = {
  obtenerTodas: async () => {
    const respuesta = await apiFetch('/categorias'); // o la ruta exacta de tu API
    
    // Si la respuesta ya es un array, la devolvemos. Si viene envuelta, extraemos 'data'.
    return Array.isArray(respuesta) ? respuesta : (respuesta.data || []);
  }
};