# Proposal: Permitir `git switch` y `git checkout -b` con aprobación explícita

## Why

Este change es la **tercera relajación operativa de la política de Git para OpenCode** en el flujo de Matías, después de `permitir-commit-con-aprobacion-explicita` (commit `d4589a1`, PR #6, mergeado en `9c631d0`) y la regla de push a ramas no-`main` (commit `79a72ca`, consolidado en el mismo PR #6). La política vigente permite `git add` + `git commit` + `git push` (a la rama actual, nunca a `main`) bajo aprobación explícita por turno y diff-confirmation gate. La única prohibición dura para Matías es `git push` directo a `main`; el resto de las operaciones requiere aprobación explícita y evidencia previa.

La prohibición de cambio de rama genera fricción operativa real: Matías tuvo que crear manualmente la rama `docs/matias-onboarding-windows` (hoy `stale`) porque OpenCode no podía ejecutar `git switch -c`. Este ciclo relaja `git switch <rama>`, `git switch -c <nueva-rama> <base>` y `git checkout -b <nueva-rama> <base>` bajo un nuevo **branch-confirmation gate** (análog al diff-confirmation gate), y formaliza `git show <commit>:<archivo>` para lectura histórica. La autoridad de Marcos queda intacta.

## What Changes

| Archivo | Impacto | Detalle |
|---------|---------|---------|
| `AGENTS.md:21` | Modified | Reemplazar prohibición de `git switch`/`git checkout` por regla con alcance: permitidos con aprobación + branch-confirmation gate. |
| `GUIA.md:153` | Modified | Mismo cambio que `AGENTS.md`, versión humana concisa. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | 20 bloques "Prompt exacto" (líneas 337–1233) + líneas 27 y 1352: actualizar para incluir nueva capacidad. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35-36` | Modified | Nota aditiva (`Git — nota 2`) confirmando que el workflow de Marcos no cambia. |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Modified | 1 Requirement ADDED con 5 Scenarios Given/When/Then. |

**No se toca**: código de producto (`apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `.htaccess`), migraciones DB, deploy, ni el change activo de Marcos (`backend-public-endpoint-hardening`), ni la rama F0-02 no mergeada (`docs/matias-onboarding-f0-02-f0-03`, HEAD `182ec32`).

## Capabilities

> Este es el CONTRATO entre proposal y specs. El agente sdd-spec lee esta sección para saber qué archivos de spec crear o modificar.

### New Capabilities
- `permiso-git-switch-checkout-explicito`: Política de ejecución de `git switch`, `git switch -c`, `git checkout -b` con aprobación explícita de Matías + branch-confirmation gate. Formalización de `git show <commit>:<archivo>` para lectura histórica.

### Modified Capabilities
- `guia-matias-angular-windows`: 1 Requirement ADDED con 5 Scenarios Given/When/Then que cubren: (a) switch a rama existente con gate, (b) switch -c/checkout -b con gate, (c) primer push sin ref remota, (d) PR/merge/rebase bajo aprobación explícita y evidencia, (e) lectura histórica con `git show <commit>:<archivo>`.

## Approach

Modificación puramente documental en 5 archivos. Se agrega 1 Requirement nuevo a la spec base con escenarios Given/When/Then. Se actualizan `AGENTS.md` y `GUIA.md` en la misma pasada para evitar deriva. Se reemplazan los 20 bloques de prompt en `MATIAS_PROMPTS` con grep de validación pre/post. Se agrega nota aditiva en `MARCOS_PROMPTS` sin tocar la fila original de Marcos.

## Affected Areas

| Area | Impact | Líneas aprox. |
|------|--------|---------------|
| `AGENTS.md` | Modified | ~10 (1 regla reemplazada) |
| `GUIA.md` | Modified | ~10 (1 párrafo reemplazado) |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | ~100 (20 bloques × ~5 líneas + líneas 27, 1352) |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modified | ~5 (1 fila aditiva) |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Modified | ~50 (1 Requirement ADDED + 5 escenarios) |

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Creación de rama con nombre equivocado | Media | Branch-confirmation gate exige declarar nombre exacto y esperar confirmación textual. |
| Pérdida de cambios por switch accidental | Media | Gate exige `git status --short` previo; si hay cambios sin commitear, proponer `git stash` o rechazar. |
| Confusión con rama F0-02 no mergeada | Baja-Media | Gate muestra último commit de rama destino; F0-02 (`182ec32`) no es de la rama activa. |
| Deriva entre `AGENTS.md` y `GUIA.md` | Baja | Aplicar ambos en la misma sesión de apply. |
| Olvidar instancias en `MATIAS_PROMPTS` (precedent falló en líneas 27 y 1352) | Baja | Grep antes y después del apply; conteo post debe ser 20/20. |
| Precedent no archivó `explore.md` | Baja | Este cycle archiva los 8 artefactos; `archive-report.md` los lista explícitamente. |

## Rollback Plan

