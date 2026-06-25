# Verify report — backend-base-php-certificados

## Change

| Campo | Valor |
|---|---|
| Cambio | `backend-base-php-certificados` |
| Ciclo | M2-02 — base PHP segura |
| Modo | SDD verify estándar; TDD estricto no declarado activo |
| Fecha | 2026-06-25 |
| Commit verificado | `65d3fc7` (`feat(backend): agregar base php segura para certificados`) |
| Veredicto | **PASS** |

## Resumen ejecutivo

La implementación M2-02 bajo `apps/backend-php/` queda verificada en su totalidad. Docker runtime de `ifts14-php84:latest` (PHP 8.4.22) ejecuta `php -l` sin errores en los cinco PHP del backend base, confirma módulos requeridos (`pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`) y arranca el servidor embebido con `sudo docker run` (sin Docker Compose). El smoke HTTP local sobre `127.0.0.1:8080` cubre `GET /health` (200 JSON `data.status: ok`, `data.service: certificados-api`), `POST /health` (405 con `Allow: GET`) y `GET /no-existe` (404 seguro). Los logs del contenedor no muestran errores fatales y el contenedor se detiene con `sudo docker stop ifts14-php84-smoke`. El smoke cPanel real contra `/certificados_qa/` (archivado como `2026-06-25-certificados-qa-smoke-cpanel`) apoya pero no reemplaza la QA local; ambos coinciden en comportamiento y envelope.

No se detectan credenciales reales, `.env`, archivos reales `config.php`/`db.php`/`database.php`/`conexion.php` ni dependencias externas (no hay `composer.json` ni `vendor/`). `index.php` no carga `Config`, `Database` ni PDO durante `/health`. Las exclusiones de alcance se respetan: no se implementa Angular, no se define el endpoint de validación pública, no se ejecuta conexión real a MariaDB.

## Artifacts read

| Artefacto | Estado |
|---|---|
| `openspec/changes/backend-base-php-certificados/specs/backend-base-php-certificados/spec.md` | Leído |
| `openspec/changes/backend-base-php-certificados/design.md` | Leído |
| `openspec/changes/backend-base-php-certificados/tasks.md` | Leído y actualizado con 4.2–4.7 |
| `openspec/changes/backend-base-php-certificados/apply-progress.md` | Leído |
| `openspec/changes/backend-base-php-certificados/exploration.md` | Leído |
| `openspec/changes/backend-base-php-certificados/proposal.md` | Leído |
| `apps/backend-php/` (índice, `index.php`, `src/`, `config/`, `.htaccess`, `README.md`) | Inspeccionado |
| `scripts/php-docker-build.sh`, `php-docker-version.sh`, `php-docker-modules-check.sh`, `php-docker-lint.sh` | Leídos (referencia de runtime) |
| `docker/php84/Dockerfile` | Leído (referencia de runtime) |
| `docs/backend/00-php84-api.md` | Leído |
| `openspec/changes/archive/2026-06-25-php84-docker-runtime/verify-report.md` | Leído como apoyo |
| `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/verify-report.md` | Leído como apoyo |
| `HEAD` | Verificado en `65d3fc7` |

## Completeness

