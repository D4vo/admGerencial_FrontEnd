const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("LA URL BASE ES:", BASE_URL);

export const apiFetch = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición al servidor');
    }

    return data;
  } catch (error) {
    console.error(`Error en API (${endpoint}):`, error);
    throw error;
  }
};