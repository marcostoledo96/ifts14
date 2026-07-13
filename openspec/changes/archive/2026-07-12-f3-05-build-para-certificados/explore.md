# Exploración — F3-05 Build para `/certificados/`

**Change**: `f3-05-build-para-certificados`
**Tipo**: exploration (planning, no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-12
**Almacén de artefactos**: OpenSpec + Engram (hybrid, `capture_prompt: false` en Engram)
**Rama actual**: `qa/frontend-release-readiness` (HEAD `ca2f9c3`, mismo que `origin/main`)
**Rama objetivo sugerida**: continuar sobre `qa/frontend-release-readiness` (la propia guía unificada lo permite para Mati cuando coordina el cierre de Fase 3)
**Referencia normativa**: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1234-1274

## Resumen ejecutivo

F3-05 es el **quinto y último ciclo operativo de Fase 3** y consiste en verificar que el build de producción de la app Angular 20 cierra con la `--base-href /certificados/` que requiere cPanel, **sin desplegar nada al servidor**. El entregable es un reporte técnico en `docs/frontend/` que documenta el comando ejecutado, la salida literal de `ng build`, los artefactos generados en `dist/`, el tamaño del bundle, los warnings y, sobre todo, **el estado del bloqueador conocido** (`node_modules` no instalado en el árbol de trabajo actual). La propuesta también debe confirmar que la configuración `production` de `angular.json` ya tiene `baseHref: "/certificados/"` (hallazgo de esta exploración: **sí está en línea 41**), de modo que el flag CLI sólo actúa como belt-and-suspenders. Es un ciclo estrictamente documental: no introduce código de producto, no toca `public_html` ni cPanel, no versiona artefactos de `dist/`, no produce delta en `openspec/specs/`.

## Quick path

1. Confirmar con Mati que la rama `qa/frontend-release-readiness` (recién cortada desde `ca2f9c3`) es la base de trabajo. La guía admite esta rama para Mati; en la misma guía también se ofrece `frontend/api-readiness` como alternativa de Marcos. Recomendación: continuar sobre `qa/frontend-release-readiness` para no fragmentar la rama de release.
2. Ejecutar `npm install` en `apps/frontend-angular/` para destrabar el build (acción habilitada como verificación de read-only).
3. Correr `ng build --configuration production --base-href /certificados/` y capturar la salida literal (no resumir astdout según AGENTS.md).
4. Documentar artefactos generados en `dist/frontend-angular/browser/` y tamaños.
5. Parchar `docs/frontend/00-angular20-port-v0.md` con el comando real verificado (sección "Build para cPanel" ya existe, líneas 105-113, sólo falta confirmar el output real).
6. Cerrar el ciclo con `sdd-archive` y enlazar el reporte desde el port-v0.

## Estado actual

### Rama de trabajo

| Ítem | Estado | Evidencia |
|---|---|---|
| HEAD local | `ca2f9c3` (Merge PR #40 de Marcos — certificate-pdf-preview) | `git rev-parse HEAD` |
| Working tree | Limpio (sin cambios uncommitted/tracked) | `git status --short` vacío |
| Tracking remoto | Rama `qa/frontend-release-readiness` ya pusheada a `origin` con mismo HEAD | (declarado por Mati en el prompt raíz) |
| `main` | `ca2f9c3` (idéntico) | `git log -1 main --oneline` |
| F3-04 work | **No está en este árbol**. Commit `70008f0 test(frontend): documentar qa manual completo` vive sólo en `frontend/v0-design-system` y nunca se mergeó a `main`. | `git branch --contains 70008f0` ⇒ `frontend/v0-design-system` |
| `docs/frontend/03-qa-manual-f3-04.md` | **No existe** en este árbol (Mati asume que sí; descubrir esto es un risk del ciclo) | `Test-Path` ⇒ `False` |
| `openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/` | **No existe** en este árbol | `Get-ChildItem archive | Where f3-04` ⇒ vacío |
| `openspec/changes/f3-05-build-para-certificados/` | No existe aún (a crear en este explore) | confirmado |
| `node_modules` en `apps/frontend-angular/` | **No instalado** — bloqueador de build, idéntico al hallazgo de F3-04 (Engram #86) | `Test-Path node_modules` ⇒ `False` |
| `package-lock.json` | Sí existe → `npm ci` es la opción reproducible | `Test-Path` ⇒ `True` |
| `dist/` | No existe (no versionado, esperado) | `Test-Path` ⇒ `False` |

### Configuración del build (hallazgo crítico)

`apps/frontend-angular/angular.json` ya tiene `baseHref` correcta en `production` y `development`:

| Configuración | `baseHref` | `outputPath.base` | `outputHashing` | Notas |
|---|---|---|---|---|
| `production` (default) | **`/certificados/`** (línea 41) | `dist/frontend-angular` (línea 22) | `all` | `browser: ""` → salida plana lista para cPanel. Budgets: 500 kB warn / 1 MB error (initial), 8 kB warn / 16 kB error (anyComponentStyle). |
| `production-staging` | `/certificados_staging/` (línea 57) | mismo | `all` | `fileReplacements` → `environment.staging.ts` |
| `development` | `/certificados/` (línea 79) | mismo | n/a | `optimization: false`, `sourceMap: true`, `fileReplacements` → `environment.development.ts` |
| `defaultConfiguration` | `production` (línea 91) | — | — | `ng build` sin flags ya iría a `/certificados/` |

**Implicación**: el flag `--base-href /certificados/` que pide la guía en línea 1244 es **redundante** con la config (mismo valor), pero debe seguir pasándose según la guía. El reporte F3-05 debe documentar que se ejecutó con flag y que el flag coincidió con la config (belt-and-suspenders), no que el flag la sobreescribió.

`apps/frontend-angular/package.json`:

- Angular 20.3.0 runtime (`@angular/core`, `common`, `compiler`, `forms`, `platform-browser`, `router`).
- `@angular/build` y `@angular/cli` 20.3.30 (builder `application`, no el viejo webpack).
- Scripts: `npm run build` ejecuta `ng build`; `npm run test:ci` ejecuta Karma headless con el guard `no-focused-tests.mjs`.

`apps/frontend-angular/AGENTS.md`: 18 líneas, regla única relevante: "ejecutar build y tests disponibles antes de cerrar el ciclo". El build de F3-05 es **exactamente** esta regla operativa.

### Documentación existente que cubre el tema build

| Archivo | Contenido relevante para F3-05 |
|---|---|
| `docs/frontend/00-angular20-port-v0.md` | Sección "Build para cPanel" (líneas 105-113) lista el comando **esperado** `ng build --configuration production --base-href /certificados/` pero **no verifica** que pase. Estado F2-04 reporta build verde 306.01 kB; Estado F2-05 reporta 310.43 kB; Estado F2-06 reporta 313.84 kB; Estado F3-06 final reporta 253.46 kB (página pública, no admin); M3-06 final reporta 253.46 kB también. **Ningún ciclo anterior documentó el build de la app COMPLETA actual (F4-01 + F4-02 + admin completo)**: F3-05 cierra ese hueco. |
| `docs/frontend/00-angular20-port-v0.md` Estado F4-01 | Menciona budget `anyComponentStyle` ajustado a 8 kB warn / 16 kB error (línea 249) — referencia para reportar warnings de CSS en F3-05. |
| `docs/frontend/00-angular20-port-v0.md` Checkpoint M3-06 final | Tabla "Comandos Angular reproducibles" (líneas 360-368) ya tiene `npm run build` y `npm test --watch=false --browsers=ChromeHeadless` como referencia. |
| `docs/deploy/00-cpanel-certificados.md` | Existe. La guía lo lista en el prompt exacto de F3-05 (línea 1251). **Sin abrir aún**; candidato a parchar si F3-05 detecta algo relativo a `.htaccess` o rutas del servidor. |
| `deploy/AGENTS.md` | 17 líneas: regla clave: "Angular debe compilar con base href `/certificados/`" (línea 10) y "No tocar `public_html` sin backup previo" (línea 11). F3-05 no toca deploy real. |
| `apps/frontend-angular/src/environments/` | Tres archivos: `environment.ts`, `environment.development.ts`, `environment.staging.ts`. El reporte debe mencionar que `production` usa `environment.ts` sin `fileReplacements` (vs staging/dev que sí los tienen). |

### Precedente de ciclo documentation-only en el repo

**F3-04 (QA manual completo)** — precedente directo, mismo carácter documental, mismo `defaultConfiguration: production`. Commit `70008f0` (en `frontend/v0-design-system`, no mergeado) reporta 1010 inserciones distribuidas en 7 artefactos. El archive tiene 7 archivos:

1. `explore.md` (221 líneas)
2. `proposal.md` (104 líneas)
3. `design.md` (88 líneas)
4. `tasks.md` (70 líneas)
5. `apply-progress.md` (134 líneas)
6. `verify-report.md` (127 líneas)
7. `archive-report.md` (137 líneas)

**Estructura recomendada para F3-05**: idéntica a F3-04, sin `specs/` ni `spec.md` (no hay delta de spec — la base spec implícitamente cubre build verification bajo "Política frontend, pruebas y QA").

**F4-01 (Certificate detail)** — segundo precedente (también documentation-only con código de producto limitado a `apps/frontend-angular/`). Su `exploration.md` (185 líneas) está disponible en `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/exploration.md` y es un buen patrón de tabla "Estado actual / Áreas afectadas / Contratos backend archivados".

## Áreas afectadas

| Archivo / spec | Rol en F3-05 |
|---|---|
| `apps/frontend-angular/angular.json` | **Sólo lectura**. Confirmar `baseHref: /certificados/` en production (línea 41) y `outputPath.base: dist/frontend-angular` (línea 22). No se modifica. |
| `apps/frontend-angular/package.json` | **Sólo lectura**. Confirmar versión de Angular 20.3.0 y `@angular/build` 20.3.30. No se modifica. |
| `apps/frontend-angular/node_modules/` | **Crear (read-only verification)**. `npm install` o `npm ci` es la acción habilitadora del build, no se versiona. |
| `apps/frontend-angular/dist/` | **Generar y revisar (read-only verification)**. Salida del build, no se commitea. |
| `docs/frontend/04-build-validacion-f3-05.md` (propuesto) | **NUEVO**. Reporte de verificación del build. |
| `docs/frontend/00-angular20-port-v0.md` | **Patch menor**. Agregar una línea de referencia al reporte F3-05 en la sección "Ver también" (parche similar al de F3-04, ~4 líneas). No reescribir la sección "Build para cPanel". |
| `openspec/changes/f3-05-build-para-certificados/` | **NUEVO** (este change). 7 artefactos estándar sin `spec.md`. |
| `openspec/specs/` | **No se toca** (no hay spec delta). |
| `apps/frontend-angular/src/**` | **No se toca** (ciclo de read-only verification). |
| `public_html`, cPanel, deploy real | **No se tocan** (prohibido por la guía líneas 1253, 1272-1274 y por `deploy/AGENTS.md:11`). |

## Delta necesario

### Contenido nuevo

1. **`docs/frontend/04-build-validacion-f3-05.md`** (NUEVO, ~200-300 líneas) con secciones:
   - **Resumen ejecutivo** — qué se verificó, conclusión (verde / bloqueo verificable).
   - **Comando ejecutado** — verbatim de `cd apps/frontend-angular && ng build --configuration production --base-href /certificados/`.
   - **Output del build** — salida literal completa de `ng build` (sin resumirla, per AGENTS.md: "no pegar salidas largas de terminal sin resumen operativo; usar RTK o compresión equivalente cuando corresponda" → usar tabla resumen + bloque verbatim de las métricas finales).
   - **Artefactos generados** — `ls -la dist/frontend-angular/browser/` con tamaños legibles.
   - **Tamaño del bundle** — tabla de `initial` (raw + transfer) y chunks lazy, comparada con F2-04/F2-05/F2-06 si la tendencia es estable.
   - **Errores y warnings** — lista de cada warning (con severidad, archivo y budget si aplica) o "ninguno" si pasa limpio.
   - **Base href verificada** — confirmar que el `index.html` de `dist/` contiene `<base href="/certificados/">`.
   - **Rutas internas / configuración de servidor** — análisis de qué rutas necesita `.htaccess` rewrite (e.g. rutas admin que no son reales en cPanel: `/admin/login` directo funciona porque Angular maneja fallback con `useHash: false` + index.html, pero cPanel necesita `FallbackResource` o `RewriteRule` para SPA — esto se documenta como **pendiente de ciclo F4-04+** o deploy).
   - **Bloqueadores** — `node_modules` no instalado → `npm ci` o `npm install`; si build falla por otras causas, registrar causa probable y próximo paso.
   - **Pendientes** — todo lo que NO se hizo y queda para F3-06 (handoff final) o deploy real.

2. **Patch a `docs/frontend/00-angular20-port-v0.md`** (~4 líneas) — agregar entrada en `## Ver también` (o crear esa sección si no existe) con enlace al nuevo reporte `04-build-validacion-f3-05.md`. No tocar la sección "Build para cPanel" (líneas 105-113), que ya tiene el comando correcto.

### Artefactos OpenSpec (esperados, no se crean en esta fase)

| Artefacto | Tamaño esperado | Notas |
|---|---|---|
| `explore.md` | ~280 líneas | Este archivo. |
| `proposal.md` | ~110 líneas | Patrón F3-04: 9 criterios de aceptación hard + 1 acceptance summary + out-of-scope. F3-05 tendría criterios como: (1) `ng build` pasa o queda bloqueo verificable; (2) no se tocó `public_html`; (3) no se versionan artefactos pesados; (4) `baseHref /certificados/` confirmada; (5) configuración de servidor documentada si aplica; (6) errores con causa probable y próximo paso. |
| `design.md` | ~80 líneas | Plan de validación: comando, verificaciones, formato de reporte, fallback si `node_modules` falta. |
| `tasks.md` | ~70 líneas | 5 fases: setup (instalar deps), build (ejecutar y capturar), análisis (artefactos + warnings), documentación (reporte + patch), verify + archive. |
| `apply-progress.md` | ~130 líneas | Log de ejecución con timestamps. |
| `verify-report.md` | ~120 líneas | 18 checks F3-04-style, veredicto PASS WITH WARNINGS (esperable: warnings de budget CSS en `certification-pdf-preview-page.css` 12,41 kB y `certification-preview-page.css` 14,31 kB — ya conocidos desde F4-02). |
| `archive-report.md` | ~140 líneas | Resumen + handoff a F3-06. |

**Forecast total**: ~930 líneas tracked, ~10 archivos tocados (7 en `openspec/changes/`, 1 doc nuevo, 1 doc patched, 1 sección nueva en port-v0). Bien por debajo de budget 4000.

## Forecast de carga de revisión

- **Líneas estimadas modificadas**: ~250 tracked + report nuevo de ~200 líneas = **~450 líneas totales** (diferencia con F3-04: 1010 inserciones, pero F3-04 también produjo el reporte de QA manual largo; F3-05 produce un reporte de build más compacto).
- **Riesgo de budget 4000**: **Bajo**. F3-05 está al ~11% del budget. No requiere `size:exception`.
- **PRs encadenados recomendados**: **No**. Single PR sobre `qa/frontend-release-readiness`.
- **Estrategia de chain**: no aplica.
- **Decisión necesaria antes de apply**: **No** (el plan es claro y la base es estable). La única decisión es si ejecutar el build con Mati presente o delegar a OpenCode (Mati prefiere que OpenCode ejecute el build como read-only verification, con la salida reportada verbatim en el reporte).
- **Comando Git propuesto** (NO ejecutar en esta fase; lo ejecutará el sub-agente `sdd-apply` con aprobación explícita de Mati y diff-confirmation gate):
  ```powershell
  git status --short
  git add docs/frontend/04-build-validacion-f3-05.md docs/frontend/00-angular20-port-v0.md openspec/changes/f3-05-build-para-certificados/
  git commit -m "test(frontend): documentar build de produccion para /certificados/"
  # Push: primer push ya hecho (rama tracked). Si no, --set-upstream origin qa/frontend-release-readiness
  ```

## Riesgos

1. **CRÍTICO — `node_modules` no instalado en `apps/frontend-angular/`** (confirmado en este turno, idéntico al hallazgo de F3-04 en Engram #86). El build no puede ejecutarse sin `npm install` o `npm ci`. **Acción habilitadora**: `cd apps/frontend-angular && npm install` (preferentemente `npm ci` por reproducibilidad, dado que `package-lock.json` está commiteado). Esta acción es read-only verification y no requiere aprobación Git (no toca tracked files ni crea commits). Documentar en el reporte si el build pasa o queda en bloqueo verificable.

2. **MEDIO — Discrepancia con la premisa de Mati sobre F3-04**: Mati asume que `docs/frontend/03-qa-manual-f3-04.md` y el archive F3-04 están en el working tree de `qa/frontend-release-readiness`. **No lo están**: el commit `70008f0 test(frontend): documentar qa manual completo` sólo vive en `frontend/v0-design-system` y nunca se mergeó a `main`. `qa/frontend-release-readiness` está limpio desde `ca2f9c3`. **F3-05 puede ejecutarse sin F3-04** (la pasada de QA manual y la verificación de build son ortogonales), pero la guía de Mati lista F3-04 como ciclo previo. Decisión sugerida: continuar con F3-05 sobre el árbol actual y documentar en el reporte que la rama no contiene el deliverable de F3-04. Si Mati quiere que el reporte F3-04 esté en la misma rama, requerirá cherry-pick de `70008f0` o merge de `frontend/v0-design-system` — fuera del scope F3-05.

3. **BAJO — Flag `--base-href /certificados/` es redundante con la config**: `angular.json:41` ya define el mismo valor para `production`. La guía pide pasar el flag (línea 1244); el reporte debe aclarar que el flag coincidió con la config, no que la sobreescribió. No es un riesgo técnico, es un riesgo de comunicación.

4. **BAJO — Warnings de budget CSS esperados**: F4-01 y F4-02 ya documentaron warnings de `anyComponentStyle` (12,41 kB y 14,31 kB) que quedan bajo el límite de error 16 kB. F3-05 los reportará como carry-forward. No bloquea.

5. **BAJO — `dist/` no se versiona**: AGENTS.md y la propia guía lo indican. La acción de OpenCode es inspeccionar `dist/` durante la verificación, pero no `git add` esa carpeta. Verificar que el reporte no mencione commits sobre `dist/`.

6. **BAJO — Auto-commit/push trap**: per AGENTS.md del repo raíz, `git add` + `git commit` + `git push` requieren aprobación explícita de Mati en el mismo turno, con diff-confirmation gate. El sub-agente `sdd-apply` (futuro) lo manejará; este explore no toca Git.

7. **BAJO — Rama `qa/frontend-release-readiness` nueva y tracked**: el primer push ya fue hecho (declarado por Mati), por lo que `git push` subsecuente no necesita `--set-upstream`. Si por algún motivo no se hubiera pusheado, el primer push requerirá `-u origin qa/frontend-release-readiness`. Verificar antes del push.

8. **BAJO — `docs/deploy/00-cpanel-certificados.md` puede requerir patch mínimo**: la guía (línea 1251) menciona este archivo como lectura. Si F3-05 detecta que el reporte debe referenciar configuración de servidor (e.g. `.htaccess` para SPA fallback), un patch a `docs/deploy/` es válido, pero debe quedar como tarea opcional en `tasks.md` y NO exceder el scope "build verification, sin deploy". Mantener el principio: si se toca `docs/deploy/`, es sólo documentación, no scripts de deploy.

9. **BAJO — Bug histórico de Windows en `scripts/no-focused-tests.mjs`**: F3-04 archivó este bug (path `/C:/...` mal interpretado por Node). Si F3-05 corre `npm test:ci`, podría tropezar. Mitigación: F3-05 sólo requiere `ng build`; los tests no son parte del scope. Si Mati pide ejecutar tests para evidencia, el sub-agente `sdd-apply` debe usar `node --use-strict` o `fileURLToPath(new URL(...))` como workaround documentado.

## Decisión recomendada

**Proceder con `sdd-propose`**.

El ciclo F3-05 tiene:
- Scope claro y acotado (verificación de build, no implementación).
- Hallazgo crítico favorable: la config ya tiene `baseHref /certificados/`.
- Bloqueador conocido y habilitado (`npm ci` resuelve `node_modules`).
- Precedente estructural directo en F3-04 (7 artefactos, sin spec delta).
- Riesgo de revisión bajo (~450 líneas estimadas, ~11% del budget 4000).
- Cero modificaciones a código de producto o specs.

Único punto que Mati debe confirmar al inicio de la fase `propose`:
- ¿Trabajar sobre `qa/frontend-release-readiness` (recomendado) o crear una rama nueva (e.g. `qa/f3-05-build-para-certificados`)? La guía lo deja a criterio de Mati.

## Siguiente fase recomendada

`sdd-propose` — crear `openspec/changes/f3-05-build-para-certificados/proposal.md` siguiendo el patrón F3-04 (104 líneas) con 9 criterios de aceptación, lista de deliverables y out-of-scope explícito (deploy, cPanel, public_html, dependencias nuevas, código de producto).

## Listo para propuesta

**Sí**, con la salvedad del punto 2 en Riesgos: la rama actual no contiene el deliverable de F3-04. Si Mati confirma que esto es aceptable, se puede proceder.
