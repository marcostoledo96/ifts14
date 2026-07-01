// Entorno de staging real (build production-staging).
// useRealApi=true → ValidationService consulta la API PHP de staging.
// apiBaseUrl apunta a la API PHP pública de staging en cPanel bajo
// /certificados_staging/api. No reutilizar la base productiva /certificados/.
//
// Configuración externa (DB/SMTP/storage) de staging se define fuera de Git vía
// CERTIFICADOS_CONFIG_PATH en .htaccess-api. Este archivo solo declara la URL
// pública del frontend y el prefijo de API que el navegador usará.
export const environment = {
  useRealApi: true,
  apiBaseUrl: '/certificados_staging/api',
};