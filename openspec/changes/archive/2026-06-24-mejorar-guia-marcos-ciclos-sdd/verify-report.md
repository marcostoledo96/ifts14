# Verification Report: mejorar-guia-marcos-ciclos-sdd

## Resultado

| Campo | Valor |
|---|---|
| Cambio | `mejorar-guia-marcos-ciclos-sdd` |
| Modo | OpenSpec + Engram |
| Tipo | Documentación solamente |
| Strict TDD | Inactivo por instrucción; cambio documental sin runner de producto |
| Veredicto | PASS |

La corrección desbloquea el único issue crítico anterior: los 9 bloques `No hacer` de los ciclos M1-01..M3-03 ahora mencionan `commit`, `push`, `merge` y `rebase` como acciones manuales de Marcos. La guía mantiene IDs, orden, plantilla de 9 campos, checkpoints de QA manual y comandos Git solo propuestos.

## Artefactos leídos

| Artefacto | Estado |
|---|---|
| `AGENTS.md` | Leído |
| `README.md` | Leído |
| `GUIA.md` | Leído |
| `docs/00-indice-general.md` | Leído |
| `openspec/AGENTS.md` | Leído |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/proposal.md` | Leído |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/design.md` | Leído |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/specs/guia-marcos-ciclos-sdd/spec.md` | Leído |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/tasks.md` | Leído |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/apply-progress.md` | Leído |
| `openspec/changes/mejorar-guia-marcos-ciclos-sdd/verify-report.md` anterior | Leído |
| `MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` | Leído y verificado |
| `/home/marcos/.config/opencode/skills/sdd-verify/SKILL.md` | Leído desde ruta exacta |
| `/home/marcos/.config/opencode/skills/cognitive-doc-design/SKILL.md` | Leído desde ruta exacta |
| `/home/marcos/.agents/skills/documentation-writer/SKILL.md` | Leído desde ruta exacta |

## Evidencia de comandos

| Comando | Resultado |
|---|---|
| `python3 - <<'PY' ...` validador documental sobre la guía | `cycle_ids_ok: True`; `all_fields_ok: True`; `qa_checkpoint_with_command_ok: True`; `no_hacer_manual_git_ok: True` |
| Validador específico de `No hacer` | Los 9 ciclos M1-01, M1-02, M1-03, M2-01, M2-02, M2-03, M3-01, M3-02 y M3-03 contienen `Commit, push, merge y rebase quedan manuales de Marcos.` |
| Validador de tareas | `tasks.md`: 20 checked, 0 unchecked; `apply-progress.md`: 23 checked, 0 unchecked |
| `rtk git diff --stat -- MARCOS_PROMPTS... openspec/changes/...` | `MARCOS_PROMPTS...` con 304 inserciones y 46 borrados; dentro del presupuesto de 800 líneas cambiadas |
| `rtk git diff --numstat -- MARCOS_PROMPTS... openspec/changes/...` | `304 46 MARCOS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` |
| `rtk git diff --name-only -- apps/** database/** deploy/**` | Sin cambios de producto detectados |
| `rtk git status --short --untracked-files=all -- ...` | `MARCOS_PROMPTS...` modificado; carpeta OpenSpec del cambio sin trackear; `MATIAS_PROMPTS...` aparece modificado como cambio ajeno al alcance |

No se ejecutaron `npm`, `ng`, `php`, `mysql`, `curl` real contra backend ni comandos Git de escritura. La validación fue documentación-segura y de solo lectura, salvo la actualización de este reporte.

## Completitud de tareas

| Grupo | Completas | Pendientes | Estado |
|---|---:|---:|---|
| Phase 1 — estructura y secciones base | 6 | 0 | PASS |
| Phase 2 — 9 ciclos M1-01..M3-03 | 9 | 0 | PASS |
| Phase 3 — cierre y verificación | 5 | 0 | PASS |
| Corrective apply — fix del bloqueador | 3 | 0 | PASS |

## Matriz de cumplimiento del spec

| Requirement | Evidencia | Estado |
|---|---|---|
| Rol y límites | Líneas 15-24: rol PHP/MariaDB/cPanel, límites de Angular, material privado, datos sensibles y Git manual. | PASS |
| Cuándo detenerse para QA manual | Líneas 26-38: tabla con `php -l`, `php -m`, `mysqldump --no-data`, `curl`, `git status --ignored --short` y revisión de `.htaccess`. | PASS |
| Plantilla de ciclo repetible | Líneas 64-87 y validador: todos los ciclos contienen los 9 campos. | PASS |
| Ciclos M1-01 a M3-03 sin renumerar | Validador: IDs exactos en orden `M1-01`..`M3-03`. | PASS |
| Handoff al cierre de ciclo | Líneas 306-338: archivos, comandos/validaciones, QA, docs/archive, bloqueos, riesgos y comandos Git propuestos. | PASS |
| Anexo breve de skills/agents | Líneas 340-352: anexo breve con fuentes verificadas o nota de validación. | PASS |
| Comandos Git solo como propuesta | Regla global, handoff y los 9 bloques `No hacer` declaran que commit, push, merge y rebase quedan manuales de Marcos. | PASS |

## Diseño y calidad documental

| Criterio | Estado | Nota |
|---|---|---|
| Apropiada para Marcos | PASS | Compacta, operativa y orientada a backend/datos/deploy sin tutorializar Git. |
| Carga cognitiva | PASS | Usa ruta rápida, tabla, plantilla y ciclos autocontenidos. |
| Diátaxis | PASS | Funciona como how-to operativo para ejecutar ciclos SDD concretos. |
| Coherencia con `AGENTS.md`/`GUIA.md` | PASS | Respeta un ciclo por vez, `sdd-archive`, no Git automático, no secretos y no material privado. |
| Presupuesto de revisión | PASS | 350 líneas cambiadas en la guía; bajo el límite declarado de 800. |
| Manual QA stop points | PASS | Están explícitos en tabla global y en cada ciclo. |

## Issues

### CRITICAL

- Ninguno.

### WARNING

- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` aparece modificado en `git status`, pero queda fuera del alcance de este verify. No incluirlo en el cierre/PR conceptual de Marcos salvo ciclo separado.

### SUGGESTION

- Continuar con `sdd-archive` del cambio `mejorar-guia-marcos-ciclos-sdd`, manteniendo el cierre documental separado de cualquier cambio ajeno.

## Veredicto final

PASS. El bloqueador fue corregido y verificado con evidencia documental reproducible. El cambio está listo para `sdd-archive`.
