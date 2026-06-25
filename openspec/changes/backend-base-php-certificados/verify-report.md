# Verify report — backend-base-php-certificados

## Change

| Campo | Valor |
|---|---|
| Cambio | `backend-base-php-certificados` |
| Ciclo | M2-02 — base PHP segura |
| Modo | SDD verify estándar; TDD estricto no declarado activo |
| Fecha | 2026-06-25 |
| Commit verificado | `65d3fc7` (`feat(backend): agregar base php segura para certificados`) |
| Veredicto | **FAIL** |

## Resumen ejecutivo

La implementación mínima bajo `apps/backend-php/` está alineada por inspección con el alcance de M2-02: crea front controller, respuesta JSON, configuración externa, fábrica PDO lazy, ejemplo ficticio, `.htaccess` local y README. No se detectaron Angular, endpoint de validación pública, `.env`, credenciales reales ni archivos reales `config.php`, `db.php`, `database.php` o `conexion.php`.

Verificación post-commit: `HEAD` es `65d3fc7`. El verify queda en **FAIL por bloqueo de entorno**: el binario `php` sigue no disponible, por lo que no se pudieron ejecutar `php -l`, `php -m` ni el smoke HTTP local requerido para cerrar M2-02. El smoke real de cPanel en `/certificados_qa/` se incorpora sólo como evidencia de apoyo sobre copias/adaptaciones del comportamiento, no como reemplazo de la QA local de `apps/backend-php/`.

## Artifacts read

| Artefacto | Estado |
|---|---|
| `openspec/changes/backend-base-php-certificados/specs/backend-base-php-certificados/spec.md` | Leído |
| `openspec/changes/backend-base-php-certificados/design.md` | Leído |
| `openspec/changes/backend-base-php-certificados/tasks.md` | Leído |
| `openspec/changes/backend-base-php-certificados/apply-progress.md` | Leído |
| `apps/backend-php/` | Inspeccionado |
| `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/verify-report.md` | Leído como evidencia de apoyo |
| `HEAD` | Verificado en `65d3fc7` |

## Completeness

| Área | Resultado | Evidencia |
|---|---|---|
| Estructura base | PASS | Existen `index.php`, `src/Response.php`, `src/Config.php`, `src/Database.php`, `config/certificados-config.example.php`, `.htaccess`, `README.md`. |
| Health endpoint | PASS por inspección | `index.php` enruta `/health`, responde 200 y maneja 405/404. |
| Config externa | PASS por inspección | `Config::load()` usa `CERTIFICADOS_CONFIG_PATH` o ruta externa ficticia y falla con `RuntimeException` sin imprimir ruta ni secreto. |
| PDO lazy | PASS por inspección | `Database::pdo()` crea PDO sólo al llamarse; opciones seguras presentes. |
| Exclusiones de alcance | PASS por inspección | No se detectan Angular, endpoint de validación pública, `.env`, Composer/vendor ni conexión real ejecutada en bootstrap. |
| QA PHP local | FAIL | `php` no está instalado; `php -l`, `php -m` y servidor embebido no ejecutan. |
| Tareas | FAIL | 4.2, 4.3, 4.4 y 4.5 siguen sin evidencia runtime local. |

## Build / tests / coverage evidence

### `git status --ignored --short`

Resultado post-commit ejecutado en esta sesión:

```txt
 M .atl/skill-registry.md
 M .gitignore
 M openspec/changes/backend-base-php-certificados/verify-report.md
?? muestra_pagina/revision_y_parches_prompts_stitch_v0_ifts14.md
!! .atl/.skill-registry.cache.json
!! material_privado_no_versionar/
```

Notas:

- `material_privado_no_versionar/` sólo aparece como ignorado; no fue leído.
- `openspec/changes/backend-base-php-certificados/verify-report.md` aparece modificado por esta actualización post-commit del reporte.
- Hay cambios no relacionados ya presentes: `.atl/skill-registry.md`, `.gitignore` y `muestra_pagina/revision_y_parches_prompts_stitch_v0_ifts14.md`.
- Los archivos de `apps/backend-php/` y `openspec/changes/backend-base-php-certificados/` ya no aparecen como no versionados porque quedaron incluidos en `65d3fc7`.
- No se detectaron archivos reales prohibidos bajo `apps/backend-php/`: `config.php`, `db.php`, `database.php`, `conexion.php`, `.env` ni `composer.json`.

### Disponibilidad de PHP

Comando:

```bash
command -v php && php -v
```

Resultado:

```txt
(sin salida)
```

### `php -l`

Comando intentado:

```bash
php -l "apps/backend-php/index.php" && php -l "apps/backend-php/src/Response.php" && php -l "apps/backend-php/src/Config.php" && php -l "apps/backend-php/src/Database.php" && php -l "apps/backend-php/config/certificados-config.example.php"
```

Resultado:

```txt
/bin/bash: línea 1: php: orden no encontrada
```

### `php -m`

Comando intentado:

```bash
php -m
```

Resultado:

```txt
/bin/bash: línea 1: php: orden no encontrada
```

No se pudo confirmar `pdo_mysql`, `openssl` ni `mbstring`.

