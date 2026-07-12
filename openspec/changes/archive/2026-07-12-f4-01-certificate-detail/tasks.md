# Tareas: F4-01 — Detalle de certificación administrativo

## Review Workload Forecast

| | |
|---|---|
| Estimated lines | 400–700 |
| 4000-line risk | Low |
| Chained PRs | No |
| Delivery | single-pr-default |
| Split | PR único + slices por commit |
| Chain | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
4000-line budget risk: Low

### Work Units

| U | Objetivo | PR | Notas |
|---|---|---|---|
| 1 | RED: specs y checks | commit | base `main`; tests antes que código |
| 2 | UI expediente con paridad v0 | commit | base `main`; tras unidad 1 |
| 3 | Evidencia visual | commit | base `main`; captura + notas |

## Phase 1 — Tests y checks previos (RED)

- [x] 1.1 Ampliar `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.spec.ts`: secciones, acciones `aria-disabled`, handoffs, id inválido, route reuse.
- [x] 1.2 Endurecer `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-secrets.spec.ts`: prohibir `localStorage`, `sessionStorage`, `IndexedDB`, `fetch`, `HttpClient` y `X-Admin-Key` del feature.
- [x] 1.3 Endurecer `apps/frontend-angular/src/app/features/admin/certifications/__checks__/no-real-data.spec.ts`: DOM, seed y `documentMasked` sin DNI completo, token, email, legajo, matrícula ni UUID.
- [x] 1.4 Ajustar `apps/frontend-angular/src/app/app.routes.spec.ts` para que la expectativa runtime de `/admin/certificaciones/1` valide el expediente.
- [x] 1.5 Correr `npm run test:ci` y registrar la salida roja esperada antes de implementar.

## Phase 2 — Implementación del expediente (GREEN)

- [x] 2.1 Modificar `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.ts`: helpers de presentación (número visual, fechas, labels de estado y handoff) y señal derivada de handoffs.
- [x] 2.2 Reescribir `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.html`: breadcrumb, encabezado, columna de control, ficha, acciones `disabled` con `aria-disabled`, QR decorativo CSS, zona de riesgo, documento réplica y auditoría.
- [x] 2.3 Reescribir `apps/frontend-angular/src/app/features/admin/certifications/pages/preview/certification-preview-page.css`: grilla responsive, paneles, documento institucional, badges, botones disabled y QR decorativo con tokens `--color-ink`, `--color-circuit`, `--color-valid`, `--color-destructive`.
- [x] 2.4 Reusar `apps/frontend-angular/src/app/features/admin/certifications/in-memory-certifications.service.ts` sin cambios; modificar solo si la paridad lo exige.
- [x] 2.5 Correr `npm run test:ci` y `npm run build`; ambos en verde antes de la Phase 3.

## Phase 3 — Evidencia visual y paridad

- [x] 3.1 Capturar expediente Angular en `/admin/certificaciones/1` (desktop 1280×800 y mobile 390×844) y guardar en `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/cert-detail-angular.png`.
- [x] 3.2 Adjuntar referencia v0: `muestra_pagina/app/admin/certificaciones/[id]/page.tsx` y `muestra_pagina/components/admin/expediente-certificacion.tsx` (solo lectura).
- [x] 3.3 Redactar `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/evidence/parity-notes.md` con tabla comparativa (jerarquía, layout, secciones, estados, acciones) y diff visual Angular vs v0; firmar aceptación o listar gaps.
- [x] 3.4 Inspeccionar `parity-notes.md` y `cert-detail-angular.png` para confirmar ausencia de DNI, token, email, legajo y matrícula.

## Phase 4 — Verificación, privacidad y cleanup

- [x] 4.1 Confirmar `npm run test:ci` en verde y `npm run build` sin warnings nuevos (el warning de budget CSS `anyComponentStyle` 8kB/13.78kB queda aceptado explícitamente por paridad visual; no es warning nuevo introducido por desviación).
- [x] 4.2 Confirmar que `no-secrets.spec.ts` y `no-real-data.spec.ts` siguen pasando tras los cambios.
- [x] 4.3 Revisar git local con `git status --short` y `git diff --name-only`; listar archivos tocados en `parity-notes.md` sin stagear.
- [x] 4.4 Actualizar `docs/frontend/F4-01-expediente-certificacion.md` (crear si no existe) con ruta, secciones, acciones deshabilitadas, handoffs a F4-02, F5-04, F6-03 y F6-01, y referencia a la evidencia visual.
- [x] 4.5 Confirmar F4-02 diferido: ninguna tarea implementa ruta/PDF imprimible; nota al pie en `proposal.md`, `spec.md` y `design.md` si corresponde.
