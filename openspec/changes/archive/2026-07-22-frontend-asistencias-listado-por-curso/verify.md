```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:75d876d023fe0c73f729d1a686ce45cb388c3172b8c574312cc344520f6c483f
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 3/3
scenarios: 14/14
test_command: cd apps/frontend-angular && npx ng test --include='**/attendances-list-page.spec.ts' --include='**/attendance-course-dates-page.spec.ts' --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:d43afc1ec203b367dd02e72291cc7705a58329fa8ec6fdb124cdc9c044def380
build_command: cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a
```

## Verification Report

**Change**: frontend-asistencias-listado-por-curso
**Version**: delta admin-attendances-frontend (Opción A)
**Mode**: Standard (`strict_tdd: false`; TDD por tasks RED→GREEN)
**Branch**: feat/asistencias-listado-por-curso @ `b1287a15982b0fbf8b1da9d701f8fb105d3debc3`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 13 |
| Tasks complete | 13 |
| Tasks incomplete | 0 |

Notes on 5.2: marked complete with automated substitute (list + course-dates + routes focal suite). Browser smoke on staging deferred (local `ng serve` requires HttpAdminAuth/API).

### Build & Tests Execution

**Build**: ✅ Passed
```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
TypeScript: No errors found
exit 0
output sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a
```

**Tests (focal Units 1+2)**: ✅ 123 passed / ❌ 0 failed / ⚠️ 0 skipped
```text
cd apps/frontend-angular && npx ng test \
  --include='**/attendances-list-page.spec.ts' \
  --include='**/attendance-course-dates-page.spec.ts' \
  --include='**/app.routes.spec.ts' \
  --no-watch --browsers=ChromeHeadless
TOTAL: 123 SUCCESS (1.221 secs)
exit 0
output sha256:d43afc1ec203b367dd02e72291cc7705a58329fa8ec6fdb124cdc9c044def380
```

**Supplemental (MODIFIED scenario — course detail entry)**: ✅ 12 SUCCESS
```text
npx ng test --include='**/course-detail-page.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 12 SUCCESS
output sha256:37c7ddc7278264b0f6eceb4baf215289b6730e62cad9922c77de686003b237da
```

**Coverage**: ➖ Not available (no coverage threshold run in this verify)

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Listado solo por curso | Filas = cursos | `attendances-list-page.spec.ts` > renderiza una fila por curso del seed | ✅ COMPLIANT |
| Listado solo por curso | Búsqueda por nombre o código | `…` > filtrar por código / fragmento de nombre | ✅ COMPLIANT |
| Listado solo por curso | Sin chips de estado de fecha | `…` > no ofrece chips programada/realizada | ✅ COMPLIANT |
| Listado solo por curso | Métricas honestas | `…` > métricas honestas (sin alumnosActivos) | ✅ COMPLIANT |
| Listado solo por curso | Curso sin fechas asistibles | `…` > CUR-005 visible + `attendance-course-dates-page.spec.ts` empty | ✅ COMPLIANT |
| Página intermedia | Fechas asistibles | `attendance-course-dates-page.spec.ts` > lista no canceladas + chips filtro | ✅ COMPLIANT |
| Página intermedia | CTA al marcado | `…` > CTA Tomar asistencia → `/admin/cursos/:id/fechas/:fechaId/asistencias` | ✅ COMPLIANT |
| Página intermedia | Empty sin fechas | `…` > empty + link `/admin/cursos/5` | ✅ COMPLIANT |
| Página intermedia | Curso inexistente | `…` > id 9999 / id inválido error controlado | ✅ COMPLIANT |
| Página intermedia | Orden de ruta | `app.routes.spec.ts` > orden ANTES + runtime instancia intermedia | ✅ COMPLIANT |
| Rutas protegidas | Acceso con sesión mock | `app.routes.spec.ts` > listado / intermedia / marcado con sesión | ✅ COMPLIANT |
| Rutas protegidas | Acceso sin sesión mock | `app.routes.spec.ts` > `/admin/asistencias` → `/admin/login` | ✅ COMPLIANT |
| Rutas protegidas | Entrada desde detalle de curso | `course-detail-page.spec.ts` > CTAs Cargar/Ver → marcado | ✅ COMPLIANT |
| Rutas protegidas | Camino hub asistencias | list CTA intermedia + course-dates CTA marcado + routes runtime | ✅ COMPLIANT |

**Compliance summary**: 14/14 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Listado global solo por curso | ✅ Implemented | `FilaCurso` from `listarHub()`; search; no date chips; metrics N/M; CTA `/admin/asistencias/curso/:id` |
| Página intermedia de fechas | ✅ Implemented | `AttendanceCourseDatesPage`; filter ≠cancelada; chips; CTA «Tomar asistencia»; empty/error |
| Rutas protegidas + camino hub | ✅ Implemented | `asistencias/curso/:id` declared before `asistencias`; guards unchanged |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| `listarHub()` + client filter for intermediate | ✅ Yes | No N+1 / no COURSES_SOURCE.obtener for dates |
| `FilaCurso` including 0 dates | ✅ Yes | CUR-005 / VACIO visible |
| Search only on list; date chips on intermediate | ✅ Yes | |
| Honest date metrics (not alumnosActivos) | ✅ Yes | |
| Single CTA «Tomar asistencia» on intermediate | ✅ Yes | |
| List CTA label | ⚠️ Intentional deviation | List uses «Ver fechas» (apply-progress); design CTA verb applies to intermediate |
| Route order intermediate before list | ✅ Yes | Asserted in routes spec |
| HTTP/mock hub / marking untouched | ✅ Yes | No git changes under data/ or marking/ |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Staging browser smoke (listado→intermedia→marcado, CUR-005 empty, id 9999) pending post FE deploy — local serve needs HttpAdminAuth/API. Task 5.2 accepted automated coverage as verify substitute.
2. `apply-progress.md` still says 5.2 pending / 12/13 while `tasks.md` has 13/13 checked — doc drift for archive.
3. Design open question (course-state chip on list row) resolved as yes in UI; not a blocker.

**SUGGESTION**:
1. Align `apply-progress.md` during archive.
2. Optional: add routes spec for `/admin/asistencias/curso/:id` without session (same guard as list; low risk).

### Verdict

**PASS WITH WARNINGS**

All 14 delta scenarios have passing covering tests; focal suite 123 SUCCESS; tsc clean; tasks 13/13 complete. Residual: staging QA smoke deferred + apply-progress drift. Ready for `sdd-archive` after noting staging QA outside local verify.
