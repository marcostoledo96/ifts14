# Archive report — backend-public-endpoint-hardening

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-26-backend-public-endpoint-hardening/`. Los deltas se sincronizaron a las specs destino:

- `openspec/specs/api-rate-limiting/spec.md` (creado, copia directa del spec delta).
- `openspec/specs/backend-contrato-api-certificados/spec.md` (modificado, requisito "Pendientes de capacidad operativa" reescrito).
- `openspec/specs/backend-validacion-publica-certificados/spec.md` (modificado, requisito "Configuración, seed y rate limiting" reescrito con escenarios de rate limiting).

**Veredicto del ciclo: PASS WITH WARNINGS** (0 CRITICAL; 3 WARNING operativos que no bloquean el archive). SDD cycle complete.

## Qué cambió

Hardening mínimo de endpoints públicos de verificación: rate limiting de nodo único basado en JSON temporal con `flock()` y bucket hasheado con salt, sin IP cruda, token completo ni DNI persistidos. Se elimina el pendiente "rate limiting ausente" heredado del ciclo `backend-validacion-publica-certificados` y se demuestra por fault-injection que la falla de la tabla de auditoría no rompe las respuestas `200`, `404` ni `400` del contrato público.

| Componente | Estado | Detalle |
|---|---|---|
| `apps/backend-php/src/Config.php` | Modificado | Acepta claves opcionales `rate_limit_threshold`, `rate_limit_window_seconds`, `rate_limit_storage_path` y `app_salt`; `app_salt` cae a `token_pepper`. |
| `apps/backend-php/src/RateLimiter.php` | Creado | Rate limiter final de nodo único: JSON temporal, `flock(LOCK_EX)`, `rewind()`/`ftruncate()` antes de escribir, hash `substr(hash('sha256', origen\|salt), 0, 32)`, limpieza de buckets vencidos, fail-open ante E/S/JSON/lock, `chmod` 0600 best-effort al crear. |
| `apps/backend-php/index.php` | Modificado | Aplica `RateLimiter` antes de `respondToValidation()` en GET/POST y responde `429 RATE_LIMITED` con sobre de error seguro. |
| `apps/backend-php/src/Database.php` | Modificado | Permite reutilizar config ya cargada. |
| `apps/backend-php/src/CertificateValidator.php` | Modificado | Recibe `array<string,mixed>` de config y la pasa a `Database::pdo()`. |
| `apps/backend-php/tests/fault-injection-audit.php` | Creado/Modificado | CLI de fault-injection contra MariaDB demo con `try/finally`; rechaza paths y configs sin marcadores demo/test antes de `Config::load()`, `PDO` o `RENAME TABLE`. |
| `docs/backend/00-php84-api.md` | Modificado | Elimina pendiente obsoleto y refleja que fault-injection fue probado en runtime. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Sección `429 RATE_LIMITED`, configuración opcional y limitaciones operativas. |

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `api-rate-limiting` | Creado (copia directa) | `openspec/specs/api-rate-limiting/spec.md` con 3 requirements: "Límite público por origen", "Persistencia mínima sin datos sensibles" y "Limitaciones documentadas". 5 escenarios. |
| `backend-contrato-api-certificados` | Modificado | Requisito "Pendientes de capacidad operativa" reescrito: rate limiting pasa de "ausente/pendiente" a "aplicado". Reemplazo del escenario "Rate limiting ausente" por "Rate limiting aplicado"; los 3 escenarios de fault-injection (respuesta válida/no verificable/token inválido) reemplazan al escenario único "Auditoría no rompe la respuesta" anterior. Total: 4 escenarios en el requisito. |
| `backend-validacion-publica-certificados` | Modificado | Requisito "Configuración, seed y rate limiting" reescrito: rate limiting pasa de "pendiente, MUST NOT implementarse" a "MUST aplicar a GET y POST con umbral/ventana configurables, sin dependencia nueva ni migración SQL". Se conservan los 3 escenarios previos del dominio y se agregan 2 nuevos: "Rate limiting en endpoints públicos" y "Estado local sin datos sensibles". Total: 3 escenarios en el requisito. |

Las otras specs de `openspec/specs/` no se tocan: este cambio no afecta `backend-base-php-certificados`, `backend-modelo-datos-certificados`, `guia-marcos-ciclos-sdd`, `guia-matias-angular-windows`, `auditoria-material-original`, `actualizar-plan-matias-v0`, `repo-limpio`, `repo-precommit` ni `repo-seguro`.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `proposal.md` | `openspec/changes/archive/2026-06-26-backend-public-endpoint-hardening/` |
| `design.md` | id. |
| `tasks.md` | id. (14/14 tareas `[x]`) |
| `verify-report.md` | id. (PASS WITH WARNINGS) |
| `exploration.md` | id. |
| `specs/api-rate-limiting/spec.md` | id. (delta, copia directa) |
| `specs/backend-contrato-api-certificados/spec.md` | id. (delta, MODIFIED) |
| `specs/backend-validacion-publica-certificados/spec.md` | id. (delta, MODIFIED) |
| `openspec/specs/api-rate-limiting/spec.md` (antes de merge) | Repo, no existía |
| `openspec/specs/backend-contrato-api-certificados/spec.md` (antes de merge) | Repo, target con requisito previo |
| `openspec/specs/backend-validacion-publica-certificados/spec.md` (antes de merge) | Repo, target con requisito previo |
| Engram observation `#3935` | `sdd/backend-public-endpoint-hardening/apply-progress` |
| Engram observation `#3953` | `sdd/backend-public-endpoint-hardening/verify-report` |
| `openspec/AGENTS.md`, `AGENTS.md` (repo) | Reglas de scope y privacidad |