| Área | Resultado | Evidencia |
|---|---|---|
| Estructura base | PASS | `index.php`, `src/Response.php`, `src/Config.php`, `src/Database.php`, `config/certificados-config.example.php`, `.htaccess`, `README.md`. |
| Health endpoint | PASS | `GET /health` 200 JSON `data.status: ok`, `data.service: certificados-api`. |
| 405 método no permitido | PASS | `POST /health` 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`. |
| 404 seguro | PASS | `GET /no-existe` 404 con `error.code: NOT_FOUND` y `Content-Type: application/json; charset=utf-8`. |
| Config externa | PASS | `Config::load()` usa `CERTIFICADOS_CONFIG_PATH` o ruta externa documentada y falla con `RuntimeException` sin imprimir ruta ni secreto. |
| PDO lazy | PASS | `Database::pdo()` crea PDO sólo al llamarse; opciones seguras presentes. `index.php` no la invoca en `/health`. |
| Exclusiones de alcance | PASS | No hay Angular, endpoint de validación pública, `.env`, Composer/vendor ni conexión real ejecutada en bootstrap. |
| QA PHP sintaxis | PASS | `php -l` limpio en los cinco PHP vía `bash scripts/php-docker-lint.sh` (PHP 8.4.22). |
| QA PHP módulos | PASS | `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml` disponibles. |
| Smoke HTTP local | PASS | `GET /health`, `POST /health`, `GET /no-existe` ejecutados dentro de `ifts14-php84-smoke`. |
| Docker Compose | NO USADO | Local runtime se ejecutó únicamente con `sudo docker build` y `sudo docker run`. |
| Tareas | PASS | `tasks.md` con 4.1–4.7 marcadas `[x]` tras reconciliación documentada. |

## Build / tests / coverage evidence

### Docker runtime — usado y no Compose

| Comando | Resultado |
|---|---|
| `bash scripts/php-docker-build.sh` | PASS; imagen `ifts14-php84:latest` creada desde `php:8.4-cli` (warning de legacy builder no bloqueante). |
| `bash scripts/php-docker-version.sh` | PASS; `PHP 8.4.22 (cli)`. |
| `bash scripts/php-docker-modules-check.sh` | PASS; módulos requeridos OK: `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `bash scripts/php-docker-lint.sh` | PASS; sin errores de sintaxis en los cinco PHP del backend base. |

Docker Compose **no se usó** ni se requiere: el ciclo se ejecutó exclusivamente con `sudo docker build` y `sudo docker run`. La regla operativa del proyecto es "no usar Docker Compose" y este cambio la respeta sin matices.

### Servidor embebido local dentro de `ifts14-php84`

Marcos ejecutó el siguiente comando único (sin Docker Compose) para iniciar el servidor embebido:

```bash
sudo docker run -d --rm \
  --name ifts14-php84-smoke \
  -p 8080:8080 \
  -v "$PWD/apps/backend-php":/app \
  -w /app \
  -e CERTIFICADOS_CONFIG_PATH=/app/config/certificados-config.example.php \
  ifts14-php84 \
  php -S 0.0.0.0:8080 -t /app /app/index.php
```

Logs iniciales del contenedor:

```txt
PHP 8.4.22 Development Server (http://0.0.0.0:8080) started
```

### Smoke HTTP local

| Caso | Resultado |
|---|---|
| `GET http://127.0.0.1:8080/health` | PASS. HTTP 200 OK. `Content-Type: application/json; charset=utf-8`. JSON con `data.status: ok`, `data.service: certificados-api`. |
| `POST http://127.0.0.1:8080/health` | PASS. HTTP 405 Method Not Allowed. `Allow: GET`. `Content-Type: application/json; charset=utf-8`. JSON con `error.code: METHOD_NOT_ALLOWED`, `error.message: Método no permitido.` |
| `GET http://127.0.0.1:8080/no-existe` | PASS. HTTP 404 Not Found. `Content-Type: application/json; charset=utf-8`. JSON con `error.code: NOT_FOUND`, `error.message: Recurso no encontrado.` |

Logs del contenedor durante el smoke (sin errores fatales):

```txt
[fecha hora] PHP 8.4.22 Development Server (http://0.0.0.0:8080) started
[fecha hora] [127.0.0.1:XXXXX]: accepted
[fecha hora] [127.0.0.1:XXXXX]: closing
… (repetido por cada request)
```

Cierre limpio:

```bash
sudo docker stop ifts14-php84-smoke
```

El smoke HTTP real contra `https://ifts14.com.ar/certificados_qa/` (archivado en `2026-06-25-certificados-qa-smoke-cpanel`) reproduce el mismo contrato JSON y confirma que la copia/adaptación del backend para QA en cPanel también responde 200/405/404 con el mismo envelope.

### PHP nativo

`php` no está instalado en la sesión actual de OpenCode. Para sintaxis, módulos y smoke HTTP se acepta la evidencia runtime Docker de Marcos (PHP 8.4.22 dentro de `ifts14-php84:latest`).

### `git status --ignored --short`

