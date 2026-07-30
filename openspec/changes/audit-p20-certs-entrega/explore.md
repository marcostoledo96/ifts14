# Exploration: audit-p20-certs-entrega

**Cambio**: `audit-p20-certs-entrega`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p20-certs-entrega`
**Alcance de fase**: `/admin/certificaciones/:id/entrega` → `certification-delivery-page.{ts,html,css,spec.ts}`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P20; `openspec/specs/admin-certificate-delivery-frontend/spec.md` (REQ-DEL-001…008); backend contrato `admin-certificate-delivery` / `GET …/entrega-manual` → `409 TOKEN_NOT_RECOVERABLE`; paridad honesty P15/P18 (`mensajeErrorApi`, load soft/hard); hard locks: D0 token permanente; no P19 PDF rewrite; no P21 revoke; leave P19 archive alone; prefer front-only (HTTP solo si mapping 409 roto)

## Exploration: Entrega manual (P20)

### Current State

`CertificationDeliveryPage` es el diálogo modal de entrega manual: carga en paralelo `obtener(cid)` + `obtenerEntregaManual(cid)` vía `Promise.all`; muestra ficha (alumno, DNI completo D0, curso, fechas, número), URL canónica, Copiar link (clipboard + fallback), Descargar QR (Blob + filename semántico), Descargar PDF (navega a `…/pdf?descargar=1`, paridad folio P19 — **no** seam `descargarPdf` TCPDF), alert `pdfStatus === 'outdated'` + stub `volverARegenerarPdf`, Escape/focus-trap, copy bedelía de permanencia QR / sin email.

| Checklist P20 | Estado hoy | Evidencia |
|---|---|---|
| Copiar link / descargar PDF o QR | **OK (happy path)** | `copiarLink` + fallback; `descargarQrPng` Blob; PDF → navigate folio `?descargar=1`; tests REQ-DEL-001/003, QR, footer |
| 409 TOKEN_NOT_RECOVERABLE mensaje operable | **GAP** | Sin mapeo de `code`/`status`; `Promise.all` tumba toda la página; UI solo muestra `(e as Error).message` (suele ser genérico HTTP) |
| No rotar token al reenviar/regenerar vista | **OK backend; GAP front regen** | Backend `regenerarPdf` reusa token cifrado; entrega-manual es read-only. Front stub no llama API; no hay reenvío email (404 `/reenviar`) |
| Copy claro bedelía | **Parcial** | Desc + aclaraciones OK; falta mensaje operable 409; stub regen habla de “acción del backend / administrador” |

**Carga y honesty**

```text
effect(id) → cargar()
  Promise.all[ obtener(cid), obtenerEntregaManual(cid) ]
  catch → error = (e as Error).message          ← raw; 409 tumba todo
  sin errorRecuperable / Reintentar

