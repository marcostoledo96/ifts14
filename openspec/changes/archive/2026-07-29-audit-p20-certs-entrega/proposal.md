# Proposal: audit-p20-certs-entrega

## Intent

Close P20 on `/admin/certificaciones/:id/entrega`: operable `409 TOKEN_NOT_RECOVERABLE`, honesty without raw `Error.message`, real PDF regen (no token rotation), REQ-DEL-008 aligned to folio navigate. No P19 archive/rewrite, no P21, no backend unless 409 mapping proven broken.

## Scope

### In Scope
- Front-only: `certification-delivery-page.{ts,html,css,spec.ts}`
- `allSettled`: detalle **hard**; entrega **soft** + operable 409 bedelía panel (parity preview)
- Honesty: `errorRecuperable` load-only on detalle hard; not-found **sin** Reintentar; `mensajeErrorApi` P15-strict for QR/PDF/regen
- Wire `regenerarPdf` (no token rotation); omit full `publicValidationUrl` post-regen (D0)
- PDF = folio `?descargar=1`; handle `navigate=false`
- Delta `admin-certificate-delivery-frontend` (REQ-DEL-005/008 + honesty/409)

### Out of Scope
- P19 archive/folio rewrite; P21; primary `admin-certifications-frontend`
- HTTP/backend unless 409 envelope missing; SMTP; commit

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-certificate-delivery-frontend`: MODIFIED REQ-DEL-005 (wire `regenerarPdf`); MODIFIED REQ-DEL-008 (folio navigate); ADDED honesty/409 scenarios

## Approach

1. `allSettled`: detalle reject → fixed es-AR + Reintentar iff recoverable; 404 → no Reintentar. Entrega 409/`TOKEN_NOT_RECOVERABLE` → bedelía copy, ficha stays, Copiar/QR off, no retry.
2. QR/PDF/regen errors via `mensajeErrorApi` only.
3. `volverARegenerarPdf` → API → re-fetch entrega; no URL leak.
4. Keep folio PDF handoff; `navigate=false` skips location, asserts URL in tests.
5. Update stub/raw-expecting tests.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `delivery/certification-delivery-page.ts` | Modified | allSettled, honesty, regen, PDF nav |
| `delivery/certification-delivery-page.html` | Modified | 409 panel; gated Reintentar |
| `delivery/certification-delivery-page.spec.ts` | Modified | anti-raw; 409; regen; navigate=false |
| `admin-certificate-delivery-frontend/spec.md` | Modified | delta 005/008 + honesty |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tests assert raw/stub | High | Rewrite asserts |
| 409 as hard load | Med | Soft entrega path |
| Post-regen URL leak | Med | Omit full URL (D0) |
| Missing 409 fields | Low | HTTP only if proven |

## Rollback Plan

Revert delivery-page + spec delta on branch; no schema/deploy.

## Dependencies

Explore defaults 1–10 locked; P18/preview honesty; existing `regenerarPdf` seam.

## Success Criteria

- [ ] 409 soft: ficha + bedelía message; CTAs off; no Reintentar
- [ ] Detalle hard: fixed msg; Reintentar only if recoverable; not-found without
- [ ] No raw `Error.message`; QR/PDF/regen use `mensajeErrorApi`
- [ ] Regen via API; no token rotation; no full URL leak
- [ ] PDF folio `?descargar=1` + `navigate=false` covered
- [ ] Spec delta delivery-frontend only; P19/P21/backend untouched

## Proposal question round

LOCK accepted. Assumed: explore 409/load copy; post-regen re-fetch entrega; HTTP only if mapping broken.
