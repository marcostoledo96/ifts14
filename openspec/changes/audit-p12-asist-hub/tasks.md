# Tasks: Auditoría P12 — hub de asistencias

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~40–120 (página + tests; HTTP ~15–40 si entra) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | PERF lineal `cargar` + tests métricas (+ HTTP opcional) | PR 1 | `npx ng test --include=**/attendances-list-page.spec.ts --no-watch --browsers=ChromeHeadless` | Staging `/admin/asistencias` (opcional) | Revertir `attendances-list-page.*` (+ HTTP si entró) |

Base: `apps/frontend-angular/src/app/features/admin/attendances/pages/list/`

## Phase 1: Índice lineal en cargar

- [x] 1.1 En `attendances-list-page.ts` `cargar`: al recorrer `hub.fechas`, construir `Map<cursoId, Set<fechaId>>` de asistibles (skip `cancelada`); N = tamaño del Set (o Map de conteo equivalente).
- [x] 1.2 Quitar `hub.fechas.some` anidado; contar M como intersección presentes ∩ asistibles por curso (O(ids presentes)).
- [x] 1.3 Conservar sort por `codigo`, `loadGen`, errores, `FilaCurso` y sin usar `alumnosActivos`.

## Phase 2: Tests de semántica / no regresión

- [x] 2.1 En `attendances-list-page.spec.ts`: hub con fecha `cancelada` + presentes → no suman a N ni M (spec «Cancelada excluida»).
- [x] 2.2 Afirmar N/M honestos y que copy no use `alumnosActivos` como total.
- [x] 2.3 Conservar/verde: filas=cursos, filtro, vacío, pager 20, Reintentar/`loadGen`.
- [x] 2.4 Focused `attendances-list-page.spec.ts` hasta verde.

## Phase 3: HTTP opcional (no bloqueante)

- [x] 3.1 Si cabe: en `http-attendance.service.ts` `listarHub`, un solo `toAsistencia` (reusar array para cache + return).
- [x] 3.2 Si 3.1: test/regresión `http-attendance.service.spec.ts` contrato `listarHub`; si se omite HTTP → marcar 3.x N/A y no fusionar delta HTTP.
- [x] 3.3 No tocar `attendance-mock.service.ts`.

## Phase 4: Cierre P12

- [x] 4.1 Checklist: agregación lineal; semántica N/M; sin P13/P14/mock/backend; sin PII.
- [x] 4.2 Confirmar deltas: `admin-attendances-frontend` ADDED; `frontend-http-services` solo si HTTP tocado.
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` + focused tests; sin trailing whitespace.
