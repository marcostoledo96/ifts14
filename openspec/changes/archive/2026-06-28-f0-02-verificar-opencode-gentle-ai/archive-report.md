# Archive Report: F0-02 — Verificar OpenCode/Gentle-AI

**Fecha de cierre**: 2026-06-28
**Change archivado**: `f0-02-verificar-opencode-gentle-ai`
**Rama**: `docs/matias-onboarding-f0-02-f0-03`
**HEAD al cierre**: `11e0d3e3de85f886249a2b1b077359402278dd17`
**Veredicto sdd-verify**: PASS

## Resumen

F0-02 fue un ciclo de documentación pura que verificó empíricamente que OpenCode/Gentle-AI recorre las ocho fases SDD en una corrida real, identifica correctamente el repositorio `ifts14` y la rama activa, respeta las prohibiciones Git codificadas en `AGENTS.md:21` y `GUIA.md:153`, y no genera código de producto. El ciclo cerró con `sdd-verify` PASS (10/10 comprobaciones del Plan de validación, 5/5 Scenarios con evidencia, 18/18 tareas completadas, cero hallazgos CRÍTICOS) y se archivó moviendo la carpeta activa a `openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/`, fusionando el delta aditivo en la spec base `guia-matias-angular-windows` y dejando como entregable permanente el reporte `docs/opencode/verificacion-flujo-opencode-sdd.md`. No se ejecutó `git add`, `git commit` ni `git push` por cuenta del agente; el HEAD permanece intacto y los comandos Git quedan como propuesta para aprobación explícita de Mati en el mismo turno del chat, conforme a la política de `AGENTS.md:21`.

## Spec delta consolidado

La spec `openspec/specs/guia-matias-angular-windows/spec.md` ganó 1 Requirement nuevo (`Verificación del flujo OpenCode/Gentle-AI`) con 5 Scenarios (DADO/CUANDO/ENTONCES en español argentino formal), insertado al final del bloque `## Requirements` luego del Requirement "Reporte final y propuestas Git". Las 8 Requirements existentes no se modificaron.

| Dominio | Acción | Detalle |
|---------|--------|---------|
| `guia-matias-angular-windows` | Updated (delta aditivo) | 1 requirement nuevo, 5 scenarios nuevos, 0 requirements modificados, 0 eliminados, 0 renombrados |

Detalle del Requirement agregado:

- **Requirement: Verificación del flujo OpenCode/Gentle-AI**
  - Scenario: Identificación correcta del repositorio y la rama
  - Scenario: Recorrido completo de las 8 fases SDD
  - Scenario: Respeto de las prohibiciones y la política Git vigente
  - Scenario: Cero modificaciones de producto
  - Scenario: Evidencia de cierre

## Archivos del change (movidos al archive)

Se movieron 7 artefactos SDD propios del ciclo desde `openspec/changes/f0-02-verificar-opencode-gentle-ai/` hacia `openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/`:

| Artefacto | Ruta en el archive | Tamaño aprox. |
|-----------|--------------------|---------------|
| Exploración | `explore.md` | 12.8 KB |
| Propuesta | `proposal.md` | 6.4 KB |
| Diseño técnico | `design.md` | 7.8 KB |
| Plan de tareas | `tasks.md` | 4.9 KB |
| Progreso de apply | `apply-progress.md` | 6.0 KB |
| Reporte de verificación | `verify-report.md` | 9.0 KB |
| Spec delta | `specs/verificacion-flujo-opencode-sdd/spec.md` | 4.3 KB |

Verificación post-move: la carpeta activa `openspec/changes/f0-02-verificar-opencode-gentle-ai/` ya no existe; su contenido vive en el archive como evidencia histórica, conforme a `openspec/AGENTS.md` ("No borrar cambios archivados: son evidencia").

## Archivos NO movidos (quedan en su ubicación original)

- `docs/opencode/verificacion-flujo-opencode-sdd.md` — evidencia documental permanente. Es el entregable del ciclo; vive fuera de la carpeta de change y queda como referencia operativa en `docs/opencode/`, indexada por `docs/00-indice-general.md`.
- `openspec/specs/guia-matias-angular-windows/spec.md` — modificado in-place con el delta consolidado. La spec base pasa de 8 a 9 Requirements.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — modificado durante el ciclo (`sdd-apply`) y durante este `sdd-archive` (índice F0-F3).

## Patches aplicados durante el ciclo

