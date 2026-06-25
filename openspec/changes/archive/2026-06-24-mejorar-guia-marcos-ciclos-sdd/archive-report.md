# Archive report — mejorar-guia-marcos-ciclos-sdd

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-24-mejorar-guia-marcos-ciclos-sdd/` y spec promovida a `openspec/specs/guia-marcos-ciclos-sdd/spec.md` (creación, no merge: no existía spec principal para el dominio).

Veredicto del ciclo: `PASS`. Cero issues CRITICAL. SDD cycle complete.

## Qué cambió

Reescritura compacta de `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (101 → 359 líneas) como guía operativa SDD para Marcos, organizada en 2 work units conceptuales (`force-chained`, `stacked-to-main` solo conceptual; sin branches ni commits creados):

- **WU1 — Estructura y secciones base**: ruta rápida, rol y prohibiciones, tabla "Cuándo detenerse para QA manual" con `php -l`, `php -m`, `mysqldump --no-data`, `curl` con token ficticio, `git status --ignored --short` y revisión de `.htaccess`; flujo OpenCode/Gentle-AI, prompt base, plantilla de ciclo (9 campos) y reglas finales.
- **WU2 — Ciclos M1-01..M3-03 con plantilla aplicada**: 9 ciclos autocontenidos con objetivo, rama sugerida, lecturas, prompt para OpenCode, ejecutar/verificar, QA manual con checkpoint de parada, qué no hacer, archive y commit sugerido. M1 cubre seguridad/auditoría/modelo, M2 cubre API PHP e integración, M3 cubre Angular, deploy cPanel y hardening final.
- **Anexo breve de skills/agents** verificables desde `opencode.json` y `.atl/skill-registry.md`, con aviso de "pendiente de validar" si no se confirman.
- **Handoff al cierre y comandos Git propuestos** (no ejecutados por OpenCode) en bloque copiable.

El bloqueador crítico detectado en la primera verificación (no todos los `No hacer` declaraban `commit`, `push`, `merge` y `rebase` como manuales de Marcos) fue corregido y re-verificado en un apply correctivo antes del archive.

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `guia-marcos-ciclos-sdd` | Creada | 7 requisitos, 7 escenarios Given/When/Then. Contrato documental, no de producto. |

Nota: el proposal explícitamente declara "cambio puramente documental, no toca código, dependencias, deploy o Git automático". Se sigue la convención OpenSpec de crear el spec principal en `openspec/specs/` para mantener trazabilidad, aunque el "contrato" sea de documentación. Patrón consistente con `guia-matias-angular-windows`, `repo-precommit`, `repo-limpio`.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `exploration.md` | `openspec/changes/mejorar-guia-marcos-ciclos-sdd/` (ahora archivado) |
| `proposal.md` | id. |
| `design.md` | id. |
| `specs/guia-marcos-ciclos-sdd/spec.md` | id. |
| `tasks.md` | id. |
| `apply-progress.md` | id. |
| `verify-report.md` | id. |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Repo (raíz) — verificado post-corrección. |
| `AGENTS.md`, `README.md`, `GUIA.md` (root) | Repo |
| `docs/00-indice-general.md` | Repo |
| `docs/AGENTS.md`, `openspec/AGENTS.md`, `openspec/specs/README.md` | Repo (instrucciones locales) |
| Engram observations #3772, #3773, #3775, #3777, #3778, #3779, #3780, #3781, #3782, #3783 | Trazabilidad de fases previas (explore, propose, design, apply, verify y re-verify post-fix) |
| `openspec/changes/archive/2026-06-24-mejorar-guia-matias-angular-windows/archive-report.md` | Repo, referencia de formato |

Skills cargadas: `sdd-archive`, `cognitive-doc-design`, `documentation-writer`.

## Archivos modificados durante el archive

| Archivo | Acción | Alcance |
|---|---|---|
| `openspec/specs/guia-marcos-ciclos-sdd/spec.md` | Creado | Spec principal, copia del delta del cambio. |
| `openspec/changes/archive/2026-06-24-mejorar-guia-marcos-ciclos-sdd/` | Movido | Carpeta del cambio completa: exploration, proposal, design, specs/, tasks, apply-progress, verify-report, archive-report (este archivo). |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/` | Eliminado | Carpeta activa vacía tras el movimiento. |

Fuera del archive (en el working tree, ya modificado por `sdd-apply` previo):

- `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (modificado, 304 inserciones, 46 eliminaciones).

No se modificaron `apps/`, `database/`, `deploy/`, `material_privado_no_versionar/`, ni configuración de producto durante este archive. `docs/00-indice-general.md` se mantuvo intacto porque la ruta y la función de la guía de Marcos no cambiaron.

## Evidencia de verificación

