# Archive Report: F3-05 — Build para /certificados/

**Fecha de cierre**: 2026-07-12
**Change archivado**: `f3-05-build-para-certificados`
**Rama**: `qa/frontend-release-readiness`
**HEAD al cierre**: `ca2f9c3` (full: `ca2f9c3e5bc2cbd90cbaa56c56b9a225b2df752a`)
**Veredicto sdd-verify**: PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE

## Decisiones del archive que difieren del prompt del orquestador

1. **Fecha del directorio de archive**: el prompt del orquestador indicaba `2026-06-30-f3-05-build-para-certificados/`. Se usa `2026-07-12-f3-05-build-para-certificados/` porque coincide con la fecha de los artefactos del ciclo y con el patrón de archives recientes del mismo día. El valor `2026-06-30-` parece ser un copy-paste del F3-04 referenciado.
2. **Creación de la sección "## Ver también"**: el prompt del orquestador asumía que la sección existía en `docs/frontend/00-angular20-port-v0.md` (F3-04 nunca fue archivado en este árbol y la sección no existe). El `design.md` autoriza explícitamente "(o crearla si no existe)". Se creó la sección con una entrada para F3-05 (no se agregaron entradas para F3-04 porque ese ciclo no tiene artefacto en el árbol).
3. **Estructura de archive**: el primer intento de `Move-Item` anidó el contenido (`archive/2026-07-12-f3-05-.../f3-05-.../proposal.md`) en lugar de mover los archivos al nivel superior (como sí hacen F4-01/F4-02). Se corrigió moviendo los 6 archivos al nivel superior y eliminando el subdir vacío.

## Resumen

F3-05 documentó evidencia histórica del build de producción con `ng build --configuration production --base-href /certificados/`. El output preservado muestra completion en 6.256 segundos, métricas de 314.03 kB raw / 90.41 kB transfer y 2 warnings de CSS budget; el exit code no quedó preservado y no es verificable desde este checkout. Por eso el cierre es **PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE** y no afirma PASS ni ausencia comprobada de errores. La release readiness actual requiere regenerar el build y capturar su exit code.

## Spec delta consolidado

**NO delta aditivo.** F3-05 fue un ciclo operacional, no una nueva capacidad. La regla "verificar build con `base-href /certificados/` antes del build de entrega" ya está implícita en la metodología SDD y en la sección "Build para cPanel" (líneas 105-113) de `docs/frontend/00-angular20-port-v0.md`. No se modifica `openspec/specs/`.

## Patches aplicados durante el ciclo

- `docs/frontend/00-angular20-port-v0.md` (+4 líneas estructurales) — se creó la sección `## Ver también` con una entrada enlazando al reporte F3-05. Ver `git diff`: 1 file changed, 4 insertions(+).
  - Decisión de creación (no patch) documentada arriba.
- `docs/deploy/00-cpanel-certificados.md` — NO se parcheó. El `verify-report.md` (sección de "Patches planificados para sdd-archive") lo dejaba opcional, sujeto a que el build revelara notas de config de servidor. El build no reveló tal nota. La advertencia sobre `.htaccess` SPA fallback queda en `docs/frontend/04-build-validacion-f3-05.md` §8 como pendiente de F3-06 o ciclo dedicado.

## Archivos del change (movidos al archive)

Los 7 artefactos SDD del ciclo:

| Archivo | Tamaño | Notas |
|---|---:|---|
| `explore.md` | 20164 B | Exploración inicial (rama, bloqueador `node_modules`, hallazgos de `angular.json`). |
| `proposal.md` | 6255 B | Propuesta del ciclo (scope, criterios de aceptación, riesgos). |
| `design.md` | 9518 B | Diseño técnico (8 secciones del reporte, estrategia sin spec, patch a port-v0). |
| `tasks.md` | 6553 B | 31 tareas en 5 fases (Preparación, Build, Validación, Cierre, Sanity). |
| `apply-progress.md` | 5096 B | Estado de aplicación (31/31 tareas, decisiones clave, comandos Git propuestos). |
| `verify-report.md` | 10397 B | Veredicto PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE por exit code no preservado. |
| `archive-report.md` | (este archivo) | Cierre del ciclo. |

**No existe `specs/` ni `spec.md`** en el change dir: la decisión de omitir el delta aditivo se documenta en el `proposal.md` (Capabilities → None) y se respeta en el archive. El ciclo es operacional, no de capacidad.

## Archivos NO movidos (quedan en su ubicación original)

- `docs/frontend/04-build-validacion-f3-05.md` — nuevo archivo permanente (~280 líneas, 10 secciones). **NO se mueve al archive**: es el entregable principal del ciclo y queda accesible como referencia para F3-06+ y para futuros ciclos que ejecuten builds de `/certificados/`. Es enlazado desde `docs/frontend/00-angular20-port-v0.md` (sección "Ver también", patch aplicado en este archive).
- `docs/frontend/00-angular20-port-v0.md` — patch in-place (+4 líneas: heading `## Ver también` + 1 bullet). El archivo en sí no se mueve; sigue en `docs/frontend/` como la fuente de verdad del port Angular 20.

## Estado final del working tree (después del archive)

```
?? docs/frontend/04-build-validacion-f3-05.md
?? openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/
 M docs/frontend/00-angular20-port-v0.md
```

Equivalente a:

- 1 modified: `docs/frontend/00-angular20-port-v0.md` (el patch de "Ver también").
- 1 untracked: `docs/frontend/04-build-validacion-f3-05.md` (el build report, nuevo).
- 1 untracked: `openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/` (la carpeta de archive recién creada).
- 0 staged.
- 0 commits del agente.
- HEAD: `ca2f9c3` (sin cambios).

