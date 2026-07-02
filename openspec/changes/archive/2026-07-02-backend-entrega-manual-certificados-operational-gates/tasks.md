# Tasks: backend-entrega-manual-certificados-operational-gates

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 60–180 (docs + optional lock) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr-default |
| Chain strategy | size-exception (under 800) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

Work unit: 1 PR on `backend/entrega-manual-operational-gates` — close 4 gates. Edits: docs + `composer.lock` only; never `vendor/`.

## Phase 1: Static verification (read-only)

- [x] 1.1 `composer validate --strict`; OK.
- [x] 1.2 `git grep -niE 'phpmailer|smtp|/reenviar' apps/ database/ docs/ openspec/`; executed. Broad historical/absence-note hits remain; active backend outside tests and Composer manifests have no PHPMailer hit.
- [x] 1.3 Re-read `database/migrations/002_token_cifrado_entrega_manual.sql`; confirm `ADD COLUMN token_cifrado VARBINARY(512) NULL` + rollback.
- [x] 1.4 `php -l apps/backend-php/index.php apps/backend-php/src/*.php`; OK.
- [x] 1.5 `git status --short`; executed. Actual status includes this apply batch docs/lock changes plus SDD folder untracked.

## Phase 2: Composer lock refresh (only if 1.1 drifts)

- [x] 2.1 If drift: `composer update --lock` in `apps/backend-php/`; never `install`/`update`.
- [x] 2.2 `git diff apps/backend-php/composer.lock`; content-hash changed.
- [x] 2.3 Confirm PHPMailer absent from `composer.json` and `composer.lock`.
- [x] 2.4 Document `vendor/` regeneration path in `docs/deploy/00-cpanel-certificados.md`; never version.

## Phase 3: DB gate (operator if no approved env)

- [x] 3.1 Detect DB access (ask Marcos/operator). If NONE, skip 3.2/3.3/3.5 → 3.4.
- [ ] 3.2 [operator] Apply `database/migrations/002_token_cifrado_entrega_manual.sql` after backup approved.
- [ ] 3.3 [operator] Verify: `SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'token_cifrado';`; record evidence, no values.
- [x] 3.4 [gate] Append precondiciones + comandos + responsable to `docs/database/01-modelo-datos-certificados.md` if 3.1 unavailable.
- [ ] 3.5 [operator] `token_encryption_key`: confirm decode → 32 bytes; never log value; presence-only.

## Phase 4: HTTP smoke (operator if no approved env)

- [x] 4.1 Detect staging/local endpoint. If NONE, skip 4.2/4.3 → 4.4.
- [ ] 4.2 [operator] `curl -sS -H "X-Admin-Key: <placeholder>" https://<host>/certificados/api/admin/certificados/<id_recuperable>/entrega-manual`; expect 200; redact.
- [ ] 4.3 [operator] Repeat with `<id_legacy>`; expect 409 TOKEN_NOT_RECOVERABLE; redact.
- [x] 4.4 [gate] Append precondiciones + comandos + responsable to `docs/backend/00-php84-api.md` if 4.1 unavailable.

## Phase 5: Docs updates (minimal, editorial)

- [x] 5.1 `docs/deploy/00-cpanel-certificados.md`: append "Gates D0 previos a deploy" (Composer/vendor/DB/smoke/rollback + 002).
- [x] 5.2 `docs/deploy/01-staging-cpanel-certificados.md`: append staging gates mirroring 5.1.
- [x] 5.3 `docs/backend/00-php84-api.md`: note state of `/entrega-manual` (verified or gated).
- [x] 5.4 `docs/backend/01-contrato-api-certificados.md`: if needed — PHPMailer/SMTP absence note.
- [x] 5.5 `docs/database/01-modelo-datos-certificados.md`: record 002 status (from 3.3/3.4).
- [x] 5.6 `openspec/specs/*/spec.md`: `## Purpose` drift cleanup, ≤1 line each.

## Phase 6: Verify & handoff

- [x] 6.1 `php -l` on touched PHP files; cross-check 4 gates (Composer, SQL, DB/HTTP, key).
- [x] 6.2 `git status --short` and `git diff --stat`; expect small docs + optional lock diff; confirm no `vendor/`, `public_html/`, dumps, logs, secrets, material privado touched.
- [x] 6.3 Hand off to `sdd-verify`; then `sdd-archive` (out of scope).

## Hard rules

- No `git add`/`commit`/`push`/`merge`/`rebase`; operator-owned.
- No read/write `vendor/`, `public_html/`, secrets, dumps, logs, material privado.
- No new scripts. Gates sin env aprobado → gate exacto, nunca evidencia simulada.
