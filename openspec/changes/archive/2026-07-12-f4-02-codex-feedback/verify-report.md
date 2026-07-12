```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:e4fdae6106bb22a4aa96509922b3151473b704571cf0813678025d5d9e96fc2e
verdict: pass
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 6/6
test_command: node --test openspec/changes/f4-02-codex-feedback/evidence/print-app-check.identity.spec.mjs && npm run test:ci -- --include='**/certifications/**/*.spec.ts' && npm run test:ci && node openspec/changes/f4-02-codex-feedback/evidence/print-app-check.mjs openspec/changes/f4-02-codex-feedback/evidence/app-pdf
test_exit_code: 0
test_output_hash: sha256:9f364d2a7fec2aa99f58e8fcd96477de89c3a49dee0680bc3a3e6a762281c376
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:26beddf2485d06101e8ea9c7423e49f3bd0bb4f0d55506030877a5d505dca8c3
```

## Verification Report

**Change**: `f4-02-codex-feedback`  
**Version**: N/A  
**Mode**: Standard  
**Review receipt supplied for this run**: `review-1decdde4657255af`

### Completeness

| Metric | Value |
|---|---:|
| Tasks total | 22 |
| Tasks complete | 21 |
| Tasks incomplete | 1 |
| Pending task | 7.4 `sdd-archive` — intentionally excluded from verify |

The Phase 7 verification/evidence tasks 7.1–7.3 were completed by this run. The archive task remains unchecked as requested and does not represent incomplete implementation.

### Build & Tests Execution

| Check | Command | Exit | Result | Output hash |
|---|---|---:|---|---|
| Identity regression | `node --test openspec/changes/f4-02-codex-feedback/evidence/print-app-check.identity.spec.mjs` | 0 | 1/1 PASS | `sha256:5640efd73b0763ff5ab8dc8686350953290d65d15bb584b663f1f070c6d66d41` |
| Focused certifications | `npm run test:ci -- --include='**/certifications/**/*.spec.ts'` | 0 | 128/128 SUCCESS | `sha256:a29d4ddea65a748b07fb8923d759a13f41625a9b71488b820a3f9eafaf57c79c` |
| Full frontend | `npm run test:ci` | 0 | 478/478 SUCCESS | `sha256:9d80d6505da69dd1c545abd5f54b0cb7bd10a2668af6b44e662d9b7df7af9619` |
| App-real checker | `node openspec/changes/f4-02-codex-feedback/evidence/print-app-check.mjs openspec/changes/f4-02-codex-feedback/evidence/app-pdf` | 0 | 4/4 PASS | `sha256:bf378a3ccfe8f1d7f281f999a05a9d746de493c3787a97e7a132a145e32906d9` |
| Angular build | `npm run build` | 0 | PASS | `sha256:26beddf2485d06101e8ea9c7423e49f3bd0bb4f0d55506030877a5d505dca8c3` |
| Diff hygiene | `git diff --check` | 0 | PASS | N/A |

**Coverage**: not configured; runtime compliance is established by focused/full Karma tests, the Node identity regression and the app-real Chromium/CDP checker.

Build warnings are limited to existing component-style warning thresholds: PDF preview 13.70 kB and certification preview 14.31 kB, both below the 16 kB error ceiling.

### App-real Evidence: ids 1/3/4/5

| id | State | Expected identity | Exact dates | State mark/band | PDF |
|---:|---|---|---|---|---|
| 1 | vigente | `IFTS14-CERT-0001` / Alumno Demo Uno / Curso de introducción a la gestión | `2026-03-02`, `2026-03-09`, `2026-03-16` | Clean: no mark or band | 1 page, A4 landscape, hash `f94385f8…` |
| 3 | borrador | `IFTS14-CERT-0003` / Alumno Demo Tres / Curso de prácticas documentales | `2026-05-04` | `BORRADOR` plus textual band | 1 page, A4 landscape, hash `42eb2734…` |
| 4 | vencido | `IFTS14-CERT-0004` / Alumno Demo Cuatro / Curso de procedimientos básicos | `2025-09-01`, `2025-09-08` | `VENCIDO` plus textual band | 1 page, A4 landscape, hash `15210722…` |
| 5 | revocado | `IFTS14-CERT-0005` / Alumno Demo Cinco / Curso de registros y archivo | `2025-06-10` | `REVOCADO` plus textual band | 1 page, A4 landscape, hash `67e1457b…` |

