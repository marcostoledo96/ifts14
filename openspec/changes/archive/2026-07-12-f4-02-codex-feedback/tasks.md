# Tareas: F4-02 Codex Feedback — Fechas exactas y estados 1/3/4/5

artifact_store: hybrid · preflight `single-pr-default` budget 4000, chain `none`.

## Review Workload Forecast

| Field | Value |
|---|---|
| Líneas estimadas | ~380 |
| 400-line budget risk | Low |
| Chained PRs | No |
| Delivery / chain | single-pr-default / none |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Focused test | Runtime harness | Rollback |
|---|---|---|---|---|
| 1 | D0 fechas + marcas 1/3/4/5 + checker + docs | `npm run test:ci -- --include='**/certifications/**'` | `node evidence/print-app-check.mjs` vs `ng serve` | Revertir TS/HTML/CSS + spec + checks + checker; restaurar `periodo()` y `cert-revocado-*` |

## Trazabilidad escenarios → tests

| Escenario | Test / artefacto |
|---|---|
| Paridad visual | `evidence/pdf-desktop.png`, `pdf-mobile.png` |
| Fechas exactas D0 | `…-preview-page.spec.ts` 2.1-2.2 |
| Marcas no vigente | `…-preview-page.spec.ts` 2.3-2.4 |
| Impresión segura | `…-preview-page.spec.ts` 4.1-4.2 |
| Checker real | `print-app-check.mjs` 1/3/4/5 |
| Privacidad | `no-real-data.spec.ts` 1/3/4/5 |
| Sin secretos | `no-secrets.spec.ts` ampliado |
| Verify | `sdd-verify` deja build/test/PDF/capturas |

## Phase 1 — Helpers TS

- [x] 1.1 RED: `formatearFechaAsistida('2026-03-02') === '2026-03-02'` (id 1).
- [x] 1.2 RED: `estadoPresentacion()` para 3/4/5; `null` (id 1).
- [x] 1.3 GREEN: en `.ts`, eliminar `periodo()`; agregar helpers; no tocar `certs`/`load()`/`imprimir()`

## Phase 2 — Template HTML

- [x] 2.1 RED: cada `attendedDates` ISO en DOM; sin "dictado entre".
- [x] 2.2 RED: `.cert-estado-marca` `BORRADOR`/`VENCIDO`/`REVOCADO` para 3/4/5; ausente (id 1).
- [x] 2.3 RED: `.cert-estado-banda` visible para 3/4/5; oculta (id 1).
- [x] 2.4 GREEN: reemplazar `dictado entre {{ periodo() }}` por `@for`; sustituir `.cert-revocado-*`.

## Phase 3 — Estilos CSS

- [x] 3.1 RED: `[class*="--borrador"]`/`--vencido`/`--revocado` solo en 3/4/5.
- [x] 3.2 GREEN: factorizar `.cert-estado-marca`/`.cert-estado-banda` con modificadores; `@page`, `break-inside: avoid`, `print-color-adjust` intactos.

## Phase 4 — Impresión y suite

- [x] 4.1 RED: `imprimir()` activo y `window.print()` para 1/3/4/5
- [x] 4.2 GREEN: ningún estado deshabilita el botón ni bloquea `window.print()`.
- [x] 4.3 Suite: `npm run test:ci` con scenarios 1-4 verdes 1/3/4/5

## Phase 5 — Privacidad y secretos

- [x] 5.1 RED: `no-real-data.spec.ts` parametrizado a 1/3/4/5; sin DNI/UUID/email/legajo/matrícula; `documentMasked` y URL truncada presentes.
- [x] 5.2 RED: `no-secrets.spec.ts` cubre helper sin `fetch`/storage/cookies/IndexedDB/`X-Admin-Key`/`HttpClient`.
- [x] 5.3 GREEN: checks verdes para 1/3/4/5.

## Phase 6 — Checker app real

- [x] 6.1 Crear `evidence/print-app-check.mjs` `CASES` 1/3/4/5; asserts: 1 A4, sin clipping/chrome, marca/banda, sin "dictado entre" ni datos prohibidos, `overflow: visible`.
- [x] 6.2 RED: vs `ng serve`; falla si falta fecha/marca, "dictado entre", datos prohibidos, `overflow !== visible` o `pages !== 1`.
- [x] 6.3 GREEN: checker verde 1/3/4/5; SHA-256 en `evidence/print-hashes.txt`.

## Phase 7 — Verify + archive

- [x] 7.1 `npm run build` exit 0; warnings CSS < 16kB.
- [x] 7.2 Capturas desktop, mobile, print 1/3/4/5 en `evidence/`.
- [x] 7.3 `sdd-verify`: reproduce test:ci + build + checker.
- [x] 7.4 `sdd-archive`: delta spec; `docs/frontend/F4-02-vista-previa-pdf.md`; mover a `archive/2026-07-12-f4-02-codex-feedback/`.
