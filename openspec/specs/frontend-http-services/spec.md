# Spec: Frontend HTTP Services (P5-02)

This spec governs HTTP-backed Angular service implementations that replace in-memory mocks for the admin panel. No UI, route, or component changes.

## Scope

- HTTP implementations for `CoursesService`, `StudentsService`, `AttendanceService`, `CertificationsService`.
- New `InstitutionalConfigService` interface + HTTP implementation.
- Client-side orchestration for batch-like operations lacking backend batch endpoints.
- Client-side filtering for fields not provided by the backend.
- Unit tests using Angular `HttpTestingController` for every endpoint and orchestration path.

## ADDED Requirements

### Requirement: HttpCoursesService implements CoursesService via HTTP

The system SHALL provide `HttpCoursesService` implementing `CoursesService` using Angular `HttpClient`. It SHALL call the PHP admin API endpoints and SHALL NOT use in-memory state.

#### Scenario: List courses with client-side filters

- GIVEN the backend returns a full course list from `GET /admin/cursos`
- WHEN `listar(filtros)` is called with `q`, `estado`, or `conFechas` filters
- THEN the service SHALL fetch all courses and apply filters client-side
- AND the response SHALL include `cantidadFechas` computed from the `fechas` array length
- AND `cuatrimestre` SHALL default to `'Sin programar'` when absent from the backend response (matches the `string` type in `courses.models.ts`)

#### Scenario: Get course detail with dates

- GIVEN a course exists at `GET /admin/cursos/:id`
- WHEN `obtener(id)` is called
- THEN the service SHALL fetch both `/admin/cursos/:id` and `/admin/cursos/:id/fechas` in parallel
- AND return the course merged with its `fechas` array

#### Scenario: Create course

- GIVEN a valid `CursoDraft`
- WHEN `crear(dto)` is called
- THEN the service SHALL POST to `/admin/cursos` with the draft body
- AND return the created `CursoDetalle`

#### Scenario: Update course state

- GIVEN a course id and target `EstadoCurso`
- WHEN `actualizarEstado(id, estado)` is called
- THEN the service SHALL PATCH `/admin/cursos/:id/estado` with `{ estado }`
- AND return the updated `CursoDetalle`

#### Scenario: List course dates

- GIVEN a course id
- WHEN `listarFechas(cursoId)` is called
- THEN the service SHALL GET `/admin/cursos/:id/fechas` and return the array

#### Scenario: Create course date

- GIVEN a course id and `CursoFechaDraft` with `dto.id === null`
- WHEN `guardarFecha(cursoId, dto)` is called
- THEN the service SHALL POST to `/admin/cursos/:id/fechas`

#### Scenario: Update course date

- GIVEN a course id and `CursoFechaDraft` with an existing `dto.id`
- WHEN `guardarFecha(cursoId, dto)` is called
- THEN the service SHALL PATCH `/admin/cursos/:id/fechas/:fid`

#### Scenario: Replace all course dates (orchestrated, PATCH cancelada fallback)

- GIVEN a course id and an array of `CursoFechaDraft`
- WHEN `reemplazarFechas(cursoId, dtos)` is called
- THEN the service SHALL fetch current dates
- AND PATCH `estado: 'cancelada'` on each removed date (backend has no DELETE date endpoint; this is the documented design decision)
- AND PATCH existing dates that remain
- AND POST new dates
- AND return the final `CursoFecha[]` array after a re-read
- AND if any step fails, the service SHALL reject the whole operation with a descriptive error

#### Scenario: HTTP error handling for courses

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `CoursesService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpStudentsService implements StudentsService via HTTP

The system SHALL provide `HttpStudentsService` implementing `StudentsService` using Angular `HttpClient`.

#### Scenario: List all students

- GIVEN the backend returns students from `GET /admin/alumnos`
- WHEN `listar()` is called
- THEN the service SHALL return `readonly Alumno[]` with `apellidoNombre` split on the first space into `apellido` and `nombre`

#### Scenario: Count students

- GIVEN the backend returns students from `GET /admin/alumnos`
- WHEN `contar()` is called
- THEN the service SHALL return the length of the student list

#### Scenario: Get student detail (basic)

- GIVEN a student exists at `GET /admin/alumnos/:id`
- WHEN `obtener(id)` is called
- THEN the service SHALL return `AlumnoDetalle` with basic fields from the backend
- AND `cursos` SHALL be an empty array when the backend does not include course data
- AND `ingreso` SHALL default to `''` (empty string) when absent (matches the `string` type in `students.models.ts`)
- AND `tieneEmail` SHALL default to `false` when absent
- WHEN the response is 404, the service SHALL return `null`

#### Scenario: 404 detection via duck-typing

- GIVEN a 404 response from the backend
- WHEN `obtener(id)` is called
- THEN the service SHALL detect the not-found state by inspecting the error shape (not via `instanceof HttpErrorResponse`), consistent with the existing `http-validation.source.ts` pattern

#### Scenario: HTTP error handling for students

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `StudentsService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpAttendanceService implements AttendanceService via HTTP

