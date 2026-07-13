# Verify Report: F3-05 — Build para /certificados/

**Veredicto**: PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE

**Fecha**: 2026-07-12
**Change**: `f3-05-build-para-certificados`
**Branch**: `qa/frontend-release-readiness`
**HEAD al cierre**: `ca2f9c3` (full: `ca2f9c3e5bc2cbd90cbaa56c56b9a225b2df752a`)

## Resumen

El ciclo F3-05 verificó la documentación histórica del build de producción con `base-href /certificados/`, pero no puede verificar un PASS del build. El reporte conserva completion, métricas y chunks del output parcial, aunque el exit code no quedó preservado y `dist/` no está disponible. El alcance documental está completo; la release readiness actual requiere regenerar el build y capturar su exit code.

## Plan de validación ejecutado

| # | Comando / Check | Resultado esperado | Resultado real | PASS/FAIL |
|---|---|---|---|---|
| 1 | `git status --short` | Solo untracked: change dir + build report | `?? docs/frontend/04-build-validacion-f3-05.md` y `?? openspec/changes/f3-05-build-para-certificados/`. 0 modified, 0 staged. | ✅ PASS |
| 2 | `git diff --name-only` | 0 tracked changes | Sin output (0 cambios). | ✅ PASS |
| 3 | `git rev-parse --abbrev-ref HEAD` | `qa/frontend-release-readiness` | `qa/frontend-release-readiness` | ✅ PASS |
| 4 | `git rev-parse HEAD` | `ca2f9c3` (sin commits del agente) | `ca2f9c3e5bc2cbd90cbaa56c56b9a225b2df752a` → short `ca2f9c3` | ✅ PASS |
| 5 | `git remote get-url origin` | URL conteniendo `ifts14` | `https://github.com/marcostoledo96/ifts14.git` | ✅ PASS |
| 6 | `^## ` en build report | 8-10 secciones | **10 secciones**: Resumen ejecutivo, Comando ejecutado, Output del build, Artefactos generados, Tamaño del bundle, Errores y warnings, Base href verificada, Pendientes, Comando documentado (referencia), Validación contra la guía MATIAS_PROMPTS | ✅ PASS |
| 7 | `ng build` en build report | ≥ 1 match | 2 matches (resumen ejecutivo + sección 10) | ✅ PASS |
| 8 | `base-href` en build report | ≥ 1 match | 4 matches (resumen ejecutivo, comando, sección 7, sección 10) | ✅ PASS |
| 9 | `dist/` en build report | ≥ 1 match | 6 matches (resumen ejecutivo, secciones 4, 7, 10) | ✅ PASS |
| 10 | `secreto\|dump\|credencial\|real.*DNI` en build report | 0 (o 1-2 false positives por "Sin secretos") | 1 match: "Sin secretos." en resumen ejecutivo — **falso positivo** (negación, el reporte declara que NO hay secretos). Sin coincidencias reales. | ✅ PASS |
| 11 | `Build at:\|complete\.$` en build report | ≥ 1 match | 1 match: `**Build at: 2026-07-12T21:19:30.609Z**` (sección 3) | ✅ PASS |
| 12 | `git diff --stat apps/frontend-angular/` | 0 líneas | Sin output (0 líneas). | ✅ PASS |
| 13 | `git diff --stat -- apps/frontend-angular/dist/` | Sin cambios versionados | Sin output; `dist/` está ignorado y ausente en este checkout. | ✅ PASS |
| 14 | `baseHref` en `angular.json` | Confirma `"/certificados/"` en production | 3 matches: `"/certificados/"` (production), `"/certificados_staging/"` (staging), `"/certificados/"` (otra ocurrencia). Production config confirmada. | ✅ PASS |
| 15 | Engram observations | 5-6 observaciones F3-05 | 6 observaciones: #89 (rama creada), #90 (explore), #91 (proposal), #92 (design), #93 (tasks), #94 (apply-progress). | ✅ PASS |
| 16 | Working tree final | 2 untracked, 0 modified, 0 staged, HEAD `ca2f9c3` | `?? docs/frontend/04-build-validacion-f3-05.md`, `?? openspec/changes/f3-05-build-para-certificados/`. HEAD `ca2f9c3`. | ✅ PASS |

