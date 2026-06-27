# Verification Report: qa-backend-hardening-certificados

## Resumen ejecutivo

**Veredicto:** PASS WITH WARNINGS

La implementación del hardening backend fue verificada con inspección de código, lint PHP 8.4 en Docker, tests backend completos, smoke HTTP de contrato y regresión HTTP con MariaDB efímero usando configuración ficticia. Los comportamientos requeridos pasan: headers de seguridad en respuestas JSON, rechazo `415` por `Content-Type` inválido, rechazo `400` de JSON malformado antes de side effects, no creación de bucket de rate-limit en errores públicos tempranos, falla cerrada de admin key ausente/corta y regresión de emisión/revocación válida con clave administrativa de 16+ caracteres.

Quedan advertencias documentales esperadas para `sdd-archive`: specs estables y docs backend todavía no reflejan los deltas archivables, y la revocación ahora requiere body JSON `{}` cuando no hay motivo.

## Contexto

| Campo | Valor |
|---|---|
| Change | `qa-backend-hardening-certificados` |
| Branch | `qa/backend-hardening-certificados` |
| Artifact store | Hybrid / Both |
| Strict TDD | Inactivo |
| Runtime verificado | Docker `ifts14-php84`, PHP 8.4.22 |
| Base de datos de smoke | MariaDB 10.6 efímero, datos y config ficticios |

## Artefactos leídos

- `openspec/changes/qa-backend-hardening-certificados/proposal.md`
- `openspec/changes/qa-backend-hardening-certificados/design.md`
- `openspec/changes/qa-backend-hardening-certificados/tasks.md`
- `openspec/changes/qa-backend-hardening-certificados/exploration.md`
- `openspec/changes/qa-backend-hardening-certificados/specs/admin-certificate-emission/spec.md`
- `openspec/changes/qa-backend-hardening-certificados/specs/admin-auth/spec.md`
- `openspec/changes/qa-backend-hardening-certificados/specs/backend-contrato-api-certificados/spec.md`
- `openspec/changes/qa-backend-hardening-certificados/specs/backend-base-php-certificados/spec.md`
- Engram `sdd/qa-backend-hardening-certificados/apply-progress`
- Archivos modificados del backend y tests.

## Completitud de tareas

| Grupo | Estado |
|---|---|
| 1.1–1.3 Response/Config/AuthGate | Verificado por código y tests. |
| 2.1–2.4 helpers y orden de POST | Verificado por código y smokes HTTP. |
| 3.1–3.3 contrato HTTP | Verificado por `HttpContractTest.php`. |
| 3.4 regresión emisión/revocación válida | Verificado en esta fase con MariaDB efímero; el checkbox de `tasks.md` quedó sin actualizar. |
| 4.1 lint | Verificado. Script con `sudo` bloqueado; equivalente sin `sudo` pasó. |
| 4.2 tests backend | Verificado. |
| 4.3 sdd-verify | Cumplido por este reporte. |
| 4.4 sdd-archive | Pendiente; advertencia documental. |

## Evidencia de comandos

| Comando | Resultado | Evidencia |
|---|---|---|
| `bash scripts/php-docker-lint.sh` | Bloqueado | `sudo: A terminal is required to authenticate`. |
| `docker run --rm ... ifts14-php84 find apps/backend-php -type f -name '*.php' -exec php -l '{}' +` | PASS | Sin errores de sintaxis en todos los PHP backend, incluyendo `HttpContractTest.php`. |
| `docker run --rm ifts14-php84 php -v` | PASS | PHP 8.4.22. |
| `docker run --rm ifts14-php84 php -m` | PASS | Incluye `PDO`, `pdo_mysql`, `pdo_sqlite`, `mbstring`, `openssl`. |
| `docker run --rm ... php tests/AuthGateTest.php && php tests/AdminCertificateServiceTest.php && php tests/HttpContractTest.php` | PASS | `OK AuthGateTest`, `OK AdminCertificateServiceTest`, `OK HttpContractTest`. |
| `git diff --check` | PASS | Sin salida. |
| Smoke HTTP fail-closed con config ficticia corta | PASS | `missing=401`, `short=401`, `public_invalid=400`, headers seguros. |
| Smoke HTTP con MariaDB 10.6 efímero y config ficticia | PASS | `emit=201`, `empty_revoke=400`, `revoke=200`, `tokens_revoked=1`. |
| `git status --short --ignored` | PASS informativo | Cambios limitados a backend, test HTTP y OpenSpec; `material_privado_no_versionar/` ignorado, no leído. |

## Matriz de cumplimiento de specs

