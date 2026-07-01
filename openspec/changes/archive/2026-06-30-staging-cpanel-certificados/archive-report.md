# Archive Report: staging-cpanel-certificados

## Resumen ejecutivo

Ciclo `staging-cpanel-certificados` archivado en modo híbrido. La verificación cerró en `PASS WITH WARNINGS` sin issues críticos; la única advertencia era la tarea 5.3 (`sdd-archive`) pendiente por diseño. Se sincronizaron 4 requisitos ADDED del delta a `openspec/specs/deploy-cpanel-certificados/spec.md` con escenarios Given/When/Then consistentes, se movió la carpeta del cambio a `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/` y se mantuvo fuera de alcance `public_html`, `material_privado_no_versionar/`, `vendor/`, secretos, dumps y zips. SDD cycle completo, sin commit ni push (la decisión de versionar el diff queda para el usuario, fuera del scope de `sdd-archive`).

## Cambio

| Campo | Valor |
|---|---|
| Change | `staging-cpanel-certificados` |
| Branch | `deploy/staging-cpanel-certificados` |
| Artifact store | hybrid (OpenSpec + Engram) |
| Delivery strategy | single-pr-default |
| Review budget | 400 líneas, riesgo Low |
| Strict TDD | Inactivo (`openspec/config.yaml` define `strict_tdd: false`; cambio documental) |
| Veredicto | `PASS WITH WARNINGS` |
| Fecha de archivo | 2026-06-30 |

## Veredicto de verificación

`PASS WITH WARNINGS`. Sin issues críticos. La advertencia restante era exclusivamente la tarea 5.3 (`sdd-archive`) sin marcar en `tasks.md`, que se cierra en este mismo archive por instrucción explícita del orquestador y por evidencia cruzada de `apply-progress` y `verify-report` que prueban que esa era la única tarea pendiente.

## Sincronización de specs

Deltas aplicados a `openspec/specs/deploy-cpanel-certificados/spec.md`:

| Dominio | Acción | Detalle |
|---|---|---|
| `deploy-cpanel-certificados` | Append de 4 requisitos ADDED | Se agregaron al final de la spec principal, sin tocar los 11 requisitos existentes ni sus escenarios. Sin MODIFIED, REMOVED o RENAMED en el delta. Sin merge destructivo. |

Requisitos añadidos (todos preservando el patrón Given/When/Then en español argentino formal y las palabras clave RFC 2119):

| Requisito | Escenarios |
|---|---|
| `Guía documental de staging separada` | Preparación documental de staging; Staging no ejecutable en este ciclo |
| `Checklist seguro de paquete de staging` | Paquete revisado sin material prohibido; Duda sobre un artefacto |
| `Configuración de staging con placeholders` | Plantilla de configuración ficticia; Base pública de staging |
| `Smoke y rollback de staging` | Smoke seguro de staging; Rollback limitado a staging |

Los 11 requisitos previos y sus 15 escenarios Given/When/Then quedan intactos; las requirements existentes no mencionadas en el delta no se tocaron.

## Archivos del cambio movidos

| Origen | Destino | Acción |
|---|---|---|
| `openspec/changes/staging-cpanel-certificados/design.md` | `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/design.md` | Movido |
| `openspec/changes/staging-cpanel-certificados/exploration.md` | `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/exploration.md` | Movido |
| `openspec/changes/staging-cpanel-certificados/proposal.md` | `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/proposal.md` | Movido |
| `openspec/changes/staging-cpanel-certificados/tasks.md` | `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/tasks.md` | Movido (con 5.3 marcada durante archive) |
| `openspec/changes/staging-cpanel-certificados/verify-report.md` | `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/verify-report.md` | Movido |
| `openspec/changes/staging-cpanel-certificados/apply-progress.md` | `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/apply-progress.md` | Movido |
| `openspec/changes/staging-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` | `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` | Movido |
| `openspec/changes/staging-cpanel-certificados/` (carpeta activa) | — | Eliminada tras el move (carpeta vacía) |

## Archivos modificados durante el archive

