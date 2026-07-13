# Tasks: F5-02 — Listado administrativo de alumnos (mock, sin datos personales)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600–900 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR (F5-02 in-place) |
| Delivery strategy | single-pr (auto-chain → size-exception) |
| Chain strategy | size-exception |
| review_budget_lines | 4000 (preflight-cached) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

> Scope: `students/` nueva + cambios chicos en `app.routes`, `sidebar-admin`, `admin-dashboard-page`. Sin backend, deps, ni `:id`. Bajo budget; sin split.

### Work Units (dentro del mismo PR)

| U | Goal | Focused test | Runtime harness | Rollback |
|---|------|--------------|-----------------|----------|
| 1 | Modelo + DTO + service + seed seguro | `npm test -- --include=**/students.service.spec.ts` | `ng serve` DevTools (N/A backend) | Revertir `students/{models,service,in-memory}.ts` |
| 2 | Página: signals, búsqueda+DNI, contacto boolean combinable con búsqueda, paginación 5, race, QA dev-only, tabla/cards/estados | `npm test -- --include=**/students-list-page.spec.ts` | Playwright MCP `/admin/alumnos` 1280×800 + 390×844 → `evidence/` | Revertir `students-list-page.{ts,html,css,spec.ts}` |
| 3 | Privacy/no-secrets + evidencia + docs + verify/archive | `npm run test:ci && npm run build` | `git diff --check` + `parity-notes.md` | Revertir `__checks__/` y `docs/frontend/` con `git revert` |

## Phase 1: Feature shell y DTO (RED → GREEN)

- [x] 1.1 RED `students.service.spec.ts`: DTO sin `email`/legajo/DNI completo/UUID/token, `dniMostrar` enmascarado, `tieneEmail`, `contar/listar` → fallan.
- [x] 1.2 `features/admin/students/students.models.ts`: `Alumno { id; apellido; nombre; dniMostrar; tieneEmail; cursosConAsistencia; certificacionesValidas }` + token `STUDENTS_SOURCE`.
- [x] 1.3 `students.service.ts`: `StudentsService { listar(): Promise<readonly Alumno[]>; contar(): Promise<number> }`.
- [x] 1.4 `in-memory-students.service.ts`: seed ≥7 (mezcla `tieneEmail` y métricas) — sin `@`, sin `email`, sin `legajo`, sin DNI completo, sin token, sin UUID; `dniMostrar` enmascarado.
- [x] 1.5 GREEN `npm test` 1.1 pasan.

## Phase 2: Página — signals, búsqueda, filtros, paginación, estados, race (RED → GREEN)

- [x] 2.1 RED `students-list-page.spec.ts`: búsqueda `nombre`/`dniMostrar` (no apellido/legajo/email); entrada apellido/legajo/email sin coincidencias; copy accesible alineado; `con-email`/`sin-email` boolean exclusivo y combinable con búsqueda; reset controlado vacía `input.value` y `q`, restaura resultados y vuelve a pág. 1; paginación 5 con clamp/reset; race: dos `listar()` inversos NO sobrescriben; QA `isDevMode()` true fuerza / false ignora; carga/error/empty-total/sin-coincidencias distinguibles; tabla `<th scope="col">` + `<caption>` + cards `<ul>`; `disabled aria-disabled="true"` "Disponible en F5-03"; un único `<output aria-live="polite" aria-atomic="true">` resume.
- [x] 2.2 `pages/list/students-list-page.ts`: `inject(STUDENTS_SOURCE)`; signals `q`, `contacto`, `pagina`, `estadoForzado`; `loadGen` + `recargar()` guard; `computed()` búsqueda (solo `nombre`/`dniMostrar`), filtro de contacto, total, página clamp, `slice(5)`; handlers `onContacto/onLimpiar/onReintentar/onForzarEstado` (gated `isDevMode()`); `vacioTotal` vs `sinCoincidencias` desde `hayFiltrosActivos`.
- [x] 2.3 `students-list-page.html`: `<label>` en búsqueda; chips `<button aria-pressed>`; "Limpiar filtros" condicional; `<output aria-live="polite" aria-atomic="true">` "Mostrando N de M"; `@if loading` skeleton `aria-busy`; `@else if error` `role="alert"` + "Reintentar"; `@else if vacioTotal` empty; `@else if sinCoincidencias` empty + CTA; `@else` `<table class="alumnos-tabla">` con `<caption>Alumnos</caption>` y `<th scope="col">` Apellido y nombre/Documento/Contacto/Cursos con asistencia/Certificaciones válidas/Acción; `<ul class="alumnos-cards">` con `<li>` equivalentes; `Ver detalle` con `aria-label` dinámico y `disabled aria-disabled="true" title="Disponible en F5-03"`; `hidden`/display por breakpoint.
- [x] 2.4 `students-list-page.css`: solo tokens F1-02; tabla oculta `<md`, cards ocultas `≥md`; chips `aria-pressed=true` diferenciado; focus `box-shadow: var(--focus-ring)`; "Contacto disponible"/"Sin email" textual.
- [x] 2.5 GREEN `npm test` 2.1 pasan; `ng serve` 1280×800 + 390×844.

