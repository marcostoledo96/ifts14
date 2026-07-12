# Verify Report: F3-04 — QA manual completo

**Veredicto**: PASS WITH WARNINGS

**Fecha**: 2026-07-12
**Change**: `f3-04-qa-manual-completo`
**Branch**: `frontend/v0-design-system`
**HEAD al cierre**: `e3998330be416b08502bb6b8affceaae276bd4f5`

## Resumen

F3-04 es un ciclo documental puro: cero líneas modificadas en `apps/frontend-angular/`, 29/29 tareas completadas, y los 18 checks del Plan de validación en verde. Las 5 secciones de QA manual (responsive, teclado/foco, contraste, estados, consola) tienen placeholders "Pendiente" porque Mati debe ejecutar la pasada visual en navegador — esto es por diseño y no impide el cierre del ciclo. El bloqueo del build por falta de `node_modules` está documentado con su acción correctiva. No se detectaron secretos, no se modificó código de producto, y no se ejecutaron operaciones Git.

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
| 4 | 5 anchos documentados | §3 Responsive. Tabla 8 features × 5 anchos con celdas "Pendiente". Mati debe completar la pasada visual. | ⚠️ PASS WITH NOTE (placeholders) |
| 5 | Teclado y foco documentados | §4 Teclado y foco. Tabla por feature con Tab nav, Shift+Tab, Enter, Escape, foco visible. Celdas "Pendiente". Hallazgo estático: skip link en `app.ts`, `--focus-ring` documentado. | ⚠️ PASS WITH NOTE (placeholders) |
| 6 | Contraste y legibilidad documentados | §5 Contraste. Tabla con ratios teóricos estimados (WebAIM): `--color-ink`/`--color-paper` ~16:1, links ~6.8:1, error ~7.4:1. Falta medición en render real. | ⚠️ PASS WITH NOTE (ratios teóricos) |
| 7 | 4 estados documentados | §6 Estados. Tabla 8 features × 4 estados (carga, vacío, error, éxito) con placeholders. Hallazgo estático: `public-validation-page` maneja bloques `valid`/`not-verifiable`/`technical-error`; admin features usan `<p role="alert">` y `<output aria-live="polite">`. | ⚠️ PASS WITH NOTE (placeholders) |
| 8 | Consola documentada | §7 Consola. Tabla por entorno con placeholders. Hallazgo estático: build histórico F4-01 verde, único warning de budget CSS aceptado. Sin navegación real por falta de dependencias y servidor. | ⚠️ PASS WITH NOTE (placeholders) |
| 9 | Datos sensibles confirmados | §8 Datos sensibles. 6 checks: UI admin (DNI enmascarado `XX****XX`), tokens (`tokenPrefix` + URL truncada), clave admin (0 matches en código de producto), storage (0 matches en código de producto), DNI público (correcto por D0), token en URL (por diseño de ruta pública). 0 matches `secreto\|dump\|credencial\|real.*DNI`. | ✅ PASS |

**Nota sobre criterios 4–8**: los placeholders "Pendiente" son por diseño. La propuesta anticipó explícitamente este escenario (Risk: "Mati no puede hacer la pasada manual en el ciclo") con mitigación: "OpenCode estructura la checklist con celdas 'pendiente de pasada manual'". Las tablas están estructuralmente completas, listas para que Mati llene los resultados reales en navegador.

## Tareas verificadas

**29/29 tareas completadas** — todas las marcas `[x]` en `tasks.md` confirmadas contra `apply-progress.md`.

| Fase | Tareas | Completadas | Estado |
|---|---|---|---|
| Phase 1 — Preparación | 1.1 a 1.4 | 4/4 | ✅ |
| Phase 2 — Ejecución QA | 2.1 a 2.12 | 12/12 | ✅ |
| Phase 3 — Validación previa | 3.1 a 3.7 | 7/7 | ✅ |
| Phase 4 — Cierre | 4.1 a 4.4 | 4/4 | ✅ |
| Phase 5 — Sanity final | 5.1 a 5.2 | 2/2 | ✅ |

## Hallazgos

### CRITICAL

Ninguno.

### WARNING

1. **Build bloqueado por entorno**: `cd apps/frontend-angular && npm run build` falla porque `node_modules` no está instalado. El error es `Could not find the '@angular/build:application' builder's node package`. No es un bug de código — el historial muestra builds verdes en F4-01. Acción correctiva: `npm install` en la máquina que tenga Node.js ≥ 18, luego re-ejecutar build.
2. **`npm test` bloqueado por entorno + bug de path**: además de `node_modules`, el script `scripts/no-focused-tests.mjs` tiene un bug en Windows (`new URL(…).pathname` produce `/C:/…` que Node interpreta como `C:\C:\…`). Esto bloquea `npm test` incluso con dependencias instaladas en Windows. Fuera de alcance de F3-04; documentado para ciclo futuro.
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
Local ahead 76 (necesitará --force-with-lease al pushear)
Últimos 3 commits (todos de Marcos, sin intervención del agente):
  e399833 Merge pull request #38 from marcostoledo96/frontend/certificate-detail-pdf
  f7aaba7 feat(frontend): agregar expediente administrativo de certificaciones
  b636adc Merge pull request #37 from marcostoledo96/frontend/admin-certifications
```

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
git add openspec/changes/f3-04-qa-manual-completo/ docs/frontend/03-qa-manual-f3-04.md
git commit -m "test(frontend): documentar qa manual completo"
git push origin frontend/v0-design-system --force-with-lease
```

**Pre-push safety**: Mati debe correr antes del push:

```powershell
git log origin/main..HEAD --oneline
git diff origin/main..HEAD --stat
```

Como la rama local está 76 commits adelante del remote stale (`72fbe58`), se necesita `--force-with-lease` (más seguro que `--force`).

## Próximo paso

`sdd-archive` — cierre del ciclo. Después, **Mati debe**:

1. Ejecutar `cd apps/frontend-angular && npm install && npm run build` para resolver el blocker ambiental y actualizar la sección Build del reporte.
2. Hacer la pasada manual en navegador (5 anchos × 8 features × 4 estados) y llenar los placeholders de las secciones 3-7.
3. Commit amend con la versión final del reporte.
4. Force-push con `--force-with-lease`.
