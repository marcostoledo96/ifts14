```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:8acbc63a90fde90d75b728943a8ad646353c3fa2ac27f377ac8ebc63d3be5d2c
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 7/7
scenarios: 8/8
test_command: CHROME_BIN=.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:84b12ad8e4ccf9adf49a7440eb6cf485182ea53d8df7d22a84cc01842400e5f6
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:b1d8629f80a068ccfb35101d9fdb4dff41103a11eb708f029f29712e74e18193
```

# Verify — frontend-certificaciones-list-polish (Ciclo 11: Lista certificaciones polish)

**Fecha:** 2026-07-17
**Change:** `openspec/changes/frontend-certificaciones-list-polish/`
**cwd:** `apps/frontend-angular/`
**Modo:** Standard (strict_tdd: false) — proposal + spec + design + tasks + apply-progress
**Veredicto:** **PASS WITH WARNINGS**

---

## 1. Gates técnicos obligatorios

| # | Comando | Exit code | Resultado |
|---|---------|-----------|-----------|
| 1 | `npm run test:ci` | **0** | Verde — `TOTAL: 736 SUCCESS`, 0 fallas |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | Sin errores TypeScript |
| 3 | `npm run build` | **0** | `Application bundle generation complete` |

### Detalle gate 1 (`test:ci`)

`test:ci` = `no-focused-tests.test.mjs` + `no-focused-tests.mjs` + `ng test --watch=false --browsers=ChromeHeadless`.

- Precheck focused: ok (exit 0).
- Suite Karma/Jasmine: **736 SUCCESS**.
- Entorno: `CHROME_BIN` → `.verify-tmp/chrome-wrapper.sh` (`google-chrome --no-sandbox --headless=new`).

**Hashes:**
`test_output` sha256:`84b12ad8e4ccf9adf49a7440eb6cf485182ea53d8df7d22a84cc01842400e5f6`
`tsc_output` sha256:`ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb`
`build_output` sha256:`b1d8629f80a068ccfb35101d9fdb4dff41103a11eb708f029f29712e74e18193`

### Detalle gate 3 (`build`)

Build OK. Warnings de presupuesto CSS **preexistentes** (ajenos a `pages/list/`):

- `student-detail-page.css`
- `certification-revoke-page.css`
- `course-editor-page.css`
- `certification-pdf-preview-page.css`
- `certification-preview-page.css`

`certifications-list-page.css` **no** aparece en warnings de budget.

---

## 2. Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 11 |
| Tasks complete | 11 (`tasks.md` + `apply-progress.md` all `[x]`) |
| Tasks incomplete | 0 |

---

## 3. Spec Compliance Matrix (REQ-CERTLIST)

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| **001** CTA Nueva certificación | CTA presente | `expone CTA Nueva certificación hacia /admin/certificaciones/nueva` | ✅ COMPLIANT |
| **002** Badge validez dot+borde | Cuatro estados semánticos | `muestra badges de validez con punto y borde para los cuatro estados` (+ seed con borrador/vigente/revocado/vencido) | ✅ COMPLIANT |
| **003** Empty Inbox+CTA | Empty accionable | `distingue carga, error y vacío total…` → `svg[data-icon="inbox"]` + “Emitir primera certificación” → `/nueva` | ✅ COMPLIANT |
| **004** Loading/error SVG | Error reintentable | QA harness SVG + Reintentar; `reintenta errores reales…` / `reintenta desde el error QA…` | ✅ COMPLIANT |
| **004** Loading/error SVG | Sin coincidencias vs vacío total | `empty state… no-results` + `Limpiar filtros`; empty-total con Inbox/emit separado en HTML | ✅ COMPLIANT |
| **005** Chips estado | Chip estado único | `chip Válida filtra solo estado vigente del modelo` (`estado === 'vigente'`) | ✅ COMPLIANT |
| **006** Sin Entrega | Sin copy de entrega | `not.toContain('Estado de entrega')` + `not.toMatch(/\benvio\b/i)`; tabla 6 cols sin Entrega | ✅ COMPLIANT |
| **007** Privacidad | Sin PII completa | `no expone token completo ni DNI completo…` (UUID + `\d{7,8}`); DOM usa `documentMasked` | ✅ COMPLIANT |

**Compliance summary:** 8/8 scenarios COMPLIANT · 7/7 requirements covered.

### Cobertura solicitada (checklist)

| Tema | Estado |
|------|--------|
| CTA Nueva certificación | ✅ |
| Badges validez dot+borde (Válida / filter vigente) | ✅ |
| Empty Inbox+CTA | ✅ |
| Loading/error SVG | ✅ |
| Chips estado | ✅ |
| SIN entrega/envio (columna/chip/filtro) | ✅ |
| Privacy | ✅ |

---

## 4. Correctness (static)

| Requirement | Status | Notes |
|------------|--------|-------|
| 001 CTA | ✅ Implemented | Header `a.cta-nueva` → `/admin/certificaciones/nueva` |
| 002 Badges | ✅ Implemented | `.validez-badge` + `.validez-dot` + `ESTADO_LABEL` (`vigente`→Válida) |
| 003 Empty | ✅ Implemented | `data-state="empty-total"` Inbox SVG + emit CTA |
| 004 States | ✅ Implemented | `.estado-panel` SVG loading/error; `no-results` clear-only |
| 005 Chips | ✅ Implemented | `data-estado` + `estadoLabel`; filter client-side |
| 006 No Entrega | ✅ Implemented | Sin col/chip/`envio`/`pdfStatus` en listado |
| 007 Privacy | ✅ Implemented | Solo `documentMasked` en filas/cards; búsqueda sobre campos seguros |

---

## 5. Coherence (design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| In-place list polish | ✅ Yes | Solo `pages/list/*` |
| Omit Entrega entirely | ✅ Yes | No `envio` UI |
| Badge from `estado` only | ✅ Yes | |
| Display Válida / filter `vigente` | ✅ Yes | |
| Inline SVG (no lucide) | ✅ Yes | |
| Empty vs filters split | ✅ Yes | |
| Services untouched | ✅ Yes | Models/HTTP/in-memory no change |

---

## 6. Issues Found

**CRITICAL:** None.

**WARNING:**

- **W1 — CSS budget preexistente:** 5 hojas ajenas al ciclo exceden budget 8 kB en `ng build`. No introducido por list polish; `certifications-list-page.css` limpio.

**SUGGESTION:**

- **S1 — Subtitle copy:** el subtítulo dice “Emisión, validez y **entrega** de credenciales…”. No viola el escenario (no es columna/chip “Estado de entrega” / `envio`), pero podría reescribirse a “emisión y validez…” para alinear copy con el lock anti-Entrega.

---

## 7. Verdict

**PASS WITH WARNINGS** — Gates `0` / `0` / `0`; `736 SUCCESS`; `tsc` limpio; build OK. REQ-CERTLIST-001…007 con 8/8 escenarios COMPLIANT y evidencia runtime. Warning solo por budgets CSS preexistentes. Listo para `sdd-archive`.