## Phase 3: TDD — 8 escenarios del delta

- [x] 3.1 DTO/seed seguros: `dniMostrar` enmascarado ficticio único por alumno (`NN****NN`) y `tieneEmail`; sin `email` literal, legajo, DNI completo, token, matrícula, UUID, propiedad `email`.
- [x] 3.2 Sin red: `/admin/alumnos` no emite requests ni usa storage/cookies/IndexedDB.
- [x] 3.3 Búsqueda y contacto seguro: solo nombre/`dniMostrar`; `con-email`/`sin-email` por `tieneEmail`; no requiere ni revela apellido/email/legajo como campo de búsqueda.
- [x] 3.4 Entrada prohibida: legajo o email como texto NO devuelve coincidencias.
- [x] 3.5 Filtros y paginación: >5 → 5 por página; cambio de filtro resetea a 1; out-of-range clampa.
- [x] 3.6 Vistas accesibles: tabla `<caption>`/`<th scope>` desktop + `<ul>` mobile + `<output aria-live>` resumen.
- [x] 3.7 Estados distinguibles: carga/error/empty-total/sin-coincidencias accesibles; "Reintentar" sólo en error.
- [x] 3.8 QA y detalle diferido: QA sólo con `isDevMode()` true; en prod no se monta ni muta; `Ver detalle` siempre `disabled` con "Disponible en F5-03".
- [x] 3.9 Focused 3.1–3.8 + `npm run test:ci` + `npm run build` exit 0; warnings preexistentes documentados.

## Phase 4: Privacy & regression checks (RED → GREEN)

- [x] 4.1 RED `students/__checks__/no-real-data.spec.ts`: recorre seed y DOM; falla con `email` literal, `legajo`, DNI 8 dígitos, `token`, `matrícula`, `UUID`.
- [x] 4.2 RED `students/__checks__/no-secrets.spec.ts`: inspecciona seed, `StudentsListPage` e `InMemoryStudentsService`; falla con APIs de red/storage/cookies, campos o literales exactos `dni`/`token`/`email`/`legajo`/`matrícula`, y UUID; no confunde `dniMostrar` ni `tieneEmail`.
- [x] 4.3 GREEN: `npm run test:ci` (servicio + página + checks) + `npm run build` sin warnings nuevos + `git diff --check` limpio.

## Phase 5: Activación de ruta, sidebar y dashboard (last)

- [x] 5.1 RED `app.routes.spec.ts`: `/admin/alumnos` carga `StudentsListPage` con sesión mock; sin sesión → login; `/admin/alumnos/1` no resuelve ruta de detalle.
- [x] 5.2 Modificar `app.routes.ts`: provider `STUDENTS_SOURCE → InMemoryStudentsService`; ruta lazy `path: 'alumnos'` antes del catch-all, **sin** `:id`.
- [x] 5.3 Modificar `sidebar-admin.ts`: `Alumnos` → `route: '/admin/alumnos'`; `isActive()` con prefijo; placeholder `null` sigue deshabilitado.
- [x] 5.4 Modificar `admin-dashboard-page.{ts,html}`: tarjeta a `/admin/alumnos` con conteo `inject(STUDENTS_SOURCE, { optional: true }).contar()` fallback `0`; tokens F1-02.
- [x] 5.5 GREEN: `npm run test:ci` (5.1 + suite existente) + `npm run build` exit 0.

