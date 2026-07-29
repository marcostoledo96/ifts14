# Tasks: Auditoría P15 — certificados por fecha

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~50–130 (página + tests + PLAN light; HTTP 0) |
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
| 1 | Honesty + Expediente + tests + PLAN | PR 1 | `npx ng test --include='**/date-certificates-page.spec.ts' --no-watch --browsers=ChromeHeadless` | N/A — unit; smoke opcional en verify | Revertir `date-certificates-page.*` + delta + PLAN |

Base: `apps/frontend-angular/src/app/features/admin/attendances/pages/date-certificates/`

**Constraints (LOCKED)**: solo `date-certificates-page.*` + delta confirm + PLAN light; Expediente `/admin/certificaciones/:id`; entrega Copiar+QR (no `/entrega`); Reintentar solo load catch; acciones `mensajeErrorApi` sin raw/`Reintentar`; orphan `fechaId` deferred; no P14/P16/HTTP/token/backend; DNI full UI; sin PII en logs; **no commit/push/PR**.

## Phase 1: Honesty carga (TS/HTML)

- [x] 1.1 `date-certificates-page.ts`: `errorRecuperable = signal(false)` + `onReintentar()` → `cargar(this.id())` solo si flag.
- [x] 1.2 `cargar`: inicio false; `cid===null`/404|/no encontrad/i → «Curso no encontrado.» + false; resto → «No se pudieron cargar los certificados. Reintentá.» + true.
- [x] 1.3 HTML: Reintentar solo `@if (errorRecuperable())`; CSS `.error-actions` mínimo.
- [x] 1.4 Conservar listado `{cursoId}`, empty/CTA, state P14, DNI, anti-token; sin rutas ni copy empty.

## Phase 2: Acciones + Expediente

- [x] 2.1 Helper privado `mensajeErrorApi` (paridad marking + `HttpErrorResponse` si aplica).
- [x] 2.2 Catch Copiar/QR/PDF: `error.set(mensajeErrorApi(e))`; flag false; sin Reintentar.
- [x] 2.3 En `cert-datos`: `<a data-testid="cert-expediente" [routerLink]="['/admin/certificaciones', c.id]">Expediente</a>` (también revocado); CSS `.link-expediente`.
- [x] 2.4 No poner Expediente en `.cert-acciones`; orden Copiar→QR→PDF intacto.

## Phase 3: Tests

- [x] 3.1 Vacío `[]` → CTA marcar (esc. Vacío).
- [x] 3.2 Reject no-404 → Reintentar re-llama; sin PII/raw (esc. Fallo recuperable).
- [x] 3.3 Id inválido/404 → sin Reintentar (esc. not-found).
- [x] 3.4 Expediente href `/admin/certificaciones/:id` (esc. Link Expediente).
- [x] 3.5 Acción fallida → helper/genérico; sin Reintentar/raw (esc. Error de acción).
- [x] 3.6 Regresión: orden botones; anti-token; DNI `/\d{7,8}/`.

## Phase 4: PLAN light + gates

- [x] 4.1 Confirmar delta change (ya escrito; no ampliar).
- [x] 4.2 PLAN: marcar P15 apply listo en `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` (ligero).
- [x] 4.3 `npx tsc --noEmit -p tsconfig.app.json` + focused spec; tasks `[x]`; sin trailing whitespace.
- [x] 4.4 Checklist: honesty OK; sin P14/P16/HTTP/token/PII; **sin commit/push/PR**.

## DO NOT TOUCH

P14 marking (+ archive/WT); P16 list; HTTP/backend/token; filtro `fechaId`; `/entrega`; fecha huérfana; `app.routes*`; otras páginas asistencias.

## Decision needed

No — defaults locked (single PR, Low).
