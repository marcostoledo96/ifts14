# Tasks: entrega manual de certificados

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas | 600–900 (código + tests + docs + composer) |
| 800-line budget risk | Medium |
| Chained PRs recomendado | Yes |
| Suggested split | PR 1 (migración + cifrado + Config) → PR 2 (servicio + router + limpieza email) → PR 3 (tests + config example + composer + docs + prompts + archive) |
| Delivery strategy | single-pr-default |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Migración 002 + `TokenCipher` + Config | PR 1 | Base auditable; sin tocar rutas. |
| 2 | `AdminCertificateService` + router + limpieza email/PHPMailer | PR 2 | Introduce `/entrega-manual`. |
| 3 | Tests + config example + composer + docs + prompts + archive | PR 3 | Cierra ciclo y sincroniza deltas. |

## Phase 1: Foundation (migración + cifrado + Config)

- [x] 1.1 Crear `database/migrations/002_token_cifrado_entrega_manual.sql` con `ALTER TABLE cert_tokens_verificacion ADD token_cifrado VARBINARY(512) NULL AFTER token_prefijo` y rollback `DROP COLUMN`.
- [ ] 1.2 Aplicar 002 contra DB ficticia local y validar con `DESCRIBE cert_tokens_verificacion`. _(gate humano de DB, sin sudo/credenciales; queda como WARNING en archive-report; no se falsificó evidencia)_
- [x] 1.3 Crear `apps/backend-php/src/TokenCipher.php` con `encrypt`/`decrypt` AES-256-GCM; envelope `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`; IV 12 bytes, tag 16 bytes, clave 32 bytes exactos.
- [x] 1.4 En `apps/backend-php/src/Config.php`: agregar `requireTokenCipherKey()`; eliminar `requireDeliveryConfig()` y normalización SMTP (`smtp_*`, `mail_from*`).
- [x] 1.5 En `apps/backend-php/config/certificados-config.example.php`: quitar bloque SMTP; agregar `token_encryption_key` ficticio con comentario "no usar en producción".

Verificación Phase 1: `bash scripts/php-docker-lint.sh`; `bash scripts/php-docker-modules-check.sh` (módulo `openssl`).

## Phase 2: Core (servicio + router + limpieza email)

- [x] 2.1 En `AdminCertificateService::emitir()`: persistir `token_cifrado` (envelope `v1.…`) en el `INSERT` de token dentro de la transacción; añadir `publicValidationUrl` al DTO 201; fallo de cifrado → abortar sin commit.
- [x] 2.2 En `AdminCertificateService`: agregar `entregaManual(int|string $id): array` que valide id, lea certificado vigente + token activo, descifre en memoria y devuelva `{certificadoId, publicValidationUrl, pdfDownloadUrl, tokenPrefix}`; `token_cifrado` ausente/envelope inválido/clave inválida/descifrado fallido → `AdminCertificateException(409, 'TOKEN_NOT_RECOVERABLE', ...)`.
- [x] 2.3 En `AdminCertificateService`: eliminar `reenviar()`, `maskEmail()` y referencias a `EmailDeliveryTransport*`; quitar rama `reenvio` en `safeAudit()` con `// ponytail:` documentando la decisión.
- [x] 2.4 En `apps/backend-php/index.php`: eliminar `require_once` de archivos email y bloque de `/reenviar` (queda 404 por default).
- [x] 2.5 En `apps/backend-php/index.php`: agregar rama `GET /admin/certificados/{id}/entrega-manual` con `method=GET` + `requireAdmin()` + `filter_var` + `requirePdfConfig()` + `requireTokenCipherKey()`; mapear 200/400/401/404/409.
- [x] 2.6 Borrar `apps/backend-php/src/EmailDeliveryTransport.php`, `StubEmailDeliveryTransport.php`, `SmtpEmailDeliveryTransport.php`, `EmailDeliveryTransportFactory.php`.
- [x] 2.7 En `apps/backend-php/composer.json`: quitar `phpmailer/phpmailer`; mantener `tecnickcom/tcpdf` y `php: >=8.4`. Regenerar `composer.lock` solo si Composer está disponible localmente.

