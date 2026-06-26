# Verification Report — backend-admin-certificados

**Cambio**: `backend-admin-certificados`  
**Rama verificada**: `backend/admin-certificados`  
**Modo**: Standard; Strict TDD no activo  
**Alcance**: slice mínimo seguro de backend: auth admin, emisión y revocación. Reenvío fuera de alcance.  
**Persistencia de artefacto**: OpenSpec + Engram

## Resumen ejecutivo

Resultado: **PASS WITH WARNINGS**.

La implementación cumple los objetivos verificables del slice: lint PHP completo en Docker, checks sin DB para `AuthGate` y máscara/hash, demo Docker PHP + MariaDB con datos ficticios, autorización admin fail-closed, emisión `201` con DTO seguro, revocación `200`, invalidación de tokens activos, verificación pública post-revocación `404`, reenvío no implementado `404`, documentación backend alineada y sin cambios en migraciones/dependencias/configuración real.

La advertencia principal es conocida: no se puede validar públicamente el token recién emitido sin exponer el token completo, y el contrato prohíbe devolverlo mientras reenvío/entrega siga fuera de alcance. Se verificó como alternativa segura que la emisión crea un token activo en DB y que la ruta pública funciona con el seed ficticio.

## Completeness

| Métrica | Valor |
|---|---:|
| Tasks totales | 20 |
| Tasks completas marcadas | 17 |
| Tasks incompletas/pendientes | 3 |
| Pendientes de implementación verificable | 1 parcial (`4.3`) |
| Pendientes de archive | 2 (`5.2`, `5.4`) |

## Build & Tests Execution

