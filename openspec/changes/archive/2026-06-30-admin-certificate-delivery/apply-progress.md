# Apply Progress — admin-certificate-delivery

**Change**: admin-certificate-delivery
**Branch**: backend/admin-certificate-delivery
**Mode**: Standard (strict_tdd: false, TDD aplicado donde hubo implementación)
**Started**: 2026-06-30

## Resumen ejecutivo

Implementación completa del reenvío administrativo de certificados por email con enlace público de validación, rotación de token y transporte configurable `stub|smtp` (PHPMailer). 22/22 tasks completadas. Lint Docker exit 0, módulos PHP OK, 5 tests procedurales OK (incluido nuevo `EmailDeliveryServiceTest.php` y casos de reenvío en `HttpContractTest.php`).

## Completed Tasks

### Phase 1: Foundation
- [x] 1.1 `phpmailer/phpmailer:^6.9` agregado a `composer.json` (junto a `tecnickcom/tcpdf:^6.8`).
- [x] 1.2 `composer.lock` regenerado via `composer:2` Docker: phpmailer v6.12.0 + tcpdf 6.11.3.
- [x] 1.3 Excepción `!apps/backend-php/composer.lock` en `.gitignore`; `vendor/` sigue ignorado.
- [x] 1.4 `Config::requireDeliveryConfig()`: normaliza `delivery_transport` a `stub|smtp`, exige SMTP keys en `smtp`.
- [x] 1.5 `certificados-config.example.php` con `delivery_transport => 'stub'` + placeholders SMTP ficticios.

### Phase 2: Transport Abstraction
- [x] 2.1 `src/EmailDeliveryTransport.php` (interfaz `assertConfigured()` + `sendValidationLink()`).
- [x] 2.2 `src/StubEmailDeliveryTransport.php` (siempre `DELIVERY_NOT_CONFIGURED`).
- [x] 2.3 `src/SmtpEmailDeliveryTransport.php` (PHPMailer, CharSet utf-8, sin logs de token/credenciales, carga diferida de vendor).
- [x] 2.4 `src/EmailDeliveryTransportFactory.php` (selecciona stub|smtp desde config).

### Phase 3: Service Layer
- [x] 3.1 `AdminCertificateService::reenviar()`: valida id+email, PDO tx, `FOR UPDATE` lock cert, revoca token activo, inserta token nuevo (hash+prefix), envío dentro de tx.
- [x] 3.2 `503 DELIVERY_NOT_CONFIGURED` antes de abrir tx (vía `assertConfigured()`); rollback + audit `reenvio/error` en fallo PHPMailer.
- [x] 3.3 `maskEmail()`: primer char + `***` + último char + `@dominio`.
- [x] 3.4 DTO `{ certificadoId, enviadoEn, destinatarioEnmascarado }`; sin token/email/credenciales en return ni `safeAudit('reenvio')`.

### Phase 4: HTTP Wiring
- [x] 4.1 Ruta `POST /admin/certificados/{id}/reenviar` en `index.php` con `require_once` de transportes, regex `[^/]+`, POST/JSON/`X-Admin-Key`/id filter, factory.
- [x] 4.2 Errores mapeados a envelopes 401/400/404/405/415/503/500; sin leak de token/SMTP/DNI.

### Phase 5: Tests
- [x] 5.1 `tests/EmailDeliveryServiceTest.php`: stub lanza `DELIVERY_NOT_CONFIGURED`; factory stub|smtp; smtp exige keys; `maskEmail` correcto; DTO sin token/email; `requireDeliveryConfig` normaliza y exige.
- [x] 5.2 `tests/HttpContractTest.php` extendido: 401, 415, 400 id no numérico, 400 JSON malformado, 405, 503 stub, 503 smtp incompleto (segundo config + segundo servidor).
- [x] 5.3 Lint Docker exit 0 (20/20 archivos PHP sin errores); módulos `pdo_mysql, openssl, mbstring, curl, zip, xml` OK.