`pdfinfo` reported `841.92 × 594.96 pt (A4)` and exactly one page for every generated PDF. The checker also passed no-clipping, `overflow: visible`, no admin chrome, no “dictado entre”, and privacy checks for complete DNI, UUID/token-like identifiers, email, legajo and matrícula.

### Identity / Stale-folio Safety

The checker does not accept generic folio existence. For every route transition it waits until the folio contains the seed-derived certificate number, student and course and the loading indicator is absent. It reasserts identity, expected dates and state immediately before `Page.printToPDF`. The dedicated regression proves that the preceding case identity cannot satisfy the next case, so the previous false-pass path is covered at runtime.

### Visual Evidence

Desktop (1280×800), mobile (390×844) and print-media captures were generated for all four states under `evidence/{vigente,borrador,vencido,revocado}-{desktop,mobile,print}.png`. Inspection confirmed readable hierarchy, responsive stacking, exact dates, correct state treatments and print chrome removal. Chromium reported no console warnings or errors during capture.

### Spec Compliance Matrix

| Requirement | Scenario | Runtime evidence | Result |
|---|---|---|---|
| Paridad visual, folio imprimible y evidencia | Paridad visual de la vista imprimible | 12 active-change desktop/mobile/print captures; focused component tests | ✅ COMPLIANT |
| Same | Fechas asistidas exactas en el folio | Component specs + app-real ids 1/3/4/5 + extracted PDF text | ✅ COMPLIANT |
| Same | Identificación de estados no vigentes | Component specs + app-real mark/band assertions for vigente/borrador/vencido/revocado | ✅ COMPLIANT |
| Same | Impresión nativa segura | Component print tests + Chromium `Page.printToPDF`; 1 A4 each; no chrome | ✅ COMPLIANT |
| Same | Checker de aplicación real por estado | App-real checker 4/4 PASS, privacy/layout/identity assertions | ✅ COMPLIANT |
| Same | Evidencia de checks en verify | This report, command hashes, PDFs, hashes and 12 captures | ✅ COMPLIANT |

**Compliance summary**: 6/6 scenarios compliant.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|---|---|---|
| Exact `attendedDates` | ✅ Implemented | Template iterates the array; helper preserves ISO input; no period summary. |
| Non-current state presentation | ✅ Implemented | Local computed presentation returns null for `vigente` and one base mark/band model for the other states. |
| Native printing remains available | ✅ Implemented | `imprimir()` retains guarded `window.print()` with no state restriction. |
| Privacy boundary | ✅ Implemented | Focused checks and app-real PDF text checks passed for ids 1/3/4/5. |

### Coherence (Design)

| Decision | Followed? | Notes |
|---|---|---|
| Local helpers; no new abstraction | ✅ Yes | Helper and computed state remain page-local. |
| Compact exact-date list | ✅ Yes | All ISO dates render and remain within one A4. |
| Shared state CSS with modifiers | ✅ Yes | Borrador/vencido/revocado share geometry and vary presentation. |
| Active checker; archived evidence immutable | ✅ Yes | Checker and evidence live under the active change. |
| No DTO/backend/routes/dependencies changes | ✅ Yes | Verification found no need for product edits. |

### Issues Found

**CRITICAL**: None.  
**WARNING**:
- The task artifact's shorthand focused glob `**/certifications/**` also selects HTML files and fails Angular's test bundler. Verification used the intended spec-only glob `**/certifications/**/*.spec.ts`; no product defect is involved.
- Two CSS budget warnings remain below the configured 16 kB error limit.

**SUGGESTION**: Correct the shorthand focused command during archive documentation sync.

### Verdict

**PASS WITH WARNINGS**

All 1 requirement and 6 scenarios have current passing runtime evidence. The stale-folio false-pass is closed by seed-derived identity checks before PDF generation. Only the explicitly deferred archive task remains pending.
