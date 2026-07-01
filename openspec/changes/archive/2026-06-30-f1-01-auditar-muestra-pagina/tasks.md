# Tasks: F1-01 — Auditar `muestra_pagina/`

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~300 |
| 400-line budget risk | **Low** |
| Chained PRs recommended | **No** |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR |
|------|------|-----------|
| 1 | Auditoría documental de `muestra_pagina/` | PR 1 a `frontend/v0-design-system` |

## Open Question

None — Q1-Q4 resueltas en `proposal.md` y `design.md`.

## Phase 1 — Preparación

- [ ] 1.1 `git rev-parse --abbrev-ref HEAD` debe devolver `frontend/v0-design-system`.
- [ ] 1.2 `git status --short` limpio salvo `?? openspec/changes/f1-01-auditar-muestra-pagina/`.
- [ ] 1.3 `git rev-parse HEAD` debe devolver `711e3ca`; sin commits del agente.
- [ ] 1.4 Lectura read-only de `MANIFIESTO_V0.md` y `MATIAS_PROMPTS_SDD_FASE2.md` (consistentes con `explore.md`).

## Phase 2 — Escritura de la auditoría

- [ ] 2.1 Crear `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` con 7 secciones de `design.md` §a. Total ~150 líneas.
- [ ] 2.2 §1 Resumen ejecutivo: 2-3 oraciones (7 disponibles, 12 pendientes, sin código).
- [ ] 2.3 §2 Estado de `muestra_pagina/`: 5 directorios, 11 archivos en raíz, 26 capturas; `MANIFIESTO_V0.md` como source of truth.
- [ ] 2.4 §3 Las 7 pantallas disponibles: tabla con prompt 4-10, pantalla, ruta Next.js, estado de portabilidad.
- [ ] 2.5 §4 Las 12 pendientes: tabla con prompt 11-22, bloque F4/F5/F6, bloqueo obligatorio.
- [ ] 2.6 §5 Diseño visual vs código exportado: la auditoría es referencia visual; React/Next NO se copia.
- [ ] 2.7 §6 Riesgos Angular 20: scaffold de Marcos (35/35 tests, build verde), gaps v0/Angular, decisiones pendientes.
- [ ] 2.8 §7 Próximos pasos: apuntar a F1-02+; prompts 11-22 ya derivados a `MATIAS_PROMPTS_SDD_FASE2.md`.

## Phase 3 — Validación previa al verify

- [ ] 3.1 `git status --short`: solo change dir untracked + doc auditoría untracked.
- [ ] 3.2 `git diff --name-only`: 0 paths bajo `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, `.htaccess`.
- [ ] 3.3 Listar filesystem del change dir: 7 artefactos SDD propios (sin `specs/`).
- [ ] 3.4 `git grep -c "^## "` sobre el doc debe devolver 7.
- [ ] 3.5 `git grep -c "secreto\|dump\|credencial\|DNI\|token\|password"` debe ser 0; sin refs a `material_privado_no_versionar/`.
- [ ] 3.6 `git grep -c` ≥ 1 para: "7 pantallas", "12 pendientes", "MANIFIESTO_V0", "MATIAS_PROMPTS_SDD_FASE2", "apps/frontend-angular".
- [ ] 3.7 Engram: `explore`, `proposal`, `design`, `tasks` bajo `sdd/f1-01-auditar-muestra-pagina/*`; tras `sdd-apply` se suma `apply-progress`.

## Phase 4 — Cierre

- [ ] 4.1 Esperar `sdd-verify` PASS antes de `sdd-archive`.
- [ ] 4.2 Documentar en `apply-progress.md` decisión sobre el patch opcional a `00-angular20-port-v0.md` (hecho/descartado, con justificación).
- [ ] 4.3 Proponer (NO ejecutar) `git add openspec/changes/f1-01-auditar-muestra-pagina/ docs/frontend/01-auditoria-muestra-pagina-f1-01.md [patch opcional]`, `git commit -m "docs(matias): auditar muestra_pagina (F1-01)"`, `git push origin frontend/v0-design-system` (pre-push `git log` y `--stat`).
- [ ] 4.4 Documentar en `apply-progress.md` que NO se ejecutó `git add`/`commit`/`push`; queda para Mati (diff-confirmation gate).

## Phase 5 — Sanity final

- [ ] 5.1 Working tree final limpio o con solo change dir + doc auditoría untracked.
- [ ] 5.2 NO se ejecutó `git add`/`commit`/`push`/`switch`/`merge`/`rebase` ni se creó PR.
