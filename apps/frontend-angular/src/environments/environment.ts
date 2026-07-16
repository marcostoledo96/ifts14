// Entorno de producción por defecto.
// useRealApi=true → todos los servicios usan la API PHP real.
// apiBaseUrl apunta a la API PHP pública en cPanel.
// El guarda environment.guard.spec.ts valida que useRealApi sea true en CI.
export const environment = {
  useRealApi: true,
  apiBaseUrl: '/certificados/api',
};