# Tasks: F3-04 — QA manual completo

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~250 (1 reporte QA ~150 + 1 verify-report ~70 + 1 apply-progress ~25 + 1 archive-report ~40 + 6 SDD artifacts ~80 avg + opcional 1 pequeño patch ~10) |
| 400-line budget risk | Low (well under 400) |
| Chained PRs recommended | No (single PR con `--force-with-lease` por local `ahead 76`) |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR |
|------|------|-----------|
| 1 | Reporte de QA manual + 7 artefactos SDD + patch opcional al port doc | PR 1 a `frontend/v0-design-system` (force-with-lease) |

## Open Question

None — Q1-Q4 resueltas en `proposal.md` y `design.md`.

## Phase 1 — Preparación

- [x] 1.1 `git rev-parse --abbrev-ref HEAD` debe devolver `frontend/v0-design-system`.
- [x] 1.2 `git status --short` limpio salvo `?? openspec/changes/f3-04-qa-manual-completo/`.
- [x] 1.3 `git rev-parse HEAD` debe devolver `e399833`; sin commits del agente.
- [x] 1.4 Confirmar que `apps/frontend-angular/` está en estado conocido de Marcos (no tocar).

## Phase 2 — Ejecución de la pasada manual de QA

- [x] 2.1 `cd apps/frontend-angular && npm run build`; documentar exit code, warnings, errores. Si falla, documentar bloqueo y proponer acción correctiva.
- [x] 2.2 `cd apps/frontend-angular && npm test`; documentar resultado (los tests son evidencia base, no cobertura de QA manual).
- [x] 2.3 Crear `docs/frontend/03-qa-manual-f3-04.md` con 9 secciones fijas del `design.md` §a (~150-200 líneas).
- [x] 2.4 §1 Resumen ejecutivo: 2-3 oraciones (build verde, 9 criterios PASS, pendientes por severidad).
- [x] 2.5 §2 Build: output de `npm run build` (exit code, warnings, errores, comando exacto).
- [x] 2.6 §3 Responsive: 5 anchos (360 px, 390 px, 430 px, tablet, desktop). Mati hace la pasada visual; OpenCode documenta.
- [x] 2.7 §4 Teclado y foco: tab nav, focus visible, skip links.
- [x] 2.8 §5 Contraste y legibilidad: WCAG AA, tipografía, contraste.
- [x] 2.9 §6 Estados: carga, vacío, error, éxito por feature.
- [x] 2.10 §7 Consola del navegador: errores nuevos y warnings.
- [x] 2.11 §8 Datos sensibles: confirmar NO DNI completo admin, NO tokens completos, NO clave admin en bundle, NO tokens en URL.
- [x] 2.12 §9 Pendientes y blockers: categorizar blocker / high / medium / low.

## Phase 3 — Validación previa al verify

- [x] 3.1 `git status --short`: solo change dir + `03-qa-manual-f3-04.md` untracked.
- [x] 3.2 `git diff --name-only`: 0 tracked changes.
- [x] 3.3 `git diff --stat apps/frontend-angular/`: 0 líneas (F3-04 es documental puro, no toca código de Marcos).
- [x] 3.4 Listar `openspec/changes/f3-04-qa-manual-completo/`: 5 artefactos SDD presentes al cierre de `sdd-apply` (`explore.md`, `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`). `verify-report.md` y `archive-report.md` se crean en `sdd-verify` y `sdd-archive` respectivamente.
- [x] 3.5 `Get-Content docs/frontend/03-qa-manual-f3-04.md | Select-String "^## "`: count = 9 (secciones obligatorias).
- [x] 3.6 `Select-String "secreto|dump|credencial|real.*DNI"` = 0; términos clave presentes (build, 360, 390, 430, carga, error, vacío, éxito, DNI, token, contraste, WCAG).
- [x] 3.7 Engram: observaciones `explore` (#80), `proposal` (#81), `design` (#82), `tasks`; tras `sdd-apply` se suma `apply-progress`.

## Phase 4 — Cierre

- [x] 4.1 Esperar `sdd-verify` PASS antes de `sdd-archive`.
- [x] 4.2 Documentar en `apply-progress.md` la decisión sobre el patch opcional a `00-angular20-port-v0.md` (diferido a `sdd-archive`; el port doc ya cubre el estado hasta F4-01).
- [x] 4.3 Proponer (NO ejecutar) `git add openspec/changes/f3-04-qa-manual-completo/ docs/frontend/03-qa-manual-f3-04.md`, `git commit -m "test(frontend): documentar qa manual completo"`, `git push origin frontend/v0-design-system --force-with-lease` (pre-push safety: comparar contra `main`, no contra remote stale).
- [x] 4.4 Documentar en `apply-progress.md` que NO se ejecutó `git add`/`commit`/`push`; queda para Mati (diff-confirmation gate).

## Phase 5 — Sanity final

- [x] 5.1 Working tree final limpio o con solo los paths esperados.
- [x] 5.2 NO se ejecutó `git add`/`commit`/`push`/`switch`/`merge`/`rebase` ni se creó PR.