### Phase 6: Docs
- [x] 6.1 `docs/backend/01-contrato-api-certificados.md`: endpoint, DTO 200, errores 401/404/503, "no token en respuesta", `DELIVERY_NOT_CONFIGURED` en tabla de errores.
- [x] 6.2 `docs/deploy/00-cpanel-certificados.md`: sección Entrega por email (Composer, SMTP externa, rollback a `stub`).
- [x] 6.3 `apps/backend-php/README.md`: bloque de config de entrega, comando regen `composer.lock`, factory reference.
- [x] 6.4 `docs/00-indice-general.md`: sin entrada nueva (ya referencia docs/backend + docs/deploy actualizadas).

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `apps/backend-php/composer.json` | Modified | Agregado `phpmailer/phpmailer:^6.9`. |
| `apps/backend-php/composer.lock` | Modified | Regenerado: phpmailer v6.12.0 + tcpdf 6.11.3. |
| `.gitignore` | Modified | Excepción `!apps/backend-php/composer.lock`. |
| `apps/backend-php/src/Config.php` | Modified | `requireDeliveryConfig()`. |
| `apps/backend-php/config/certificados-config.example.php` | Modified | `delivery_transport => 'stub'` + placeholders SMTP. |
| `apps/backend-php/src/EmailDeliveryTransport.php` | Created | Interfaz del adaptador. |
| `apps/backend-php/src/StubEmailDeliveryTransport.php` | Created | Modo stub (503). |
| `apps/backend-php/src/SmtpEmailDeliveryTransport.php` | Created | Modo SMTP con PHPMailer. |
| `apps/backend-php/src/EmailDeliveryTransportFactory.php` | Created | Factory stub\|smtp. |
| `apps/backend-php/src/AdminCertificateService.php` | Modified | `reenviar()`, `maskEmail()`, `safeAudit` con `detalle_seguro` para reenvio. |
| `apps/backend-php/index.php` | Modified | Ruta reenviar + require_once transportes + validación id. |
| `apps/backend-php/tests/EmailDeliveryServiceTest.php` | Created | Test procedural de entrega. |
| `apps/backend-php/tests/HttpContractTest.php` | Modified | Casos reenvío 401/415/400/405/503 stub/503 smtp incompleto. |
| `docs/backend/01-contrato-api-certificados.md` | Modified | Endpoint reenvío, DTO, errores. |
| `docs/deploy/00-cpanel-certificados.md` | Modified | Sección SMTP/Composer + rollback. |
| `apps/backend-php/README.md` | Modified | Config de entrega + composer.lock regen. |

## Comandos ejecutados y resultados

| Comando | Resultado |
|---|---|
| `docker run --rm -v ... composer:2 composer update --no-dev --no-interaction` | Lock regenerado: phpmailer v6.12.0 instalado. |
| `docker run --rm ifts14-php84 find apps/backend-php -name '*.php' -not -path '*/vendor/*' -exec php -l {} +` | 20/20 sin errores (exit 0). |
| `docker run --rm ifts14-php84 php tests/AdminCertificateServiceTest.php` | OK (exit 0). |
| `docker run --rm ifts14-php84 php tests/EmailDeliveryServiceTest.php` | OK (exit 0). |
| `docker run --rm ifts14-php84 php tests/HttpContractTest.php` | OK HttpContractTest (exit 0). |
| `docker run --rm ifts14-php84 php tests/AuthGateTest.php` | OK (exit 0). |
| `docker run --rm ifts14-php84 php tests/PdfResilienceTest.php` | OK (exit 0). |
| Módulos PHP: `pdo_mysql, openssl, mbstring, curl, zip, xml` | Todos OK. |

## Escenarios cubiertos

- Reenvío exitoso con transporte fake (DTO sin token/email; rotación; `maskEmail`).
- Stub lanza `DELIVERY_NOT_CONFIGURED` antes de abrir tx.
- SMTP sin credenciales lanza `DELIVERY_NOT_CONFIGURED`.
- Factory selecciona stub\|smtp; rechaza modo inválido.
- `maskEmail`: `persona@example.edu.ar` -> `p***a@example.edu.ar`.
- `Config::requireDeliveryConfig`: normaliza `STUB`/`TLS`/puerto string; exige smtp keys.
- HTTP: 401, 415, 400 id no numérico, 400 JSON malformado, 405, 503 stub, 503 smtp incompleto.
- Respuestas 503 no filtran token ni email completo.

## Escenarios NO cubiertos (diferidos a verificación con MariaDB real)

- Reenvío 200 con transporte SMTP real (requiere credenciales SMTP válidas y MariaDB con certificado vigente).
- Rotación real sobre `cert_tokens_verificacion` (requiere MariaDB).
- Auditoría real en `cert_eventos_auditoria` con `detalle_seguro` (requiere MariaDB).
- 404 `CERTIFICATE_NOT_FOUND` en runtime (requiere MariaDB con certificado inexistente/no vigente).

## Deviations from Design

- La regex de ruta se cambió de `\d+` a `[^/]+` con validación `filter_var` interna para responder `400 VALIDATION_ERROR` en id no numérico, consistente con el endpoint PDF. El design original usaba `\d+` (que mandaba ids no numéricos a 404); el contrato spec pide `400` para id no numérico, así que esta desviación alinea con la spec.
- El handler HTTP valida `transport->assertConfigured()` antes de instanciar `AdminCertificateService`/PDO para garantizar 503 sin abrir conexión a base (defensa en profundidad); el servicio también valida internamente.

## Issues Found

Ninguno bloqueante. El `Notice` de `file_get_contents` en HttpContractTest es inofensivo (request sin Content-Type al caso 415, esperado).

