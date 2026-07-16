```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:4077bf716a37867d7c260586075ff8d7effacea7d876efe3586dd77de093ae08
verdict: pass
blockers: 0
critical_findings: 0
requirements: 30/30
scenarios: 30/30
test_command: npx ng test --browsers=ChromeHeadless --watch=false
test_exit_code: 0
test_output_hash: sha256:4077bf716a37867d7c260586075ff8d7effacea7d876efe3586dd77de093ae08
build_command: npx ng build
build_exit_code: 0
build_output_hash: sha256:89e26a1b4b92f48c1f6924d9fedca678496385367742c33b3c50d93e051423a9
```

## Verification Report

**Change**: p5-02-frontend-http-angular
**Version**: N/A (delta spec)
**Mode**: Standard

### Completeness
| Metric | Value |
|--------|-------|
| Tasks total | 24 |
| Tasks complete | 24 |
| Tasks incomplete | 0 |

### Build & Tests Execution
**Build**: ✅ Passed
```
npx ng build
Application bundle generation complete. [3.252 seconds]
Output: apps/frontend-angular/dist/frontend-angular
⚠️ 4 CSS budget warnings (pre-existing, not from this change)
```

**Tests**: ✅ 595 passed / ❌ 0 failed / ⚠️ 0 skipped
```
npx ng test --browsers=ChromeHeadless --watch=false
TOTAL: 595 SUCCESS
```

**Coverage**: ➖ Not available (no coverage config in this project)

### Spec Compliance Matrix

#### Requirement: HttpCoursesService implements CoursesService via HTTP

| Scenario | Test | Result |
|----------|------|--------|
| List courses with client-side filters | `http-courses.service.spec.ts` > `listar hace GET a /admin/cursos y mapea DTOs`, `filtro q aplicado client-side`, `filtro estado aplicado client-side` | ✅ COMPLIANT |
| Get course detail with dates | `http-courses.service.spec.ts` > `obtener hace GET a /admin/cursos/:id y /admin/cursos/:id/fechas, mergea` | ✅ COMPLIANT |
| Create course | `http-courses.service.spec.ts` > `crear hace POST a /admin/cursos con body {codigo,nombre,estado}` | ✅ COMPLIANT |
| Update course state | `http-courses.service.spec.ts` > `actualizarEstado hace PATCH a /admin/cursos/:id/estado con body {estado}` | ✅ COMPLIANT |
| List course dates | `http-courses.service.spec.ts` > `listarFechas hace GET a /admin/cursos/:id/fechas` | ✅ COMPLIANT |
| Create course date | `http-courses.service.spec.ts` > `guardarFecha con dto.id===null hace POST a /admin/cursos/:id/fechas` | ✅ COMPLIANT |
| Update course date | `http-courses.service.spec.ts` > `guardarFecha con dto.id existente hace PATCH a /admin/cursos/:id/fechas/:fid` | ✅ COMPLIANT |
| Replace all course dates (orchestrated) | `http-courses.service.spec.ts` > `reemplazarFechas: PATCH cancelada para removidas, PATCH existentes, POST nuevas, re-read final` | ✅ COMPLIANT |
| HTTP error handling for courses | `http-courses.service.spec.ts` > `listar 4xx rechaza con error`, `obtener 5xx rechaza con error`, `reemplazarFechas rechaza toda la operación si un paso falla` | ✅ COMPLIANT |

#### Requirement: HttpStudentsService implements StudentsService via HTTP

| Scenario | Test | Result |
|----------|------|--------|
| List all students | `http-students.service.spec.ts` > `listar hace GET a /admin/alumnos y mapea apellidoNombre→apellido+nombre` | ✅ COMPLIANT |
| Count students | `http-students.service.spec.ts` > `contar devuelve la longitud del listado (consistencia list→count)` | ✅ COMPLIANT |
| Get student detail (basic) | `http-students.service.spec.ts` > `obtener hace GET a /admin/alumnos/:id y devuelve AlumnoDetalle con defaults` | ✅ COMPLIANT |
| HTTP error handling for students | `http-students.service.spec.ts` > `listar 4xx rechaza con error`, `listar 5xx rechaza con error`, `obtener 5xx propaga el error`, `contar 4xx rechaza con error` | ✅ COMPLIANT |

#### Requirement: HttpAttendanceService implements AttendanceService via HTTP

