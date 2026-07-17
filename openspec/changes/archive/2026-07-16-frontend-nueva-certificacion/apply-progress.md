# Apply progress — frontend-nueva-certificacion

**Estado:** apply completo — listo para `sdd-verify`  
**Estrategia:** single-cycle apply / size-exception  
**Fecha:** 2026-07-16

## Checklist de tareas

| ID | Estado | Evidencia |
|----|--------|-----------|
| 1.1 | [x] | Specs HTTP emitir 201/400/409/500 + query filtros |
| 1.2 | [x] | Models + interface + HTTP + InMemory `emitir` |
| 1.3 | [x] | `listar` envía `estado`/`cursoId`/`alumnoId` |
| 2.1 | [x] | Specs HTTP/mock `listarAsistenciasPorPar` |
| 2.2 | [x] | AttendanceService + HTTP + mock |
| 2.3 | [x] | `Alumno.estado` + filtro activos en página |
| 3.1–3.4 | [x] | `pages/new/*` + specs (selectores, stale, preview, emitir, errores) |
| 4.1 | [x] | Ruta `certificaciones/nueva` antes de `:id` + routes specs |
| 4.2 | [x] | CTA listado → `/admin/certificaciones/nueva` |
| 5.1 | [x] | Este archivo |
| 5.2 | [x] | Tests focalizados OK (202 SUCCESS) |

## Archivos principales

### Seams
- `certifications.models.ts` — `EmitirCertificacionPayload`, `EmisionResult`, filtros `cursoId`/`alumnoId`
- `certifications.service.ts` — `emitir`
- `http-certifications.service.ts` (+spec) — POST body exacto + query listar
- `in-memory-certifications.service.ts` (+spec) — emitir + 409 por par
- `attendances/models/attendance.types.ts` — `listarAsistenciasPorPar`
- `http-attendance.service.ts` / `attendance-mock.service.ts` (+specs)
- `students.models.ts` + HTTP/in-memory — `estado`

### UI
- `certifications/pages/new/certification-new-page.{ts,html,css,spec.ts}`
- `app.routes.ts` (+spec) — `certificaciones/nueva`
- `certifications-list-page.html/.css` (+spec) — CTA

## Tests focalizados

```bash
cd apps/frontend-angular && npm run test:ci -- \
  --include='**/http-certifications.service.spec.ts' \
  --include='**/certifications.service.spec.ts' \
  --include='**/http-attendance.service.spec.ts' \
  --include='**/attendance-mock.service.spec.ts' \
  --include='**/certification-new-page.spec.ts' \
  --include='**/certifications-list-page.spec.ts' \
  --include='**/app.routes.spec.ts'
```

**Resultado:** 202 SUCCESS  

Verify formal (tsc app, build, suite completa, paridad visual) → `sdd-verify`.

## Notas de implementación

- Body POST exacto: `{ alumnoId, cursoId, issuedAt, expiresAt }` con `issuedAt` = hoy BA y `expiresAt: null`.
- Sin wizard; preview tipográfica desde config + selectores; sin email/DNI completo/logos/folio.
- Anti-stale con `loadGen` al cambiar par.
- `409` es autoridad; aviso anticipado vía `listar({estado:'vigente', cursoId, alumnoId})` es MAY.
