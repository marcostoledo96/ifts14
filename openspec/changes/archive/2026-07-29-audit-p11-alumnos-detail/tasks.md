# Tasks: Auditoría P11 — detalle de alumnos

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80–180 (detail page + tests; HTTP 0) |
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
| 1 | Copy + métricas + Reintentar + tests detalle | PR 1 | `npx ng test --include=**/student-detail-page.spec.ts --no-watch --browsers=ChromeHeadless` | Staging `/admin/alumnos/:id` (opcional) | Revertir `student-detail-page.*` + delta spec |

Base: `apps/frontend-angular/src/app/features/admin/students/pages/detail/`

## Phase 1: Copy sin legajo

- [x] 1.1 En `student-detail-page.html`: kicker «Ficha»; chip `#id` con title honesto; quitar «legajo»/«Legajo»/«legajos» de títulos/errores.
- [x] 1.2 En `student-detail-page.css`: rename `.kicker-legajo` → `.kicker-ficha` (o reusar `.kicker` si el estilo coincide).
- [x] 1.3 En `student-detail-page.ts`: strings de copy si aplica; no tocar trayectoria ni `estadoCert`.

## Phase 2: Métricas y error recuperable

- [x] 2.1 En `student-detail-page.ts`: quitar coerce null→0 de `certificacionesRevocadas`; métricas null→«—», `0`→`0` (ternario template como válidas/cursos).
- [x] 2.2 En `student-detail-page.ts`: signal `errorRecuperable` (true solo en `catch` de `cargar`; false en id inválido / null / éxito).
- [x] 2.3 `onReintentar()`: no-op si no recuperable; si OK → `cargar(id)` con misma generación/race.
- [x] 2.4 En HTML: Reintentar `@if (errorRecuperable())`; Volver siempre; revocadas null→«—».

## Phase 3: Tests del detalle

- [x] 3.1 En `student-detail-page.spec.ts`: copy sin «legajo»/«Legajo»/«legajos» (invertir asserts Legajo).
- [x] 3.2 Métricas: `certificacionesRevocadas` null→«—», `0`→`0`; sin regresión en válidas/cursos.
- [x] 3.3 Id inválido / no encontrado → solo Volver, sin Reintentar.
- [x] 3.4 Fallo recuperable: Reintentar+Volver; Reintentar re-llama `obtener`; mensaje sin DNI/token.
- [x] 3.5 Regresión: DNI completo UI; trayectoria/links; shell admin intacta.
- [x] 3.6 Focused `student-detail-page.spec.ts` hasta verde.

## Phase 4: Cierre P11

- [x] 4.1 Checklist: sin legajo; revocadas —/0; Reintentar solo recuperable; sin listado/editor/HTTP/backend; `estadoCert` intacto.
- [x] 4.2 Confirmar delta `specs/admin-students-frontend/spec.md` (sin reescribir salvo drift).
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` + focused tests; sin trailing whitespace.
