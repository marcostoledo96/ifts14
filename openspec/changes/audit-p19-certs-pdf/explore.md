# Exploration: audit-p19-certs-pdf

**Cambio**: `audit-p19-certs-pdf`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p19-certs-pdf`
**Alcance de fase**: `/admin/certificaciones/:id/pdf` → `certification-pdf-preview-page.{ts,html,css,spec.ts}`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P19; `openspec/specs/admin-certifications-frontend/spec.md` («Paridad visual, folio imprimible y evidencia de verificación»); tests `REQ-PAR-PDF-001` (export folio visible, no stub API); AGENTS.md (DNI completo UI; sin token completo en logs); hard locks: no rotar token; no reintroducir textos institucionales no deseados; no P18 rewrite; no P20/P21; no HTTP/backend unless front-only; leave P18 archive uncommitted alone

## Exploration: Folio PDF (P19)

### Current State

`CertificationPdfPreviewPage` es la **vista imprimible / descarga client-side** del folio: carga hard de detalle (`obtener`) + soft de config institucional (`obtener().catch → null`) y firmas (`previewFirma`); URL canónica + QR vía `obtenerEntregaManual` + `descargarQrPng` (fallback `qrPngBlobFromUrl`); **Imprimir** = `window.print()` A4 landscape; **Descargar PDF** = `html2canvas-pro` + `jsPDF` del folio visible (`exportarFolioVisibleComoPdf`), **no** `CertificationsService.descargarPdf`.

| Checklist P19 | Estado hoy | Evidencia |
|---|---|---|
| Folio A4 print 1 página; firmas 3:2 | **OK (código; verify visual)** | `@page` A4 landscape; folio `297×210mm` + `overflow:hidden` en print/export; `.cert-firma-img` 10.5×7rem (3:2) / print 9×6rem; grid 3 col en print/export |
| QR apunta a URL canónica completa | **OK** | `cargarValidacion` prioriza `entrega.publicValidationUrl`; QR blob vía `descargarQrPng` o `qrPngBlobFromUrl(url)`; UI muestra `validacionUrlMostrada` truncada (D0) |
| Filename semántico | **OK (menor drift)** | `pdfFilename` → `cert-IFTS14-CERT-{id}.pdf`; test lo fija. No usa `detalle.numero` (delivery sí) |
| Sin disclaimers/textos no deseados en pie | **OK** | Pie = marca BA Ciudad; nota QR fuera del folio (`no-print`); `certificateText` se carga pero **no** se renderiza (hardcoded intro/cuerpo) |
| Revocado marcado | **OK** | `estadoPresentacion` → marca `REVOCADO` + banda; tests ids 4/5; vigente limpio |
| Performance html2canvas aceptable | **Parcial (verify)** | `waitForImages`, `scale:2`, `compress`, clase `folio-export-a4`; sin métrica/test de tiempo |

**Carga y honesty**

```text
effect(id) → load()
  Promise.all[ obtener(cid), config.obtener().catch(null) ]
  catch → error = (e as Error).message          ← raw
  aplicarConfig soft + loadFirmaPreview soft
  void cargarValidacion (entrega soft + QR soft, msgs fijos)
  void maybeAutoDownload(?descargar=1)

