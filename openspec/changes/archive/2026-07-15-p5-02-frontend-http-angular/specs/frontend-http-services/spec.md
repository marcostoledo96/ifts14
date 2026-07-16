# Delta Spec: Frontend HTTP Services (P5-02)

This delta governs HTTP-backed Angular service implementations that replace in-memory mocks for the admin panel. No UI, route, or component changes.

## ADDED Requirements

### Requirement: HttpCoursesService implements CoursesService via HTTP

The system SHALL provide `HttpCoursesService` implementing `CoursesService` using Angular `HttpClient`. It SHALL call the PHP admin API endpoints and SHALL NOT use in-memory state.

#### Scenario: List courses with client-side filters

- GIVEN the backend returns a full course list from `GET /admin/cursos`
- WHEN `listar(filtros)` is called with `q` or `conFechas` filters
- THEN the service SHALL fetch all courses and apply filters client-side
- AND the response SHALL include `cantidadFechas` computed from the `fechas` array length

#### Scenario: Get course detail with dates

- GIVEN a course exists at `GET /admin/cursos/:id`
- WHEN `obtener(id)` is called
- THEN the service SHALL return the course with its `fechas` array from the backend
- AND `cuatrimestre` SHALL default to `null` when absent from the backend response

#### Scenario: Create course

- GIVEN a valid `CursoDraft`
- WHEN `crear(dto)` is called
- THEN the service SHALL POST to `/admin/cursos` with the draft body
- AND return the created `CursoDetalle`

#### Scenario: Update course state

- GIVEN a course id and target `EstadoCurso`
- WHEN `actualizarEstado(id, estado)` is called
- THEN the service SHALL PATCH `/admin/cursos/:id/estado` with the new state
- AND return the updated `CursoDetalle`

#### Scenario: List course dates

- GIVEN a course id
- WHEN `listarFechas(cursoId)` is called
- THEN the service SHALL GET `/admin/cursos/:id` and extract the `fechas` array

#### Scenario: Create course date

- GIVEN a course id and `CursoFechaDraft`
- WHEN `guardarFecha(cursoId, dto)` is called with `dto.id === null`
- THEN the service SHALL POST to `/admin/cursos/:id/fechas`

#### Scenario: Update course date

- GIVEN a course id and `CursoFechaDraft` with an existing `dto.id`
- WHEN `guardarFecha(cursoId, dto)` is called
- THEN the service SHALL PATCH `/admin/cursos/:id/fechas/:fid`

#### Scenario: Replace all course dates (orchestrated)

- GIVEN a course id and an array of `CursoFechaDraft`
- WHEN `reemplazarFechas(cursoId, dtos)` is called
- THEN the service SHALL fetch current dates, DELETE removed ones, PATCH existing ones, POST new ones
- AND return the final `CursoFecha[]` array
- AND if any step fails, the service SHALL reject with an error

#### Scenario: HTTP error handling for courses

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `CoursesService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpStudentsService implements StudentsService via HTTP

The system SHALL provide `HttpStudentsService` implementing `StudentsService` using Angular `HttpClient`.

#### Scenario: List all students

- GIVEN the backend returns students from `GET /admin/alumnos`
- WHEN `listar()` is called
- THEN the service SHALL return `readonly Alumno[]`

#### Scenario: Count students

- GIVEN the backend returns students from `GET /admin/alumnos`
- WHEN `contar()` is called
- THEN the service SHALL return the length of the student list

#### Scenario: Get student detail (basic)

- GIVEN a student exists at `GET /admin/alumnos/:id`
- WHEN `obtener(id)` is called
- THEN the service SHALL return `AlumnoDetalle` with basic fields from the backend
- AND `cursos` SHALL be an empty array when the backend does not include course data
- AND `ingreso` SHALL default to `null` when absent

#### Scenario: HTTP error handling for students

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `StudentsService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpAttendanceService implements AttendanceService via HTTP

The system SHALL provide `HttpAttendanceService` implementing `AttendanceService` using Angular `HttpClient`.

#### Scenario: List students for a course

- GIVEN a course id
- WHEN `listarAlumnos(cursoId)` is called
- THEN the service SHALL GET `/admin/alumnos` and filter by course association client-side
- AND return `readonly AsistenciaAlumno[]`

#### Scenario: List attendances for a course date

- GIVEN a course id and date id
- WHEN `listarAsistencias(cursoId, fechaId)` is called
- THEN the service SHALL GET `/admin/asistencias?curso_id=&fecha_id=`
- AND return `readonly Asistencia[]`

#### Scenario: Mark attendances (orchestrated batch)

- GIVEN a course id, date id, and array of `AsistenciaMarcado`
- WHEN `marcar(cursoId, fechaId, marcados)` is called
- THEN the service SHALL DELETE existing attendances for that date, then POST each present student
- AND return the final `readonly Asistencia[]`
- AND if any step fails, the service SHALL reject with an error

#### Scenario: Cancel an attendance

- GIVEN an attendance id
- WHEN `anular(asistenciaId)` is called
- THEN the service SHALL DELETE `/admin/asistencias/:id`

#### Scenario: HTTP error handling for attendances

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `AttendanceService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpCertificationsService implements CertificationsService via HTTP

The system SHALL provide `HttpCertificationsService` implementing `CertificationsService` using Angular `HttpClient`.

#### Scenario: List certifications with client-side filters

- GIVEN the backend returns certifications from `GET /admin/certificaciones`
- WHEN `listar(filtros)` is called with an `envio` filter
- THEN the service SHALL fetch all certifications and apply the `envio` filter client-side

#### Scenario: Get certification detail

- GIVEN a certification exists at `GET /admin/certificaciones/:id`
- WHEN `obtener(id)` is called
- THEN the service SHALL return `CertificacionDetalle`

#### Scenario: Count certifications

- GIVEN the backend returns certifications from `GET /admin/certificaciones`
- WHEN `contar()` is called
- THEN the service SHALL return the length of the certification list

#### Scenario: Revoke certification

- GIVEN a certification id and motivo string
- WHEN `revocar(id, motivo)` is called
- THEN the service SHALL POST to `/admin/certificaciones/:id/revocar` with the motivo body

#### Scenario: HTTP error handling for certifications

- GIVEN the backend returns a 4xx or 5xx status
- WHEN any `CertificationsService` method is called
- THEN the service SHALL reject the promise with a descriptive error

### Requirement: HttpInstitutionalConfigService provides institutional configuration

The system SHALL provide a new `InstitutionalConfigService` interface and `HttpInstitutionalConfigService` implementation.

#### Scenario: Fetch institutional config

- GIVEN the backend returns config from `GET /admin/institucional`
- WHEN `obtener()` is called
- THEN the service SHALL return `InstitutionalConfig` with at least `nombre`, `direccion`, and `logoUrl` fields

#### Scenario: HTTP error handling for config

- GIVEN the backend returns a 4xx or 5xx status
- WHEN `obtener()` is called
- THEN the service SHALL reject the promise with a descriptive error

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
- THEN the test SHALL verify the correct sequence of HTTP calls (DELETE, PATCH, POST)
- AND the test SHALL verify no unexpected requests remain

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
