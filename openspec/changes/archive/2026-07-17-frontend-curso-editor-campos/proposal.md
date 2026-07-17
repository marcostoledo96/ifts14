# Proposal: Editor de curso — paridad v0 con contrato estricto

## Intent

Cerrar el gap del editor `/admin/cursos/nuevo` y `/admin/cursos/:id/editar`: hoy es un formulario F2-04 sin layout v0 y con `guardar()` en edición que solo reemplaza fechas (no persiste estado). Portar la referencia `curso-editor.tsx` a Angular 20 con paridad visual, exponiendo únicamente campos que el backend persiste.

## Scope

### In Scope
- Grid main + aside sticky (patrón `institutional-config-page` + v0).
- Toggle "Curso activo" real: on → PATCH `estado='activo'`; off → cerrado (o mantener archivado). Binario UI documentado sobre 4 estados backend.
- Tabla de fechas con columna índice `#`, date, descripción, estado; sin horario time.
- Aviso de impacto condicional cuando se modifican/quitan fechas `realizada` (certificados con PDF a regenerar).
- Metadatos en aside (código, estado, createdAt/updatedAt formateados).
- Edit `guardar()` = `actualizarEstado` (si cambió) + `reemplazarFechas`.
- Create: codigo+nombre; documentar que el backend crea siempre `activo` (ignora estado del body).
- Tests focalizados actualizados.

### Out of Scope
- Inputs fantasma: descripción/carga horaria/modalidad de curso, horario time, badge Emitidos/Sin emitir, checkbox nueva entrega, creado_por, firma hash.
- Editar nombre/código en edición (sin endpoint; read-only).
- Cambios backend/DB; PATCH post-create para estado.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-courses-frontend`: editor con layout v0, toggle de estado persistente, tabla de fechas con índice y aviso de impacto honesto.

## Approach

Approach 1 de exploration: rehacer template/CSS del editor con grid `minmax(0,1fr) + aside sticky`, signals/OnPush existentes, SVG inline (sin lucide). `HttpCoursesService` ya expone `crear/actualizarEstado/reemplazarFechas`; el componente pasa a orquestarlos en `guardar()`. UI en español argentino.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `courses/course-editor-page.{ts,html,css,spec.ts}` | Modified | Layout, toggle, índice, aviso, guardar() |
| `openspec/specs/admin-courses-frontend` | Modified | Delta REQ-CEDIT-* |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| POST ignora `estado` del body | High | Create sin toggle de persistencia fingida; copy "se crea activo" |
| Toggle binario vs 4 estados | Med | off→cerrado; borrador/archivado visibles en metadata |
| Quitar fecha realizada cancela + resync certs | Med | Aviso de impacto antes de guardar |
| >400 líneas | High | Single-cycle `size:exception` (decisión orquestador) |

## Rollback Plan

Revertir los 4 archivos del editor y el delta de spec. Sin migraciones ni API nuevas; `git checkout` de los paths afectados restaura F2-04.

## Dependencies

- `HttpCoursesService` / `InMemoryCoursesService` (ciclos previos).
- Referencia visual `muestra_pagina/components/admin/curso-editor.tsx`.

## Success Criteria

- [ ] Editor con grid + aside sticky y paridad visual v0 (sin campos fantasma).
- [ ] Toggle de estado persiste vía `actualizarEstado` al guardar.
- [ ] Tabla de fechas con índice `#`; aviso de impacto solo cuando corresponde.
- [ ] Create documenta default `activo`; nombre/código read-only en edit.
- [ ] Tests focalizados verdes; listo para verify.

## Proposal question round

Cerrado por locks del orquestador (ciclo dirigido): Approach 1, contrato estricto sin inputs fantasma, toggle binario documentado, aviso condicional, single-cycle ready-for-verify.
