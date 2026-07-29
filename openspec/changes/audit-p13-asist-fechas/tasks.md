# Tasks: Auditoría P13 — intermedia de fechas de asistencia

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~40–120 (página + tests; HTTP 0) |
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
| 1 | errorRecuperable + títulos + tests intermedia | PR 1 | `npx ng test --include='**/attendance-course-dates-page.spec.ts' --no-watch --browsers=ChromeHeadless` | Staging `/admin/asistencias/curso/:id` (opcional) | Revertir `attendance-course-dates-page.*` + delta spec |

Base: `apps/frontend-angular/src/app/features/admin/attendances/pages/course-dates/`

## Phase 1: Error recuperable (TS)

- [x] 1.1 En `attendance-course-dates-page.ts`: añadir `readonly errorRecuperable = signal(false)`.
- [x] 1.2 En `cargar`: al inicio `errorRecuperable.set(false)`; id inválido → error + `false` + return; curso ausente → error + `false`; `catch` → mensaje carga + `true`.
- [x] 1.3 `onReintentar()`: no-op si `!errorRecuperable()`; si OK → `void this.cargar()`.
- [x] 1.4 No alterar sort cronológico, chips, `linkMarcado`, empty ni `loadGen` semantics.

## Phase 2: Panel de error (HTML)

- [x] 2.1 En `attendance-course-dates-page.html`: título `@if (errorRecuperable())` → «No pudimos cargar las fechas»; `@else` → «Curso no encontrado».
- [x] 2.2 Reintentar solo `@if (errorRecuperable())`; Volver a Asistencias siempre visible en el panel.
- [x] 2.3 Conservar mensaje `{{ error() }}` y back-link superior intactos.

## Phase 3: Tests de honesty + regresión

- [x] 3.1 En `attendance-course-dates-page.spec.ts`: id `abc` → título not-found, Volver, sin Reintentar, `errorRecuperable` false.
- [x] 3.2 Curso `9999` ausente → mismo contrato not-found sin Reintentar.
- [x] 3.3 Stub `listarHub` reject → título carga, Reintentar+Volver; click Reintentar re-llama `listarHub`; mensaje sin DNI/token.
- [x] 3.4 Regresión: orden cronológico, chips, CTA marcado, empty+link detalle, Volver hub, reset filtros al cambiar `:id`.
- [x] 3.5 Focused `attendance-course-dates-page.spec.ts` hasta verde.

## Phase 4: Cierre P13

- [x] 4.1 Checklist: Reintentar solo recuperable; títulos distintos; sin HTTP/hub/marcado; sin PII; semántica orden/filtros/CTA intacta.
- [x] 4.2 Confirmar delta `specs/admin-attendances-frontend/spec.md` (sin drift).
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` + focused tests; sin trailing whitespace.
