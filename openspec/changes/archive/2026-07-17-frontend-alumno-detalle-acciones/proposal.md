# Proposal: Detalle de alumno — habilitar acciones

## Intent

Cerrar el gap del detalle `/admin/alumnos/:id`: CTAs de emisión usable hacia `/admin/certificaciones/nueva` con preselección por query, y lectura honesta de asistencias cuando el seam exista — sin fingir editar/compartir ni enlazar listados sin filtro.

## Scope

### In Scope
- CTA “Nueva certificación” activo → `/admin/certificaciones/nueva?alumno=:id`.
- “Emitir certificación” en fila `pendiente` → misma ruta + `&curso=` si `curso.id` es numérico real; si no, solo `alumno`.
- Preselección query en `CertificationNewPage` (`alumno`, opcional `curso`): si id existe y activo → preselect; si no → ignorar + aviso no bloqueante.
- “Ver asistencias”: seam `listarAsistenciasPorAlumno` + sección/listado read-only en el detalle (sin link falso a `/admin/asistencias`).
- Compartir / Editar: disabled con motivos honestos (entrega por cert; sin PATCH de datos).
- Specs/tests focalizados; retirar handoff F2-05 obsoleto.

### Out of Scope
- Rutas anidadas v0 (`/alumnos/:id/certificaciones/nueva`, etc.).
- Edición de datos personales; Compartir a nivel legajo.
- Inventar campos, DNI completo admin, métricas fake.
- Cambiar backend/DB; paridad lucide/React.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-students-frontend`: acciones del detalle + sección asistencias read-only.
- `admin-certifications-frontend`: preselección query en emisión nueva.
- `admin-attendances-frontend` / `frontend-http-services`: seam `listarAsistenciasPorAlumno` (GET `?alumnoId=`).

## Approach

Explore **Approach 2 acotado**, ciclo único (`size:exception`): habilitar emisión + query preselect obligatorio; asistencias mínimas con adapter real; disabled honestos para Compartir/Editar. Identifiers EN; UI ES-AR; OnPush/signals.

## Proposal question round

Cerrado por locks del orquestador (sin ronda interactiva):

1. Emisión CTA + Emitir fila con query `alumno`/`curso`.
2. Preselect con validación activo + aviso no bloqueante si inválido.
3. Asistencias: implementar si seam real; no link global sin filtro.
4. Compartir/Editar siguen disabled.
5. No inventar campos; no DNI completo en admin.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `students/pages/detail/*` | Modified | CTAs + sección asistencias |
| `certifications/pages/new/*` | Modified | Query preselect |
| `attendances` types/HTTP/mock | Modified | `listarAsistenciasPorAlumno` |
| openspec students/certs/attendances/http | Modified | REQ-SDET / deltas |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs/tests afirman disabled | High | Invertir asserts + REQ-SDET |
| Query sin preselect = UX rota | Med | Implementar en misma entrega |
| Link a `/admin/asistencias` | Med | Solo sección filtrada |
| >400 LOC | Med | `size:exception` orquestador |

## Rollback Plan

Revertir CTAs, preselect, seam asistencias, sección UI y deltas de specs. Sin DB/API nuevas.

## Dependencies

- Emisión Ciclo 2 (`/admin/certificaciones/nueva`).
- Backend `GET /admin/asistencias?alumnoId=` (opcional).
- Visual: `muestra_pagina/.../alumno-detalle.tsx` (referencia, no rutas anidadas).

## Success Criteria

- [ ] Nueva certificación / Emitir navegan con query correcta.
- [ ] Preselect aplica solo a ids activos existentes; inválidos no bloquean.
- [ ] Ver asistencias muestra datos reales o empty/error honesto; no link falso.
- [ ] Compartir/Editar disabled con copy correcto.
- [ ] Tests focalizados verdes; listo para verify.