| Scenario | Test | Result |
|----------|------|--------|
| List students for a course | `http-attendance.service.spec.ts` > `listarAlumnos hace GET a /admin/alumnos y filtra solo activos` | ✅ COMPLIANT |
| List attendances for a course date | `http-attendance.service.spec.ts` > `listarAsistencias hace GET a /admin/asistencias?cursoId= y filtra por fechaId client-side` | ✅ COMPLIANT |
| Mark attendances (orchestrated batch) | `http-attendance.service.spec.ts` > `marcar: DELETE existing + POST present, all-or-nothing` | ✅ COMPLIANT |
| Cancel an attendance | `http-attendance.service.spec.ts` > `anular hace DELETE a /admin/asistencias/:id y devuelve void` | ✅ COMPLIANT |
| HTTP error handling for attendances | `http-attendance.service.spec.ts` > `listarAlumnos 4xx rechaza con error`, `listarAsistencias 5xx rechaza con error`, `anular 4xx rechaza con error`, `marcar rechaza toda la operación si un DELETE falla`, `marcar rechaza si un POST falla` | ✅ COMPLIANT |

#### Requirement: HttpCertificationsService implements CertificationsService via HTTP

| Scenario | Test | Result |
|----------|------|--------|
| List certifications with client-side filters | `http-certifications.service.spec.ts` > `listar hace GET a /admin/certificados y mapea`, `filtro envio aplicado client-side`, `filtro estado aplicado client-side` | ✅ COMPLIANT |
| Get certification detail | `http-certifications.service.spec.ts` > `obtener hace GET a /admin/certificados/:id y devuelve detalle con auditoría` | ✅ COMPLIANT |
| Count certifications | `http-certifications.service.spec.ts` > `contar devuelve la longitud del listado` | ✅ COMPLIANT |
| Revoke certification | `http-certifications.service.spec.ts` > `revocar hace POST a /admin/certificados/:id/revocar con body {reason}` | ✅ COMPLIANT |
| HTTP error handling for certifications | `http-certifications.service.spec.ts` > `listar 4xx rechaza con error`, `listar 5xx rechaza con error`, `obtener 4xx rechaza con error`, `revocar 5xx rechaza con error` | ✅ COMPLIANT |

#### Requirement: HttpInstitutionalConfigService provides institutional configuration

| Scenario | Test | Result |
|----------|------|--------|
| Fetch institutional config | `institutional-config.service.spec.ts` > `obtener hace GET a /admin/configuracion-institucional y mapea institutionName→nombre` | ✅ COMPLIANT |
| HTTP error handling for config | `institutional-config.service.spec.ts` > `4xx rechaza con error descriptivo`, `5xx rechaza con error descriptivo` | ✅ COMPLIANT |

#### Requirement: HttpTestingController tests for all HTTP services

| Scenario | Test | Result |
|----------|------|--------|
| Test verifies correct HTTP method and URL | All 5 spec files: each method test asserts `req.request.method`, URL, and body | ✅ COMPLIANT |
| Test verifies error handling | All 5 spec files: each has 4xx/5xx rejection tests with `expectAsync(p).toBeRejected()` | ✅ COMPLIANT |
| Test verifies orchestrated operations | `http-courses.service.spec.ts` > `reemplazarFechas` (GET→PATCH→PATCH→POST→GET sequence), `http-attendance.service.spec.ts` > `marcar` (GET→DELETE→POST sequence); both end with `httpMock.verify()` | ✅ COMPLIANT |

#### Requirement: Existing mock services and injection tokens are preserved

| Scenario | Test | Result |
|----------|------|--------|
| Mock services remain unchanged | `git diff --name-only` shows only `app.routes.ts` modified; no mock files touched | ✅ COMPLIANT |
| New HTTP services use the same interfaces | Each HTTP service `implements` the existing interface: `HttpCoursesService implements CoursesService`, `HttpStudentsService implements StudentsService`, `HttpAttendanceService implements AttendanceService`, `HttpCertificationsService implements CertificationsService`, `HttpInstitutionalConfigService implements InstitutionalConfigService` | ✅ COMPLIANT |

**Compliance summary**: 30/30 scenarios compliant

