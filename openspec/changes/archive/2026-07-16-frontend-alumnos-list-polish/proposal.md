# Proposal: Lista alumnos polish + Nuevo alumno

## Intent

Cerrar paridad v0 del listado `/admin/alumnos` (CTA, badges/iconos, estados) y habilitar alta mínima con el `POST /admin/alumnos` real — sin inventar email ni métricas HTTP.

## Scope

### In Scope
- Header + CTA activo “Nuevo alumno” → `/admin/alumnos/nuevo`.
- Ruta estática `alumnos/nuevo` **antes** de `alumnos/:id`.
- Editor mínimo: `apellidoNombre` + `dni` requeridos; default activo (sin UI de estado salvo necesidad).
- `StudentsService.crear` + HTTP/in-memory; body exacto `{ apellidoNombre, dni, estado? }`.
- Éxito `201` → `/admin/alumnos/:id`; validación inline; errores visibles; anti doble-submit.
- Lista: badge “Sin email”+warning solo si `tieneEmail === false`; ShieldCheck solo con dato real de certs; placeholders HTTP honestos (`null`/`—`).
- Estados loading/error/empty/sin-coincidencias con SVG inline; empty con CTA.
- Specs TDD focalizados; delta `admin-students-frontend` + `frontend-http-services`.

### Out of Scope
- Campo email; legajo; búsqueda por apellido; port React/lucide.
- Backend/DB nuevos campos; N+1 cursos/certs; skeleton pesado; edición alumno; shell/sidebar.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-students-frontend`: CTA + polish lista; alta `/nuevo`; privacy DNI solo en form create.
- `frontend-http-services`: `HttpStudentsService.crear` + placeholders list honestos.
- `admin-foundation`: ruta `alumnos/nuevo` bajo shell/guard (impacto menor).

## Approach

Explore **Approach 1**, ciclo único (`size:exception`): polish lista + editor POST. Modelo: `tieneEmail`/`cursosConAsistencia`/`certificacionesValidas` como `T | null` (HTTP→`null`; seed→valores). Identifiers EN; UI ES-AR; OnPush/signals.

## Proposal question round

Cerrado por locks del orquestador (sin ronda interactiva):

1. CTA activo (no disabled) pese a falta de página v0 `nuevo`.
2. Form solo apellidoNombre+dni; estado default activo sin selector.
3. Handoff `201` → detalle.
4. Placeholders HTTP honestos; badge/ShieldCheck solo con dato real.
5. DNI completo solo input create; nunca lista/logs/errors.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `students/pages/list|new/*` | Mod/New | Polish + editor |
| students service/models/HTTP | Modified | `crear` + nullables |
| `app.routes.ts` (+spec) | Modified | `alumnos/nuevo` first |
| openspec students + http | Modified | REQ-SLIST / REQ-SEDIT |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `:id` captura `nuevo` | Med | Orden ruta + test |
| Hardcodes HTTP rompen filtros/badges | High | `null` + UI honesta |
| >400 LOC | High | `size:exception` orquestador |

## Rollback Plan

Revertir página new, ruta, CTA, `crear`, cambios de modelo/lista y deltas de specs. Sin DB/API.

## Dependencies

- `POST /admin/alumnos` (`AdminMasterDataService::createStudent`).
- Patrón `CourseEditorPage` / `HttpCoursesService.crear`.
- Visual: `muestra_pagina/.../lista-alumnos.tsx`.

## Success Criteria

- [ ] CTA navega a `/admin/alumnos/nuevo` (no cae en `:id`).
- [ ] POST body exacto; `201` → detalle.
- [ ] Validación inline + error POST + sin doble submit.
- [ ] Badges/placeholders honestos; SVG en estados; privacy OK.
- [ ] Tests focalizados verdes.
