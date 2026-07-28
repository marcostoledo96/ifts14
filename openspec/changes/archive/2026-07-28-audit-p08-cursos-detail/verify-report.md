# Verification Report

**Change**: audit-p08-cursos-detail  
**Version**: N/A (delta MODIFIED admin-courses-frontend)  
**Mode**: Standard (`strict_tdd: false`)  
**Branch**: audit/p08-cursos-detail  
**Verified**: 2026-07-28

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 12 |
| Tasks complete | 12 |
| Tasks incomplete | 0 |
| Proposal success criteria | 5/5 `[x]` |

### Build & Tests Execution

**Build / typecheck**: ✅ Passed

```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
→ TypeScript: No errors found (exit 0)
```

**Tests**: ✅ 19 passed / ❌ 0 failed / ⚠️ 0 skipped

```text
cd apps/frontend-angular && npm run test:ci -- --include='**/course-detail-page.spec.ts'
→ no-focused-tests: ok
→ Chrome Headless: Executed 19 of 19 SUCCESS (0.453 secs)
TOTAL: 19 SUCCESS
```

Covering cases re-executed in this verify: retry success, HTTP 404, HTTP 500, HTTP 403, id inválido, in-memory not-found, CTA hub, labels, seams.

**Coverage**: ➖ Not available (config `coverage_threshold: 0`; karma-coverage not required for this gate)

**Scope diff (product)**: only `course-detail-page.{ts,html,css,spec.ts}` — **+259 / −27** (286 lines). No changes to `http-courses.service`, listado, editor ni backend.

### Spec Compliance Matrix

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Enlace de toma de asistencia por fecha | Navegación desde detalle de curso | `course-detail-page.spec.ts` > distingue vacío/Pendiente/Cargar; ignora asistencias ajenas (Ver y entregar); enlaza Abrir primera fecha | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | Ficha informativa del curso | `…` > CTA hub, labels humanas, fecha es-AR, sin Sin programar; muestra la ficha… | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | Fechas equivalentes en desktop y mobile | `…` > muestra la ficha… tabla + tarjetas equivalentes | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | Conteo, estado y acción de asistencia | `…` > distingue vacío…; ignora asistencias…; CTA hub sin «—» | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | Seams opcionales y métricas por curso | `…` > seam falla / throw síncrono / sin ATTENDANCE_SOURCE / cursoId ajeno | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | Carga, vacío sin fechas y error recuperable | `…` > aria-busy; vacío+Agregar fecha; error recuperable+Reintentar; único aria-live | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | Not-found amigable sin ruido técnico | `…` > id inválido; in-memory prefijo; HttpErrorResponse 404 | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | CTA al hub de fechas del curso | `…` > CTA hub href `/admin/asistencias/curso/:id`; conserva Abrir primera fecha | ✅ COMPLIANT |
| Detalle de curso enriquecido y seguro | Privacidad y accesibilidad | `…` > sin fetch/PII; único `aria-live`; sin `role=alert` — viewports 1280/390 no automatizados | ⚠️ PARTIAL |

**Compliance summary**: 8/9 COMPLIANT, 1/9 PARTIAL (0 UNTESTED, 0 FAILING)

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Enlace Cargar / Ver y entregar | ✅ Implemented | `accionPorFecha` + deep-links a `/admin/cursos/:id/fechas/:fechaId/asistencias` |
| Not-found en página | ✅ Implemented | `mapearErrorCarga` en catch de `cargar()`; sin tocar `HttpCoursesService` |
| Reintentar recuperable | ✅ Implemented | `errorRecuperable` + `onReintentar` → `cargar()`; test contador `obtener` |
| CTA hub | ✅ Implemented | `data-testid="cta-ver-fechas-curso"` → `/admin/asistencias/curso/:id` |
| Labels + fechas es-AR | ✅ Implemented | `etiquetaEstadoCurso`/`Fecha` + `formatFecha` (Intl es-AR) |
| Ocultar cuatrimestre placeholder | ✅ Implemented | `mostrarCuatrimestre` + `@if` en plantilla |
| Sin «—» en Pendiente | ✅ Implemented | Plantilla sin `@if` de em-dash; assert en suite |
| Un solo aria-live | ✅ Implemented | `output.resumen[aria-live=polite]` |
| 401/403 no reintentables | ✅ Implemented | Extensión Gate 4R: `MSG_NO_AUTORIZADO`, sin Reintentar (test 403) |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Mapear 404/not-found en página | ✅ Yes | `cargar` catch → `mapearErrorCarga` |
| Criterio 404 + prefijo in-memory | ✅ Yes | `status===404` **o** `message.startsWith('Curso no encontrado')` |
| Copy not-found único | ✅ Yes | `Curso no encontrado.` |
| Recuperable + Reintentar | ✅ Yes | + test de recuperación exitosa |
| CTA hub real | ✅ Yes | No usa ruta v0 ficticia |
| Conservar deep-links / Ver y entregar | ✅ Yes | |
| Labels Activo/Inactivo + hub fechas | ✅ Yes | |
| formatFecha es-AR local | ✅ Yes | Mismo patrón que hub |
| Ocultar «Sin programar» | ✅ Yes | |
| Un solo aria-live | ✅ Yes | |
| Alcance solo `course-detail-page.*` | ✅ Yes | Diff product confirma |
| 401/403 no recuperable | ⚠️ Extended | Design original: «resto → recuperable»; Gate 4R trata 401/403 como no-reintento (test + código). Mejora operativa; delta design no actualizado |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Escenario **Privacidad y accesibilidad**: viewports 1280×800 / 390×844 no tienen prueba automatizada; cobertura unitaria de a11y/PII + layout dual tabla/cards es parcial respecto al Given de viewport.
2. Design no documenta el tratamiento 401/403 (añadido en Gate 4R); comportamiento testeado y coherente con UX admin, pero el artefacto design quedó atrás.

**SUGGESTION**:
1. En `sdd-archive`, fusionar delta a `openspec/specs/admin-courses-frontend` e incluir 401/403 en la nota de diseño/changelog del área.
2. Actualizar `apply-progress.md` (aún dice 17/17) al archivar; la suite verify es 19/19.
3. Diff residual en `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` fuera del alcance product — confirmar si entra en el mismo PR o se separa.

### Verdict

**PASS WITH WARNINGS**

12/12 tasks complete; typecheck green; 19/19 unit tests green; 8/9 escenarios COMPLIANT y 1 PARTIAL (viewport); sin CRITICAL. Listo para `sdd-archive` tras aceptar los warnings menores.