Resultado registrado en este verify (pre-archive):

```txt
 M .atl/skill-registry.md
 M .gitignore
 M openspec/changes/backend-base-php-certificados/tasks.md
 M openspec/changes/backend-base-php-certificados/verify-report.md
?? muestra_pagina/revision_y_parches_prompts_stitch_v0_ifts14.md
!! .atl/.skill-registry.cache.json
!! material_privado_no_versionar/
```

Notas:

- `material_privado_no_versionar/` figura sólo como ignorado; no fue leído.
- `tasks.md` aparece modificado por la reconciliación de 4.2–4.7 documentada al final de este reporte.
- `verify-report.md` aparece modificado por esta actualización a PASS.
- Hay cambios no relacionados al ciclo: `.atl/skill-registry.md`, `.gitignore` y `muestra_pagina/...`. No fueron tocados por este verify.
- No se detectan archivos reales prohibidos bajo `apps/backend-php/`: `config.php`, `db.php`, `database.php`, `conexion.php`, `.env` ni `composer.json`.

## Spec compliance matrix

| Requirement / scenario | Estado | Evidencia |
|---|---|---|
| Configuración externa disponible | PASS | `Config.php` cargada por inspección; ejemplo ficticio versionado sin credenciales. |
| Configuración ausente | PASS | `Config::load()` lanza `RuntimeException` controlada; el smoke real sólo probó `/health` que no requiere config. |
| Conexión diferida en `GET /health` | PASS | `index.php` sólo requiere `Response.php`; `GET /health` real no abrió PDO. |
| Uso futuro de datos con PDO seguro | PASS | `Database.php` usa DSN `mysql`, `utf8mb4`, `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES=false`; `pdo_mysql` confirmado en el runtime. |
| Respuesta exitosa JSON `data/meta` | PASS | `GET /health` 200 con `data` y `meta`; `Content-Type: application/json; charset=utf-8`. |
| Error inesperado seguro | PASS | `set_exception_handler()` responde `INTERNAL_ERROR` sin detalle; no se disparó durante el smoke. |
| Health exitoso | PASS | `GET /health` 200 con `data.status: ok`, `data.service: certificados-api`. |
| Método no permitido en `/health` | PASS | `POST /health` 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`. |
| Endpoint de validación excluido | PASS | No hay rutas `certificados/{token}/verificacion` ni `consulta` bajo `apps/backend-php/`. |
| QA mínimo verificable | PASS | `php -l`, `php -m`, `git status` ejecutados vía Docker PHP 8.4.22; HTTP smoke local PASS. |

## Correctness checks

| Check solicitado | Resultado | Detalle |
|---|---|---|
| Structure/files exist | PASS | Estructura esperada presente bajo `apps/backend-php/`. |
| No Angular | PASS | No hay archivos Angular ni referencias funcionales. |
| No validation endpoint | PASS | No se detectan rutas de verificación pública ni consulta. |
| No real DB connection | PASS | Conexión encapsulada en `Database::pdo()`; no se ejecuta en bootstrap ni `/health`. |
| No `.env` | PASS | No existe `.env` bajo `apps/backend-php/`. |
| No real credentials | PASS | Sólo existe `clave_demo_no_real` en el ejemplo. |
| `/health` no llama Config/Database/PDO | PASS | `index.php` sólo hace `require_once __DIR__ . '/src/Response.php'`. |
| Headers `application/json; charset=utf-8` | PASS | Confirmado en `GET /health` (200), `POST /health` (405) y `GET /no-existe` (404). |
| `Allow: GET` en 405 | PASS | Header presente en la respuesta a `POST /health`. |
| Sin Docker Compose | PASS | Runtime local ejecutado únicamente con `sudo docker build` y `sudo docker run`. |

## Design coherence

| Decisión de diseño | Estado | Evidencia |
|---|---|---|
| `index.php` + helpers mínimos | PASS | Implementado sin framework ni dependencias. |
| Sólo `.htaccess` local del backend | PASS | `deploy/.htaccess` y `deploy/htaccess/*` no modificados. |
| Config externa no versionada | PASS | Ejemplo versionado ficticio; carga real fuera del repo. |
| Health sin config ni PDO | PASS | Bootstrap de `index.php` no carga config ni DB; confirmado por HTTP real. |
| No agregar dependencias | PASS | No hay `composer.json` ni `vendor/`. |
| Runtime local con `sudo docker` | PASS | Documentado y ejecutado; sin Docker Compose. |

## Supporting evidence: real cPanel smoke on `/certificados_qa/`

Evidencia relacionada leída desde `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/verify-report.md` y `docs/deploy/00-cpanel-certificados.md`:

| Caso | Resultado |
|---|---|
| `GET /certificados_qa/` | PASS, 200 `text/html`. |
| `GET /certificados_qa/validar/ABC123` | PASS, 200 fallback. |
| `GET /certificados_qa/api/health` | PASS, 200 JSON con `status: ok` y `service: certificados-api`. |
| `GET /certificados_qa/api/no-existe` | PASS, 404 JSON controlado. |
| `GET /certificados_qa/api/src/Response.php` | PASS, 403 sin exponer fuente. |
| `GET /certificados_qa/api/config/certificados-config.example.php` | PASS, 403 sin exponer config. |
| `POST /certificados_qa/api/health` | PASS, 405 JSON y header `Allow: GET`. |

La copia/adaptación en `/certificados_qa/` reproduce el mismo comportamiento que la QA local de `apps/backend-php/`. El smoke cPanel no reemplaza la QA local; ambos son evidencia compatible.

## Issues

### CRITICAL

Ninguno.

### WARNING

1. El smoke cPanel real es evidencia útil pero pertenece a una copia/adaptación en `/certificados_qa/`, no al árbol local `apps/backend-php/`. Queda como apoyo, no como sustituto.
2. `git status --ignored --short` muestra cambios no relacionados al ciclo (`.atl/skill-registry.md`, `.gitignore`, `muestra_pagina/...`). No fueron tocados en este verify y deben mantenerse fuera del cierre de M2-02 salvo decisión explícita.
3. El PHP nativo sigue no disponible en la sesión; para lint/módulos/HTTP se acepta la evidencia runtime Docker PHP 8.4.22.

### SUGGESTION

1. En un ciclo futuro, considerar un test runner automatizado (PHPUnit/Pest) que reemplace el smoke manual por tests formales; el alcance de M2-02 no lo exige.
2. Si el warning de Docker legacy builder pasa a ser bloqueante, migrar `scripts/php-docker-build.sh` a BuildKit/buildx en un ciclo chico.

## Reconciliación excepcional de tareas 4.2–4.7

`sdd-archive` exige que `tasks.md` no tenga tareas de implementación sin marcar al cerrar el ciclo. En el follow-up de verify, las tareas 4.2 (`php -l`), 4.3 (`php -m`), 4.4 (`GET /health`), 4.5 (`POST /health`) y las dos extensiones 4.6 (`GET /no-existe`) y 4.7 (logs y cierre) quedaron marcadas `[x]` con la evidencia runtime provista por Marcos, antes del movimiento del cambio a `archive/`. Esta reconciliación está respaldada por:

- `bash scripts/php-docker-lint.sh` ejecutada dentro de `ifts14-php84:latest` (PHP 8.4.22).
- `bash scripts/php-docker-modules-check.sh` ejecutada dentro de `ifts14-php84:latest`.
- `sudo docker run` con `php -S 0.0.0.0:8080 -t /app /app/index.php` y los tres `curl` reales (`GET /health`, `POST /health`, `GET /no-existe`).
- Logs del contenedor sin errores fatales y `sudo docker stop ifts14-php84-smoke` exitoso.

El `sdd-archive` registra esta misma razón.

## Final verdict

**PASS**. M2-02 queda verificado: estructura mínima, configuración externa, PDO lazy, helper JSON, health, 405, 404, exclusión del endpoint de validación, lint PHP, módulos requeridos, smoke HTTP local real y ausencia de secretos/datos sensibles. Runtime local ejecutado con `sudo docker` (sin Docker Compose). SDD cycle ready for archive.
