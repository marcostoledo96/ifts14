# Tasks: Auditoría P8 — detalle de curso admin

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180–280 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Fix P8 detalle + tests | PR 1 | Solo `course-detail-page.*`; delta spec ya existe |

## Phase 1: Fundación — helpers de error, labels y fechas

- [x] 1.1 En `course-detail-page.ts`: agregar `mapearErrorCarga` (404 `HttpErrorResponse` **o** `Error.message` con prefijo `Curso no encontrado` → «Curso no encontrado.»; resto → recuperable).
- [x] 1.2 En `course-detail-page.ts`: señales/flags `errorRecuperable` + `onReintentar()` que llame `cargar()`; id inválido/≤0 → not-found sin Reintentar.
- [x] 1.3 En `course-detail-page.ts`: helpers privados `etiquetaEstadoCurso` (Activo/Inactivo), `etiquetaEstadoFecha` (Programada/Realizada/Cancelada) y `formatFecha` (Intl es-AR, patrón hub).

## Phase 2: UI — plantilla y estilos

- [x] 2.1 En `course-detail-page.html`: estado error not-found (mensaje exacto, sin Reintentar) vs recuperable («No se pudo cargar el curso. Reintentá.» + botón Reintentar); un solo `aria-live` (`resumen`).
- [x] 2.2 En `course-detail-page.html`: CTA «Ver fechas del curso» con `routerLink=['/admin/asistencias/curso', d.id]` y `data-testid="cta-ver-fechas-curso"`; conservar «Abrir primera fecha» y «Ver y entregar».
- [x] 2.3 En `course-detail-page.html`: badges con labels humanas; fechas vía `formatFecha`; ocultar `cuatrimestre` si es «Sin programar»; quitar `@if` de «—» junto a Pendiente (tabla y cards).
- [x] 2.4 En `course-detail-page.css`: ajustes mínimos de CTAs/error si hace falta (budget bajo).

## Phase 3: Tests unitarios (escenarios delta)

- [x] 3.1 En `course-detail-page.spec.ts`: not-found limpio — id inválido, in-memory (`Curso no encontrado…`), HTTP 404 mock; sin id/cuerpo técnico; sin Reintentar (escenario Not-found).
- [x] 3.2 En `course-detail-page.spec.ts`: fallo recuperable muestra Reintentar y al activarlo vuelve a llamar `obtener`/`cargar` (escenario Carga… error recuperable).
- [x] 3.3 En `course-detail-page.spec.ts`: CTA hub href `/admin/asistencias/curso/:id`; labels Activo/Inactivo y fecha humana; sin «—» con Pendiente; copy «Ver y entregar» intacto (escenarios Ficha, Conteo, CTA hub).
- [x] 3.4 Correr suite del spec y `npx tsc --noEmit -p tsconfig.app.json`; confirmar que no se tocaron `http-courses.service.ts`, listado ni editor.

## Phase 4: Cierre documental mínimo

- [x] 4.1 Verificar que el delta en `openspec/changes/audit-p08-cursos-detail/specs/admin-courses-frontend/spec.md` sigue alineado con el comportamiento implementado (sin editar product outside scope).
- [x] 4.2 Marcar criterios de éxito de la proposal al cerrar apply; no commit salvo pedido humano.
