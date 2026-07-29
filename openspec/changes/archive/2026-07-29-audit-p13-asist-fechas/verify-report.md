```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:e118ec37fdb89538f85ce65dedd095d9f061ee70fe4ed543b00553498782771d
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 5/6
test_command: npx ng test --include='**/attendance-course-dates-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:160830199b9b24a5b4da84910e9754b1bc2b2982ec3b32e922dde0906c02beca
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a
```

## Verification Report

**Change**: audit-p13-asist-fechas
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**Branch**: `audit/p13-asist-fechas`
**Base prevista**: `staging1.0`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 15 |
| Tasks complete | 15 |
| Tasks incomplete | 0 |

Fases 1–4 marcadas `[x]` en `openspec/changes/audit-p13-asist-fechas/tasks.md` (Apply result: 15/15).

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
TypeScript: No errors found
EXIT:0
```

**Tests**: 10 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && npx ng test --include='**/attendance-course-dates-page.spec.ts' --no-watch --browsers=ChromeHeadless
Chrome Headless: Executed 10 of 10 SUCCESS
TOTAL: 10 SUCCESS
EXIT:0
```

**Coverage**: Not available → umbral N/A

### Spec Compliance Matrix

Requisito delta: **Página intermedia de fechas del curso** (`admin-attendances-frontend`).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Página intermedia de fechas del curso | Fechas asistibles | `attendance-course-dates-page.spec.ts` > lista solo fechas no canceladas; chips programada/realizada | COMPLIANT |
| Página intermedia de fechas del curso | CTA al marcado | `attendance-course-dates-page.spec.ts` > CTA Tomar asistencia apunta al marcado existente | COMPLIANT |
| Página intermedia de fechas del curso | Empty sin fechas | `attendance-course-dates-page.spec.ts` > empty claro con enlace al detalle del curso | COMPLIANT |
| Página intermedia de fechas del curso | Curso inexistente o id inválido sin Reintentar | `attendance-course-dates-page.spec.ts` > curso ausente 9999; id inválido abc | COMPLIANT |
| Página intermedia de fechas del curso | Fallo recuperable con Reintentar | `attendance-course-dates-page.spec.ts` > fallo recuperable listarHub + re-llamada | COMPLIANT |
| Página intermedia de fechas del curso | Orden de ruta | Cubierto en `app.routes.spec.ts` (preexistente); no re-ejecutado en suite focalizada P13 | PARTIAL |

**Compliance summary**: 5/6 escenarios COMPLIANT; 1/6 PARTIAL (orden de ruta sin re-ejecución en esta corrida).

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| errorRecuperable | Implemented | `signal(false)`; false al inicio / id inválido / curso ausente; true solo en `catch` de `listarHub` |
| Títulos distintos | Implemented | HTML: recuperable → «No pudimos cargar las fechas»; else → «Curso no encontrado» |
| Reintentar condicional | Implemented | Botón solo `@if (errorRecuperable())`; `onReintentar` no-op si false; Volver siempre |
| HTTP / listarHub | Unchanged | Ningún archivo HTTP/service en el diff de producto FE vs `staging1.0` |
| Sort / chips / CTA / empty | Intactos | Sin cambios de semántica; tests de regresión verdes |
| Sin PII | Implemented | Mensajes fijos; asserts sin DNI/token en escenario recuperable |
| Trailing whitespace | Clean | Sin coincidencias en `course-dates/` |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Alcance solo course-dates | Yes | Diff producto: `.ts` / `.html` / `.spec.ts` de course-dates |
| errorRecuperable solo en catch | Yes | Coincide con flujo del design |
| Título bifurcado por flag | Yes | `@if (errorRecuperable())` en h2 `.estado-title` |
| Gate onReintentar | Yes | Early return si `!errorRecuperable()` |
| No tocar HTTP/hub/marcado | Yes | Hub P12 y marcado P14 fuera del diff de producto |
| Threat matrix N/A | Yes | Sin superficie nueva |

### Issues Found

**CRITICAL**: None

**WARNING**:
- Escenario «Orden de ruta»: hay tests en `app.routes.spec.ts` (orden seguro + navegación a intermedia), pero no se re-ejecutaron en la suite focalizada de verify. La ruta no fue modificada por P13; riesgo residual bajo.

**SUGGESTION**:
- Opcional antes del merge: `npx ng test --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless` para cerrar el PARTIAL a COMPLIANT con evidencia runtime en esta corrida.

### Verdict

**PASS WITH WARNINGS**

15/15 tareas completas; `errorRecuperable` y títulos distintos aplicados; HTTP de producto intacto; focused suite 10/10 SUCCESS y `tsc` limpio. Un escenario de ruta preexistente queda PARTIAL por no re-ejecutar `app.routes.spec.ts` en esta verificación.
