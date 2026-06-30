# Archive Report: F0-03 — Leer documentación mínima y entender misión

**Fecha de cierre**: 2026-06-29
**Change archivado**: `f0-03-leer-documentacion-minima-y-mision`
**Rama**: `docs/matias-onboarding-f0-03`
**HEAD al cierre**: `711e3cafc8aef6fa992248cb77d5df5a5e7db6d3`
**Veredicto sdd-verify**: PASS (5/5 Scenarios)

## Resumen

F0-03 es el tercer y más importante ciclo del onboarding de Fase 1 de Matías: produce una **síntesis operativa** (`docs/opencode/onboarding-matias-frontend.md`) que codifica la misión, el alcance permitido, el fuera de alcance, las 8 fuentes de verdad vigentes y los límites de Matías, todo enlazando — sin duplicar — la documentación base. El ciclo también declara explícitamente el estado real de `muestra_pagina/` (NO vacía: v0 export con 7 pantallas disponibles y 12 pendientes) y respeta el scaffold Angular 20 preexistente de Marcos en `apps/frontend-angular/` (35/35 tests, build verde), declarando que no debe rehacerse. Es un ciclo documental puro: cero modificaciones de código de producto, cero secretos, cero toques al cambio activo de Marcos ni a las ramas no mergeadas.

## Spec delta consolidado

La spec `openspec/specs/guia-matias-angular-windows/spec.md` recibió **1 Requirement ADDED** (`Misión de Matías sintetizada para onboarding frontend`) con 5 Scenarios en formato Given/When/Then (DADO/CUANDO/ENTONCES) en español. Las 9 Requirements existentes no se modificaron. La spec base ahora tiene 10 Requirements en total.

## Archivos del change (movidos al archive)

Los 7 artefactos SDD producidos durante el ciclo, más el `archive-report.md` creado en este cierre, quedaron en `openspec/changes/archive/2026-06-28-f0-03-leer-documentacion-minima-y-mision/`:

1. `explore.md` — exploración del ciclo.
2. `proposal.md` — propuesta con alcance, riesgos y rollback.
3. `design.md` — decisiones técnicas y plan de validación.
4. `tasks.md` — plan de tareas jerárquico (25/25 completas).
5. `specs/mision-matias-sintetizada/spec.md` — delta aditivo con 1 Requirement y 5 Scenarios.
6. `apply-progress.md` — estado de implementación (26/26 tareas verificadas, decisión de patches).
7. `verify-report.md` — veredicto PASS con 15/15 checks de validación y 5/5 Scenarios mapeados a evidencia.
8. `archive-report.md` — este archivo (cierre del ciclo).

## Archivos NO movidos (modificados o creados in-place)

- `openspec/specs/guia-matias-angular-windows/spec.md` — modificado in-place con el delta consolidado (10° Requirement ADDED; 29 líneas añadidas, 0 removidas).
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (línea 452) — parche aplicado dentro de la sección "Ciclo F0-03": `Rama sugerida: \`docs/matias-onboarding-f0-02-f0-03\`` → `Rama sugerida: \`docs/matias-onboarding-f0-03\``. Corrige el nombre stale heredado del parche de F0-02.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (línea 15, fila F0-03 del índice F0-F3) — parche aplicado: nombre de rama actualizado de `docs/matias-onboarding-f0-02-f0-03` a `docs/matias-onboarding-f0-03`. El status `⏳` se mantiene hasta que Mati commitee el ciclo (decisión final del orquestador, prevalece sobre la indicación previa de `apply-progress.md` que sugería `✅`; la fila se actualizará a `✅` y el commit hash se fijará cuando Mati ejecute el commit del PR).
- `docs/opencode/onboarding-matias-frontend.md` — archivo nuevo permanente, **NO se mueve al archive**: es el entregable principal del ciclo y queda accesible en `docs/opencode/` para Mati y los ciclos F1+.

## Patches aplicados durante el ciclo

Los dos patches planificados en `sdd-tasks` y reservados para `sdd-archive` se aplicaron aquí, en este orden:

1. **`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:452`** — corrección de rama en la sección "Ciclo F0-03".
2. **`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:15`** — corrección de rama en la fila F0-03 del índice F0-F3.

Verificación: `git diff MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` muestra exactamente 2 cambios de línea, ambos solo en el nombre de la rama sugerida.

## Estado final del working tree (después del archive)

```
 M MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
 M openspec/specs/guia-matias-angular-windows/spec.md
?? docs/opencode/onboarding-matias-frontend.md
?? openspec/changes/archive/2026-06-28-f0-03-leer-documentacion-minima-y-mision/
```

- 2 archivos tracked modificados (spec base merge + parche de guía).
- 1 archivo nuevo permanente: `docs/opencode/onboarding-matias-frontend.md` (entregable).
- 1 directorio nuevo: el archive del change (los 7 artefactos SDD + `archive-report.md`).
- `openspec/changes/f0-03-leer-documentacion-minima-y-mision/` ya NO existe (fue movido).
- HEAD sigue en `711e3ca` (cero commits del agente).
- Working tree: solo paths esperados; no hay diffs en `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, `openspec/changes/backend-public-endpoint-hardening/`, ni en las ramas `docs/matias-onboarding-f0-02-f0-03` o `docs/policy-git-switch-checkout`.

## Comandos Git PROPUESTOS al operador (NO ejecutados por el agente)

Conforme `AGENTS.md:21` y `GUIA.md:153`, el agente NO ejecuta `git add` / `git commit` / `git push`. El operador (Mati) debe revisar y aprobar cada paso con el diff-confirmation gate previo:

```powershell
# Pre-commit safety (diff-confirmation gate): revisar antes de stage
git status --short
git diff --name-only

# Stage de los 4 paths del ciclo
git add openspec/specs/guia-matias-angular-windows/spec.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md docs/opencode/onboarding-matias-frontend.md openspec/changes/archive/2026-06-28-f0-03-leer-documentacion-minima-y-mision/

# Commit
git commit -m "docs(matias): registrar onboarding frontend"

# Pre-push safety: revisar antes de push
git log origin/docs/matias-onboarding-f0-03..docs/matias-onboarding-f0-03 --oneline
git diff origin/docs/matias-onboarding-f0-03..docs/matias-onboarding-f0-03 --stat

# Push
git push origin docs/matias-onboarding-f0-03
```

Una vez que Mati commitee y pushee, la fila F0-03 del índice F0-F3 en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` deberá actualizarse de `⏳` a `✅` y completarse la columna "Commit/Notas" con el hash resultante. Ese ajuste queda fuera del archive (es mantenimiento del índice, no parte del cierre del ciclo).

## Próximo ciclo recomendado

F1-01 — Auditar `muestra_pagina/`. Definición disponible en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (la rama sugerida del ciclo F1-01 también puede tener un nombre stale heredado de parches anteriores; podemos chequearlo al arrancar F1-01 o esperar a que Mati lo note). Mati ya cuenta con el resumen operativo de su rol, alcance, fuentes de verdad y límites en `docs/opencode/onboarding-matias-frontend.md`, así que puede arrancar el trabajo de producto cuando quiera, respetando las prohibiciones declaradas en la síntesis (no backend, no `material_privado_no_versionar/`, no rehacer el scaffold Angular, no inventar pantallas para los flujos 11-22 sin diseño aprobado).
