# Archive Report: deploy/cpanel-certificados

## Resumen ejecutivo

Ciclo `deploy/cpanel-certificados` (M3-05) archivado en modo híbrido. La verificación cerró en `PASS WITH WARNINGS` sin issues críticos. Se confirmó que la spec activa y la spec principal ya estaban en sincronía byte por byte, se movió la carpeta del cambio a `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/`, se conservaron los diffs tracked de `deploy/README.md` y `docs/deploy/00-cpanel-certificados.md` como salida legítima del ciclo, y se mantuvo fuera de alcance `.codegraph/` y `material_privado_no_versionar/`. SDD cycle completo, sin commit ni push (la decisión de versionar el diff queda para el usuario, fuera del scope de `sdd-archive`).

## Cambio

| Campo | Valor |
|---|---|
| Change | `deploy/cpanel-certificados` |
| Milestone | M3-05 |
| Branch | `deploy/cpanel-certificados` |
| Artifact store | hybrid (OpenSpec + Engram) |
| Delivery strategy | auto-forecast |
| Review budget | 400 líneas, riesgo Low |
| Strict TDD | Inactivo (cambio documental, sin código nuevo) |
| Veredicto | `PASS WITH WARNINGS` |
| Fecha de archivo | 2026-06-27 |

## Veredicto de verificación

`PASS WITH WARNINGS`. Sin issues críticos. Las advertencias restantes son documentales y se cierran en este archive: la spec principal coincide con la delta, la guía operativa y el mapa de `deploy/` cubren los siete requisitos, y la guardia de material privado quedó explícita en la spec, en el diseño y en la guía.

## Sincronización de specs

Deltas revisados contra `openspec/specs/`:

| Dominio | Acción | Detalle |
|---|---|---|
| `deploy-cpanel-certificados` | Verificado en sync | La spec activa y la spec principal son byte por byte idénticas (76 líneas, mismo contenido). Sin requisitos para añadir, modificar, renombrar ni remover. Los siete requisitos y sus siete escenarios Given/When/Then ya están consolidados en `openspec/specs/deploy-cpanel-certificados/spec.md`. |

Las requirements existentes no mencionadas no se tocaron (no aplica: la spec no fue modificada por este ciclo). No se requirió merge destructivo.

## Archivos del cambio movidos

| Origen | Destino | Acción |
|---|---|---|
| `openspec/changes/deploy-cpanel-certificados/design.md` | `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/design.md` | Movido |
| `openspec/changes/deploy-cpanel-certificados/exploration.md` | `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/exploration.md` | Movido |
| `openspec/changes/deploy-cpanel-certificados/proposal.md` | `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/proposal.md` | Movido |
| `openspec/changes/deploy-cpanel-certificados/tasks.md` | `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/tasks.md` | Movido |
| `openspec/changes/deploy-cpanel-certificados/verify.md` | `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/verify.md` | Movido |
| `openspec/changes/deploy-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` | `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` | Movido |
| `openspec/changes/deploy-cpanel-certificados/` (carpeta activa) | — | Eliminada tras el move (carpeta vacía) |

## Archivos modificados durante el archive

| Archivo | Estado previo al archive | Acción de archive | Justificación |
|---|---|---|---|
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Creado durante `sdd-apply` (untracked) | Conservado sin cambios | Ya coincide con la delta archivada; es la fuente de verdad de la capacidad. |
| `docs/deploy/00-cpanel-certificados.md` | Tracked con diff `+151/-8` del apply | Sin cambios en archive | El diff vigente del apply cubre los siete requisitos y la trazabilidad OpenSpec. |
| `deploy/README.md` | Tracked con diff `+22/-2` del apply | Sin cambios en archive | El mapa operativo vigente enlaza la guía y lista artefactos permitidos/prohibidos. |
| `openspec/changes/deploy-cpanel-certificados/` | Untracked | Movido a `archive/2026-06-27-deploy-cpanel-certificados/` | Cambio cerrado; carpeta activa ya no aplica. |
| `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/archive-report.md` | — | Creado en este archive | Evidencia de cierre M3-05. |

## Documentación vigente

| Doc | Rol | Estado |
|---|---|---|
| `docs/deploy/00-cpanel-certificados.md` | Guía operativa principal del deploy manual cPanel de `/certificados/`. | Vigente. Sin duplicación. |
| `deploy/README.md` | Mapa operativo breve, enlaza a la guía y lista artefactos permitidos/prohibidos. | Vigente. Sin duplicación. |
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Spec principal (fuente de verdad) con escenarios Given/When/Then. | Vigente. |
| `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/` | Auditoría del cambio M3-05. | Evidencia inmutable. |

No se actualizó `docs/00-indice-general.md` ni `docs/07-sdd-archive-y-mantenimiento-documentacion.md`: el cambio es documental y de capacidad nueva (`deploy-cpanel-certificados`), ya está apuntado desde el apply en la guía de deploy y en el mapa `deploy/`, y la spec principal ya está consolidada. Cualquier mención de "M3-05" en otros índices operativos queda para una pasada de mantenimiento posterior, fuera del scope de `sdd-archive` per la regla de cambios mínimos.

