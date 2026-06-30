# Explore: Permitir `git switch` y `git checkout -b` con aprobación explícita

> **Estado**: exploration
> **Modo artefacto**: `both` (OpenSpec filesystem + Engram)
> **Rama activa**: `docs/policy-git-switch-checkout` (HEAD `9c631d0`, idéntico a `main`)
> **Working tree**: limpio al momento de exploration; sin cambios locales sobre la rama
> **Fecha exploration**: 2026-06-28
> **Idioma**: español argentino formal (OpenSpec style)

---

## Goal

Este change es la **tercera relajación operativa de la política de Git para OpenCode** en el flujo de Matías, después de `permitir-commit-con-aprobacion-explicita` (PR #6, mergeado en `9c631d0`) y la regla de push a ramas no-`main` (también consolidada en PR #6). La política actual permite `git add`, `git commit` y `git push` (a la rama de trabajo, nunca a `main`) bajo aprobación explícita por turno de Matías + `diff-confirmation gate` previo (`git status --short` + `git diff --name-only` antes de stage; `git log origin/<rama>..<rama> --oneline` + `git diff origin/<rama>..<rama> --stat` antes de push). La única prohibición dura para Matías es `git push` directo a `main`; el resto de las operaciones Git requiere aprobación explícita y evidencia previa.

El nuevo ciclo extiende la relajación a las operaciones de cambio de rama: `git switch <rama>` (a una rama existente, distinta de `main`), `git switch -c <nueva-rama> <base>` (crear rama nueva) y `git checkout -b <nueva-rama> <base>` (equivalente legacy), todas con aprobación explícita de Matías en el mismo turno del chat y un nuevo **branch-confirmation gate** previo (presentación de rama actual, working tree, último commit de la rama destino y declaración del nombre exacto). La lectura histórica de un archivo desde otro commit se hace con `git show <commit>:<archivo>` en la redacción. La única operación siempre fuera de scope para Matías es `git push` directo a `main`; ramas sensibles, PR, merge y rebase requieren aprobación explícita, comando exacto, evidencia previa y coordinación cuando corresponda.

---

## Scope

### In (este ciclo lo permite, con branch-confirmation gate y aprobación explícita por turno)

- `git switch <rama>` — cambio a una rama existente distinta de `main` y que sea de un flow coordinado con Matías. Previo: `git rev-parse --abbrev-ref HEAD`, `git status --short`, `git log <rama> -1 --oneline`; presentación a Mati y confirmación explícita de la rama destino y el estado del working tree.
- `git switch -c <nueva-rama> <base>` — crear rama nueva desde una base declarada.
- `git checkout -b <nueva-rama> <base>` — equivalente legacy de `switch -c`, conservado para compatibilidad con documentación histórica (p. ej. `docs/planificacion-inicial/09_PRIMER_COMMIT_GITHUB.md`).
- `git show <commit>:<archivo>` para lectura histórica de un archivo desde otro commit sin modificar el working tree. `git checkout <commit> -- <archivo>` queda tratado como restauración de path y requiere el gate normal.

### Out (permanecen PROHIBIDOS — fuera del scope de este ciclo)

- `git switch <rama>` o `git checkout <rama>` apuntando a `main`: sigue siendo manual (OpenCode nunca commitea sobre `main`; el cambio de rama lo hace Matías manualmente).
- `git switch` o `git checkout` apuntando a una rama de otro flow sin coordinación explícita:
  - Ramas de Marcos: `backend/public-endpoint-hardening`, `backend/admin-certificados`, `sdd/backend-validacion-publica-certificados`, `qa/backend-hardening-certificados`, `deploy/cpanel-certificados`, `integration/angular-api-contract`. Cualquier cambio a estas requiere coordinación humana fuera del flujo de Matías.
  - Rama F0-02 no mergeada de Matías: `docs/matias-onboarding-f0-02-f0-03` (HEAD `182ec32`, contiene `11e0d3e docs(governance): agregar indice de estado de fases (F0-F3) a la guia de matias` y `182ec32 docs(matias): archivar verificacion de flujo opencode sdd (F0-02)`). OpenCode **no debe** switear a esa rama sin coordinación: no está mergeada, tiene contenido pendiente de revisión por Marcos y no forma parte del scope de este change.
- `git merge` (cualquiera): sigue manual. La creación de PRs también.
- `git rebase`: sigue manual.
- `git push` a `main`: sigue PROHIBIDO (ya cubierto por el change anterior, sigue vigente).
- `git push` a cualquier rama sin aprobación explícita por turno: sigue PROHIBIDO (ya cubierto).

### Out of debate (no se discute en este ciclo)

- Si `git merge`, PR o `git rebase` deberían relajarse también: **no**. Es un debate separado, fuera del scope. Si Matías lo decide más adelante, abre un nuevo change (`permitir-merge-pr-rebase-con-aprobacion-explicita` o similar) y se evalúa con su propio `sdd-propose` → `sdd-spec` → `sdd-design` → `sdd-tasks` → `sdd-apply` → `sdd-verify` → `sdd-archive`.

---

## Existing assets (precedente consolidado y assets vigentes)

### Cambios previos en la serie de relajaciones Git (archivados y mergeados)

| Change | Estado | Relajación introducida |
|---|---|---|
| `permitir-commit-con-aprobacion-explicita` | **Archivado** en `openspec/changes/archive/2026-06-28-permitir-commit-con-aprobacion-explicita/` (sin `explore.md` propio; los 6 artefactos archivados son `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md` + `specs/regla-git-aprobacion-explicita/spec.md`). Mergeado vía PR #6 en `9c631d0`. | `git add` + `git commit` con aprobación explícita + diff-confirmation gate. |
| `permitir-push-a-ramas-con-aprobacion-explicita` | Sin change formal; decisión verbal documentada en Engram (`#23`, `#24`, 2026-06-28) y consolidada en el mismo PR #6 (commits `79a72ca` y `e890c3c`). | `git push` a ramas distintas de `main` con aprobación explícita + pre-push safety (`git log` + `git diff --stat` contra `origin/<rama>`). |
| **Este change** | Borrador, en `docs/policy-git-switch-checkout` (HEAD `9c631d0`, working tree limpio). | `git switch` / `git switch -c` / `git checkout -b` con aprobación explícita + branch-confirmation gate. |

### Texto de política vigente a modificar (estado actual, post PR #6)

| Archivo | Línea | Estado actual | Lo que este ciclo debe modificar |
|---|---|---|---|
| `AGENTS.md` | 21 | Permite `git add` + `git commit` + `git push` (no `main`) con aprobación explícita. Regla anterior con prohibiciones amplias. | Reemplazar prohibiciones amplias por una regla con aprobación explícita, evidencia previa, árbol limpio o decisión explícita de stash/commit/abortar; única prohibición dura: `git push` directo a `main`. |
| `GUIA.md` | 153 | Idéntica redacción que `AGENTS.md:21` (mirror). | Mismo cambio que `AGENTS.md:21`, en versión humana más breve. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | 27 (Ruta rápida, punto 8) y 1352 (QA handoff checklist) | Ambas secciones arrastraban restricciones más fuertes que la decisión vigente. | Actualizar para reflejar la política menos restrictiva, el gate de ramas y lectura histórica con `git show <commit>:<archivo>`. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | **20 bloques** "Prompt exacto para OpenCode" (F0-01 a F3-06) en líneas 337, 379, 421, 467, 510, 556, 603, 649, 711, 761, 809, 857, 904, 951, 1001, 1048, 1096, 1141, 1189, 1233 | Cada bloque arrastraba la política anterior más restrictiva. | Cada bloque debe actualizarse para indicar que las operaciones Git requieren aprobación explícita de Matías, comando exacto y evidencia previa; `git push` directo a `main` es la única prohibición dura. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | 35-36 (tabla "Rol y límites") | Fila `Git` (35) intacta; fila `Git — nota` (36) agregada en el change anterior: *"La relajación de commits aprobados aplica solo al flujo de Matías. Los prompts y reglas de Marcos mantienen la prohibición absoluta."* | Considerar agregar una segunda nota (`Git — nota 2`) o reemplazar la nota existente para que también cubra la relajación de switch/checkout-b. **Opcional pero recomendado**, para mantener consistencia con el precedent. La fila `Git` original NO se modifica. |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Requirements "Contexto operativo y misión" (línea 11), "Flujo OpenCode/Gentle-AI y SDD" (línea 29) y "Reporte final y propuestas Git" (línea 74) | Las tres repiten la regla actual: push+commit permitidos, switch/checkout/merge/rebase/PR prohibidos. | Reemplazar la redacción de las tres Requirements para reflejar la nueva relajación. Agregar **1 Requirement ADDED nuevo** con escenarios Given/When/Then para el branch-confirmation gate y los casos prohibidos. |

### Specs base relacionadas (referencia estructural)

- `openspec/specs/guia-matias-angular-windows/spec.md` — spec base del producto de Matías. 8 Requirements totales, todos vigentes. El change anterior (`regla-git-aprobacion-explicita`) **no modificó** esta spec base (delta-only documental), pero la regla quedó embebida en las Requirements existentes (líneas 11, 29, 74). Para mantener la coherencia con el precedent, este cycle debería tratar la regla de switch/checkout del mismo modo: **delta a la spec base con 1 Requirement ADDED**, no modificación de Requirements existentes.

### Engram (contexto histórico de la serie de cambios)

- `#14 (architecture)` — SDD proposal de `permitir-commit-con-aprobacion-explicita`.
- `#15 (architecture)` — Spec `regla-git-aprobacion-explicita`.
- `#16 (architecture)` — Design de `permitir-commit-con-aprobacion-explicita`.
- `#17 (architecture)` — Tasks de `permitir-commit-con-aprobacion-explicita`.
- `#18 (architecture)` — Apply progress de `permitir-commit-con-aprobacion-explicita`.
- `#19 (decision)` — Verify report de `permitir-commit-con-aprobacion-explicita` (PASS WITH WARNINGS → PASS post segunda pasada).
- `#20 (architecture)` — Archive de `permitir-commit-con-aprobacion-explicita`.
- `#23 (decision)` y `#24 (decision)` — Decisión verbal sobre push a ramas no-`main` (consolidada en el mismo PR #6).

---

## Delta needed (lo que este cycle debe agregar a la spec base)

### Requirement ADDED: `Permitir git switch / git switch -c / git checkout -b con branch-confirmation gate`

OpenCode DEBE permitir las operaciones de cambio de rama bajo un branch-confirmation gate análogo al diff-confirmation gate ya documentado para commit/push. Las operaciones permitidas, con sus condiciones previas, son:

#### Scenario: `git switch <rama>` a rama existente con branch-confirmation gate

- GIVEN un ciclo SDD activo en una rama distinta de `main` que no pertenece a otro flow (no es `backend-public-endpoint-hardening`, `backend/admin-certificados`, `sdd/backend-validacion-publica-certificados`, `qa/backend-hardening-certificados`, `deploy/cpanel-certificados`, `integration/angular-api-contract`, ni `docs/matias-onboarding-f0-02-f0-03` no mergeada)
- WHEN Matías solicita `git switch <rama>` con frase explícita que autoriza el comando exacto en el mismo turno del chat (p. ej. "dale, switcheá a `frontend/angular-shell` con el working tree actual")
- THEN OpenCode DEBE, **previo al switch**:
  1. Correr `git rev-parse --abbrev-ref HEAD` y mostrar la rama actual.
  2. Corner `git status --short` y mostrar el estado del working tree.
  3. Correr `git log <rama> -1 --oneline` y mostrar el último commit de la rama destino.
  4. Presentar toda la evidencia a Matías y **esperar confirmación explícita** de que la rama destino es la correcta y que el working tree está en estado conocido (limpio o con cambios esperados).
- AND solo después de esa confirmación OpenCode PUEDE ejecutar `git switch <rama>`.

#### Scenario: `git switch -c <nueva-rama> <base>` para crear rama nueva con branch-confirmation gate

- GIVEN un ciclo SDD activo en una rama cualquiera del flow de Matías
- WHEN Matías solicita crear una nueva rama con `git switch -c <nueva-rama> <base>` y aprueba el nombre exacto en el mismo turno del chat
- THEN OpenCode DEBE, **previo a la creación**:
  1. Correr `git rev-parse --abbrev-ref HEAD` (rama actual) y `git status --short` (working tree).
  2. Correr `git show <base> --stat | Select-Object -First 5` (verificar contenido de la base).
  3. Declarar el nombre exacto de la nueva rama y la base, y presentarlos a Matías.
  4. Esperar confirmación explícita.
- AND solo después de esa confirmación OpenCode PUEDE ejecutar `git switch -c <nueva-rama> <base>`.
- AND la misma regla aplica al equivalente legacy `git checkout -b <nueva-rama> <base>`.

#### Scenario: Prohibición de `git switch` a `main` o a ramas de otro flow

- GIVEN cualquier situación
- WHEN Matías (o el chat) solicita ejecutar `git switch main`, `git checkout main`, o `git switch` / `git checkout` a una rama de otro flow (Marcos o F0-02 no mergeada) **sin coordinación explícita** fuera del turno
- THEN OpenCode DEBE rechazar la ejecución e informar que la operación queda prohibida y requiere decisión humana manual.

#### Scenario: PR, `git merge` y `git rebase` con aprobación explícita

- GIVEN cualquier situación
- WHEN Matías solicita ejecutar `git merge`, abrir un PR, o `git rebase`
- THEN OpenCode DEBE rechazar la ejecución e informar que esas operaciones quedan **fuera del scope de este cycle** y requieren un change SDD separado.

#### Scenario: Formalización de `git show <commit>:<archivo>` para lectura histórica

- GIVEN cualquier situación
- WHEN OpenCode necesita leer el contenido de un archivo desde otro commit (p. ej. para verificar histórico o comparar versiones), usando `git show <commit>:<archivo>`
- THEN OpenCode PUEDE ejecutar esa operación **sin aprobación explícita por turno** porque no modifica la rama de trabajo ni el working tree de forma permanente (es un read-only de archivo). Esta operación ya estaba implícitamente permitida; este Scenario la **formaliza** para que quede explícita en la spec.

---

## Proposed structure for the cycle

Lista de artefactos OpenSpec esperados (siguiendo el precedent de `permitir-commit-con-aprobacion-explicita`, con un `explore.md` adicional que el cycle anterior no archivó):

| Artefacto | Ubicación | Tamaño esperado | Propósito |
|---|---|---|---|
| `explore.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/explore.md` | ~6-8 KB (este archivo) | Investigation y scope. |
| `proposal.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/proposal.md` | ~5-7 KB | Why, What Changes, New Rule, Approval Protocol (analog al precedent), Affected Areas, Risks, Rollback. |
| `design.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/design.md` | ~5-7 KB | Decisiones de diseño por archivo, branch-confirmation gate detallado, validación con grep, diagrama de flujo de aprobación. |
| `specs/<name>/spec.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/specs/<nombre>/spec.md` (nombre tentativo: `regla-git-switch-checkout-aprobacion-explicita`) | ~4-6 KB | Delta con 1 Requirement ADDED + 5 Scenarios Given/When/Then (los 5 del §"Delta needed" arriba). |
| `tasks.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/tasks.md` | ~3-5 KB | ~15-20 tareas en 7 fases (Preparación, AGENTS.md, GUIA.md, MATIAS_PROMPTS, MARCOS_PROMPTS, Validación, Cierre). |
| `apply-progress.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/apply-progress.md` | ~5-7 KB | Bitácora de aplicación. |
| `verify-report.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/verify-report.md` | ~8-12 KB | Verificación con Spec Compliance Matrix (5 escenarios), Correctness, Coherence, Issues. |
| `archive-report.md` | `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/archive-report.md` | ~5-8 KB | Cierre con sincronización de specs y comandos Git propuestos. |

**Total artefactos**: 8 (uno más que el precedent, que tuvo 7 — la diferencia es el `explore.md` que este cycle sí genera desde el inicio).

---

## Review workload forecast

| Métrica | Estimación |
|---|---|
| Estimated changed lines | **~150-200** (1 línea modificada en `AGENTS.md:21` + 1 en `GUIA.md:153` + 2 en `MATIAS_PROMPTS` línea 27 y 1352 + 20 bloques "Prompt exacto" × ~2 líneas adicionales por bloque + 1 fila aditiva en `MARCOS_PROMPTS` + delta en `specs/guia-matias-angular-windows/spec.md`) |
| 400-line budget risk | **Low** — bien por debajo del límite de chained PRs (400 líneas) y del límite de single PR (800 líneas). |
| Chained PRs recommended | **No**. |
| Chain strategy | **single-pr**. |
| Decision needed before apply | **No** — Mati ya dio el scope en el chat; este change documenta su decisión. |
| Strategy de commits | **4-5 commits atómicos** (uno por archivo: `AGENTS.md`, `GUIA.md`, `MATIAS_PROMPTS`, `MARCOS_PROMPTS`, `specs/.../spec.md`). Alternativa: 1 commit combinado si Mati lo prefiere. |
| Archivos a tocar | 5 (`AGENTS.md`, `GUIA.md`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `openspec/specs/guia-matias-angular-windows/spec.md`). |

**Justificación del delta estimado**: el precedent (PR #6) tocó 4 archivos con un delta de 22 inserciones / 21 eliminaciones, todos del lado de `MATIAS_PROMPTS` con bloques Prompt exacto casi idénticos. Este cycle es estructuralmente similar pero **agrega 1 archivo** (`specs/guia-matias-angular-windows/spec.md`, que el precedent no tocó). El delta real debería estar en el rango 50-100 líneas netas, dentro del presupuesto.

---

## Risks

| # | Riesgo | Likelihood | Mitigación |
|---|---|---|---|
| 1 | **Creación de rama con nombre equivocado**: si OpenCode corre `git switch -c frontend/anglar-shell ...` (typo), Mati tiene que borrar la rama manualmente. | Media | Branch-confirmation gate exige declarar el nombre exacto y esperar confirmación textual antes de crear. |
| 2 | **Pérdida de cambios por switch accidental**: si OpenCode switchea a una rama con cambios sin commitear en la rama actual, esos cambios podrían quedar en estado "uncommitted" en la rama equivocada o perderse. | Media | Branch-confirmation gate exige `git status --short` y que Mati confirme que el working tree está limpio o con cambios esperados. Si hay cambios sin commitear, OpenCode debe proponer `git stash` antes del switch y reverso posterior, o rechazar el switch. |
| 3 | **Confusión con el branch F0-02 no mergeado**: la rama `docs/matias-onboarding-f0-02-f0-03` (HEAD `182ec32`) sigue en `origin` pero **no mergeada** a `main`. OpenCode podría switear accidentalmente a esa rama confundiéndola con una rama estable. | Baja-Media | Branch-confirmation gate exige mostrar el último commit de la rama destino; el último commit de F0-02 (`182ec32 docs(matias): archivar verificacion de flujo opencode sdd (F0-02)`) no es de la rama activa, lo que sirve como señal de alerta. Adicionalmente, la spec explícitamente prohíbe switch a ramas no mergeadas sin coordinación. |
| 4 | **Cycle confusion**: este cycle es `permitir-git-switch-checkout-con-aprobacion-explicita`, no `permitir-merge-pr-rebase-con-aprobacion-explicita`. El nombre del change debe ser claro para evitar que OpenCode (o el operador) intente relajar también merge/PR/rebase. | Baja | El nombre del change, el `Goal` del `explore.md` y la spec (Scenario 4) son explícitos sobre qué queda dentro y fuera del scope. |
| 5 | **Deriva de redacción entre `AGENTS.md` y `GUIA.md`**: el precedent detectó 0 deriva, pero si el apply toca los dos archivos en pasadas distintas, puede haber inconsistencia temporal. | Baja | Aplicar ambos en la misma sesión de `sdd-apply`. |
| 6 | **Olvidar alguna instancia en `MATIAS_PROMPTS`**: el precedent tenía 19 bloques Prompt exacto pero el grep actual muestra **20 ocurrencias** (líneas 337, 379, 421, 467, 510, 556, 603, 649, 711, 761, 809, 857, 904, 951, 1001, 1048, 1096, 1141, 1189, 1233). El apply debe re-verificar el conteo con `grep -n "Prompt exacto para OpenCode"` antes y después. | Baja | Validación con grep antes y después del apply; el conteo post debe coincidir con el pre (20/20 reemplazados). |
| 7 | **Regresión sobre la fila 39 de `MATIAS_PROMPTS`** (tabla sobre flujo de Marcos): dice *"OpenCode solo ejecuta commit, push, merge o rebase con confirmación explícita de Marcos."* — no debe tocarse. | Baja | El apply debe verificar explícitamente que esa fila queda intacta (grep de `"confirmación explícita de Marcos"` debe retornar la misma línea que antes). |
| 8 | **No se detecte que el precedent no archivó `explore.md`**: este cycle sí debe archivarlo, pero el precedent solo archivó 6 artefactos. Si el archive no incluye `explore.md`, el precedent parecerá ser el modelo y este cycle también quedará incompleto. | Baja | El operador (Mati) debe aprobar el archive con los 8 artefactos. El `archive-report.md` debe listar los 8. |
| 9 | **No romper la rama F0-02 no mergeada**: como `docs/policy-git-switch-checkout` está basada en `main` (`9c631d0`) y la F0-02 también lo está, las dos ramas son independientes. Cualquier intento de mergear PR de este change no debe pushear cambios no revisados a la rama F0-02. | Baja | El apply no toca la rama F0-02; este change solo modifica los 5 archivos documentales. El push se hace solo a la rama `docs/policy-git-switch-checkout` con la aprobación explícita de Mati. |

---

## Next recommended phase

`sdd-propose` — la siguiente fase del ciclo es generar `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/proposal.md` siguiendo el patrón del precedent (`proposal.md` de `permitir-commit-con-aprobacion-explicita`, ~118 líneas), adaptado al scope de este cycle (sección `New Rule` con la redacción de `AGENTS.md:21` y `GUIA.md:153` actualizada, `Approval Protocol` con las 5 condiciones del branch-confirmation gate, `Rollback Plan`, `Dependencies`, `Success Criteria`).

No se requiere decisión adicional del operador antes de `sdd-propose`: el scope está claro, los assets están identificados, los riesgos están listados y la estimación de carga está dentro del presupuesto.

---

## Cambio documentado en Engram

Este explore se persiste en Engram con `topic_key: sdd/permitir-git-switch-checkout-con-aprobacion-explicita/explore` para que las próximas sesiones (F0-02 archive, F0-03, F1+, etc.) tengan contexto inmediato sobre la regla vigente de switch/checkout-b con branch-confirmation gate.

