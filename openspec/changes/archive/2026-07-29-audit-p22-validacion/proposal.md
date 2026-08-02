# Proposal: audit-p22-validacion

## Intent

Close P22 audit on public `/validar/:token`: document staging revoked→404 unified as accepted contract (not a front bug), keep existing honesty (no raw `Error.message` / no stack/PII), polish folio dates to `dd/mm/yyyy` es-AR, and land a lean delta on `frontend-public-validation`. Front-only; leave P21 alone; D0 unchanged.

## Scope

### In Scope
- Lean front-only on `PublicValidationPage` + validation service/mapper path (read/polish only as needed)
- Document/accept staging revoked→`404 CERTIFICATE_NOT_FOUND` unified; chrome REVOCADO remains correct when `CERTIFICATE_REVOKED` arrives (mock)
- Preserve honesty: fixed technical copy; mapper/service without raw `Error.message`; no stack/routes/`/api/` in UI
- Polish folio dates (`issuedAt` / `attendedDates`) → `dd/mm/yyyy` es-AR (parity `muestra_pagina`)
- Regression tests: válida, revocada (mock), no-encontrada, técnico anti-leak, D0 DNI completo, date format
- Delta `frontend-public-validation`: staging unified note + date format; anti-leak already covered

### Out of Scope (locked non-goals)
- PHP unlock / emit `CERTIFICATE_REVOKED` from verify (no primary-target `backend-validacion-publica-certificados`)
- `RATE_LIMITED` dedicated copy/mapping (defer; generic technical OK)
- P21 archive / `certification-revoke-page` rewrite; token/QR rotate (D0)
- Admin `mensajeErrorApi` / `errorRecuperable` retrofit on public page
- Commit

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-public-validation`: **MODIFIED/ADDED** — accept staging revoked≡no-encontrada (backend unified); folio dates display `dd/mm/yyyy` es-AR; keep REVOCADO chrome on explicit code; preserve technical honesty + D0 DNI completo + Reintentar on técnico/no-encontrada. (**Not** `backend-validacion-publica-certificados`.)

## Approach

1. Spec/PLAN: close «válida vs revocada» as (a) válida OK, (b) REVOCADO when code present, (c) staging collapse documented — not a P22 front defect.
2. Page helper (or small shared formatter): format folio dates es-AR; update asserts that expect raw ISO.
3. Do not touch `result-mapper` for `RATE_LIMITED` (deferred).
4. Keep Reintentar on no-encontrada + técnico (muestra parity).
5. Verify anti-raw / anti-stack / no token in DOM / DNI completo on válida.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `public-validation/public-validation-page.{ts,html,spec.ts}` | Modified | date format; regression asserts |
| `shared/certificates/result-mapper.ts` | Untouched | RATE_LIMITED deferred |
| `frontend-public-validation/spec.md` | Modified | unified staging + dates |
| `docs/qa/PLAN-…` P22 | Modified | checkboxes at apply/archive |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Humans expect REVOCADO on real QR (P21 copy) | Med | Document unified gate in PLAN/spec |
| Date format breaks ISO string asserts | High | Update page specs with es-AR fixtures |
| Scope creep into PHP revoked chrome | Med | Hard lock: no backend unlock |
| Touching mapper for rate-limit | Low | Deferred |

## Rollback Plan

Revert page + frontend-public-validation delta on branch; no schema/deploy/PHP.

## Dependencies

Explore locks 1–7+10; optional fechas=yes; RATE_LIMITED=defer; existing ValidationService/mapper honesty; `muestra_pagina` date display.

## Success Criteria

- [ ] Checklist: válida OK; REVOCADO on mock code; staging unified documented (no PHP fix)
- [ ] Folio dates `dd/mm/yyyy` es-AR; tests updated
- [ ] No raw Error.message / stack / token / PII in UI (regression green)
- [ ] Spec delta only on `frontend-public-validation`
- [ ] P21/backend/D0 rotate/`RATE_LIMITED` untouched; no commit

## Proposal question round

LOCK accepted from explore + orchestrator. Assumed: Approach 1; fechas polish in-cycle; RATE_LIMITED defer; no backend overturn for revoked chrome.
