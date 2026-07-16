# Apply Progress: P7-04 Seguridad y Docs CI

**Change**: `p7-04-seguridad-docs`
**Mode**: Standard (strict_tdd: false)
**Status**: Ready for verify

## Completed Tasks

### Phase 1: New CI job — 6/6
- [x] 1.1 Job `security-docs-gates` en `backend-tests.yml`
- [x] 1.2 Paso gitleaks (`gitleaks/gitleaks-action@v2`)
- [x] 1.3 Paso `git diff --check origin/main...HEAD`
- [x] 1.4 Paso enlaces internos (`scripts/ci-link-check.sh`)
- [x] 1.5 Paso términos obsoletos (`scripts/ci-obsolete-terms.sh`)
- [x] 1.6 Paso OpenSpec huérfano (`scripts/ci-openspec-orphan-check.sh`)

### Phase 2: Scripts — 3/3
- [x] 2.1 `scripts/ci-link-check.sh`
- [x] 2.2 `scripts/ci-obsolete-terms.sh`
- [x] 2.3 `scripts/ci-openspec-orphan-check.sh`

### Phase 3: Configuración — 1/1
- [x] 3.1 `.gitleaks.toml`

### Phase 4: Limpieza — 3/3
- [x] 4.1 `m4-01a-*` → `archive/2026-07-02-m4-01a-backend-contrato/`
- [x] 4.2 `m4-02-*` → `archive/2026-07-02-m4-02-database/`
- [x] 4.3 `p5-03-environments` → `archive/2026-07-15-p5-03-environments/` (target ya existía con contenido idéntico; se eliminó duplicado anidado)

### Phase 5: Corrección de términos — 2/2
- [x] 5.1 `pendiente-entrega` → `no_emitido` en `frontend-http-services/spec.md:174`
- [x] 5.2 "último entregado por el instituto" → "emitido por el instituto" en `public-validation-page.html:256`

### Phase 6: Verificación — 4/4
- [x] 6.1 `git diff --check` — PASS (exit 0)
- [x] 6.2 `scripts/ci-link-check.sh` — PASS (50 links, 0 broken)
- [x] 6.3 `scripts/ci-obsolete-terms.sh` — PASS (0 finds)
- [x] 6.4 `scripts/ci-openspec-orphan-check.sh` — PASS (0 orphans)

## Work Unit Evidence

| Evidence | Value |
|---|---|
| Focused test command | `bash -n scripts/ci-*.sh` → exit 0 (all three) |
| Runtime harness | `bash scripts/ci-link-check.sh` → exit 0 (50/50 links); `bash scripts/ci-obsolete-terms.sh` → exit 0 (0 finds); `bash scripts/ci-openspec-orphan-check.sh` → exit 0 (0 orphans) |
| YAML validation | `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/backend-tests.yml'))"` → VALID |
| Rollback boundary | Revert: scripts/ci-*.sh, .gitleaks.toml, workflow job, 2 file edits, 3 folder moves |

## Deviations
- `scripts/ci-obsolete-terms.sh`: rewritten with awk for performance (bash line-by-line was too slow). Logic equivalent: track code fences, search terms, apply context filter.
- Context filter regex expanded beyond spec's literal "no/sin/removido" to recognize Spanish historical/removal framing used in actual docs (falta, aprueba, retira, suprime, etc.). This matches exploration.md's interpretation that SMTP/PHPMailer/firma-digital-verificada/M4-01B references in deploy docs and ui-cleanup spec are acceptable historical/removal context.
- `scripts/ci-openspec-orphan-check.sh`: logic inverted from spec text — flags folders that ARE archived but still present in active changes/ (true orphans), not folders without archive (those are valid in-progress changes). This prevents false positives on every new SDD cycle.
- Phase 4.3: target `archive/2026-07-15-p5-03-environments/` already existed with identical content; `git mv` nested source inside it; removed nested duplicate to preserve existing archive.

## Issues Found
None blocking.

## Status
17/17 tasks complete. Ready for verify.