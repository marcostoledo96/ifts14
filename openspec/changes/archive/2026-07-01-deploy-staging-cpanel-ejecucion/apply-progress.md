# Apply Progress — deploy-staging-cpanel-ejecucion

**Change**: deploy-staging-cpanel-ejecucion
**Mode**: Standard (no Strict TDD)
**Branch**: deploy/staging-cpanel-ejecucion
**Fecha**: 2026-07-01

## Resumen

Preparación local ejecutable para staging bajo `/certificados_staging/` sin tocar cPanel ni producción. Backend, frontend, artefactos de deploy y runbook listos. Verificación local (lint PHP, test procedural, build Angular staging, scan de rutas prohibidas, git status) verde. Phase 3 (ejecución real en cPanel) queda gated para Marcos.

## Tareas completadas

### Phase 0: Human Gate — BLOCKING

- [x] 0.1 Gates confirmados por Marcos antes de apply: ruta `/certificados_staging/`, ventana cPanel todavía NO, config externa staging pendiente, DB staging ficticia, backup obligatorio, Composer/vendor fuera de Git, SMTP `stub`.

### Phase 1: Local repo prep (agente, sin cPanel)

- [x] 1.1 `normalizePath()` en `apps/backend-php/index.php`: acepta `/certificados/api`, `/certificados_staging/api`, `/index.php` con un solo router. Orden por longitud (staging primero) para evitar match de prefijo más corto.
- [x] 1.2 `apps/frontend-angular/src/environments/environment.staging.ts`: `useRealApi: true`, `apiBaseUrl: '/certificados_staging/api'`.
- [x] 1.3 `production-staging` en `apps/frontend-angular/angular.json`: `baseHref: /certificados_staging/`, `fileReplacements` a `environment.staging.ts`, budgets y outputHashing heredados de production.
- [x] 1.4 `deploy/staging/MANIFIESTO.md`: artefactos a copiar + exclusiones (`vendor/`, `.env*`, dumps, logs, `public_html/`, configs reales).
- [x] 1.5 `deploy/staging/.htaccess-root`: plantilla SPA para `/certificados_staging/`, no captura `/api/`.
- [x] 1.6 `deploy/staging/.htaccess-api`: bloqueo `src/`/`config/`, `FallbackResource` a `index.php`, `SetEnv CERTIFICADOS_CONFIG_PATH` comentado.
- [x] 1.7 `deploy/staging/CHECKLIST.md`: gates Phase 0, 2, 3 + rollback.
- [x] 1.8 `docs/deploy/01-staging-cpanel-certificados.md`: reescrito de guía futura a runbook gated con preparación local, paquete, ejecución manual, smoke y rollback.

### Phase 2: Tests & build verification (agente, local)

- [x] 2.1 `apps/backend-php/tests/NormalizePathTest.php`: test procedural vía servidor embebido PHP. Verifica `/certificados/api/health`, `/certificados_staging/api/health`, `/index.php/health` y `/health` → 200 con `status: ok`. Verifica `/no-existe` → 404. Resultado: `OK NormalizePathTest`.
- [x] 2.2 Lint PHP vía docker `ifts14-php84`: `php -l apps/backend-php/index.php` y `php -l tests/NormalizePathTest.php` → sin errores. `HttpContractTest` también pasó (regresión).
- [x] 2.3 `npm run build -- --configuration production-staging` → verde. `href="/certificados_staging/"` en `index.html` y `/certificados_staging/api` en `main-*.js` confirmados.
- [x] 2.4 Scan `deploy/staging/` con grep regex de secretos reales (`password=`, `secret=`, `api_key=`, `BEGIN PRIVATE KEY`) → 0 matches. Las menciones de `vendor/`, `public_html/`, `.env*`, `*.sql` en docs son referencias de exclusión, no artefactos prohibidos.
- [x] 2.5 `git status --short`: solo archivos previstos (PHP, Angular env, angular.json, deploy/staging/, docs, test). Sin `dist/`, `vendor/`, `public_html/`, `.env*`. `dist/` confirmado ignorado por `.gitignore`.

### Phase 3: Real cPanel execution — MANUAL, EXPLICIT-APPROVAL GATED (NO agente)

- [ ] 3.1–3.10 Pendientes: ejecución manual por Marcos. El agente no ejecuta estos pasos.