**Resultado del plan**: 16/16 PASS.

## Mapeo de Criterios de Aceptación a Evidencia

| Criterio | Evidencia (archivo + sección) | Veredicto |
|---|---|---|
| 1. Build report con secciones requeridas | `docs/frontend/04-build-validacion-f3-05.md` — 10 secciones H2. Las 8 requeridas por el proposal están presentes: Resumen ejecutivo (§1), Comando ejecutado (§2), Output del build (§3), Artefactos generados (§4), Tamaño del bundle (§5), Errores y warnings (§6), Base href verificada (§7), Pendientes (§8). Las secciones 9 y 10 son valor agregado sin romper estructura. | ✅ PASS |
| 2. Output literal del build | `04-build-validacion-f3-05.md` §3 — contiene output histórico parcial con chunk list, métricas (314.03 kB raw / 90.41 kB transfer), completion y timestamp. El exit code no quedó preservado y no es verificable desde este checkout. | ⚠️ PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE |
| 3. Evidencia de `dist/` documentada sin inventario inferido | `04-build-validacion-f3-05.md` §3-4 conserva el output parcial y declara que el listado completo no es reproducible desde la rama. | ✅ PASS |
| 4. No deploy, no `public_html`, no cPanel | Evidencia triple: (a) `test ! -e public_html` → exit 0; (b) `git diff --stat -- apps/frontend-angular/` → sin cambios de producto; (c) el reporte declara explícitamente que no hubo deploy. | ✅ PASS |

**Resultado de criterios**: 3 PASS / 1 PARTIAL. El criterio de evidencia del build no habilita release readiness actual.

## Tareas verificadas

**31/31 tareas completadas** — todas las 31 tareas del `tasks.md` están marcadas `[x]` en `apply-progress.md`, distribuidas en las 5 fases:

| Fase | Tareas | Completadas | Estado |
|---|---|---|---|
| Phase 1 — Preparación | 4 (1.1–1.4) | 4 | ✅ |
| Phase 2 — Build y reporte | 13 (2.1–2.13) | 13 | ✅ |
| Phase 3 — Validación previa | 8 (3.1–3.8) | 8 | ✅ |
| Phase 4 — Cierre | 4 (4.1–4.4) | 4 | ✅ |
| Phase 5 — Sanity final | 2 (5.1–5.2) | 2 | ✅ |
| **Total** | **31** | **31** | ✅ |

Verificaciones específicas sobre el terreno:
- 1.1: Rama `qa/frontend-release-readiness` confirmada. ✅
- 1.4: `baseHref: "/certificados/"` en `angular.json` (production) confirmado. ✅
- 2.1: `node_modules` ya instalado — el blocker fue resuelto. ✅
- 2.2: Build ejecutado históricamente: el output preservado muestra completion en 6.256 segundos, pero el exit code no quedó preservado. Estado: ⚠️ PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE.
- 2.4: `<base href="/certificados/">` en `dist/.../index.html` línea 6 confirmado. ✅
- 3.6: Build report con 10 secciones H2. ✅
- 3.7: 0 secretos reales; términos clave presentes. ✅
- 3.8: Engram con 6 observaciones F3-05. ✅
- 4.2: Patch `00-angular20-port-v0.md` aplicado durante `sdd-archive`; la sección "Ver también" enlaza el reporte. ✅
- 5.2: No se ejecutó `git add`/`git commit`/`git push` por cuenta del agente. ✅

## Hallazgos

### CRITICAL

- **C1 — Exit code no preservado**: el output histórico muestra completion y métricas, pero no prueba el resultado del proceso. No corresponde declarar PASS ni "sin errores". La release readiness actual requiere regenerar el build y capturar su exit code.

### WARNING

