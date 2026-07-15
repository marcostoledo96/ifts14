# Tasks: F4-03 — Listado de cursos con paridad v0

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900–1300 (aditions+deletions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (F4-03 in-place) |
| Delivery strategy | single-pr-default |
| Chain strategy | none |
| review_budget_lines | 4000 (preflight-cached) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

> Preflight cached `single-pr-default` + `chain_strategy=none` + `review_budget_lines=4000`. Proposal criterion confirms "forecast permanece bajo 4000 líneas para PR único". Single PR is the maintainer-accepted choice; no extra decision needed.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Modelo + seed + servicio con cuatrimestre, `cantidadFechas`, métricas `null` y filtro `conFechas` | PR 1 (same PR) | `npm test -- --watch=false --browsers=ChromeHeadless --include=**/courses.service.spec.ts` | `curl http://localhost:4200/admin/cursos` with mock seed (N/A — no servidor; verificado en unit + browser preview) | Revert `courses.models.ts`, `in-memory-courses.service.ts`, `courses.service.spec.ts`; el resto del PR sigue compilando |
| 2 | Página: tabla desktop accesible, cards mobile, filtros, estados, limpiar | PR 1 (same PR) | `npm test -- --watch=false --browsers=ChromeHeadless --include=**/courses-list-page.spec.ts` | Playwright a `http://localhost:4200/admin/cursos` @ 1280×800 y 390×844 con capturas en `openspec/changes/f4-03-courses-list/evidence/` | Revert `courses-list-page.{ts,html,css,spec.ts}`; el modelo/servicio siguen válidos |
| 3 | Privacy & regression checks + docs + verify/archive | PR 1 (same PR) | `npm run test:ci && npm run build` | `git diff --check` + `git status --short` + revisión visual de `parity-notes.md` | Revertir `__checks__/no-real-data.spec.ts` y `__checks__/no-secrets.spec.ts` no afecta producción; docs en `docs/frontend/` se revierten con `git revert` |

> Three internal units inside ONE PR, scoped by file ownership, not chained. Each row keeps the focused test command, runtime harness (or `N/A` with reason) and rollback boundary that the guard requires.

## Phase 1: Modelo y servicio (RED → GREEN)

- [x] 1.1 RED: extender `courses.service.spec.ts` con casos para `cuatrimestre`, `cantidadFechas`, `alumnosPresentes === null`, `certificaciones === null`, `conFechas: true|false`, alta con `Sin programar` → fallan.
- [x] 1.2 Modificar `courses.models.ts`: agregar `cuatrimestre: string`, `cantidadFechas: number`, `alumnosPresentes: number | null`, `certificaciones: number | null`, y `conFechas?: boolean` en `CursosFiltros`.
- [x] 1.3 Modificar `in-memory-courses.service.ts`: derivar `cuatrimestre` y `cantidadFechas` desde el seed; métricas en `null`; soportar `conFechas`; alta crea curso con `cuatrimestre: 'Sin programar'`, `cantidadFechas: 0`.
- [x] 1.4 GREEN: reejecutar `npm test` con los casos de 1.1 → pasan; RED-GREEN cerrado para servicio.

## Phase 2: Página con signals, tabla desktop, cards mobile y estados (RED → GREEN)

- [x] 2.1 RED: agregar a `courses-list-page.spec.ts` casos para tabla `<table>` accesible, `aria-pressed` en chips con/sin fechas, `aria-live` en resumen, botón "Limpiar filtros" condicional, error con "Reintentar", distinción vacío-total vs sin-coincidencias, links `Ver detalle` y `Editar` con nombre accesible.
- [x] 2.2 Modificar `courses-list-page.ts`: signals `q`, `estado`, `conFechas`; método `recargar()` consume `CursosFiltros` completo; handlers `onConFechas`, `onLimpiarFiltros`, `onReintentar`; distinción `vacioTotal` vs `sinCoincidencias` en base a `hayFiltrosActivos`.
- [x] 2.3 Reescribir `courses-list-page.html`: filtros con `<button aria-pressed>` para con/sin fechas; `<table>` accesible con `<caption>`, `<th scope="col">`, métricas con `—` + texto "Dato disponible con integración real"; `<ul>` mobile con cards y mismas métricas; banners loading/error/empty con `aria-busy` / `role="alert"`; `<p aria-live="polite">` para resumen; `Limpiar filtros` y `Reintentar` accesibles.
- [x] 2.4 Modificar `courses-list-page.css`: estilos responsive usando sólo tokens existentes (sin Tailwind/icónicos); tabla oculta `<md`, cards ocultas `≥md`; chips con estado `aria-pressed=true` diferenciado; cards con borde y métrica en grid 3-col en mobile.
- [x] 2.5 GREEN: `npm test` con casos de 2.1 → pasan; revisar manualmente con `ng serve` y DevTools responsive 1280×800 y 390×844.

## Phase 3: Privacy checks y regresión (RED → GREEN)

- [x] 3.1 RED: actualizar `__checks__/no-real-data.spec.ts` con casos que validen `cuatrimestre` ∈ {`'1.er cuatrimestre 2026'`, `'2.º cuatrimestre 2025'`, `'Sin programar'`} y ningún nombre/código con email/DNI/UUID → fallan si el seed se rompe.
- [x] 3.2 RED: actualizar `__checks__/no-secrets.spec.ts` añadiendo `CoursesListPage.prototype.recargar` y `CoursesListPage.prototype.onLimpiarFiltros` al `sources()` para inspeccionar la nueva lógica → fallan si aparece `HttpClient`/`fetch`/`localStorage`/DNI/token.
- [x] 3.3 GREEN: `npm run test:ci` → todos los specs (servicio + página + checks) pasan; `npm run build` → compila sin warnings nuevos.

## Phase 4: Evidencia visual y paridad (verify)

- [x] 4.1 Capturar con Playwright `http://localhost:4200/admin/cursos` en 1280×800 (tabla + filtros + estado `datos`) y guardar PNG en `openspec/changes/f4-03-courses-list/evidence/desktop-1280.png`.
- [x] 4.2 Capturar 390×844 (cards mobile + mismo estado) → `evidence/mobile-390.png`.
- [x] 4.3 Capturar estados `cargando`, `error` (reintento), `vacio-total` y `sin-coincidencias` (filtros activos) → `evidence/{loading,error,empty-total,no-results}.png` desktop.
- [x] 4.4 Escribir `openspec/changes/f4-03-courses-list/evidence/parity-notes.md` comparando tokens, jerarquía de encabezados, semántica de tabla, focus visible y métricas contra `muestra_pagina/components/admin/lista-cursos.tsx`; marcar `paridad igual o mejor` o deltas justificadas.
- [x] 4.5 Generar `openspec/changes/f4-03-courses-list/verify-report.md` con archivos tocados, comandos ejecutados, resultados reales, escenarios cubiertos y NO cubiertos, riesgos abiertos.

## Corrección autorizada post-verify FAIL

- [x] R1 RED → GREEN: agregar reproducción de dos `listar()` superpuestos resueltos en orden inverso; la respuesta antigua no puede reemplazar cursos, error ni loading del filtro activo.
- [x] R2 Implementar guard local de generación en `CoursesListPage.recargar()`; sin RxJS, cancelación ni abstracciones nuevas.
- [x] R3 Regresión: focused page/service, suite completa, build y `git diff --check` pasan. `4.5` quedó cerrada en re-verify; archive permanece pendiente.

## Phase 5: Documentación y archive

- [x] 5.1 Crear `docs/frontend/F4-03-listado-cursos-paridad-v0.md` con resumen del cambio, link a spec/design/evidence y nota de que F4-04 queda como handoff.
- [x] 5.2 Actualizar `docs/frontend/00-angular20-port-v0.md` con la fila F4-03 (estado: cerrado, link a evidence).
- [x] 5.3 `sdd-archive`: mergear delta de `openspec/changes/f4-03-courses-list/specs/admin-courses-frontend/spec.md` en `openspec/specs/admin-courses-frontend/spec.md`; mover carpeta del cambio a `openspec/changes/archive/2026-07-12-f4-03-courses-list/`.

## Trazabilidad escenario → test

| Escenario (spec) | Archivo de test |
|---|---|
| Listado y detalle navegables | `courses-list-page.spec.ts` → "enlaces de detalle apuntan a /admin/cursos/:id" + `courses.service.spec.ts` → "obtener devuelve curso con fechas" |
| Edición no persistente de fechas | (Fuera de alcance F4-03; cubierto por F4-04 — handoff documentado en `parity-notes.md`) |
| Tabla accesible en desktop | `courses-list-page.spec.ts` → casos nuevos de `<table>` + `<caption>` + `<th scope>` |
| Tarjetas de métricas en mobile | `courses-list-page.spec.ts` → caso nuevo de `<ul class="cards-mobile">` y métricas con placeholder |
| Filtros y limpieza | `courses-list-page.spec.ts` → caso nuevo `onLimpiarFiltros` restablece y `aria-live` anuncia |
| Carga, error y reintento | `courses-list-page.spec.ts` → casos nuevos `aria-busy`, `role="alert"`, botón "Reintentar" |
| Vacío y sin resultados diferenciados | `courses-list-page.spec.ts` → casos nuevos `vacioTotal` (sin filtros) vs `sinCoincidencias` (con filtros) |
| Acciones existentes y handoff | `courses-list-page.spec.ts` → caso nuevo "links `Ver detalle` y `Editar` con nombre accesible" |
| Paridad y privacidad | `evidence/parity-notes.md` + `__checks__/no-real-data.spec.ts` + `__checks__/no-secrets.spec.ts` |
