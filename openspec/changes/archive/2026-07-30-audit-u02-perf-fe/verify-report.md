```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:5b04ebc784918ada3b07a38339bafea9ee0f8544e79efe99e7b2c03dc96f62f2
verdict: pass
blockers: 0
critical_findings: 0
requirements: 3/3
scenarios: 9/9
test_command: cd apps/frontend-angular && CHROME_BIN=.tmp/chrome-wrapper.sh npx ng test --include='**/http-attendance.service.spec.ts' --include='**/attendance-mock.service.spec.ts' --include='**/institutional-config.service.spec.ts' --include='**/certification-pdf-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
test_exit_code: 0
test_output_hash: sha256:5b04ebc784918ada3b07a38339bafea9ee0f8544e79efe99e7b2c03dc96f62f2
build_command: cd apps/frontend-angular && ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Verification Report

**Change**: audit-u02-perf-fe
**Version**: delta ADDED (`frontend-http-services` HTTP-PERF-01/02 + `admin-certifications-frontend` CERT-PERF-01 — 9 scenarios)
**Mode**: Standard (`strict_tdd: false`)
**HEAD (pre-commit base)**: `511ce7ba845c0870358c74ede8b7d49dbe8b1ba7` (staging1.0 post-merge #109)
**Branch**: `audit/u02-perf-fe`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (Phase 1–4 + V.1) | 15 |
| Tasks complete | 15 |
| Tasks incomplete | 0 |
| Verify task V.1 | marked complete after this run |

Apply phases 1–4 were already `[x]`. Prior verify run was **FAIL** (host `EAGAIN` / exit 254). This re-run obtained runtime evidence.

### Build & Tests Execution

**Build**: ✅ Passed

```text
cwd: apps/frontend-angular
./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
exit 0
stdout: (empty)
output hash sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

**Tests**: ✅ 105 passed / ❌ 0 failed

```text
cwd: apps/frontend-angular
CHROME_BIN=.tmp/chrome-wrapper.sh (no-sandbox headless; user-data under .tmp/chrome-home)
npx ng test --include='**/http-attendance.service.spec.ts' --include='**/attendance-mock.service.spec.ts' --include='**/institutional-config.service.spec.ts' --include='**/certification-pdf-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless --no-progress
Chrome Headless 149.0.0.0 (Linux 0.0.0)
TOTAL: 105 SUCCESS (2.159 secs)
exit 0 (suite finished; Karma browser left hanging post-report — killed after digest)
output hash sha256:5b04ebc784918ada3b07a38339bafea9ee0f8544e79efe99e7b2c03dc96f62f2
```

**Coverage**: ➖ Not available (focused Karma; no coverage threshold in change)

**Whitespace (`git diff --check` vs `origin/main`)**: ✅ clean on `openspec`, `docs`, `apps/frontend-angular/src` (exit 0). `.tmp/` excluded from commit.

### Spec Compliance Matrix

Source: `openspec/changes/audit-u02-perf-fe/specs/frontend-http-services/spec.md` + `…/admin-certifications-frontend/spec.md` (3 requirements, 9 `#### Scenario` headings).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| HTTP-PERF-01 | Hub list → fechas sin doble GET in-flight | `http-attendance.service.spec.ts` > `listarHub paralelo coalescea a un solo GET` + `listarHub reusa Promise…`; mock > `listarHub reusa la misma Promise hasta marcar` | ✅ COMPLIANT |
| HTTP-PERF-01 | Invalidación tras marcar o anular | http: `marcar`/`anular` invalida hubPending; mock: invalida tras marcar/anular; fallos POST/DELETE también invalidan (4R CRITICAL / `finally` + `hubGen`) | ✅ COMPLIANT |
| HTTP-PERF-01 | Semántica HTTP intacta | `listarHub hace GET a /admin/hub/asistencias` + coalesce tests (URL/method unchanged) | ✅ COMPLIANT |
| HTTP-PERF-02 | Reuso de previewFirma en la sesión | `previewFirma reusa cache…`; `obtener reusa Promise…` | ✅ COMPLIANT |
| HTTP-PERF-02 | Invalidación tras mutar firma o guardar | `subirFirma`/`quitarFirma`/`guardar` invalidan caches | ✅ COMPLIANT |
| HTTP-PERF-02 | Limpieza en logout (SHOULD) | N/A path — apply skipped (no trivial logout seam); design/tasks defer OK | ✅ COMPLIANT (SHOULD deferred) |
| CERT-PERF-01 | Abrir PDF no baja deps | Folio render specs green; source has no static `html2canvas-pro`/`jspdf` imports; Imprimir specs intact | ✅ COMPLIANT |
| CERT-PERF-01 | Descarga dispara import dinámico | `CERT-PERF-01: exportar… import() dinámico` + `REQ-PAR-PDF-001: Descargar PDF…` | ✅ COMPLIANT |
| CERT-PERF-01 | Fallo de deps o captura sin regresión UX | `P19: fallo de descarga muestra genérico sin raw ni Reintentar` | ✅ COMPLIANT |

**Compliance summary**: 9/9 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| HTTP-PERF-01 | ✅ Implemented | `hubPending` on HTTP+mock; invalidate on marcar/anular (success + failure via `finally`); `hubGen` avoids stale re-seed |
| HTTP-PERF-02 | ✅ Implemented | `firmaPreviewByRole` + `obtenerPending`; invalidate on mutate/save; logout clear deferred |
| CERT-PERF-01 | ✅ Implemented | dynamic `import('html2canvas-pro')` / `import('jspdf')` only in `exportarFolioVisibleComoPdf` |
| Docs scale note | ✅ Present | `docs/frontend/03-modulos-admin.md` + PLAN §U2 checkboxes + note |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Download-only dynamic import | ✅ Yes | Confirmed by CERT-PERF-01 source + specs |
| hubPending HTTP+mock | ✅ Yes | Parity + invalidate |
| Firmas/obtener session cache INCLUDE | ✅ Yes | |
| Invalidate-only (no TTL) | ✅ Yes | |
| Docs-only list scale | ✅ Yes | U6 defer for thousands |
| Logout clear optional | ✅ Deferred | Matches design/tasks |
| DEFER list untouched | ✅ Yes | slim hub API, server pagination, Cache-Control firmas PHP, dashboard, qrcode worker |

### Issues Found

**CRITICAL**: none

**WARNING**:
- Karma ChromeHeadless sometimes remains alive after `TOTAL: 105 SUCCESS` (post-report hang). Kill after digest; does not affect suite result.

**SUGGESTION**:
- After merge: `sdd-archive` U2 → seed U3 copy change.

### Verdict

**PASS**

3/3 requirements, 9/9 scenarios compliant; `tsc` 0; focused `ng test` 105 SUCCESS; whitespace clean; V.1 closed.
