// Entorno de producción por defecto.
// useRealApi=false → ValidationService usa MockValidationSource.
// apiBaseUrl apunta a la API PHP pública en cPanel.
// En producción el modo real no se habilita desde este archivo.
export const environment = {
  useRealApi: false,
  apiBaseUrl: '/certificados/api',
};