# Tasks: Permitir `git switch` y `git checkout -b` con aprobación explícita

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Líneas estimadas | ~200 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Delivery strategy | single-pr |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

## Open Question

None — todas las decisiones se resolvieron en la respuesta del orchestrator a la proposal.

## Phase 1 — Preparación (4 tasks)

- [x] 1.1 `git rev-parse --abbrev-ref HEAD` debe devolver `docs/policy-git-switch-checkout`.
- [x] 1.2 `git status --short` debe estar limpio (solo change dir untracked).
- [x] 1.3 `git rev-parse HEAD` debe ser `9c631d0`; sin commits del agente.
- [x] 1.4 `git -C ifts14 grep -c "Prompt exacto para OpenCode" MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` debe devolver 20. Guardar valor para post-apply.

## Phase 2 — Modificación de 4 archivos (6 tasks)

### 2.A — Reglas operativas

- [x] 2.1 `AGENTS.md:21` — reemplazar prohibición de `git switch`/`git checkout` por regla con alcance: `git switch` y `git checkout -b` con branch-confirmation gate; `git show <commit>:<archivo>` para lectura histórica formalizado; switch a `main`/otros PROHIBIDO; PR/`git merge`/`git rebase` bajo aprobación explícita y evidencia.
- [x] 2.2 `GUIA.md:153` — mirror de 2.1; redacción idéntica donde sea posible.
- [x] 2.3 `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35-36` — agregar `Git — nota 2`: workflow Marcos intacto; nueva capacidad sin efecto en su flujo; si Marcos quiere permiso equivalente, ciclo SDD separado. NO tocar fila `Git` original.
- [x] 2.4 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:27` — actualizar punto 8 de Ruta rápida: `git switch`/`git checkout -b` con branch-confirmation gate y aprobación explícita por turno.

### 2.B — Bloques "Prompt exacto" en MATIAS_PROMPTS

- [x] 2.5 Aplicar a los 20 bloques "Prompt exacto para OpenCode" de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` el cierre: branch-confirmation gate antes de `git switch`/`git checkout -b`; exigir coordinación explícita para ramas sensibles; exigir aprobación explícita y evidencia para PR/`git merge`/`git rebase`. NO agregar texto contradictorio. NO tocar fila 39 (tabla Marcos). Líneas: 337, 379, 421, 467, 510, 556, 603, 649, 711, 761, 809, 857, 904, 951, 1001, 1048, 1096, 1141, 1189, 1233.
- [x] 2.6 `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:1352` — actualizar bullet del Checklist final con branch-confirmation gate y reaffirmación de prohibiciones restantes.

## Phase 3 — Validación previa al verify (5 tasks)

- [x] 3.1 `git status --short`: solo paths esperados.
- [x] 3.2 `git diff --name-only`: solo `AGENTS.md`, `GUIA.md`, `MARCOS_PROMPTS...`, `MATIAS_PROMPTS...`. NO paths en `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, ni en F0-02.
- [x] 3.3 `git grep -c "branch-confirmation gate" AGENTS.md GUIA.md`: ≥ 1 match en cada uno.
- [x] 3.4 `git -C ifts14 grep -c "Prompt exacto para OpenCode" MATIAS_PROMPTS...`: sigue siendo 20.
- [x] 3.5 `git -C ifts14 grep "confirmación explícita de Marcos" MATIAS_PROMPTS...`: fila 39 intacta.

## Phase 4 — Cierre (4 tasks)

- [x] 4.1 Esperar sdd-verify PASS.
- [x] 4.2 Documentar en `apply-progress.md` la decisión final con justificación.
- [x] 4.3 Proponer (NO ejecutar): `git add openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/ AGENTS.md GUIA.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`; `git commit -m "docs(governance): permitir git switch y checkout -b con aprobacion explicita (tercera relajacion operativa)"`; `git push origin docs/policy-git-switch-checkout` (pre-push diff-confirmation gate).
- [x] 4.4 Documentar en `apply-progress.md` que NO se ejecutó `git add`/`commit`/`push` por cuenta propia — eso queda para Mati.

## Phase 5 — Sanity final (2 tasks)

- [x] 5.1 Working tree final limpio o con solo paths esperados.
- [x] 5.2 Confirmar que NO se ejecutó `git add`/`commit`/`push` por cuenta propia — eso queda para Mati.
