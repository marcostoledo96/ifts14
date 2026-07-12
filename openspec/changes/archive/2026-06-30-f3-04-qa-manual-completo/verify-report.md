# Verify Report: F3-04 — QA manual completo

**Veredicto**: BLOCKED

**Fecha**: 2026-07-12
**Change**: `f3-04-qa-manual-completo`
**Branch**: `frontend/v0-design-system`
**HEAD al cierre**: `e3998330be416b08502bb6b8affceaae276bd4f5`

## Resumen

Los checks documentales se completaron, pero no prueban los criterios manuales. Responsive, teclado/foco, contraste, estados y consola siguen pendientes; build y tests también estaban bloqueados. F3-04 no puede cerrar con PASS.

## Plan de validación ejecutado

| # | Comando / Check | Resultado esperado | Resultado real | PASS/FAIL |
|---|---|---|---|---|
| 1 | `git status --short` | Solo untracked: change dir + QA report | `?? docs/frontend/03-qa-manual-f3-04.md`<br>`?? openspec/changes/f3-04-qa-manual-completo/` | ✅ PASS |
| 2 | `git diff --name-only` | 0 tracked changes | *(sin salida)* | ✅ PASS |
| 3 | `git rev-parse --abbrev-ref HEAD` | `frontend/v0-design-system` | `frontend/v0-design-system` | ✅ PASS |
| 4 | `git rev-parse HEAD` | `e399833` | `e3998330be416b08502bb6b8affceaae276bd4f5` | ✅ PASS |
| 5 | `git remote get-url origin` | URL conteniendo `ifts14` | `https://github.com/marcostoledo96/ifts14.git` | ✅ PASS |
| 6 | `Get-Content docs/frontend/03-qa-manual-f3-04.md \| Select-String "^## "` count | 9 secciones | 9 matches (Resumen ejecutivo, Build, Responsive, Teclado y foco, Contraste y legibilidad, Estados, Consola del navegador, Datos sensibles, Pendientes y blockers) | ✅ PASS |
| 7 | `Select-String "build"` en reporte | ≥ 1 match | 8 matches | ✅ PASS |
| 8 | `Select-String "360\|390\|430\|responsive"` en reporte | ≥ 1 match | 5 matches | ✅ PASS |
| 9 | `Select-String "carga\|vacío\|error\|éxito\|estado"` en reporte | ≥ 4 matches | 18 matches | ✅ PASS |
| 10 | `Select-String "DNI\|token\|contraseña\|password\|clave"` en reporte | ≥ 1 match | 10 matches | ✅ PASS |
| 11 | `Select-String "secreto\|dump\|credencial\|real.*DNI"` en reporte | 0 matches | 0 matches | ✅ PASS |
| 12 | `Select-String "build\|webpack\|bundle"` en reporte | ≥ 1 match | 10 matches | ✅ PASS |
| 13 | `git diff --stat` sobre `apps/frontend-angular/` | 0 líneas modificadas | *(sin salida)* — 0 líneas | ✅ PASS |
| 14 | Delta de spec | No existe delta (ciclo operacional) | `openspec/changes/f3-04-qa-manual-completo/` no contiene `specs/` | ✅ PASS |
| 15 | Marcos active change `backend-public-endpoint-hardening/` | Sin cambios | El directorio no existe en el repo actual; no hay nada que tocar | ✅ PASS |
| 16 | F0 branches no mergeadas | Sin modificaciones | Solo ramas `docs/matias-onboarding-f0-*` (remote); sin modificaciones locales | ✅ PASS |
| 17 | Engram topics `sdd/f3-04-qa-manual-completo/*` | 5 pre-verify + 1 verify-report | #80 (explore), #81 (proposal), #82 (design), #83 (tasks), #84 (apply-progress). Total 5 pre-verify. + verify-report (#85) será 6; archive-report será #7. | ✅ PASS |
| 18 | Working tree | 2 untracked, 0 modified, 0 staged | 2 untracked (`docs/frontend/03-qa-manual-f3-04.md`, `openspec/changes/f3-04-qa-manual-completo/`), 0 modified, 0 staged | ✅ PASS |

## Mapeo de Criterios de Aceptación a Evidencia

| # | Criterio | Evidencia (archivo + sección) | Veredicto |
|---|---|---|---|
| 1 | Change dir con 7 artefactos OpenSpec, sin `specs/` | `openspec/changes/f3-04-qa-manual-completo/` contiene 5 artefactos al cierre de apply (explore, proposal, design, tasks, apply-progress); verify-report.md es el 6º; archive-report.md será el 7º en `sdd-archive`. Sin directorio `specs/`. | ✅ PASS |
| 2 | QA report con 9 secciones | `docs/frontend/03-qa-manual-f3-04.md` — 9 H2 sections confirmadas por regex `^## `: Resumen ejecutivo, Build, Responsive, Teclado y foco, Contraste y legibilidad, Estados, Consola del navegador, Datos sensibles, Pendientes y blockers. | ✅ PASS |
| 3 | `npm run build` documentado | §2 Build. Exit code distinto de 0 documentado; error `Could not find '@angular/build:application' builder's node package`; causa raíz: `node_modules` no instalado. Acción correctiva propuesta: `npm install` + re-verificar. | ✅ PASS (con blocker ambiental) |
| 4 | 5 anchos verificados | La tabla existe, pero no hay resultados de navegación. | ⛔ BLOCKED |
| 5 | Teclado y foco verificados | La checklist existe, pero no hay evidencia manual. | ⛔ BLOCKED |
| 6 | Contraste y legibilidad verificados | Los ratios teóricos no validan el render real. | ⛔ BLOCKED |
| 7 | 4 estados verificados | La lectura estática no reemplaza recorrer los estados. | ⛔ BLOCKED |
| 8 | Consola verificada | No se levantó la aplicación ni se inspeccionó la consola. | ⛔ BLOCKED |
| 9 | Datos sensibles confirmados | §8 Datos sensibles. 6 checks: UI admin (DNI enmascarado `XX****XX`), tokens (`tokenPrefix` + URL truncada), clave admin (0 matches en código de producto), storage (0 matches en código de producto), DNI público (correcto por D0), token en URL (por diseño de ruta pública). 0 matches `secreto\|dump\|credencial\|real.*DNI`. | ✅ PASS |