| Archivo | Estado previo al archive | Acción de archive | Justificación |
|---|---|---|---|
| `openspec/changes/staging-cpanel-certificados/tasks.md` | 5.3 sin marcar; resto completo | 5.3 marcada como completada con nota de reconciliación | Reconciliación mecánica autorizada por el orquestador; `apply-progress` y `verify-report` prueban que era el único pendiente. |
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Spec principal con 11 requisitos | Append de 4 requisitos ADDED | El delta del cambio agrega documentación de staging; la spec principal queda como fuente de verdad vigente. |
| `openspec/changes/staging-cpanel-certificados/` | Untracked | Movido a `archive/2026-06-30-staging-cpanel-certificados/` | Cambio cerrado; carpeta activa ya no aplica. |
| `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/archive-report.md` | — | Creado en este archive | Evidencia de cierre del ciclo. |

## Archivos del apply (no tocados en archive)

| Archivo | Estado | Rol |
|---|---|---|
| `docs/deploy/01-staging-cpanel-certificados.md` | Untracked (nuevo) | Guía de preparación de staging para `/certificados_staging/`, separada de producción `/certificados/`. |
| `deploy/README.md` | Tracked con diff mínimo | Enlace a la guía de staging y separación explícita de rutas staging/producción. |

Estos archivos son salida legítima del apply y no se modifican en archive. Su versionado queda para decisión del usuario.

## Documentación vigente

| Doc | Rol | Estado |
|---|---|---|
| `docs/deploy/00-cpanel-certificados.md` | Guía operativa principal del deploy manual cPanel de `/certificados/`. | Vigente (sin cambios). |
| `docs/deploy/01-staging-cpanel-certificados.md` | Guía de preparación de staging para `/certificados_staging/`. | Nueva, vigente. |
| `deploy/README.md` | Mapa operativo breve, enlaza ambas guías y lista artefactos permitidos/prohibidos. | Vigente con diff mínimo. |
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Spec principal (fuente de verdad) con 15 requisitos y 23 escenarios. | Vigente. |
| `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/` | Auditoría del cambio. | Evidencia inmutable. |

## Auditoría del archivo

| Verificación | Estado |
|---|---|
| Spec principal sincronizada con el delta | ✅ (4 requisitos ADDED mergeados, 11 requisitos existentes intactos, sin merge destructivo) |
| `tasks.md` archivado sin checkboxes `- [ ]` de implementación | ✅ (20/20 marcadas, ver `tasks.md` archivado) |
| Change folder movido a `archive/2026-06-30-staging-cpanel-certificados/` | ✅ |
| Archive contiene proposal, exploration, specs/, design, tasks, verify-report, apply-progress, archive-report | ✅ |
| `openspec/changes/` activo ya no contiene `staging-cpanel-certificados/` | ✅ (carpeta activa eliminada) |
| `material_privado_no_versionar/` no tocado, no listado, no versionado | ✅ (ignorado, fuera de alcance) |
| `public_html/`, `vendor/`, secretos, dumps, logs, zips no versionados | ✅ |

## Contenido del archivo

- `proposal.md` ✅
- `exploration.md` ✅
- `specs/deploy-cpanel-certificados/spec.md` ✅
- `design.md` ✅
- `tasks.md` ✅ (20/20 tareas marcadas)
- `apply-progress.md` ✅
- `verify-report.md` ✅
- `archive-report.md` ✅ (este archivo)

## Reconciliación de checkboxes

Sí se requirió. El `tasks.md` activo mantenía la tarea 5.3 sin marcar antes del archive. La evidencia cruzada de `apply-progress` (sección "Pendiente": solo 5.3) y `verify-report` (sección "Issues > WARNING": solo 5.3) prueba que era el único pendiente. El orquestador autorizó explícitamente la reparación mecánica con la frase "Update tasks 5.3 complete if appropriate before/inside archive." Se actualizó la línea correspondiente agregando la marca `[x]` y una nota corta que documenta la razón de la reconciliación.

## Validaciones post-archive