The system SHALL provide `HttpAttendanceService` implementing `AttendanceService` using Angular `HttpClient`.

#### Scenario: List students for a course

- GIVEN a course id
- WHEN `listarAlumnos(cursoId)` is called
- THEN the service SHALL GET `/admin/alumnos`, filter by `activo: true` client-side
- AND return `readonly AsistenciaAlumno[]`
- NOTE: the backend has no course-student link table, so the `cursoId` parameter is currently ignored. This is a documented design decision to be revisited when a course-student link exists.

#### Scenario: List attendances for a course date

- GIVEN a course id and date id
- WHEN `listarAsistencias(cursoId, fechaId)` is called
- THEN the service SHALL GET `/admin/asistencias?cursoId=`
- AND filter by `fechaId` client-side
- AND return `readonly Asistencia[]`

#### Scenario: Mark attendances (orchestrated batch, all-or-nothing)

- GIVEN a course id, date id, and array of `AsistenciaMarcado`
- WHEN `marcar(cursoId, fechaId, marcados)` is called
- THEN the service SHALL GET existing attendances for that date
- AND DELETE each existing attendance
- AND POST each present student
- AND if any DELETE or POST fails, the service SHALL reject the whole operation with a descriptive error
- AND on full success, return the final `readonly Asistencia[]`

#### Scenario: Cancel an attendance

- GIVEN an attendance id
- WHEN `anular(asistenciaId)` is called
- THEN the service SHALL DELETE `/admin/asistencias/:id`
- AND return `void`

#### Scenario: HTTP error handling for attendances

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `AttendanceService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpCertificationsService implements CertificationsService via HTTP

The system SHALL provide `HttpCertificationsService` implementing `CertificationsService` using Angular `HttpClient`.

#### Scenario: List certifications with client-side filters

- GIVEN the backend returns certifications from `GET /admin/certificados`
- WHEN `listar(filtros)` is called with `envio`, `estado`, `cursoId`, or `q` filters
- THEN the service SHALL fetch all certifications and apply the filters client-side
- AND the response SHALL include `numero` (from `certificateCode`), `nombreAlumno` (from `student.displayName`), `estado` (from `status`)
- AND `envio` SHALL default to `'no_emitido'` when absent

#### Scenario: Get certification detail

- GIVEN a certification exists at `GET /admin/certificados/:id`
- WHEN `obtener(id)` is called
- THEN the service SHALL return `CertificacionDetalle` including `auditEvents` and `attendedDates` arrays

#### Scenario: Count certifications

- GIVEN the backend returns certifications from `GET /admin/certificados`
- WHEN `contar()` is called
- THEN the service SHALL return the length of the certification list

#### Scenario: Revoke certification

- GIVEN a certification id and motivo string
- WHEN `revocar(id, motivo)` is called
- THEN the service SHALL POST to `/admin/certificados/:id/revocar` with `{ reason: motivo }` in the body (backend key is `reason`, not `motivo`)

#### Scenario: Emit certification

- GIVEN a valid body `{ alumnoId, cursoId, issuedAt, expiresAt }`
- WHEN `emitir(body)` is called
- THEN the service SHALL `POST /admin/certificados` with exactly those four fields
- AND SHALL return the created certification from `envelope.data` (HTTP 201)

#### Scenario: List certifications with server-supported filters

- GIVEN filters include `estado`, `cursoId`, and/or `alumnoId`
- WHEN `listar(filtros)` is called
- THEN the HTTP implementation SHALL forward those query params to `GET /admin/certificados` when supported by the adapter

#### Scenario: HTTP error handling for certifications

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `CertificationsService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpInstitutionalConfigService provides institutional configuration

El sistema DEBE proveer `InstitutionalConfigService`, `HttpInstitutionalConfigService` e `InMemoryInstitutionalConfigService` vía `environment.useRealApi`.

