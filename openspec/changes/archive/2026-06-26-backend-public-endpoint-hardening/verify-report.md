# Verification Report: backend-public-endpoint-hardening

## Veredicto

**PASS WITH WARNINGS**

La implementación satisface los requisitos funcionales del cambio con evidencia runtime en Docker PHP y MariaDB demo local ficticia. Las advertencias no bloquean el archive: los scripts versionados con `sudo` no pudieron ejecutarse en esta sesión no interactiva, pero los equivalentes Docker sin `sudo` pasaron.

## Modo de verificación

| Campo | Resultado |
|---|---|
| Proyecto | `ifts14` |
| Cambio | `backend-public-endpoint-hardening` |
| Strict TDD | Inactivo |
| Artifact store | Hybrid: OpenSpec + Engram |
| Alcance | Backend PHP, docs backend y OpenSpec del cambio |
| Fuera de alcance respetado | Angular, migraciones nuevas, dependencias nuevas, `.env`, configs reales, datos reales |

## Artefactos leídos

- `openspec/changes/backend-public-endpoint-hardening/proposal.md`
- `openspec/changes/backend-public-endpoint-hardening/design.md`
- `openspec/changes/backend-public-endpoint-hardening/tasks.md`
- `openspec/changes/backend-public-endpoint-hardening/specs/api-rate-limiting/spec.md`
- `openspec/changes/backend-public-endpoint-hardening/specs/backend-contrato-api-certificados/spec.md`
- `openspec/changes/backend-public-endpoint-hardening/specs/backend-validacion-publica-certificados/spec.md`
- Engram topic `sdd/backend-public-endpoint-hardening/apply-progress`
- Archivos backend/docs modificados necesarios para verificar implementación.

## Completeness de tareas

| Área | Estado | Evidencia |
|---|---:|---|
| Configuración rate limit | PASS | `Config.php` acepta `rate_limit_threshold`, `rate_limit_window_seconds`, `rate_limit_storage_path`, `app_salt`; fallback de salt a `token_pepper`. |
| Núcleo `RateLimiter` | PASS | JSON temporal, `flock(LOCK_EX)`, hash con salt, limpieza de buckets, fail-open y sin datos sensibles persistidos. |
| Wiring HTTP | PASS | `index.php` aplica `RateLimiter` antes de `respondToValidation()` en GET y POST; devuelve `429 RATE_LIMITED`. |
| Fault-injection auditoría | PASS | Script CLI demo-only renombra auditoría, verifica `200`/`404`/`400` y restaura en `finally`. |
| Documentación | PASS | Docs backend documentan `429`, nodo único, NAT, permisos de temporales y fail-open. |
| Privacidad/alcance | PASS | Sin cambios en Angular, migraciones, seeds, dependencias ni paths prohibidos. |

Tareas marcadas: **14/14 completadas**. Tareas incompletas: **0**.

## Evidencia de comandos

