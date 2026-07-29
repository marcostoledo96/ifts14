# Proposal: Auditoría P10 — editor de alumnos

## Intent

Cerrar gaps del editor admin (`nuevo` / `:id/editar`) tras P9: copy con «legajo», error carga sin Reintentar, tests sesgados a create y spec sin edit/lote. Conservar validación, 409/`StudentDuplicateError` y create vs edit.

## Scope

### In Scope

- Quitar «legajo» de ayuda email y copy del editor.
- **Reintentar** en error de carga (patrón P8) + «Volver a Alumnos».
- Tests edit: carga OK, no encontrado, `actualizar`, 409 con enlace si hay id.
- Delta `admin-students-frontend` (create/edit, 409, DNI UI, sin PII); reubicar duplicado si se toca «Búsqueda y filtros».
- HTTP `actualizar` 409/`findIdByDni`: solo si se prueba fallo sin `existingStudentId`; preferir página; sin backend.

### Out of Scope

- Listado, detalle (P11), rediseño lote, navegación post-alta (incluso 1 alumno).
- Backend, token/QR, chip email listado, UI inventada vs `muestra_pagina`.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-students-frontend`: create (lote + resumen sin navegar) / edit (carga/PATCH→detalle); copy sin legajo; Reintentar; 409 sin PII + enlace; DNI completo en UI.
- `frontend-http-services`: condicional — solo si se prueba gap 409 update sin id; si no, None.

## Approach

Auditoría quirúrgica in-place (explore #1) en `student-editor-page.*`; reutilizar `StudentDuplicateError`. Defaults: sin legajo; Reintentar+Volver; lote intacto; HTTP opcional; DNI UI / sin PII.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `student-editor-page.ts` | Modified | Reintento, 409 edit, mensajes |
| `student-editor-page.html` | Modified | Copy sin legajo; Reintentar |
| `student-editor-page.css` | Modified | Solo si hace falta |
| `student-editor-page.spec.ts` | Modified | Edit + 409 + copy |
| `http-students.service.ts` | Condicional | Fallback 409 update si probado |
| `admin-students-frontend/spec.md` | Modified | Delta editor |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Scope creep a P11 | Med | Solo editor (+ HTTP condicional) |
| Ocultar DNI en UI | Low | Hard rule DNI completo |
| PII en logs/errores | Low | Mensajes sin DNI/token + tests |
| Tests edit mal cableados | Med | `setInput` mode/id |
| >400 LOC | Low | Sin HTTP/lote preventivo |

## Rollback Plan

Revertir commits de la rama; sin migración ni backend. Si hubo HTTP, revertir con la página.

## Dependencies

- Explore P10 + defaults; spec post-P9; patrón Reintentar P8.

## Success Criteria

- [ ] Copy sin «legajo»; error carga con Reintentar + Volver.
- [ ] Create: resumen lote sin navegar; edit: guardar → detalle.
- [ ] 409 sin PII + enlace si hay id; DNI completo UI; sin PII en logs.
- [ ] Tests create+edit/409 OK; delta mergeable.
- [ ] HTTP sin cambio preventivo (o con evidencia).
