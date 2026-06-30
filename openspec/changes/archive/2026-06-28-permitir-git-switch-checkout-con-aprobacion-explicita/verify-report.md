# Verify Report: permitir-git-switch-checkout-con-aprobacion-explicita

**Veredicto**: PASS

**Fecha**: 2026-06-29
**Change**: `permitir-git-switch-checkout-con-aprobacion-explicita`
**Branch**: `docs/policy-git-switch-checkout`
**HEAD al cierre**: `9c631d070f18d73a8e62365bbef10476eaf04201`

## Resumen

Se verificó la implementación completa del change: los 4 archivos operativos (`AGENTS.md`, `GUIA.md`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`) reflejan correctamente la tercera relajación operativa de la política Git — `git switch`, `git switch -c` y `git checkout -b` con branch-confirmation gate y aprobación explícita de Matías. Los 5 Scenarios de la spec delta tienen evidencia PASS concreta. Las 21 tareas están completas. No hay hallazgos CRITICAL ni WARNING. La rama F0-02 (`182ec32`), el change de Marcos (`backend-public-endpoint-hardening`) y las áreas fuera de scope permanecen intactos.

## Plan de validación ejecutado

| # | Comando / Check | Resultado esperado | Resultado real | PASS/FAIL |
|---|-----------------|--------------------|-----------------|-----------|
| 1 | `git status --short` | Solo untracked/modified: change dir + 4 governance files | `M AGENTS.md`, `M GUIA.md`, `M MARCOS_PROMPTS...`, `M MATIAS_PROMPTS...`, `?? openspec/changes/.../` | PASS |
| 2 | `git diff --name-only` | Solo `AGENTS.md`, `GUIA.md`, `MARCOS_PROMPTS...`, `MATIAS_PROMPTS...` | Exactamente esos 4 archivos | PASS |
| 3 | `git rev-parse --abbrev-ref HEAD` | `docs/policy-git-switch-checkout` | `docs/policy-git-switch-checkout` | PASS |
| 4 | `git rev-parse HEAD` | `9c631d0` (sin commits del agente) | `9c631d070f18d73a8e62365bbef10476eaf04201` | PASS |
| 5 | `git remote get-url origin` | URL que contiene `ifts14` | `https://github.com/marcostoledo96/ifts14.git` | PASS |
| 6 | `git log origin/docs/policy-git-switch-checkout..docs/policy-git-switch-checkout --oneline` | Debía manejar primer push sin ref remota | `fatal: ambiguous argument` — la rama remota no existía | FAIL corregido en PR #11: usar variante de primer push contra la base aprobada |
| 7 | `git grep -i -c "branch-confirmation gate" AGENTS.md GUIA.md` | ≥ 1 en cada archivo | `AGENTS.md:1`, `GUIA.md:1` | PASS |
| 8 | `git grep -c "Prompt exacto para OpenCode" MATIAS_PROMPTS...` | 20/20 (sin cambios en el conteo) | `20` | PASS |
| 9 | `git grep -n "Git" MARCOS_PROMPTS... \| head -5` | Contiene la nota aditiva (`Git — nota 2`) | Línea 37: `\| Git — nota 2 \| El nuevo permiso de \`git switch\`/\`git checkout -b\` con branch-confirmation gate aplica solo al flujo de Matías...` | PASS |
| 10 | Fila Marcos en `MATIAS_PROMPTS...` y frase en `MARCOS_PROMPTS...` | Fila 39 de `MATIAS_PROMPTS` intacta; `MARCOS_PROMPTS:35` con "confirmación explícita de Marcos" intacta | `MATIAS_PROMPTS:39`: fila Git con referencia al flujo de Marcos intacta. `MARCOS_PROMPTS:35`: frase "confirmación explícita de Marcos" presente | PASS |
| 11 | Engram topics bajo `sdd/permitir-git-switch-checkout-con-aprobacion-explicita/*` | 6 antes de verify (+1 = 7 al cerrar) | 6 topics actuales (explore, proposal, spec, design, tasks, apply-progress); +1 (verify-report) = 7 | PASS |
| 12 | Spec delta acceptance (5 Scenarios) | Cada Scenario con evidencia PASS en `apply-progress.md` | Los 5 Scenarios tienen PASS documentado con evidencia concreta (ver sección Mapeo) | PASS |
| 13 | F0-02 branch integrity | `git rev-parse docs/matias-onboarding-f0-02-f0-03` = `182ec32` (NO tocada) | `182ec32aa91792ebbdbd024275ab00ea8d523910` | PASS |

## Mapeo de Scenarios a evidencia

| Scenario | Evidencia (archivo + sección) | Veredicto |
|----------|-------------------------------|-----------|
| 1. `git switch` a rama existente con branch-confirmation gate | `AGENTS.md:21` (regla completa con gate + aprobación explícita), `GUIA.md:153` (mirror), `MATIAS_PROMPTS:27` (Ruta rápida punto 8) y los 20 bloques "Prompt exacto" (líneas 337-1233, cada uno con el gate). `apply-progress.md:83` confirma PASS. | PASS |
| 2. `git switch -c` / `git checkout -b` para crear rama con gate | Los mismos archivos incluyen explícitamente `git switch -c <nueva-rama> <base>` y `git checkout -b <nueva-rama> <base>` con branch-confirmation gate y declaración de nombre/base. `apply-progress.md:84` confirma PASS. | PASS |
| 3. Ramas sensibles bajo coordinación | Corrección PR #11: no hay prohibición dura de cambio de rama para Matías salvo el riesgo de `git push` directo a `main`; ramas sensibles requieren aprobación explícita, evidencia previa, árbol limpio y coordinación cuando corresponda. | PASS corregido |
| 4. PR, `git merge` y `git rebase` bajo aprobación explícita | Corrección PR #11: estas operaciones no quedan prohibidas por blanket policy; requieren aprobación explícita de Matías, comando exacto, evidencia previa y árbol limpio o decisión explícita de stash/commit/abortar. | PASS corregido |
| 5. Lectura histórica con `git show <commit>:<archivo>` | Corrección PR #11: para lectura histórica se usa `git show <commit>:<archivo>`; `git checkout <commit> -- <archivo>` se trata como restauración de path y requiere el gate normal. | PASS corregido |

## Tareas verificadas

**21/21 tareas completadas (PASS)**.

| Phase | Tareas | Estado |
|-------|--------|--------|
| Phase 1 — Preparación | 1.1, 1.2, 1.3, 1.4 | ✅ 4/4 |
| Phase 2 — Modificación de archivos | 2.1, 2.2, 2.3, 2.4, 2.5, 2.6 | ✅ 6/6 |
| Phase 3 — Validación previa al verify | 3.1, 3.2, 3.3, 3.4, 3.5 | ✅ 5/5 |
| Phase 4 — Cierre | 4.1, 4.2, 4.3, 4.4 | ✅ 4/4 |
| Phase 5 — Sanity final | 5.1, 5.2 | ✅ 2/2 |

Todas las tareas fueron marcadas `[x]` en `apply-progress.md` con evidencia documentada. La tarea 4.1 ("Esperar sdd-verify PASS") se cumple en este mismo reporte.

## Hallazgos

### CRITICAL
Ninguno.

### WARNING
Ninguno.

### SUGGESTION
- **Branch remota inexistente**: `git log origin/docs/policy-git-switch-checkout..docs/policy-git-switch-checkout` falla porque la rama aún no fue pusheada. No debe marcarse como PASS. Corrección PR #11: en primer push, declarar que la ref remota no existe y comparar contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`.
- **Design command #10 vs. apply-progress.md**: el design esperaba `git grep "confirmación explícita de Marcos" MATIAS_PROMPTS...` pero esta frase vive en `MARCOS_PROMPTS:35`, no en `MATIAS_PROMPTS`. El `apply-progress.md:123` documenta correctamente esta aclaración. La verificación se realizó sobre ambos archivos: `MARCOS_PROMPTS:35` intacta y `MATIAS_PROMPTS:39` (tabla de Marcos) intacta.

## Patches aplicados durante el apply

- `AGENTS.md:21` — reemplazada la prohibición absoluta de `git switch`/`git checkout` por regla con alcance: `git switch`, `git switch -c`, `git checkout -b` con branch-confirmation gate y aprobación explícita; gates restantes reafirmados; única prohibición dura para Matías: `git push` directo a `main`. (+1 inserción, -1 eliminación)
- `GUIA.md:153` — mirror de la nueva regla en §9 Git, con la misma estructura: branch-confirmation gate, permiso acotado, gates reafirmados. (+1 inserción, -1 eliminación)
- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:37` — nota aditiva (`Git — nota 2`) confirmando que el nuevo permiso aplica solo al flujo de Matías y que el workflow de Marcos permanece intacto. (+1 inserción, 0 eliminaciones)
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — 20 ocurrencias de "Prompt exacto para OpenCode" actualizadas con el branch-confirmation gate + la coordinación para ramas sensibles; línea 27 (Ruta rápida) y línea 1352 (Checklist final) actualizadas. Fila 39 (tabla de Marcos) intacta. (+23 inserciones, -23 eliminaciones)
- `openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/` — directorio completo del change con 7 artefactos OpenSpec (explore, proposal, spec, design, tasks, apply-progress, verify-report), más archive-report pendiente.

## Estado Git

- Working tree:
  ```
   M AGENTS.md
   M GUIA.md
   M MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
   M MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
  ?? openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/
  ```
- HEAD: `9c631d070f18d73a8e62365bbef10476eaf04201`
- Branch: `docs/policy-git-switch-checkout`
- Commits nuevos por el agente: 0
- Rama F0-02 (`docs/matias-onboarding-f0-02-f0-03`): `182ec32` — intacta
- Change de Marcos (`openspec/changes/backend-public-endpoint-hardening/`): sin modificaciones
- Áreas fuera de scope (`apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`): sin modificaciones

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
git add openspec/changes/permitir-git-switch-checkout-con-aprobacion-explicita/ AGENTS.md GUIA.md MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git commit -m "docs(governance): permitir git switch y checkout -b con aprobacion explicita (tercera relajacion operativa)"
git push origin docs/policy-git-switch-checkout
```

Pre-push safety: si existe `origin/<rama>`, Mati debe correr `git log origin/<rama>..<rama> --oneline` y `git diff origin/<rama>..<rama> --stat`; si es primer push, debe declarar que la ref remota no existe y comparar contra la base aprobada con `git log <base>..HEAD --oneline` y `git diff <base>...HEAD --stat`.

## Próximo paso

`sdd-archive` (cierre del ciclo) — el veredicto es **PASS**. Después, F0-03 puede arrancar: esta vez OpenCode PUEDE crear la rama `docs/matias-onboarding-f0-03` él mismo, con aprobación explícita de Mati y el branch-confirmation gate.
