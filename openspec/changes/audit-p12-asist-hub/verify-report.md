```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:318577e65676fcaa297441f60fc45ac66344a493de65ce704a1c57e131b26d96
verdict: pass
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 4/4
test_command: npx ng test --include='**/attendances-list-page.spec.ts' --no-watch --browsers=ChromeHeadless && npx ng test --include='**/http-attendance.service.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:333e016c09a102937fbbc955c1347336bd163a702b7fcbb6dff348b640f528b5
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

## Verification Report

**Change**: audit-p12-asist-hub
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**Branch**: `audit/p12-asist-hub`
**Base prevista**: `staging1.0`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 13 |
| Tasks complete | 13 |
| Tasks incomplete | 0 |

Fases 1–4 marcadas `[x]` en `openspec/changes/audit-p12-asist-hub/tasks.md` (incluye HTTP 3.1–3.2 aplicados, no N/A).

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
TypeScript: No errors found
exit 0
```

**Tests**: 29 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && npx ng test --include='**/attendances-list-page.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 15 SUCCESS
exit 0

cd apps/frontend-angular && npx ng test --include='**/http-attendance.service.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 14 SUCCESS
exit 0
```

**Coverage**: Not available / threshold: 0 → Not available

**Alcance**: PERF lineal en `AttendancesListPage.cargar`; HTTP one-pass en `HttpAttendanceService.listarHub`. Mock intacto. Sin trailing whitespace en fuentes tocadas. Sin P13/P14/backend.

### Spec Compliance Matrix

#### admin-attendances-frontend — Agregación lineal de métricas del hub

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Agregación lineal de métricas del hub | Agregación en tiempo lineal | `attendances-list-page.spec.ts` > métricas + cancelada (ejercen `cargar`); fuente sin `hub.fechas.some` anidado | COMPLIANT |
| Agregación lineal de métricas del hub | Cancelada excluida del conteo | `attendances-list-page.spec.ts` > fecha cancelada con presentes no suma a N ni M | COMPLIANT |
| Agregación lineal de métricas del hub | Sin alumnosActivos como total | `attendances-list-page.spec.ts` > métricas honestas…; fecha cancelada… (alumnosActivos=99 no aparece) | COMPLIANT |

#### frontend-http-services — listarHub HTTP (condicional; apply sí editó HTTP)

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| listarHub HTTP (condicional al apply) | listarHub GET y mapeo DTO | `http-attendance.service.spec.ts` > listarHub hace GET a /admin/hub/asistencias | COMPLIANT |
| listarHub HTTP (condicional al apply) | HTTP omitido — delta N/A | (precondición falsa: HTTP sí editado) | N/A |

**Compliance summary**: 4/4 escenarios aplicables compliant (1 N/A por rama condicional HTTP).

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Índices lineales en `cargar` | Implemented | `asistibleById`, `fechasPorCurso`, `presentesPorCurso`; skip `cancelada` |
| Sin barrido anidado | Implemented | Ausencia de `.some(` / `hub.fechas.some` en la página |
| N/M semántica | Implemented | N = asistibles; M = intersección presentes ∩ asistibles del curso |
| Sin `alumnosActivos` como total | Implemented | `FilaCurso` / `textoMetricas` solo usan N/M derivados |
| Sort / loadGen / errores | Implemented | `codigo.localeCompare`; gen stale; copy de error intacto |
| listarHub GET + mapeo | Implemented | `GET /admin/hub/asistencias`; un `toAsistencia` + array reutilizado |
| Mock intacto | Confirmed | Sin diff en `attendance-mock.service.ts` |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Map fecha→curso + conteos lineales | Yes | Coincide con pseudo del design |
| Helper puro opcional | Yes | Inline en `cargar` (opción elegida) |
| Semántica N/M conservada | Yes | Tests CUR-001/005 + cancelada |
| HTTP one-pass incluido | Yes | Diff +3/−1 en `listarHub` |
| Mock fuera de alcance | Yes | Sin cambios |
| Sin assert big-O | Yes | Evidencia estructural + semántica, según design |
| Sin P13/P14/backend | Yes | Diff acotado a list + HTTP + openspec |

### Issues Found

**CRITICAL**: None

**WARNING**: None

**SUGGESTION**: El escenario «Agregación en tiempo lineal» se verifica por ausencia de barridos anidados y tests semánticos (estrategia del design); no hay microbenchmark de complejidad — aceptable para este cierre.

### Verdict

**PASS**

13/13 tareas completas; 2/2 requisitos y 4/4 escenarios aplicables compliant; `tsc` exit 0; attendances-list-page 15 SUCCESS; http-attendance 14 SUCCESS. PERF lineal + HTTP one-pass aplicados. Listo para `sdd-archive` (sin archivar en esta fase).
