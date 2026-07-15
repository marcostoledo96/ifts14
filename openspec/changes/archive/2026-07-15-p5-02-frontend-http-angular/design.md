# Design: Frontend HTTP Angular Services (P5-02)

## Technical Approach

Replace in-memory mock service implementations with `HttpClient`-backed services that call the real PHP admin API. Each HTTP service implements the existing interface unchanged and is wired via the existing `InjectionToken`, toggled by `environment.useRealApi`. All responses use the backend envelope `{ data, meta: { requestId } }` for success and `{ error: { code, message, details }, meta }` for errors. Services unwrap `data` and map backend DTOs to frontend models, deriving missing fields client-side.

## Architecture Decisions

### Decision: HttpClient + firstValueFrom over raw fetch

**Choice**: Angular `HttpClient` with `firstValueFrom(observable)` to bridge to `Promise<T>` interface.
**Alternatives**: raw `fetch`; RxJS-only (no Promise).
**Rationale**: `HttpClient` is already configured in `app.config.ts` via `provideHttpClient()`; `HttpTestingController` gives the best-in-class test ergonomics the spec requires. The existing `HttpValidationSource` precedent (M3-06) already establishes this pattern.

### Decision: Environment toggle reuses the VALIDATION_SOURCE pattern

**Choice**: Each `InjectionToken` provider uses `environment.useRealApi ? HttpXxxService : InMemoryXxxService` in `app.routes.ts`.
**Alternatives**: separate environment flag per service; feature flags; always HTTP.
**Rationale**: keeps rollback to a one-line swap, matches the existing `VALIDATION_SOURCE` toggle, and preserves the spec requirement that mocks stay unchanged.

### Decision: Orchestration is all-or-nothing (reject on any step failure)

**Choice**: `reemplazarFechas` and `marcar` reject the whole operation if any sub-call fails; no partial commits.
**Alternatives**: best-effort with partial result reporting.
**Rationale**: the spec says "if any step fails, the service SHALL reject with an error"; backend has no batch endpoint; partial state is worse than a clean failure for attendance and date replacement.

## Data Flow

```
Component → inject(X_SOURCE) → HttpXxxService
  → HttpClient.get/post/patch/delete(apiBaseUrl + path)
  → unwrap envelope.data
  → map backend DTO → frontend model (derive missing fields)
  → Promise<model>
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../admin/courses/http-courses.service.ts` | Create | `HttpCoursesService implements CoursesService` |
| `.../admin/courses/http-courses.service.spec.ts` | Create | `HttpTestingController` unit tests |
| `.../admin/students/http-students.service.ts` | Create | `HttpStudentsService implements StudentsService` |
| `.../admin/students/http-students.service.spec.ts` | Create | Unit tests |
| `.../admin/attendances/data/http-attendance.service.ts` | Create | `HttpAttendanceService implements AttendanceService` |
| `.../admin/attendances/data/http-attendance.service.spec.ts` | Create | Unit tests |
| `.../admin/certifications/http-certifications.service.ts` | Create | `HttpCertificationsService implements CertificationsService` |
| `.../admin/certifications/http-certifications.service.spec.ts` | Create | Unit tests |
| `.../admin/institutional-config/institutional-config.service.ts` | Create | `InstitutionalConfigService` interface + `INSTITUTIONAL_CONFIG_SOURCE` token |
| `.../admin/institutional-config/http-institutional-config.service.ts` | Create | `HttpInstitutionalConfigService implements InstitutionalConfigService` |
| `.../admin/institutional-config/institutional-config.service.spec.ts` | Create | Unit tests (both impl + token) |
| `app.routes.ts` | Modify | Swap `useClass` to `environment.useRealApi ? HttpXxx : InMemoryXxx` per token |

## Endpoint Mapping

