```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:80ce4473429d5ffa3ad7398d675608f04da4170c9788435c34fcde17b6931847
verdict: pass
blockers: 0
critical_findings: 0
requirements: 3/3
scenarios: 9/9
test_command: npx ng test --include='**/certification-revoke-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:af153b9219b57549a64d14309f654b6089298a1d1676a4be9de71104541c325e
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a
```

## Verification Report

**Change**: audit-p21-certs-revocar
**Version**: N/A (delta `admin-certifications-frontend` — 3 ADDED requirements)
**Mode**: Standard
**HEAD**: `1cdb9f8` (uncommitted P21 apply work present)
**Branch**: `audit/p21-certs-revocar`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (Phase 1–5 + Verify) | 24 |
| Tasks complete | 24 |
| Tasks incomplete | 0 |
| Apply tasks (Phase 1–5) | 23/23 |

### Build & Tests Execution

**Build**: ✅ Passed (`tsc --noEmit -p tsconfig.app.json`, cwd `apps/frontend-angular`)

```text
exit 0
output: TypeScript: No errors found
output hash sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a
```

**Tests**: ✅ 17 passed / ❌ 0 failed / ⚠️ 0 skipped

```text
npx ng test --include='**/certification-revoke-page.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 17 SUCCESS
exit 0
output hash sha256:af153b9219b57549a64d14309f654b6089298a1d1676a4be9de71104541c325e
```

**Coverage**: ➖ Not available (focused Karma run; no coverage threshold in change)

### Spec Compliance Matrix

Source: `openspec/changes/audit-p21-certs-revocar/specs/admin-certifications-frontend/spec.md` (3 requirements, 9 scenarios).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Diálogo revocar — honesty de carga | Load recuperable con Reintentar | `certification-revoke-page.spec.ts` > `P21 honesty: raw obtener → mensaje fijo + Reintentar; re-cargar al reintentar` | ✅ COMPLIANT |
| Diálogo revocar — honesty de carga | Not-found sin Reintentar | `…` > `P21 honesty: not-found / id inválido sin Reintentar ni errorRecuperable` (+ `panel de error de carga…` / id `999`) | ✅ COMPLIANT |
| Diálogo revocar — honesty de carga | Load sin raw Error.message | `…` > `P21 honesty: load panel nunca muestra raw Error.message / DNI / token` | ✅ COMPLIANT |
| Diálogo revocar — submit P15-strict y MOTIVO_MAX | Submit inline sin overlay ni raw | `…` > `P21 submit: fallo → errorAccion inline; diálogo vivo; sin overlay load ni raw` (+ envelope path) | ✅ COMPLIANT |
| Diálogo revocar — submit P15-strict y MOTIVO_MAX | Éxito navega expediente | `…` > `debe llamar al servicio y redirigir tras una revocación exitosa` | ✅ COMPLIANT |
| Diálogo revocar — submit P15-strict y MOTIVO_MAX | Motivo acotado a 180 | `…` > `P21 MOTIVO_MAX es 180 (maxlength + slice)` | ✅ COMPLIANT |
| Diálogo revocar — confirmación, copy y sanitize | Confirmación y consecuencias | `…` > `debe requerir la confirmación explícita` + `muestra copy de consecuencias y checkbox de confirmación` | ✅ COMPLIANT |
| Diálogo revocar — confirmación, copy y sanitize | Sanitize motivo antes del POST | `…` > `P21 sanitize: motivo con DNI/token/email se envía con placeholders` | ✅ COMPLIANT |
| Diálogo revocar — confirmación, copy y sanitize | No vigente bloquea form | `…` > `protege el deep link cuando el certificado está revocado` (ids 4 y 5) | ✅ COMPLIANT |

**Compliance summary**: 9/9 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Honesty de carga | ✅ Implemented | `aplicarErrorCarga` + `error` / `errorRecuperable`; fixed msgs; gated `onReintentar` |
| Submit P15-strict + MOTIVO_MAX | ✅ Implemented | `errorAccion` + `mensajeErrorApi` envelope-only; `MOTIVO_MAX=180`; success `?revocada=1` |
| Confirmación, copy y sanitize | ✅ Implemented | checkbox + consequences banner; client sanitize regex; `esRevocable` blocks form |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Load fijo + `errorRecuperable` | ✅ Yes | not-found vs hard recuperable split |
| Reintentar gated load-only | ✅ Yes | HTML `@if (errorRecuperable())`; submit never sets flag |
| Submit via `errorAccion` inline | ✅ Yes | dialog body alert; no load overlay on POST fail |
| `mensajeErrorApi` P15-strict | ✅ Yes | `HttpErrorResponse.error.error.message` only |
| `MOTIVO_MAX` → 180 | ✅ Yes | const + maxlength + `onMotivoChange` slice |
| Keep confirm/copy/sanitize/Escape | ✅ Yes | Escape + sanitize tests pass |
| Flash `?revocada=1` deferred | ✅ Yes | navigate with query only; no preview flash work |
| Front-only; no P20/P22/backend | ✅ Yes | scope limited to revoke page + delta + PLAN |

### Hard locks check

| Lock | Status |
|------|--------|
| Load/submit signal split | ✅ `error` / `errorRecuperable` load-only; `errorAccion` submit |
| No raw `Error.message` | ✅ Covered by load + submit anti-raw tests |
| MOTIVO_MAX 180 | ✅ Const + DOM maxlength + slice |
| No token/QR rotation | ✅ Revoke seam only; no regen/rotate paths |
| No P20/P22/backend | ✅ No delivery/P22/PHP edits in P21 scope |
| No flash UI this cycle | ✅ Query param only |
| No commit during verify | ✅ Verify writes report/tasks only |

### Issues Found

**CRITICAL**: None

**WARNING**: None

**SUGGESTION**:
- Working tree also contains P20 archive promotion / PLAN / changelog edits alongside P21 revoke work; keep review slices clear at land.
- Focused unit suite only (by design); no HTTP/E2E in this change.
- Escape / focus-trap covered by tests but not separate G/W/T scenarios (acceptable under requirement narrative).

### Verdict

**PASS** — 3/3 requirements, 9/9 scenarios compliant; focused `ng test` 17/17 SUCCESS; `tsc --noEmit` clean.