descargarPdf() catch → downloadFeedback = (e as Error).message  ← raw
```

- **Sin** `errorRecuperable` (locked P19 — no introducir; soft paths ya distinguen).
- Fallo hard: mensaje (posible raw) + Volver; **sin** Reintentar.
- QR soft: mensajes fijos es-AR («No se pudo cargar el código QR.»).

**Qué ya está bien (no reabrir)**

- Print A4 landscape 1 página + firmas slot 3:2 en CSS print/export.
- QR real (PNG) + URL canónica para encoding; truncado solo en UI.
- Descarga client-side del folio visible (tests `REQ-PAR-PDF-001` prohíben seam API).
- Revocado visible; vigente limpio; DNI completo; sin UUID/token full en DOM.
- Pie sin notas internas de configuración; `certificateText` no cableado al folio.
- Auto-download `?descargar=1` desde asistencias (handoff P15) sin rotar token.

**Residuos / gaps (top)**

1. **Honesty** — raw `(e as Error).message` en `load` catch y `descargarPdf` catch.
2. **Spec drift** — escenario «Descargar PDF con seam API (P-13)» exige `descargarPdf(id)` HTTP; implementación + tests exigen **html2canvas** del folio. También conviene aclarar que `window.print()` y descarga client-side coexisten.
3. **Tests** — faltan asserts anti-raw en load/descarga error; opcional Reintentar; no hay smoke de ratio 3:2 / 1 página (verify manual/PLAN).
4. **Filename menor** — `numeroExpediente` ignora `detalle.numero` (paridad delivery).
5. **Fuera de alcance** — no tocar archive P18 uncommitted; no reescribir preview P18; no P20 entrega; no P21 revoke; no HTTP/backend/`certificate-pdf-qr-generation`; no rotación token; no reintroducir `certificateText` ni disclaimers institucionales en el folio.

### Affected Areas

- `apps/frontend-angular/.../pdf/certification-pdf-preview-page.ts` — mensajes fijos / `mensajeErrorApi` local (sin `errorRecuperable`); opcional `detalle.numero` en filename; no tocar pipeline html2canvas salvo bug real.
- `apps/frontend-angular/.../pdf/certification-pdf-preview-page.html` — opcional Reintentar en bloque `error()`; **no** cablear `certificateText`; no agregar pie/disclaimers.
- `apps/frontend-angular/.../pdf/certification-pdf-preview-page.css` — solo si verify demuestra overflow 2.ª página o slot firma ≠ 3:2 (hoy parece OK).
- `apps/frontend-angular/.../pdf/certification-pdf-preview-page.spec.ts` — honesty anti-raw; conservar `REQ-PAR-PDF-001`, revocado, QR, filename.
- `openspec/specs/admin-certifications-frontend/spec.md` — delta MODIFIED «Paridad visual, folio imprimible…».
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — checkboxes P19 en apply/archive (no en explore).
- **No tocar**: archive P18 uncommitted (`openspec/changes/archive/2026-07-29-audit-p18-certs-preview/` + docs/spec ya en working tree); preview page (P18); delivery (P20); revoke (P21); `certificate-pdf-qr-generation`; `http-*.service`; backend.

### Approaches

1. **Auditoría quirúrgica (recomendada)** — Honesty sin `errorRecuperable` + alinear spec descarga = html2canvas folio + tests anti-raw + verify checklist (print 1 pág / firmas 3:2 / perf). Sin HTTP.
   - Pros: cierra gaps reales; respeta `REQ-PAR-PDF-001`; blast radius acotado a page+tests+delta.
   - Cons: no rediseña folio ni vuelve a PDF TCPDF backend.
   - Effort: Low

2. **Solo documentar hallazgo** — PLAN + nota en docs; cero código.
   - Pros: diff mínimo.
   - Cons: deja raw `Error.message` y drift P-13 en spec canónica.
   - Effort: Low (incompleto)

3. **Volver a descarga API / reescribir folio** — `descargarPdf` HTTP o portar textos `certificateText` / rediseño print.
   - Pros: alinea con escenario P-13 antiguo o con backend TCPDF.
   - Cons: rompe tests `REQ-PAR-PDF-001`, hard locks front-only / no textos no deseados / no backend; mezcla P19 con `certificate-pdf-qr-generation`.
   - Effort: Medium–High (**bloqueado**)

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Honesty** — mensajes fijos es-AR (o `mensajeErrorApi` envelope/genérico) en `load` y `descargarPdf`; **sin** raw `Error.message`; **sin** introducir `errorRecuperable`.
2. **Reintentar (opcional recomendado)** — botón que llame `load()` en fallo hard (paridad P16/P18 explore, sin flag).
3. **Conservar** print A4 1 pág, firmas 3:2, QR canónico (UI truncada), filename `cert-…pdf`, pie sin disclaimers, revocado, html2canvas export (no seam API).
4. **Spec** — delta MODIFIED `admin-certifications-frontend` / «Paridad visual, folio imprimible…»: Descargar PDF = captura folio visible (html2canvas+jsPDF) con filename semántico; Imprimir = `window.print()`; honesty; QR canónico; no rotar token.
5. **Spec NO target** — `certificate-pdf-qr-generation` (backend persistencia/TCPDF) fuera de alcance front-only.
6. **Hard locks** — no tocar P18 archive uncommitted; no rewrite preview; no P20/P21; no HTTP/backend; no token rotation; no reintroducir textos institucionales no deseados / `certificateText` en folio.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (page + tests + delta) — **sí**.
2. Spec target = **`admin-certifications-frontend`** / MODIFIED «Paridad visual, folio imprimible y evidencia de verificación» — **sí**.
3. **No** target `certificate-pdf-qr-generation` — **sí (hard lock)**.
4. Honesty sin raw `Error.message` en `load` y `descargarPdf` — **sí**.
5. **No** introducir `errorRecuperable` — **sí (hard lock)**.
6. Descargar PDF = html2canvas folio visible (NO seam API) — **sí** (alinear spec; conservar tests).
7. Imprimir = `window.print()` A4 landscape 1 página; firmas slot 3:2 — **sí** (conservar; verify visual).
8. QR = PNG canónico completo; UI truncada; sin rotar token — **sí**.
9. Filename semántico `cert-{codigo}.pdf`; pie sin disclaimers; revocado marcado — **sí**.
10. No P18 archive / P18 rewrite / P20 / P21 / HTTP / backend / `certificateText` en folio — **sí (hard lock)**.

### Questions (para propose)

1. Confirmar defaults 1–10 (recomendado: aceptar todos).
2. ¿Texto fijo load hard? Propuesta: *«No se pudo cargar la certificación.»* (+ id inválido ya existente) — **sí**.
3. ¿Texto fijo fallo descarga? Propuesta: *«No se pudo generar el PDF.»* (ya es fallback) — **sí**, sin raw.
4. ¿Reintentar en panel error? (**recomendado: sí**, sin `errorRecuperable`).
5. ¿Usar `detalle.numero` en `numeroExpediente`/`pdfFilename` si viene del API? (**recomendado: sí**, paridad delivery; bajo riesgo).

### Risks

- Dejar escenario P-13 «seam API» en spec → verify futuro falla o fuerza regresión HTTP.
- Introducir `errorRecuperable` → confunde soft QR/config vs hard load (P19 lock).
- Cablear `certificateText` o textos institucionales extra → viola hard lock «no reintroducir».
- Tocar archive P18 uncommitted / preview / delivery / backend → sale de fase y ensucia PR.
- Optimizar html2canvas a ciegas (bajar `scale`) → degrada nitidez del folio sin evidencia de perf.

### Ready for Proposal

**Yes** — orquestador puede lanzar `sdd-propose` con defaults 1–10; gap principal = honesty + alinear delta folio/PDF a html2canvas; checklist visual/perf = verify, no rewrite.
