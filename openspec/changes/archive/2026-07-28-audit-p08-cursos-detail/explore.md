# Exploration: audit-p08-cursos-detail

**Cambio**: `audit-p08-cursos-detail`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-28
**Almacén**: openspec
**Rama**: `audit/p08-cursos-detail`
**Alcance de fase**: solo detalle `/admin/cursos/:id` → `course-detail-page.*`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P8; `openspec/specs/admin-courses-frontend/spec.md`; `muestra_pagina/components/admin/curso-detalle.tsx`; ciclo histórico F4-04

## Exploration: Detalle de curso admin (P8)

### Current State

`CourseDetailPage` ya es un detalle enriquecido post F4-04: ficha con acento, skeleton de carga, seam opcional `ATTENDANCE_SOURCE`, tabla desktop + cards mobile, vacío con CTA «Agregar fecha», y navegación a marcado por fecha. Staging usa `HttpCoursesService` (no mock-only).

| Checklist P8 | Estado hoy | Evidencia |
|---|---|---|
| Datos del curso | **Parcial** | Código, estado crudo, nombre, `createdAt`/`updatedAt`. No muestra `cuatrimestre` (placeholder en modelo). Sin métricas de curso (presentes/certificaciones) en ficha. Badge de estado sin etiqueta humana («activo» vs «Activo»). |
| Accesos a asistencias/fechas | **Parcial** | «Editar curso» y «Agregar fecha» → `/editar`. Por fila: `Cargar` / `Ver y entregar` → marcado. CTA «Abrir primera fecha» → primera fecha usable. **Falta** enlace al hub de fechas del curso (`/admin/asistencias/curso/:id`). v0 apunta a `/admin/cursos/:id/asistencias` (ruta Angular distinta). |
| Estados vacíos | **OK con matices** | Sin fechas: copy + CTA. Carga: skeleton. Seam ausente/fallido: «No disponible» sin acción. Error recuperable: texto plano **sin** botón Reintentar. |
| IDs inválidos → error claro | **Parcial / riesgo staging** | Id no numérico / ≤0 → «Curso no encontrado.» (claro). Curso inexistente (in-memory) → `Error.message` = `Curso no encontrado: {id}` (filtra id numérico al DOM). HTTP 404 vía `HttpCoursesService.obtener` → mensaje técnico de `HttpErrorResponse` sin normalizar. Sin CTA volver/reintentar diferenciado not-found vs falla de red. |

**Comportamiento técnico vigente**