## Workload / PR Boundary

- Mode: single PR (size:exception aceptado por mantenedor; diff ~700-830 líneas incluyendo composer.lock ~250).
- Current work unit: implementación completa del cambio admin-certificate-delivery.
- Boundary: desde composer.json hasta docs.
- Estimated review budget: dentro de los 800 líneas con size:exception por composer.lock.

## Corrección post-verify FAIL (2026-06-30, apply continuation)

Verify reportó FAIL por escenarios runtime sin cobertura y bypass de config SMTP. Esta pasada aplica los fixes mínimos sin tocar el alcance ni la seguridad.

### Fixes aplicados

1. **SMTP config bypass (`apps/backend-php/index.php`)**: el handler del reenvío ya no traga la excepción de `Config::requireDeliveryConfig()`. Ahora responde `503 DELIVERY_NOT_CONFIGURED` inmediato y hace `return`, evitando que una config SMTP inválida llegue sin normalizar al factory/transporte.
2. **SMTP hardening (`apps/backend-php/src/SmtpEmailDeliveryTransport.php`)**: `assertConfigured()` ahora valida `smtp_port` (int, 1-65535). Antes pasaba sin puerto si la config no estaba normalizada.
3. **Test runtime (`apps/backend-php/tests/ResendFlowTest.php`)**: nuevo test procedural con fake PDO en memoria + `CapturingTransport`. Cubre:
   - 200 exitoso: rotación (token previo revocado, nuevo activo), auditoría `reenvio/ok` con `destinatarioEnmascarado` y sin token, DTO sin token/email completo.
   - 404 `CERTIFICATE_NOT_FOUND` con certificado inexistente (autorizado) + auditoría `reenvio/rechazado`.
   - 404 con certificado no vigente (revocado).
   - Email body (`SmtpEmailDeliveryTransport::buildBody` via reflection): solo el enlace `/validar/{token}`, sin adjuntos, token aparece una sola vez.
   - Privacidad: token del enlace no coincide con prefijo persistido; no aparece en DTO ni auditoría.
   - SMTP hardening: `assertConfigured` rechaza `smtp_port` ausente y fuera de rango; acepta config completa.

### Comandos ejecutados (corrección)

| Comando | Resultado |
|---|---|
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php -l tests/ResendFlowTest.php` | Sin errores (exit 0). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php tests/ResendFlowTest.php` | `OK ResendFlowTest` (exit 0). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php -l index.php` | Sin errores (exit 0). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php -l src/SmtpEmailDeliveryTransport.php` | Sin errores (exit 0). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php tests/EmailDeliveryServiceTest.php` | `OK EmailDeliveryServiceTest` (exit 0). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php tests/AdminCertificateServiceTest.php` | `OK AdminCertificateServiceTest` (exit 0). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php tests/HttpContractTest.php` | `OK HttpContractTest` (exit 0; Notice esperado caso 415). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php tests/AuthGateTest.php` | `OK AuthGateTest` (exit 0). |
| `docker run --rm -v .../apps/backend-php:/app:ro ifts14-php84 php tests/PdfResilienceTest.php` | `OK PdfResilienceTest` (exit 0). |
| `git status --short` sobre paths privados/secretos | Sin cambios en material_privado, .env, public_html, cPanel, vendor. |

### Escenarios ahora cubiertos (runtime)

- Reenvío 200 con transporte fake: rotación real, DTO seguro, auditoría segura.
- 404 `CERTIFICATE_NOT_FOUND` (inexistente y no vigente) con auditoría `rechazado`.
- Email body: enlace único, sin adjuntos, token una sola vez.
- Privacidad del token: no en DTO, no en auditoría, no en body fuera del enlace.
- SMTP hardening: `assertConfigured` rechaza puerto inválido/ausente.
- SMTP config bypass: `index.php` responde 503 inmediato si `requireDeliveryConfig` falla.

### Escenarios NO cubiertos (diferidos)

- Reenvío 200 con SMTP real (requiere credenciales SMTP válidas + MariaDB real; el flujo positivo está cubierto con fake).
- Docker scripts con `sudo`: note/report only (warning de verify); no se modificaron scripts.

### Files Changed (corrección)

| File | Action | What Was Done |
|------|--------|---------------|
| `apps/backend-php/index.php` | Modified | Handler reenvío: `requireDeliveryConfig` fallido ahora responde 503 y return (no traga excepción). |
| `apps/backend-php/src/SmtpEmailDeliveryTransport.php` | Modified | `assertConfigured()` valida `smtp_port` (int 1-65535). |
| `apps/backend-php/tests/ResendFlowTest.php` | Created | Test runtime con fake PDO: 200/rotación/auditoría/404/email body/privacidad/SMTP hardening. |

## Status

22/22 tasks complete + corrección post-verify. Ready for re-verify.