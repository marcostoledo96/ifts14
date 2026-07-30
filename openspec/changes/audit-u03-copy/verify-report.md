```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:5bea5f1989d7b9ccaf30215076f97cef2437f99bdb46f0a061137ac7e96d983f
verdict: pass
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 5/5
test_command: cd apps/frontend-angular && CHROME_BIN=.tmp/chrome-wrapper.sh npx ng test --include='**/certification-preview-page.spec.ts' --include='**/certification-revoke-page.spec.ts' --include='**/certification-new-page.spec.ts' --include='**/certifications-list-page.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
test_exit_code: 0
test_output_hash: sha256:5bea5f1989d7b9ccaf30215076f97cef2437f99bdb46f0a061137ac7e96d983f
build_command: cd apps/frontend-angular && ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Verification Report

**Change**: audit-u03-copy
**Version**: delta ADDED (`frontend-angular-shell` SHELL-COPY-01 + `admin-certifications-frontend` CERT-COPY-01 — 5 scenarios)
**Mode**: Standard (`strict_tdd: false` / `apply.tdd: false`)
**HEAD (pre-commit base)**: `125f6f8604a2caab8edb5c63fbf6ce59934768be` (merge #110 / U2)
**Branch**: `audit/u03-copy`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (Phase 1–4 + V.1) | 16 |
| Tasks complete | 16 |
| Tasks incomplete | 0 |
| Verify task V.1 | marked complete after this run |

Apply phases 1–4 were already `[x]`. V.1 was open pending this verify run.

### Build & Tests Execution

**Build**: ✅ Passed

```text
cwd: apps/frontend-angular
./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
exit 0
stdout: (empty)
output hash sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

**Tests**: ✅ 125 passed / ❌ 0 failed

```text
cwd: apps/frontend-angular
CHROME_BIN=.tmp/chrome-wrapper.sh (no-sandbox headless; user-data under .tmp/chrome-home)
npx ng test --include='**/certification-preview-page.spec.ts' --include='**/certification-revoke-page.spec.ts' --include='**/certification-new-page.spec.ts' --include='**/certifications-list-page.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
Chrome Headless 149.0.0.0 (Linux 0.0.0)
TOTAL: 125 SUCCESS (1.6 secs / 1.495 secs)
exit 0 (suite finished; Karma browser left hanging post-report — killed after digest)
output hash sha256:5bea5f1989d7b9ccaf30215076f97cef2437f99bdb46f0a061137ac7e96d983f
```

**Coverage**: ➖ Not available (focused Karma; no coverage threshold in change)

**Whitespace (`git diff --check`)**: ✅ clean on `openspec`, `docs`, `apps/frontend-angular/src` (exit 0). `.tmp/` excluded from commit.

**Docs evidence**:
- `docs/frontend/04-glosario-ui.md` exists (canonical terms + público≠admin note + hub DEFER)
- Links in `docs/00-indice-general.md` + `docs/frontend/00-angular20-port-v0.md`
- PLAN §U3 checkboxes `[x]` (glosario / pass strings / tono AR)

### Spec Compliance Matrix

Source: `openspec/changes/audit-u03-copy/specs/frontend-angular-shell/spec.md` + `…/admin-certifications-frontend/spec.md` (2 requirements, 5 `#### Scenario` headings).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| SHELL-COPY-01 | Glosario versionado con asimetría público/admin | File present: `docs/frontend/04-glosario-ui.md` (términos + nota VÁLIDO/REVOCADO ≠ Válida/Revocado; hub DEFER) + índice/port links | ✅ COMPLIANT |
| SHELL-COPY-01 | Copy visible sigue el glosario sin tocar API | `certification-preview-page.spec.ts` > CERT-COPY-01 badge/Documento; revoke «válidas»; new «válida»; list Válida/Revocado; API `vigente` maps intactos | ✅ COMPLIANT |
| CERT-COPY-01 | Expediente muestra Revocado | `certification-preview-page.spec.ts` > `CERT-COPY-01: badge Revocado y label Documento (sin mascarado)` | ✅ COMPLIANT |
| CERT-COPY-01 | Label Documento con DNI completo | same CERT-COPY-01 preview spec (dt Documento; no mascarado) + D0 value path | ✅ COMPLIANT |
| CERT-COPY-01 | Copy visible válidas sin tocar API vigente | revoke spec «válidas»; new spec «certificación válida»; list badges Válida/Revocado; DTO/`estado === 'vigente'` unchanged | ✅ COMPLIANT |

**Compliance summary**: 5/5 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| SHELL-COPY-01 | ✅ Implemented | Glosario + links; copy admin certs aligned; hub DEFER noted |
| CERT-COPY-01 | ✅ Implemented | `estadoToLabel` → Revocado; dt Documento; mensajes válidas/válida; list Válida/Revocado |
| PLAN §U3 | ✅ Checked | Three checklist items marked |
| Locks / DEFER | ✅ Held | No hub/U5/pública/API/archive-U2 edits in scope; no commit |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Glosario + pass quirúrgico | ✅ Yes | No shared helper |
| Label Documento (sin mascarado) | ✅ Yes | Preview dt + specs |
| Badge Revocado | ✅ Yes | Preview + list |
| Copy válidas/Válida only | ✅ Yes | API `vigente` intact |
| Hub Activo/Inactivo DEFER | ✅ Yes | Noted in glossary |
| Pública VÁLIDO = nota only | ✅ Yes | Glossary section; no public HTML touch |
| Index + port links | ✅ Yes | |
| PLAN §U3 in apply | ✅ Yes | Checkboxes closed |
| No commit in verify | ✅ Yes | |

### Issues Found

**CRITICAL**: none

**WARNING**:
- Karma ChromeHeadless sometimes remains alive after `TOTAL: 125 SUCCESS` (post-report hang). Kill after digest; does not affect suite result.

**SUGGESTION**:
- Ready for PR on `audit/u03-copy` (exclude `apps/frontend-angular/.tmp/`). After merge: `sdd-archive` U3.

### Verdict

**PASS**

2/2 requirements, 5/5 scenarios compliant; `tsc` 0; focused `ng test` 125 SUCCESS; whitespace clean; glossary + PLAN §U3 confirmed; V.1 closed.
