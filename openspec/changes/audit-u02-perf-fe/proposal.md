# Proposal: Surgical FE performance for U2 (dedupe hub, defer PDF deps)

## Intent

Close PLAN §U2 FE perf without API/UX redesign: defer html2canvas/jspdf until PDF download; coalesce `listarHub`; optional in-session firma/config reuse; document client-filter list scale limits.

## Scope

### In Scope
- Dynamic `import()` of `html2canvas-pro` + `jspdf` only in PDF download path
- In-flight / short-TTL coalesce for `listarHub`; invalidate on `marcar`/`anular`
- Optional session Map cache for `previewFirma` / `obtener` (invalidate on upload/delete)
- Document client-filter scale (hundreds OK; thousands → later API) in PLAN §U2/`docs/frontend`
- Lean ADDED specs only

### Out of Scope
- Server pagination; slim hub API; PHP `Cache-Control` on firmas
- Shared preview↔PDF store; dashboard metrics; `qrcode` defer; workers; CI bundle report
- D0; U1 archive; UX redesign; honesty rewrite; API model redesign; commits

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-http-services`: ADDED — `listarHub` MUST coalesce in-flight (MAY short-TTL); invalidate after attendance mutations. OPTIONAL ADDED — session cache `previewFirma` / coalesce `obtener` with invalidate on firma mutate. MUST NOT change HTTP semantics or Cache-Control.
- `admin-certifications-frontend`: ADDED — `html2canvas-pro`/`jspdf` MUST NOT load until download. Download/filename/D0 unchanged.

## Approach

Explore Approach 1: reuse Promise-Map coalesce; dynamic PDF imports on download; docs for list scale. Firmas cache only if diff stays small.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `certification-pdf-preview-page.ts` | Modified | Dynamic import PDF deps |
| `http-attendance.service.ts` | Modified | Coalesce + invalidate `listarHub` |
| `http-institutional-config.service.ts` | Optional | Session cache firmas/config |
| PLAN §U2 / `docs/frontend` | Modified | Scale note |
| `frontend-http-services`, `admin-certifications-frontend` | Delta ADDED | Coalesce / deferred PDF deps |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Stale hub/firma after mutate | Med | Invalidate coalesce/cache on mutations |
| Specs assume sync PDF imports | Low | Async download path |
| Diff >400 lines | Low | Hub+PDF+doc first |

## Rollback Plan

Revert FE commits and delta specs. No DB/API/migrations.

## Dependencies

Explore locks; existing attendance coalesce patterns. No backend deploy.

## Success Criteria

- [ ] PDF open does not load html2canvas/jspdf until download
- [ ] Hub→course-dates ≤1 in-flight hub GET; mutations refresh `listarHub`
- [ ] Scale limit documented; U2 FE closable without API redesign
- [ ] Front-only small diff; hard locks held; no commit this phase

## Proposal question round

**Locked**: firmas cache optional first slice; list scale = docs only; PDF deferral = download action.

1. Is “hundreds OK / thousands later” the right PLAN threshold?
2. Firmas cache required for U2 closeout, or nice-to-have after hub+PDF?
3. Hub main-thread re-index a U2 must-fix, or deferred with slim-API?
