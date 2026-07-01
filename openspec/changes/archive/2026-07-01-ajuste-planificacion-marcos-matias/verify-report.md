## Verification Report

**Change**: `ajuste-planificacion-marcos-matias`  
**Project**: `ifts14`  
**Branch**: `docs/ajuste-planificacion-marcos-matias`  
**Mode**: Standard, documentation-only verification after corrective DNI docs apply  
**Date**: 2026-07-01  
**Verdict**: PASS WITH WARNINGS

### Scope verified

- Read project instructions and minimum docs: `AGENTS.md`, `README.md`, `GUIA.md`, `docs/00-indice-general.md`, and `docs/opencode/optimizacion-tokens.md`.
- Read SDD artifacts under `openspec/changes/ajuste-planificacion-marcos-matias/`: `proposal.md`, `exploration.md`, `design.md`, `tasks.md`, `apply-progress.md`, previous `verify-report.md`, and all 8 delta specs.
- Re-checked the previous blockers plus adjacent corrected references in live docs/prompts.
- Verified this cycle remains documentation/planning + `muestra_pagina/` reference only; no product code was edited or staged by verify.

### Completeness

| Metric | Value | Notes |
|---|---:|---|
| Tasks total | 35 | Counted from `tasks.md` checkboxes. |
| Tasks complete before this report | 34 | All implementation/corrective tasks are checked. |
| Tasks incomplete in `tasks.md` | 1 | `8.7 verify-report.md` remains unchecked because verify was instructed not to edit files except this report. This report satisfies the artifact, but `tasks.md` itself was not modified. |
| Delta specs read | 8/8 | All files under `openspec/changes/ajuste-planificacion-marcos-matias/specs/*/spec.md`. |
| Previous critical blockers | 2/2 resolved | Matías prompt and frontend DTO doc no longer contain the stale public masked-DNI guidance as active instruction. |

### Build, tests, and coverage evidence

Application build/test/coverage is **not applicable** for this re-verify because the change is documentation/planning + v0 reference only, and no product code under `apps/`, controlled SQL, deploy package, `public_html`, `vendor/`, private material, or `.codegraph/` is changed.

| Check | Command / tool | Result |
|---|---|---|
| Branch and working-tree inventory | `rtk git branch --show-current && rtk git status --short --untracked-files=all` | PASS: branch is `docs/ajuste-planificacion-marcos-matias`; changed/untracked paths are docs/prompts/OpenSpec/v0 reference files. |
| Staged files | `rtk git diff --cached --name-only` | PASS: no staged files. |
| Product-code exclusion | `rtk git status --short -- apps/ database/migrations/ database/seeds/ deploy/ public_html/ vendor/ material_privado_no_versionar/ .codegraph/` and `rtk git diff --name-only -- ...` | PASS: no product app code, controlled SQL, deploy package, `public_html`, `vendor/`, private material, or `.codegraph/` changes. |
| Product/forbidden path counts | Python path classification over `git diff --name-only` + untracked files | PASS: `apps/`, `database/migrations/`, `database/seeds/`, `deploy/`, `public_html/`, `vendor/`, `material_privado_no_versionar/`, `.codegraph/` all `0`. |
| Whitespace/diff health | `rtk git diff --check` | PASS: no output. |
| Forbidden path ignore rules | `git check-ignore -v .codegraph/ material_privado_no_versionar/ vendor/ dump.sql error.log .env` | PASS: all checked examples are ignored by `.gitignore`. |
| Local Markdown links | Python validator over changed/untracked `*.md` | PASS: `markdown_files=33`, `checked_links=0`, `missing_links=0`. |
| OpenSpec CLI | `if command -v openspec ...` | SKIPPED/BLOCKED: `openspec CLI unavailable`. Manual source verification and executable scans were performed instead. |
| Residual stale-DNI scan in live docs/prompts | Python scan over 17 live docs/prompts/reference metadata files | PASS: `fail=0`, `allowed=3`. The only remaining “DNI enmascarado” mentions explicitly say D0 prevails or are v0/audit context. |
| Required D0 terms | Python required-term scan over root/backend/frontend/deploy/v0 docs | PASS: `checked_files=9`, `missing=0`. |
| Canonical specs stale scan | Python scan over `openspec/specs/` selected current specs | WARNING: canonical specs still contain old masked-DNI/token-rotation references; this is expected pending `sdd-archive`. |

### Spec compliance matrix

| Capability / requirement | Scenario focus | Evidence | Result |
|---|---|---|---|
| `backend-contrato-api-certificados` | Public DTO includes full DNI + attended dates; resend preserves token | Delta spec requires `documentNumber`/DNI completo, `attendedDates`, no token/hash/internal data, and resend without normal rotation. Live `docs/backend/01-contrato-api-certificados.md` now documents the same. | ✅ COMPLIANT for changed docs |
| `backend-modelo-datos-certificados` | Permanent hashed token; public full DNI; future course/attendance/config tables | Delta spec and `docs/database/00-mariadb.md` / `docs/database/01-modelo-datos-certificados.md` document permanent token, no plaintext token, D0 full DNI public DTO, audit without full DNI, and future `cert_*` tables. | ✅ COMPLIANT for changed docs |
| `admin-certificate-delivery` | Resend with same token; test/stub email gate | Delta spec and deploy/backend docs document `stub|smtp`, Composer/vendor gate, `503 DELIVERY_NOT_CONFIGURED` when not configured, no real email in stub, and no normal token rotation. | ✅ COMPLIANT for changed docs |
| `deploy-cpanel-certificados` | Composer/vendor, SMTP, staging `/certificados_staging/`, no real deploy | Delta spec and `docs/deploy/00-cpanel-certificados.md` document gates and no cPanel/`public_html` change. | ✅ COMPLIANT |
| `frontend-public-validation` | Public UI/doc guidance shows full DNI and attended dates | `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` now states full DNI public validation at lines 255, 1203, 1388, and table line 1400; line 718 scopes “no full DNI” to outside public validation. | ✅ COMPLIANT for live guidance |
| `frontend-api-readiness` | Frontend DTO models full DNI and attended dates | `docs/frontend/00-angular20-port-v0.md:141` now says `dto.ts` includes complete `documentNumber` and `attendedDates`, without hash/pepper/internal tables. | ✅ COMPLIANT |
| `guia-marcos-ciclos-sdd` | M4 block and Marcos/Matías split | Marcos prompt includes M4-01..M4-07, D0 rules, backend/DB/deploy/security ownership, and Matías UI/UX ownership. | ✅ COMPLIANT |
| `guia-matias-angular-windows` | Matías role, v0 reference, no demo credentials, D0 | Matías prompt and Fase 2 prompt align with D0. Remaining v0 masked-DNI mention says D0 full DNI prevails. | ✅ COMPLIANT |

