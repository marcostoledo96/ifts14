# Design: Permitir `git switch` y `git checkout -b` con aprobación explícita

## Contexto

Este change es la **tercera relajación operativa** de la política Git para el flujo de Matías, después de `permitir-commit-con-aprobacion-explicita` (PR #6, commits `d4589a1` y `79a72ca`) que introdujo el `diff-confirmation gate` para `git add` + `git commit` + `git push`. La política anterior todavía era más restrictiva de lo necesario. Este ajuste consolida la decisión vigente: para Matías, solo `git push` directo a `main` queda siempre prohibido; el resto de las operaciones Git requiere aprobación explícita, comando exacto, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar.

La prohibición de cambio de rama generó fricción real: al iniciar F0-03, Mati tuvo que crear la rama `docs/matias-onboarding-windows` manualmente porque OpenCode no podía ejecutar `git switch -c`. Este ciclo introduce un **branch-confirmation gate** análogo al diff-confirmation gate: tres checks previos que presentan evidencia a Matías antes de cualquier `git switch`, `git switch -c` o `git checkout -b`, exigiendo confirmación explícita por turno. La autoridad de Marcos queda intacta y los gates de seguridad reemplazan las prohibiciones amplias.

## Decisiones técnicas

### (a) Branch-confirmation gate — 3 checks exactos

| Check | Comando | Alternativa rechazada | Racional |
|---|---|---|---|
| Rama actual | `git rev-parse --abbrev-ref HEAD` | `git branch --show-current` (más nuevo, menos portable en scripts antiguos) | `rev-parse` es más universal y ya se usa en el repo. |
| Working tree | `git status --short` | `git diff --cached` (solo staged) | Se necesita ver cambios unstaged también para evitar pérdida. |
| Último commit destino / base | `git log <destino> -1 --oneline` (switch) o `git show <base> --stat \| head -5` (creación) | Verificar divergencia con `main` (`git log --graph --oneline main..<destino>`) | La divergencia con `main` es útil pero complejiza el gate; se deja para un ciclo de refinamiento futuro si Matí lo solicita. |

### (b) Estrategia de consistencia multi-archivo

- `AGENTS.md:21` y `GUIA.md:153` se aplican en la **misma sesión `sdd-apply`** para evitar deriva temporal.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` se actualiza con **grep pre/post**: el conteo de `Prompt exacto para OpenCode` debe ser 20/20 antes y después del reemplazo. Se actualizan también las líneas 27 (Ruta rápida) y 1352 (Checklist final).
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35-36` recibe una **nota aditiva** (`Git — nota 2`) sin tocar la fila original de Marcos ni la `Git — nota` existente.

### (c) Integración de spec

- **Delta únicamente**: 1 Requirement ADDED con 5 Scenarios en `openspec/specs/guia-matias-angular-windows/spec.md`. No se modifican Requirements existentes hasta `sdd-archive`, siguiendo el patrón de F0-02.

### (d) Artefactos del ciclo

Este es el primer change de la serie de relajaciones que produce los **8 artefactos OpenSpec** completos. El `archive-report.md` debe listarlos explícitamente para no perpetuar la omisión del `explore.md` en el precedent.

## Estructura de la entrega

| Archivo | Acción | Descripción |
|---|---|---|
| `openspec/changes/.../explore.md` | Crear (DONE) | Exploración y scope |
| `openspec/changes/.../proposal.md` | Crear (DONE) | Why, What Changes, Approval Protocol |
| `openspec/changes/.../specs/permiso-git-switch-checkout-explicito/spec.md` | Crear (DONE) | Delta con 1 Requirement ADDED + 5 Scenarios |
| `openspec/changes/.../design.md` | Crear (este archivo) | Decisiones técnicas y plan de validación |
| `openspec/changes/.../tasks.md` | Crear (downstream) | Tareas para `sdd-apply` |
| `openspec/changes/.../apply-progress.md` | Crear (downstream) | Bitácora de aplicación |
| `openspec/changes/.../verify-report.md` | Crear (downstream) | Reporte de verificación |
| `openspec/changes/.../archive-report.md` | Crear (downstream) | Cierre y sincronización de specs |
| `AGENTS.md:21` | Modificar | Reemplazar restricciones amplias por aprobación explícita, evidencia previa, árbol limpio o decisión explícita de stash/commit/abortar |
| `GUIA.md:153` | Modificar | Mirror de la nueva regla en §9 Git |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificar | 20 bloques "Prompt exacto" + líneas 27 y 1352 |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35-36` | Modificar | Nota aditiva confirmando workflow de Marcos intacto |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Modificar (en sdd-archive) | Merge del delta ADDED |

## Plan de validación

| Comando / Check | Resultado esperado | Scenario cubierto |
|---|---|---|
| `git status --short` | Solo cambios en `openspec/changes/.../` + 4 archivos modificados | Scenario 1 (ciclo SDD verificado) |
| `git diff --name-only` | `AGENTS.md`, `GUIA.md`, `MATIAS_PROMPTS...`, `MARCOS_PROMPTS...` | Consistencia multi-archivo |
| `git rev-parse --abbrev-ref HEAD` | `docs/policy-git-switch-checkout` | Scenario 1 (rama de trabajo) |
| `git rev-parse HEAD` | `9c631d0` (sin commits del agente) | Scenario 1 (sin auto-commit) |
| `git remote get-url origin` | URL que contiene `ifts14` | Scenario 1 (reafirmación repo correcto) |
| Pre-push safety | Ref remota existente: `git log origin/<rama>..<rama> --oneline`; primer push: `git log <base>..HEAD --oneline` | Pre-push safety |
| `git grep -c "branch-confirmation gate" AGENTS.md GUIA.md` | ≥ 1 en cada archivo | Sincronía AGENTS/GUIA |
| `git grep -c "No hagas commit ni push" MATIAS_PROMPTS...` | 20/20 bloques con la frase actualizada | Cobertura completa prompts |
| `git grep -n "Marcos" MARCOS_PROMPTS... \| head -3` | Contiene nota aditiva | Workflow de Marcos intacto |
| `git grep -n "confirmación explícita de Marcos" MATIAS_PROMPTS...` | Línea 39 intacta | Sin regresión sobre fila Marcos |
| Engram topics | 7 obs. bajo `sdd/permitir-git-switch-checkout-con-aprobacion-explicita/*` | Traza completa del ciclo |
| Spec delta acceptance | Cada Scenario tiene evidencia PASS en `verify-report.md` | 5 Scenarios cubiertos |
| `git rev-parse origin/docs/matias-onboarding-f0-02-f0-03` (o `182ec32`) | Rama F0-02 NO tocada | Fuera de alcance confirmado |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Creación de rama con nombre equivocado | Branch-confirmation gate exige declarar nombre exacto y esperar confirmación textual. |
| Pérdida de cambios no commiteados por switch accidental | `git status --short` obligatorio; si hay cambios, proponer `git stash` o rechazar. |
| Confusión con rama F0-02 no mergeada (`182ec32`) | Gate muestra último commit destino; spec prohíbe switch sin coordinación. |
| Confusión con ciclo `permitir-merge-pr-rebase` | Nombre del change, Goal y Scenario 4 de la spec delimitan el alcance. |
| Deriva entre `AGENTS.md:21` y `GUIA.md:153` | Aplicar ambos en la misma sesión `sdd-apply`. |
| Olvido de alguna instancia en `MATIAS_PROMPTS` (precedent falló líneas 27, 1352) | Grep pre/post con conteo exacto de 20/20 bloques. |
| Regresión sobre fila 39 de `MATIAS_PROMPTS` (tabla de Marcos) | Verificar explícitamente que `"confirmación explícita de Marcos"` sigue presente. |
| Precedent no archivó `explore.md` | Este ciclo archiva los 8 artefactos; `archive-report.md` los lista todos. |

## Fuera de alcance

- F0-03 (próximo ciclo operacional, bloqueado por este change para creación de rama).
- PR, `git merge` y `git rebase` pueden permitirse con aprobación explícita, comando exacto y evidencia previa.
- `git push` a `main` (sigue PROHIBIDO).
- Tocar `openspec/changes/backend-public-endpoint-hardening/` (Marcos).
- Tocar la rama F0-02 no mergeada `docs/matias-onboarding-f0-02-f0-03`.
- Scaffold Angular, `muestra_pagina/`, `material_privado_no_versionar/`, etc.

## Preguntas abiertas resueltas

1. **Nombre de rama**: `docs/policy-git-switch-checkout` (ya creada por Mati).
2. **Branch-confirmation gate**: 3 checks (rama actual, working tree, último commit destino/base). Sin verificación de divergencia con `main` por ahora; se puede agregar en un ciclo de refinamiento futuro.
3. **Ubicación del Requirement**: extensión de `guia-matias-angular-windows` (consistente con F0-02 y precedent).