Base URL: `environment.apiBaseUrl` (currently `/certificados/api`). All paths below are relative to that base. Envelope: responses are `{ data: T }`; services unwrap `.data`. List endpoints return `{ items: T[] }`; services unwrap `.data.items`.

### HttpCoursesService

| Method | HTTP | URL | Request body | Backend → Frontend transform |
|--------|------|-----|--------------|------------------------------|
| `listar(filtros)` | GET | `/admin/cursos` | — | `items[]`: `{id,codigo,nombre,estado,createdAt,updatedAt}` → `Curso` with `cuatrimestre:null`, `cantidadFechas:0` (requires detail fetch for real count; deferred), `alumnosPresentes:null`, `certificaciones:null`. Filters `q`,`conFechas` applied client-side. `estado` passed as `?estado=`. |
| `obtener(id)` | GET | `/admin/cursos/:id` + GET `/admin/cursos/:id/fechas` | — | Merge course DTO + `fechas.items[]` into `CursoDetalle`. `cuatrimestre:null` if absent. |
| `crear(dto)` | POST | `/admin/cursos` | `{codigo,nombre,estado}` | Returns created course DTO → `CursoDetalle` with `fechas:[]`. |
| `actualizarEstado(id,estado)` | PATCH | `/admin/cursos/:id/estado` | `{estado}` | Returns updated course → `CursoDetalle` with `fechas:[]`. |
| `listarFechas(cursoId)` | GET | `/admin/cursos/:id/fechas` | — | `items[]` → `CursoFecha[]`. |
| `guardarFecha(cursoId,dto)` | POST or PATCH | `dto.id===null` → POST `/admin/cursos/:id/fechas`; else PATCH `/admin/cursos/:id/fechas/:fid` | `{fecha,descripcion,orden,estado}` | Returns `CursoFecha`. |
| `reemplazarFechas(cursoId,dtos)` | (orchestrated) | see below | — | see below |

**Derived fields client-side**: `cantidadFechas` (from fechas length when available), `cuatrimestre` (always `null` — backend has no field), `alumnosPresentes` (`null`), `certificaciones` (`null`).

### HttpStudentsService

| Method | HTTP | URL | Request body | Transform |
|--------|------|-----|--------------|-----------|
| `listar()` | GET | `/admin/alumnos` | — | `items[]`: `{id,apellidoNombre,dniMostrar,estado}` → `Alumno`. Split `apellidoNombre` into `apellido`+`nombre` (first space split). `tieneEmail:false` (no backend field). `cursosConAsistencia:0`, `certificacionesValidas:0` (deferred). |
| `contar()` | GET | `/admin/alumnos` | — | `items.length`. |
| `obtener(id)` | GET | `/admin/alumnos/:id` | — | → `AlumnoDetalle` with `ingreso:null`, `cursos:[]` (backend has no course association endpoint for students). Returns `null` if 404 (spec allows null). |

### HttpAttendanceService

| Method | HTTP | URL | Request body | Transform |
|--------|------|-----|--------------|-----------|
| `listarAlumnos(cursoId)` | GET | `/admin/alumnos` | — | Fetch all students, filter client-side by course association. Backend has no course-student link; returns all active students mapped to `AsistenciaAlumno[]`. **Open question**: how to associate students to a course without a backend link table. |
| `listarAsistencias(cursoId,fechaId)` | GET | `/admin/asistencias?cursoId=:cursoId` | — | Filter by `cursoFechaId === fechaId` client-side (backend filters by cursoId only). `items[]` → `Asistencia[]` (field names already match). |
| `marcar(cursoId,fechaId,marcados)` | (orchestrated) | see below | — | see below |
| `anular(asistenciaId)` | DELETE | `/admin/asistencias/:id` | — | Returns `void`; backend does logical delete (`eliminado_en`). |

### HttpCertificationsService

