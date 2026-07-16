# Archive Report: F3-06 — Handoff a Marcos

**Fecha de cierre**: 2026-07-12
**Change archivado**: `f3-06-handoff-a-marcos`
**Rama**: `qa/frontend-release-readiness`
**HEAD al cierre**: `e8b3f56` (full: `e8b3f56e7d83694971f5307b4d187dcf5011077d`)
**Veredicto sdd-verify**: PASS WITH WARNINGS

## Decisiones del archive que difieren del prompt del orquestador

1. **Patch a `docs/frontend/00-angular20-port-v0.md` (1 línea en lugar de 3-6)**: el prompt del orquestador y el `design.md` proponían 3 sub-entradas nuevas (F3-04 abstracto, F3-05 ya existente, F3-06 handoff). El estado real del archivo en este árbol tiene la sección `## Ver también` (creada en el archive de F3-05) con sólo la entrada de F3-05. `docs/frontend/03-qa-manual-f3-04.md` no existe en este árbol (commit `70008f0` sólo en `frontend/v0-design-system`) y el archive histórico `openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/` tampoco existe localmente. Se agregó **una sola línea** (entrada F3-06) en lugar de 3-6; la sub-entrada F3-04 queda omitida para no enlazar a paths inexistentes (el handoff en sí mismo ya documenta el estado de F3-04 con su commit y rama de origen). `git diff --stat` confirma 1 file changed, 1 insertion(+).
2. **Fecha del directorio de archive**: el prompt mencionaba implícitamente la fecha de hoy. Se usa `2026-07-12-f3-06-handoff-a-marcos/` para coincidir con la fecha del `verify-report.md` PASS WITH WARNINGS, la fecha del `apply-progress.md`, la fecha de hoy del entorno, y el patrón de archives recientes del mismo día (`2026-07-12-f3-05-build-para-certificados/`, `2026-07-12-f4-01-certificate-detail/`, `2026-07-12-f4-02-certificate-pdf-preview/`, `2026-07-12-f4-02-codex-feedback/`).
3. **Sin `specs/` ni `spec.md`**: el `proposal.md` y el `design.md` declaran el ciclo como operacional, sin delta aditivo. Se respeta esa decisión en el archive: 6 artefactos SDD movidos + este `archive-report.md` = 7 archivos en el archive (mismo conteo que F3-05, F4-01, F4-02).

## Resumen

F3-06 es el **sexto y último ciclo de Fase 3**: un ciclo estrictamente documental que entrega a Marcos un handoff revisable (`docs/frontend/05-handoff-marcos-f3-06.md`, 202 líneas, 8 secciones) con el estado completo del módulo `/certificados/`, los 7 PRs en cola (5 mergeados a `main`, 2 pendientes de decisión: F3-04 en `frontend/v0-design-system` y F3-05 en `qa/frontend-release-readiness`), resúmenes de F3-04 (QA manual abstracto, 5 placeholders pendientes) y F3-05 (build con `base-href /certificados/`, 6.256 s, 30 artefactos, 2 warnings CSS budget), el roadmap F4-F6 con 12 ciclos mapeados, riesgos y pendientes, comandos Git propuestos (NO ejecutados por OpenCode) y 7 decisiones explícitas para Marcos. No introduce código de producto, no despliega, no copia a `public_html`, no modifica cPanel, no toca el cambio activo de Marcos (`backend-public-endpoint-hardening/`) ni la rama `frontend/v0-design-system` sin mergear. Plan de validación 15/16 PASS + 1 WARNING (diferido y aplicado en este archive), criterios de aceptación 4/4 PASS, tareas 26/26, 0 CRITICAL, 0 SUGGESTION. El ciclo está cerrado.

## Spec delta consolidado

**NO delta aditivo.** F3-06 fue un ciclo operacional, no una nueva capacidad. La regla "handoff a Marcos al cierre de F3" ya está implícita en la metodología SDD y en la sección "División de responsabilidades frontend" (líneas 16-23) de `docs/frontend/00-angular20-port-v0.md`, que asigna a Matías la responsabilidad de "QA/handoff (F3-03, F3-04, F3-06)". No se modifica `openspec/specs/`.

## Patches aplicados durante el ciclo

