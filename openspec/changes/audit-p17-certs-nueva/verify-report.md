```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:1ce2bd997878ac5f6342fd489f1e152ed7b485f0ef8436fb2944244e7c687dcc
verdict: pass
blockers: 0
critical_findings: 0
requirements: 1/1
scenarios: 7/7
test_command: ./node_modules/.bin/ng test --include='**/certification-new-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:9d39e7bba7eb1b5f09533e3f6c113e8a0d1c590711b5e3684239f0c940375aa7
build_command: ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

## Verification Report

**Change**: audit-p17-certs-nueva
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**Branch**: `audit/p17-certs-nueva`
**Base prevista**: `staging1.0`
**PR**: https://github.com/marcostoledo96/ifts14/pull/102

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 17 |
| Tasks complete | 17 |
| Tasks incomplete | 0 |

Fases 1–4 (1.1–1.4, 2.1–2.3, 3.1–3.5, 4.1–4.4) marcadas `[x]`. Verify marcado `[x]` tras ejecución.

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && ./node_modules/.bin/tsc --noEmit -p tsconfig.app.json
# stdout vacío (éxito); EXIT:0
# sha256(empty)=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

**Tests (focused page)**: 20 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && ./node_modules/.bin/ng test --include='**/certification-new-page.spec.ts' --no-watch --browsers=ChromeHeadless
Chrome Headless: Executed 20 of 20 SUCCESS
TOTAL: 20 SUCCESS
EXIT:0
```

**Tests (route order — escenario ruta estática)**: 109 passed / 0 failed (incluye `orden seguro: certificaciones/nueva ANTES que certificaciones/:id` + navegación runtime)

```text
cd apps/frontend-angular && ./node_modules/.bin/ng test --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless
TOTAL: 109 SUCCESS
EXIT:0
# supplemental hash: sha256:78511048473a4a309e6197af545b764b85ec58ea39e505661a23b87723a7ab55
```

**Coverage**: Not available → umbral N/A

### Hard locks (inspección + diff)

| Lock | Evidencia | Estado |
|------|-----------|--------|
| Conservar ruta/CTAs | `app.routes.ts` `certificaciones/nueva` antes de `:id`; CTA listado intacta | Intactos |
| Solo `certification-new-page.*` + delta + PLAN | Producto P17 = page.{ts,html,css,spec.ts}; sin HTTP/backend | Intactos |
| Dual flags; Reintentar solo loads | `errorCatalogosRecuperable` + `errorParRecuperable`; emit sin `.btn-retry` | Intactos |
| `mensajeErrorApi` P15-strict | Envelope `HttpErrorResponse` o genérico; sin `Error.message` | Intactos |
| Copy sin «complementario» | Subtítulo emisión puntual; `rg complementario` solo en assert del spec | Intactos |
| No HTTP/token/backend | Sin cambios a `http-certifications.service` / `apps/backend` en scope P17 | Intactos |
| No P14/P15/P18–P21 producto | Diff producto sin marking/date-certs/preview/pdf/entrega/revoke | Intactos |
| No revert P16 archive | Archive `2026-07-29-audit-p16-certs-list/` presente; no revert | Intactos |
| Delta no merge main Emisión | Main `openspec/specs/…` Emisión aún pre-honesty; delta en change | Intactos |
| Ignorar `.tmp/` | `apps/frontend-angular/.tmp/` untracked; fuera de verify | OK |

### Spec Compliance Matrix

Requisito delta: **Emisión directa de certificación (pantalla nueva)** (`admin-certifications-frontend`; MODIFIED).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Emisión directa… | Ruta estática precede a :id | `app.routes.spec.ts` > `orden seguro: certificaciones/nueva ANTES…` + navegación/`RouterTestingHarness` | ✅ COMPLIANT |
| Emisión directa… | Emitir con éxito | `certification-new-page.spec.ts` > `emite body con issuedAt BA… y navega` | ✅ COMPLIANT |
| Emisión directa… | Copy de rol edge vs Asistencias | `…` > `posiciona rol edge vs Asistencias y no usa «complementario»` | ✅ COMPLIANT |
| Emisión directa… | Fallo recuperable de catálogos con Reintentar | `…` > `fallo de catálogos: mensaje fijo + Reintentar + flag…` | ✅ COMPLIANT |
| Emisión directa… | Fallo recuperable de par con Reintentar | `…` > `fallo de par: mensaje fijo + Reintentar → cargarPar…` | ✅ COMPLIANT |
| Emisión directa… | Emit else sin Reintentar ni raw Error.message | `…` > `emit else: mensajeErrorApi/genérico…` | ✅ COMPLIANT |
| Emisión directa… | DNI completo y anti-token | `…` > `muestra DNI completo…` + preview anti-`prefijo_demo`/`token_secreto`; honesty tests sin leak | ✅ COMPLIANT |

**Compliance summary**: 7/7 scenarios compliant

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| Dual recoverable flags | ✅ Implemented | Signals L107–109; clear al start de loads; set en catch |
| Catálogos honesty | ✅ Implemented | Msg fijo + `catalogLoadGen`; Reintentar → `cargarCatalogos()` |
| Par honesty + `loadGen` | ✅ Implemented | Msg fijo; Reintentar → `cargarPar()`; gen stale discard |
| Emit else P15-strict | ✅ Implemented | `mensajeErrorApi` L418–425; 409/400/500 fijos; sin flags recuperables |
| Copy rol edge | ✅ Implemented | Subtitle L11–14 HTML; sin link Asistencias |
| Body 4 campos + navigate | ✅ Implemented | `{ alumnoId, cursoId, issuedAt, expiresAt:null }` → `/admin/certificaciones/:id` |
| Anti-folio / DNI / anti-token | ✅ Implemented | Preview «Se asigna al emitir»; DNI `46000001`; sin token completo |
| Delta OpenSpec | ✅ Present | `openspec/changes/audit-p17-certs-nueva/specs/…/spec.md` |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Flags por superficie (catálogos vs par) | ✅ Yes | Dos signals independientes |
| Reintentar solo loads | ✅ Yes | Emit error box sin `.btn-retry` |
| `mensajeErrorApi` P15-strict (no P14 `Error.message`) | ✅ Yes | Solo envelope HttpErrorResponse o genérico |
| Quitar «complementario» (subtítulo/cta-note/hint) | ✅ Yes | Ausente en template; assert en spec |
| Helper privado local (no shared) | ✅ Yes | Método privado en la page |
| Sin HTTP/backend / sin deprecar ruta | ✅ Yes | Locked |

### Issues Found

**CRITICAL**: None

**WARNING**: None

**SUGGESTION**:
- Tracker PLAN fila P17 sigue «en curso / verify en curso» hasta `sdd-archive` (esperado).
- Main `openspec/specs/admin-certifications-frontend` requisito «Emisión directa…» aún pre-honesty; merge en archive.
- Checklist humana P17 en PLAN (§flujo/copy) pendiente de cierre documental en archive.

### Verdict

**PASS**

1 requirement / 7 scenarios compliant; focused `certification-new-page` 20/20 + `tsc --noEmit` green; hard locks intactos; blockers 0.
