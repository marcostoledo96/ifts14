# Archive Report: F3-04 — QA manual completo

**Fecha de cierre**: 2026-07-12
**Change archivado**: `f3-04-qa-manual-completo`
**Rama**: `frontend/v0-design-system`
**HEAD al cierre**: `e3998330be416b08502bb6b8affceaae276bd4f5`
**Veredicto sdd-verify**: BLOCKED (QA manual y checks automáticos pendientes)

## Resumen

F3-04 registra la pasada manual transversal de QA de la app Angular 20 antes del build de entrega (F3-05). Se produjo el reporte `docs/frontend/03-qa-manual-f3-04.md` con 9 secciones fijas. Además, se corrigió el guard multiplataforma de focused tests, se agregó su test de regresión y se integró `node --test scripts/no-focused-tests.test.mjs` al inicio de `test` y `test:ci`, preservando el guard y los comandos Angular existentes. El build sigue bloqueado por `node_modules` no instalado. No se ejecutaron operaciones Git ni se detectaron secretos o datos reales.

## Spec delta consolidado

**NO delta aditivo.** F3-04 fue un ciclo operacional, no una nueva capacidad. La regla "QA manual antes de release" ya está implícita en el Requirement "Política frontend, pruebas y QA" del base spec `guia-matias-angular-windows`. Por este motivo `sdd-spec` se omitió y no existe directorio `specs/` en el change. Se omitió también la fusión de delta specs en `openspec/specs/{domain}/spec.md`.

## Patches aplicados durante el ciclo

- `docs/frontend/00-angular20-port-v0.md` (4 líneas, 0 eliminadas) — nueva sección `## Ver también` al final del documento, con enlace al reporte de QA F3-04 y estado BLOCKED.

## Archivos del change (movidos al archive)

| # | Archivo | Tamaño | Notas |
|---|---|---:|---|
| 1 | `explore.md` | 28 364 B | Exploración del ciclo. |
| 2 | `proposal.md` | 7 145 B | Propuesta con intent, scope, capabilities, approach. |
| 3 | `design.md` | 7 523 B | Decisiones técnicas, estructura de entrega, plan de validación, riesgos. |
| 4 | `tasks.md` | 4 468 B | 29 tareas en 5 fases: 28 completas y 4.1 pendiente. |
| 5 | `apply-progress.md` | 7 480 B | Bitácora de aplicación + decisiones + bloqueadores. |
| 6 | `verify-report.md` | 10 546 B | Veredicto BLOCKED; criterios manuales pendientes. |
| 7 | `archive-report.md` | (este archivo) | Cierre y sync del ciclo. |

**No existe** el directorio `specs/` dentro del change. El ciclo fue operacional, no generó delta a la spec base.

## Archivos NO movidos (quedan en su ubicación original)

- `docs/frontend/03-qa-manual-f3-04.md` — **nuevo archivo permanente**, NO se mueve al archive. Es el entregable principal del ciclo y queda accesible para F3-05, F3-06 y para que Mati complete la pasada manual pendiente (placeholders en las secciones 3-7).
- `docs/frontend/00-angular20-port-v0.md` — **modificado in-place** (patch de 4 líneas descrito arriba). Permanece como fuente de verdad del port Angular 20.
- `apps/frontend-angular/package.json`, `scripts/no-focused-tests.mjs` y `scripts/no-focused-tests.test.mjs` — fix del guard, test de regresión e integración en `test`/`test:ci`; el lockfile no cambia porque solo se modificaron scripts.

## Estado final del working tree (después del archive)

```
$ git status --short
 M apps/frontend-angular/package.json
 M apps/frontend-angular/scripts/no-focused-tests.mjs
 M docs/frontend/00-angular20-port-v0.md
 M docs/frontend/03-qa-manual-f3-04.md
 M openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/apply-progress.md
 M openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/archive-report.md
 M openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/tasks.md
 M openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/verify-report.md
?? apps/frontend-angular/scripts/no-focused-tests.test.mjs
```

- 8 archivos tracked modificados: `package.json`, guard, documentación frontend y cuatro artefactos SDD.
- 1 archivo untracked: el test de regresión `scripts/no-focused-tests.test.mjs`.
- **No existe** `openspec/changes/f3-04-qa-manual-completo/` (se movió completo al archive).

`git rev-parse HEAD` sigue en `e3998330be416b08502bb6b8affceaae276bd4f5`. Cero commits nuevos por el agente. El diff incluye el fix, su test, `package.json`, documentación y artefactos SDD; ningún lockfile.

