# F4-02 — Vista previa imprimible de certificado

## Ruta

`/admin/certificaciones/:id/pdf` — página standalone Angular 20, lazy, protegida por `adminGuard`.

## Alcance

Vista previa imprimible mock-only de un certificado. Sin PDF real, backend, HTTP, storage ni dependencias nuevas. La impresión se logra con `window.print()` + `@media print` + `@page { size: A4 landscape; margin: 0; }`.

## Archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `pages/pdf/certification-pdf-preview-page.ts` | Crear | Componente standalone con signals, validación decimal, effect anti-race, `imprimir()` con guard + `requestAnimationFrame`. |
| `pages/pdf/certification-pdf-preview-page.html` | Crear | Folio HTML con encabezado, cuerpo, firmas, bloque de validación QR, pie. Barra de acciones y live region con `.no-print`. |
| `pages/pdf/certification-pdf-preview-page.css` | Crear | Layout responsive + print styles (A4 landscape, `.no-print`, `print-color-adjust: exact`). |
| `pages/pdf/certification-pdf-preview-page.spec.ts` | Crear | 34 tests: ids robustos, privacidad, QR 8×8, autoridades neutras, impresión diferida, route reuse, guard anti-race. |
| `app.routes.ts` | Modificar | Ruta `certificaciones/:id/pdf` antes de `certificaciones/:id`. |
| `app.routes.spec.ts` | Modificar | 7 tests nuevos de orden y resolución de ruta PDF. |
| `pages/preview/certification-preview-page.html` | Modificar | `Descargar PDF` y `Regenerar PDF` pasan de `disabled` a `<a routerLink>`. |
| `pages/preview/certification-preview-page.css` | Modificar | Estilo `.btn-pdf` para enlaces PDF habilitados. |
| `pages/preview/certification-preview-page.spec.ts` | Modificar | Tests del delta F4-02: enlaces PDF + 3 handoffs disabled. |
| `__checks__/no-secrets.spec.ts` | Modificar | `CertificationPdfPreviewPage` en `sources()`. |
| `__checks__/no-real-data.spec.ts` | Modificar | 7 tests de DOM del PDF preview. |

## Enlaces F4-01

- `Descargar PDF` y `Regenerar PDF` del expediente (`/admin/certificaciones/:id`) navegan a `/admin/certificaciones/:id/pdf` vía `routerLink`.
- `Copiar link` (F6-03), `Entrega manual` (F5-04) y `Revocar certificación` (F6-01) siguen `disabled` con `aria-disabled="true"`.

## Impresión

- `window.print()` es la única API de impresión.
- Guard: `typeof window !== 'undefined' && typeof window.print === 'function'`.
- Feedback accesible: `role="status" aria-live="polite"` actualizado antes del diálogo.
- `requestAnimationFrame` difiere `window.print()` para que la live region se pinte primero.
- Fallback: "Impresión no disponible en este entorno." si no hay `window.print`.

## Frontera de datos

- Visible: `nombreAlumno`, `documentMasked` (XX****XX), `cursoNombre`, cada fecha ISO asistida, `emitidoEn` formateado, `numeroExpediente` derivado, `publicValidationUrl` truncada (60 chars), estado.
- No visible: `tokenPrefix` como campo admin, DNI completo, token completo, email, legajo, matrícula, UUID.
- Autoridades: `Autoridad Demo Uno` (Rector/a) y `Autoridad Demo Dos` (Asesor/a Pedagógica) — placeholders neutros.
- QR: decorativo 8×8, sin datos personales, permanente (D0: no rota).

## Print styles

```css
@media print {
  @page { size: A4 landscape; margin: 0; }
  .no-print { display: none !important; }
  .certificado-folio {
    max-width: none !important;
    width: 100% !important;
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
```

## Corrección Codex F4-02

- El folio lista cada `attendedDates` en formato ISO; no usa el resumen "dictado entre".
- `vigente` no agrega señal visual. `borrador`, `vencido` y `revocado` incluyen marca y banda textual, sin deshabilitar la impresión nativa.
- El checker activo `openspec/changes/f4-02-codex-feedback/evidence/print-app-check.mjs` recorre ids `1`, `3`, `4` y `5` contra `ng serve`; exige una A4, fechas exactas, marca/banda cuando corresponde, ausencia de chrome administrativo y frontera de privacidad.
- Los hashes SHA-256 de cada PDF generado se guardan en `openspec/changes/f4-02-codex-feedback/evidence/print-hashes.txt`:
  - `vigente.pdf` → `f94385f86314429eb8f6689b4964ba84d15ae16d50bc3f5e486542045c906d40`
  - `borrador.pdf` → `42eb273456458c62ecea3f2282b2e3ff4d9082e05890c062ed12a667ab52e506`
  - `vencido.pdf` → `15210722c78e71c6abf4095396aa6981fca2678fdf1cf6bc5092cd2d4367df92`
  - `revocado.pdf` → `67e1457bc2d894ca5d670d45f4188a9ec36c2160e2f77c021be1d88a60e728ec`
