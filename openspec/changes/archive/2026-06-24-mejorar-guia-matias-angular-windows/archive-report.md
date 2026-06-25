# Archive report — mejorar-guia-matias-angular-windows

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-24-mejorar-guia-matias-angular-windows/` y spec promovida a `openspec/specs/guia-matias-angular-windows/spec.md` (creación, no merge: no existía spec principal para el dominio).

Veredicto del ciclo: `PASS WITH WARNINGS`. Cero issues CRITICAL. SDD cycle complete.

## Qué cambió

Reescritura completa de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como manual ejecutable de Angular 20 en Windows para Matías, organizado en 4 work units conceptuales:

- **WU1 — Estructura y secciones base**: ruta rápida, misión, contexto operativo, preparación Windows con PowerShell/`winget`/alternativa manual, flujo OpenCode + SDD, política frontend y QA, errores comunes, plantilla de ciclo y plantilla de reporte.
- **WU2 — Ciclos F0-01..F1-05**: F0 cubre preparación Windows + onboarding; F1 cubre auditoría v0, sistema visual, app Angular 20, Tailwind y layout base.
- **WU3 — Ciclos F2-01..F3-06**: F2 cubre features y componentes Angular; F3 cubre servicios mock, conexión futura con API PHP, tests básicos, QA manual completo, build para `/certificados/` y handoff a Marcos.
- **WU4 — Referencias, cierre y verificación**: índice de comandos PowerShell, fuentes de verdad, checklist transversal, mapeo spec → guía, comandos Git propuestos sin ejecutar.

20 ciclos autocontenidos verificables (F0-01..F0-03, F1-01..F1-05, F2-01..F2-06, F3-01..F3-06), cada uno con objetivo, rama sugerida, lecturas, prompt para OpenCode, validaciones, QA manual, archive, qué no hacer y commit sugerido.

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `guia-matias-angular-windows` | Creada | 8 requisitos, 8 escenarios Given/When/Then. Es un contrato documental, no de producto. |

Nota: el proposal explícitamente declara "este cambio es puramente documental, no modifica capabilities de producto ni contratos de comportamiento". Se sigue la convención OpenSpec de crear el spec principal en `openspec/specs/` para mantener la trazabilidad del cambio, aunque el "contrato" sea de documentación.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `exploration.md` | `openspec/changes/mejorar-guia-matias-angular-windows/` (ahora archivado) |
| `proposal.md` | id. |
| `design.md` | id. |
| `specs/guia-matias-angular-windows/spec.md` | id. |
| `tasks.md` | id. |
| `apply-progress.md` | id. |
| `verify-report.md` | id. |
| `README.md`, `GUIA.md`, `AGENTS.md` (root) | Repo |
| `docs/00-indice-general.md` | Repo |
| `docs/frontend/00-angular20-port-v0.md` | Repo |
| `apps/frontend-angular/AGENTS.md` | Repo |
| `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md` | Repo |
| `openspec/AGENTS.md`, `openspec/specs/README.md` | Repo |
| `openspec/changes/archive/*/archive-report.md` (3 previos) | Repo, referencia de formato |

Skills cargadas: `sdd-archive`, `cognitive-doc-design`, `documentation-writer`.

## Archivos modificados

| Archivo | Estado | Alcance |
|---|---|---|
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Modificado (trackeado) | Reescritura completa, 1354 inserciones, 56 eliminaciones. |
| `docs/00-indice-general.md` | Sin cambios | El título, ruta y función de la guía no cambiaron; el índice sigue vigente. |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Creado | Spec principal, copia del delta del cambio. |
| `openspec/changes/archive/2026-06-24-mejorar-guia-matias-angular-windows/` | Movido | Carpeta del cambio completa: exploration, proposal, design, specs, tasks, apply-progress, verify-report, archive-report. |

No se modificaron `apps/`, `database/`, `deploy/`, `material_privado_no_versionar/`, `docs/frontend/`, ni configuración de producto.

## Evidencia de verificación

| Comando | Resultado |
|---|---|
| `git status --short --untracked-files=all` | 1 archivo modificado (`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`) + 7 artefactos OpenSpec no trackeados (los del cambio). |
| `git diff --stat` | `1410 líneas modificadas` (`1354 +`, `56 −`) en la guía. |
| `git diff --name-status` | Solo `M MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`. |
| `git diff --check` | Sin warnings de whitespace. |
| Tareas (WU1..WU4) | 24/24 marcadas `[x]` en `tasks.md`. |
| Spec → guía | 8/8 requisitos con sección o ciclo asignado. |
| Correctitud documental | PASS (no secretos, no material privado, no backend/DB, no Git automático, no deps no aprobadas, no invención de contratos). |
| Coherencia con `AGENTS.md`, `GUIA.md`, `docs/frontend/00-angular20-port-v0.md` | PASS. |

No se ejecutaron `npm`, `ng`, PHP, MariaDB, build ni tests de producto por instrucción explícita del ciclo documental (strict TDD inactivo).

## Warnings y notas

### WARNING — Diff de la guía supera el presupuesto de revisión (800 líneas)

El `git diff --stat` muestra `1410 ++++++++++++++++++++++++--` (`1354` inserciones, `56` eliminaciones) en un solo archivo, por encima del presupuesto declarado de 800 líneas modificadas. El contenido está dividido conceptualmente en WU1–WU4 y eso permite revisar por bloque, pero el working tree sigue presentando un cambio grande de un solo archivo.

Recomendación: si se decide versionar, dividir el commit en 4 work units encadenadas (`stacked-to-main`), una por bloque conceptual:

- WU1 — estructura y secciones base
- WU2 — ciclos F0-01..F1-05
- WU3 — ciclos F2-01..F3-06
- WU4 — referencias, cierre y verificación

### WARNING — Artefactos OpenSpec del cambio no trackeados

Los 7 archivos del cambio (`exploration.md`, `proposal.md`, `design.md`, `specs/.../spec.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`) están listados como `??` en `git status`. Esto es esperable porque en este ciclo no se pidió commit y la guía rápida de Marcos en `AGENTS.md` lo prohíbe, pero debe revisarse antes de cualquier `git add`. Verificar que el primer commit seguro del proyecto (aún no realizado) cubra todo `openspec/changes/archive/` y la nueva `openspec/specs/guia-matias-angular-windows/`.

### SUGGESTION

- Si se decide versionar la guía junto con su spec, mantener `docs/00-indice-general.md` sin cambios (correcto: la ruta y función de la guía siguen iguales).
- El spec principal nuevo (`openspec/specs/guia-matias-angular-windows/spec.md`) refleja un contrato documental, no una capacidad de producto. Es consistente con el patrón de specs documentales previos (`repo-precommit`, `repo-limpio`).

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Revisión pesada por tamaño del diff | Media | Revisar por WU con el mapeo spec → guía adjunto al final de la propia guía. |
| Artefactos OpenSpec sin trackear | Baja | Confirmar `git status --short --untracked-files=all` antes de stagear. |
| Obsolescencia futura de comandos Angular CLI / Tailwind | Baja | La guía indica explícitamente "verificar comandos disponibles con `--help`" y no inventar evidencia. |
| Cambio de versiones (Angular 20 → 21, Node 22 → 24) | Baja | Documentadas las versiones objetivo en la propia guía y nota de verificación. |
| `muestra_pagina/` aún vacía al momento de iniciar F1 | Media | La guía bloquea UI final y limita trabajo a estructura, documentación o preparación. |

## Comandos Git propuestos (no ejecutar)

Estos son los comandos sugeridos a Marcos, extraídos del cierre del ciclo. NO se ejecutaron en este ciclo:

```bash
# 1. Revisar el estado actual
git status --short --untracked-files=all
git diff --stat -- MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md

# 2. Stagiar la guía modificada (puede partirse por WU)
git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git add openspec/changes/archive/2026-06-24-mejorar-guia-matias-angular-windows/
git add openspec/specs/guia-matias-angular-windows/spec.md

# 3. Mensaje de commit sugerido (estilo conventional commits del repo)
git commit -m "docs(matias): reescribir guia como manual ejecutable de Angular 20 en Windows"
```

Si se quiere aplicar la estrategia de cadena forzada (work units apiladas), los commits equivalentes serían:

```bash
git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md  # solo bloque WU1
git commit -m "docs(matias): estructura base y secciones iniciales de la guia Windows"

git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md  # solo bloque WU2
git commit -m "docs(matias): ciclos F0-01 a F1-05 de la guia Windows"

git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md  # solo bloque WU3
git commit -m "docs(matias): ciclos F2-01 a F3-06 de la guia Windows"

git add MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md  # solo bloque WU4
git add openspec/changes/archive/2026-06-24-mejorar-guia-matias-angular-windows/
git add openspec/specs/guia-matias-angular-windows/spec.md
git commit -m "docs(matias): referencias, cierre y archivado de la guia Windows"
```

> Los comandos anteriores son **propuestas**. La regla de Marcos en `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, por lo que ninguno se ejecutó durante este ciclo.

## Estado

SDD cycle complete. Próximo ciclo recomendado: backend PHP de lectura/verificación contra `backend-modelo-datos-certificados`, con generación de token y pepper fuera de Git. Independiente de la guía de Matías, pero la guía ya deja a Matías listo para esperar ese contrato cuando exista.
