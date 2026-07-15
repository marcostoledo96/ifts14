# Tasks: P5-02 Frontend HTTP Angular Services

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~865 (11 new files + 1 modified) |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (InstitutionalConfig + Students) → PR 2 (Certifications + Attendance) → PR 3 (Courses + Wiring) |
| Delivery strategy | single-pr-default |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | InstitutionalConfig interface + HTTP + tests | PR 1 | `npx ng test --include='**/institutional-config/*.spec.ts'` | `ng build` | Remove `institutional-config/` dir |
| 2 | StudentsService HTTP + tests | PR 1 | `npx ng test --include='**/http-students.service.spec.ts'` | `ng build` | Remove `http-students.service.ts` + spec |
| 3 | CertificationsService HTTP + tests | PR 2 | `npx ng test --include='**/http-certifications.service.spec.ts'` | `ng build` | Remove `http-certifications.service.ts` + spec |
| 4 | AttendanceService HTTP + orchestration + tests | PR 2 | `npx ng test --include='**/http-attendance.service.spec.ts'` | `ng build` | Remove `http-attendance.service.ts` + spec |
| 5 | CoursesService HTTP + orchestration + tests | PR 3 | `npx ng test --include='**/http-courses.service.spec.ts'` | `ng build` | Remove `http-courses.service.ts` + spec |
| 6 | Wiring: env toggles in app.routes.ts | PR 3 | `npx ng test --include='**/app.config.spec.ts'` | `ng test && ng build` | Revert `app.routes.ts` changes |

## Phase 1: InstitutionalConfig

- [x] 1.1 Create `institutional-config/institutional-config.service.ts` with `InstitutionalConfig` interface, `InstitutionalConfigService` interface, and `INSTITUTIONAL_CONFIG_SOURCE` token
- [x] 1.2 Create `institutional-config/http-institutional-config.service.ts` — GET `/admin/configuracion-institucional`, map `institutionName`→`nombre`, default `direccion:null`/`logoUrl:null`
- [x] 1.3 Create `institutional-config/institutional-config.service.spec.ts` — test happy path GET + error 4xx/5xx rejection

## Phase 2: HttpStudentsService

- [x] 2.1 Create `students/http-students.service.ts` — `listar()` GET `/admin/alumnos`, `contar()` same, `obtener(id)` GET `/admin/alumnos/:id`
- [x] 2.2 Map backend `apellidoNombre`→`apellido`+`nombre` (split on first space), default `tieneEmail:false`, `ingreso:null`, `cursos:[]`
- [x] 2.3 Create `students/http-students.service.spec.ts` — test all 3 methods happy + error, list→count consistency, `obtener` returns `null` on 404

## Phase 3: HttpCertificationsService

- [x] 3.1 Create `certifications/http-certifications.service.ts` — `listar()` GET `/admin/certificados`, `obtener(id)`, `contar()`, `revocar(id,motivo)` POST `/admin/certificados/:id/revocar`
- [x] 3.2 Map backend fields: `certificateCode`→`numero`, `student.displayName`→`nombreAlumno`, `status`→`estado`, default `envio:'pendiente-entrega'`
- [x] 3.3 Apply `envio` filter client-side after fetching full list
- [x] 3.4 Create `certifications/http-certifications.service.spec.ts` — test all methods, client-side filter, revocar sends `{reason}`, error paths

## Phase 4: HttpCoursesService

- [x] 4.1 Create `courses/http-courses.service.ts` — `listar()` GET `/admin/cursos`, `obtener(id)` GET `/admin/cursos/:id` + `/admin/cursos/:id/fechas`
- [x] 4.2 Implement `crear(dto)` POST `/admin/cursos`, `actualizarEstado(id,estado)` PATCH `/admin/cursos/:id/estado`
- [x] 4.3 Implement `listarFechas(cursoId)` GET `/admin/cursos/:id/fechas`, `guardarFecha(cursoId,dto)` POST/PATCH
- [x] 4.4 Implement `reemplazarFechas(cursoId,dtos)` orchestration: GET current → diff → PATCH/ POST each, reject on any failure, final re-read
- [x] 4.5 Apply `q`/`conFechas` filters client-side; compute `cantidadFechas` from `fechas` length; default `cuatrimestre:null`
- [x] 4.6 Create `courses/http-courses.service.spec.ts` — test all endpoints, orchestration sequence, client-side filters, error paths

## Phase 5: HttpAttendanceService

- [x] 5.1 Create `attendances/data/http-attendance.service.ts` — `listarAlumnos(cursoId)` GET `/admin/alumnos`, `listarAsistencias(cursoId,fechaId)` GET `/admin/asistencias`
- [x] 5.2 Implement `marcar(cursoId,fechaId,marcados)` orchestration: GET existing → DELETE each → POST present ones, reject on failure
- [x] 5.3 Implement `anular(asistenciaId)` DELETE `/admin/asistencias/:id`, return `void`
- [x] 5.4 Create `attendances/data/http-attendance.service.spec.ts` — test all methods, orchestration sequence, error paths

## Phase 6: Wiring

- [x] 6.1 Modify `app.routes.ts` — add imports for all 5 HTTP services, switch `useClass` to `environment.useRealApi ? HttpXxx : InMemoryXxx` per token

## Phase 7: Verification

- [x] 7.1 Run `npx ng test` — all 5 HTTP service specs pass, existing specs unchanged
- [x] 7.2 Run `npx ng build` — production build succeeds
- [x] 7.3 Verify mock service files unchanged (git status shows no mock modifications)
