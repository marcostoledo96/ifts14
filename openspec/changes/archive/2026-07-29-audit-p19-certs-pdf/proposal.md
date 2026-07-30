# Proposal: Auditoría P19 — Folio PDF

## Intent

Cerrar §P19 en `/admin/certificaciones/:id/pdf`: visual OK, pero `Error.message` crudo en `load`/`descargarPdf` y drift spec (P-13 API vs html2canvas / `REQ-PAR-PDF-001`).

## Scope

### In Scope

- Cirugía en `certification-pdf-preview-page.{ts,html,css,spec.ts}` + delta spec.
- Honesty: load fijo es-AR (*«No se pudo cargar la certificación.»* + id inválido existente); descarga vía `mensajeErrorApi`/genérico; **sin** raw `Error.message`.
- **`errorRecuperable` solo load hard** + **Reintentar** → `load()` (paridad P18). **Override explore** default 5 (no flag): locked aquí.
- Not-found / id inválido: **sin** Reintentar. Fallo descarga: sin Reintentar.
- Filename: preferir `detalle.numero` si fácil; conservar print A4 1 pág, firmas 3:2, QR canónico, pie sin disclaimers, revocado.

### Out of Scope

- Archive/rewrite P18; P20 entrega; P21 revoke; HTTP/backend/`certificate-pdf-qr-generation`.
- Rotación token/QR; cablear `certificateText` al folio; commit/push; rewrite html2canvas salvo bug real.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-certifications-frontend`: MODIFIED «Paridad visual, folio imprimible y evidencia de verificación» — **Descargar = html2canvas+jsPDF folio** (NO blob API); Imprimir = `window.print()` A4; honesty + `errorRecuperable` load-only; QR canónico sin rotar; filename semántico.

## Approach

Enfoque 1 (quirúrgico), locks propose:

1. Solo page + tests + delta.
2. Load hard recuperable → mensaje fijo + `errorRecuperable=true` + Reintentar; not-found sin Reintentar.
3. `descargarPdf` catch → mensaje envelope/genérico; sin Reintentar; sin seam `CertificationsService.descargarPdf`.
4. Delta reemplaza escenario P-13 API por captura folio; conserva print/QR/revocado/anti-token.
5. Verify visual/perf (1 pág, 3:2, html2canvas); no reabrir CSS salvo evidencia.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.../pdf/certification-pdf-preview-page.ts` | Modified | Honesty; `errorRecuperable`; filename |
| `.../pdf/certification-pdf-preview-page.html` | Modified | Reintentar load-only |
| `.../pdf/certification-pdf-preview-page.css` | Touch-only-if | Overflow/firmas si verify falla |
| `.../pdf/certification-pdf-preview-page.spec.ts` | Modified | Anti-raw; Reintentar; conservar REQ-PAR-PDF-001 |
| `openspec/.../admin-certifications-frontend` | Modified | Delta «Paridad visual…» |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Spec P-13 fuerza HTTP | High | Delta = html2canvas |
| Flag confunde soft QR | Med | Solo load hard |
| Tocar P18 archive / P20–P21 | Med | Hard lock; no commit |
| Bajar `scale` a ciegas | Low | No optimizar sin evidencia |

## Rollback Plan

Revertir solo `certification-pdf-preview-page.*` y el delta de spec.

## Dependencies

- Explore `audit-p19-certs-pdf` (defaults 1–10; **override** flag/`errorRecuperable`).
- Paridad honesty P18 (`errorRecuperable` load-only).

## Success Criteria

- [ ] Sin raw `Error.message` en load/descarga.
- [ ] Reintentar solo load hard recuperable; not-found sin Reintentar; descarga sin Reintentar.
- [ ] Spec Descargar = html2canvas folio (no API); print/QR/revocado/anti-token OK.
- [ ] Filename semántico; tests verdes; hard locks OK; sin commit.