## Phase 6: Evidencia visual, paridad v0 y docs (verify)

- [x] 6.1 Playwright `/admin/alumnos` 1280×800 → `evidence/desktop-1280.png`.
- [x] 6.2 Playwright `/admin/alumnos` 390×844 → `evidence/mobile-390.png`.
- [x] 6.3 Playwright estados `cargando`, `error (Reintentar)`, `empty-total`, `sin-coincidencias` → `evidence/{loading,error,empty-total,no-results}.png` desktop.
- [x] 6.4 `evidence/parity-notes.md` vs `muestra_pagina/components/admin/lista-alumnos.tsx`: tokens, `h1`/`h2`, `<caption>`/`<th scope>`, focus, etiquetas contacto, `disabled`/`aria-disabled`; marcar `paridad igual o mejor`; NO portar Lucide.
- [x] 6.5 `verify-report.md`: evidencia runtime, privacidad/red y preparación explícita para 7.1; el receipt queda reservado a `sdd-verify`.
- [x] 6.6 Crear `docs/frontend/F5-02-listado-alumnos-paridad-v0.md` (resumen, links spec/design/evidence, handoff F5-03).
- [x] 6.7 Actualizar `docs/frontend/00-angular20-port-v0.md` con fila F5-02 (cerrado, link evidence).

## Phase 7: Verify y archive

- [x] 7.1 `sdd-verify` (ejecutable antes de archive): PASS bajo receipt `review-d7bd1f6336540418`; 6/6 requisitos y 14/14 escenarios compliant. Reverify posterior al fix de búsqueda controlada: focused 170/170, suite completa 521/521 y build exit 0; runtime confirmó que `Limpiar filtros` vacía el valor visible, restaura `Mostrando 5 de 7`, vuelve a página 1 y no emite requests de datos. Sin blockers ni findings del cambio.
- [x] 7.2 `sdd-archive` completado el 2026-07-13: merge de `specs/admin-students-frontend/spec.md` → `openspec/specs/admin-students-frontend/spec.md`; merge del delta `admin-foundation` → `openspec/specs/admin-foundation/spec.md`; carpeta movida a `openspec/changes/archive/2026-07-13-f5-02-students-list/`.

## Trazabilidad escenario → test

| Escenario (spec delta) | Test / artefacto |
|---|---|
| DTO y seed seguros, con máscara ficticia única por alumno | `students.service.spec.ts` (1.1) + `students-list-page.spec.ts` (3.1) + `__checks__/no-real-data.spec.ts` (4.1) |
| Sin red ni storage | `__checks__/no-secrets.spec.ts` (4.2) + DevTools Network (6.1) |
| Búsqueda y filtro de contacto seguro | `students-list-page.spec.ts` (3.3) |
| Entrada prohibida (legajo/email) | `students-list-page.spec.ts` (3.4) |
| Filtros y paginación | `students-list-page.spec.ts` (3.5) |
| Vistas accesibles (tabla/cards + resumen) | `students-list-page.spec.ts` (3.6) + `evidence/desktop-1280.png` + `evidence/mobile-390.png` |
| Estados distinguibles | `students-list-page.spec.ts` (3.7) + `evidence/{loading,error,empty-total,no-results}.png` |
| QA y detalle diferido | `students-list-page.spec.ts` (3.8) + `evidence/parity-notes.md` |
| (MODIFIED) Ruta `/admin/alumnos` activa y precede catch-all | `app.routes.spec.ts` (5.1) + `app.routes.ts` (5.2) |
| (MODIFIED) Sidebar: Alumnos con estado activo por prefijo | `sidebar-admin.ts` (5.3) + `sidebar-admin.spec.ts` (regresión) |
| (MODIFIED) Dashboard: tarjeta y conteo desde seam | `admin-dashboard-page.{ts,html,spec.ts}` (5.4) |
| (MODIFIED) Shell sin nuevas deps visuales | `__checks__/no-secrets.spec.ts` (4.2) + `evidence/parity-notes.md` |