## Archivos changed

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificado | `normalizePath()` añade prefijo `/certificados_staging/api` antes de `/certificados/api` e `/index.php`. |
| `apps/frontend-angular/angular.json` | Modificado | Nueva configuración `production-staging` con `baseHref /certificados_staging/` y `fileReplacements`. |
| `apps/frontend-angular/src/environments/environment.staging.ts` | Creado | `useRealApi: true`, `apiBaseUrl: '/certificados_staging/api'`. |
| `apps/backend-php/tests/NormalizePathTest.php` | Creado | Test procedural vía servidor embebido, 4 prefijos → `/health` + 404. |
| `deploy/staging/MANIFIESTO.md` | Creado | Artefactos a copiar + exclusiones. |
| `deploy/staging/.htaccess-root` | Creado | Plantilla SPA raíz staging. |
| `deploy/staging/.htaccess-api` | Creado | Plantilla API staging con SetEnv comentado. |
| `deploy/staging/CHECKLIST.md` | Creado | Gates Phase 0/2/3 + rollback. |
| `docs/deploy/01-staging-cpanel-certificados.md` | Modificado | Reescrito: guía futura → runbook gated con preparación local ejecutable. |
| `openspec/changes/deploy-staging-cpanel-ejecucion/tasks.md` | Modificado | Tareas Phase 0/1/2 marcadas `[x]`. |

## Comandos ejecutados y resultados

| Comando | Resultado |
|---|---|
| `docker run ifts14-php84 php -l apps/backend-php/index.php` | No syntax errors |
| `docker run ifts14-php84 php -l tests/NormalizePathTest.php` | No syntax errors |
| `docker run ifts14-php84 php apps/backend-php/tests/NormalizePathTest.php` | `OK NormalizePathTest` |
| `docker run ifts14-php84 php apps/backend-php/tests/HttpContractTest.php` | `OK HttpContractTest` (regresión OK) |
| `npm run build -- --configuration production-staging` | Build complete, 253.42 kB initial, output en dist/frontend-angular |
| `grep 'href="/certificados_staging/"' dist/.../index.html` | Match confirmado |
| `grep '/certificados_staging/api' dist/.../main-*.js` | Match confirmado |
| `grep -rnE '(password=|secret=|api_key=|BEGIN PRIVATE)' deploy/staging/` | 0 matches |
| `git status --short` | Sin rutas prohibidas |

## Desviaciones del diseño

Ninguna — la implementación sigue `design.md`. Único ajuste: el orden de prefijos en `normalizePath()` pone `/certificados_staging/api` primero (por longitud) para evitar que el prefijo más corto `/certificados/api` matchee incorrectamente. Esto es consistente con el diseño ("un solo router reduce deriva") y no cambia el contrato.

## Issues encontrados

- `scripts/php-docker-lint.sh` usa `sudo docker`; en este entorno sin sudo se ejecutó `docker run` directo. Funcionalmente equivalente, el lint corrió igual.
- El test procedural inicial intentó `require_once index.php` lo que ejecuta el router top-level. Corregido: el test usa `proc_open` con servidor embebido (patrón `HttpContractTest`), sin require directo.

## Escenarios spec cubiertos

- [x] Build frontend de staging: `baseHref /certificados_staging/` y `apiBaseUrl /certificados_staging/api` verificados en build.
- [x] API compatible con staging y producción: `normalizePath()` resuelve `/certificados_staging/api/health` → `/health` (200).
- [x] Manifiesto revisable: `deploy/staging/MANIFIESTO.md` lista artefactos y exclusiones, sin credenciales.
- [x] Plantillas de servidor sin secretos: `.htaccess-root` y `.htaccess-api` usan rutas de staging, sin valores privados.
- [x] Gate previo a implementación: Phase 0 con 7 gates documentados en CHECKLIST.md.
- [x] Sin deploy automatizado: Phase 3 es manual, el agente no ejecuta cPanel/upload.
- [x] Guía documental separada: runbook reescrito distinto de `00-cpanel-certificados.md`.

## Escenarios NO cubiertos (requiren ejecución real)

- [ ] Smoke `GET /certificados_staging/api/health` en cPanel real (Phase 3.9).
- [ ] Bloqueo `src/`/`config/` en cPanel real (depende de `.htaccess-api` instalado).
- [ ] Config externa `CERTIFICADOS_CONFIG_PATH` cargando config real de staging.
- [ ] Migración + seed DB staging ficticia.

## Riesgos abiertos

- Config externa staging (`CERTIFICADOS_CONFIG_PATH`) y DB staging quedan pendientes (gates 0.c y 0.d). Hasta resolverse, Phase 3 no puede ejecutarse.
- Composer/vendor decisión operativa (gate 0.f) pendiente de confirmar en runbook.
- SMTP real solo con credenciales de prueba y aprobación explícita (gate 0.g).

## Workload / PR Boundary

- Mode: single PR
- Current work unit: 1 (Local prep + runbook + tests + scans)
- Boundary: Phase 0 (gates) + Phase 1 (local prep) + Phase 2 (verificación local). Phase 3 queda fuera del PR (manual, gated).
- Estimated review budget impact: 220–320 líneas confirmado, 800-budget Low.

## Status

13/16 tareas completas (Phase 0 confirmada por humano, Phase 1 y Phase 2 por agente). Phase 3 (3.1–3.10) es manual gated para Marcos. **Ready for verify**.