descargarQr()  catch → qrError = (e as Error).message || fallback
descargarPdf() catch → qrError = (e as Error).message || fallback
volverARegenerarPdf() → regenerarMsg stub (no regenerarPdf seam)
```

Backend ya responde `409 TOKEN_NOT_RECOVERABLE` (“Token no recuperable.”) sin regenerar. Preview (`certification-preview-page`) trata entrega como **soft** (`Promise.allSettled` + mensaje fijo si `code === 'TOKEN_NOT_RECOVERABLE' || status === 409`) y cablea `regenerarPdf` con `mensajeErrorApi` P15-strict. Delivery **no** adoptó ese patrón.

**Qué ya está bien (no reabrir)**

- URL canónica desde `entrega-manual` (REQ-DEL-001); filenames QR/PDF semánticos.
- Copiar link + fallback clipboard; Descargar QR Blob inline error (happy path).
- PDF descarga = handoff al folio institucional (`?descargar=1`) — alineado a P19; tests lo fijan.
- DNI completo UI; Escape → expediente; focus trap; sin SMTP/reenvío.
- Mock `pdfStatus: 'outdated'` en id 4; alert + botón visibles.

**Residuos / gaps (top)**

1. **409 TOKEN_NOT_RECOVERABLE no operable** — `Promise.all` hace hard-fail de página entera; sin mensaje bedelía claro ni CTAs deshabilitados con ficha visible.
2. **Honesty** — raw `(e as Error).message` en `cargar` / QR / PDF; sin `mensajeErrorApi` P15-strict; sin `errorRecuperable` en load hard (paridad P18 load-only).
3. **`volverARegenerarPdf` stub** — contradice existencia de `CertificationsService.regenerarPdf` (preview ya lo usa; backend no rota token). REQ-DEL-005 aún exige el stub MVP.
4. **Spec drift REQ-DEL-008** — exige Blob `descargarPdf(id)` HTTP; implementación + tests exigen navigate folio (P19).
5. **Tests** — QR error test **espera** raw message (`'QR no disponible'`); faltan asserts 409 operable, anti-raw, regen vía seam.
6. **Fuera de alcance** — no tocar archive P19; no reescribir folio PDF; no P21 revoke; no backend/`admin-certificate-delivery` salvo si el envelope 409 no llega al front.

### Affected Areas

- `apps/frontend-angular/.../delivery/certification-delivery-page.ts` — `Promise.allSettled` (detalle hard / entrega soft-or-hard-409); `mensajeErrorApi`; map 409; wire `regenerarPdf`; opcional `errorRecuperable` load-only.
- `apps/frontend-angular/.../delivery/certification-delivery-page.html` — panel error 409 operable; Reintentar gated si aplica; CTAs off sin URL; regen feedback real.
- `apps/frontend-angular/.../delivery/certification-delivery-page.spec.ts` — anti-raw; 409; regen spy; actualizar test stub REQ-DEL-005.
- `openspec/specs/admin-certificate-delivery-frontend/spec.md` — delta MODIFIED REQ-DEL-005 (+ honesty/409; alinear REQ-DEL-008 a folio navigate).
- `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` — checkboxes P20 en apply/archive (no en explore).
- **No tocar**: `openspec/changes/archive/2026-07-29-audit-p19-certs-pdf/`; pdf-preview page; revoke; backend PHP salvo gate “mapping 409 roto”; `admin-certifications-frontend` salvo nota cross-ref opcional.

### Approaches

1. **Auditoría quirúrgica front-only (recomendada)** — Honesty P15-strict + `allSettled` + mensaje 409 operable + cablear `regenerarPdf` (sin rotar token) + delta `admin-certificate-delivery-frontend` (REQ-DEL-005/008 + escenarios honesty/409).
   - Pros: cierra checklist P20; paridad preview/P18; blast radius = page + tests + delta; respeta D0.
   - Cons: hay que actualizar tests que hoy afirman stub/raw.
   - Effort: Low–Medium

2. **Solo documentar hallazgo** — PLAN + nota; cero código.
   - Pros: diff mínimo.
   - Cons: deja 409 inoperable y stub regen; no cierra fase crítica.
   - Effort: Low (**incompleto**)

3. **HTTP/backend + front** — tocar envelope/`AdminCertificateService` o mensajes API.
   - Pros: solo si el front no recibe `status`/`code`.
   - Cons: viola prefer front-only; mezcla con `admin-certificate-delivery` backend ya verificado.
   - Effort: Medium (**bloqueado salvo evidencia**)

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Carga** — `Promise.allSettled`: fallo de `obtener` = hard (mensaje fijo es-AR; **Reintentar** solo si `errorRecuperable` load-only, paridad P18). Fallo de `obtenerEntregaManual` con 409/`TOKEN_NOT_RECOVERABLE` = panel operable bedelía **sin** tumbar ficha si detalle OK; Copiar/QR off; **sin** Reintentar (no recuperable por retry).
2. **Honesty** — `mensajeErrorApi` P15-strict (envelope message o genérico es-AR) en QR/PDF/regen; **sin** raw `Error.message`.
3. **Regen** — `volverARegenerarPdf` → `certs.regenerarPdf(cid)`; actualizar `pdfStatus`/re-fetch entrega; mensaje éxito/error controlado; **NO** rotar token; **NO** mostrar URL completa post-regen en UI si hay riesgo D0 (paridad P18: omitir leak).
4. **PDF download** — conservar navigate folio `?descargar=1` (no volver a Blob TCPDF).
5. **Spec target** — **`admin-certificate-delivery-frontend`** (MODIFIED REQ-DEL-005 + honesty/409; MODIFIED REQ-DEL-008 alinear a folio). **No** primary-target `admin-certifications-frontend` (cubre list/preview/pdf/nueva; entrega tiene capability propia).
6. **Hard locks** — D0 permanente; no P19 rewrite; no P21; leave P19 archive alone; front-only unless 409 mapping broken.

### Defaults locked (para propose)

1. Alcance = **enfoque 1** (page + tests + delta delivery-frontend) — **sí**.
2. Spec target = **`admin-certificate-delivery-frontend`** — **sí**.
3. **No** primary-target `admin-certifications-frontend` — **sí**.
4. Honesty sin raw `Error.message` en cargar/QR/PDF/regen — **sí**.
5. `errorRecuperable` **solo** load hard de detalle (no para 409 TOKEN) — **sí** (recomendado).
6. `Promise.allSettled` + mensaje 409 operable bedelía — **sí**.
7. Wire `regenerarPdf` sin rotación de token — **sí**.
8. Descargar PDF = navigate folio `?descargar=1` (alinear REQ-DEL-008) — **sí**.
9. No P19 archive / P19 rewrite / P21 / backend salvo mapping roto — **sí (hard lock)**.
10. Copy bedelía: permanencia QR + 409 sin jargon de claves en UI (evitar `token_cipher_key` crudo; orientar a sistemas) — **sí**.

### Questions (para propose)

1. Confirmar defaults 1–10 (recomendado: aceptar todos).
2. ¿Texto 409? Propuesta: *«No se pudo recuperar el enlace de validación de este certificado. El QR no se regenera solo; contactá a sistemas.»* — **sí**.
3. ¿Load hard fijo? *«No se pudo cargar la certificación.»* + Reintentar si recuperable — **sí**.
4. ¿Post-regen refrescar `obtenerEntregaManual` o solo mutar `pdfStatus` local? (**recomendado: re-fetch entrega**).
5. ¿HTTP solo si tests/staging demuestran que `HttpErrorResponse` no trae `status`/`error.code`? (**sí — gate explícito**).

### Risks

- Test QR hoy **exige** raw message → hay que reescribir asserts anti-raw.
- Confundir 409 TOKEN con hard load → bedelía no ve ficha (mitigar con `allSettled`).
- Regenerar y mostrar `publicValidationUrl` completa en toast (leak D0) — omitir o truncar.
- Tocar archive P19 / folio por “arreglar” REQ-DEL-008 con Blob API — **bloqueado**; alinear spec al folio.
- Backend `regenerarPdf` devuelve `pdfStatus: 'vigente'` (interno) vs DTO entrega `'valid'|'outdated'` — mapear al refrescar entrega.

### Ready for Proposal

**Yes** — orchestrator puede lanzar `sdd-propose` con defaults locked arriba; spec target `admin-certificate-delivery-frontend`; front-only quirúrgico.
