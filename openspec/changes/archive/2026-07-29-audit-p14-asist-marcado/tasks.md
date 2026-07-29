# Tasks: Auditoría P14 — marcado de asistencias + emisión

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~40–120 (página + tests; HTTP 0) |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | errorRecuperable + mensajeErrorApi + tests CRITICAL | PR 1 | `npx ng test --include='**/attendance-marking-page.spec.ts' --no-watch --browsers=ChromeHeadless` | Staging multi-PDF sin 401 (verify gate) | Revertir `attendance-marking-page.*` + delta spec |

Base: `apps/frontend-angular/src/app/features/admin/attendances/pages/marking/`

**No-goals / constraints**: no tocar `HttpAttendanceService.marcar` Promise.all; no rotar token/QR ni backend; no P15; `regenerado:false` as-is; conservar bucle serial emit/regen y DNI completo UI; sin PII en logs.

## Phase 1: Error recuperable (TS)

- [x] 1.1 En `attendance-marking-page.ts`: añadir `readonly errorRecuperable = signal(false)`.
- [x] 1.2 En `cargar`: inicio → `false`; id/fecha inválidos → error + `false` + return; éxito/`fechaNoEncontrada` → `false`; `catch` Promise.all → mensaje carga + `true`.
- [x] 1.3 `onReintentar()`: no-op si `!errorRecuperable()`; si OK → `void this.cargar(id(), fechaId())`.
- [x] 1.4 No alterar bucle serial emit/regen, `regenerado:false` counting, navigate+state ni `dniMostrar`.

## Phase 2: Catch marcar + panel (TS/HTML)

- [x] 2.1 En catch externo de `marcar`/`guardarYGenerar`: `this.error.set(this.mensajeErrorApi(e))` (esc. Envelope 400).
- [x] 2.2 En `attendance-marking-page.html`: botón Reintentar solo `@if (errorRecuperable())` junto al error de carga.
- [x] 2.3 Conservar navegación existente (Volver/detalle) y copy vigente; sin DNI/token en mensajes.

## Phase 3: Tests CRITICAL (RED→GREEN)

- [x] 3.1 Id/fecha inválidos o not-found → sin Reintentar; `errorRecuperable` false (esc. Id o fecha inválidos).
- [x] 3.2 Stub reject carga → Reintentar+re-llama fuentes; mensaje sin DNI/token (esc. Fallo recuperable).
- [x] 3.3 Fecha futura AR → marcar OK; emit/regen no llamados; `fallidos`+copy futura (esc. Fecha futura).
- [x] 3.4 ≥2 presentes: spies emit/regen en serie, no solapados (esc. Emisión en serie).
- [x] 3.5 Envelope 400 al marcar → mensaje vía `mensajeErrorApi` sin PII (esc. Envelope 400).
- [x] 3.6 Conservar assert `tokenPrefix` estable al regenerar (esc. Token permanente).
- [x] 3.7 Focused `attendance-marking-page.spec.ts` hasta verde.

## Phase 4: Cierre apply + gate verify

- [x] 4.1 Checklist apply: Reintentar solo recuperable; mensajeErrorApi; serial intacto; sin HTTP/backend/P15/token rotate; sin PII.
- [x] 4.2 Confirmar delta `specs/admin-attendances-frontend/spec.md` (ya escrito; sin drift).
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` + focused tests; sin trailing whitespace.
- [ ] 4.4 **Verify (no apply)**: smoke staging multi-PDF/multi-presentes sin 401 session lock.