| Comando / verificación | Resultado | Nota |
|---|---|---|
| `ls openspec/changes/` | PASS | Solo `archive/`. La carpeta activa del cambio ya no existe. |
| `find openspec/changes/archive/2026-06-30-staging-cpanel-certificados -type f` | PASS | 7 archivos fuente + 1 archive-report = 8 esperados. |
| Conteo de requisitos en `openspec/specs/deploy-cpanel-certificados/spec.md` | PASS | 15 requisitos (11 previos + 4 ADDED), 23 escenarios (15 previos + 8 nuevos). |
| Escaneo de paths prohibidos en el archive | PASS | Sin rutas a `material_privado_no_versionar/`, sin `.env`, sin credenciales, sin dumps, sin logs, sin zips, sin `public_html`, sin `vendor/`. |
| Merge ADDED-only | PASS | El delta no declaró MODIFIED, REMOVED ni RENAMED. Merge puramente aditivo, sin ambigüedad sobre requisitos existentes. |

## Warnings heredados del verify

- `openspec validate staging-cpanel-certificados --strict` quedó `SKIPPED` porque el CLI no está instalado en el entorno del verify. Sugerencia registrada: ejecutar `openspec validate` cuando el CLI esté disponible para confirmar la delta contra el validador formal.
- El staging real no se ejecutó y queda fuera de alcance; el rollout operativo necesitará ciclo propio antes de tocar cPanel.
- Sigue abierta la decisión futura entre dominio principal con `/certificados_staging/` y subdominio (preguntas abiertas del design y de la guía).

## Privacidad y exclusiones

- No se leyó `material_privado_no_versionar/`; no se lista contenido sensible.
- No se leyeron dumps, logs, zips, `.env`, credenciales ni configuraciones reales.
- No se usó base de datos real.
- No se creó `.env`.
- No se ejecutó deploy real.
- No se subió nada a `public_html` ni se modificó una carpeta `public_html` local.
- No se instalaron dependencias.
- No se ejecutaron `git add`, `git commit`, `git push`, `git merge`, `git rebase` ni `git reset`.
- No se modificó `.codegraph/` ni `muestra_pagina/`.
- El archive no incluye diff staged, secretos, configs reales, dumps, zips, logs productivos ni material privado.

## Siguiente paso lógico (no ejecutado)

| Acción | Por qué queda afuera |
|---|---|
| `git add` + `git commit` + `git push` del diff tracked (`deploy/README.md`) y de los untracked (`docs/deploy/01-staging-cpanel-certificados.md`, `openspec/changes/archive/2026-06-30-staging-cpanel-certificados/`, `openspec/specs/deploy-cpanel-certificados/spec.md` actualizada). | El usuario instruyó explícitamente "Do NOT stage/commit/push". `sdd-archive` cierra el ciclo documental; la decisión de versionar queda para el usuario en un turno posterior, con la aprobación y el comando exacto que correspondan. |
| PR de `deploy/staging-cpanel-certificados` → `main`. | Idem; requiere ciclo operativo aparte. |
| Ejecución real del staging contra cPanel. | Fuera de alcance del ciclo documental; necesita su propio ciclo SDD antes de tocar cPanel. |
| Pasada de mantenimiento en `docs/00-indice-general.md` para anotar M3-?? archivado. | Fuera del scope mínimo de `sdd-archive`; queda para un ciclo posterior si el usuario lo pide. |

## SDD cycle status

**Complete.** El cambio fue explorado, propuesto, especificado, diseñado, implementado (alcance documental), verificado y archivado. Sin deploy real, sin material privado accedido, sin secretos versionados. Listo para el próximo ciclo.

## Trazabilidad Engram

Observaciones previas del cambio en Engram (project `ifts14`, scope `project`), registradas para lineage cross-session:

| Artefacto | Observation ID | Title |
|---|---|---|
| Proposal | `#4593` | `sdd/staging-cpanel-certificados/proposal` |
| Spec | `#4594` | `sdd/staging-cpanel-certificados/spec` |
| Design | `#4598` | `sdd/staging-cpanel-certificados/design` |
| Tasks | `#4606` | `sdd/staging-cpanel-certificados/tasks` |
| Apply progress | `#4607` | `sdd/staging-cpanel-certificados/apply-progress` |
| Verify report | `#4610` | `sdd/staging-cpanel-certificados/verify-report` |
| Archive report | `#4612` (sync_id `obs-e8d487e9dd519073`) | `sdd/staging-cpanel-certificados/archive-report` |
