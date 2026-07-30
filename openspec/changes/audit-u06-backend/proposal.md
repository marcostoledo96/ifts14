# Proposal: audit-u06-backend

## Intent

Cerrar PLAN §U6: `GET /admin/auth/session` (`state()`) no renueva `lastSeen` (sí `authorize`), y spec/docs prometen idle 30 min vs Config 14400/28800 (jornada). Alinear código + contrato sin rediseñar API.

## Scope

### In Scope
- Touch `lastSeen` + `session_write_close()` en `AdminSessionAuth::state()`.
- MODIFIED lean `admin-auth`: idle 4 h / absolute 8 h + escenario lastSeen.
- Párrafo TTL en `docs/backend/00-php84-api.md`.
- D-004 bajo riesgo: storage login roto ≠ `429 RATE_LIMITED` (preferir 503).
- Tests `AdminSessionAuthTest` / `AdminAuthHttpTest`.
- Spot envelope/400/409 solo con bug claro.

### Out of Scope
- U7 (CSRF/headers/PII), U9 (smoke staging).
- Rediseño API; unificar errores FE.
- Keys, token permanente, archive U5, commit.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-auth`: TTL 14400/28800; lastSeen en lectura de sesión.
- `backend-contrato-api-certificados` (opcional lean): solo si el spot exige delta.

## Approach

Approach 1 quirúrgico (explore + lock):

1. MUST — `state()` activo → `lastSeen=now` + `session_write_close()`.
2. MUST — Spec/docs = Config (jornada, no 30 min).
3. INCLUDE — D-004: 503≠429 (no fail-open login salvo design).
4. DEFER — envelope/400/409 sin bug; U7/U9.

## Affected Areas

| Área | Impact | Description |
|------|--------|-------------|
| `AdminSessionAuth.php` | Modified | lastSeen + write_close; D-004 |
| `index.php` | Modified si aplica | Mapeo HTTP D-004 |
| Tests auth | Modified | lastSeen, TTL, D-004 |
| `openspec/specs/admin-auth` | Modified | Idle 4 h + lastSeen |
| `docs/backend/00-php84-api.md` | Modified | TTL alineado |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `state()` rompe sesión | Med | Mirror `authorize` + tests |
| Creep a U7 | Med | Locks explícitos |
| D-004 fail-open | Med | Preferir 503≠429 |
| Copy 400/409 vs FE | Low | Solo bugs claros |

## Rollback Plan

Revertir commits (PHP/tests/docs/spec). Sin migraciones ni keys. Vuelve gap D-009.

## Dependencies

- Explore hybrid; base `0b9d786`. U7/U9 no bloquean.

## Success Criteria

- [ ] GET session renueva `lastSeen` y cierra write lock.
- [ ] Spec/docs: idle 14400 / absolute 28800.
- [ ] D-004: storage ≠ `RATE_LIMITED` (o defer design).
- [ ] Tests PHP del área verdes; sin PII en paths tocados.
- [ ] Sin keys/token/archive U5.

## Proposal question round

1. D-004: ¿**503≠429** o fail-open como rate-limit público?
2. ¿Docs TTL en U6 o defer a U8?
3. ¿Poll FE `session()` debe extender idle? (sí asumido)
4. ¿Absolute 8 h intacto; cookies → U7?

**Supuestos:** 503≠429; docs U6 mínimo; poll renueva idle; absolute 8 h; cookies → U7.