| Spec / escenario | Estado | Evidencia runtime |
|---|---|---|
| Headers JSON mínimos en éxito/error | PASS | `HttpContractTest.php`: health 200 y errores 404/415/400 con `nosniff` y `SAMEORIGIN`; smokes adicionales también validan headers. |
| `Content-Type` inválido en POST público/admin | PASS | `HttpContractTest.php`: falta/`text/plain` en consulta, emisión y revocación devuelve `415 UNSUPPORTED_MEDIA_TYPE`. |
| JSON malformado en POST JSON | PASS | `HttpContractTest.php`: consulta, emisión y revocación devuelven `400 VALIDATION_ERROR`. |
| Público CT/JSON inválido no crea bucket de rate-limit | PASS | `HttpContractTest.php`: `assertNoRateLimitFile()` para falta/CT inválido/JSON malformado público. |
| Admin key 16+ aceptada | PASS | `AuthGateTest.php`; HTTP con clave 16+ llega a `400` por JSON malformado, y smoke MariaDB emite/revoca con `201/200`. |
| Admin key ausente/corta falla cerrada | PASS | `AuthGateTest.php` y smoke HTTP adicional: `401 UNAUTHORIZED` sin revelar causa. |
| Endpoints públicos no se rompen con admin key corta | PASS | Smoke HTTP adicional: consulta pública con token inválido responde `400 VALIDATION_ERROR`, no `401/500`. |
| Emisión válida con admin key 16+ | PASS | Smoke HTTP + MariaDB efímero: `POST /admin/certificados` responde `201`, certificado queda vigente y no devuelve token completo. |
| Revocación válida con admin key 16+ | PASS | Smoke HTTP + MariaDB efímero: `POST /admin/certificados/{id}/revocar` con `{}` responde `200`, certificado y token quedan revocados. |
| Revocación sin motivo | PASS con nota contractual | Body vacío responde `400`; cuando no hay `reason`, el cliente debe enviar `{}`. |
| JSON malformado antes de side effects | PASS | Emisión/revocación malformadas devuelven `400` antes de construir servicio/DB; consulta malformada no crea rate-limit bucket. |

## Coherencia de diseño

| Decisión | Estado | Evidencia |
|---|---|---|
| Headers centralizados en `Response` | PASS | `Response::json()` y `Response::error()` llaman `securityHeaders()`. |
| Helpers locales en `index.php` | PASS | `requireJsonContentType()` y `readJsonBody()` sin abstracción nueva. |
| Content-Type exacto, compatible con charset | PASS | Split por `;`, `trim`, `strtolower`, igualdad con `application/json`. |
| Orden admin: method → CT → auth → body → servicio | PASS | Inspección de `index.php` y smokes. |
| Orden público: method → CT → body → rate-limit → validación | PASS | Inspección de `index.php` y `assertNoRateLimitFile()`. |
| Admin key corta normalizada a vacío | PASS | `Config::adminApiKey()` usa mínimo de 16 tras `trim`. |

## Alineación documental y specs

| Dimensión | Estado | Nota |
|---|---|---|
| Delta specs del change | PASS | Los cuatro deltas describen el comportamiento implementado. |
| Specs estables en `openspec/specs/` | WARNING | Todavía no incluyen los deltas de headers, `415`, JSON malformado y mínimo de 16 caracteres. Corresponde a `sdd-archive`. |
| Docs backend estables | WARNING | `docs/backend/00-php84-api.md` y `docs/backend/01-contrato-api-certificados.md` todavía no documentan headers, `415`, mínimo de admin key ni que revocación sin motivo requiere `{}`. Corresponde a `sdd-archive`. |

## Issues

### CRITICAL

- Ninguno.

### WARNING

- El script oficial `scripts/php-docker-lint.sh` quedó bloqueado por `sudo` sin TTY; se ejecutó el equivalente Docker directo y pasó.
- `tasks.md` conserva checkboxes sin actualizar para 3.4/4.3 aunque esta fase produjo evidencia runtime para ambos puntos.
- Falta `sdd-archive` para sincronizar specs estables y documentación backend.
- La revocación ahora exige body JSON válido; si no hay motivo, enviar `{}`. Body vacío con `Content-Type: application/json` responde `400 VALIDATION_ERROR`.

### SUGGESTION

- En `sdd-archive`, documentar explícitamente `415 UNSUPPORTED_MEDIA_TYPE`, headers de seguridad, mínimo de 16 caracteres para clave administrativa configurada, gaps diferidos y el requisito `{}` para revocar sin motivo.

## Privacidad

No se leyó material privado, `.env`, dumps, logs, ZIPs, credenciales, configuraciones reales ni bases reales. Los smokes usaron contenedores efímeros, configuración ficticia y datos ficticios; no se imprimieron DNI, tokens completos ni claves administrativas.
