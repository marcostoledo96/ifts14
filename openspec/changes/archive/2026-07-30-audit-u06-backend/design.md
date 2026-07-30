# Design: audit-u06-backend

## Technical Approach

Cerrar PLAN §U6 con el Approach 1 bloqueado: paridad de actividad entre `authorize` y `state`, alinear contrato documental a TTL reales (`Config::ADMIN_SESSION_*` = 14400/28800), y distinguir falla de storage de rate-limit en login (D-004 → 503 ≠ 429). Sin rediseño de API, sin FE, sin U7/U9, sin archive U5.

## Architecture Decisions

| Decisión | Opciones | Elección | Fundamento |
|----------|----------|----------|------------|
| Renovar idle en GET session | Solo docs / solo authorize / touch en `state()` | Touch `lastSeen` + `session_write_close()` en `state()` tras `sessionIsActive` OK | Misma semántica que `authorize` (GET mutates=false); el poll FE `session()` debe extender idle |
| Helper compartido | Inline duplicado / `renewActivity()` privado | Inline 2 líneas (espejo `authorize`) | Cambio mínimo; evita refactor de callers |
| TTL docs/spec | Dejar 30 min / alinear 4 h–8 h | MODIFIED `admin-auth` + párrafo en `docs/backend/00-php84-api.md` | Drift P1; código y fail-closed ya exigen 14400/28800 |
| D-004 storage | Fail-open login / 429 / 503 distinto | `allowLoginAttempt(): ?bool` — `true` ok, `false` 429, `null` 503 `SERVICE_UNAVAILABLE` | No fallar-abierto login; FE trata 5xx genérico (no copy de rate-limit) |
| Envelope/400/409 | Reescribir catálogo / spot | DEFER salvo bug claro en apply | Fuera del lock; no inflar PR |
| Tests | Introducir PHPUnit / scripts procedurales | Extender `AdminSessionAuthTest` + `AdminAuthHttpTest` | Stack actual: scripts PHP sin framework |

## Data Flow

```
GET /admin/auth/session
  → AdminSessionAuth::state(config, basePath, now)
       → settings + cookie + start
       → sessionIsActive? else destroy → null
       → $_SESSION['lastSeen'] = now
       → session_write_close()
       → return $_SESSION (aún legible en memoria)
  → Response::json authenticated + csrfToken

POST /admin/auth/login (pre-credenciales)
  → allowLoginAttempt → true | false | null
       true  → login(...)
       false → 429 RATE_LIMITED
       null  → 503 SERVICE_UNAVAILABLE (mensaje genérico, sin PII)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/backend-php/src/AdminSessionAuth.php` | Modify | `state()`: touch `lastSeen` + `session_write_close`; `allowLoginAttempt` → `?bool` (null = storage) |
| `apps/backend-php/index.php` | Modify | Mapear `null` → 503 `SERVICE_UNAVAILABLE`; `false` → 429 intacto |
| `apps/backend-php/tests/AdminSessionAuthTest.php` | Modify | Caso `state()` renueva `lastSeen`; asserts TTL 14400/28800; tri-estado storage |
| `apps/backend-php/tests/AdminAuthHttpTest.php` | Modify | GET session avanza `lastSeen` en save_path; storage rate-limit → 503 ≠ 429 |
| `openspec/specs/admin-auth/spec.md` | Modify | (vía delta del change) idle 4 h / absolute 8 h + escenario lastSeen en GET session |
| `openspec/changes/audit-u06-backend/specs/admin-auth/spec.md` | Create | Delta MODIFIED lean (sdd-spec) |
| `docs/backend/00-php84-api.md` | Modify | «30 minutos» → inactividad 4 h / absoluta 8 h (14400/28800) |

Sin deletes. No tocar archive U5, keys, token permanente, CSRF/cookies (U7).

## Interfaces / Contracts

```php
// Tras sesión activa en state():
$_SESSION['lastSeen'] = $now;
session_write_close();
return $_SESSION;

/** @return bool|null true permitido; false rate-limit; null storage no usable */
public static function allowLoginAttempt(array $config, array $server): ?bool
```

HTTP: storage → `503` + código `SERVICE_UNAVAILABLE` + mensaje genérico (mismo tono que `INTERNAL_ERROR`). Rate-limit real sigue `429 RATE_LIMITED`.

## Testing Strategy

| Layer | Qué | Cómo |
|-------|-----|------|
| Unit (script) | `state()` activo escribe `lastSeen=now` y no destruye sesión | `AdminSessionAuthTest`: session save_path temp, login/state con `$now` avanzado |
| Unit (script) | TTL constants / fail-closed | Ya parcial; reforzar comentarios/asserts 14400/28800 |
| Unit (script) | `allowLoginAttempt` dir no escribible → `null`; bucket ≥5 → `false` | Temp dir + chmod / bucket JSON |
| HTTP | GET `/admin/auth/session` renueva actividad | Tras login, mutar `lastSeen` en archivo de sesión (o reloj), GET session, verificar vigencia extendida |
| HTTP | D-004 | `rate_limit_storage_path` parent no writable → 503 `SERVICE_UNAVAILABLE`, no 429 |
| Regresión | Login rate-limit real | Conservar assert 429 tras N intentos (`AdminAuthHttpTest`) |
| E2E staging | Idle 4 h real | DEFER U9 |

Nota: el pedido «PHPUnit» se cumple con los tests unitarios procedurales del repo (no hay PHPUnit en pipeline).

## Threat Matrix

N/A — no hay routing nuevo, shell/subprocess, automatización VCS/PR, clasificación de ejecutables ni integración de procesos.

## Migration / Rollout

No migration required. Deploy PHP + docs/spec. Comportamiento observable: poll de sesión deja de dejar expirar idle pese a uso; login con storage roto deja de verse como rate-limit.

## Delivery

Forecast autorado ≪ 400 líneas → **single PR** en `audit/u06-backend`. `size:exception` solo si el diff se dispara (poco probable).

## Open Questions

- [x] D-004 → 503 ≠ 429 (lock)
- [x] Docs TTL en U6 (lock)
- [x] Poll renueva idle (lock)
- [ ] Ninguna abierta que bloquee tasks