El modelo `InstitutionalConfig` DEBE mapear 1:1 los campos de texto del DTO: `institutionName`, `certificateText`, `rectorName`, `rectorRole`, `advisorName`, `advisorRole`, `updatedAt`, `parameters` (9 claves tipadas) y los flags booleanos `rectorSignaturePresent` / `advisorSignaturePresent`. `obtener()` / `guardar()` DEBEN usar JSON sin multipart. El modelo NO DEBE inventar `direccion`, `logoUrl` ni URLs públicas de firma.
(Previously: el modelo excluía uploads/firmas y no incluía flags de presencia.)

#### Scenario: Fetch institutional config

- DADO el backend responde `GET /admin/configuracion-institucional`
- CUANDO se llama `obtener()`
- ENTONCES el servicio DEBE devolver `InstitutionalConfig` desde `envelope.data` (strings null → `''`; `parameters` tipados; flags booleanos de firma)

#### Scenario: Save institutional config

- DADO payload válido con `institutionName` no vacío y `parameters` opcionales
- CUANDO se llama `guardar(payload)`
- ENTONCES el servicio DEBE `PUT /admin/configuracion-institucional` en JSON
- Y DEBE devolver `InstitutionalConfig` actualizado sin enviar multipart de firmas

#### Scenario: HTTP error handling for config

- DADO el backend responde 4xx o 5xx
- CUANDO se llama `obtener()` o `guardar()`
- ENTONCES el servicio DEBE rechazar con error descriptivo

### Requirement: Métodos HTTP de firmas institucionales

`InstitutionalConfigService` (HTTP e in-memory) DEBE exponer métodos para `POST`/`DELETE`/`GET` de firmas por rol (`rector`|`asesor`) contra `/admin/configuracion-institucional/firmas/{rol}`. Upload DEBE usar multipart; DELETE/GET DEBEN ser inmediatos e independientes de `guardar()`.

#### Scenario: Upload firma por rol

- DADO `File` PNG/JPEG válido y rol permitido
- CUANDO se llama el método de upload
- ENTONCES el servicio DEBE `POST` multipart a `.../firmas/{rol}`
- Y DEBE resolver éxito/error sin invocar `guardar()`

#### Scenario: Delete y preview firma

- DADO un rol permitido
- CUANDO se llama delete o preview
- ENTONCES delete DEBE `DELETE .../firmas/{rol}` y preview DEBE `GET` binario con auth de sesión
- Y errores HTTP DEBEN rechazarse con mensaje descriptivo

#### Scenario: HttpTestingController cubre firmas

- DADO tests con `HttpTestingController`
- CUANDO se ejercitan upload/delete/preview
- ENTONCES DEBEN afirmar método, URL y cuerpo/headers esperados
- Y DEBEN flushear mock y verificar sin requests pendientes

### Requirement: HttpTestingController tests for all HTTP services

Each HTTP service implementation SHALL have a corresponding `.spec.ts` file using Angular `HttpTestingController`.

#### Scenario: Test verifies correct HTTP method and URL

- GIVEN an `HttpTestingController` test for any service method
- WHEN the method is called
- THEN the test SHALL assert the correct HTTP method, URL, and request body
- AND the test SHALL flush a mock response and verify the returned data

#### Scenario: Test verifies error handling

- GIVEN an `HttpTestingController` test for any service method
- WHEN the backend is flushed with an error status
- THEN the test SHALL assert the promise is rejected with a descriptive error

#### Scenario: Test verifies orchestrated operations

- GIVEN an `HttpTestingController` test for `reemplazarFechas` or `marcar`
- WHEN the method is called
- THEN the test SHALL verify the correct sequence of HTTP calls
- AND the test SHALL verify no unexpected requests remain via `httpMock.verify()`

#### Scenario: Test handles async orchestration timing

- GIVEN an orchestrated test that fires multiple sequential HTTP calls
- WHEN the test awaits between flush and the next `expectOne`
- THEN the test SHALL yield to the event loop with `await new Promise(r => setTimeout(r, 0))` so the async service continues to the next call

### Requirement: Existing mock services and injection tokens are preserved

The existing in-memory service implementations and `InjectionToken` providers SHALL NOT be modified.

#### Scenario: Mock services remain unchanged

- GIVEN the existing `InMemoryCoursesService`, `InMemoryStudentsService`, `InMemoryCertificationsService`, and `AttendanceMockService`
- WHEN P5-02 is implemented
- THEN none of these files SHALL be modified
- AND the `InjectionToken` constants (`COURSES_SOURCE`, `STUDENTS_SOURCE`, `ATTENDANCE_SOURCE`, `CERTIFICATIONS_SOURCE`) SHALL remain unchanged