| Comando | Resultado |
|---|---|
| `bash scripts/php-docker-modules-check.sh` | BLOCKED esperado por entorno: `sudo: A terminal is required to authenticate`. |
| Docker equivalente sin `sudo`: `docker run --rm ifts14-php84 php -r <extension_loaded checks>` | PASS: `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `bash scripts/php-docker-lint.sh` | BLOCKED esperado por entorno: `sudo: A terminal is required to authenticate`. |
| Docker equivalente sin `sudo`: `docker run --rm --volume apps/backend-php:ro --workdir /workspace ifts14-php84 find apps/backend-php -type f -name '*.php' -exec php -l '{}' +` | PASS: 8 archivos PHP del backend sin errores de sintaxis. |
| Self-check `RateLimiter` en Docker PHP | PASS: umbral `true,true,false`; archivo sin IP cruda; JSON corrupto falla abierto. |
| MariaDB demo local efímera con datos ficticios + migración/seed versionables | PASS: readiness por consulta TCP real, schema y seed cargados. |
| Guard unsafe path del fault-injection | PASS: exit `255`; rechaza config path sin marcador demo/test antes de cargar configuración. |
| Guard unsafe values del fault-injection | PASS: exit `255`; rechaza `db_name`/`token_pepper` sin marcadores demo/test antes de conectar o mutar DB. |
| `apps/backend-php/tests/fault-injection-audit.php` contra MariaDB demo | PASS: válido conserva `200`, no verificable conserva `404`, token inválido conserva `400`; tabla restaurada. |
| Smoke HTTP Docker PHP + MariaDB demo | PASS: health `200`; GET válido `200`; POST válido `200`; GET excedido `429 RATE_LIMITED`; POST excedido `429 RATE_LIMITED`. |
| Inspección del storage del limiter dentro del contenedor HTTP | PASS: 1 bucket, clave hex de 32 caracteres; sin IP cruda, token ni documento. |
| `git status`/path check posterior | PASS: solo backend, docs y OpenSpec del cambio; sin paths prohibidos detectados. |

## Matriz de cumplimiento de specs

| Spec / requisito | Escenario | Estado | Evidencia |
|---|---|---:|---|
| `api-rate-limiting` — Límite público por origen | Umbral excedido en GET | PASS | Smoke HTTP devuelve `429 RATE_LIMITED` para GET dentro de la ventana. |
| `api-rate-limiting` — Límite público por origen | Umbral excedido en POST | PASS | Smoke HTTP devuelve `429 RATE_LIMITED` para POST dentro de la misma ventana/bucket. |
| `api-rate-limiting` — Persistencia mínima sin datos sensibles | Archivo de buckets seguro | PASS | Storage JSON con bucket hash de 32 caracteres; sin IP cruda, token ni documento; self-check sin IP cruda. |
| `api-rate-limiting` — Persistencia mínima sin datos sensibles | Sin cambios de esquema | PASS | `git diff --name-status -- database/migrations database/seeds` sin salida; sin `composer.json` ni dependencia backend nueva. |
| `api-rate-limiting` — Limitaciones documentadas | Revisión operativa | PASS | `docs/backend/01-contrato-api-certificados.md` documenta nodo único, NAT, temporales y fail-open. |
| `backend-validacion-publica-certificados` — Configuración, seed y rate limiting | Seed demo coherente | PASS | Token demo ficticio del seed devuelve `200` contra MariaDB demo cargada desde migración/seed versionables. |
| `backend-validacion-publica-certificados` — Configuración, seed y rate limiting | Rate limiting en endpoints públicos | PASS | GET y POST responden `429 RATE_LIMITED` antes de validación al exceder umbral. |
| `backend-validacion-publica-certificados` — Configuración, seed y rate limiting | Estado local sin datos sensibles | PASS | Inspección runtime del JSON no encontró IP cruda, token ni documento. |
| `backend-contrato-api-certificados` — Pendientes operativos | Auditoría no rompe respuesta válida | PASS | Fault-injection: válido conserva `200` con auditoría renombrada. |
| `backend-contrato-api-certificados` — Pendientes operativos | Auditoría no rompe no verificable | PASS | Fault-injection: no verificable conserva `404`. |
| `backend-contrato-api-certificados` — Pendientes operativos | Auditoría no rompe token inválido | PASS | Fault-injection: token inválido conserva `400`. |
| `backend-contrato-api-certificados` — Pendientes operativos | Rate limiting aplicado | PASS | Smoke HTTP: GET y POST excedidos devuelven `429 RATE_LIMITED` con sobre seguro. |

## Coherencia de diseño

| Decisión de diseño | Estado | Evidencia |
|---|---:|---|
| Rate limiter local por JSON + `flock()` | PASS | `RateLimiter.php` usa archivo temporal, `flock(LOCK_EX)`, `rewind()`, `ftruncate()`, `fflush()` y cierre en `finally`. |
| Bucket hasheado con salt; sin IP/token/DNI | PASS | Hash `sha256(origen|salt)` truncado a 32; runtime storage sin datos sensibles. |
| GET y POST comparten bucket por origen | PASS | Secuencia GET válido + POST válido consume umbral; ambos métodos reciben `429` después. |
| Fail-open ante problemas de storage | PASS | Self-check con JSON corrupto devuelve permitido. Código también falla abierto ante directorio no escribible, lock/lectura/escritura inválidos. |
| `429` antes de lookup/auditoría | PASS | `index.php` llama `allowPublicRequest()` antes de `respondToValidation()`. |
| Fault-injection con restauración | PASS | Script usa `try/finally`; prueba runtime confirma tabla restaurada. |
| Guard demo-only antes de mutar DB | PASS | Rechazo por path/config unsafe ocurre antes de `Config::load()`/PDO/`RENAME TABLE`. |

## Issues

### CRITICAL

- Ninguno.

### WARNING

- Los scripts versionados `scripts/php-docker-modules-check.sh` y `scripts/php-docker-lint.sh` requieren `sudo`; en esta sesión no interactiva fallaron por autenticación de terminal. Se ejecutaron equivalentes Docker sin `sudo` con resultado PASS.
- No se verificó cPanel real ni permisos reales de temporales en hosting; queda como validación de staging/deploy, fuera del alcance local de este cambio.
- El rate limiting es de nodo único y falla abierto ante problemas de storage; es una limitación documentada y esperada del diseño.

### SUGGESTION

- Durante `sdd-archive`, fusionar los deltas en `openspec/specs/{api-rate-limiting,backend-contrato-api-certificados,backend-validacion-publica-certificados}/spec.md` y adjuntar esta evidencia.

## Confirmación de privacidad

- No se leyó ni tocó `material_privado_no_versionar/`.
- No se usaron dumps, logs, ZIPs, `.env`, credenciales reales, configs reales ni datos reales.
- No se imprimen IPs crudas, tokens completos, DNIs completos ni secretos en este reporte.
- Las pruebas usaron contenedores efímeros y datos demo ficticios versionables.
- No hubo commit, push, merge, rebase ni migración nueva.

## Próximo recomendado

Ejecutar `sdd-archive` para cerrar el ciclo y fusionar specs/documentación de cierre.