### Smoke HTTP local

Comando intentado:

```bash
php -S 127.0.0.1:8080 -t "apps/backend-php"
```

Resultado:

```txt
/bin/bash: línea 1: php: orden no encontrada
```

No se pudo iniciar servidor embebido ni ejecutar `curl` local para `GET /health` o `POST /health`.

## Spec compliance matrix

| Requirement / scenario | Estado | Evidencia |
|---|---|---|
| Configuración externa disponible | UNTESTED | `Config.php` implementa carga externa por inspección, pero no hubo runtime PHP. |
| Configuración ausente | UNTESTED | Código lanza `RuntimeException` segura por inspección, pero no hubo runtime PHP. |
| Conexión diferida en `GET /health` | UNTESTED | `index.php` sólo requiere `Response.php`; no carga `Config.php`, `Database.php` ni `PDO`. Falta smoke runtime local. |
| Uso futuro de datos con PDO seguro | UNTESTED | `Database.php` usa DSN `mysql`, `utf8mb4`, `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES=false`; falta `php -m` y ejecución. |
| Respuesta exitosa JSON `data/meta` | UNTESTED | `Response::json()` cumple por inspección; falta HTTP runtime local. |
| Error inesperado seguro | UNTESTED | `set_exception_handler()` responde `INTERNAL_ERROR` sin detalle por inspección; falta runtime local. |
| Health exitoso | UNTESTED | Implementado por inspección; no se pudo ejecutar `curl` local. |
| Método no permitido en `/health` | UNTESTED | 405 y `Allow: GET` implementados por inspección; no se pudo ejecutar `curl` local. |
| Endpoint de validación excluido | PASS por inspección | No se detectan rutas `certificados/{token}/verificacion` ni `consulta` bajo `apps/backend-php/`. |
| QA mínimo verificable | FAIL | `php -l`, `php -m` y smoke HTTP local no ejecutan por ausencia de `php`. |

## Correctness checks by inspection

| Check solicitado | Resultado | Detalle |
|---|---|---|
| Structure/files exist | PASS | Estructura esperada presente bajo `apps/backend-php/`. |
| No Angular | PASS | No hay archivos Angular ni referencias funcionales Angular en backend. |
| No validation endpoint | PASS | No se detectan rutas de verificación pública ni consulta. |
| No real DB connection | PASS por inspección | La única conexión posible está encapsulada en `Database::pdo()` y no se ejecuta en bootstrap ni `/health`. |
| No `.env` | PASS | No existe `.env` bajo `apps/backend-php/`. |
| No real credentials | PASS | Sólo existe ejemplo ficticio `clave_demo_no_real`. |
| `/health` does not call Config/Database/PDO | PASS por inspección | `index.php` sólo hace `require_once __DIR__ . '/src/Response.php'`; no hay `Config::`, `Database::` ni `PDO` en `index.php`. |

## Design coherence

| Decisión de diseño | Estado | Evidencia |
|---|---|---|
| `index.php` + helpers mínimos | PASS | Implementado sin framework ni dependencias. |
| Sólo `.htaccess` local del backend | PASS | No se modificaron `deploy/.htaccess` ni `deploy/htaccess/*` durante este verify. |
| Config externa no versionada | PASS por inspección | Ejemplo versionado ficticio; carga real fuera del repo. |
| Health sin config ni PDO | PASS por inspección | Bootstrap de `index.php` no carga config ni DB. |
| No agregar dependencias | PASS | No hay `composer.json` ni `vendor/`. |

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

Esta evidencia apoya el comportamiento esperado de copias/adaptaciones del backend, pero **no reemplaza** la verificación local de `apps/backend-php/` requerida por M2-02.

## Issues

### CRITICAL

1. **PHP runtime unavailable**: `php` no está instalado en esta sesión. Bloquea `php -l`, `php -m`, servidor embebido y smoke HTTP local.
2. **Spec QA requirement unmet**: el Requirement “QA mínimo verificable” no tiene evidencia runtime local.
3. **Unchecked verification tasks**: `tasks.md` mantiene sin evidencia ejecutable 4.2, 4.3, 4.4 y 4.5.

### WARNING

1. `git status --ignored --short` muestra cambios no relacionados al ciclo (`.atl/skill-registry.md`, `.gitignore`, `muestra_pagina/...`). No fueron tocados en este verify, pero deben mantenerse fuera del cierre de M2-02 salvo decisión explícita.
2. El smoke cPanel real es evidencia útil, pero pertenece a una copia/adaptación en `/certificados_qa/`, no al árbol local `apps/backend-php/`.

### SUGGESTION

1. Repetir `sdd-verify` en un entorno con PHP 8.4.21 y extensiones `pdo_mysql`, `openssl`, `mbstring` disponibles.
2. Ejecutar, como mínimo: `php -l` sobre los cinco PHP, `php -m`, servidor embebido y `curl` para `GET /health` y `POST /health`.

## Final verdict

**FAIL**. La implementación pasa inspección estructural y de alcance, pero M2-02 no puede cerrarse porque la QA PHP/runtime local obligatoria sigue bloqueada por ausencia de `php`.
