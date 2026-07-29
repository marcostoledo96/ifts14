```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:5c238fe83a76bc19b889a8ff1ceaf4fe020da4a97a2f4d0d562329caf2ca7abf
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 5/5
test_command: npx ng test --include='**/student-detail-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:24e9f1e44334f32a095c4b87f4c896c5dbc058b631fd4d2814487509d03b4f5a
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a
```

## Verification Report

**Change**: audit-p11-alumnos-detail
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**PR**: [#96](https://github.com/marcostoledo96/ifts14/pull/96) → `staging1.0` (OPEN)
**Branch**: `audit/p11-alumnos-detail`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 16 |
| Tasks complete | 16 |
| Tasks incomplete | 0 |

Fases 1–4 marcadas `[x]` en `openspec/changes/audit-p11-alumnos-detail/tasks.md`.

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
TypeScript: No errors found
exit 0
```

**Tests**: 14 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && npx ng test --include='**/student-detail-page.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 14 SUCCESS
exit 0
```

**Coverage**: Not available / threshold: 0 → Not available

**Alcance HTTP/backend**: sin cambios en `http-students.service.ts` ni backend PHP en el diff del detalle P11. Sin trailing whitespace en `student-detail-page.*`.

### Spec Compliance Matrix

Requisito delta: **Detalle administrativo consistente** (`admin-students-frontend`).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Detalle administrativo consistente | Ficha de alumno admin | `student-detail-page.spec.ts` > debe renderizar la información de un alumno del seed con DNI completo | COMPLIANT |
| Detalle administrativo consistente | Cursos y certificaciones consistentes | `…` > enlaza Ver certificación…; habilita Nueva certificación y Emitir… | COMPLIANT |
| Detalle administrativo consistente | Métricas cero vs ausente | `…` > muestra métricas: revocadas 0…; muestra «—» cuando certificacionesRevocadas es null | COMPLIANT |
| Detalle administrativo consistente | Fallo recuperable con Reintentar | `…` > fallo recuperable muestra Reintentar y Volver; Reintentar re-llama obtener sin PII | COMPLIANT |
| Detalle administrativo consistente | ID inválido o no encontrado sin Reintentar | `…` > ID no encontrado; ID inválido; id inválido descarta carga en vuelo | COMPLIANT |

**Compliance summary**: 5/5 escenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Copy sin legajo | Implemented | Kicker «Ficha», chip `#id`, título error «ficha»; asserts sin `/legajo/` |
| Métricas null→«—», 0→0 | Implemented | `formatoMetrica` en las tres métricas; `tieneRevocadas` solo estilo >0 |
| Reintentar solo recuperable | Implemented | `errorRecuperable` true solo en `catch` de `cargar` |
| Id inválido / no encontrado | Implemented | Solo Volver; `loadGeneration++` invalida cargas en vuelo |
| DNI completo UI / sin PII en errores | Implemented | Asserts DNI en ficha; error sin DNI/token |
| HTTP / listado / editor / backend | Out of scope | Diff detalle sin HTTP; `estadoCert` unknown no tocado |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Solo `student-detail-page.*` | Yes | Producto P11 acotado al detail |
| Eliminar copy legajo + kicker Ficha | Yes | CSS `.kicker-ficha` |
| Revocadas null→«—» | Yes | Sin coerce null→0 |
| Presentación métrica | Partial | Design proponía ternario template; post-4R unificó `formatoMetrica` (paridad listado) |
| `errorRecuperable` | Yes | Patrón P10 |
| `estadoCert` unknown diferido | Yes | Sin remap unknown→pendiente |
| Race id inválido | Extra post-4R | `loadGeneration++` + test de carrera (fortalece el flujo del design) |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Design documentaba ternarios en template; la implementación post-4R usa `formatoMetrica` en las tres métricas y `tieneRevocadas` para estilo. Cumple el spec; el design quedó levemente desactualizado.
2. El PR #96 incluye archive de P10 y updates en `openspec/specs/` además del cambio P11 (alcance de PR más amplio que el change folder solo).

**SUGGESTION**:
1. En archive, alinear una línea del design con `formatoMetrica` / `tieneRevocadas` / bump de `loadGeneration` en id inválido.
2. Confirmar en archive que el merge a `openspec/specs/admin-students-frontend` refleje el delta P11 sin duplicar trabajo de P10.

### Post-4R checks (confirmados)

| Check | Evidence |
|-------|----------|
| `loadGeneration` bump en id inválido/ausente | `student-detail-page.ts` constructor; test de carrera |
| `formatoMetrica` en tres métricas | HTML líneas de cursos/válidas/revocadas |
| `tieneRevocadas` helper | TS + binding CSS destructivo solo si >0 |
| 14 tests SUCCESS | Karma TOTAL: 14 SUCCESS |
| HTTP no tocado | Diff vs staging1.0 sin `http-students*` |

### Verdict

**PASS WITH WARNINGS**

16/16 tareas completas, 5/5 escenarios del delta con tests en verde (14 SUCCESS), typecheck limpio. Warnings solo por drift menor design↔post-4R y alcance documental del PR; sin blockers ni hallazgos críticos.
