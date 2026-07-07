# Apply Progress: F1-02 — Sistema visual v0 para Angular

**Change**: f1-02-v0-design-system
**Mode**: Standard (strict_tdd: false)
**Branch**: frontend/v0-design-system-f1-02
**Delivery**: single-pr-default (700–1000 líneas, bajo presupuesto 1500)

## Completed Tasks

### Phase 1: Foundation — Tokens CSS
- [x] 1.1 Tokens en `apps/frontend-angular/src/styles.css`: colores, tipografía, radios, espaciado, foco, motion.
- [x] 1.2 Tipografía base, `:focus-visible`, `prefers-reduced-motion`, skip-link preservado.
- [x] 1.3 Mapa de tokens documentado en `docs/frontend/02-sistema-visual-v0-f1-02.md`.

### Phase 2: Primitivos en `shared/ui`
- [x] 2.1 `banda-estado.{ts,html,css,spec.ts}` — `role="status"`/`role="alert"` por kind, `aria-live`/`aria-atomic`.
- [x] 2.2 `campo-dato.{ts,spec.ts}` — directiva `[appCampoDato]` sobre `<dt>`/`<dd>` nativos; estilos `.campo-*` compartidos en `styles.css` (W2).
- [x] 2.3 `header-institucional.{ts,html,css,spec.ts}` — `role="banner"` solo a nivel raíz.
- [x] 2.4 `folio-shell.{ts,html,css,spec.ts}` — sin `role="banner"`/`main`/`contentinfo` internos; slots `folio-status`, `folio-body`, `folio-aside`, `folio-footer` (W1).

### Phase 3: Integración con validación pública y shell raíz
- [x] 3.1 `public-validation-page.html` migrado a `app-banda-estado` y `<dt>`/`<dd>` nativos con `[appCampoDato]`; lógica `.ts` intacta.
- [x] 3.2 DNI completo público, fechas asistidas, `aria-live="polite"`, `aria-atomic="true"`, mensaje técnico genérico preservados.
- [x] 3.3 `app.html`/`app.css` migrados a `app-header-institucional`; único `role="banner"` raíz y skip-link conservados (W1).
- [x] 3.4 `FolioShell` verificado: no duplica landmarks (tests lo confirman).

### Phase 4: Tests y build
- [x] 4.1 `public-validation-page.spec.ts` actualizado: DNI, fechas, ARIA, ausencia token/stack/ruta, dl/dt/dd nativos sin wrappers custom (W2).
- [x] 4.2 Specs por primitivo (4) cubriendo inputs, roles, textos accesibles, clases/variantes. `campo-dato.spec.ts` cubre directiva sobre dt/dd nativos y content model válido.
- [x] 4.3 `npm run test:ci` → 96/96 SUCCESS. `npm run build` → verde.

### Phase 5: QA manual, docs y archive
- [x] 5.1 QA manual (sdd-verify): anchos responsivos, foco por teclado, contraste WCAG, consola sin errores, comparación visual contra `muestra_pagina/` (ver `verify-report.md`).
- [x] 5.2 `docs/frontend/02-sistema-visual-v0-f1-02.md` publicado con "fuera de alcance" explícito.
- [x] 5.3 `docs/frontend/00-angular20-port-v0.md` y `docs/00-indice-general.md` patcheados.
- [x] 5.4 sdd-archive (fusionar delta, archivar carpeta). Ejecutado 2026-07-07; ver `archive-report.md`. Carpeta archivada en `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/`.

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `apps/frontend-angular/src/styles.css` | Modified | Tokens CSS en `:root`, base tipográfica, `:focus-visible`, reduced motion, clases `.campo-*` compartidas para dt/dd (W2). |
| `apps/frontend-angular/src/app/app.css` | Modified | Shell con tokens, fondo paper, footer con border. |
| `apps/frontend-angular/src/app/app.html` | Modified | Usa `<app-header-institucional>`; skip-link y `main#contenido` conservados. |
| `apps/frontend-angular/src/app/app.ts` | Modified | Importa `HeaderInstitucional`. |
| `apps/frontend-angular/src/app/shared/ui/banda-estado.{ts,html,css,spec.ts}` | Created | Primitivo banda de estado con roles ARIA. |
| `apps/frontend-angular/src/app/shared/ui/campo-dato.{ts,spec.ts}` | Modified | Convertido de componente a directiva `[appCampoDato]` sobre `<dt>`/`<dd>` nativos (W2). Archivos `html`/`css` eliminados; estilos movidos a `styles.css`. |
| `apps/frontend-angular/src/app/shared/ui/header-institucional.{ts,html,css,spec.ts}` | Created | Membrete institucional con role=banner raíz. |
| `apps/frontend-angular/src/app/shared/ui/folio-shell.{ts,html,css,spec.ts}` | Created | Shell de folio con slots, sin landmarks internos. |
| `apps/frontend-angular/src/app/features/public-validation/public-validation-page.html` | Modified | Migrado a `app-banda-estado` y `<dt>`/`<dd>` nativos con `[appCampoDato]` (sin wrappers custom en `<dl>`). |
| `apps/frontend-angular/src/app/features/public-validation/public-validation-page.css` | Modified | Hex inline reemplazados por tokens. |
| `apps/frontend-angular/src/app/features/public-validation/public-validation-page.ts` | Modified | Importa `BandaEstado`, `CampoDato` (directiva) (lógica intacta). |
| `apps/frontend-angular/src/app/features/public-validation/public-validation-page.spec.ts` | Modified | Tests de primitivos, DNI, ARIA, ausencia token/stack/ruta, dl/dt/dd nativos sin wrappers custom (W2). |
| `docs/frontend/02-sistema-visual-v0-f1-02.md` | Created | Fuente de verdad visual. |
| `docs/frontend/00-angular20-port-v0.md` | Modified | Patch "Tokens visuales observados" con enlace a F1-02. |
| `docs/00-indice-general.md` | Modified | Enlace al nuevo documento en sección Frontend. |
| `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/tasks.md` | Modified | Tareas marcadas `[x]`; 5.4 archivada (ruta archivada). |

