# Diseño: entrega manual de certificados

## Enfoque técnico

Reemplazar el reenvío automático por un flujo de lectura administrativa: la emisión guarda el token recuperable cifrado, devuelve link/PDF, y Bedelía entrega por canal externo. Se elimina el código activo de email. Se conservan `Response`, `Config`, `AuthGate`, `Database`, `CertificatePdfService` y el front controller procedural existente.

## Decisiones de arquitectura

| Tema | Opción elegida | Alternativa descartada | Fundamento |
|---|---|---|---|
| `/reenviar` | Remover la rama del router; responderá `404 NOT_FOUND`. | Mantener handler `410 Gone`. | Menor superficie: evita rama heredada, no exige body JSON ni SMTP, y cumple “ruta inexistente o método no permitido”. |
| Entrega manual | `GET /admin/certificados/{id}/entrega-manual` en `index.php` + método `entregaManual()` en `AdminCertificateService`. | Nuevo controlador/tabla `cert_entregas`. | Sigue patrón actual y el spec exige endpoint read-only sin persistencia de entrega. |
| Token recuperable | `token_hash`, `token_prefijo`, `token_cifrado`. | URL completa cifrada o token plano. | El hash resuelve lookup público; cifrar el token permite reconstruir URL si cambia `public_base_url`; texto plano está prohibido. |
| Cifrado | `openssl_encrypt()` AES-256-GCM con key externa base64/base64url que decodifique exactamente 32 bytes. `token_cifrado` guarda texto seguro `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>` con IV de 12 bytes y tag GCM de 16 bytes. | Envelope binario con delimitadores o token plano. | Evita delimitadores inseguros en binario, no agrega dependencia y permite fallar cerrado si falta OpenSSL, key, formato, IV/tag o descifrado. |
| Admin en navegador | No habrá llamadas Angular directas con `X-Admin-Key`. Si existe UI admin MVP, se protege con cPanel Basic Auth o proxy/sesión PHP `HttpOnly`; en este ciclo backend-only, el wiring Angular queda fuera de alcance. | Guardar la key en bundle, variables Angular, `localStorage`, `sessionStorage` o cookies legibles por JS. | `X-Admin-Key` es server-to-server; exponerlo en navegador equivale a publicar la credencial. |
| Migración | Crear `database/migrations/002_token_cifrado_entrega_manual.sql`. | Editar `001_certificados_qr.sql`. | `001` es migración controlada y pudo estar aplicada; `002` es auditable y reversible. |
| Dependencias | Quitar PHPMailer si no queda uso activo; conservar TCPDF. | Dejar PHPMailer “por si acaso”. | Menos superficie y coincide con MVP sin SMTP. |

## Flujo de datos

```txt
POST /admin/certificados
  -> AuthGate -> Config PDF+token key válida -> AdminCertificateService::emitir()
  -> token random -> hash + prefijo + AES-GCM envelope -> PDF QR con publicValidationUrl
  -> 201 { publicValidationUrl, pdfDownloadUrl, tokenPrefix }

GET /admin/certificados/{id}/entrega-manual
  -> AuthGate -> Config PDF+token key -> AdminCertificateService::entregaManual()
  -> SELECT certificado vigente + token activo cifrado -> validar envelope y decrypt en memoria
  -> 200 { certificadoId, publicValidationUrl, pdfDownloadUrl, tokenPrefix }
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificar | Quitar `require_once` email, eliminar `/reenviar`, agregar `GET /entrega-manual`, validar `id`, auth y config. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificar | Persistir `token_cifrado`, devolver `publicValidationUrl`, agregar `entregaManual()`, borrar `reenviar()`/`maskEmail()`. |
| `apps/backend-php/src/Config.php` | Modificar | Eliminar `requireDeliveryConfig()`. Agregar normalización de `public_base_url`, `certificate_storage_path`, `token_pepper`, `token_encryption_key`, `admin_api_key`. |
| `apps/backend-php/src/EmailDeliveryTransport*.php`, `Stub*`, `Smtp*`, `EmailDeliveryTransportFactory.php` | Borrar | Sin email activo en MVP. |
| `apps/backend-php/composer.json`, `composer.lock` | Modificar | Quitar `phpmailer/phpmailer`; mantener `tecnickcom/tcpdf`. |
| `apps/backend-php/config/certificados-config.example.php` | Modificar | Quitar SMTP; agregar `token_encryption_key`, `admin_api_key`, `app_salt`, rate-limit paths. |
| `database/migrations/002_token_cifrado_entrega_manual.sql` | Crear | `ALTER TABLE cert_tokens_verificacion ADD token_cifrado VARBINARY(512) NULL AFTER token_prefijo;` rollback con `DROP COLUMN`. |
| `apps/backend-php/tests/*` | Modificar/Borrar | Reemplazar tests de email/reenvío por emisión/entrega manual/cifrado/contrato HTTP. |
| `docs/backend/*`, `docs/database/*`, `docs/deploy/*`, `MATIAS_PROMPTS_SDD_FASE2.md`, `muestra_pagina/MANIFIESTO_V0.md` | Modificar en archive | Documentar entrega manual, quitar SMTP/PHPMailer/reenvío. |

## Contratos

`POST /certificados/api/admin/certificados` responde `201` con el DTO actual más:

```json
{"publicValidationUrl":"https://.../certificados/validar/{token}","pdfDownloadUrl":"https://.../api/admin/certificados/{id}/pdf","tokenPrefix":"abc123..."}
```

`GET /certificados/api/admin/certificados/{id}/entrega-manual` responde `200` con `certificadoId`, `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`. Si no hay `token_cifrado`, el envelope no cumple `v1.<iv>.<tag>.<ciphertext>`, la key no decodifica a 32 bytes o el descifrado falla: `409 TOKEN_NOT_RECOVERABLE`, sin regenerar ni auditar entrega. Logs, auditoría y errores nunca incluyen token completo, key, IV, tag ni ciphertext.

## Pruebas y validación

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit/script | cifrar/descifrar envelope `v1.<iv>.<tag>.<ciphertext>`, key inválida, IV/tag inválidos, DTO sin token separado/DNI | Scripts PHP procedurales existentes. |
| Servicio | emisión persiste `token_cifrado`; entrega manual no escribe ni rota | Fake PDO adaptado desde tests actuales. |
| HTTP | `GET /entrega-manual` 401/404/409/200; `/reenviar` 404 | `HttpContractTest.php` con servidor embebido. |
| Frontend/seguridad | `X-Admin-Key` ausente de bundle Angular y storage del navegador | Check documental/CI si se toca Angular; para backend-only, validar que no hay wiring Angular admin en alcance. |
| Sintaxis | PHP 8.4 | `scripts/php-docker-lint.sh` o `php -l` sobre archivos tocados. |

## Migración, rollback y riesgos

Aplicar `002` antes del código que exige `token_cifrado`. Los certificados previos quedarán limitados: podrán descargar PDF existente si lo tienen, pero no reconstruir link. Rollback: retirar endpoint/código y dejar la columna sin uso; no borrar datos cifrados ni reactivar SMTP sin nuevo SDD. Riesgos principales: pérdida de key, drift documental/UI con “reenviar”, compatibilidad si `composer.lock` no se regenera tras quitar PHPMailer y exposición accidental de `X-Admin-Key` si una UI futura evita Basic Auth o sesión/proxy PHP `HttpOnly`.

## Preguntas abiertas

- Ninguna bloqueante para `sdd-tasks`.