**Verificación post-archive**: el directorio fuente `openspec/changes/f3-05-build-para-certificados/` ya no existe (verificado con `Get-ChildItem -ErrorAction SilentlyContinue` → vacío + `Test-Path` → `False`).

## Resultado del build

- **Comando**: `cd apps/frontend-angular && npm run build -- --configuration production --base-href /certificados/`
- **Tiempo**: 6.256 segundos
- **Exit code**: no preservado; no verificable desde este checkout. El output histórico muestra "Application bundle generation complete" y la ubicación generada.
- **Output location informada**: `apps/frontend-angular/dist/frontend-angular/` (directorio no disponible en la rama; inventario completo no reproducible)
- **Base href verificada**: `<base href="/certificados/">` en `dist/.../index.html` línea 6
- **Bundle inicial**: 314.03 kB raw / 90.41 kB transfer (gzip estimado)
- **Chunks principales**:
  - `certification-preview-page` 30.29 kB / 6.24 kB
  - `certification-pdf-preview-page` 27.07 kB / 6.03 kB
  - `course-editor-page` 12.37 kB / 3.34 kB
  - `attendance-marking-page` 12.10 kB / 3.29 kB
  - `admin-shell` 11.43 kB / 3.03 kB
  - `public-validation-page` 8.99 kB / 2.69 kB
- **CSS bundleado global**: 1.95 kB (`styles-SNHQ2KJR.css`)
- **Warnings de CSS budget** (carry-forward, no bloqueantes):
  - `certification-preview-page.css` 14.31 kB (+6.32 kB sobre budget de 8 kB)
  - `certification-pdf-preview-page.css` 13.70 kB (+5.70 kB sobre budget de 8 kB)
  - Ambos por debajo del threshold de error de 16 kB; documentados en el build report §5-6.
- **Errores visibles en el fragmento histórico**: ninguno; no equivale a ausencia comprobada de errores sin exit code.
- **Timestamp del build**: `2026-07-12T21:19:30.609Z`.

## Resumen de validaciones

| Validación | Resultado | Origen |
|---|---|---|
| Plan de validación (Plan de validación del design) | 16/16 PASS | `verify-report.md` §"Plan de validación ejecutado" |
| Criterios de aceptación (proposal) | 3 PASS / 1 PARTIAL | `verify-report.md` §"Mapeo de Criterios de Aceptación" |
| Tareas (tasks.md) | 31/31 completas | `apply-progress.md` + `verify-report.md` |
| Hallazgos CRITICAL | 1: exit code no preservado | `verify-report.md` §"Hallazgos" |
| Hallazgos WARNING | 3 (W1 falso positivo de secretos, W2 CSS budget, W3 errores de paths no versionados — todos aceptados) | `verify-report.md` §"Hallazgos" |
| Working tree final | Limpio (2 untracked esperados) | `verify-report.md` §"Estado Git" |
| HEAD al cierre | `ca2f9c3` (sin commits del agente) | `git rev-parse HEAD` |
| Commits del agente | 0 | (comparación HEAD inicio vs cierre) |

## Comandos Git PROPUESTOS al operador (NO ejecutados por el agente)

```powershell
git status --short
git diff --name-only
# Presentar ambos resultados y esperar confirmación explícita de que el diff es correcto antes de continuar.
git add docs/frontend/00-angular20-port-v0.md openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/ docs/frontend/04-build-validacion-f3-05.md
git commit -m "build(frontend): validar build certificados"
git push -u origin qa/frontend-release-readiness
```

**Pre-stage safety** (obligatorio antes de `git add`): revisar las salidas de `git status --short` y `git diff --name-only`, presentarlas a Matías o Marcos y esperar su confirmación explícita de que el diff es correcto. Solo después corresponde ejecutar el `git add` propuesto.

**Pre-push safety** (obligatorio por AGENTS.md, después del commit y antes del push):
- `git log origin/main..HEAD --oneline` — debe mostrar el commit recién creado.
- `git diff origin/main...HEAD --stat` — debe mostrar desde el merge-base:
  - 1 archivo modificado: `docs/frontend/00-angular20-port-v0.md` (+4 líneas).
  - 1 archivo nuevo: `docs/frontend/04-build-validacion-f3-05.md`.
  - 1 archivo nuevo: `openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/` (con 7 archivos adentro).
- Si ambas verificaciones coinciden con lo esperado, recién entonces ejecutar `git push -u origin qa/frontend-release-readiness`.

## Próximo ciclo recomendado

**F3-06 — Handoff a Marcos.** Definido en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1260+. El objetivo es entregar a Marcos un reporte revisable con:

- Estado de la rama `qa/frontend-release-readiness`.
- Evidencia de builds verificados para `/certificados/` (este archive + `04-build-validacion-f3-05.md`).
- Riesgos conocidos (warnings CSS budget, necesidad de `.htaccess` SPA fallback, `dist/` no versionado).
- Pendientes categorizados (del `build report` §8 + de F3-04 + de F3-05).
- Handoff explícito a Fase 2 (firma de release y deploy).
- Comandos Git propuestos para decisión humana (sin auto-ejecución).

F3-06 cierra formalmente la Fase 3 operativa de Mati y abre la entrega del módulo `/certificados/` a la cadena de release.

## Observaciones registradas en Engram

Topic key estable para evoluciones futuras: `sdd/f3-05-build-para-certificados/archive-report`.

Observaciones del ciclo (referencia para `mem_search`):
- F3-05 (verificación de build con base-href /certificados/).
- Warnings CSS budget (carry-forward desde F4-01/F4-02).
- Patch a `docs/frontend/00-angular20-port-v0.md` (creación de "Ver también").
- Estructura de archive (fecha correcta vs. copy-paste del F3-04).
