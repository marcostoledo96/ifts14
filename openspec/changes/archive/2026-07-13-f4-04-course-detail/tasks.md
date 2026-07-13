# Tasks: F4-04 — Detalle de curso enriquecido y seguro

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–950 (additions+deletions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (F4-04 in-place sobre 4 archivos) |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception |
| review_budget_lines | 4000 (preflight-cached) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

> Preflight cached `single-pr-default` + `chain_strategy=none` + `review_budget_lines=4000`. In-place sobre `course-detail-page.{ts,html,css,spec.ts}`; sin rutas, servicios, providers ni deps nuevas. Single PR aceptado; sin decisión adicional.

### Suggested Work Units

| Unit | Goal | PR | Focused test | Runtime harness | Rollback |
|------|------|----|--------------|-----------------|----------|
| 1 | TS effect+loadGen+allSettled | PR 1 | `npm test -- --include=**/course-detail-page.spec.ts` | `ng serve` DevTools 1280×800/390×844 (N/A backend) | Revertir `.ts` |
| 2 | HTML+CSS: ficha acento, tabla, cards, vacío+Agregar fecha | PR 1 | mismo | Playwright `/admin/cursos/{1,4,5}` → `evidence/` | Revertir `.html`+`.css` |
| 3 | Specs TDD 6 escenarios + privacy checks | PR 1 | `npm run test:ci` | `git diff --check` + `parity-notes.md` | Revertir `.spec.ts`+`__checks__/` |
| 4 | Docs + evidencia visual + verify-report | PR 1 | `npm run build` | Playwright MCP → `evidence/*.png` | Revertir docs/evidence |

## Phase 1: CourseDetailPage TS

- [x] 1.1 RED: en `course-detail-page.spec.ts` agregar casos `attendance por fecha con allSettled`, `seam ausente`, `seam que falla no rompe`, `listarAsistencias vacío vs ausentes (fallback —)`, `id inválido no conserva datos`, `navegación entre ids descarta carga anterior`.
- [x] 1.2 Modificar `course-detail-page.ts`: `inject(ATTENDANCE_SOURCE, { optional: true })`, `loadGen` privado, `effect(() => untracked(() => cargar(this.id())))`, remover `ngOnInit`, cargar con `courses.obtener(cid)`.
- [x] 1.3 Tras `detalle`, métricas con `Promise.allSettled(d.fechas.map((f) => this.attendance?.listarAsistencias(cid, f.id) ?? Promise.resolve([])))`; derivar `AttendanceMetric`; reset al cambiar id; `cargando=false` solo si generación vigente.
- [x] 1.4 Tipo `AttendanceMetric = { status:'known'; present:number } | { status:'unavailable'; reason:'empty'|'missing-seam'|'failed' }`; signal `metricas`; computed `presentesPorFecha(fechaId)` y `accionPorFecha(fechaId)`. NO consultar CERTIFICATIONS_SOURCE.

## Phase 2: HTML + CSS

- [x] 2.1 RED: en `course-detail-page.spec.ts` casos para `aria-live` único (`<output>` polite atomic), `<table>` con `<caption>` y `<th scope="col">`, `<ul.cards-mobile>` con acción equivalente, `aria-label` en Cargar/Ver, `Agregar fecha` en vacío, banda sin `aria-live`.
- [x] 2.2 Reescribir `course-detail-page.html`: `Volver al listado`; banda `<div>` sin live; `<output aria-live="polite" aria-atomic="true" class="resumen">` con resumen carga/error/métricas; tarjeta con `<aside class="acento" aria-hidden="true">`.
- [x] 2.3 `@if (detalle())`: ficha con código + estado chip + nombre + acciones; `@if (d.fechas.length === 0)` placeholder con `Agregar fecha` a `/admin/cursos/:id/editar`; `@else` `<table class="fechas-tabla" hidden≤sm>` con `<caption>Fechas de cursada y estado de carga</caption>` y `<th scope="col">` Fecha/Estado/Conteo/Acción; `<tr>` con acción contextual.
- [x] 2.4 `<ul class="fechas-cards" hidden≥sm>` con `<li>` por fecha (fecha `font-mono tabular-nums`, estado, conteo, acción); `aria-label` dinámico; canceladas sin acción.
- [x] 2.5 Modificar `course-detail-page.css`: `.curso-ficha { display:flex }` con `.acento { width:var(--space-1); background:var(--color-valid) }`; tabla `border-collapse:text-left`, `font-mono` fechas, hover fila; `@media (max-width:39.99rem)` oculta tabla y muestra cards; `@media (min-width:40rem)` inverso; cards `border-radius:var(--radius-sm)`, `padding:var(--space-4)`; Cargar chip color-ink, Ver chip outline; `focus-visible { box-shadow:var(--focus-ring); outline:none }`; sin Tailwind ni deps nuevas.

## Phase 3: TDD — 6 escenarios del delta (1 it por escenario; los sub-casos viven en el test)

- [x] 3.1 Rutas protegidas: it("id válido/id inválido/reutilización entre ids descarta carga anterior"); resuelve `obtener` en orden inverso y verifica detalle vigente.
- [x] 3.2 Ficha informativa: it("muestra nombre/código/estado/metadatos con acento institucional"); kicker, `<h1>`, banda sin live, `<dl class="curso-meta">`.
- [x] 3.3 Fechas equivalentes: it("<table> con caption y <th scope> + <ul.cards-mobile> con misma información y acciones"); query DOM directa.
- [x] 3.4 Conteo/estado/acción: it("lista vacía real → 'Pendiente'+'Cargar' / con presentes → 'N presentes'+'Ver' / cancelada → sin acción").
- [x] 3.5 Seams opcionales: it("sin ATTENDANCE_SOURCE, reject o throw síncrono → 'No disponible' sin acción / resto OK / CERTIFICATIONS no se inyecta ni consulta → total omitido").
- [x] 3.6 Carga/error/ vacío: it("'Cargando…' aria-busy / courses.obtener rechaza → error sin métricas / sin fechas → 'Agregar fecha' al editor").
- [x] 3.7 Privacidad/paridad/a11y: it("único <output aria-live='polite' aria-atomic='true'> / no fetch / DOM sin DNI-email-token-UUID-matrícula 7-8 / links con aria-label con fecha").
- [x] 3.8 Focused 3.1–3.7 y `npm run test:ci` pasan; `npm run build` exit 0. Persisten dos warnings preexistentes de CSS de certificaciones, documentados sin atribuirlos a F4-04.

## Phase 4: Privacy & regression checks

- [x] 4.1 `__checks__/no-real-data.spec.ts`: ninguna métrica/acción renderiza dni/email/token/UUID/legajo/matrícula.
- [x] 4.2 `__checks__/no-secrets.spec.ts`: añade `CourseDetailPage.prototype.cargar` y mapeo allSettled a `sources()`; falla si aparece HttpClient/fetch/localStorage/DNI/token.
- [x] 4.3 `npm run test:ci` y `npm run build` ejecutados; build exit 0 con dos warnings preexistentes de CSS de certificaciones documentados; `git diff --check` limpio.

## Phase 5: Evidencia visual, paridad v0 y docs

- [x] 5.1 Playwright MCP: `/admin/cursos/1` 1280×800 → `evidence/desktop-1280.png`.
- [x] 5.2 `/admin/cursos/1` 390×844 → `evidence/mobile-390.png`.
- [x] 5.3 `/admin/cursos/5` 1280×800 (cancelada) → `evidence/cancelada.png`.
- [x] 5.4 `/admin/cursos/4` 1280×800 y 390×844 → `evidence/realizada.png` y `evidence/mobile-390-realizada.png`; recorrido runtime confirmó 8/7 presentes y abrió la acción `Ver`.
- [x] 5.5 Curso sin fechas 1280×800 → `evidence/empty.png` (verifica `Agregar fecha`).
- [x] 5.6 `evidence/parity-notes.md`: tokens, jerarquía `h1`/`h2`, semántica `<caption>`/`<th scope>`, focus visible vs `muestra_pagina/components/admin/curso-detalle.tsx`; marca `paridad igual o mejor`; NO portar iconos Lucide.
- [x] 5.7 `docs/frontend/F4-04-detalle-curso-paridad-v0.md` con resumen, links spec/design/evidence y handoff.
- [x] 5.8 Actualizar `docs/frontend/00-angular20-port-v0.md` con fila F4-04 y link a evidence.
- [x] 5.9 `verify-report.md` con archivos tocados, comandos, resultados reales, escenarios cubiertos/NO cubiertos y riesgos abiertos.

## Phase 5.1: F4-04 review corrections

- [x] 5.1.1 Diferenciar lista vacía real (`Pendiente`/`Cargar`) de seam ausente, rechazado o con throw síncrono (`No disponible`, sin acción), en tabla y tarjetas.
- [x] 5.1.2 Mantener un único `<output aria-live="polite">`; quitar `role="alert"` del error visual y probar el rol implícito `status`.

## Phase 6: Verify y archive

- [x] 6.1 `sdd-verify` con los 9 escenarios actuales del delta; focused 10/10 + privacidad 8/8 + secretos 2/2 + `npm run test:ci` 487/487 + `npm run build` exit 0; runtime desktop/mobile, `Pendiente`/`Cargar`, presentes/`Ver`, ruta existente y un único live region verificados; `git status --short` y `git diff --stat` registrados. Receipt `review-02c1aec1ff358baf`.
- [x] 6.2 `sdd-archive`: mergear delta de `openspec/changes/f4-04-course-detail/specs/admin-courses-frontend/spec.md` en `openspec/specs/admin-courses-frontend/spec.md`; mover carpeta a `openspec/changes/archive/2026-07-13-f4-04-course-detail/`.

## Trazabilidad escenario → test

| Escenario (spec delta) | Test / artefacto |
|---|---|
| Rutas protegidas — Detalle válido/inválido/reutilizado | spec.ts → 3.1 |
| Ficha informativa del curso | spec.ts → 3.2 |
| Fechas equivalentes desktop/mobile | spec.ts → 3.3 |
| Conteo, estado y acción de asistencia | spec.ts → 3.4 |
| Seams opcionales y métricas por curso | spec.ts → 3.5 |
| Carga, error y curso sin fechas | spec.ts → 3.6 |
| Privacidad, paridad y accesibilidad | spec.ts → 3.7 + no-real-data + no-secrets + parity-notes.md |
