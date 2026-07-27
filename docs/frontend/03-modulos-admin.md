# Módulos admin — mapa funcional

Resumen operativo del admin Angular. Detalle visual: `00-angular20-port-v0.md` y `02-sistema-visual-v0-f1-02.md`.

## Rutas típicas

| Ruta | Función |
|---|---|
| `/admin/login` | Login sesión + CSRF |
| `/admin` | Dashboard / mesa de trabajo |
| `/admin/cursos` | Listado y alta/edición de cursos + fechas |
| `/admin/alumnos` | Listado, alta/edición, detalle con métricas de certificaciones |
| `/admin/asistencias/...` | Fechas por curso, marcado, emisión desde presentes |
| `/admin/certificaciones` | Listado, alta, expediente, folio PDF, entrega, revocación |
| `/admin/configuracion` | Textos institucionales y firmas (Rector/a, Asesor/a) |
| `/validar/:token` | Validación pública |

## Reglas de producto en UI

- Entrega manual: copiar link / descargar PDF o QR; **no** rotar token.
- Estados de certificación en producto: vigente | revocado.
- DNI completo visible en listados/detalle; no mostrar token completo.
- Firmas: preview desde API de configuración; ratio de imagen 3:2.
- Errores 401 de sesión: volver a login sin ensuciar pantallas de datos.

## Fuentes de datos

- Servicios HTTP bajo features (`http-*.service.ts`) contra `/api/admin/...`.
- Envelope `res.data.*`.
- Mocks in-memory solo para tests o modos explícitos.

## Referencia visual

Contrastar con `muestra_pagina/` por flujo. No copiar React. Criterio: paridad igual o mejor.
