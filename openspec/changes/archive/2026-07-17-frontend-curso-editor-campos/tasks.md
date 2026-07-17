# Tasks: Editor de curso — paridad v0 con contrato estricto

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600–900 (CSS de layout concentrado) |
| 400-line budget risk | High |
| Chained PRs recommended | No |
| Suggested split | single cycle |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Editor completo (layout + toggle + aviso + guardar) | single (`size:exception`) | `ng test --include='**/course-editor-page.spec.ts'` | N/A (Karma unit) | 4 archivos del editor |

## Phase 1: Estado del componente (TDD)

- [x] 1.1 RED: tests toggle (off→cerrado, on→activo, original no-activo conservado, sin cambio→sin PATCH) y aviso `impactoRealizadas`
- [x] 1.2 GREEN: `estadoOriginal`, `activo`, `estadoResultante()`, `impactoRealizadas` computed, `fechasOriginales`

## Phase 2: guardar() en edición

- [x] 2.1 RED: guardar edit llama `actualizarEstado` condicional antes de `reemplazarFechas`; error honesto
- [x] 2.2 GREEN: orquestación en `guardar()`, refresh de detalle local, mensaje ok

## Phase 3: Template + CSS v0

- [x] 3.1 Grid main+aside sticky, header con kicker/badges (código, activo)
- [x] 3.2 Create sin control de estado + copy "se crea activo"; edit identidad read-only
- [x] 3.3 Tabla de fechas con índice `#` (01, 02…), contador, empty state; sin time ni badges de emitidos
- [x] 3.4 Aviso de impacto condicional; aside con acciones y metadatos honestos
- [x] 3.5 CSS: grid responsive, switch accesible, tabla, aside sticky

## Phase 4: Cierre apply

- [x] 4.1 Tests focalizados verdes (`course-editor-page.spec.ts` — 21/21)
- [x] 4.2 Marcar tasks `[x]` + `apply-progress.md`
- [x] 4.3 Persistir Engram (`apply-progress`); ready for verify, sin archive
