# Tasks: F1-02 — Sistema visual v0 para Angular

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 700–1000 |
| 1500-line budget risk | Low |
| 400-line budget risk (default) | Medium |
| Chained PRs recommended | No |
| Delivery strategy | single-pr-default |
| Chain strategy | N/A |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A
400-line budget risk: Medium

### Suggested Work Units

Single PR. Cambio acotado al frontend Angular 20 con un solo responsable de revisión; sin nuevos paquetes, sin cambios backend ni deploy.

## Advertencias del design-gate (a verificar en apply/verify)

- [x] W1 Un solo `role="banner"` a nivel de página raíz; `FolioShell` y el membrete del `HeaderInstitucional` no agregan banner ni duplican `main`/`contentinfo`; `skip-link` intacto en `app.html`.
- [x] W2 `CampoDato` mantiene `dl/dt/dd` válidos; directiva sobre `<dt>`/`<dd>` nativos, sin elementos custom inválidos dentro del `<dl>` compartido de `public-validation-page`.
- [x] W3 QA manual durante verify: anchos responsivos, foco por teclado, contraste, consola sin errores y comparación visual contra `muestra_pagina/`.

## Phase 1: Foundation — Tokens CSS

- [x] 1.1 Definir tokens en `apps/frontend-angular/src/styles.css`: colores, tipografía, radios, espaciado, foco y motion mínimo según `design.md`.
- [x] 1.2 Añadir tipografía base, `:focus-visible`, soporte `prefers-reduced-motion` y preservar los estilos del `skip-link` existente.
- [x] 1.3 Documentar el mapa de tokens en `docs/frontend/02-sistema-visual-v0-f1-02.md` (sección "Tokens").

## Phase 2: Primitivos en `shared/ui`

- [x] 2.1 Crear `banda-estado.{ts,html,css,spec.ts}` con `role="status"` (carga/válido/no verificable) y `role="alert"` solo para error técnico; `aria-live`/`aria-atomic` preservados.
- [x] 2.2 Crear `campo-dato.{ts,spec.ts}` como directiva `[appCampoDato]` sobre `<dt>`/`<dd>` nativos; estilos compartidos en `styles.css` (`.campo-*`); sin wrappers custom dentro del `<dl>` compartido (W2).
- [x] 2.3 Crear `header-institucional.{ts,html,css,spec.ts}` con `role="banner"` usado solo a nivel de página raíz.
- [x] 2.4 Crear `folio-shell.{ts,html,css,spec.ts}` SIN `role="banner"` interno; expone slots `folio-status`, `folio-body`, `folio-aside`, `folio-footer` (W1).

## Phase 3: Integración con validación pública y shell raíz

- [x] 3.1 Reemplazar `state-*` en `public-validation-page.html` por `<app-banda-estado>` y `<dt>`/`<dd>` nativos con `[appCampoDato]`; no tocar la lógica de `public-validation-page.ts`.
- [x] 3.2 Mantener DNI completo público, fechas asistidas, `aria-live="polite"`, `aria-atomic="true"` y mensaje técnico genérico.
- [x] 3.3 Migrar `app.html` y `app.css` para usar `<app-header-institucional>`; conservar el único `role="banner"` raíz y el `skip-link` (W1).
- [x] 3.4 Verificar que `FolioShell` no duplica landmarks `main`/`contentinfo` al componerse dentro de la página (W1).

## Phase 4: Tests y build

- [x] 4.1 Actualizar `public-validation-page.spec.ts` para reflejar el render basado en primitivos: DNI, fechas, ARIA, ausencia de token/stack/ruta.
- [x] 4.2 Añadir `*.spec.ts` por primitivo cubriendo inputs requeridos, roles, textos accesibles y clases/token hooks.
- [x] 4.3 Correr `cd apps/frontend-angular && npm run test:ci` (incluye `no-focused-tests.mjs`) y `npm run build`; ambos en verde.

## Phase 5: QA manual, docs y archive

- [x] 5.1 QA manual obligatorio: anchos responsivos, foco por teclado, contraste WCAG, consola sin errores y comparación visual contra `muestra_pagina/` (W3). Evidencia: Playwright local en `127.0.0.1:4420/certificados/validar/demo-valido`, anchos 1026px y 390px; foco visible del skip-link; contraste estático mínimo medido 5.19:1; consola sin errores ni warnings; comparación estática contra tokens y membrete de `muestra_pagina/app/globals.css`.
- [x] 5.2 Publicar `docs/frontend/02-sistema-visual-v0-f1-02.md` como fuente de verdad visual y dejar explícito el "fuera de alcance" (sin admin/backend/Tailwind/React copy).
- [x] 5.3 Patchear `docs/frontend/00-angular20-port-v0.md` y `docs/00-indice-general.md` con resumen y enlace al nuevo documento.
- [x] 5.4 Cerrar el ciclo con `sdd-archive`: fusionar el delta `frontend-design-system-readiness` en `openspec/specs/` y archivar la carpeta del cambio. (Ejecutado 2026-07-07; ver `archive-report.md`. Artefactos archivados en `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/`.)
