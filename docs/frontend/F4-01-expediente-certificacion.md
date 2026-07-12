# F4-01 — Expediente de certificación administrativo

## Ruta

`/admin/certificaciones/:id` — ruta existente, sin ruta nueva.

## Descripción

Expediente administrativo mock-only que reemplaza la previsualización mínima de F2-06. Mantiene paridad visual con `muestra_pagina/components/admin/expediente-certificacion.tsx`, portada a Angular 20 con CSS local y tokens globales.

## Secciones

| Sección | Descripción |
|---|---|
| Breadcrumb | `nav[aria-label="Migas de pan"]` con enlace al listado y número de expediente |
| Encabezado | Kicker, h1 (nombre del alumno), subtítulo (curso), badge de estado |
| Columna de control | Ficha, acciones, enlace de validación, zona de riesgo |
| Ficha del expediente | Documento mascarado, token prefix, número, fechas, asistencias |
| Acciones | PDF, copiar link, entrega manual, regenerar — todas deshabilitadas |
| Enlace de validación | QR decorativo CSS + URL truncada + botón copiar deshabilitado |
| Zona de riesgo | Revocar certificación — deshabilitada |
| Documento réplica | Réplica institucional: encabezado navy, declaración, tabla de asistencia, autoridades, trazabilidad |
| Auditoría | Timeline de eventos de auditoría |

## Acciones deshabilitadas y handoffs

| Acción | Estado | Handoff |
|---|---|---|
| Descargar PDF | `disabled` + `aria-disabled="true"` | F4-02 |
| Copiar link | `disabled` + `aria-disabled="true"` | F6-03 |
| Entrega manual | `disabled` + `aria-disabled="true"` | F5-04 |
| Regenerar PDF | `disabled` + `aria-disabled="true"` | F4-02 |
| Revocar certificación | `disabled` + `aria-disabled="true"` | F6-01 |

## Frontera de datos

- `documentMasked` (`XX****XX`) — sin DNI completo.
- `tokenPrefix` (`prefijo_demo_xxx`) — sin token completo.
- `publicValidationUrl` truncada — sin UUID.
- Sin email, legajo ni matrícula en el DOM.
- Sin HTTP, storage, cookies, IndexedDB ni `X-Admin-Key`.

## F4-02 diferido

La réplica documental visible en F4-01 cubre el expediente. Una ruta/vista PDF imprimible (F4-02) queda diferida; no se implementa en este cambio.

## Evidencia visual

- `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/cert-detail-angular.png` (desktop 1280×800)
- `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/cert-detail-angular-mobile.png` (mobile 390×844)
- `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/parity-notes.md` (tabla comparativa y aceptación)

## Archivos

- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.{ts,html,css}`
- `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts`
- `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts`
- `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts`
- `apps/frontend-angular/src/app/app.routes.spec.ts`
- `apps/frontend-angular/angular.json` (budget anyComponentStyle ajustado a 8kB warning / 16kB error)