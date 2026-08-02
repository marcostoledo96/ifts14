# Exploration: audit-p09-alumnos-list

**Cambio**: `audit-p09-alumnos-list`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-28
**Almacén**: openspec
**Rama**: `audit/p09-alumnos-list`
**Alcance de fase**: solo listado `/admin/alumnos` → `students-list-page.*` (+ `HttpStudentsService` mapping si métricas fallan)
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P9; `openspec/specs/admin-students-frontend/spec.md`; `muestra_pagina/components/admin/lista-alumnos.tsx`; ciclos `frontend-alumnos-list-polish` / `frontend-parity-alumnos-list`; patrón filtros client-side P6 (`courses-list-page`)

## Exploration: Listado de alumnos admin (P9)

### Current State

`StudentsListPage` ya es un listado maduro post polish/paridad: carga vía `STUDENTS_SOURCE` (`HttpStudentsService` si `environment.useRealApi`, si no in-memory), filtros client-side (texto + chips), paginación 20, estados carga/error/vacío/sin coincidencias, badges de contacto honestos y métricas nullable → `—`. Staging usa HTTP real; el backend `AdminMasterDataService::listStudents()` adjunta métricas agregadas.

| Checklist P9 | Estado hoy | Evidencia |
|---|---|---|
| DNI completo visible | **OK** | Columna/tarjeta `alumno.dniMostrar`; tests prohíben legajo inventado. Backend `adminDniDisplay` (completo o decrypt). Hard rule: UI sí; logs/errores no. |
| Filtros email / cert | **OK con matiz** | Chips v0: Con/Sin certificaciones + Sin email. `con-email` existe en TS pero **sin chip** (comentario explícito paridad v0). Filtros null-safe (`tieneEmail`/`certificacionesValidas` null no matchean). |
| Métricas certificaciones / cursos | **OK en código; verificar staging** | API lista siempre envía ints (`cursosConAsistencia`, `certificacionesValidas`, …). `toAlumno` → `optionalCount`. UI: número o `—` si null. No hay indicios de mapping roto en repo; solo tocar HTTP si staging muestra `—` injustificado. |
| Paginación, vacíos, QA solo en dev | **OK** | `STUDENTS_PAGE_SIZE = 20`; pager con elipsis desktop; vacío total + sin coincidencias; `STUDENTS_QA_ENABLED = isDevMode` (invisible en staging/prod). |
| Copy «Contacto disponible» / etc. | **OK (divergencia consciente vs v0)** | Badge: Contacto disponible / Sin email / Sin dato. **No** renderiza email literal (privacidad polish). v0 sí muestra email. |

**Comportamiento técnico vigente**

- Patrón P6: `listar()` trae el catálogo; `resultadosFiltrados` + `itemsVisibles` filtran/paginan en cliente (`loadGeneration` ante reintentos).
- Contacto: `etiquetaContacto` / `mostrarWarningSinEmail`; métricas: `formatoMetrica` / `mostrarBook` / `mostrarShield`.
- Spec canónica aún describe fuente mock-only y «Sin red»; el runtime staging ya es HTTP — **drift documental**.
- Tests sólidos en `students-list-page.spec.ts` (+ `http-students.service.spec.ts` mapea métricas de listado).

**Residuos menores (no bloquean checklist)**

