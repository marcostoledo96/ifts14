# Exploration: frontend-curso-editor-campos

## Current State

- **v0** (`muestra_pagina/components/admin/curso-editor.tsx`): layout 2 columnas (`minmax(0,1fr) 18rem`); datos generales (nombre*, descripción, carga horaria, modalidad, toggle "Curso activo"); fechas con índice `#`, date, time horario, descripción, badge Emitidos/Sin emitir; aviso de impacto sobre certificados + checkbox "nueva entrega"; aside sticky con Guardar/Cancelar y metadatos (código, activo, creado por, última modificación, firma hash). Mock local, sin API.
- **Angular** (`course-editor-page.*`): formulario básico F2-04; demo banner; create: codigo+nombre+estado select; edit: codigo/nombre/estado disabled, título "Fechas de …"; fechas con date+descripción+estado select (programada/realizada/cancelada); acciones inline abajo; sin grid v0, sin índice, sin aside sticky. `COURSES_SOURCE` = InMemory o `HttpCoursesService` según `environment.useRealApi` en `app.routes.ts`.
- Capturas `curso-nuevo-desktop.png` / `curso-editar-*`: no encontradas en el repo; la referencia visual es `curso-editor.tsx`.

## Contrato backend REAL (`AdminMasterDataService`, `docs/backend/01-contrato-api-certificados.md`)

- **Curso** (`cert_cursos`): `codigo`, `nombre`, `estado` ∈ borrador|activo|cerrado|archivado, `createdAt`, `updatedAt`. POST `/admin/cursos` acepta codigo+nombre; **ignora `estado` del body** e inserta siempre `'activo'` (verificado en `createCourse`, INSERT literal `'activo'`). Única mutación de curso: PATCH `/admin/cursos/{id}/estado`. **No existe update de nombre/código.**
- **Fecha** (`cert_curso_fechas`): `fecha` (DATE `YYYY-MM-DD`), `descripcion`, `orden`, `estado` ∈ programada|realizada|cancelada. POST/PATCH fechas; sin DELETE (baja = estado `cancelada`, ya implementado en `HttpCoursesService.reemplazarFechas`). **Sin horario/time.**
- **Fuera de contrato**: descripción de curso, carga horaria, modalidad, cuatrimestre, creado_por, firma/hash, badge emitidos por fecha, conteo de alumnos afectados.
- **Impacto certificados**: al PATCH de fecha `realizada` el backend sincroniza snapshots y marca PDF desactualizado (`syncAllCourseCertificatesSnapshots`). No hay flag por-fecha en la API.

## Gaps vs v0

| Feature v0 | Backend | Decisión |
|---|---|---|
| descripción/carga/modalidad curso | No persiste | Fuera de scope (sin inputs fantasma) |
| toggle "Curso activo" | PATCH estado (4 valores) | Mapear binario → activo vs cerrado/archivado |
| aside sticky + metadatos | Solo codigo/estado/createdAt/updatedAt | Panel sticky sí; metadata parcial; sin creado_por/firma |
| aviso impacto certificados | Lógica backend en fechas realizadas | Aviso condicional al tocar/quitar fechas `realizada` |
| horario time en fechas | No | Fuera de scope |
| badge Emitidos/Sin emitir | Sin dato por fecha | Fuera de scope; no inventar |
| columna índice `#` | UI pura | In scope |
| editar nombre/código en edición | Sin endpoint | Read-only en edit |

## Approaches

1. **Paridad visual con contrato estricto** — portar layout v0; inputs solo para campos de API; avisos sin datos fantasma. Effort Medium (~500–900 líneas html+css+ts+spec). **Recomendado.**
2. **Phantom inputs deshabilitados** — descripción/carga/modalidad/horario como disabled "próximamente". Descartado: confunde operadores y viola la regla anti-inputs fantasma.
3. **Solo funcional mínimo** — mantener fieldsets actuales + wire de estado. Descartado: no cumple paridad v0 del ciclo 9.

## Risks

- POST create ignora `estado` → documentar default `activo` (preferido) en lugar de PATCH post-create.
- Semántica activo/inactivo v0 vs 4 estados backend: el toggle debe ser honesto (off = cerrado/archivado según estado previo).
- `reemplazarFechas` cancela fechas quitadas → impacto real en certificados de fechas `realizada`.
- Budget 400 líneas: riesgo Alto por CSS de layout → single-cycle con `size:exception` (decisión del orquestador).

## Ready for Proposal

Sí — contrato verificado contra `AdminMasterDataService.php` y `HttpCoursesService`; Approach 1 seleccionado por el orquestador.