## Auditoría del archivo

| Verificación | Estado |
|---|---|
| Spec principal sincronizada con la delta | ✅ (byte por byte idénticas, sin merge destructivo) |
| `tasks.md` archivado sin checkboxes `- [ ]` de implementación | ✅ (11/11 marcadas, ver `tasks.md` archivado) |
| Change folder movido a `archive/2026-06-27-deploy-cpanel-certificados/` | ✅ |
| Archive contiene proposal, exploration, specs/, design, tasks, verify, archive-report | ✅ |
| `openspec/changes/` activo ya no contiene `deploy-cpanel-certificados` | ✅ (carpeta activa eliminada) |
| `.codegraph/` no tocado ni versionado | ✅ (untracked, fuera de alcance) |
| `material_privado_no_versionar/` no tocado, no listado, no versionado | ✅ (ignorado, fuera de alcance) |

## Contenido del archivo

- `proposal.md` ✅
- `exploration.md` ✅
- `specs/deploy-cpanel-certificados/spec.md` ✅
- `design.md` ✅
- `tasks.md` ✅ (11/11 tareas marcadas)
- `verify.md` ✅
- `archive-report.md` ✅ (este archivo)

## Reconciliación de checkboxes

No se requirió. El `tasks.md` activo ya tenía las 11 tareas marcadas `- [x]` antes del archive, según el `verify.md` ("No quedan tareas sin marcar en `tasks.md`"). No se realizó ninguna reparación mecánica de checkboxes estancados.

## Validaciones post-archive

| Comando | Resultado | Nota |
|---|---|---|
| `git diff --check` | PASS | Sin errores de whitespace en el diff tracked. |
| `git status --ignored --short` | PASS | Tracked: `M deploy/README.md`, `M docs/deploy/00-cpanel-certificados.md` (diff del apply, sin stagge, sin secretos). Untracked: `.codegraph/`, `openspec/changes/archive/2026-06-27-deploy-cpanel-certificados/`, `openspec/specs/deploy-cpanel-certificados/`. Ignored: `.atl/.skill-registry.cache.json`, `.codegraph/daemon.log`, `material_privado_no_versionar/`. |
| `git diff --cached --name-only` | PASS | Sin archivos staged. |
| `git log --oneline -10` | PASS | HEAD en `3a23e1e` (merge PR #4 `qa/backend-hardening-certificados`); la rama `deploy/cpanel-certificados` no tiene upstream ni commits nuevos. |
| Escaneo de contenido de la delta vs la principal | PASS | `diff -q` sin diferencias; `wc -l` 76/76 en ambos archivos. |
| Escaneo de paths prohibidos en el archive | PASS | Sin rutas a `material_privado_no_versionar/`, sin `.env`, sin credenciales, sin dumps, sin logs, sin zips. |

## Warnings heredados del verify

- `.codegraph/` aparece como estado local sin versionar y queda fuera del alcance del ciclo. No se versiona en este archive.
- `material_privado_no_versionar/` aparece como ignorado. No se leyó, no se lista, no se versiona.
- La compatibilidad real en cPanel queda explícitamente fuera de este ciclo (no se ejecutó deploy real). El smoke aislado `certificados_qa` con `REMOTE VERIFY PASSED` queda referenciado en la guía operativa como antecedente positivo y limitación del presente ciclo.

## Privacidad y exclusiones

- No se leyó `material_privado_no_versionar/`; solo se observó por estado Git que sigue ignorado.
- No se leyeron dumps, logs, zips, `.env`, credenciales ni configuraciones reales.
- No se usó base de datos real.
- No se creó `.env`.
- No se ejecutó deploy real.
- No se subió nada a `public_html` ni se modificó una carpeta `public_html` local.
- No se instalaron dependencias.
- No se ejecutaron `git commit`, `git push`, `git merge`, `git rebase` ni `git reset`.
- No se modificó `.codegraph/`.
- El archive no incluye diff staged, secretos, configs reales, dumps, zips, logs productivos ni material privado.

## Siguiente paso lógico (no ejecutado)

| Acción | Por qué queda afuera |
|---|---|
| Commit y push del diff tracked (`deploy/README.md`, `docs/deploy/00-cpanel-certificados.md`) y del archive untracked. | El usuario no autorizó operaciones de mutación de Git en este turno; `sdd-archive` cierra el ciclo documental y deja la decisión de versionar al usuario. |
| PR de `deploy/cpanel-certificados` → `main`. | Idem. |
| Sincronización de la rama con `main` para resolver el upstream. | Idem. |
| Pasada de mantenimiento en `docs/00-indice-general.md` para anotar M3-05 archivado. | Fuera del scope mínimo de `sdd-archive`; queda para un ciclo posterior si el usuario lo pide. |

## SDD cycle status

**Complete.** El cambio fue explorado, propuesto, especificado, diseñado, implementado (alcance documental), verificado y archivado. Sin deploy real, sin material privado accedido, sin secretos versionados. Listo para el próximo ciclo.
