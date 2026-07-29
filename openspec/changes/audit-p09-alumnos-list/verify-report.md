```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:a370372c59e75bb6dfe80f05ebbcd1175f93fd00e339d0109fbbfe8656393de7
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 7/7
scenarios: 12/14
test_command: ./node_modules/.bin/ng test --include='**/students-list-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:e5d417bb3b310902503f251913f93ab842da7ff93b7295e33dbaade4ecdfa55d
build_command: ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Verification Report

**Change**: audit-p09-alumnos-list
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**PR**: https://github.com/marcostoledo96/ifts14/pull/94 (staging1.0; merge no requerido)
**HEAD**: da58e3a

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 15 |
| Tasks complete | 15 |
| Tasks incomplete | 0 |

Fase 4 HTTP marcada N/A de forma explícita (optionalCount preserva `0`; sin parche). Checklist apply cerrado.

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
exit 0 (stdout vacío)
```

**Tests**: 17 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && ./node_modules/.bin/ng test --include='**/students-list-page.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 17 SUCCESS (exit 0)
```

**Coverage**: Not available / threshold: 0 → Not available

**Whitespace**: `git diff staging1.0...HEAD --check` sobre listado + openspec → limpio.

**HTTP untouched**: sin diff en `http-students.service.ts` / `.spec.ts` vs `staging1.0`.

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Copy del listado sin legajo inventado | Intro y vacío honestos | `students-list-page.spec.ts` > intro y vacío total omiten legajo/legajos | COMPLIANT |
| Contacto por badge sin email literal | Badges de contacto | `students-list-page.spec.ts` > badges de contacto sin email literal; métricas 0… | COMPLIANT |
| Métricas numéricas en listado | Cero vs ausente | mismo test (`formatoMetrica(0)`/`null`) | COMPLIANT |
| Fuente administrativa con DNI completo | DTO y presentación administrativa | badges + `asocia Documento con el DNI completo…` | COMPLIANT |
| Fuente administrativa con DNI completo | Fuente según entorno | wiring `app.routes.ts` + inject `STUDENTS_SOURCE`; no re-ejecutado assert ternario useRealApi→Http en este verify | PARTIAL |
| Búsqueda y filtros | Búsqueda y filtro de contacto | busca por nombre…; combina búsqueda y Sin email… | COMPLIANT |
| Búsqueda y filtros | Entrada de búsqueda prohibida | combina búsqueda y Sin email; no encuentra email ni legajo… | COMPLIANT |
| Búsqueda y filtros | Alta con DNI duplicado | specs sibling (`student-editor-page` / `http-students` / in-memory); fuera de blast P9 list; no re-run | PARTIAL |
| Búsqueda y filtros | Filtros y paginación | busca… pagina de a veinte; reinicia y acota la página… | COMPLIANT |
| Búsqueda y filtros | Vistas accesibles | renderiza tabla desktop, tarjetas mobile… | COMPLIANT |
| Estados, detalle y QA | Estados distinguibles | presenta carga skeleton, error, vacío… | COMPLIANT |
| Estados, detalle y QA | QA y acceso al detalle | Vista QA…; no modifica QA fuera de desarrollo… | COMPLIANT |
| Corrección condicional mapeo métricas | Sin evidencia — no tocar HTTP | gate 1.1 + diff vacío HTTP + `optionalCount` preserva número | COMPLIANT |
| Corrección condicional mapeo métricas | Evidencia de mapeo roto — parche mínimo | precondición falsa (sin evidencia) → N/A | N/A |

**Compliance summary**: 12/14 escenarios aplicables COMPLIANT; 2 PARTIAL (preservados fuera del focused run); 1 N/A (rama condicional no tomada). Denominador reportado: 12/14 (PARTIAL no cuentan como complete).

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Copy sin legajo | Implemented | intro «Registro…»; vacío «su ficha…»; HTML sin «legajo» |
| Badges contacto | Implemented | Contacto disponible / Sin email / Sin dato; sin chip Con email |
| Métricas 0 vs — | Implemented | `formatoMetrica`; optionalCount HTTP intacto |
| DNI completo UI | Implemented | `dniMostrar` en tabla y cards |
| Filtros/pager/estados/QA | Implemented | chips v0; PAGE_SIZE 20; Reintentar; QA `isDevMode` |
| HTTP condicional | Implemented (omitido) | Fase 4 N/A correcta |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Solo `students-list-page.*` por defecto | Yes | diff producto: html + spec |
| Eliminar copy legajo | Yes | |
| Sin chip Con email | Yes | |
| Badges privacy | Yes | |
| HTTP solo con evidencia | Yes | omitido por inspección `optionalCount` |
| Gate evidencia vía smoke staging | Partial | design pedía smoke; apply usó code review (tasks 1.1) — aceptable y documentado |
| Sin editor/detalle/backend | Yes | |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Escenario «Fuente según entorno»: implementación cableada en `app.routes.ts`; no hubo assert runtime re-ejecutado en este verify focused.
2. Escenario «Alta con DNI duplicado»: preservado en delta MODIFIED; covered por specs sibling no re-ejecutados (fuera de alcance P9 listado).
3. Design: evidencia HTTP vía inspección de código en lugar de smoke staging (desvío menor, documentado en tasks).

**SUGGESTION**:
1. Antes o durante archive, opcional re-correr `http-students.service.spec.ts` + `student-editor-page.spec.ts` si se quiere cerrar los 2 PARTIAL.
2. Actualizar Engram tasks (decía 16/16 tests) a 17 SUCCESS alineado con runtime.

### Verdict

**PASS WITH WARNINGS**

15/15 tareas completas; tsc y 17/17 focused tests verdes; requisitos in-scope del listado COMPLIANT; HTTP N/A correcto; 2 escenarios preservados PARTIAL sin re-run + desvío menor del gate smoke.
