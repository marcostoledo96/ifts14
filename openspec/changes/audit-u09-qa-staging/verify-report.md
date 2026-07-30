```yaml
schema: gentle-ai.verify-result/v1
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
change: audit-u09-qa-staging
branch: audit/u09-qa-staging
```

# Verify: audit-u09-qa-staging

## Resumen

QA staging real + hotfix 401 al marcar asistencias. Operador confirmó deploy fix401 y estabilidad.

## Evidencia

| Ítem | Resultado |
|---|---|
| Checklist smoke (health, login, emit, PDF, validar, regen token, revocar) | PASS / PARTIAL documentados en `explore.md` |
| Fix `marcar()` serie + BE `session_start`→503 | Código + spec FE `http-attendance.service.spec.ts` **18 SUCCESS** |
| Retest staging post-upload | Operador: **estable** (2026-07-30) |
| D-009 idle 30 min timed | **DEFER** (config 14400/28800 OK; sin espera reloj) |
| Deny `api/src` → 403 limpio | **PARTIAL** (host 406; no expone código) |
| SPA 404 admin | **PARTIAL** (cae a dashboard) |

## Verdict

**PASS WITH WARNINGS** — sin P0 abiertos; DEFER/PARTIAL no bloquean cierre U9 ni merge a `staging1.0`. L1 → `main` sigue gated.
