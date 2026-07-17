# Proposal: Marcado de asistencias — polish UI

## Intent

Alinear la pantalla de marcado Angular con la paridad v0 (`asistencias-editor` / capturas `asist-*`): selector de fecha inline, resumen con dirty, toggle «✓ Presente» accesible y Guardar solo con cambios — sin inventar aviso de impacto de certificados ni filtrar columnas privadas (email/legajo).

## Scope

### In Scope
- Dropdown «Fecha de la clase» desde `detalle().fechas`; `Router.navigate` al mismo patrón `/admin/cursos/:id/fechas/:fechaId/asistencias`
- Confirmación/aviso si hay dirty antes de cambiar fecha (no descartar en silencio)
- Resumen: fecha seleccionada, presentes, cambios sin guardar
- Toggle visual «✓ Presente» / marcar (`role`/`aria-pressed`) en lugar de checkbox nativo
- Guardar deshabilitado si `!dirty`; Descartar restaura baseline
- Privacy: solo `dniMostrar` (+ nombre); UI español; OnPush/signals
- Delta specs/tests que exigían checkbox; documentar gap impacto certificados como non-goal

### Out of Scope
- Aviso impacto certificados / flag `certificada` / conteos (sin API; snapshot backend solo en mutación)
- Nueva ruta `/cursos/:id/asistencias`; cambios a `AttendanceService` / HTTP / backend
- Email, legajo, DNI completo; portar React/Next literal
- Verify formal / archive

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-attendances-frontend`: marcar con toggle accesible; selector de fecha + dirty guard; resumen dirty; non-goal impacto certificados; privacy vigente

## Approach

Polish in-place (exploration Approach 1 + sub-opción A): enriquecer `AttendanceMarkingPage` con select de fechas del curso, `navigate` por `:fechaId` (reuse + `effect` anti-stale), prompt dirty al cambiar fecha, panel resumen (fecha / presentes / dirty count), botones Presente en vez de checkbox, Guardar gated por dirty. Sin mock de certificados.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `attendances/pages/marking/attendance-marking-page.*` | Modified | Selector, resumen, toggle, dirty UX |
| `openspec/specs/admin-attendances-frontend` | Modified | Checkbox → toggle; escenarios selector/resumen |
| `AttendanceService` / HTTP / routes nuevas | None | Fuera de alcance |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs/tests anclan checkbox | High | Delta REQ + specs marking juntos |
| Navigate pierde dirty | Med | Confirm/aviso antes de cambiar fecha |
| Scope creep CSS sticky/mobile | Med | Paridad útil, no copia literal v0 |
| Presión por aviso impacto | Low | Non-goal documentado + handoff API |

## Rollback Plan

Revertir cambios en `attendance-marking-page.*` y delta de `admin-attendances-frontend`. Contrato de servicio intacto.

## Dependencies

- Ruta y carga marking existentes (`fechaId`, `loadGen`)
- `detalle.fechas` del curso; capturas `asist-desktop/mobile*`
- Spec vigente `admin-attendances-frontend`

## Success Criteria

- [ ] Selector cambia fecha vía navigate; dirty no se pierde en silencio
- [ ] Resumen muestra fecha, presentes y cambios sin guardar
- [ ] Toggle Presente accesible; sin checkbox nativo en marcado
- [ ] Sin email/legajo; `dniMostrar` enmascarado
- [ ] Specs marking verdes; gap impacto documentado como non-goal