### Correctness evidence by requested decision

| Requested verification | Status | Evidence |
|---|---|---|
| Previous blocker: Matías prompt stale masked-DNI guidance | ✅ PASS | Previous stale instructions were replaced. Current lines 255, 1203, 1388, and 1400 require full DNI in public validation; line 718 correctly limits no-full-DNI to outside public validation/logs/audit/errors/admin responses. |
| Previous blocker: frontend DTO doc without full DNI | ✅ PASS | `docs/frontend/00-angular20-port-v0.md:141` now documents `documentNumber` complete + `attendedDates`; line 154 says public UI shows full DNI by D0. |
| D0 synchronized in live docs/prompts | ✅ PASS | Root docs, backend/database/frontend/deploy docs, Marcos/Matías prompts, and v0 metadata consistently document QR permanent, full public DNI, attended dates, temporary `X-Admin-Key`, staging, and gates. |
| Canonical OpenSpec specs pending archive | ⚠️ WARNING | `openspec/specs/` still contains old masked-DNI/rotation references in selected current specs. User explicitly scoped this as pending archive, so it is not a verify blocker. |
| No product code touched | ✅ PASS | Git checks show no changes under `apps/`, migrations, seeds, `deploy/`, `public_html/`, `vendor/`, private material, or `.codegraph/`. TSX changes are under `muestra_pagina/`, which is reference-only. |
| `muestra_pagina/` safe as reference only | ✅ PASS | `muestra_pagina/README.md` and `muestra_pagina/AGENTS.md` prohibit compiling/running, literal React/Next porting, dependency installs, and demo credential porting. |
| Demo credentials not to port | ✅ PASS | v0 docs and manifest explicitly mark `login-form.tsx` as mock visual and say product auth remains temporary `X-Admin-Key`; credential literals remain only in the reference export. |
| `.codegraph/` ignored/local-only | ✅ PASS | `.gitignore` includes `.codegraph/`; `git check-ignore` confirms it is ignored; no `.codegraph/` changes are present. |
| No forbidden/private/secret paths | ✅ PASS | Ignore checks and status/path classification show no staged or touched `material_privado_no_versionar/`, dumps, logs, `.env*`, `vendor/`, `public_html`, or `.codegraph/`. |

### Design coherence

| Design decision | Evidence | Result |
|---|---|---|
| Documentation-only change | No product code paths changed; checks over product/forbidden prefixes all returned `0`. | ✅ ALIGNED |
| Root docs summarize, technical docs own details | Root docs carry D0 table; backend/database/frontend/deploy docs carry domain details. | ✅ ALIGNED |
| Deltas OpenSpec capture contract changes before archive | All 8 delta specs exist and were read; canonical specs remain pending archive. | ✅ ALIGNED WITH WARNING |
| `muestra_pagina/` remains visual reference | v0 README/AGENTS/MANIFIESTO prohibit compile, literal porting, dependency installs, and demo credential porting. | ✅ ALIGNED |
| `.codegraph/` out of project artifacts/stage | `.gitignore` and `git check-ignore` confirm local-only metadata. | ✅ ALIGNED |

### Issues

#### CRITICAL

- None.

#### WARNING

1. **Canonical specs still need archive sync.**  
   `openspec/specs/` still contains old masked-DNI/token-rotation references. This is expected before `sdd-archive` and explicitly allowed by the verification request, but archive must sync the accepted deltas.

2. **`tasks.md` still has `8.7 verify-report.md` unchecked.**  
   Verify was instructed not to edit files except this report, so the task checklist itself was not modified. The report artifact now exists and has been updated.

3. **OpenSpec CLI unavailable.**  
   `openspec validate ajuste-planificacion-marcos-matias --strict` could not run because the CLI is unavailable in this environment. Manual source verification and executable scans passed.

#### SUGGESTION

- Run `sdd-archive` next to sync `openspec/specs/` from the verified deltas, then re-run a targeted scan for masked-DNI/token-rotation contradictions in canonical specs.

### Result Contract

**Result**: PASS WITH WARNINGS  
**Reason**: The previous DNI blockers are resolved and live docs/prompts are synchronized with D0. Remaining issues are non-blocking: canonical specs pending archive, the verify-report task checkbox not edited, and unavailable OpenSpec CLI.  
**Commands/results**: see “Build, tests, and coverage evidence”.  
**Risks**: If `sdd-archive` is skipped, canonical `openspec/specs/` will continue to contradict the now-verified D0 docs.  
**Next**: run `sdd-archive` for `ajuste-planificacion-marcos-matias` and sync canonical specs.
