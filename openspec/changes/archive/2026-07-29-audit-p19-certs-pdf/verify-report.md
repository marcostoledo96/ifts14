```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:246c94c79c04cf52740779de1ab473004e3ec6fcc06418f5fd766b71949a3ce4
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 9/13
test_command: npx ng test --include='**/certification-pdf-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:33204defaacf55f62fcaa6367aea59c4cd5ce7df400b07364d472b1570ea2f70
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

## Verification Report

**Change**: audit-p19-certs-pdf
**Version**: N/A (delta MODIFIED «Paridad visual, folio imprimible y evidencia de verificación»)
**Mode**: Standard
**Commit under test**: `ce73359` on `audit/p19-certs-pdf`
**PR**: https://github.com/marcostoledo96/ifts14/pull/104
**Workspace**: `/home/marcos/Escritorio/ifts14`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total (apply 1.1–4.4) | 20 |
| Tasks complete (apply) | 20 |
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

**Tests**: ✅ 43 passed / ❌ 0 failed / ⚠️ 0 skipped

```text
cwd: apps/frontend-angular
npx ng test --include='**/certification-pdf-preview-page.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 43 SUCCESS
# exit 0
# sha256:33204defaacf55f62fcaa6367aea59c4cd5ce7df400b07364d472b1570ea2f70
```

**Coverage**: ➖ Not available (focused Karma run; no coverage threshold configured for this gate)

### Spec Compliance Matrix

Delta requirement: **Paridad visual, folio imprimible y evidencia de verificación** (13 scenarios).

| Requirement | Scenario | Test / evidence | Result |
|-------------|----------|-----------------|--------|
| Paridad visual… | Paridad visual de la vista imprimible | Structural suite (protagonista, fechas, firmas, no-print, acciones); no v0 screenshot compare | ⚠️ PARTIAL |
| Paridad visual… | Fechas asistidas exactas en el folio | `muestra cada fecha asistida ISO…`; `conserva el valor ISO…` | ✅ COMPLIANT |
| Paridad visual… | Identificación de estados no vigentes | `certificado vigente…limpio`; `certificado 4/5…REVOCADO`; `borrador`/`vencido` no marcados en `estadoPresentacion` | ⚠️ PARTIAL |
| Paridad visual… | Impresión nativa A4 una página | `imprimir()…window.print`; CSS `@page` A4 landscape + folio `297×210mm` smoke | ✅ COMPLIANT |
| Paridad visual… | Descargar PDF por captura del folio visible | `REQ-PAR-PDF-001: Descargar PDF exporta el folio visible (no el stub API)` | ✅ COMPLIANT |
| Paridad visual… | Filename semántico | `P19: filename prefer detalle.numero (cert-{numero-safe}.pdf)` | ✅ COMPLIANT |
| Paridad visual… | QR canónico sin rotación | `muestra img.qr-real…`; URL canónica/truncada suite; anti-token | ✅ COMPLIANT |
| Paridad visual… | Pie sin disclaimers | Static HTML `cert-footer-pie` = marca ciudad only; **no** dedicated unit assertion | ⚠️ PARTIAL |
| Paridad visual… | Fallo hard recuperable con Reintentar | `P19: fallo hard…`; `P19: Reintentar en load hard…` | ✅ COMPLIANT |
| Paridad visual… | Id inválido o not-found sin Reintentar | `id "abc"…`; `999`/`0`/`0x1`/`1e0`/vacío sin Reintentar | ✅ COMPLIANT |
| Paridad visual… | Fallo de descarga sin Reintentar ni raw | `P19: fallo de descarga muestra genérico sin raw ni Reintentar` | ✅ COMPLIANT |
| Paridad visual… | Checker de aplicación real por estado | Unit ids 1/4/5 + privacy/DNI; no live staging print checker for `1,3,4,5` | ⚠️ PARTIAL |
| Paridad visual… | Evidencia de checks en verify | This `verify-report.md` + command hashes | ✅ COMPLIANT |

**Compliance summary**: 9/13 scenarios compliant (4 PARTIAL warnings)

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Honesty load + Reintentar gated | ✅ Implemented | `aplicarErrorCarga` fixed es-AR; `errorRecuperable` load-only; HTML `@if (errorRecuperable())` |
| Download P15-strict | ✅ Implemented | `mensajeErrorApi` envelope-only; fallback «No se pudo generar el PDF.»; never sets `errorRecuperable` |
| Filename `detalle.numero` | ✅ Implemented | `numeroExpediente` prefers `detalle.numero.trim()`; `pdfFilename` → `cert-{safe}.pdf` |
| Descargar = html2canvas+jsPDF | ✅ Implemented | `exportarFolioVisibleComoPdf` keeps `html2canvas` `scale:2`; MUST NOT call service `descargarPdf` (tested) |
| Print A4 + firmas 3:2 | ✅ Preserved | `@page` A4 landscape; folio print box 297×210; `.cert-firma-img` 10.5rem×7rem (3:2) |
| Hard locks | ✅ Held | No HTTP/backend service edits; no token rotation; P18 moved to archive only (+`archive-report`); no P20/P21 product work |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| `errorRecuperable` load-only | ✅ Yes | Soft QR/config and download never set flag |
| Load fixed es-AR | ✅ Yes | Mirror P18 `aplicarErrorCarga` |
| Download P15-strict | ✅ Yes | Local helper; html2canvas errors → fixed fallback |
| Filename prefer `detalle.numero` | ✅ Yes | Parity with delivery shape |
| Descargar = folio capture (not P-13 API) | ✅ Yes | Delta + `REQ-PAR-PDF-001` |
| Keep html2canvas/print/firmas; CSS only if broken | ✅ Yes | CSS includes print overflow guard; ratio preserved |
| Leave P18 archive; no HTTP; no commit in verify | ✅ Yes | Verify did not commit; ignored `.tmp/` |
| Delta under change (no premature main merge) | ⚠️ Partial | Delta exists under change; commit `ce73359` also updated `openspec/specs/admin-certifications-frontend/spec.md` early (task 4.1 said no merge main) |

### Hard locks check

| Lock | Status |
|------|--------|
| html2canvas kept | ✅ |
| no HTTP/token rotation | ✅ |
| P18 archive only (no product reopen) | ✅ (git mv + archive-report) |
| no P20/P21 | ✅ |

### Issues Found

**CRITICAL**: None

**WARNING**:
1. 4 scenarios remain PARTIAL: visual parity vs v0 (no screenshots), `borrador`/`vencido` marks not driven by `estadoPresentacion` (only `revocado`), pie disclaimer absence lacks a dedicated unit test, no live staging checker for ids `1,3,4,5`.
2. Main `openspec/specs/admin-certifications-frontend/spec.md` was updated in the apply commit despite task/DO-NOT-TOUCH “no merge main” — delta under the change is still present and authoritative for this cycle.
3. PLAN §P19 still says «verify pendiente» / EN CURSO — expected until archive/docs refresh.

**SUGGESTION**:
1. Optional archive follow-up: assert footer has no `certificateText`/disclaimer strings; extend `estadoPresentacion` for `borrador`/`vencido` if product still requires marca+banda.
2. Optional visual smoke: one desktop + one print capture for archive evidence.

### Verdict

**PASS WITH WARNINGS**

Apply scope (honesty load-only, download P15-strict, filename `numero`, html2canvas/`REQ-PAR-PDF-001`, Reintentar gates) is green with 43/43 focused tests and clean `tsc`. Inherited visual/checker/pie scenarios and premature main-spec merge are warnings only — no blockers for archive.