Verificación Phase 2: `bash scripts/php-docker-lint.sh`; `bash scripts/m3-06-smoke.sh`; smoke manual con/sin `X-Admin-Key`, id inexistente, id no numérico, método incorrecto, cert sin `token_cifrado`; `composer validate` si Composer disponible.

## Phase 3: Testing

- [x] 3.1 Crear `apps/backend-php/tests/EntregaManualTest.php` con 200/409 (sin token, envelope inválido, clave inválida, descifrado fallido)/404/401/400/405.
- [x] 3.2 Eliminar `apps/backend-php/tests/EmailDeliveryServiceTest.php` y aserciones sobre `/reenviar` en otros tests.
- [x] 3.3a `HttpContractTest.php`: casos **401/405/400/404** para `/entrega-manual` (pre-DB, cubiertos); `/reenviar` → 404 NOT_FOUND (POST y GET); mantener cobertura de `/pdf`.
- [ ] 3.3b **GATE de integración pendiente**: HTTP **200/409** DB-backed para `GET /admin/certificados/{id}/entrega-manual` contra MariaDB real. Service-level 200/409 cubierto sobre fake PDO en `EntregaManualTest.php` (escenarios 1–5); la ruta HTTP no se ejecutó contra DB viva. Diferido a `sdd-verify` / entorno con DB real. No se falsó evidencia. _(gate de entorno sin DB real; queda como WARNING en archive-report; service-level cubierto; no se falsificó evidencia)_
- [x] 3.4 Extender `AdminCertificateServiceTest.php`: asserts sobre `entregaManual` con PDO fake; `emitir` persiste `token_cifrado` con envelope válido; DTO 201 incluye `publicValidationUrl`/`tokenPrefix`.

Verificación Phase 3: ejecutar todos los `apps/backend-php/tests/*.php` (`AdminCertificateServiceTest`, `AuthGateTest`, `HttpContractTest`, `NormalizePathTest`, `PdfResilienceTest`, `EntregaManualTest`).

## Phase 4: Docs + Prompts + v0 + archive

- [x] 4.1 `docs/backend/00-php84-api.md` y `docs/backend/01-contrato-api-certificados.md`: actualizar tabla de endpoints (quitar `/reenviar`, agregar `/entrega-manual`); documentar DTO 201 emisión, DTO 200 entrega manual, error 409; retirar SMTP/PHPMailer del contrato.
- [x] 4.2 `docs/database/01-modelo-datos-certificados.md`: documentar `token_cifrado` VARBINARY(512) y migración 002.
- [x] 4.3 `docs/deploy/00-cpanel-certificados.md` y `01-staging-cpanel-certificados.md`: indicar que `token_encryption_key` se inyecta por config externa; retirar SMTP/PHPMailer de requisitos del hosting.
- [x] 4.4 `MATIAS_PROMPTS_SDD_FASE2.md`: prompt 18 → "Copiar link público / Descargar PDF / Entrega manual"; sin "reenviar" ni "enviar email".
- [x] 4.5 `muestra_pagina/MANIFIESTO_V0.md`: CTAs "Copiar link", "Descargar PDF", "Entrega manual"; sin SMTP/PHPMailer.
- [x] 4.6 Confirmar (sin commit) que no se versionaron secretos, `.env`, `material_privado_no_versionar/`, `public_html/`, `vendor/`, ni dumps SQL.
- [x] 4.7 Al cierre, ejecutar `sdd-verify` y luego `sdd-archive`: sincronizar deltas a `openspec/specs/` y mover la carpeta a `openspec/changes/archive/YYYY-MM-DD-backend-entrega-manual-certificados/`. _(archive en curso: deltas sincronizados, folder a punto de moverse, archive-report con warnings; autorizado por orquestador: "Archive SDD change after verify PASS WITH WARNINGS")_

## Reglas de operación (recordatorio)

- No commit/push/merge/rebase/stage desde el agente.
- No leer ni copiar `.env`, `credentials.json`, `secrets/**`, `material_privado_no_versionar/`, dumps, logs.
- No tocar `public_html/`, `vendor/`, ni credenciales demo de `muestra_pagina/login-form.tsx`.
- `X-Admin-Key` queda server-to-server; no exponer desde bundle Angular ni storage del navegador.
