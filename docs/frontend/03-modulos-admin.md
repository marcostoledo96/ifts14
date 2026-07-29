# Módulos admin — mapa funcional

Resumen operativo del admin Angular. Detalle visual: `00-angular20-port-v0.md` y `02-sistema-visual-v0-f1-02.md`.

## Rutas típicas

| Ruta | Función |
|---|---|
| `/admin/login` | Login sesión + CSRF |
| `/admin` | Dashboard / mesa de trabajo |
| `/admin/cursos` | Listado y alta/edición de cursos + fechas |
| `/admin/cursos/:id` | Detalle: ficha, fechas, not-found/Reintentar, CTA al hub de asistencias |
| `/admin/alumnos` | Listado (copy sin legajo; badges contacto sin email literal; métricas 0 vs —); editor create/edit (sin legajo; Reintentar carga; lote+resumen; 409 sin PII); detalle (Ficha sin legajo; métricas 0 vs —; Reintentar solo recuperable) |
| `/admin/asistencias` | Hub: una fila por curso; métricas N/M lineales (asistibles ≠ cancelada; presentes solo entre asistibles; sin alumnosActivos como total); búsqueda; pager 20 |
| `/admin/asistencias/curso/:id` | Intermedia de fechas: asistibles ≠ cancelada; chips; CTA marcado; not-found vs carga; Reintentar solo en fallo recuperable de listarHub |
| `/admin/cursos/:id/fechas/:fechaId/asistencias` | Marcado + emitir/regenerar en serie; Reintentar solo carga recuperable; `mensajeErrorApi` en catch marcar; token/QR no rota; sin tocar HTTP marcar |
| `/admin/cursos/:id/fechas/:fechaId/asistencias/certificados` | Certificados del curso (filtro `cursoId`); Copiar→QR→PDF; Expediente; Reintentar solo carga recuperable; `mensajeErrorApi` en acciones; empty+CTA marcar |
| `/admin/certificaciones` | Listado vía seam `listar` (filtros vigente/revocado+curso+texto; `paginasVisibles`; resumen gated; coincide/coinciden; DNI completo; Reintentar sin `errorRecuperable`); alta, expediente, folio PDF, entrega, revocación |
| `/admin/certificaciones/nueva` | Emisión puntual alumno+curso (antes de `:id`); copy rol edge vs Asistencias (sin «complementario»); Reintentar solo loads (`errorCatalogosRecuperable`/`errorParRecuperable`); emit else `mensajeErrorApi`; DNI completo / anti-token; HTTP intacto |
| `/admin/certificaciones/:id` | Expediente preview: firmas reales si hay imagen; Descargar PDF→`/pdf`; Regenerar=API (sin rotar token); Reintentar solo load hard; `mensajeErrorApi` en QR/regen; post-regen omite URL canónica completa; DNI completo / anti-token; HTTP intacto |
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
