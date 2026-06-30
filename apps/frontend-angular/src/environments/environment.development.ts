// Entorno de desarrollo.
// useRealApi=false por defecto → MockValidationSource con tokens demo.
//
// Smoke local Angular↔API PHP real:
//   1. Levantar la API PHP local en :8080 (ver scripts/m3-06-smoke.sh).
//   2. Cambiar useRealApi a true en este archivo (solo local, no commitear true).
//   3. `ng serve` (usa proxy.conf.json → /certificados/api → 127.0.0.1:8080).
//   4. Abrir http://localhost:4200/certificados/validar/<token-ficticio>.
//   5. Capturar evidencia sin datos reales y revertir useRealApi a false.
export const environment = {
  useRealApi: false,
  apiBaseUrl: '/certificados/api',
};