- `docs/frontend/00-angular20-port-v0.md` (+1 línea) — sub-entrada F3-06 en la sección `## Ver también` (líneas 401-404). Decisión de scope (1 línea en lugar de 3-6) documentada arriba. `git diff --stat` confirma 1 file changed, 1 insertion(+).
- `docs/deploy/00-cpanel-certificados.md` — NO se parcheó. El `verify-report.md` (sección "Patches planificados para sdd-archive") no listó este archivo; el build de F3-05 no reveló nota nueva de config de servidor. La advertencia sobre `.htaccess` SPA fallback para deep links en cPanel queda como decisión de Marcos en el handoff (sección "Decisiones requeridas de Marcos" #6).
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` — NO se parcheó. El handoff referencia las líneas 1279-1325 (definición F3-06) y 1485-1755 (roadmap F4-F6) sin modificarlas.

## Archivos del change (movidos al archive)

Los 7 artefactos SDD del ciclo:

| Archivo | Tamaño | Notas |
|---|---:|---|
| `explore.md` | 29711 B | Exploración inicial (alcance, precedentes F3-04/F3-05, 15 riesgos, observaciones Engram referenciadas). |
| `proposal.md` | 8341 B | Propuesta del ciclo (8 criterios de éxito, out-of-scope explícito, capabilities = none). |
| `design.md` | 10514 B | Diseño técnico (8 secciones del handoff, plan de validación de 16 checks, comandos Git propuestos). |
| `tasks.md` | 5941 B | 26 tareas en 5 fases (Preparación, Escritura, Validación previa, Cierre, Sanity). |
| `apply-progress.md` | 9836 B | Estado de aplicación (26/26 tareas, 7 decisiones clave, comandos Git propuestos). |
| `verify-report.md` | 7795 B | Veredicto PASS WITH WARNINGS (15/16 Plan de validación, 4/4 criterios, 0 CRITICAL, 1 WARNING de port-v0 diferido). |
| `archive-report.md` | (este archivo) | Cierre del ciclo. |

**No existe `specs/` ni `spec.md`** en el change dir: la decisión de omitir el delta aditivo se documenta en el `proposal.md` (Capabilities → None, Modified Capabilities → None) y se respeta en el archive. El ciclo es operacional, no de capacidad.

## Archivos NO movidos (quedan en su ubicación original, modificados o creados in-place)

- `docs/frontend/05-handoff-marcos-f3-06.md` — nuevo archivo permanente (202 líneas, 8 secciones). **NO se mueve al archive**: es el entregable principal del ciclo y queda accesible como referencia para Marcos y para los ciclos F4-F6. Es enlazado desde `docs/frontend/00-angular20-port-v0.md` (sección "Ver también", patch aplicado en este archive).
- `docs/frontend/00-angular20-port-v0.md` — patch in-place (+1 línea: sub-entrada F3-06 en "Ver también"). El archivo en sí no se mueve; sigue en `docs/frontend/` como la fuente de verdad del port Angular 20.
- `apps/frontend-angular/` — sin cambios. `git diff --stat apps/frontend-angular/` → vacío.
- `material_privado_no_versionar/` — sin tocar (off-limits per AGENTS.md).
- `openspec/changes/backend-public-endpoint-hardening/` — sin tocar (cambio activo de Marcos, off-limits per F3-06 out-of-scope).

## Estado final del working tree (después del archive)

```
 M docs/frontend/00-angular20-port-v0.md
?? docs/frontend/05-handoff-marcos-f3-06.md
?? openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/
```

Equivalente a:

- 1 modified: `docs/frontend/00-angular20-port-v0.md` (patch +1 línea en "Ver también").
- 1 untracked: `docs/frontend/05-handoff-marcos-f3-06.md` (el handoff, nuevo).
- 1 untracked: `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/` (la carpeta de archive recién creada, con 7 archivos adentro).
- 0 staged.
- 0 commits del agente.
- HEAD: `e8b3f56e7d83694971f5307b4d187dcf5011077d` (sin cambios).

**Verificación post-archive**: el directorio fuente `openspec/changes/f3-06-handoff-a-marcos/` ya no existe (`Test-Path` → `False`). El directorio de archive contiene los 6 artefactos SDD movidos (mismo set que F3-05, F4-01, F4-02); este `archive-report.md` se crea dentro del archive después del move.

## Resumen de validaciones

| Validación | Resultado | Origen |
|---|---|---|
| Plan de validación (design) | 15/16 PASS + 1 WARNING (port-v0, aplicado en este archive) | `verify-report.md` §"Plan de validación ejecutado" |
| Criterios de aceptación (proposal) | 4/4 PASS | `verify-report.md` §"Mapeo de Criterios de Aceptación" |
| Tareas (tasks.md) | 26/26 completas | `apply-progress.md` + `verify-report.md` |
| Hallazgos CRITICAL | 0 | `verify-report.md` §"Hallazgos" |
| Hallazgos WARNING | 1 (W1 port-v0 patch diferido a `sdd-archive` por decisión #7 de apply; **aplicado en este archive**, 1 línea) | `verify-report.md` §"Hallazgos" + este archive |
| Hallazgos SUGGESTION | 0 | `verify-report.md` §"Hallazgos" |
| Working tree final | Limpio (1 modified + 2 untracked esperados) | `verify-report.md` §"Estado Git" + este archive |
| HEAD al cierre | `e8b3f56` (sin commits del agente) | `git rev-parse HEAD` |
| Commits del agente | 0 | (comparación HEAD inicio vs cierre) |
| Cambio activo de Marcos | Intacto (off-limits respetado) | `verify-report.md` §"Estado Git" |
| `apps/frontend-angular/` | 0 líneas modificadas | `git diff --stat apps/frontend-angular/` |
| Secretos en handoff | 0 matches | `verify-report.md` check #10 |
| Estructura de "## Ver también" | 1 línea agregada (F3-06) | este archive, `git diff --stat` |

## Comandos Git PROPUESTOS al operador (NO ejecutados por el agente)

```powershell
git add docs/frontend/00-angular20-port-v0.md openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/ docs/frontend/05-handoff-marcos-f3-06.md
git commit -m "docs(frontend): preparar handoff a marcos"
git push origin qa/frontend-release-readiness
```

**Pre-push safety** (obligatorio por AGENTS.md):

```powershell
git log origin/qa/frontend-release-readiness..qa/frontend-release-readiness --oneline
git diff origin/qa/frontend-release-readiness..qa/frontend-release-readiness --stat
```

El diff esperado contra el remoto es:

- 1 archivo modificado: `docs/frontend/00-angular20-port-v0.md` (+1 línea en "Ver también", sub-entrada F3-06).
- 1 archivo nuevo: `docs/frontend/05-handoff-marcos-f3-06.md` (202 líneas, 8 secciones).
- 1 directorio nuevo: `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/` (con 7 archivos adentro: 6 SDD + este `archive-report.md`).

No necesita `--set-upstream` porque la rama `qa/frontend-release-readiness` ya está tracked en origin (per F3-05 archive `archive-report.md`).

**Importante**: este es el **commit y push final del cierre de Fase 3**. Una vez pusheado y mergeado a `main` por Marcos, el módulo `/certificados/` queda formalmente release-ready en lo que respecta a la entrega de Mati (sujeto a las 6 decisiones de Marcos documentadas en el handoff y a la pasada visual de los 5 placeholders F3-04).

## Decisiones de Marcos requeridas (resumen del handoff)

1. **Merge de los 7 PRs en cola** (F0-02, policy, F0-03, F1-01, F1-02, F3-04, F3-05) — en cualquier orden. 5 ya mergeados; 2 pendientes (F3-04 en `frontend/v0-design-system`, F3-05 en `qa/frontend-release-readiness`).
2. **Validación de `.htaccess` SPA fallback** para deep links en cPanel — fuera de F3-05/F3-06; decisión entre F4-04 (detalle de curso) o ciclo dedicado antes del deploy.
3. **Code-splitting de los 2 CSS chunks grandes** (14.31 kB + 13.70 kB) o ajuste de `budgets.css` en `angular.json` production.
4. **Investigación de los 2 chunks unnamed** (`chunk-JQPWM6M7.js` 141.49 kB + `chunk-7EIYO3ES.js` 114.56 kB).
5. **Pasada manual de F3-04 en navegador** (5 placeholders) por Mati antes de release.
6. **Acoplamiento F4-01 + F4-02**: misma rama o PRs separados.
7. **Decisión sobre F4-01** (Detalle de certificación) y/o cualquier otro ciclo F4-F6.

Detalle completo en `docs/frontend/05-handoff-marcos-f3-06.md` sección "Decisiones requeridas de Marcos".

## Próximo ciclo recomendado

**Fase 4** (ciclos F4-01 a F4-04 ya parcialmente implementados — F4-01 y F4-02 están mergeados en `qa/frontend-release-readiness`; F4-03, F4-04 pendientes) y los ciclos F5-01 a F5-04 y F6-01 a F6-04 definidos en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` después de la línea 1485. Marcos conduce la Fase 4 desde el backend; Mati puede continuar con frontend en F4-F6 según las prioridades que Marcos defina en respuesta a las 7 decisiones de arriba.

Adicionalmente, **Fase 2** (prompts 11-22) puede continuar en paralelo en su propio espacio, ya que las definiciones de esos flujos también están consolidadas en la guía unificada.

**No iniciar F4-01 sin las decisiones de Marcos** — la guía línea 1312 lo prohíbe explícitamente (un ciclo F4 no debe "comerse" el cierre de F3).

## Observaciones registradas en Engram

Topic key estable para evoluciones futuras: `sdd/f3-06-handoff-a-marcos/archive-report`.

Observaciones del ciclo (referencia para `mem_search`):

- F3-06 (handoff final de Fase 3 a Marcos; cierre operacional; 0 código de producto; 0 spec delta).
- Patch a `docs/frontend/00-angular20-port-v0.md` (1 línea en "Ver también", no 3-6 como proponía design; F3-04 omitido por paths inexistentes).
- Estructura de archive (fecha `2026-07-12-` coherente con archives recientes del mismo día).
- 7 decisiones de Marcos documentadas en el handoff.
- Roadmap F4-F6 (12 ciclos) referenciado pero NO iniciado.