Skills cargadas: `sdd-archive`, `cognitive-doc-design`, `karpathy-guidelines`.

## Archivos modificados en este archive

| Archivo | Estado | Alcance |
|---|---|---|
| `openspec/specs/api-rate-limiting/spec.md` | Creado | Copia directa del spec delta. 3 requirements, 5 escenarios. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Modificado | Requisito "Pendientes de capacidad operativa" reescrito; 2 escenarios reemplazados/expandidos a 4. |
| `openspec/specs/backend-validacion-publica-certificados/spec.md` | Modificado | Requisito "Configuración, seed y rate limiting" reescrito; 1 escenario conservado, 2 nuevos escenarios agregados. |
| `openspec/changes/archive/2026-06-26-backend-public-endpoint-hardening/` | Movido | `proposal.md`, `design.md`, `tasks.md`, `verify-report.md`, `exploration.md`, `specs/{api-rate-limiting,backend-contrato-api-certificados,backend-validacion-publica-certificados}/spec.md`, este `archive-report.md`. |

No se tocaron `material_privado_no_versionar/`, Angular, migraciones SQL, `composer.json`, `package.json`, `.env`, configs reales, credenciales, dumps ni logs. No se modificó `apps/backend-php/` (la implementación ya fue versionada en el ciclo de apply previo). No se modificó `git`, no se hicieron commits, push, merge ni rebase.

## Task Completion Gate

`tasks.md` revisado antes de archivar: 14 tareas `[x]`, 0 tareas `[ ]` sin evidencia. No se requirió reconciliación mecánica de checkboxes: el `apply-progress` archivado (#3935) ya marcaba las 14/14 tareas y el `verify-report.md` (#3953) avala el cierre PASS WITH WARNINGS. La regla de archive no se activó.

## Evidencia de verificación (resumida del verify-report)

| Check | Resultado |
|---|---|
| `verify-report.md` | PASS WITH WARNINGS. 0 CRITICAL. |
| `tasks.md` | 14/14 tareas marcadas `[x]`. |
| `Config.php` con claves opcionales de rate limit | PASS por inspección y lint. |
| `RateLimiter.php` con `flock(LOCK_EX)` y fail-open | PASS por self-check en Docker: `true,true,false` con umbral 2; JSON sin IP/token/DNI. |
| `index.php` aplica `429 RATE_LIMITED` antes de validación | PASS por smoke HTTP Docker: `GET` válido 200, `POST` válido 200, `GET` excedido 429, `POST` excedido 429. |
| Fault-injection de auditoría | PASS contra MariaDB demo: válido 200, no verificable 404, token inválido 400; `cert_eventos_auditoria` restaurada. |
| Guard de seguridad del script | PASS: rechaza path sin marcador demo/test antes de `Config::load()`; rechaza config con path demo pero `db_name`/`token_pepper` sin marcadores antes de `PDO`/`RENAME TABLE`. |
| Inspección del storage del limiter | PASS: 1 bucket, clave hex de 32 caracteres; sin IP cruda, token ni documento. |
| `git status` post-cambio | PASS privacidad: solo backend, docs y OpenSpec del cambio. |

## Warnings y notas

### WARNING — Scripts versionados con `sudo`

`scripts/php-docker-modules-check.sh` y `scripts/php-docker-lint.sh` requieren `sudo` y fallaron en sesión no interactiva por autenticación de terminal. Se ejecutaron equivalentes Docker sin `sudo` con resultado PASS. Documentado, no bloqueante.

### WARNING — Validación de cPanel y permisos de staging

No se verificó cPanel real ni permisos reales de `sys_get_temp_dir()` en hosting. Queda como validación de staging/deploy, fuera del alcance local de este cambio.

### WARNING — Limitación documentada del rate limiting

Rate limiting de nodo único, fail-open ante problemas de storage, no distribuido. Es una limitación documentada y esperada del diseño; la spec `api-rate-limiting` la declara en el requisito "Limitaciones documentadas".

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Rate limiting no distribuido, NAT agrupa clientes en bucket | Media | Documentado; umbrales razonables; aceptar para endpoints de baja sensibilidad. |
| Fail-open ante problemas de storage | Baja | Decisión consciente de disponibilidad; documentada en design.md y docs/backend. |
| cPanel real no verificado | Baja | Validar en staging antes de promover a producción. |
| Sin tests automatizados versionados | Baja | M3 no lo exige; validación por smoke HTTP real + fault-injection CLI. Considerar PHPUnit/Pest en un ciclo posterior. |

## Comandos Git propuestos (no ejecutar)

Ninguno. La regla de `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, y este ciclo no pidió versionar.

## Estado

**SDD cycle complete.** Hardening de endpoints públicos archivado con 14/14 tareas completadas y verificación runtime PASS WITH WARNINGS. Deltas sincronizados a `openspec/specs/{api-rate-limiting,backend-contrato-api-certificados,backend-validacion-publica-certificados}/spec.md`. Próximo ciclo recomendado: ciclos operativos que necesiten consumir estas capacidades (no definidos en este cambio).
