# Manifiesto v0 — `muestra_pagina/`

## Origen

- Fuente: exportación v0/Stitch para el módulo `/certificados/`.
- Uso: referencia visual y funcional para portar a Angular 20.
- Límite: no es código definitivo del producto.

## Inventario actual

| Estado | Detalle |
|---|---|
| Pantallas disponibles | 7 pantallas para prompts 4-10. |
| Pantallas pendientes | 12 pantallas para prompts 11-22. |
| Capturas | Disponibles en `capturas/`. |
| Código exportado | Next.js/React; no copiar literalmente a Angular. |

## Pantallas incluidas

| Prompt | Pantalla/flujo |
|---:|---|
| 4 | Validación pública válida. |
| 5 | Estados públicos no exitosos. |
| 6 | Dashboard administrativo. |
| 7 | Login administrativo. |
| 8 | Crear/editar curso con fechas. |
| 9 | Registrar asistencias presentes. |
| 10 | Emitir certificación directa. |

## Pendientes

- Prompts 11-22: seguir `../MATIAS_PROMPTS_SDD_FASE2.md`.
- Port real a Angular 20: requiere ciclo SDD aprobado.
- Contratos de API, PDF, QR, permisos y configuración: no inferir desde esta carpeta.

## Privacidad

- Validación pública: DNI enmascarado y sin tokens completos.
- Si una captura o prompt v0 muestra DNI completo públicamente, no portarlo a Angular.
- Entrega o visualización privada para estudiantes: puede requerir DNI completo si una spec aprobada lo define.
- No guardar datos reales, credenciales, dumps ni logs en esta carpeta.
