## Exploration: backend-entrega-manual-certificados

### Current State

El backend admin actual soporta emisión, revocación, descarga PDF y **reenvío automático por email** con transporte `stub|smtp`.

- `POST /admin/certificados` emite certificado, genera PDF/QR y responde `pdfDownloadUrl`. El token solo vive en memoria durante la emisión.
- `POST /admin/certificados/{id}/reenviar` **rota el token**: revoca el activo, inserta uno nuevo y envía el enlace por email.
- Existen `EmailDeliveryTransport`, `StubEmailDeliveryTransport`, `SmtpEmailDeliveryTransport` (PHPMailer) y `EmailDeliveryTransportFactory`.
- La migración `001_certificados_qr.sql` guarda `token_hash` + `token_prefijo`, **sin `token_cifrado` ni URL cifrada**.
- Por lo tanto, **el backend no puede reconstruir el enlace público `/validar/{token}` después de emitir**: hash-only es irreversible.
- El frontend Angular tiene la pantalla pública de validación lista; las referencias de `muestra_pagina/` aún muestran botones como "Emitir y enviar" y "Reenviar certificado".

### Affected Areas

| File | Why affected |
|---|---|
| `apps/backend-php/index.php` | Route `/admin/certificados/{id}/reenviar` and `require_once` of email transports must be removed or repurposed for manual delivery. |
| `apps/backend-php/src/AdminCertificateService.php` | `emitir()` must encrypt and store the token; `reenviar()` must be removed or replaced with a manual-delivery retrieval method. |
| `apps/backend-php/src/Config.php` | `requireDeliveryConfig()` and SMTP keys become obsolete; a `token_encryption_key` validation is required. |
| `apps/backend-php/src/CertificatePdfService.php` | Keeps receiving a validation URL, but callers must be able to rebuild it from the encrypted token on demand. |
| `apps/backend-php/composer.json` / `composer.lock` | `phpmailer/phpmailer` dependency should be removed. |
| `apps/backend-php/src/EmailDeliveryTransport.php` | Interface for automatic email becomes obsolete. |
| `apps/backend-php/src/StubEmailDeliveryTransport.php` | Stub transport becomes obsolete. |
| `apps/backend-php/src/SmtpEmailDeliveryTransport.php` | SMTP/PHPMailer transport becomes obsolete. |
| `apps/backend-php/src/EmailDeliveryTransportFactory.php` | Factory becomes obsolete. |
| `database/migrations/001_certificados_qr.sql` | Migration must add `token_cifrado` (or a new `002` migration if `001` is already deployed). |
| `apps/backend-php/config/certificados-config.example.php` | Remove SMTP placeholders; add `token_encryption_key` placeholder. |
| `apps/backend-php/tests/ResendFlowTest.php` | Covers token-rotating resend; must be removed or replaced. |
| `apps/backend-php/tests/EmailDeliveryServiceTest.php` | Covers email transport; must be removed. |
| `apps/backend-php/tests/HttpContractTest.php` | Resend cases must be removed/replaced with manual-delivery cases. |
| `docs/backend/01-contrato-api-certificados.md` | Remove/replace `POST /admin/certificados/{id}/reenviar`; document manual delivery endpoint. |
| `docs/backend/00-php84-api.md` | Update pending list (no SMTP, no reenvío automatic). |
| `docs/database/01-modelo-datos-certificados.md` | Document `token_cifrado` and encryption key outside Git. |
| `docs/deploy/00-cpanel-certificados.md` | Remove SMTP/PHPMailer deployment section. |
| `openspec/specs/admin-certificate-delivery/spec.md` | Spec describes email resend; must be rewritten for manual delivery. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Update admin endpoints and DTOs. |
| `muestra_pagina/` references | "Emitir y enviar", "Enviar por email", "Reenviar certificado" labels must be interpreted as manual actions in the Angular port. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Prompt 18 "Enviar/reenviar certificación" changes scope; Matías must be notified. |

### Approaches

1. **Encrypted token + manual delivery endpoint** — Persist `token_cifrado` (AES-256-GCM) using a key outside Git; expose a new admin endpoint that returns the public validation URL and PDF download URL so Bedelía can copy/send manually.
   - Pros: Keeps the existing QR/link scheme, supports regenerating the PDF with the same QR, no plaintext token in DB.
   - Cons: Requires a new migration, an encryption key in external config, and careful handling of already-issued certificates that lack `token_cifrado`.
   - Effort: Medium

2. **Encrypted URL instead of encrypted token** — Store the full public validation URL encrypted (`url_validacion_cifrada`) at issuance time.
   - Pros: Simpler retrieval; no URL reassembly logic.
   - Cons: If `public_base_url` ever changes, stored URLs become stale; less flexible than storing the token.
   - Effort: Low

3. **Plaintext token in DB** — Add `token` column in clear text.
   - Pros: Trivial to implement and retrieve.
   - Cons: Violates project security rule "no guardar tokens públicos en texto plano"; unacceptable.
   - Effort: Low (rejected)

### Recommendation

Use **Approach 1: encrypted token + manual delivery endpoint**.

- Add `token_cifrado VARBINARY(255)` to `cert_tokens_verificacion`.
- During issuance, generate the token, compute `token_hash`, derive `token_prefijo`, and encrypt the token with a `token_encryption_key` stored outside Git.
- Remove PHPMailer from `composer.json`/`composer.lock` and delete all email transport classes/factory.
- Remove `POST /admin/certificados/{id}/reenviar`.
- Add a manual-delivery admin endpoint (e.g., `GET /admin/certificados/{id}/entrega`) that decrypts the token and returns a safe DTO with `pdfDownloadUrl` and `publicValidationUrl`; no token full value in the response.
- Update issuance response to include the public validation URL so Bedelía can copy it immediately after emitting.
- Keep QR in PDF pointing to `/validar/{token}` as today.

### Risks

- **Already-issued certificates** lack `token_cifrado`; they cannot be re-delivered manually unless the PDF already exists or a new token is generated. Decision needed: migrate only new certificates or offer a one-shot "regenerate token" action for old ones.
- **Encryption key management**: the key must be generated and kept outside Git/cPanel public paths. Losing it makes all stored tokens unrecoverable.
- **Spec drift**: `openspec/specs/admin-certificate-delivery/spec.md` currently mandates email resend; rewriting it is required before `sdd-archive`.
- **Frontend impact**: Matías prompt 18 (F5-04) assumes automatic send/resend; UI copy and flow must change to "Descargar PDF / Copiar link".
- **Test deletions**: `ResendFlowTest`, `EmailDeliveryServiceTest`, and resend HTTP cases must be removed or replaced, reducing runtime coverage until new manual-delivery tests are added.

### Ready for Proposal

**Yes**, with two blockers to resolve in `propose`:

1. Decide how to handle certificates already issued without `token_cifrado`.
2. Confirm the external encryption key strategy and naming (`TOKEN_ENCRYPTION_KEY` / `certificados-config.php` key).

The orchestrator should tell the user that this change reverses the previous `admin-certificate-delivery` automatic-email direction and requires notifying Matías that prompt 18 becomes a manual delivery flow.
