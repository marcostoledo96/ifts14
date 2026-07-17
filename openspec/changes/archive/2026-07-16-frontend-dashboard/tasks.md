# Tasks: frontend-dashboard

Delivery strategy: **single-pr** (orquestador: single-cycle apply, sin split).
Review Workload Forecast:
- Decision needed before apply: No
- Chained PRs recommended: No
- 400-line budget risk: Medium
- Chain strategy: n/a (single-cycle)

## Phase 1 — RED: specs del workbench

- [x] 1.1 Reescribir `admin-dashboard-page.spec.ts`: fallar si siguen las 4 cards / copy placeholder; exigir título, 4 links de acción, carga masiva disabled, secciones pendientes/actividad/resumen.
- [x] 1.2 Specs de hidratación: fakes que resuelven → números; fakes que rechazan → "—" + indicador error; sin PII en actividad.

## Phase 2 — GREEN: página

- [x] 2.1 Reescribir `admin-dashboard-page.ts`: OnPush, signals, `Promise.allSettled` sobre seams, métricas nullables.
- [x] 2.2 Template HTML: acciones, bandeja placeholders, actividad vacía, resumen.
- [x] 2.3 CSS local con tokens; jerarquía acciones > resto; primary tile.
- [x] 2.4 Ajustar título de ruta en `app.routes.ts`.

## Phase 3 — Cierre apply

- [x] 3.1 Correr specs focalizados del dashboard hasta verde.
- [x] 3.2 Escribir `apply-progress.md` y marcar tareas `[x]`.

## Threat-matrix RED coverage

| Caso | Task |
|------|------|
| Sin 4 cards | 1.1 |
| Fallo seams → "—" | 1.2 |
| Carga masiva disabled | 1.1 |
| Sin PII actividad | 1.2 |