**Nota sobre criterios 4–8**: una checklist preparada no satisface un criterio manual. Los cinco criterios permanecen BLOCKED hasta registrar evidencia real.

## Tareas verificadas

**28/29 tareas completadas** — la tarea 4.1 permanece `[ ]` porque este verify está BLOCKED.

| Fase | Tareas | Completadas | Estado |
|---|---|---|---|
| Phase 1 — Preparación | 1.1 a 1.4 | 4/4 | ✅ |
| Phase 2 — Ejecución QA | 2.1 a 2.12 | 12/12 | ✅ |
| Phase 3 — Validación previa | 3.1 a 3.7 | 7/7 | ✅ |
| Phase 4 — Cierre | 4.1 a 4.4 | 3/4 | ⛔ 4.1 pendiente |
| Phase 5 — Sanity final | 5.1 a 5.2 | 2/2 | ✅ |

## Hallazgos

### CRITICAL

Ninguno.

### WARNING

1. **Build bloqueado por entorno**: `cd apps/frontend-angular && npm run build` falla porque `node_modules` no está instalado. El error es `Could not find the '@angular/build:application' builder's node package`. No es un bug de código — el historial muestra builds verdes en F4-01. Acción correctiva: `npm install` en la máquina que tenga Node.js ≥ 18, luego re-ejecutar build.
2. **`npm test` bloqueado por entorno**: falta instalar `node_modules`. El bug de path Windows de `scripts/no-focused-tests.mjs` ya fue corregido en este mismo cambio con `fileURLToPath`; no queda pendiente reimplementarlo.
3. **QA manual pendiente**: 5 secciones del reporte (responsive, teclado/foco, contraste, estados, consola) tienen celdas "Pendiente" waiting on Mati. Las tablas están estructuralmente completas; falta la evidencia visual.
4. **Directorio `backend-public-endpoint-hardening/` no existe**: el design.md lo lista como off-limits pero el directorio no está presente en el repo actual. Esto no afecta la verificación — simplemente no hay nada que tocar.

### SUGGESTION

1. **Distinción QA manual vs tests**: el reporte menciona tests automatizados en §2 Build y §7 Consola, y su título es "QA manual completo". Sería más explícito agregar una oración tipo "Este reporte documenta QA manual; los tests automatizados 420/420 corresponden a F4-01" en el resumen ejecutivo. No bloquea — el contexto es claro.

## Patches aplicados durante el ciclo

NO se aplicó el patch opcional a `docs/frontend/00-angular20-port-v0.md`. La decisión de diseño lo difiere a `sdd-archive`. El port doc ya cubre el estado hasta F4-01; el patch será un enlace de 1-2 líneas al reporte de QA.

## Estado Git

```
Working tree:
  ?? docs/frontend/03-qa-manual-f3-04.md
  ?? openspec/changes/f3-04-qa-manual-completo/

HEAD: e3998330be416b08502bb6b8affceaae276bd4f5
Branch: frontend/v0-design-system
Commits nuevos por el agente: 0
El siguiente cambio debe ser un commit follow-up normal, sin reescribir historial.
Últimos 3 commits (todos de Marcos, sin intervención del agente):
  e399833 Merge pull request #38 from marcostoledo96/frontend/certificate-detail-pdf
  f7aaba7 feat(frontend): agregar expediente administrativo de certificaciones
  b636adc Merge pull request #37 from marcostoledo96/frontend/admin-certifications
```

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
git add apps/frontend-angular/package.json apps/frontend-angular/scripts/no-focused-tests.mjs apps/frontend-angular/scripts/no-focused-tests.test.mjs docs/frontend/00-angular20-port-v0.md docs/frontend/03-qa-manual-f3-04.md openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/
git commit -m "test(frontend): documentar qa manual completo"
git log origin/frontend/v0-design-system..HEAD --oneline
git diff origin/frontend/v0-design-system..HEAD --stat
# Presentar y revisar ambas salidas antes de continuar.
git push origin frontend/v0-design-system
```

Pre-push obligatorio: después del commit, ejecutar `git log origin/frontend/v0-design-system..HEAD --oneline` y `git diff origin/frontend/v0-design-system..HEAD --stat`, presentar y revisar ambas salidas, y recién entonces hacer push normal. Comparar solo contra `main` no protege la rama remota. No usar `--amend` ni ninguna variante de force push.

## Próximo paso

`sdd-archive` — cierre del ciclo. Después, **Mati debe**:

1. Instalar dependencias en un entorno autorizado y ejecutar `cd apps/frontend-angular && npm run build && npm run test:ci`; `test:ci` preserva el guard existente y ahora ejecuta antes su test de regresión con `node --test scripts/no-focused-tests.test.mjs`.
2. Hacer la pasada manual en navegador (5 anchos × 8 features × 4 estados) y llenar los placeholders de las secciones 3-7.
3. Crear un commit follow-up normal con la versión final del reporte.
4. Ejecutar el pre-push contra `origin/frontend/v0-design-system` y hacer push normal.
