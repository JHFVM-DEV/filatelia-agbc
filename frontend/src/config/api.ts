/**
 * Configuración centralizada de la API de Filatelia Bolivia.
 * En el navegador, si no se especifica NEXT_PUBLIC_API_URL, se utiliza una ruta relativa vacía ('')
 * para aprovechar las rewrites/proxy de Next.js hacia el backend Laravel.
 * De este modo, la aplicación funciona de forma transparente en localhost, a través de túneles ngrok
 * (sin errores de Mixed Content HTTPS->HTTP ni problemas de CORS) y en producción.
 */
export const API_BASE_URL = (
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : (typeof window !== 'undefined' ? '' : 'http://127.0.0.1:8000')
).replace(/\/+$/, '');

/**
 * Genera la URL completa para un endpoint de la API.
 * @param endpoint Ruta relativa del endpoint (ej. '/api/products' o 'api/admin/users')
 */
export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Normaliza las URLs de imágenes procedentes del backend para garantizar
 * que se carguen correctamente a través de ngrok, HTTPS o dispositivos móviles sin errores de Mixed Content.
 */
export const normalizeImageUrl = (url?: string | null): string => {
  if (!url) return '/images/stamps/sello-150-anos-primer-sello-postal-boliviano-2017.png';
  // Si apunta a localhost o 127.0.0.1 con o sin puerto, convertir a ruta relativa
  return url.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, '');
};

export default API_BASE_URL;
