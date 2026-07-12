# Tasks: F4-02 — Vista previa imprimible de certificado

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas | 700–1100 (proposal) |
| Archivos | 4 nuevos + 6 modificados |
| Presupuesto usuario | 4000 |
| 400-line budget risk (interno) | Low — no aplicado |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr-default (fijada) |
| Chain strategy | none (fijada) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none
400-line budget risk: Low

Nota: el umbral interno de 400 no fuerza split (usuario fijó 4000). Forecast 700–1100 < 4000 → single PR; si lo supera, reabrir.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | Página PDF + delta F4-01 + checks + evidencia + docs | PR 1 | `npm run test:ci -- --include='**/certifications/**'` | `ng serve` + capturas 1280×800, 390×844, media print | Quitar ruta/página/tests y restaurar 2 CTAs F4-01 `disabled` |

## Phase 1 — Foundation (routing + scaffold TDD)

- [x] 1.1 RED: en `app.routes.spec.ts` asertar `/admin/certificaciones/abc/pdf` y que `:id` no capture `/pdf`.
- [x] 1.2 Crear `pages/pdf/certification-pdf-preview-page.ts` standalone con signals `id`, `certificacion`, `estado`.
- [x] 1.3 GREEN: registrar `certificaciones/:id/pdf` ANTES de `:id` en `app.routes.ts`; spec 1.1 verde.

## Phase 2 — Core (folio + ids + privacidad)

- [x] 2.1 RED: en `certification-pdf-preview-page.spec.ts` cubrir ids `abc`, `0`, `0x1`, `1e0`, `999`, vacío, cambio de id y NO exposición de `tokenPrefix`/DNI/email/UUID/legajo/matrícula.
- [x] 2.2 GREEN: `load()` con validación decimal + effect anti-race; HTML folio + `aria-live="polite"` + `.no-print` + QR 8×8; CSS responsive con `@page { size: A4 landscape; margin: 0; }` y `print-color-adjust: exact`.
- [x] 2.3 Quick verify: `npm run test:ci -- --include='**/certification-pdf-preview-page.spec.ts'`.

## Phase 3 — Impresión nativa

- [x] 3.1 RED: spec cubre `window.print()` tras `requestAnimationFrame` posterior a la live region; fallback "Impresión no disponible" si `window.print` es indefinido.
- [x] 3.2 GREEN: cablear `requestAnimationFrame` y guard.

## Phase 4 — Delta F4-01 + privacy checks

- [x] 4.1 RED: en `certification-preview-page.spec.ts` asertar `Descargar/Regenerar PDF` como `routerLink` a `:id/pdf`; los otros tres `disabled` con handoffs F6-03/F5-04/F6-01.
- [x] 4.2 GREEN: en `certification-preview-page.html` reemplazar los dos botones PDF por `<a [routerLink]="['/admin/certificaciones', id, 'pdf']">`; los otros tres intactos.
- [x] 4.3 RED→GREEN: añadir `CertificationPdfPreviewPage` al array `sources()` de `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts`.

## Phase 5 — Verificación & evidencia

- [x] 5.1 `npm run test:ci` + `npm run build` con `package.json`/lockfile sin cambios; no declarar done si falla algo fuera de scope.
- [x] 5.2 Capturar `evidence/pdf-desktop.png` (1280×800), `pdf-mobile.png` (390×844), `pdf-print.png` (media print) y `parity-notes.md` contra v0; quick verify con `ng serve` + recorrido manual reportando archivos, comandos, escenarios cubiertos y NO cubiertos.

## Phase 6 — Documentación & cierre

- [x] 6.1 Crear `docs/frontend/F4-02-vista-previa-pdf.md` con la ruta, enlaces F4-01 y nota de impresión mock-only.
- [x] 6.2 Reporte final de apply: archivos tocados, comandos, resultados de build/test/capturas, escenarios cubiertos y NO cubiertos, riesgos abiertos.

## Phase 7 — Verify & Archive (pendiente; NO ejecutado por apply)

- [x] 7.1 `sdd-verify`: ejecutar verificación contra specs/design/tasks; reproducir test:ci + build desde verify y registrar evidencia.
- [x] 7.2 `sdd-archive`: sincronizar delta specs a `openspec/specs/`, registrar handoffs F5-F6 y mover el cambio a archivados.

## Corrección post-verify FAIL (scope nuevo, sin reutilizar lineage review-7ad4da8e)

- [x] C1 RED: `evidence/print-app-check.sh` detecta `height:100vh` + `overflow:hidden` en la app Angular real (normal y revocado).
- [x] C2 GREEN: compactar `@media print` de `certification-pdf-preview-page.css` a 1 A4 landscape (padding/gap/escala/tipografía/break).
- [x] C3 `admin-shell.css` `@media print` estable ocultando chrome admin.
- [x] C4 Eliminar workaround DOM del TS (`SHELL_SELECTORS`, `hidden`/`for`/`finally`); mantener `window.print()` + rAF + feedback.
- [x] C5 Ajustar spec: reemplazar test del workaround obsoleto por test que verifica no manipulación de display del shell.
- [x] C6 Regenerar evidencia: PDF Chromium de la app real (normal y revocado) + `pdf-print.png`; actualizar `apply-evidence.md` y `parity-notes.md`.
- [x] C7 `npm run test:ci`, `npm run build`, `print-app-check.sh` (dos casos, 1 página, chrome ausente, sin overflow) y `git diff --check`.