| Method | HTTP | URL | Request body | Transform |
|--------|------|-----|--------------|-----------|
| `listar(filtros)` | GET | `/admin/certificados` | — | `items[]`: backend `{id,certificateCode,status,student:{displayName,documentMasked},course:{name},issuedAt,expiresAt,revokedAt,tokenPrefix}` → `Certificacion` with `numero:certificateCode`, `nombreAlumno:student.displayName`, `cursoNombre:course.name`, `estado:status`, `envio:'pendiente-entrega'` (no backend field; deferred), `documentMasked`, `tokenPrefix`, `emitidoEn:issuedAt`, `venceEn:expiresAt`. `envio` filter applied client-side. |
| `obtener(id)` | GET | `/admin/certificados/:id` | — | → `CertificacionDetalle` with `publicValidationUrl` (truncated, from links), `attendedDates` (from snapshot), `auditEvents`. |
| `contar()` | GET | `/admin/certificados` | — | `items.length`. |
| `revocar(id,motivo)` | POST | `/admin/certificados/:id/revocar` | `{reason}` | Returns `void`. Note: backend key is `reason`, not `motivo`. |

### HttpInstitutionalConfigService

| Method | HTTP | URL | Request body | Transform |
|--------|------|-----|--------------|-----------|
| `obtener()` | GET | `/admin/configuracion-institucional` | — | `{institutionName,certificateText,rectorName,rectorRole,advisorName,advisorRole,updatedAt}` → `InstitutionalConfig` with `nombre:institutionName`, `direccion:null` (no backend field), `logoUrl:null` (no backend field). |

## Orchestration Sequences

### reemplazarFechas(cursoId, dtos)

```
1. GET /admin/cursos/:id/fechas        → currentFechas[]
2. diff:
   - toDelete = currentFechas where id NOT in dtos[].id
   - toPatch  = dtos where id !== null (match existing)
   - toPost   = dtos where id === null
3. for each in toDelete: ⚠️ BACKEND HAS NO DELETE DATE ENDPOINT — see Open Questions
4. for each in toPatch:  PATCH /admin/cursos/:id/fechas/:fid
5. for each in toPost:   POST  /admin/cursos/:id/fechas
6. if ANY call rejects → reject whole operation (all-or-nothing)
7. GET /admin/cursos/:id/fechas → finalFechas[] (re-read for consistent state)
8. return finalFechas
```

### marcar(cursoId, fechaId, marcados)

```
1. GET /admin/asistencias?cursoId=:cursoId  → existing[]
2. filter existing by cursoFechaId === fechaId → toDelete[]
3. for each in toDelete: DELETE /admin/asistencias/:id
4. for each marcado where presente===true: POST /admin/asistencias {alumnoId,cursoId,cursoFechaId:fechaId}
5. if ANY call rejects → reject whole operation (all-or-nothing)
6. return newly posted Asistencia[]
```

**Error handling**: both orchestrations reject with the first error encountered. No rollback of completed sub-calls (backend has no transaction across HTTP calls). This is a documented limitation; the spec accepts reject-on-failure semantics.

## Interfaces / Contracts

```typescript
// institutional-config.service.ts
export interface InstitutionalConfig {
  readonly nombre: string;
  readonly direccion: string | null;
  readonly logoUrl: string | null;
}

export interface InstitutionalConfigService {
  obtener(): Promise<InstitutionalConfig>;
}

export const INSTITUTIONAL_CONFIG_SOURCE =
  new InjectionToken<InstitutionalConfigService>('INSTITUTIONAL_CONFIG_SOURCE');
```

