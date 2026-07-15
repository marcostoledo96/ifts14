# Proposal: p5-02-frontend-http-angular

## Intent

Replace the in-memory mock service implementations used by the Angular 20 admin panel with HTTP-backed services that call the real PHP admin API. The UI and routes stay unchanged; only the service layer and its tests change.

## Scope

### In Scope
- HTTP implementations for `CoursesService`, `StudentsService`, `AttendanceService`, `CertificationsService`.
- New `InstitutionalConfigService` interface + HTTP implementation.
- Client-side orchestration for batch-like operations lacking backend batch endpoints (`reemplazarFechas`, bulk attendance marking).
- Client-side filtering for fields not provided by the backend (`q`, `conFechas`, `envio`).
- Unit tests using Angular `HttpTestingController` for every endpoint and orchestration path.

### Out of Scope
- UI, routes, components, or DTO shapes consumed by components.
- Backend changes or new endpoints.
- Replacing the mock `AuthService` / admin session guard.
- Real runtime wiring to production backend (services are tested with `HttpTestingController`; integration is later).

## Capabilities

### New Capabilities
- `admin-institutional-config-frontend`: HTTP service for reading institutional configuration from `GET /admin/institucional`.

### Modified Capabilities
- `admin-courses-frontend`: backend integration requirements (service methods now issue real HTTP calls and orchestrate batch date updates).
- `admin-students-frontend`: backend integration requirements (list/count from API, rich `obtener` falls back to basic alumno data).
- `admin-attendances-frontend`: backend integration requirements (list from API, mark/unmark by orchestrating DELETE + POST).
- `admin-certifications-frontend`: backend integration requirements (list/count/detail from API, revoke via HTTP).

## Approach

Use Angular `HttpClient` directly inside new service implementations that satisfy the existing interfaces. Where the backend lacks a matching batch endpoint, orchestrate sequential/parallel calls in the service and surface a single Observable to consumers. Derived fields missing from the backend (`cantidadFechas`, `cuatrimestre`, `alumnosPresentes`, `certificaciones`, etc.) are returned as `null`/defaults or computed from returned sub-resources when available. Filters unsupported by the API are applied client-side after fetching the full list.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `frontend/src/app/features/admin/services/courses.service.ts` | New | HTTP-backed `CoursesService`. |
| `frontend/src/app/features/admin/services/students.service.ts` | New | HTTP-backed `StudentsService`. |
| `frontend/src/app/features/admin/services/attendance.service.ts` | New | HTTP-backed `AttendanceService`. |
| `frontend/src/app/features/admin/services/certifications.service.ts` | New | HTTP-backed `CertificationsService`. |
| `frontend/src/app/features/admin/services/institutional-config.service.ts` | New | Interface + HTTP implementation. |
| `frontend/src/app/features/admin/services/*.spec.ts` | New | `HttpTestingController` unit tests. |
| `frontend/src/app/features/admin/services/mock-*` | Modified | Kept as fallback until verify; DI wiring chooses implementation. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Backend response shape differs from current mock DTOs | Med | Map fields explicitly in services; tests assert request/response contracts. |
| Batch orchestration introduces partial failures | Med | Implement best-effort all-or-nothing in spec; tests cover error paths. |
| Missing backend filters cause memory/perf issues with large lists | Low | Document deferred server-side filtering; cap page size client-side for now. |
| `StudentsService.obtener` returns less data than UI expects | Med | Spec will define that detail view gracefully degrades when rich data is unavailable. |

## Rollback Plan

Restore the previous mock service implementations as the DI providers. Because interfaces are unchanged and UI is untouched, rollback is a one-line provider swap per service. Keep mock implementations in the repo until `sdd-verify` passes.

## Dependencies

- PHP admin endpoints from `admin-master-data-api` must be deployed to staging for later integration testing.
- Existing Angular service interfaces and DTOs from `admin-courses-frontend`, `admin-students-frontend`, `admin-attendances-frontend`, `admin-certifications-frontend`.

## Success Criteria

- [ ] All existing service interface methods have HTTP-backed implementations.
- [ ] `HttpTestingController` tests pass for every endpoint and orchestration path.
- [ ] UI still builds and behaves identically when mock services are replaced with HTTP services.
- [ ] No secrets, full DNI, or full tokens are logged or exposed in HTTP services or tests.
