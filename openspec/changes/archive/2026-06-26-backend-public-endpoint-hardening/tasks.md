# Tasks: backend-public-endpoint-hardening

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200–280 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR con work-unit commits |
| Delivery strategy | auto-forecast |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

Riesgo bajo: una clase nueva, dos archivos modificados, un script CLI y un doc. Sin migraciones, dependencias ni Angular. El wiring depende del limiter; partir en PRs sumaría retrabajo sin reducir carga de revisión.

### Suggested Work Units

| # | Goal | Commit |
|---|------|--------|
| 1 | Claves opcionales de rate limit en Config | `chore(backend): accept rate-limit config keys` |
| 2 | Clase `RateLimiter` (JSON+`flock()`, hash, fail-open) | `feat(backend): add single-node rate limiter` |
| 3 | Wiring en `index.php` con `429` antes de validación | `feat(backend): enforce 429 in public endpoints` |
| 4 | `fault-injection-audit.php` con `try/finally` y limiter aislado | `test(backend): fault-inject audit table` |
| 5 | Doc `429` y limitaciones | `docs(backend): document 429 and limitations` |

## Phase 1: Configuración

- [x] 1.1 Extender `apps/backend-php/src/Config.php` con `rate_limit_threshold`, `rate_limit_window_seconds`, `rate_limit_storage_path` (default `sys_get_temp_dir().'/ifts14-cert-rate-limit.json'`) y `app_salt` con fallback a `token_pepper`.
- [x] 1.2 Verificar con `bash scripts/php-docker-lint.sh` que la config demo existente sigue cargando.

## Phase 2: Núcleo

- [x] 2.1 Crear `apps/backend-php/src/RateLimiter.php`: `final class`, ctor `(array $config, array $server)`, `allow(): bool`. Clave `substr(hash('sha256', $ip.'|'.$salt), 0, 32)`; GET y POST comparten bucket.
- [x] 2.2 Persistencia JSON bajo `flock(LOCK_EX)`: leer, mutar, `rewind()`+`ftruncate()` antes de escribir, `fflush`, `flock(LOCK_UN)`, `fclose`. `chmod` 0600 best-effort al crear; limpiar buckets con `resetAt < now`.
- [x] 2.3 Fail-open ante excepciones de E/S o JSON corrupto; sin loguear IP/token/DNI.
- [x] 2.4 En `apps/backend-php/index.php`: `require_once 'src/RateLimiter.php'`, instanciar por request tras `Config::load()`, invocar `allow()` antes de `respondToValidation()`. Si false, `Response::error(429, 'RATE_LIMITED', [])`.
- [x] 2.5 Verificar con `bash scripts/php-docker-modules-check.sh` y `bash scripts/php-docker-lint.sh`; revisar que el `429` se emita antes del lookup PDO y de `audit()`.

## Phase 3: Pruebas

- [x] 3.1 Crear `apps/backend-php/tests/fault-injection-audit.php` (CLI) contra MariaDB demo local: `try { RENAME TABLE cert_eventos_auditoria TO cert_eventos_auditoria_bak; ... } finally { RENAME TABLE cert_eventos_auditoria_bak TO cert_eventos_auditoria; }`.
- [x] 3.2 Aislar el limiter: `rate_limit_storage_path` único por corrida o umbral alto en config para evitar que `429` enmascare `200`/`400`/`404`.
- [x] 3.3 Ejecutar casos (válido→`200`, no verificable→`404`, formato inválido→`400`); cerrar con `SHOW TABLES LIKE 'cert_eventos_auditoria'` para confirmar restauración.
- [x] 3.4 Smoke HTTP local con `sudo docker run` PHP CLI + servidor embebido; `curl` repetido a GET y POST hasta `429 RATE_LIMITED`. Sin volcar IP/token/DNI.

## Phase 4: Documentación y archive

- [x] 4.1 Actualizar `docs/backend/01-contrato-api-certificados.md` con sección `429 RATE_LIMITED`, sobre de error y limitaciones (nodo único, NAT, permisos de `sys_get_temp_dir()`).
- [x] 4.2 Plan de archive: ejecutar `sdd-archive` para fusionar deltas en `openspec/specs/{api-rate-limiting,backend-contrato-api-certificados,backend-validacion-publica-certificados}/spec.md`. Adjuntar evidencia: `429` y fault-injection `200`/`400`/`404`.
- [x] 4.3 Confirmación final: nada modificado en `material_privado_no_versionar/`; sin dumps, logs, `.env`, credenciales ni config real; sin cambios en Angular ni migraciones SQL.