Aplicados durante `sdd-apply` (Fase 4, decisión de Mati 2026-06-28):

- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:402` — `Rama sugerida: docs/matias-onboarding-windows` → `Rama sugerida: docs/matias-onboarding-f0-02-f0-03` (F0-02). Aprobado por Mati 2026-06-28.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:444` — ídem (F0-03). Aprobado por Mati 2026-06-28.

Aplicados durante este `sdd-archive`:

- `openspec/specs/guia-matias-angular-windows/spec.md` — agregado del Requirement `Verificación del flujo OpenCode/Gentle-AI` con sus 5 Scenarios.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:14` — fila F0-02 del índice F0-F3 actualizada: estado `⏳` → `✅`, columna Commit/Notas → `archive cerrado; commit pendiente (HEAD `11e0d3e`)`.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:34` — resumen actualizado: `1 de 20 hecho. 19 pendientes.` → `2 de 20 hecho. 18 pendientes.`

## Estado final del working tree (después del archive)

```
 M MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
 M openspec/specs/guia-matias-angular-windows/spec.md
?? docs/opencode/verificacion-flujo-opencode-sdd.md
?? openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/
```

Interpretación:

- **2 archivos tracked modificados**: la spec base (delta aditivo) y `MATIAS_PROMPTS` (patches de rama + índice F0-F3).
- **1 archivo untracked**: la evidencia documental del ciclo en `docs/opencode/`.
- **1 carpeta untracked**: el archive recién creado (todo su contenido es untracked; el move desde la carpeta activa preservó ese estado, lo cual es correcto porque la carpeta activa original tampoco estaba tracked).
- **No hay** untracked `openspec/changes/f0-02-verificar-opencode-gentle-ai/` (correcto: fue movido, no copiado).
- **No hay** paths bajo `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/` ni archivos de configuración de runtime.
- **No hay** modificaciones a `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos, intacto).

HEAD permanece en `11e0d3e3de85f886249a2b1b077359402278dd17` — cero commits nuevos por parte del agente.

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
git add openspec/specs/guia-matias-angular-windows/spec.md openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/ docs/opencode/verificacion-flujo-opencode-sdd.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git commit -m "docs(matias): archivar verificacion de flujo opencode sdd (F0-02)"
git push origin docs/matias-onboarding-f0-02-f0-03
```

**Diff-confirmation gate (pre-commit)**: Mati debe correr `git status --short` y `git diff --name-only` y confirmar antes del `git add`.

**Pre-push safety**: antes del `git push`, Mati debe correr:

```powershell
git log origin/docs/matias-onboarding-f0-02-f0-03..docs/matias-onboarding-f0-02-f0-03 --oneline
git diff origin/docs/matias-onboarding-f0-02-f0-03..docs/matias-onboarding-f0-02-f0-03 --stat
```

y confirmar que el diff es correcto y se limita a los 4 paths listados arriba.

## Resumen de cumplimiento

| Dimensión | Estado |
|-----------|--------|
| Spec delta fusionado (1 ADDED Requirement) | ✅ |
| Carpeta activa movida al archive (no copiada) | ✅ |
| Spec base no perdió requirements | ✅ |
| Working tree limpio de paths prohibidos | ✅ |
| `backend-public-endpoint-hardening/` intacto | ✅ |
| HEAD sin commits nuevos del agente | ✅ |
| Comandos Git solo propuestos | ✅ |
| Engram archive-report pendiente de persistir | (siguiente paso) |

## Próximo ciclo recomendado

**F0-03 — Leer documentación mínima y entender misión** (tercer paso del onboarding de Matías definido en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`).

- **Rama sugerida**: `docs/matias-onboarding-f0-02-f0-03` (misma rama, ya parcheada en línea 444 de la guía). Si Mati prefiere una rama dedicada, el nombre canónico sería `docs/matias-onboarding-f0-03` y debería ajustar la línea 15 del índice F0-F3.
- **Definición del ciclo**: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 441-483 (con la rama ya parcheada en línea 444).
- **Objetivo**: lectura mínima de `AGENTS.md`, `docs/00-indice-general.md`, `docs/opencode/optimizacion-tokens.md` y el ciclo activo, dejando registro de comprensión en un reporte `docs/opencode/lectura-minima-y-mision.md`.
- **Estado actual en el índice**: ⏳ (fila 15 de `MATIAS_PROMPTS`), pendiente.
