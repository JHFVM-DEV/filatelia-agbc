/**
 * Configuración centralizada de la API de Filatelia Bolivia.
 * En producción, se configura en el archivo .env / .env.production mediante NEXT_PUBLIC_API_URL.
 * Si no está configurada, utiliza por defecto http://localhost:8000.
 */
export const API_BASE_URL = (
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : 'http://localhost:8000'
).replace(/\/+$/, '');

/**
 * Genera la URL completa para un endpoint de la API.
 * @param endpoint Ruta relativa del endpoint (ej. '/api/products' o 'api/admin/users')
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

export default API_BASE_URL;
