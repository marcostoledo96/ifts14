# Archive Report: F3-04 — QA manual completo

**Fecha de cierre**: 2026-07-12
**Change archivado**: `f3-04-qa-manual-completo`
**Rama**: `frontend/v0-design-system`
**HEAD al cierre**: `e3998330be416b08502bb6b8affceaae276bd4f5`
**Veredicto sdd-verify**: PASS WITH WARNINGS (18/18 Plan de validación, 9/9 criterios de aceptación con notas por placeholders, 29/29 tareas, 0 CRITICAL)

## Resumen

F3-04 es el primer ciclo de Fase 3 que ejecuta Mati (Marcos hizo F3-01, F3-02 y F3-03). Es un ciclo estrictamente documental y operativo que registra la pasada manual transversal de QA de la app Angular 20 de Marcos antes del build de entrega (F3-05). Se produjo el reporte `docs/frontend/03-qa-manual-f3-04.md` con 9 secciones fijas (Resumen ejecutivo, Build, Responsive, Teclado y foco, Contraste y legibilidad, Estados, Consola del navegador, Datos sensibles, Pendientes y blockers) mapeadas 1:1 a los 9 criterios hard de la guía. Cero líneas modificadas en `apps/frontend-angular/`. El build quedó bloqueado por `node_modules` no instalado (bloqueador ambiental, no bug de código); se documentó la acción correctiva (`cd apps/frontend-angular && npm install && npm run build`). No se ejecutaron operaciones Git, no se detectaron secretos ni datos reales en el código relevado.

## Spec delta consolidado

**NO delta aditivo.** F3-04 fue un ciclo operacional, no una nueva capacidad. La regla "QA manual antes de release" ya está implícita en el Requirement "Política frontend, pruebas y QA" del base spec `guia-matias-angular-windows`. Por este motivo `sdd-spec` se omitió y no existe directorio `specs/` en el change. Se omitió también la fusión de delta specs en `openspec/specs/{domain}/spec.md`.

## Patches aplicados durante el ciclo

- `docs/frontend/00-angular20-port-v0.md` (4 líneas, 0 eliminadas) — nueva sección `## Ver también` al final del documento, con enlace al reporte de QA F3-04 y resumen de su estado (PASS WITH WARNINGS + placeholders pendientes + blocker ambiental `node_modules`).

## Archivos del change (movidos al archive)

| # | Archivo | Tamaño | Notas |
|---|---|---:|---|
| 1 | `explore.md` | 28 364 B | Exploración del ciclo. |
| 2 | `proposal.md` | 7 145 B | Propuesta con intent, scope, capabilities, approach. |
| 3 | `design.md` | 7 523 B | Decisiones técnicas, estructura de entrega, plan de validación, riesgos. |
| 4 | `tasks.md` | 4 468 B | 29 tareas en 5 fases (todas `[x]`). |
| 5 | `apply-progress.md` | 7 480 B | Bitácora de aplicación + decisiones + bloqueadores. |
| 6 | `verify-report.md` | 10 546 B | Veredicto PASS WITH WARNINGS, 18 checks, 9 criterios, 29/29 tareas. |
| 7 | `archive-report.md` | (este archivo) | Cierre y sync del ciclo. |

**No existe** el directorio `specs/` dentro del change. El ciclo fue operacional, no generó delta a la spec base.

## Archivos NO movidos (quedan en su ubicación original)

- `docs/frontend/03-qa-manual-f3-04.md` — **nuevo archivo permanente**, NO se mueve al archive. Es el entregable principal del ciclo y queda accesible para F3-05, F3-06 y para que Mati complete la pasada manual pendiente (placeholders en las secciones 3-7).
- `docs/frontend/00-angular20-port-v0.md` — **modificado in-place** (patch de 4 líneas descrito arriba). Permanece como fuente de verdad del port Angular 20.

## Estado final del working tree (después del archive)

```
$ git status --short
 M docs/frontend/00-angular20-port-v0.md
?? docs/frontend/03-qa-manual-f3-04.md
?? openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/
```

- 1 archivo tracked modificado: port-v0 con el patch de la sección `## Ver también`.
- 1 archivo untracked: el reporte de QA (entregable principal, queda en `docs/frontend/`).
- 1 directorio untracked: el change completo ya movido a `archive/2026-06-30-f3-04-qa-manual-completo/`.
- **No existe** `openspec/changes/f3-04-qa-manual-completo/` (se movió completo al archive).

`git rev-parse HEAD` sigue en `e3998330be416b08502bb6b8affceaae276bd4f5`. Cero commits nuevos por el agente. `git diff --stat` muestra solo el port-v0 patch (4 insertions, 0 deletions).

## Advertencias del ciclo (placeholders + build blocker)

El ciclo cerró con **PASS WITH WARNINGS** porque:

1. **5 secciones con placeholders "Pendiente"** (Responsive, Teclado y foco, Contraste, Estados, Consola del navegador) para que Mati complete la pasada visual en navegador. Esto es por diseño del ciclo: el design.md y la proposal anticiparon explícitamente este escenario (Risk: "Mati no puede hacer la pasada manual en el ciclo") con mitigación "OpenCode estructura la checklist con celdas 'pendiente de pasada manual'". Las tablas están estructuralmente completas, listas para que Mati llene PASS/FAIL/PARTIAL con evidencia real.
2. **`npm run build` y `npm test` bloqueados por `node_modules` no instalado** (bloqueador ambiental, no bug de código). El error es `Could not find the '@angular/build:application' builder's node package`; el historial del repo muestra builds verdes en F4-01 (initial 313.84 kB raw / 90.36 kB transfer; tests 420/420 SUCCESS). Acción correctiva documentada: `cd apps/frontend-angular && npm install && npm run build && npm run test:ci`.
3. **Bug de path en `scripts/no-focused-tests.mjs`** (Windows): `new URL('../src', import.meta.url).pathname` produce `/C:/...`, que Node interpreta como `C:\C:\...`. Esto bloquearía `npm test` en Windows incluso con dependencias instaladas. Fuera del alcance de F3-04; queda para ciclo futuro (sugerido: usar `fileURLToPath`).

