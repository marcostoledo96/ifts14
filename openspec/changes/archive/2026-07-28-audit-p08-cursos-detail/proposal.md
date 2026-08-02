# Proposal: Auditoría P8 — detalle de curso admin

## Intent

Cerrar gaps P8 en `/admin/cursos/:id`: errores not-found/HTTP poco claros, falta de CTA al hub de fechas/asistencias, y labels/formato parciales. Sin reabrir listado, editor ni backend.

## Scope

### In Scope

- Mensaje único «Curso no encontrado.» (id inválido, inexistente, HTTP 404) sin id ni cuerpo técnico.
- Error recuperable (red/API no-404) + Reintentar (`cargar()`); un `aria-live`.
- CTA «Ver fechas del curso» → `/admin/asistencias/curso/:id`.
- Labels humanas de estado; fechas es-AR; quitar «—» redundante en Pendiente.
- Tests `course-detail-page.spec.ts` + delta spec de detalle.
- Conservar deep-links, «Abrir primera fecha» y «Ver y entregar».

### Out of Scope

- Listado, editor, `HttpCoursesService` global, backend.
- Paridad visual amplia vs v0; métricas/certificaciones; `cuatrimestre` placeholder.
- Ruta ficticia `/admin/cursos/:id/asistencias`.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-courses-frontend`: detalle — not-found/HTTP, reintento, CTA hub, labels/formato; copy «Ver y entregar».
- `admin-attendances-frontend`: None (consume ruta del hub).

## Approach

Fix quirúrgico in-place (explore #1): mapear errores en la página (no en el servicio HTTP), CTA al hub, labels/formato, tests y delta MODIFIED acotado a detalle.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `course-detail-page.ts` | Modified | Errores, hub, labels |
| `course-detail-page.html` | Modified | UI error, CTA, badge, fechas |
| `course-detail-page.css` | Modified | Ajustes menores si hace falta |
| `course-detail-page.spec.ts` | Modified | Escenarios P8 |
| `admin-courses-frontend` (delta) | Modified | Contrato de detalle |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Confundir hub vs marcado | Med | Copy/ruta explícitos |
| Spec canónica desactualizada | Med | Delta en el mismo ciclo |
| Mensajes HTTP crudos en staging | Med | Mapear 404 en la página |
| Exceder budget de review | Low | Solo `course-detail-page.*` |

## Rollback Plan

Revertir PR/commit de `course-detail-page.*` y el delta. Sin migración ni cambio de API.

## Dependencies

- Hub `/admin/asistencias/curso/:id` existente; explore del cambio.

## Success Criteria

- [x] Not-found limpio sin ruido técnico.
- [x] Reintentar funcional en fallo recuperable.
- [x] CTA al hub con copy acordado.
- [x] Estado/fechas legibles; sin «—» confuso en Pendiente.
- [x] Tests verdes; listado/editor/backend intactos.

## Proposal question round

Asunciones (explore) a confirmar u omitir:

1. CTA = «Ver fechas del curso».
2. Mantener «Ver y entregar».
3. 404 solo en la página (no en `HttpCoursesService.obtener`).
4. Ocultar `cuatrimestre` placeholder.
5. Riesgo prioritario: mensajes técnicos + confusión hub/marcado.
