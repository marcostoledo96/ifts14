# Tasks: Auditoría P10 — editor de alumnos

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~120–280 (editor + tests; HTTP 0 sin evidencia) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Copy + Reintentar + tests edit/409 | PR 1 | `npx ng test --include=**/student-editor-page.spec.ts --no-watch --browsers=ChromeHeadless` | Staging nuevo / `:id/editar` (opcional; gate 409) | Revertir `student-editor-page.*` |
| 2 | HTTP `actualizar` 409 (si evidencia) | mismo PR o omitir | `npx ng test --include=**/http-students.service.spec.ts --no-watch --browsers=ChromeHeadless` | Smoke 409 update sin `existingStudentId` | Revertir `http-students.service.*` |

## Phase 1: Copy sin legajo

- [x] 1.1 En `student-editor-page.html`: quitar «legajo»/«legajos» de ayuda email e intro/labels (ficha/registro/perfil).
- [x] 1.2 En `student-editor-page.ts`: strings de copy si aplica; no tocar validación ni lote.
- [x] 1.3 `student-editor-page.css` solo si el copy rompe layout (esperable: no).

## Phase 2: Error de carga recuperable

- [x] 2.1 En `student-editor-page.ts`: `errorCargaRecuperable` (true solo en `catch` de `cargarEdicion`); id inválido/null → no recuperable.
- [x] 2.2 `onReintentar()` → `cargarEdicion(id)` del modo edit.
- [x] 2.3 En HTML: **Reintentar** si recuperable + «Volver a Alumnos» siempre; CSS solo si hace falta.

## Phase 3: Conservar create/edit y 409

- [x] 3.1 Create: lote + `resultadoLote` sin navegar; `dniMostrar` completo; `mensajeErrorAlta` sin DNI/token.
- [x] 3.2 Edit: `actualizar` OK → `/admin/alumnos/:id`; 409 → `StudentDuplicateError` + enlace si hay id.
- [x] 3.3 Ajustar TS/HTML solo si falta comportamiento; no rediseñar lote ni post-alta.

## Phase 4: Tests del editor

- [x] 4.1 En `student-editor-page.spec.ts`: copy sin «legajo»/«legajos».
- [x] 4.2 Edit (`setInput`): carga OK; null→no encontrado; id inválido → solo Volver.
- [x] 4.3 Fallo recuperable: Reintentar+Volver; Reintentar re-llama `obtener`.
- [x] 4.4 Edit: navigate tras OK; 409+enlace; mensajes sin DNI/token.
- [x] 4.5 Regresión create: lote sin navegar; DNI UI; 409 create con enlace.
- [x] 4.6 Focused `student-editor-page.spec.ts` hasta verde.

## Phase 5: HttpStudentsService (OPTIONAL)

- [x] 5.1 Gate 409 `actualizar` sin `existingStudentId`. Sin evidencia → omitir HTTP.
- [x] 5.2 Solo con evidencia: `findIdByDni` en `actualizar` + spec; sin PII en logs. — N/A (omitido)
- [x] 5.3 Si omitido: `http-students.service.*` intactos; 5.2 N/A.

## Phase 6: Cierre P10

- [x] 6.1 Checklist: sin legajo; Reintentar; lote KEEP; 409/DNI; sin listado/detalle/backend.
- [x] 6.2 Confirmar deltas specs (sin reescribir salvo drift).
- [x] 6.3 `npx tsc --noEmit -p tsconfig.app.json` + focused tests; sin trailing whitespace.
