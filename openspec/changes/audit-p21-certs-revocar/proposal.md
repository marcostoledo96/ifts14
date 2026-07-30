# Proposal: audit-p21-certs-revocar

## Intent

Close P21 on `/admin/certificaciones/:id/revocar`: honesty without raw `Error.message`, load-only `errorRecuperable` + Reintentar, submit errors inline via `mensajeErrorApi` P15-strict, `MOTIVO_MAX` 180. Keep confirmation/copy/sanitize. No P20 rewrite, no P22, no backend unless PII audit gap proven.

## Scope

### In Scope
- Front-only surgical: `certification-revoke-page.{ts,html,css,spec.ts}`
- Load hard: fixed es-AR (*«No se pudo cargar la certificación.»*); `errorRecuperable` + Reintentar only if recoverable; not-found without Reintentar; no raw `Error.message`
- Submit: `mensajeErrorApi` P15-strict (envelope or *«No se pudo revocar la certificación.»*); inline in dialog; separate from load overlay; **no** `errorRecuperable` on POST
- Align `MOTIVO_MAX` → **180** (backend parity); keep confirmation, consequences copy, motivo sanitize
- Delta `admin-certifications-frontend`: **ADDED** revoke-dialog honesty + gates (confirm already tested)

### Out of Scope (locked non-goals)
- `?revocada=1` flash on preview (defer; post-nav `revocado` re-fetch suffices)
- P20 archive / delivery rewrite; P22 public validation
- Primary-target `admin-certificate-revocation` / PHP `revocar` unless staging proves DNI/token in `cert_eventos_auditoria`
- Commit

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-certifications-frontend`: **ADDED** revoke UI at `…/:id/revocar` — load honesty + Reintentar gated; submit inline `mensajeErrorApi`; keep confirm/copy/sanitize; MOTIVO_MAX 180. (**Not** `admin-certificate-revocation` — API already covered.)

## Approach

1. Split signals: load `error` / `errorRecuperable` vs submit `errorAccion` (inline).
2. `cargar`: fixed load messages; Reintentar only if recoverable; no raw.
3. `onRevocar`: sanitize → `certs.revocar` → navigate `?revocada=1`; catch → `mensajeErrorApi` inline.
4. Cap motivo maxlength/validator at 180; preserve checkbox + consequences banner.
5. Spec delta only on `admin-certifications-frontend`; update anti-raw / load-retry / inline-submit tests.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `revoke/certification-revoke-page.ts` | Modified | honesty, signal split, MOTIVO_MAX 180 |
| `revoke/certification-revoke-page.html` | Modified | gated Reintentar; inline submit error |
| `revoke/certification-revoke-page.spec.ts` | Modified | anti-raw; load; inline submit; max 180 |
| `admin-certifications-frontend/spec.md` | Modified | ADDED revoke dialog honesty |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Tests assume shared `error` overlay | High | Split signals; rewrite asserts |
| maxlength 180 breaks long-text test | Low | No assert on 400 today |
| Flash preview expands blast radius | Med | Deferred (locked) |
| Touching API spec “for completeness” | Med | Hard lock: frontend delta only |

## Rollback Plan

Revert revoke-page + frontend spec delta on branch; no schema/deploy.

## Dependencies

Explore defaults 1–8+10 locked; P15 `mensajeErrorApi`; P18/P20 load honesty pattern; existing `certs.revocar` seam.

## Success Criteria

- [ ] Load: fixed msg; Reintentar only if recoverable; not-found without; no raw
- [ ] Submit: inline `mensajeErrorApi`; dialog stays; no load overlay reuse
- [ ] Confirmación + copy + sanitize unchanged; MOTIVO_MAX 180
- [ ] Spec ADDED on `admin-certifications-frontend` only
- [ ] P20/P22/backend/flash untouched; no commit

## Proposal question round

LOCK accepted from explore + orchestrator. Assumed: load/submit copy strings above; flash deferred; HTTP only if PII audit leak proven.