## Verification Results

- `npm run test:ci` → **96/96 SUCCESS**. Incluye `no-focused-tests.mjs`.
- `npm run build` → **verde**. 263.84 kB initial / 75.22 kB transfer; lazy `public-validation-page` 8.96 kB. Base href `/certificados/`. Dentro de presupuestos (500 kB warn / 1 MB error).
- W2 gate PASS: `<dl>` en `public-validation-page` contiene solo `<dt>`/`<dd>` nativos; sin elementos custom (`app-campo-dato`, `app-banda-estado`, `app-folio-shell`) dentro del `<dl>`.

## Deviations from Design

- **`CampoDato` convertido de componente a directiva**: el design original listaba `app-campo-dato` como componente con `dt`/`dd` internos y `display: contents`. El gate W2 detectó que `<dl><app-campo-dato>` viola el content model de `<dl>` (solo `<dt>`/`<dd>`/`<div>` permitidos) y `display: contents` no cura el modelo de contenido. Fix: directiva `[appCampoDato]` sobre `<dt>`/`<dd>` nativos, estilos `.campo-*` compartidos en `styles.css`. Sigue siendo un primitivo standalone Angular llamado `CampoDato` (spec satisfecho: "o nombres finales equivalentes").
- **`FolioShell` no se integró en `public-validation-page`**: la página actual usa `BandaEstado` + `CampoDato` directamente, sin `FolioShell`. El design listaba `FolioShell` como primitivo creado; la integración real en validación pública queda para cuando el flujo F2 lo requiera (el folio completo con aside/sello/QR es scope de F4-01). `FolioShell` está creado y testeado, disponible para ciclos siguientes. Esto mantiene el cambio quirúrgico y evita sobre-portar v0.

## Issues Found

- Test inicial `HeaderInstitucional SVG decorativo con aria-hidden` falló porque Angular no asigna `aria-hidden` como atributo HTML estático en templates sintácticos; se resolvió con `aria-hidden="true"` literal en el SVG.
- Test inicial `BandaEstado usa role=alert` reusaba `render()` dos veces sin resetear `TestBed`; se separó en dos tests independientes.
- **Gate W2 FAIL (corregido en apply correctivo)**: `<dl><app-campo-dato>` violaba el content model de `<dl>`; `display: contents` no cura el modelo de contenido. Fix: convertir `CampoDato` en directiva sobre `<dt>`/`<dd>` nativos, estilos compartidos en `styles.css`. Tests ahora afirman ausencia de wrappers custom dentro del `<dl>`.

## Remaining Tasks

Ninguna. El ciclo F1-02 está cerrado: 5.1 QA manual y 5.4 `sdd-archive` ejecutados (ver `verify-report.md` y `archive-report.md`). Esta copia vive en `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/` como evidencia archivada.

## Workload / PR Boundary

- Mode: single PR.
- Current work unit: F1-02 completo (tokens + primitivos + migración pública + docs).
- Boundary: desde `styles.css` vacío hasta sistema visual aplicado + docs. Sin backend, sin deploy, sin Tailwind.
- Estimated review budget impact: ~700-900 líneas (dentro de 1500).

## Status

21/21 tasks completas. Ciclo F1-02 archivado (sdd-archive ejecutado 2026-07-07).