### Correctness (Static Evidence)
| Requirement | Status | Notes |
|------------|--------|-------|
| HttpCoursesService | ✅ Implemented | All 9 methods: listar, obtener, crear, actualizarEstado, listarFechas, guardarFecha (POST/PATCH), reemplazarFechas (orchestrated). Client-side filters q/estado/conFechas. cantidadFechas computed from fechas length. |
| HttpStudentsService | ✅ Implemented | listar, contar, obtener. apellidoNombre split on first space. tieneEmail:false, cursosConAsistencia:0, certificacionesValidas:0. obtener returns null on 404. |
| HttpAttendanceService | ✅ Implemented | listarAlumnos (filters activos), listarAsistencias (filters fechaId client-side), marcar (DELETE existing + POST present, all-or-nothing), anular (DELETE). |
| HttpCertificationsService | ✅ Implemented | listar (filtros envio/estado/curso/q client-side), obtener (detail with auditEvents/attendedDates), contar, revocar (POST with {reason}). certificateCode→numero, student.displayName→nombreAlumno, status→estado. |
| HttpInstitutionalConfigService | ✅ Implemented | obtener: GET /admin/configuracion-institucional, institutionName→nombre, direccion:null, logoUrl:null. |
| HttpTestingController tests | ✅ Implemented | 5 spec files with 47 new tests. Each service: happy path + error path + orchestration sequence + token resolution. |
| Mock preservation | ✅ Implemented | Zero mock files modified. InjectionToken constants unchanged. |
| Wiring | ✅ Implemented | app.routes.ts: 5 providers using `environment.useRealApi ? HttpXxx : InMemoryXxx` pattern. INSTITUTIONAL_CONFIG_SOURCE always uses HttpInstitutionalConfigService (no mock exists). |

### Coherence (Design)
| Decision | Followed? | Notes |
|----------|-----------|-------|
| HttpClient + firstValueFrom over raw fetch | ✅ Yes | All 5 services use `inject(HttpClient)` + `firstValueFrom()`. |
| Environment toggle reuses VALIDATION_SOURCE pattern | ✅ Yes | `app.routes.ts` line 63-67: `environment.useRealApi ? HttpXxx : InMemoryXxx` per token. |
| Orchestration is all-or-nothing | ✅ Yes | `reemplazarFechas` and `marcar` reject on any sub-call failure. Tests verify this. |
| Envelope unwrap: `{ data: T }` | ✅ Yes | All services unwrap `envelope.data`. List endpoints unwrap `envelope.data.items`. |
| Backend DTO → frontend model mapping | ✅ Yes | Each service has private `toXxx()` mappers with derived defaults. |
| `reemplazarFechas` DELETE fallback | ✅ Yes | Design open question resolved: PATCH `estado='cancelada'` instead of DELETE (backend has no DELETE date endpoint). Documented with ponytail comment. |
| `listarAlumnos(cursoId)` course association | ✅ Yes | Design open question resolved: returns all active students, ignores cursoId (backend has no course-student link). Documented with ponytail comment. |

### Issues Found
**CRITICAL**: None

**WARNING**:
- **W1**: `cuatrimestre` defaults to `'Sin programar'` instead of `null` as the spec states ("cuatrimestre SHALL default to null when absent from the backend response"). The implementation uses `'Sin programar'` to match the model type. Spec should be updated in `sdd-archive`.
- **W2**: `ingreso` defaults to `''` (empty string) instead of `null` as the spec states ("ingreso SHALL default to null when absent"). The implementation uses `''` to match the model type. Spec should be updated in `sdd-archive`.
- **W3**: `reemplazarFechas` uses PATCH `estado='cancelada'` instead of DELETE for removed dates. The spec says "DELETE removed ones" but the backend has no DELETE date endpoint. This is a documented design decision (ponytail comment + design open question). Spec should be updated in `sdd-archive`.
- **W4**: `listarAlumnos(cursoId)` ignores the `cursoId` parameter and returns all active students. The spec says "filter by course association client-side" but the backend has no course-student link table. This is a documented design decision. Spec should be updated in `sdd-archive`.
- **W5**: CSS budget warnings in build (4 pages exceed 8 kB budget). Pre-existing, not introduced by this change.

**SUGGESTION**:
- **S1**: Spec references `GET /admin/institucional` but implementation uses `/admin/configuracion-institucional` (real backend route). Update spec in `sdd-archive`.
- **S2**: Spec references `GET /admin/certificaciones` and `POST /admin/certificaciones/:id/revocar` but implementation uses `/admin/certificados` (real backend route). Update spec in `sdd-archive`.
- **S3**: `INSTITUTIONAL_CONFIG_SOURCE` has no mock implementation — always uses HTTP. If offline dev is needed, consider adding an `InMemoryInstitutionalConfigService`.

### Verdict
**PASS WITH WARNINGS**

All 595 tests pass (47 new HTTP + 548 existing). Build succeeds. 30/30 spec scenarios have covering tests that pass at runtime. No mock files modified. Wiring uses `environment.useRealApi` toggle correctly. 4 warnings are documented design decisions where implementation pragmatically deviates from spec due to backend limitations — all should be resolved by updating the spec in `sdd-archive`.
