# Tasks: Nueva certificación Angular (emisión directa)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 700–1100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes (diferido) |
| Suggested split | PR1 seam → PR2 attendance → PR3 page → PR4 route/CTA |
| Delivery strategy | single-cycle apply (orquestador) |
| Chain strategy | size-exception (apply completo) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Seam emitir | PR1 | `ng test --include=**/http-certifications.service.spec.ts --include=**/certifications.service.spec.ts --watch=false` | N/A unit | Revert certifications service/models |
| 2 | Attendance por par | PR2 | `ng test --include=**/http-attendance.service.spec.ts --watch=false` | N/A unit | Revert attendance types/http/mock |
| 3 | Página new | PR3 | `ng test --include=**/certification-new-page.spec.ts --watch=false` | N/A unit | Revert `pages/new/*` |
| 4 | Ruta + CTA | PR4 | `ng test --include=**/app.routes.spec.ts --include=**/certifications-list-page.spec.ts --watch=false` | Manual `/admin/certificaciones/nueva` | Revert routes + list CTA |

## Phase 1: Seam emitir (REQ-EMIT-006/010)

- [x] 1.1 **RED** — Specs HTTP/in-memory: `emitir` POST body exacto; map `data`; 400/409/500. → REQ-010
- [x] 1.2 **GREEN** — `certifications.models.ts` payload/result; `certifications.service.ts` + HTTP + InMemory `emitir`. → REQ-006/010
- [x] 1.3 **RED→GREEN** — HTTP `listar` envía query `estado`/`cursoId`/`alumnoId` si vienen. → REQ-009

## Phase 2: Asistencias por par (REQ-EMIT-003)

- [x] 2.1 **RED** — Specs HTTP/mock: `listarAsistenciasPorPar(cursoId, alumnoId)`. → REQ-003
- [x] 2.2 **GREEN** — Extender `AttendanceService` + HTTP (`GET ?cursoId&alumnoId`) + mock. → REQ-003
- [x] 2.3 **RED→GREEN** — Alumnos: exponer `estado` y filtrar activos en página (modelo/HTTP si falta). → REQ-002

## Phase 3: Página new (REQ-EMIT-002…009)

Path: `features/admin/certifications/pages/new/certification-new-page.*`

- [x] 3.1 **RED** — Specs: selectores activos; presentes; stale discard; vacíos bloqueantes. → REQ-002/003/004
- [x] 3.2 **GREEN** — Orquestación signals + anti-stale + avisos. → REQ-002/003/004
- [x] 3.3 **RED→GREEN** — Preview tipográfica (nombre, dniMostrar, curso, fechas, firmantes); sin email/logos/folio. → REQ-005
- [x] 3.4 **RED→GREEN** — Emitir body defaults BA/`expiresAt:null`; disable doble submit; navigate `201`; errores 400/409/500. → REQ-006/007/008/009

## Phase 4: Ruta + CTA (REQ-EMIT-001)

- [x] 4.1 **RED→GREEN** — Ruta `certificaciones/nueva` **antes** de `:id` + `app.routes.spec.ts`. → REQ-001
- [x] 4.2 **RED→GREEN** — CTA “Nueva certificación” en listado (link a `/admin/certificaciones/nueva`). → REQ-001

## Phase 5: Tracking

- [x] 5.1 Crear/actualizar `apply-progress.md` con checklist y evidencia TDD.
- [x] 5.2 Tests focalizados de seams/página/rutas (verify formal = sdd-verify).