#### Scenario: New HTTP services use the same interfaces

- GIVEN the existing service interfaces
- WHEN HTTP implementations are created
- THEN each HTTP service SHALL implement the corresponding interface
- AND the HTTP service SHALL be injectable via the existing `InjectionToken`

### Requirement: Corrección condicional del mapeo de métricas de alumnos

NO DEBE exigirse cambio de `HttpStudentsService` ni backend por defecto; preferir fixes en la página. SOLO SI smoke o code review demuestran mapeo roto (UI «—» con payload 0/N), DEBE corregirse el mapeo mínimo (`toAlumno`/conteos) sin DNI/token en errores.
(Nota archive P9: en `audit-p09-alumnos-list` no hubo evidencia de mapeo roto; `optionalCount` preserva `0`; HTTP omitido.)

#### Scenario: Sin evidencia — no tocar HTTP

- GIVEN métricas correctas en staging
- WHEN cierra P9
- THEN NO DEBE modificarse `HttpStudentsService` ni backend

#### Scenario: Evidencia de mapeo roto — parche mínimo

- GIVEN payload numérico y UI «—» por mapeo
- WHEN se corrige el servicio
- THEN DEBE mapear 0 como número y null si ausente, sin PII ni editor/detalle

### Requirement: Fallback condicional 409 en actualizar alumno

NO DEBE exigirse cambio de `HttpStudentsService.actualizar` ni backend por defecto; preferir manejo en la página del editor. SOLO SI smoke, staging o test demuestran 409 de update sin `existingStudentId` usable para el enlace, PUEDE agregarse fallback mínimo (p. ej. `findIdByDni`) sin incluir DNI/token en mensajes ni logs.
(Nota archive P10: en `audit-p10-alumnos-editor` no hubo evidencia de 409 update sin id usable; `http-students.service.*` intactos; HTTP omitido.)

#### Scenario: Sin evidencia — no tocar HTTP

- GIVEN 409 de update con `existingStudentId` en envelope o sin gap observable
- WHEN cierra P10
- THEN NO DEBE modificarse `HttpStudentsService.actualizar` ni el backend

#### Scenario: Evidencia de 409 sin id — parche mínimo

- GIVEN 409 de update sin id usable y enlace de conflicto ausente
- WHEN se corrige el servicio
- THEN PUEDE resolver id vía fallback mínimo y DEBE mapear a conflicto tipado sin PII

### Requirement: DI wiring uses environment.useRealApi toggle

`app.routes.ts` SHALL select between HTTP and in-memory implementations using the `environment.useRealApi` flag, matching the existing `VALIDATION_SOURCE` pattern from the M3-06 checkpoint.

#### Scenario: Five tokens switch between HTTP and in-memory

- GIVEN `environment.useRealApi` is `true`
- WHEN the app boots
- THEN `COURSES_SOURCE`, `STUDENTS_SOURCE`, `ATTENDANCE_SOURCE`, `CERTIFICATIONS_SOURCE`, and `INSTITUTIONAL_CONFIG_SOURCE` SHALL resolve to their HTTP implementations

- GIVEN `environment.useRealApi` is `false`
- WHEN the app boots
- THEN those same five tokens SHALL resolve to their in-memory implementations

## Design Decisions Resolved During Implementation

| # | Open question | Resolution | Reason |
|---|---------------|-----------|--------|
| 1 | `cuatrimestre` default | `'Sin programar'` (string) | matches `string` type in `courses.models.ts`; `null` is incompatible with the model |
| 2 | `ingreso` default | `''` (empty string) | matches `string` type in `students.models.ts`; `null` is incompatible with the model |
| 3 | `reemplazarFechas` remove strategy | PATCH `estado: 'cancelada'` | backend has no DELETE date endpoint |
| 4 | `listarAlumnos(cursoId)` course filter | return all active students, ignore `cursoId` | backend has no course-student link table |
| 5 | `revocar` request body key | `reason` (not `motivo`) | backend contract uses English key |
| 6 | Institutional config endpoint | `/admin/configuracion-institucional` (not `/admin/institucional`) | matches the deployed PHP route |
| 7 | Certifications endpoint | `/admin/certificados` (not `/admin/certificaciones`) | matches the deployed PHP route |
