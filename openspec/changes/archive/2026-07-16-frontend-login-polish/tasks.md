# Tasks: Login UI polish

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250–350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Login UI polish completo | PR 1 | `ng test --include='**/login-*.spec.ts'` | N/A (UI unit) | login-form/page + foundation delta |

## Phase 1: Form UI (TDD-friendly)

- [x] 1.1 Actualizar/agregar specs form: toggle password, aviso auditoría, CTA «Ingresar», sin copy simulación
- [x] 1.2 Implementar `login-form.ts`: `loading` input, `showPassword`, toggle
- [x] 1.3 Implementar `login-form.html/css`: iconos SVG, toggle, auditoría, Verificando…, ayuda Coordinación

## Phase 2: Page layout

- [x] 2.1 Specs page: «Panel de certificaciones», loading alrededor de login, sin «Acceso simulado»
- [x] 2.2 Implementar `login-page.ts`: signal `loading` + `finally`
- [x] 2.3 Implementar `login-page.html/css`: aside institucional, textura, footer, mobile brand bar, pasar `[loading]`

## Phase 3: Foundation + verify

- [x] 3.1 Actualizar `openspec/specs/admin-foundation/spec.md` (escenario auditoría)
- [x] 3.2 Correr tests focalizados login-* en verde
- [x] 3.3 Escribir `apply-progress.md`
