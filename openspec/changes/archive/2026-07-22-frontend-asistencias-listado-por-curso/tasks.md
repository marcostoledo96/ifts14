# Tasks: Frontend — listado de asistencias por curso

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500–700 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 listado → PR2 intermedia+rutas |
| Delivery strategy | ask-on-risk → **size:exception** (Marcos, 2026-07-22) |
| Chain strategy | N/A (Units 1+2 same branch / single delivery) |

Decision needed before apply: No (resolved: size-exception)
Chained PRs recommended: Yes (forecast)
Chain strategy: size-exception — Units 1+2 together
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Listado solo cursos + specs | PR1 → `feat/asistencias-listado-por-curso` | `npx ng test --include='**/attendances-list-page.spec.ts' --no-watch --browsers=ChromeHeadless` | Mock: `/admin/asistencias` filas=cursos | Revert `pages/list/*` |
| 2 | Intermedia + rutas + specs | PR2 base=PR1 | `npx ng test --include='**/attendance-course-dates-page.spec.ts' --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless` | Mock: curso→fechas→marcado | Revert `pages/course-dates/*` + `app.routes*` |

Base paths: `apps/frontend-angular/src/app/` · Feature: `features/admin/attendances/`  
Done global: specs verdes; sin cambios BE/mock hub/marcado; CTA listado→intermedia→marcado.

## Phase 1: RED — listado (Unit 1)

- [x] 1.1 RED `attendances/pages/list/attendances-list-page.spec.ts`: filas = cursos seed (no flatten fechas); Done: falla vs UI actual.
- [x] 1.2 RED mismo spec: búsqueda nombre/código; sin chips `programada`/`realizada`; métricas N asistibles (+M con presentes); sin `alumnosActivos` como total; CTA → `/admin/asistencias/curso/:id`; curso 0 fechas visible.

## Phase 2: GREEN — listado (Unit 1)

- [x] 2.1 `attendances-list-page.ts`: `FilaCurso` desde `listarHub()`; conteos fechas ≠`cancelada` y con ≥1 presente; quitar filtro chips fecha.
- [x] 2.2 `attendances-list-page.html` (+css): tabla/cards 1 fila/curso; búsqueda; métricas honestas; CTA intermedia; copy intro; estados skeleton/error/empty.
- [x] 2.3 GREEN: pasar 1.1–1.2.

## Phase 3: RED — intermedia + rutas (Unit 2)

- [x] 3.1 RED crear `attendances/pages/course-dates/attendance-course-dates-page.spec.ts`: solo fechas ≠`cancelada`; chips/filtro `programada`|`realizada`; CTA → `/admin/cursos/:id/fechas/:fechaId/asistencias`; empty + link `/admin/cursos/:id`; curso ausente = error controlado.
- [x] 3.2 RED `app.routes.spec.ts`: `asistencias/curso/:id` resuelve intermedia; ruta **antes** de `asistencias`.

## Phase 4: GREEN — intermedia + rutas (Unit 2)

- [x] 4.1 Crear `attendance-course-dates-page.{ts,html,css}`: `listarHub()` filtrado por `:id`; chips; CTA «Tomar asistencia»; empty/error/skeleton.
- [x] 4.2 `app.routes.ts`: lazy `asistencias/curso/:id` **antes** de `asistencias`.
- [x] 4.3 GREEN: pasar 3.1–3.2.

## Phase 5: Verify

- [x] 5.1 Corrida focal Units 1–2 + `npx tsc --noEmit -p apps/frontend-angular/tsconfig.app.json`.
- [x] 5.2 Smoke manual mock — cubierto por specs focales (123); browser staging post-deploy: listado→intermedia→marcado; empty 0 fechas; id inexistente.
- [x] 5.3 Confirmar no tocados: HTTP/mock hub, marking, certificados (salvo navegación saliente).