```typescript
// Shared envelope helper (inline in each service or shared util)
interface ApiEnvelope<T> { data: T; meta: { requestId: string } }
interface ApiErrorEnvelope { error: { code: string; message: string; details: unknown[] }; meta: { requestId: string } }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Each service method: correct HTTP method, URL, body, envelope unwrap, DTO mapping | `HttpTestingController`: `expectOne(url)`, assert `req.method`, `req.request.body`, `flush({data:...})`, assert mapped result. |
| Unit | Error handling: 4xx/5xx reject with descriptive error | `flush(new HttpErrorResponse({status:500}))` or `flush({error:{code,message,details},meta})`, assert rejection. |
| Unit | Orchestration (`reemplazarFechas`, `marcar`): correct call sequence | `expectOne` in order for GET→DELETE→PATCH→POST; `httpMock.verify()` asserts no unexpected requests remain. |
| Unit | Client-side filters (`q`, `conFechas`, `envio`) | Flush full list, assert filtered subset returned. |
| Unit | Derived fields (`cantidadFechas`, `cuatrimestre:null`) | Flush response without those fields, assert defaults applied. |

### Test pattern (per service)

```typescript
beforeEach(() => TestBed.configureTestingModule({
  imports: [provideHttpClient(), provideHttpClientTesting()],
  providers: [{ provide: COURSES_SOURCE, useClass: HttpCoursesService }],
}));
let httpMock = inject(HttpTestingController);
let svc = inject(COURSES_SOURCE);

it('listar fetches /admin/cursos and maps DTOs', async () => {
  const p = svc.listar();
  const req = httpMock.expectOne('/certificados/api/admin/cursos');
  expect(req.request.method).toBe('GET');
  req.flush({ data: { items: [{id:1,codigo:'C1',...}] }, meta: {requestId:'r1'} });
  expect(await p).toEqual([/* mapped Curso */]);
  httpMock.verify();
});
```

**Coverage per service**: every method (happy path + error path), orchestration sequences, client-side filters, derived-field defaults.

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. This change adds HTTP service implementations and tests only; no new routes, no shell commands, no executable classification.

## Migration / Rollout

No migration required. Rollback is a one-line `useClass` swap per `InjectionToken` in `app.routes.ts` back to `InMemoryXxxService`. Mock implementations are preserved unchanged per spec.

## Open Questions

- [ ] **`reemplazarFechas` DELETE**: the backend `AdminMasterDataService` has no `deleteCourseDate` endpoint or route. Only `createCourseDate` and `updateCourseDate` exist. Either (a) the backend needs a `DELETE /admin/cursos/:id/fechas/:fid` endpoint, or (b) `reemplazarFechas` must PATCH removed dates to a `cancelada` state instead of deleting. **This blocks full implementation of `reemplazarFechas` as specified.**
- [ ] **`InstitutionalConfig.direccion` and `logoUrl`**: the backend `GET /admin/configuracion-institucional` returns `institutionName, certificateText, rectorName, rectorRole, advisorName, advisorRole, updatedAt` — no `direccion` or `logoUrl` fields. The frontend interface must default these to `null` or the backend must add columns. Confirm acceptable.
- [ ] **`listarAlumnos(cursoId)` course association**: the backend has no course-student link table exposed via API. `GET /admin/alumnos` returns all students. The spec says "filter by course association client-side" but there is no association data to filter on. Either (a) derive from existing attendances (heavy), or (b) return all active students as a placeholder, or (c) backend needs a course-student endpoint. Confirm approach.
- [ ] **Spec vs backend path mismatch**: the spec references `GET /admin/institucional`, `GET /admin/certificaciones`, `POST /admin/certificaciones/:id/revocar` but the real backend routes are `GET /admin/configuracion-institucional`, `GET /admin/certificados`, `POST /admin/certificados/:id/revocar`. The design uses the **real backend routes**. The spec needs updating in `sdd-archive`.
- [ ] **`Alumno.apellido`/`nombre` split**: backend stores `apellidoNombre` as a single string; frontend model has `apellido` + `nombre` separate. Confirm split heuristic (first space) is acceptable or if backend should split.
- [ ] **`AlumnoDetalle.ingreso` and `cursos`**: backend has no `ingreso` field and no student-course link. Both default to `null`/`[]`. Confirm acceptable for UI graceful degradation.