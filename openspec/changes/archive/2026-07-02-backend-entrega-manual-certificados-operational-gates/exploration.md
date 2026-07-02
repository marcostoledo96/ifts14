## Exploration: backend-entrega-manual-certificados-operational-gates

### Current State

- `backend-entrega-manual-certificados` was merged into `main` via PR #21 (commit `6386153`).
- The read-only exploration was first created under `openspec/changes/marcos-siguiente-ciclo-sdd/` before the branch/change rename. Target branch: `backend/entrega-manual-operational-gates`.
- The merged cycle replaced automatic email resend with manual delivery (`GET /admin/certificados/{id}/entrega-manual`), introduced `token_cifrado` AES-256-GCM, removed PHPMailer, and added migration `002_token_cifrado_entrega_manual.sql`.
- The archive report closed the SDD cycle as `PASS WITH WARNINGS` with two operational tasks intentionally left open:
  - `1.2` Migration `002` not applied against a real DB.
  - `3.3b` HTTP `200`/`409` DB-backed smoke for `/entrega-manual` not executed.
- Additionally, `composer.lock` content-hash is stale after PHPMailer removal, and `vendor/` may contain PHPMailer remnants.
- The M4 roadmap lists feature cycles after manual delivery, but M4-06 `email-reenvio-token-permanente` is obsolete and replaced by manual delivery.

### Affected Areas

- `database/migrations/002_token_cifrado_entrega_manual.sql` — needs application against staging/production DB when access is available.
- `apps/backend-php/composer.json` / `composer.lock` — lock hash needs regeneration after PHPMailer removal.
- `apps/backend-php/vendor/` — non-versioned, must be regenerated and validated operationally.
- `apps/backend-php/index.php` — `GET /admin/certificados/{id}/entrega-manual` needs DB-backed smoke.
- `apps/backend-php/src/AdminCertificateService.php` — `entregaManual()` needs DB-backed validation.
- `docs/deploy/00-cpanel-certificados.md`, `docs/deploy/01-staging-cpanel-certificados.md` — deploy gates to update after composer/vendor/DB verification.
- `openspec/specs/admin-certificate-delivery/spec.md` and related specs — optional `## Purpose` drift cleanup.

### Recommendation

Run an operational gate closure cycle before M4-02 feature work.

- **Change name**: `backend-entrega-manual-certificados-operational-gates`
- **Branch**: `backend/entrega-manual-operational-gates`
- **Type**: DB migration + deploy verification gates, not new feature work.
- **Why this is next**: the previous archive explicitly recommends applying migration `002`, updating `composer.lock`, regenerating/validating `vendor/`, and running DB-backed smoke before moving on.
- **Dependencies/gates from previous cycle**:
  - Apply `database/migrations/002_token_cifrado_entrega_manual.sql` to real DB and verify with `DESCRIBE cert_tokens_verificacion`.
  - Run safe Composer lock refresh after PHPMailer removal.
  - Regenerate/clean `vendor/` operationally so no PHPMailer remnants remain; never version `vendor/`.
  - Run DB-backed HTTP smoke for `GET /admin/certificados/{id}/entrega-manual`, confirming `200` success and `409 TOKEN_NOT_RECOVERABLE` for old certificates.
  - Confirm `token_encryption_key` (32 bytes, external config) exists in target environment without reading real secrets.
- **After this cycle**: next roadmap feature is M4-02 `database-cursos-alumnos-asistencias`.

### Risks

- DB credentials or approved access unavailable → migration/smoke cannot be executed; cycle must document the exact remaining gate.
- `composer update --lock` may change lock metadata unexpectedly; review diff narrowly.
- Regenerating `vendor/` may surface differences between local Docker and cPanel PHP.
- Old certificates without `token_cifrado` must remain `409`, not auto-regenerated.
- Spec `## Purpose` drift can confuse readers, but cleanup must stay editorial and small.

### Ready for Proposal

Yes — frame it as operational gate closure, not a feature cycle. If DB/env access is unavailable, the cycle can still produce a verified gate checklist and exact commands for Marcos.
