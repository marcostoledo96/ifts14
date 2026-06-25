# Apply Progress: mejorar-guia-marcos-ciclos-sdd

## Mode

- Artifact store: hybrid (OpenSpec + Engram)
- Execution mode: Standard documentation apply
- Strict TDD: not active; documentation-only, no Angular/PHP tests run
- Delivery strategy: force-chained, `stacked-to-main` conceptual only; no branches, commits or PRs created

## Completed Tasks

### Phase 1 — WU1: estructura y secciones base

- [x] 1.1 Encabezado + ruta rápida en `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- [x] 1.2 "Rol y prohibiciones": PHP 8.4.21, MariaDB 10.6.27, cPanel; sin Angular salvo coordinación; sin material privado; sin Git automático.
- [x] 1.3 Tabla "Cuándo detenerse para QA manual" con `php -l`, `php -m`, `mysqldump --no-data`, `curl` con token ficticio, `git status --ignored --short`, `.htaccess`.
- [x] 1.4 Plantilla de ciclo compacta (9 campos) en bloque markdown copiable.
- [x] 1.5 Anexo breve de skills/agents desde `opencode.json` y `.atl/skill-registry.md`; solo lo verificable o "pendiente de validar".
- [x] 1.6 "Handoff al cierre" + "Comandos Git propuestos" como ejemplo, no como instrucción automática.

### Phase 2 — WU2: 9 ciclos M1-01..M3-03 con plantilla aplicada

- [x] 2.1 M1-01 limpieza: `git status --ignored --short` antes de cualquier cambio.
- [x] 2.2 M1-02 auditoría: lectura segura de `material_privado_no_versionar/` (solo nombres/riesgos).
- [x] 2.3 M1-03 modelo MariaDB: `mysqldump --no-data` sobre fixture ficticio.
- [x] 2.4 M2-01 contrato API: diff de `openspec/specs/backend-contrato-api-certificados/spec.md` antes/después.
- [x] 2.5 M2-02 base PHP: `php -l` por archivo y `php -m` para extensiones (pdo_mysql, openssl, mbstring).
- [x] 2.6 M2-03 validación pública: `curl` con token ficticio, sin DNI/token en logs.
- [x] 2.7 M3-01 integración Angular: checkpoint de contrato (DTOs y errores) sin acoplar implementaciones.
- [x] 2.8 M3-02 deploy cPanel: `.htaccess`, base href `/certificados/`, script de subida y rollback.
- [x] 2.9 M3-03 hardening: logs sin datos sensibles, backups, `.gitignore`, `docs/` sincronizado, comandos Git propuestos.

### Phase 3 — Cierre y verificación

- [x] 3.1 9 IDs M1-01..M3-03 coinciden con la versión previa.
- [x] 3.2 Cada ciclo tiene los 9 campos y al menos un checkpoint QA con comando concreto.
- [x] 3.3 Anexo de skills/agents verificable o "pendiente de validar".
- [x] 3.4 `docs/00-indice-general.md` sin cambios porque la ruta/función de la guía no cambió.
- [x] 3.5 `git diff --stat` revisado dentro del presupuesto; no se ejecutaron comandos Git de escritura.

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | Replaced the compact 101-line guide with an operational SDD guide: quick path, QA stop gates, 9-field template, all M1-01..M3-03 cycles, handoff, Git proposals and skills appendix. |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/tasks.md` | Modified | Marked all planned tasks complete after applying the documentation change. |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/apply-progress.md` | Created | Persisted cumulative apply progress for OpenSpec. |

## Corrective Apply — Verify CRITICAL fix

- [x] Fixed the CRITICAL verify issue: every M1-01..M3-03 cycle `No hacer` block now states `Commit, push, merge y rebase quedan manuales de Marcos.`
- [x] Kept the change limited to `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` and this cumulative apply-progress artifact.
- [x] Did not modify the Matías guide, product code, dependencies, database, deploy files, private material, or Git history.

## Verification Performed

- Read required project docs: `README.md`, `GUIA.md`, `docs/00-indice-general.md`, local `AGENTS.md` instructions already loaded, and `openspec/AGENTS.md`.
- Read required SDD artifacts from OpenSpec and full Engram observations for spec, design and tasks.
- Read and merged previous apply-progress from Engram observation #3777 before persisting this corrective update.
- Confirmed strict TDD is not active by instruction and no testing capability artifact/config was found; no Angular/PHP tests were run.
- Checked current Git state before editing to avoid touching existing Matías-cycle changes.
- Verified guide headings preserve the 9 cycle IDs M1-01..M3-03.
- Verified each cycle includes the 9 required fields: Objetivo, Rama sugerida, Leer antes, Pedir a OpenCode, Ejecutar/verificar, QA manual, No hacer, Archive, Commit sugerido.
- Verified OpenSpec tasks were re-read with `[x]` markers before return.
- Corrective verification: confirmed all 9 `No hacer` blocks contain `commit`, `push`, `merge`, `rebase`, `manuales` and `Marcos`.
- Corrective verification: confirmed the guide still has exactly the 9 cycle IDs M1-01..M3-03 in order.

## Deviations from Design

None — implementation matches the design. `docs/00-indice-general.md` was intentionally left unchanged because the guide path and function did not change.

## Issues Found

- `openspec/config.yaml` is absent, so testing mode came from the user instruction and missing testing-capabilities artifact.
- `.atl/skill-registry.md` lists `karpathy-guidelines` but not `sdd-apply`/`sdd-verify`/`sdd-archive`; those were verified from OpenCode config references instead.

## Workload / PR Boundary

- Mode: chained PR slice, conceptual only.
- Current work unit: corrective verify fix for the existing WU1 + WU2 documentation slice.
- Boundary: only the CRITICAL verify issue in per-cycle `No hacer` blocks; no branches, commits or PRs created.
- Estimated review budget impact: minimal additive documentation change within the user-declared 800 changed-line budget.
