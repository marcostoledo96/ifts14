# Proposal: Auditoría P9 — listado de alumnos admin

## Intent

Cerrar el gate P9 sobre `/admin/alumnos` (`students-list-page.*`): checklist mayormente OK; residuos de copy «legajo», drift de spec mock-only vs HTTP staging, y verificación de métricas/estados sin expandir editor ni detalle.

## Scope

### In Scope

- Checklist P9: DNI completo UI (tabla + cards); filtros cert + sin-email; métricas numéricas (no `—` si API envía 0/N); paginación 20; vacíos/error/Reintentar; QA solo `isDevMode`.
- Copy honesty: sustituir «Legajos…» / «su legajo…» en intro y vacío.
- Conservar badges «Contacto disponible» / «Sin email» / «Sin dato» **sin** email literal.
- Tests `students-list-page.spec.ts` (+ HTTP solo si aplica).
- Delta MODIFIED `admin-students-frontend`: HTTP + DNI UI + QA + badges.
- `HttpStudentsService` **solo** si smoke staging prueba métricas/mapping rotos.

### Out of Scope

- Editor, detalle; chip UI «Con email»; email literal; rediseño v0; backend; token/QR.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-students-frontend`: listado HTTP/`STUDENTS_SOURCE`; DNI completo UI; filtros client-side; QA solo dev; contacto por badge; copy sin legajo; estados error/vacío.
- `frontend-http-services`: None salvo evidencia staging; entonces delta mínimo `toAlumno`/`optionalCount` sin PII en errores.

## Approach

Auditoría quirúrgica in-place (explore #1): verificar checklist; corregir copy; actualizar spec; no refactor preventivo de HTTP. Confirmar métricas en staging antes de tocar el servicio.

## Proposal question round

Defaults recomendados (orquestador confirma):

1. **¿Eliminar «legajo» del copy en este ciclo?** → **Sí**.
2. **¿Chip «Con email» además de «Sin email»?** → **No** (set v0).
3. **¿Smoke staging de métricas antes de tocar HTTP?** → **Sí**.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `students/pages/list/students-list-page.*` | Modified | Copy, estados, checklist P9 |
| `students/http-students.service.ts` | Conditional | Solo si métricas/mapping rotos |
| `openspec/specs/admin-students-frontend/spec.md` | Modified | Delta HTTP + DNI + QA + badges |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Spec mock-only falla verify | Med | Delta MODIFIED HTTP/staging |
| Mostrar email literal «por paridad» | Med | Conservar badges privacy |
| Scope creep editor/detalle/backend | Med | Fuera de alcance |
| `dni_mostrar` enmascarado | Low | Documentar en smoke |
| PII en logs/errores | Low | Sin DNI/token completos |

## Rollback Plan

Revertir commits en `students-list-page.*` (y HTTP/spec si se tocaron). Sin migraciones ni API.

## Dependencies

- Explore P9; plan QA §P9; patrón P6; staging `useRealApi` + `listStudents()`.

## Success Criteria

- [ ] Checklist P9 verificable (DNI, filtros, métricas, pager, vacíos/error, QA solo dev).
- [ ] Copy sin «legajo» inventado; sin email literal; sin PII en logs.
- [ ] Spec delta HTTP/staging; tests del área verdes; sin editor/detalle.