| Comando | Resultado |
|---|---|
| `git status --short --untracked-files=all` antes del archive | 1 archivo modificado (`MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`) + 1 archivo modificado ajeno (`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, fuera de alcance) + 7 artefactos OpenSpec del cambio no trackeados. |
| `git diff --stat -- MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | `350 líneas modificadas` (`304 +`, `46 −`) en la guía. |
| `git diff --name-only -- apps/** database/** deploy/**` | Sin cambios de producto. |
| Tareas (Phase 1, 2 y 3 + Corrective) | 23/23 marcadas `[x]` en `tasks.md`. |
| Spec → guía | 7/7 requisitos con sección o ciclo asignado (verificado por `sdd-verify`). |
| Validador de `No hacer` | Los 9 ciclos M1-01..M3-03 contienen `Commit, push, merge y rebase quedan manuales de Marcos.` |
| Coherencia con `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md` | PASS. |
| Veredicto `sdd-verify` | `PASS` después del corrective apply. |

No se ejecutaron `npm`, `ng`, `php`, `mysql`, `curl` real contra backend ni comandos Git de escritura. La validación fue documentación-segura y de solo lectura.

## Warnings y notas

### WARNING — Diff ajeno en el working tree: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`

`git status` muestra `M MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` con `1354 inserciones / 56 eliminaciones` (1410 líneas). Este cambio pertenece al ciclo archivado `mejorar-guia-matias-angular-windows` (`openspec/changes/archive/2026-06-24-mejorar-guia-matias-angular-windows/`) y NO es parte del scope de `mejorar-guia-marcos-ciclos-sdd`. Quedó pendiente de commit/push desde un ciclo previo y no debe mezclarse en el cierre de Marcos.

Recomendación: tratarlo en un ciclo independiente o commitearlo por separado antes de abrir PR. La regla de `AGENTS.md` ("no commitear, pushear ni mergear automáticamente") sigue vigente y debe respetarse.

### SUGGESTION — `docs/00-indice-general.md` sin cambios

La ruta y la función de la guía de Marcos no cambiaron, por lo que el índice sigue vigente. No se modificó.

### SUGGESTION — Spec principal nuevo

`openspec/specs/guia-marcos-ciclos-sdd/spec.md` refleja un contrato documental, no una capacidad de producto. Es consistente con el patrón de specs documentales previos (`guia-matias-angular-windows`, `repo-precommit`, `repo-limpio`).

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` modificado en working tree (1410 líneas) y fuera de scope. | Media | Mantener el commit conceptual de Marcos separado; tratar la guía de Matías en ciclo o commit independiente. |
| Artefactos OpenSpec del cambio no trackeados. | Baja | Confirmar `git status --short --untracked-files=all` antes de stagear. |
| Obsolescencia futura de comandos PHP/MariaDB/cPanel/curl. | Baja | La guía usa comandos estables y referencia la verificación con `--help` o lectura de `GUIA.md` cuando hay duda. |
| Cambios de versión (PHP 8.4 → 8.5, MariaDB 10.6 → 11.x). | Baja | Las versiones objetivo están documentadas en la propia guía y en `AGENTS.md`. |
| `muestra_pagina/` aún vacía al momento de iniciar M3. | Baja para M3-01 | La guía bloquea trabajo Angular no acordado y remite a `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` como referencia de handoff. |
| Anexo de skills/agents parcialmente verificable. | Baja | La guía marca explícitamente "pendiente de validar" cuando una fuente no se confirma. |

## Comandos Git propuestos (no ejecutar)

Estos son los comandos sugeridos a Marcos, extraídos del cierre del ciclo. NO se ejecutaron en este ciclo:

```bash
# 1. Revisar el estado actual
git status --short --untracked-files=all
git diff --stat -- MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md

# 2. Stagiar solo los archivos de ESTE ciclo (dejando fuera el diff ajeno de Matías)
git add MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git add openspec/changes/archive/2026-06-24-mejorar-guia-marcos-ciclos-sdd/
git add openspec/specs/guia-marcos-ciclos-sdd/spec.md

# 3. Mensaje de commit sugerido (estilo conventional commits del repo)
git commit -m "docs(marcos): reescribir guia operativa de ciclos SDD"
```

Si se quiere aplicar la estrategia de cadena forzada (work units apiladas) y el diff de Marcos supera el presupuesto en una futura edición, los commits equivalentes serían:

```bash
git add MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md  # solo bloque WU1
git commit -m "docs(marcos): estructura base y secciones iniciales de la guia SDD"

git add MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md  # solo bloque WU2
git commit -m "docs(marcos): ciclos M1-01 a M3-03 de la guia SDD"

git add MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md
git add openspec/changes/archive/2026-06-24-mejorar-guia-marcos-ciclos-sdd/
git add openspec/specs/guia-marcos-ciclos-sdd/spec.md
git commit -m "docs(marcos): archivado y spec principal de la guia SDD"
```

> Los comandos anteriores son **propuestas**. La regla de Marcos en `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, por lo que ninguno se ejecutó durante este ciclo. Tampoco se commitea el diff ajeno de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`; ese cambio debe cerrarse por separado.

## Estado

SDD cycle complete. Próximo ciclo recomendado: backend PHP de lectura/verificación contra `backend-modelo-datos-certificados` (M2-01/M2-02), con generación de token y pepper fuera de Git. Independiente de la guía de Matías, pero la guía ya deja a Marcos listo para esperar ese contrato cuando exista.