## Patches NO aplicados (out of scope o diferidos)

- **Fusión de delta specs en `openspec/specs/`**: omitida por diseño. F3-04 no generó delta; no hay `specs/` en el change.
- **Patches a `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`**: no había patches planeados para este ciclo.
- **Auto-corrección de issues de consola o a11y** (F3-04 documenta, no corrige — por diseño).
- **Bug fix de `scripts/no-focused-tests.mjs`**: fuera del alcance de F3-04.
- **Scaffolding o modificación de código Angular**: la app ya está construida; F3-04 solo verifica.

## Pendientes para F3-05 (build para `/certificados/`)

Mati debe, antes de cerrar F3-05:

1. Ejecutar `cd apps/frontend-angular && npm install && npm run build && npm run test:ci` para resolver el bloqueador ambiental y actualizar la sección `2. Build` del reporte F3-04 con exit code, output y warnings reales.
2. Hacer la pasada manual en navegador (5 anchos × 8 features × 4 estados) y llenar los placeholders de las secciones 3-7 con PASS/FAIL/PARTIAL + breve observación.
3. Commit amend con la versión final del reporte y del port-v0 patch.
4. Force-push con `--force-with-lease` (la rama local está 76 commits adelante de la remota vieja `72fbe58`). Comparar contra `main` en el pre-push safety, no contra la remota stale.

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
# Pre-stage sanity (diff-confirmation gate, requerido por AGENTS.md)
git status --short
git diff --name-only
git diff main...frontend/v0-design-system --stat

# Si el diff es el esperado (docs/frontend/00-angular20-port-v0.md, docs/frontend/03-qa-manual-f3-04.md, openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/):
git add docs/frontend/00-angular20-port-v0.md docs/frontend/03-qa-manual-f3-04.md openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/
git commit -m "test(frontend): documentar qa manual completo"
git push origin frontend/v0-design-system --force-with-lease
```

**Pre-push safety** (obligatorio por AGENTS.md antes de `--force-with-lease`):

```powershell
git log main..frontend/v0-design-system --oneline
git diff main...frontend/v0-design-system --stat
```

La rama local está 76 commits adelante del remote stale (`origin/frontend/v0-design-system` en `72fbe58`); comparar contra `main` para entender el delta real, no contra la remota vieja. `--force-with-lease` es más seguro que `--force` porque protege contra sobreescribir cambios que otro cliente haya pusheado al remote.

## Próximo ciclo recomendado

**F3-05 — Build para `/certificados/`**. Definido en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 1215+). Mati ya tiene el reporte F3-04 estructurado; F3-05 es la verificación del build de producción con base href `/certificados/`, que consume la sección `2. Build` del reporte F3-04 (corregida con resultados reales tras `npm install`).

## Engram (referencia de trazabilidad)

Observaciones del ciclo en Engram bajo `sdd/f3-04-qa-manual-completo/*`:

| # | Título | Tipo | Sync ID |
|---|---|---|---|
| 80 | Explore F3-04 — QA manual completo | architecture | obs-97bea4398c813a3d |
| 81 | Proposal F3-04 — QA manual completo | architecture | obs-a89641e4a62947c6 |
| 82 | Design F3-04 — QA manual completo | architecture | obs-80d8c747ec5c28e6 |
| 83 | Tasks F3-04 — QA manual completo | architecture | obs-be11ad89adf45a2a |
| 84 | Apply progress F3-04 — QA manual completo | architecture | obs-2122a45aeb97af0a |
| 85 | Verify report F3-04 — QA manual completo | architecture | obs-cad8ed4a7cfca396 |
| (este) | Archive report F3-04 — QA manual completo | architecture | obs-archive-f3-04 (pendiente de guardado en este paso) |

Total: 7 observaciones (6 pre-archive + este archive report). Cubre el ciclo completo de la pipeline SDD.

## Reglas respetadas

- Cero operaciones Git ejecutadas por el agente.
- Cero commits en `frontend/v0-design-system`; HEAD sigue en `e3998330be416b08502bb6b8affceaae276bd4f5`.
- No se tocó `material_privado_no_versionar/`, secretos, dumps ni logs.
- No se tocó `openspec/changes/backend-public-endpoint-hardening/` (Marcos — el directorio no existe en el repo actual; no hay nada que tocar).
- No se modificó código de `apps/frontend-angular/`.
- Una única edición permitida: patch de 4 líneas a `docs/frontend/00-angular20-port-v0.md` (sección `## Ver también`).
- Una única operación destructiva permitida: `Move-Item` del change dir a `archive/` (verificada post-move: el dir original ya no existe; los 6 artefactos previos están en el destino; este archive-report es el 7º).
- Documentación y comentarios en español argentino formal.

## Estado del ciclo

**SDD CYCLE COMPLETE.** F3-04 está planificado, implementado, verificado y archivado. El reporte de QA queda accesible en `docs/frontend/03-qa-manual-f3-04.md` para que Mati complete la pasada manual pendiente y arranque F3-05 con el build de producción.