- Intro y vacío mencionan «legajo(s)» aunque la tabla no muestra legajo (honestidad copy).
- Spec canónica desactualizada (mock / sin HTTP).
- Pager mobile sin elipsis (desktop sí); cosmético.

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/students/pages/list/students-list-page.ts` — filtros, QA, helpers de copy/métricas.
- `apps/frontend-angular/src/app/features/admin/students/pages/list/students-list-page.html` — tabla/cards, chips, estados, copy intro/vacío.
- `apps/frontend-angular/src/app/features/admin/students/pages/list/students-list-page.css` — solo si hace falta ajuste mínimo de badges/pager.
- `apps/frontend-angular/src/app/features/admin/students/pages/list/students-list-page.spec.ts` — escenarios P9 / regresión.
- `apps/frontend-angular/src/app/features/admin/students/http-students.service.ts` — **solo si** staging prueba métricas ausentes o claves mal mapeadas (`toAlumno` / `optionalCount`).
- `openspec/specs/admin-students-frontend/spec.md` — delta MODIFIED: realidad HTTP + DNI completo UI + QA + copy contacto sin email literal.
- **Fuera de alcance**: editor (`student-editor-page`), detalle (`student-detail-page`), backend PHP (salvo evidencia staging de payload incompleto), token/QR (N/A).
- **Solo lectura**: `muestra_pagina/components/admin/lista-alumnos.tsx`; `courses-list-page` como patrón de filtros client-side.

### Approaches

1. **Auditoría quirúrgica in-place (recomendada)** — Verificar checklist P9; corregir residuos de copy/spec; tocar `HttpStudentsService` únicamente con evidencia de métricas rotas.
   - Pros: alineado al plan («No tocar editor/detalle salvo links rotos»); blast radius bajo; reutiliza tests y patrón P6 ya presente.
   - Cons: no reabre paridad email literal vs v0 (correcto por privacidad).
   - Effort: Low

2. **Paridad visual amplia vs v0** — Email literal en tabla, chip «Con email», rediseño cards/iconografía Lucide, toggles QA visibles como en React.
   - Pros: look más cercano a muestra.
   - Cons: contradice decisión privacy polish; riesgo >400 LOC; QA en staging violaría «solo en dev».
   - Effort: High

3. **Solo delta documental** — Actualizar spec/changelog sin tocar UI.
   - Pros: cero riesgo de regresión UI.
   - Cons: deja copy «legajo» y no cierra gate de auditoría si staging revela gap de métricas.
   - Effort: Low

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Checklist P9 como aceptación**
   - Confirmar DNI completo en UI (tabla + cards); filtros cert + sin-email; métricas numéricas (no `—` si API envía 0/N); paginación/vacíos/error/Reintentar; QA ausente fuera de `isDevMode`.
   - Conservar copy «Contacto disponible» / «Sin email» / «Sin dato» **sin** email literal.

2. **Residuos de honesty copy**
   - Sustituir «Legajos…» / «su legajo…» en intro y vacío por redacción sin inventar legajo (p. ej. registro de alumnos / ficha).

3. **HttpStudentsService**
   - No refactor preventivo. Si staging muestra `—` con payload real incompleto o tipado raro, endurecer `optionalCount` / alias de claves **mínimo**.
   - No loguear DNI ni token en errores.

4. **Spec**
   - Delta MODIFIED: listado HTTP + DNI completo UI + filtros client-side + QA solo dev + contacto por badge (no email literal). Retirar o acotar «Sin red» mock-only.

5. **Fuera de P9**
   - Editor/detalle, chip «Con email» en UI, rediseño v0, cambios backend de agregación, token/QR.

### Questions (para propose)

1. ¿El copy intro/vacío debe eliminar la palabra «legajo» en este ciclo o diferirlo?
2. ¿Hace falta chip «Con email» además de «Sin email», o se mantiene solo el set v0?
3. ¿Se confirma en staging (smoke manual) que métricas llegan numéricas antes de tocar `HttpStudentsService`? Recomendación explore: **sí, verificar primero**.

### Risks

- Spec canónica mock-only puede hacer fallar verify si el delta no actualiza el contrato HTTP.
- Confundir «Contacto disponible» (badge privacy) con regresión vs v0 (email literal) y «arreglar» mostrando PII innecesaria.
- Tocar backend o editor/detalle fuera de alcance y romper presupuesto 400 LOC / oleada alumnos.
- Si `dni_mostrar` en BD trae máscara y falla decrypt, UI podría no mostrar DNI completo — es riesgo de datos/config, no del listado Angular; documentar si aparece en smoke.
- Hard rules: DNI completo en UI OK; **nunca** DNI/token completos en logs/errores/dumps.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico: cierre checklist P9 sobre `students-list-page.*`, copy honesty sin legajo inventado, delta spec HTTP/staging, y `HttpStudentsService` solo ante evidencia de métricas rotas; tests del área + gate 4R; sin editor/detalle/backend salvo payload incompleto comprobado.
