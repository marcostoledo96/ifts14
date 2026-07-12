# Apply Evidence — F4-02 Vista previa imprimible de certificado

Fecha: 2026-07-12
Rama: `frontend/certificate-pdf-preview`
Modo: Standard (strict_tdd=false)

## Corrección post-verify FAIL (scope nuevo, sin reutilizar lineage review-7ad4da8e)

Causa raíz confirmada: folio ~921 CSS px > ~794 px disponibles en A4 landscape; padding/gaps y `break-inside: avoid` imposibles producían 3 páginas. `.no-print` funcionaba en media print, pero el AdminShell externo solo se ocultaba vía workaround DOM (click), no en `emulateMedia('print')`/`page.pdf()`. La captura `pdf-print.png` anterior era screenshot screen inválida como prueba paginada.

### Cambios aplicados

1. `certification-pdf-preview-page.css` — `@media print` compacto con altura natural y `overflow: visible`; no fuerza `height: 100vh + overflow: hidden`.
2. `admin-shell.css` — `@media print` estable: oculta `.skip-link`, `.sidebar-desktop`, `.topbar`, `footer`, `.drawer-overlay`, `.drawer-mobile`, `.menu-btn`; resetea `.layout`/`.content`/`main#contenido` a block sin padding/max-width.
3. `certification-pdf-preview-page.ts` — eliminado workaround DOM (`SHELL_SELECTORS`, `hidden`/`for`/`finally`); `imprimir()` ahora solo feedback + rAF + `window.print()`. El CSS print del shell lo hace redundante. −22 líneas netas (157→135).
4. `certification-pdf-preview-page.spec.ts` — reemplazado test del workaround obsoleto por test que verifica que `imprimir()` no manipula `display` del shell (CSS lo oculta).

### TDD RED/GREEN

- **RED**: `print-app-check.sh` contra una mutación temporal `height:100vh + overflow:hidden` → ambos casos fallaron por overflow y contenido recortado.
- **GREEN**: `print-app-check.sh` contra la app Angular real → normal y revocado, 1 página A4, chrome ausente, textos y privacidad PASS.

### Comandos reproducidos

| Comando | Desde | Exit | Resultado |
|---|---|---|---|
| `evidence/print-app-check.sh` | repo root | 0 | Dev server + login UI mock + SPA + PDF Chromium: normal y revocado PASS; `pdf-print.png` desde el PDF real |
| `npx ng test --watch=false --browsers=ChromeHeadless --include='**/certification-pdf-preview-page.spec.ts'` | `apps/frontend-angular` | 0 | 35/35 SUCCESS |
| `npx ng test --watch=false --browsers=ChromeHeadless --include='**/app.routes.spec.ts'` | `apps/frontend-angular` | 0 | 79/79 SUCCESS |
| `npx ng test --watch=false --browsers=ChromeHeadless --include='**/features/admin/certifications/__checks__/*.spec.ts'` | `apps/frontend-angular` | 0 | 24/24 SUCCESS |
| `npm run test:ci` | `apps/frontend-angular` | 0 | 474/474 SUCCESS |
| `npm run build` | `apps/frontend-angular` | 0 | Bundle complete, 2 warnings CSS budget (12.41 kB, 14.31 kB) |

### PDF page count / text checks

- `pdfinfo folio-print.pdf` → `Pages: 1`, `Page size: 841.92 x 594.96 pts (A4)`.
- `pdftotext` → presente: CERTIFICADO, Alumno Demo Uno, Autoridad Demo Uno/Dos, IFTS14-CERT-0001, Curso de introduccion; ausente: Saltar al contenido, Sesion mock, Panel administrativo, Vista imprimible, Volver al expediente; sin UUID/DNI completo/email.

## Build warnings (esperados, no bloqueantes)

- `certification-pdf-preview-page.css`: 12.41 kB (budget 8 kB warn, 16 kB error).
- `certification-preview-page.css`: 14.31 kB (budget 8 kB warn, 16 kB error).

Mismo par de warnings que antes de la corrección; trade-off documentado en design.md.

## Integridad de repositorio

`package.json`/lockfiles/`angular.json`/`.atl`: sin cambios. `git diff --check`: limpio. tasks.md: 15 `[x]` (Phases 1–6), 2 `[ ]` (Phase 7 — verify/archive no ejecutados en este apply).
