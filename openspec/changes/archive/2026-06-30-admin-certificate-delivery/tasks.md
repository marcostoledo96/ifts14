# Tasks: M4-02 admin-certificate-delivery

## Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
800-line budget risk: Low

~700–830 changed lines (code ~470, composer.lock ~250, docs ~80). `single-pr-default`.

## Phase 1: Foundation

- [x] 1.1 Add `phpmailer/phpmailer:^6.9` (PHP 8.4) to `apps/backend-php/composer.json` alongside `tecnickcom/tcpdf:^6.8`.
- [x] 1.2 Regenerate `apps/backend-php/composer.lock` via Docker PHP 8.4 (`composer install --no-dev --no-interaction`) and commit it.
- [x] 1.3 Add `!apps/backend-php/composer.lock` exception to root `.gitignore`; `vendor/` stays ignored.
- [x] 1.4 Add `Config::requireDeliveryConfig()`: normalize `delivery_transport` to `stub|smtp`; assert SMTP keys when mode is `smtp`.
- [x] 1.5 Add fictitious `delivery_transport => 'stub'` + SMTP key placeholders to `apps/backend-php/config/certificados-config.example.php`.

## Phase 2: Transport Abstraction

- [x] 2.1 Create `src/EmailDeliveryTransport.php` with `assertConfigured(): void` + `sendValidationLink(string $recipient, string $validationUrl, array $context = []): void`.
- [x] 2.2 Create `src/StubEmailDeliveryTransport.php` whose `assertConfigured()` throws `RuntimeException('DELIVERY_NOT_CONFIGURED')`.
- [x] 2.3 Create `src/SmtpEmailDeliveryTransport.php` wrapping PHPMailer (`isSMTP`, `SMTPAuth`, host/port/user/pass/secure, `setFrom`+name, `CharSet=utf-8`, body = URL + institutional copy; never log token/credentials).
- [x] 2.4 Create `src/EmailDeliveryTransportFactory.php` returning stub or smtp from `Config::requireDeliveryConfig()`.

## Phase 3: Service Layer

- [x] 3.1 Add `AdminCertificateService::reenviar(int|string $id, string $recipient, ?EmailDeliveryTransport $transport = null): array`: validate id+email, open PDO tx, lock cert, revoke active token, insert new token (hash+prefix), call transport inside tx.
- [x] 3.2 Raise `AdminCertificateException(503, 'DELIVERY_NOT_CONFIGURED')` before opening tx if transport null or `assertConfigured()` throws; rollback + audit `reenvio/error` on PHPMailer failure.
- [x] 3.3 Add `maskEmail(string $email): string` (first char + `***` + `@domain`) for `destinatarioEnmascarado` in audit and DTO.
- [x] 3.4 Return DTO `{ certificadoId, enviadoEn, destinatarioEnmascarado }`; never include full token/email/credentials in return value or `safeAudit('reenvio', …)`.

## Phase 4: HTTP Wiring

- [x] 4.1 In `index.php` add `require_once` for transport files and a `preg_match('#^/admin/certificados/([^/]+)/reenviar$#', $path)` branch enforcing POST/JSON/`X-Admin-Key`/id filter, dispatching via the factory.
- [x] 4.2 Map service errors to envelopes 401/400/404/503/500; never leak token/SMTP/DNI.

## Phase 5: Tests (Procedural PHP + Docker Lint)

- [x] 5.1 Create `tests/EmailDeliveryServiceTest.php`: stub throws `DELIVERY_NOT_CONFIGURED`; smtp factory requires smtp keys; `maskEmail` returns masked form; DTO has no token/email/credentials; `safeAudit` `reenvio` payload carries only `destinatario_enmascarado`.
- [x] 5.2 Extend `tests/HttpContractTest.php` with reenviar cases: 401, 415, 400 id no numérico, 400 JSON malformado, 405, 503 stub, 503 smtp incompleto.
- [x] 5.3 Run `bash scripts/php-docker-lint.sh` and `bash scripts/php-docker-modules-check.sh`; MUST exit 0.

## Phase 6: Docs / Archive Prep

- [x] 6.1 Update `docs/backend/01-contrato-api-certificados.md`: add `POST /admin/certificados/{id}/reenviar`, DTO 200, errors 401/404/503, "no token en respuesta".
- [x] 6.2 Update `docs/deploy/00-cpanel-certificados.md`: add SMTP/Composer section (external vars, `vendor/` ignored + `composer.lock` versioned, rollback to `delivery_transport => 'stub'`).
- [x] 6.3 Update `apps/backend-php/README.md`: delivery config block, `composer.lock` regen command, factory reference.
- [x] 6.4 Update `docs/00-indice-general.md` only if delivery deserves a new entry; otherwise link to docs/backend + docs/deploy.

## Traceability

`EmailDeliveryServiceTest.php`: reenvío exitoso, rotación, transporte no configurado, token solo en email, auditoría sin token, modos stub/SMTP, email solo enlace, sin Composer/SMTP. `HttpContractTest.php`: 401, 404, 503 stub / 503 smtp incompleto, 415/400/405. `backend-contrato-api-certificados` → 4.1, 4.2, 6.1; `backend-modelo-datos-certificados` → 3.1, 3.3, 3.4. SMTP-confirmado + rollback → documental (1.1/1.2/2.3 y 1.4/1.5/6.2); smoke `smtp` fuera de este ciclo.