## Advertencias del ciclo (placeholders + build blocker)

El ciclo queda **BLOCKED** porque:

1. **5 secciones con placeholders "Pendiente"** (Responsive, Teclado y foco, Contraste, Estados, Consola del navegador). Preparar las tablas no satisface los criterios manuales.
2. **`npm run build` y `npm test` bloqueados por `node_modules` no instalado** (bloqueador ambiental, no bug de código). El error es `Could not find the '@angular/build:application' builder's node package`; el historial del repo muestra builds verdes en F4-01 (initial 313.84 kB raw / 90.36 kB transfer; tests 420/420 SUCCESS). Acción correctiva documentada: `cd apps/frontend-angular && npm install && npm run build && npm run test:ci`.
3. **Bug de path en `scripts/no-focused-tests.mjs` resuelto** (Windows): este mismo cambio reemplaza el uso de `.pathname` por `fileURLToPath`; no queda pendiente otro ciclo para implementar el fix.

## Patches NO aplicados (out of scope o diferidos)

- **Fusión de delta specs en `openspec/specs/`**: omitida por diseño. F3-04 no generó delta; no hay `specs/` en el change.
- **Patches a `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`**: no había patches planeados para este ciclo.
- **Auto-corrección de issues de consola o a11y** (F3-04 documenta, no corrige — por diseño).
- **Scaffolding o modificación de código Angular**: la app ya está construida; F3-04 solo verifica.

## Pendientes para F3-05 (build para `/certificados/`)

Mati debe, antes de cerrar F3-05:

1. Ejecutar `cd apps/frontend-angular && npm install && npm run build && npm run test:ci` y actualizar la sección `2. Build`. El fix Windows del guard ya está aplicado.
2. Hacer la pasada manual en navegador (5 anchos × 8 features × 4 estados) y llenar los placeholders de las secciones 3-7 con PASS/FAIL/PARTIAL + breve observación.
3. Crear un commit follow-up normal con la versión final del reporte y del port-v0 patch.
4. Después del commit, ejecutar `git log origin/frontend/v0-design-system..HEAD --oneline` y `git diff origin/frontend/v0-design-system..HEAD --stat`, presentar y revisar la salida, y recién entonces hacer push normal.

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
# Pre-stage sanity (diff-confirmation gate, requerido por AGENTS.md)
git status --short
git diff --name-only
git diff main...frontend/v0-design-system --stat

# Si el diff es el esperado (docs/frontend/00-angular20-port-v0.md, docs/frontend/03-qa-manual-f3-04.md, openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/):
git add apps/frontend-angular/package.json apps/frontend-angular/scripts/no-focused-tests.mjs apps/frontend-angular/scripts/no-focused-tests.test.mjs docs/frontend/00-angular20-port-v0.md docs/frontend/03-qa-manual-f3-04.md openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/
git commit -m "test(frontend): documentar qa manual completo"
git log origin/frontend/v0-design-system..HEAD --oneline
git diff origin/frontend/v0-design-system..HEAD --stat
# Presentar y revisar ambas salidas antes de continuar.
git push origin frontend/v0-design-system
```

La comparación contra `origin/frontend/v0-design-system` es obligatoria porque esa es la ref que se actualizará. Comparar adicionalmente contra `main` puede servir para revisar alcance, pero no reemplaza el control pre-push. No usar `--amend` ni ninguna variante de force push.

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
- Se modificaron únicamente el guard, su test de regresión y los scripts `test`/`test:ci` de `package.json`; no se tocó el lockfile ni código Angular de producto.
- Una única edición permitida: patch de 4 líneas a `docs/frontend/00-angular20-port-v0.md` (sección `## Ver también`).
- Una única operación destructiva permitida: `Move-Item` del change dir a `archive/` (verificada post-move: el dir original ya no existe; los 6 artefactos previos están en el destino; este archive-report es el 7º).
- Documentación y comentarios en español argentino formal.

## Estado del ciclo

**SDD CYCLE BLOCKED.** El archive conserva evidencia parcial, pero F3-04 no queda aprobado hasta completar QA manual y checks automáticos. F3-05 puede ejecutar el build, pero no debe tratar los criterios manuales como satisfechos.

El conteo de cierre es **28/29**: la tarea 4.1 permanece pendiente y el archive no representa un cierre aprobado.
