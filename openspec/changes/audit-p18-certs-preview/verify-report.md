```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:28c90e87d1f9eb3276f2430bddeb607666983e7b79043722afcf7ed965d43e79
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 8/8
test_command: npx ng test --include='**/certification-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:5983e69f5cc15d6f93f4edc750e4a92921955d5faab2cee8fc7869b6cfb2dc1a
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

## Verification Report

**Change**: audit-p18-certs-preview
**Version**: N/A (delta MODIFIED «Previsualización segura y handoff explícito»)
**Mode**: Standard
**Commit under test**: `0e611c8` on `audit/p18-certs-preview`
**Workspace**: `/home/marcos/Escritorio/ifts14`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (apply 1.1–4.4) | 16 |
| Tasks complete (apply) | 16 |
| Tasks incomplete (apply) | 0 |
| Verify meta-task | checked after this report |

All Phase 1–4 apply tasks were `[x]` before verify. The Verify section checkbox is the phase gate for this report.

### Build & Tests Execution

**Build**: ✅ Passed (`tsc --noEmit -p tsconfig.app.json`, exit 0)

```text
cwd: apps/frontend-angular
npx tsc --noEmit -p tsconfig.app.json
# exit 0 (npm warn Unknown env config "devdir" only)
# sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

**Tests**: ✅ 60 passed / ❌ 0 failed / ⚠️ 0 skipped

```text
cwd: apps/frontend-angular
npx ng test --include='**/certification-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 60 SUCCESS
# exit 0
# sha256:5983e69f5cc15d6f93f4edc750e4a92921955d5faab2cee8fc7869b6cfb2dc1a
```

**Coverage**: ➖ Not available (focused Karma run; no coverage threshold configured for this gate)

### Spec Compliance Matrix

Delta requirement: **Previsualización segura y handoff explícito** (8 scenarios).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Previsualización segura… | Expediente de una certificación | `muestra datos seguros…`; firmas/QR/revocado/URL truncada suite | ✅ COMPLIANT |
| Previsualización segura… | Acciones PDF, revocación, entrega y copy/QR | `F4-02 Descargar PDF→:id/pdf`; `F4-02/P6-02 Regenerar=API`; `F6-01 revocar`; no Entrega/Compartir; Copiar/QR | ✅ COMPLIANT |
| Previsualización segura… | Post-regen sin URL canónica completa | `P18: post-regen omite publicValidationUrl canónica completa` | ✅ COMPLIANT |
| Previsualización segura… | Fallo hard recuperable con Reintentar | `P18: fallo hard de obtener…`; `P18: Reintentar en load hard…` | ✅ COMPLIANT |
| Previsualización segura… | Id inválido o not-found sin Reintentar | `id inválido "abc"…`; hex/`1e0`/`999` + `errorRecuperable=false` sin Reintentar | ✅ COMPLIANT |
| Previsualización segura… | Fallo QR o regeneración sin raw | `P18: fallo QR…`; `P6-02: regeneración con error…sin raw` | ✅ COMPLIANT |
| Previsualización segura… | Soft config y entrega no bloqueantes | `REQ-CPREV-001` entrega-manual fail; `REQ-CPREV-006` config fallida/vacía | ✅ COMPLIANT |
| Previsualización segura… | Frontera de datos administrativa | `no expone token completo`; DNI `documentMasked`; `no expone legajo ni matrícula` | ✅ COMPLIANT |

**Compliance summary**: 8/8 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Honesty load + Reintentar gated | ✅ Implemented | `aplicarErrorCarga` fixed es-AR; `errorRecuperable` load-only; HTML `@if (errorRecuperable())` |
| `mensajeErrorApi` P15-strict QR/regen | ✅ Implemented | HttpErrorResponse envelope only; else generics; never `(e as Error).message` |
| Omit post-regen `publicValidationUrl` | ✅ Implemented | regeneracion-ok: success + permanencia only; no `.public-url` |
| Regenerar=API / Descargar→`/pdf` | ✅ Implemented | `regenerarPdf()` seam; Descargar `routerLink` `…/pdf` |
| Soft paths intact | ✅ Intact | `aplicarConfig` / `aplicarEntrega` / soft QR preview unchanged |
| `loadGen` on QR/regen | ✅ Implemented | `descargarQr` / `regenerarPdf` guard with `gen !== this.loadGen` |
| No HTTP / token rotation | ✅ Locked | Commit does not touch `http-certifications.service.ts` / backend |
| No P19–P21 product work | ✅ Locked | P19–P21 remain pendiente in PLAN; no those change dirs in commit |
| P17 archive only (allowed) | ✅ Observed | Archive under `openspec/changes/archive/2026-07-29-audit-p17-certs-nueva/`; main spec got P17 «Emisión directa» merge |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| `errorRecuperable` load-only (P15 parity) | ✅ Yes | Overrides older proposal/explore «no errorRecuperable»; QR/regen never set it |
| Omit URL preferred over truncar in regen block | ✅ Yes | Panel validation still uses `truncarUrl` / `entregaUrlMostrada` |
| P15-strict `mensajeErrorApi` | ✅ Yes | Matches design contract |
| Soft / P17 archive / no HTTP | ✅ Yes | Soft untouched; P17 archived; no HTTP |

### Hard locks check

| Lock | Result |
|------|--------|
| No P19–P21 implementation | ✅ PASS |
| No HTTP / token rotation | ✅ PASS |
| Soft paths intact | ✅ PASS |
| P17 archive only (no reopen product) | ✅ PASS |
| Ignore `.tmp/` | ✅ PASS (untracked `.tmp/` only; not part of product) |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. Live `openspec/specs/admin-certifications-frontend/spec.md` still states both Descargar and Regenerar navigate to `/pdf`. Change delta (authoritative for this cycle) already requires Regenerar=API. Expected until `sdd-archive` merges the P18 delta into main specs — do not treat as product FAIL.

**SUGGESTION**:
1. PLAN tracker row P18 still says `en curso` / «verify pendiente»; checklist items are already `[x]`. Flip to `hecha` (and close Estado) during `sdd-archive` / PR closeout.
2. Bundled P17 main-spec merge in the same commit as P18 product is acceptable per «P17 archive only»; keep archive docs as the trail.

### Verdict

**PASS WITH WARNINGS**

8/8 delta scenarios compliant with runtime evidence (60/60 focused tests + `tsc` green). Product honesty/anti-leak/loadGen locks hold. Only documentary drift remains for archive (main preview requirement text).
