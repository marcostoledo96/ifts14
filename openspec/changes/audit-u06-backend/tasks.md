# Tasks: audit-u06-backend — Backend contrato + sesión (U6)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~80–180 (PHP + tests + docs/spec) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | PR único (`size:exception`) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | `state()` lastSeen + D-004→503 + TTL docs + PLAN §U6 | PR único (`audit/u06-backend`) | `docker run --rm -v "$PWD/apps/backend-php":/app -w /app ifts14-php84 sh -lc 'php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php'` | Smoke: GET session tras login; storage roto→503≠429; idle staging DEFER U9 | Revert `AdminSessionAuth.php`+`index.php`+tests auth+`docs/backend/00-php84-api.md`+PLAN §U6; delta en change |

**TDD**: `apply.tdd: false`. RED→GREEN liviano solo `state()` lastSeen + `allowLoginAttempt` tri-estado. TTL/429 real: con el pass. Threat matrix: N/A.

**Locks**: touch + `session_write_close` en `state()`; D-004 null→503 `SERVICE_UNAVAILABLE`≠429; TTL 14400/28800; PLAN §U6; U5 archive intacto; no keys/token; **no commit**. Envelope/400/409 DEFER salvo bug.

**Apply**: `size-exception` / single PR. Ready for **sdd-apply**.

## Phase 1: RED — Auth session + D-004

- [x] 1.1 RED `apps/backend-php/tests/AdminSessionAuthTest.php` — `state($now)` setea `lastSeen`; assert TTL 14400/28800; storage→`null`, bucket≥5→`false` [D-004]
- [x] 1.2 RED `apps/backend-php/tests/AdminAuthHttpTest.php` — GET session renueva `lastSeen`; storage→503≠429; conservar 429 real [D-009]

## Phase 2: GREEN — Core PHP

- [x] 2.1 `apps/backend-php/src/AdminSessionAuth.php` — `state()` activo: `lastSeen=$now` + `session_write_close()` (espejo `authorize`); return `$_SESSION`
- [x] 2.2 Mismo — `allowLoginAttempt(): ?bool` (true/false/null); sin fail-open; sin PII
- [x] 2.3 `apps/backend-php/index.php` — null→503 `SERVICE_UNAVAILABLE`; false→429 intacto
- [x] 2.4 GREEN — focused PHP Unit 1 pasa RED 1.1–1.2

## Phase 3: Docs + contrato

- [x] 3.1 `docs/backend/00-php84-api.md` — idle **4 h** / absolute **8 h** (14400/28800), no 30 min
- [x] 3.2 Confirmar delta `openspec/changes/audit-u06-backend/specs/admin-auth/spec.md`; main merge en archive
- [x] 3.3 Spot envelope/400/409 solo si bug claro; else DEFER

## Phase 4: PLAN + prep verify

- [x] 4.1 PLAN §U6 — check session_write_close; D-009; tests PHP (+D-004). Envelope/400/409/PII: DEFER o check si spot
- [x] 4.2 `php -l` `AdminSessionAuth.php` + `index.php` (host o `ifts14-php84`)
- [x] 4.3 Focused: `php tests/AdminSessionAuthTest.php && php tests/AdminAuthHttpTest.php` (cwd `apps/backend-php` o docker Unit 1)
- [x] 4.4 U5 archive intacto; sin keys/token; **no commit**
- [x] 4.5 `verify-report.md` → **sdd-verify**

## Verify (sdd-verify)

- [x] V.1 Focused PHP Unit 1 + `php -l` → `verify-report.md` (delta admin-auth + PLAN §U6 in-scope); **PASS** 5/5 (authorize lastSeen covered)
