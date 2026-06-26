# Tasks: backend-validacion-publica-certificados

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | 220-330 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Decision needed before apply | No |

## Work Unit 1 — Endpoint público de validación

- [x] 1.1 Update `apps/backend-php/src/Response.php` so `Response::json(int $status, array $data, ?string $requestId = null)` and `Response::error(int $status, string $code, string $message, ?string $requestId = null)` can reuse a caller-provided request id.
- [x] 1.2 Update `apps/backend-php/src/Config.php` to require non-empty string `token_pepper` in the external config array.
- [x] 1.3 Update `apps/backend-php/config/certificados-config.example.php` with a fictitious `token_pepper` example only; do not create `.env` or real config.
- [x] 1.4 Update `database/seeds/001_certificados_qr_demo.sql` to use a fictitious 32-128 character demo token and store `token_hash` as `UNHEX(SHA2(CONCAT(token_demo, pepper_demo), 256))`.
- [x] 1.5 Create `apps/backend-php/src/CertificateValidator.php` with token format validation, `hash('sha256', $token . $tokenPepper, true)`, PDO prepared lookup, safe DTO mapping, and best-effort audit insert.
- [x] 1.6 Ensure the validator query filters only verifiable rows: active token, `t.revocado_en IS NULL`, valid token window, certificate `vigente`, no certificate revocation, and unexpired certificate.
- [x] 1.7 Ensure invalid-format requests return `400 VALIDATION_ERROR` before lookup and are audited as `rechazado` without token hash prefix.
- [x] 1.8 Ensure missing, revoked, expired, out-of-window, and non-current certificates all return unified `404 CERTIFICATE_NOT_FOUND` without revealing cause.
- [x] 1.9 Update `apps/backend-php/index.php` to require `Config.php`, `Database.php`, and `CertificateValidator.php`, create one request id per request, and wire `GET /certificados/{token}/verificacion`.
- [x] 1.10 Update `apps/backend-php/index.php` to wire `POST /certificados/consulta` with JSON body `{ "token": "..." }`, using the same validator and DTO as GET.
- [x] 1.11 Preserve existing `GET /health`, 404, 405, and safe 500 behavior.

## Work Unit 2 — Verification and archive docs

- [x] 2.1 Run `bash scripts/php-docker-modules-check.sh`.
- [x] 2.2 Run `bash scripts/php-docker-lint.sh`.
- [x] 2.3 Run local HTTP smoke with `sudo docker run` for `/health`, invalid-format token `400`, and unavailable/no-demo-DB behavior if MariaDB is not loaded.
- [x] 2.4 If a local demo MariaDB is available without real credentials, smoke GET/POST valid token `200` and non-verifiable token `404`; otherwise record this as blocked/partial and do not use real DB.
- [x] 2.5 Verify responses do not include full token, full DNI, SQL, credentials, internal paths, or sensitive config.
- [x] 2.6 Update `docs/backend/00-php84-api.md` with implemented endpoint behavior and local verification evidence.
- [x] 2.7 Update `docs/backend/01-contrato-api-certificados.md` only if implementation clarifies contract details.
- [x] 2.8 Update `docs/database/01-modelo-datos-certificados.md` with `token_pepper`/binary seed note if needed.
- [x] 2.9 Update `docs/deploy/00-cpanel-certificados.md` with external `token_pepper` deployment requirement if needed.
- [x] 2.10 Do not modify `docs/00-indice-general.md` in this cycle unless the user explicitly clears the existing dirty-worktree overlap.

## Traceability

- Spec: valid GET/POST -> tasks 1.9, 1.10, 2.3, 2.4.
- Spec: secure hash lookup -> tasks 1.2, 1.3, 1.4, 1.5, 1.6.
- Spec: safe DTO/privacy -> tasks 1.5, 1.8, 2.5.
- Spec: audit non-blocking -> tasks 1.5, 1.7.
- Design: minimal helper/no over-layering -> task 1.5 only; no controller/repository scaffolding.
