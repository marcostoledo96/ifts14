# Archive Report: permitir-git-switch-checkout-con-aprobacion-explicita

**Fecha de cierre**: 2026-06-29
**Change archivado**: `permitir-git-switch-checkout-con-aprobacion-explicita`
**Rama**: `docs/policy-git-switch-checkout`
**HEAD al cierre**: `9c631d070f18d73a8e62365bbef10476eaf04201`
**Veredicto sdd-verify**: PASS

## Resumen

Este es el tercer ciclo de la serie de relajaciones operativas de la política Git para el flujo de Matías, continuación directa de `permitir-commit-con-aprobacion-explicita` (PR #6, mergeado en `9c631d0`). El change introduce el permiso explícito para que OpenCode ejecute `git switch <rama>`, `git switch -c <nueva-rama> <base>` y `git checkout -b <nueva-rama> <base>` bajo un nuevo **branch-confirmation gate** (análogo al diff-confirmation gate del ciclo anterior), con aprobación textual de Matías en el mismo turno del chat. Para lectura histórica sin modificar el working tree, se usa `git show <commit>:<archivo>`; `git checkout <commit> -- <archivo>` queda tratado como restauración de path y requiere el gate normal. Se reemplazan las prohibiciones amplias por una regla menos restrictiva: para Matías, solo `git push` directo a `main` queda siempre prohibido; las demás operaciones requieren aprobación explícita, comando exacto, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar. El workflow de Marcos y la rama F0-02 no mergeada (`182ec32`) permanecen intactos; cualquier cruce requiere coordinación explícita.

## Spec delta consolidado

La spec `openspec/specs/guia-matias-angular-windows/spec.md` ganó 1 Requirement nuevo (`Permiso explícito de git switch y git checkout -b con branch-confirmation gate`) con 5 Scenarios (Scenario 1: switch a rama existente con gate; Scenario 2: switch -c / checkout -b con gate; Scenario 3: primer push sin ref remota; Scenario 4: PR/merge/rebase bajo aprobación explícita y evidencia; Scenario 5: lectura histórica con `git show <commit>:<archivo>`). Las Requirements existentes de la spec base también se sincronizan para remover prohibiciones obsoletas.

## Archivos del change (movidos al archive)

Este es el primer ciclo de la serie de relajaciones de política que produce los 8 artefactos SDD completos. Los 7 artefactos SDD originales más este archive-report (8 totales):

1. `explore.md` — exploración y scope del change.
2. `proposal.md` — Why, What Changes, Approval Protocol.
3. `design.md` — decisiones técnicas y plan de validación.
4. `specs/permiso-git-switch-checkout-explicito/spec.md` — delta con 1 Requirement ADDED + 5 Scenarios.
5. `tasks.md` — 21 tareas de implementación.
6. `apply-progress.md` — bitácora de aplicación con todas las tareas marcadas [x].
7. `verify-report.md` — veredicto PASS del orchestrator (5/5 Scenarios, 13/13 Plan de validación).
8. `archive-report.md` — este reporte de cierre.

## Archivos NO movidos (modificados in-place, quedan en su ubicación original)

- `AGENTS.md:21` — la regla de policy ahora incluye `git switch` / `git checkout -b` con branch-confirmation gate, gates restantes reafirmados.
- `GUIA.md:153` — mirror en §9 Git con la misma estructura.
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:35-36` — nota aditiva `Git — nota 2` confirmando que el workflow de Marcos queda intacto.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — 20 ocurrencias de "Prompt exacto para OpenCode" actualizadas con el branch-confirmation gate + coordinación para ramas sensibles; línea 27 (Ruta rápida) y línea 1352 (Checklist final) actualizadas. Fila 39 (tabla sobre flujo de Marcos) intacta — no regresión sobre Marcos.
- `openspec/specs/guia-matias-angular-windows/spec.md` — modificado in-place con el delta consolidado (1 Requirement nuevo con 5 Scenarios agregado al final de la sección Requirements).

## Patches aplicados durante el ciclo

Listado arriba en "Archivos NO movidos". El balance total reportado en `apply-progress.md` es de 26 inserciones y 25 eliminaciones sobre los 4 archivos operativos. A esto se suma el delta consolidado en la spec base (~30 líneas para el Requirement ADDED) y los 8 artefactos del change directory.

## Estado final del working tree (después del archive)

```
 M AGENTS.md
 M GUIA.md
 M MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
 M MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
 M openspec/specs/guia-matias-angular-windows/spec.md
?? openspec/changes/archive/2026-06-28-permitir-git-switch-checkout-con-aprobacion-explicita/
```

Verificación:

- `git rev-parse HEAD` → `9c631d070f18d73a8e62365bbef10476eaf04201` (sin commits del agente).
- `git rev-parse --abbrev-ref HEAD` → `docs/policy-git-switch-checkout` (rama correcta).
- El directorio `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/` ya NO existe (fue movido).
- El directorio `openspec/changes/archive/2026-06-28-permitir-git-switch-checkout-con-aprobacion-explicita/` contiene los 8 artefactos SDD.
- `git diff --name-only` lista los 5 archivos modificados in-place.
- La rama F0-02 `docs/matias-onboarding-f0-02-f0-03` permanece en `182ec32` — intacta.
- El change de Marcos `openspec/changes/backend-public-endpoint-hardening/` permanece intacto.

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
git add openspec/specs/guia-matias-angular-windows/spec.md openspec/changes/archive/2026-06-28-permitir-git-switch-checkout-con-aprobacion-explicita/ AGENTS.md GUIA.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git commit -m "docs(governance): permitir git switch y checkout -b con aprobacion explicita (tercera relajacion operativa)"
git push origin docs/policy-git-switch-checkout
```

Pre-push safety: si existe `origin/<rama>`, Mati debe correr `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, debe declarar que la ref remota no existe y comparar contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`.

## Próximo ciclo recomendado

F0-03 — Leer documentación mínima y entender misión. Branch sugerida: `docs/matias-onboarding-f0-03`. Definición en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 441-483.

**Cambio operativo importante**: con la regla de este cycle ya consolidada, OpenCode PUEDE crear la rama de F0-03 él mismo, con aprobación explícita de Mati y branch-confirmation gate. Ya no es necesario que Mati la cree manualmente.

## Trazabilidad Engram

El ciclo quedó registrado en Engram con 7 observaciones bajo el topic family `sdd/permitir-git-switch-checkout-con-aprobacion-explicita/*`:

- `#38` — Explore (2026-06-28 22:56)
- `#39` — Proposal (2026-06-28 22:59)
- `#40` — Spec (2026-06-28 23:04)
- `#41` — Design (2026-06-28 23:08)
- `#42` — Tasks (2026-06-29 20:58)
- `#43` — Apply progress (2026-06-29 21:04)
- `#44` — Verify report (2026-06-29 21:07)

Este archive-report se guarda como observación adicional bajo el topic_key `sdd/permitir-git-switch-checkout-con-aprobacion-explicita/archive-report` con `capture_prompt: false` (artefacto automatizado del sub-agente sdd-archive).