Revertir los 5 archivos a su estado anterior:
```
git checkout HEAD -- AGENTS.md GUIA.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md openspec/specs/guia-matias-angular-windows/spec.md
```
La prohibición absoluta de switch/checkout queda restaurada inmediatamente. La spec base vuelve a su estado pre-change.

## Dependencies

- Ninguna dependencia externa.
- Precedente: `permitir-commit-con-aprobacion-explicita` (archivado, PR #6).
- No bloquea ni es bloqueado por `backend-public-endpoint-hardening` (Marcos) ni por la rama F0-02 no mergeada.

## Success Criteria

- [ ] El change directory contiene los 8 artefactos OpenSpec: `explore.md`, `proposal.md`, `design.md`, `tasks.md`, `specs/<capability>/spec.md`, `verify-report.md`, `apply-progress.md`, `archive-report.md`.
- [ ] La spec base `guia-matias-angular-windows` gana exactamente 1 Requirement ADDED con 5 escenarios Given/When/Then: (a) `git switch <rama>` con branch-confirmation gate, (b) `git switch -c`/`git checkout -b` con gate, (c) primer push sin ref remota, (d) PR/merge/rebase bajo aprobación explícita y evidencia, (e) lectura histórica con `git show <commit>:<archivo>`.
- [ ] `AGENTS.md:21` y `GUIA.md:153` actualizados en sync con redacción idéntica donde sea posible.
- [ ] `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: 20/20 bloques "Prompt exacto" actualizados + líneas 27 y 1352. Fila 39 (Marcos) intacta.
- [ ] `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35-36` gana nota aditiva sin tocar la fila original de Marcos.
- [ ] `verify-report.md` confirma sdd-verify PASS sin hallazgos CRITICAL.
- [ ] OpenCode propone a Matía el commit (y push) con mensaje de commit convencional — nunca ejecuta git por su cuenta.

## Approval Protocol (branch-confirmation gate)

OpenCode solo ejecuta `git switch` / `git switch -c` / `git checkout -b` cuando se cumplen TODAS estas condiciones:

1. **Ciclo SDD activo**: dentro de un change verificado en una rama del flow de Matías.
2. **Aprobación explícita por turno**: Matías escribe una frase que autoriza el comando exacto en el mismo turno. Ejemplos válidos:
   - "dale, switcheá a `frontend/angular-shell`"
   - "creá la rama `docs/f0-03-inicio` desde `main`"
3. **Branch-confirmation gate obligatorio** (previo al switch/creación):
   - `git rev-parse --abbrev-ref HEAD` → rama actual.
   - `git status --short` → estado del working tree.
   - `git log <rama-destino> -1 --oneline` → último commit de la rama destino (o `git show <base> --stat` para creación).
   - Declaración del nombre exacto de la rama destino/nueva.
   - Presentar toda la evidencia a Matías y esperar confirmación explícita.
4. **Prohibiciones reaffirmadas**: `git switch` a `main`, a ramas de Marcos, o a `docs/matias-onboarding-f0-02-f0-03` no mergeada → rechazado. PR, `git merge`, `git rebase` → requieren aprobación explícita, comando exacto y evidencia previa.
5. **Solo rama de Matías**: no se switchea a ramas de otros flows sin coordinación humana explícita fuera del turno.

## Review Workload Forecast

| Métrica | Valor |
|---------|-------|
| Estimated changed lines | ~180 (spec ~50 + AGENTS ~10 + GUIA ~10 + MATIAS_PROMPTS ~100 + MARCOS_PROMPTS ~5 + artefactos downstream ~80) |
| 400-line budget risk | **Low** — bien por debajo del límite. |
| Chained PRs recommended | **No**. |
| Chain strategy | single-pr. |
| Decision needed before apply | **No** — Mati ya dio el scope en el chat. |

## Out of Scope

- F0-03 (próximo ciclo operativo, bloqueado en este change para creación de rama).
- PR, `git merge` y `git rebase` pueden permitirse con aprobación explícita, comando exacto y evidencia previa.
- `git push` a `main` (sigue PROHIBIDO).
- Touch `openspec/changes/backend-public-endpoint-hardening/` (change activo de Marcos).
- Touch la rama F0-02 no mergeada `docs/matias-onboarding-f0-02-f0-03` (PR independiente).
- Scaffold Angular, `sample_pagina/`, `material_privado_no_versionar/`, etc.

## Open Questions

1. **Nombre de rama**: ¿Confirmás que `docs/policy-git-switch-checkout` es el nombre deseado? (vs. `docs/policy/git-switch-checkout-explicit` con slashes convencionales).
2. **Branch-confirmation gate**: ¿Las 3 checks propuestas (rama actual, working tree, último commit destino) son suficientes? ¿Querés agregar verificación de divergencia con `main`?
3. **Ubicación del Requirement**: ¿Confirmás que el nuevo Requirement va en la spec base `guia-matias-angular-windows` (extendiendo la spec existente) y no en una spec nueva separada (p. ej. `permiso-git-operativo`)?
