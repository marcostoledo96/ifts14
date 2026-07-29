# Exploration: audit-p13-asist-fechas

**Cambio**: `audit-p13-asist-fechas`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p13-asist-fechas`
**Alcance de fase**: intermedia `/admin/asistencias/curso/:id` → `attendance-course-dates-page.*`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P13; `openspec/specs/admin-attendances-frontend/spec.md` (Página intermedia de fechas del curso); patrón `errorRecuperable` de P08/P11 (`course-detail-page`, `student-detail-page`)

## Exploration: Intermedia de fechas del curso (P13)

### Current State

`AttendanceCourseDatesPage` es la intermedia hub → fechas asistibles → marcado. Carga un solo `ATTENDANCE_SOURCE.listarHub()`, filtra fechas del `:id` con `estado !== 'cancelada'`, ordena cronológicamente (`fecha` → `orden` → `id`), ofrece chips `programada`/`realizada` (+ búsqueda por fecha/descripción) y CTA «Tomar asistencia» a `/admin/cursos/:id/fechas/:fechaId/asistencias`. `loadGen` + effect sobre `id` cubren reutilización de ruta. Empty total enlaza al detalle del curso. No hay roster ni DNI en esta pantalla.

| Checklist P13 | Estado hoy | Evidencia |
|---|---|---|
| Orden cronológico | **OK** | Sort ascendente por `fecha`, tie-break `orden`/`id`; test «más antigua → más reciente». |
| Filtros programada/realizada | **OK** | Chips toggle + `filtradas`; excluye `cancelada` del listado base; tests de chips y vacío de filtro. |
| Links a marcado | **OK** | `linkMarcado` → `/admin/cursos/:id/fechas/:fechaId/asistencias`; test de hrefs. |
| Curso inexistente | **OK con matices** | Hub sin curso / id inválido → `error = 'Curso no encontrado.'` + panel; tests presentes. **Reintentar** sigue visible (acción inútil). |

**Comportamiento técnico vigente**

- Ruta: `app.routes.ts` → `asistencias/curso/:id` **antes** de `asistencias` (tests de orden + navegación en `app.routes.spec.ts`).
- Datos: solo `listarHub()`; sin GET extra de fechas/curso. Presentes por fecha = conteo de `hub.asistencias` del curso.
- Copy/errores: catch → «No se pudieron cargar las fechas. Reintentá.»; not-found/id inválido → «Curso no encontrado.» Título del panel **siempre** «No pudimos cargar las fechas» (también en not-found). Acciones: Reintentar + Volver a Asistencias.
- `loadGen`: incrementa en `cargar`; descarta éxito/error/finally obsoletos; al cambiar `:id` resetea `q`/`estado`.
- PII: sin DNI/email/token/legajo en template ni mensajes; sin `console.*` en la página.
- Spec canónica: «Página intermedia de fechas del curso» ya exige asistibles, CTA marcado, empty, curso inexistente, orden de ruta. **No** exige aún «Reintentar solo recuperable» (sí está en plan P13 y en patrón P08/P11).

**Residuos / gaps**

1. **Reintentar en errores no recuperables** — panel único muestra Reintentar para id inválido y curso ausente del hub. Patrón canónico reciente: `errorRecuperable` + botón solo si `true` (P08 detalle curso / P11 detalle alumno).
2. **Copy del panel de error** — título «No pudimos cargar las fechas» contradice not-found; conviene título/mensaje honestos (p. ej. curso no encontrado vs fallo de carga) sin inventar PII.
3. **Tests de honesty** — faltan: Reintentar ausente en id inválido/curso ausente; Reintentar presente + `loadGen` en fallo recuperable de `listarHub`; opcional assert de título diferenciado.
4. **Spec** — PUEDE MODIFIED «Página intermedia…» o ADDED escenario Reintentar solo recuperable / id inválido sin Reintentar; checklist funcional ya cubierta.

### Affected Areas

- `apps/frontend-angular/.../attendances/pages/course-dates/attendance-course-dates-page.ts` — `errorRecuperable` (o equivalente); gate en `onReintentar`; flags en id inválido / curso ausente / catch.
- `apps/frontend-angular/.../attendances/pages/course-dates/attendance-course-dates-page.html` — Reintentar condicional; copy de título/mensaje si se distingue not-found.
- `apps/frontend-angular/.../attendances/pages/course-dates/attendance-course-dates-page.spec.ts` — tests Reintentar recuperable vs no; conservar orden/filtros/CTA/empty/ruta.
- `openspec/specs/admin-attendances-frontend/spec.md` — delta mínimo si propose quiere contrato explícito de Reintentar.
- **Fuera de alcance**: hub P12 (`attendances-list-page`), marcado P14, certificados por fecha, backend/`listarHub` contrato, rediseño visual vs `muestra_pagina/`.

### Approaches

1. **Auditoría quirúrgica in-place (recomendada)** — Añadir `errorRecuperable` al estilo P08/P11; ocultar Reintentar en id inválido y curso no encontrado; ajustar copy del panel; tests focalizados; delta spec mínimo.
   - Pros: cierra gap del plan P13; checklist funcional ya OK; blast radius bajo; paridad con auditorías recientes.
   - Cons: toca HTML de error (diff pequeño).
   - Effort: Low

2. **Solo tests sin cambiar UI** — Documentar/assert que Reintentar existe siempre.
   - Pros: cero cambio de producto.
   - Cons: deja el gap de honesty del plan P13.
   - Effort: Low

3. **Refactor amplio de estados de error / empty** — Unificar patrón QA vistas o rediseñar paneles.
   - Pros: más homogeneidad admin.
   - Cons: scope creep; riesgo 400 LOC; no pedido por P13.
   - Effort: Medium–High

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Checklist P13 como aceptación (conservar)**
   - Orden cronológico; chips programada/realizada; CTA marcado; empty con enlace a detalle; curso inexistente controlado; orden de ruta.
   - Sin PII; sin tocar hub P12 ni marcado P14.

2. **Reintentar solo recuperable**
   - `errorRecuperable = true` solo en `catch` de `listarHub`.
   - Id inválido / curso ausente: error no recuperable; solo Volver (y back-link).
   - `onReintentar` no-op si no recuperable.

3. **Copy**
   - Diferenciar título/mensaje not-found vs fallo de carga (sin DNI/token).
   - Mantener tono es-AR formal existente.

4. **Tests / spec**
   - Extender suite: Reintentar visible solo en fallo mock de hub; ausente en `abc`/`9999`.
   - Delta `admin-attendances-frontend` para explicitar Reintentar/id inválido si propose lo pide; no reabrir P12/P14.

### Questions (para propose)

1. ¿Se confirma el patrón `errorRecuperable` de P08/P11 (recomendado: **sí**)?
2. ¿Diferenciar título del panel not-found vs carga fallida (recomendado: **sí**, cambio mínimo de copy)?
3. ¿Delta spec explícito de Reintentar, o solo design/tasks + tests (recomendado: **delta corto** para alinear canónica al plan P13)?
4. ¿Algún cambio a HTTP/`listarHub` (recomendado: **no**)?

### Risks

- Ampliar a hub P12 o marcado P14 → scope creep y presupuesto 400 LOC.
- Dejar Reintentar en not-found → regresión de honesty frente a P08/P11.
- Cambiar semántica de filtros/orden al tocar `cargar` → romper tests ya verdes.
- Introducir PII en mensajes de error (hoy ausente; no introducir).

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `attendance-course-dates-page.*`: checklist P13 funcional OK; cerrar Reintentar solo recuperable + copy honesto + tests; sin hub ni marcado.