- `id` por `input()` + `effect` + `loadGen` (reutilización de ruta sin datos obsoletos).
- Métricas: `listarAsistenciasDeCurso` + filtro estricto `cursoId`; vacío real = Pendiente/Cargar; seam missing/failed = No disponible.
- Spec canónica aún habla de seams mock y copy «Ver» / «Cargar asistencias»; el código ya diverge («Ver y entregar», «Abrir primera fecha») de forma consciente hacia deep-links reales.
- Tests unitarios sólidos en `course-detail-page.spec.ts` (seam, race, vacío, a11y live, no-fetch). No cubren HTTP 404 ni hub de asistencias.

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.ts` — copy de error, normalización 404/not-found, labels de estado/fecha, posible link a hub.
- `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.html` — UI error/vacío, CTA hub, formato fechas, badge estado, quitar «—» confuso tras Pendiente.
- `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.css` — ajustes menores de error/badge si hace falta (respetar budget).
- `apps/frontend-angular/src/app/features/admin/courses/course-detail-page.spec.ts` — escenarios P8 (id inválido, 404 amigable, hub, labels).
- `openspec/specs/admin-courses-frontend/spec.md` — delta MODIFIED acotado a detalle (copy, errores, acceso hub); no reabrir listado/editor.
- **Fuera de alcance salvo link roto**: listado, editor, backend PHP, `AttendanceCourseDatesPage` (solo consumir su ruta existente).
- **Solo lectura**: `muestra_pagina/components/admin/curso-detalle.tsx`.

### Approaches

1. **Auditoría quirúrgica in-place (recomendada)** — Arreglar gaps P8 solo en `course-detail-page.*` + delta spec mínimo + tests.
   - Pros: alineado al plan («No tocar listado/editor salvo links rotos»); blast radius bajo; reutiliza hub existente.
   - Cons: no cierra paridad visual total vs v0 (iconos Lucide, layout anidado).
   - Effort: Low–Medium

2. **Paridad visual amplia vs v0** — Recalcar fechas es-AR, badges con dot, iconografía, CTA primario «Cargar asistencias», reordenar ficha como React.
   - Pros: mejor look & feel.
   - Cons: supera checklist P8; riesgo >400 LOC; conflicto con rutas reales distintas de v0.
   - Effort: High

3. **Solo copy/errores, sin hub** — Normalizar mensajes y labels; no agregar acceso a `/admin/asistencias/curso/:id`.
   - Pros: cambio mínimo.
   - Cons: incumple «accesos a asistencias/fechas» del checklist P8.
   - Effort: Low

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Errores claros**
   - Id inválido / curso inexistente / HTTP 404 → mensaje único amigable («Curso no encontrado.») **sin** filtrar el id numérico ni el cuerpo HTTP.
   - Fallo de red/API distinto → mensaje recuperable + botón **Reintentar** (`cargar()`).
   - Mantener `output`/`aria-live` único; no inventar `role="alert"` si los tests actuales lo prohiben.

2. **Accesos**
   - CTA secundario o terciario «Ver fechas / asistencias» → `/admin/asistencias/curso/:id` (ruta real del hub).
   - Conservar deep-links por fila y «Abrir primera fecha» (honestidad operativa).
   - No reintroducir ruta ficticia v0 `/admin/cursos/:id/asistencias`.

3. **Datos y vacíos**
   - Etiquetas humanas de `estado` del curso (y, si cabe, de fecha) alineadas al listado.
   - Formatear fecha de cursada en es-AR (como v0 / otras pantallas admin).
   - Quitar el «—» redundante junto a «Pendiente» cuando el conteo es null + disponible.
   - Vacío sin fechas: mantener CTA «Agregar fecha»; opcionalmente reforzar hint (ya existe).
   - **No** inventar métricas de certificaciones ni cuatrimestre real si la API no lo provee (listado ya oculta placeholder).

4. **Fuera de P8**
   - Redesign completo, CERTIFICATIONS_SOURCE, cambios a `HttpCoursesService` globales, listado/editor, backend.

### Questions (para propose)

1. ¿El CTA de hub debe llamarse «Ver fechas del curso», «Ir a asistencias» u otro copy institucional?
2. ¿«Ver y entregar» se mantiene (copy actual honesto) o se vuelve a «Ver» / «Ver asistencias» (paridad v0)?
3. ¿Normalizar 404 solo en la página (catch + map) o también endurecer `HttpCoursesService.obtener`? Recomendación explore: **solo página** en P8 para no ensanchar blast radius.
4. ¿Incluir `cuatrimestre` en ficha aunque sea placeholder, o seguir la política del listado de ocultarlo?

### Risks

- Mensajes crudos de HTTP en staging con ids inexistentes (mala UX / posible ruido técnico en DOM).
- Filtrado de `Curso no encontrado: {id}` desde in-memory inconsistente con el mensaje limpio de id inválido.
- Spec canónica desactualizada (mock-only / copy antiguo) si el delta no se actualiza en el mismo ciclo.
- Confundir hub (`/admin/asistencias/curso/:id`) con marcado (`…/fechas/:fechaId/asistencias`) al diseñar CTAs.
- Exceder presupuesto de review si se mezcla polish visual amplio con fixes P8.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico: errores not-found/HTTP claros, acceso al hub de fechas/asistencias, labels/formato de fechas, vacío/error recuperable, tests del área + gate 4R; sin tocar listado/editor/backend salvo verificación de links.