- El test de regresión `evidence/print-app-check.identity.spec.mjs` cubre la falsa aprobación por folio anterior: prueba que la identidad de un caso no satisface al siguiente.
- Verificación detallada: `openspec/changes/archive/2026-07-12-f4-02-codex-feedback/verify-report.md`.

## Verificación

- `npm run test:ci -- --include='**/certifications/**/*.spec.ts'`: 128/128 SUCCESS.
- `npm run test:ci` (suite completa): 478/478 SUCCESS.
- `node --test openspec/changes/f4-02-codex-feedback/evidence/print-app-check.identity.spec.mjs`: 1/1 PASS.
- `node openspec/changes/f4-02-codex-feedback/evidence/print-app-check.mjs openspec/changes/f4-02-codex-feedback/evidence/app-pdf`: 4/4 PASS.
- `npm run build`: exit 0 (warnings CSS: PDF preview 13,70 kB y certification preview 14,31 kB, ambos < 16kB error).
- `git diff --check`: PASS.
- Capturas (12): `evidence/{vigente,borrador,vencido,revocado}-{desktop,mobile,print}.png` (desktop 1280×800, mobile 390×844, media print).
- PDFs autoritativos: `evidence/app-pdf/{vigente,borrador,vencido,revocado}.pdf` (1 A4 apaisado cada uno).

## Corrección post-verify FAIL (lineage nuevo, no oculta)

La primera corrida de `sdd-verify` (lineage previo `review-7ad4da8e`) terminó en **FAIL** por tres causas concurrentes:

- El folio rendía ~921 CSS px contra ~794 px disponibles de A4 landscape; padding/gaps y `break-inside: avoid` imposibles producían 3 páginas.
- `.no-print` funcionaba en media print, pero el `admin-shell` externo solo se ocultaba vía workaround DOM (click), no en `emulateMedia('print')`/`page.pdf()`.
- La captura `pdf-print.png` anterior era screenshot de pantalla (inválida como prueba paginada).

La corrección se aplicó con lineage **nuevo** `review-c74662c658bf5781`, sin reutilizar el lineage fallido:

1. `certification-pdf-preview-page.css` — `@media print` compacto con altura natural y `overflow: visible`; 1 A4 landscape con padding/gap/escala/tipografía/break ajustados.
2. `admin-shell.css` — `@media print` estable que oculta skip-link, sidebar-desktop, topbar, footer, drawer-overlay, drawer-mobile y menu-btn; resetea `.layout`/`.content`/`main#contenido` a block sin padding/max-width.
3. `certification-pdf-preview-page.ts` — eliminado workaround DOM (`SHELL_SELECTORS`, `hidden`/`for`/`finally`); `imprimir()` queda solo feedback + rAF + `window.print()`. −22 líneas netas.
4. `certification-pdf-preview-page.spec.ts` — reemplazado test del workaround obsoleto por test que verifica que `imprimir()` no manipula `display` del shell (CSS lo oculta).

Evidencia real regenerada (autoritativa, no fixture):

- `print-app-check.sh` contra la app Angular real: normal `id=1` y revocado `id=5`, 1 página A4 cada uno, chrome admin ausente, sin overflow, `pdftotext` confirmó títulos, alumnos, cursos, autoridades, números de certificado, estado revocado y texto institucional.
- Hashes SHA-256: `d5204c6f…` (normal) y `0e81b5bb…` (revocado); `pdf-print.png` regenerada desde el PDF real con hash `438fd82f…`.
- Tareas `C1`–`C7` del bloque de corrección quedaron verdes; detalle completo en `evidence/apply-evidence.md`.

## Warnings carry-forward (no bloqueantes)

- `requestAnimationFrame` no conserva/cancela su handle al destruir el componente. Sin falla runtime observada; follow-up aprobado para un ciclo posterior.
- Dos warnings de budget CSS (ambos < 16 kB error): `certification-pdf-preview-page.css` 12,41 kB y `certification-preview-page.css` 14,31 kB. Trade-off documentado de paridad visual contra `vista-previa-pdf.tsx`.

## Handoffs

- F5-04 (Entrega manual): sigue disabled en F4-01.
- F6-03 (Copiar link): sigue disabled en F4-01.
- F6-01 (Revocar certificación): sigue disabled en F4-01.
- Configuración institucional: placeholders neutros hasta ciclo posterior que conecte `HttpInstitutionalConfigService`.