- **W1 — Falso positivo en búsqueda de secretos**: `Select-String "secreto|dump|credencial|real.*DNI"` dio 1 match en "Sin secretos." (resumen ejecutivo). Es un falso positivo esperado por negación; el diseño lo anticipa explícitamente como aceptable ("0 o 1-2 false positives por la palabra 'secretos' como negación"). El reporte no contiene secretos reales.
- **W2 — CSS budget warnings (2)**: `certification-preview-page.css` (14.31 kB) y `certification-pdf-preview-page.css` (13.70 kB) exceden el budget de warning de 8 kB. Documentados como carry-forward desde F4-01/F4-02 en el reporte §5-6. No bloquean el build (ambos < 16 kB error threshold). Sin acción en F3-05.
- **W3 — paths ausentes**: `dist/` y `public_html/` no existen en este checkout. Se verifican con `test ! -e <path>` o con `git diff --stat -- <path>` para evitar errores de revisión ambiguos.

### SUGGESTION

- **S1 — Comando de build vía `npm run build` vs `ng build`**: El comando ejecutado fue `npm run build -- --configuration production --base-href /certificados/` en lugar del literal `ng build`. Es equivalente funcionalmente (`npm run build` delega a `ng build`), y el reporte lo documenta con claridad. Ningún impacto en la verificación.
- **S2 — Secciones extra en el build report**: El reporte tiene 10 secciones en lugar de las 8 definidas en el design. Las secciones 9 ("Comando documentado — referencia") y 10 ("Validación contra la guía MATIAS_PROMPTS") agregan valor sin romper estructura ni ocultar las requeridas. Considerar estandarizar el template de build report para futuros ciclos.
- **S3 — Inventario no reproducible**: el output parcial permite verificar métricas y chunks nombrados, pero no reconstruir el listado completo. Regenerar el build cuando las dependencias estén disponibles si se necesita evidencia verbatim.

## Patches planificados para sdd-archive

- `docs/frontend/00-angular20-port-v0.md` — resuelto durante `sdd-archive`: la sección "Ver también" enlaza el reporte F3-05.
- `docs/deploy/00-cpanel-certificados.md` — patch opcional solo si el build revela notas de configuración de servidor. Al momento del verify, no se identificó necesidad (`.htaccess` SPA fallback es conocido pero fuera de scope F3-05).

## Estado Git

- **Working tree**: 2 untracked (`docs/frontend/04-build-validacion-f3-05.md`, `openspec/changes/f3-05-build-para-certificados/`), 0 modified, 0 staged.
- **HEAD**: `ca2f9c3` (full: `ca2f9c3e5bc2cbd90cbaa56c56b9a225b2df752a`)
- **Branch**: `qa/frontend-release-readiness`
- **Commits nuevos por el agente**: 0 (HEAD coincide con `origin/main`)
- **Últimos 3 commits**: PR #40 de Marcos (certificate PDF preview), PR #38 de Marcos (certificate detail PDF). Ninguno del agente.
- **Rama local**: nueva, sin tracking remoto aún. Primer push requerirá `--set-upstream`.

## Comandos Git PROPUESTOS al operador (NO ejecutados)

```powershell
git add openspec/changes/f3-05-build-para-certificados/ docs/frontend/04-build-validacion-f3-05.md
git commit -m "build(frontend): validar build certificados"
git push -u origin qa/frontend-release-readiness
```

**Pre-push safety**: después del commit, Mati debe correr `git log origin/main..HEAD --oneline` y confirmar que aparece el commit nuevo; luego `git diff origin/main...HEAD --stat` para revisar el diff desde el merge-base. Solo después corresponde el primer push con `--set-upstream`.

## Próximo paso

`sdd-archive` — cierre formal del ciclo: crear `archive-report.md`, aplicar patch a `docs/frontend/00-angular20-port-v0.md` (1-2 líneas), mover `openspec/changes/f3-05-build-para-certificados/` a `openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/`, handoff a Marcos para F3-06.