| Comando | Resultado |
|---|---|
| `docker --version && docker image inspect ifts14-php84 >/dev/null && docker run --rm ifts14-php84 php -v` | PASS — Docker disponible; runtime `PHP 8.4.22 (cli)` disponible. |
| `git diff --check` | PASS — sin errores de whitespace. |
| `docker run --rm --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" --workdir /workspace ifts14-php84 find apps/backend-php -type f -name '*.php' -exec php -l '{}' +` | PASS — sin errores de sintaxis en todos los PHP del backend. |
| `docker run --rm --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" --workdir /workspace ifts14-php84 php apps/backend-php/tests/AuthGateTest.php` | PASS — `OK AuthGateTest`. |
| `docker run --rm --volume "$PWD/apps/backend-php:/workspace/apps/backend-php:ro" --workdir /workspace ifts14-php84 php apps/backend-php/tests/AdminCertificateServiceTest.php` | PASS — `OK AdminCertificateServiceTest`. |
| `docker run --rm ifts14-php84 php -m` | PASS — módulos requeridos observados: `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| Harness Docker PHP + MariaDB 10.6 con config temporal bajo `/tmp/opencode` y datos ficticios | PASS — ver detalle abajo. |

### Evidencia runtime Docker PHP + MariaDB

El harness generó secretos demo en variables de shell, no los imprimió, cargó `database/migrations/001_certificados_qr.sql` y `database/seeds/001_certificados_qr_demo.sql`, levantó `mariadb:10.6` y `ifts14-php84`, y eliminó contenedores/red/config temporal al salir.

```text
PASS health: status=200
PASS public_seed_before: status=200 valid=true
PASS admin_missing_key: status=401 code=UNAUTHORIZED
PASS admin_invalid_key: status=401 code=UNAUTHORIZED
PASS invalid_payload: status=400 code=VALIDATION_ERROR
PASS emission: status=201 safe_response=true activeTokens=1
PASS revocation_missing: status=404 code=CERTIFICATE_NOT_FOUND
PASS revocation: status=200 tokensRevoked>=1
PASS revocation_repeat: status=409 code=CERTIFICATE_NOT_REVOCABLE
PASS public_seed_after_revoke: status=404 code=CERTIFICATE_NOT_FOUND
PASS resend_unavailable: status=404
PASS audit_safety: entries>=4 safe=true
```

**Coverage formal**: no disponible; el proyecto no tiene runner de cobertura configurado para este slice.

## Spec Compliance Matrix

| Capacidad | Escenario | Evidencia | Resultado |
|---|---|---|---|
| `admin-auth` | Header válido | `AuthGateTest.php`; emisión admin autorizada `201`. | ✅ COMPLIANT |
| `admin-auth` | Falla cerrada | `AuthGateTest.php`; Docker missing/invalid key `401 UNAUTHORIZED`. | ✅ COMPLIANT |
| `admin-auth` | Secreto no observable | `AuthGateTest.php` verifica respuesta sin clave; Docker emisión verifica que la respuesta no contenga admin key. | ✅ COMPLIANT |
| `admin-certificate-emission` | Emisión exitosa | Docker emisión `201`, DTO seguro y `activeTokens=1` en DB. | ⚠️ PARTIAL |
| `admin-certificate-emission` | Payload inválido | Docker `400 VALIDATION_ERROR`. | ✅ COMPLIANT |
| `admin-certificate-emission` | Auditoría segura | Docker `audit_safety: entries>=4 safe=true`. | ✅ COMPLIANT |
| `admin-certificate-emission` | Persistencia segura | Inspección de `AdminCertificateService.php`: PDO + placeholders; Docker DB writes OK. | ✅ COMPLIANT |
| `admin-certificate-revocation` | Revocación exitosa | Docker `200`, `tokensRevoked>=1`. | ✅ COMPLIANT |
| `admin-certificate-revocation` | Inexistente/no revocable | Docker `404 CERTIFICATE_NOT_FOUND` y repetición `409 CERTIFICATE_NOT_REVOCABLE`. | ✅ COMPLIANT |
| `admin-certificate-revocation` | Token revocado no verifica públicamente | Docker verificación pública posterior `404 CERTIFICATE_NOT_FOUND`. | ✅ COMPLIANT |
| `admin-certificate-revocation` | Auditoría de revocación | Docker `audit_safety: entries>=4 safe=true`. | ✅ COMPLIANT |
| `backend-contrato-api-certificados` | Admin sin autorización | Docker `401 UNAUTHORIZED`. | ✅ COMPLIANT |
| `backend-contrato-api-certificados` | Emisión documentada | `docs/backend/01-contrato-api-certificados.md` + Docker `201` seguro. | ✅ COMPLIANT |
| `backend-contrato-api-certificados` | Revocación documentada | `docs/backend/01-contrato-api-certificados.md` + Docker `200`. | ✅ COMPLIANT |
| `backend-contrato-api-certificados` | Reenvío no disponible | Docs declaran exclusión; Docker ruta reenvío `404`. | ✅ COMPLIANT |

**Resumen de compliance**: 14 escenarios compliant, 1 partial, 0 failing.

## Correctness — evidencia estática

| Requisito | Estado | Evidencia |
|---|---|---|
| `X-Admin-Key` fail-closed | ✅ | `AuthGate::requireAdmin()` rechaza config/header vacío o mismatch y usa `hash_equals()`. |
| Config externa sin exigir admin globalmente | ✅ | `Config::load()` normaliza `admin_api_key`; `Config::adminApiKey()` devuelve `''` si falta. |
| Rutas públicas preservadas | ✅ | `/health`, `/certificados/{token}/verificacion` y `/certificados/consulta` conservan handlers previos. |
| Emisión segura | ✅ | `AdminCertificateService::emitir()` valida payload demo, usa HMAC para documento, máscara, token aleatorio, hash binario y token prefix. |
| Revocación segura | ✅ | `revocar()` valida ID, actualiza certificado y tokens activos en transacción. |
| Auditoría no bloqueante | ✅ | `safeAudit()` encapsula errores y no registra DNI completo, token completo, SQL ni claves. |
| Sin migraciones/dependencias/config real | ✅ | `git status --short --untracked-files=all` no muestra migraciones, dependencias, `.env` ni config real agregadas. |
| Docs backend | ✅ | `docs/backend/00-php84-api.md` y `docs/backend/01-contrato-api-certificados.md` reflejan endpoints admin y exclusión de reenvío. |

## Coherencia con diseño

| Decisión de diseño | Seguida | Evidencia |
|---|---|---|
| Gate único `X-Admin-Key` con comparación constante | ✅ | `AuthGate.php` + tests. |
| No exigir `admin_api_key` para endpoints públicos | ✅ | Health no carga config; rutas públicas cargan config existente; gate admin decide auth admin. |
| No devolver token completo | ✅ | DTO de emisión devuelve `tokenPrefix`; harness confirmó ausencia de token/admin key/DNI crudos en respuesta. |
| Servicio separado del front controller | ✅ | `AdminCertificateService.php` concentra SQL y reglas; `index.php` rutea. |
| Auditoría best-effort | ✅ | `safeAudit()` no bloquea operación; harness confirmó entradas seguras. |
| Sin migraciones nuevas | ✅ | Se reutiliza `001_certificados_qr.sql`. |

## Issues encontrados

### CRITICAL

Ninguno.

### WARNING

- `tasks.md` conserva `4.3` sin marcar porque la verificación pública del token recién emitido no es ejecutable sin exponer el token completo. La evidencia alternativa segura es `activeTokens=1` en DB + verificación pública OK del seed + revocación pública `404`.
- `tasks.md` conserva `5.2` y `5.4` pendientes de `sdd-archive`, no de implementación.
- El diff real excede el presupuesto preferido de 400 líneas si se cuentan archivos nuevos y artefactos SDD; el usuario aprobó excepción de tamaño.

### SUGGESTION

- Durante `sdd-archive`, ajustar el wording de specs/tasks para separar explícitamente “token activo persistido” de “entrega/verificación pública de token recién emitido”, que depende del ciclo de reenvío/entrega.

## Privacidad y rutas prohibidas

- No se leyó ni modificó material privado.
- No se usaron dumps, logs, ZIPs, `.env`, credenciales reales, configuración real ni DB real.
- La config de demo se creó bajo `/tmp/opencode`, solo con variables de entorno ficticias, y se eliminó al finalizar.
- No se imprimieron DNI completo, token completo, admin key, SQL con valores reales ni secretos.
- No se tocaron Angular, migraciones, dependencias, commits, push, merge ni rebase.

## Verdict

**PASS WITH WARNINGS** — el slice backend mínimo está verificado con evidencia runtime real en Docker PHP/MariaDB y mantiene las restricciones de privacidad. Las advertencias restantes son de trazabilidad/archive y de la limitación intencional de entrega de token.
