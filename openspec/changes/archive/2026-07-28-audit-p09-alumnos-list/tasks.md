# Tasks: Auditoría P9 — listado de alumnos admin

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~40–120 (copy + specs tests; HTTP 0 si smoke OK) |
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
| 1 | Copy sin legajo + asserts checklist P9 | PR 1 | `npx ng test --include=**/students-list-page.spec.ts --no-watch --browsers=ChromeHeadless` | Staging `/admin/alumnos` (métricas 0/N; DNI UI; chips) | Revertir `students-list-page.*` |
| 2 | HTTP métricas (solo si evidencia) | mismo PR o omitir | `npx ng test --include=**/http-students.service.spec.ts --no-watch --browsers=ChromeHeadless` | Smoke staging con payload 0/N vs UI «—» | Revertir `http-students.service.*` |

## Phase 1: Gate smoke (decide HTTP)

- [x] 1.1 Gate por inspección de código (`optionalCount`/`toAlumno`): `0` se preserva como número; null solo si ausente/no numérico. Sin smoke staging (decisión confirmada).
- [x] 1.2 Apply notes: HTTP **omitido** — mapeo correcto; Fase 4 N/A.

## Phase 2: Copy y conservación UI

- [x] 2.1 En `students-list-page.html`: sustituir intro «Legajos…» y vacío «su legajo…» por copy sin «legajo»/«legajos» (registro/ficha).
- [x] 2.2 Confirmar en HTML/TS: badges Contacto disponible / Sin email / Sin dato; chips cert + Sin email; **sin** chip «Con email»; `dniMostrar` completo; pager 20; Reintentar; QA solo `isDevMode`.
- [x] 2.3 Ajustar `students-list-page.ts` solo si el copy exige texto/constante; no tocar filtros ni `etiquetaContacto`.
- [x] 2.4 `students-list-page.css` solo si el copy nuevo rompe layout (esperable: no).

## Phase 3: Tests del listado

- [x] 3.1 En `students-list-page.spec.ts`: assert intro y vacío sin «legajo»/«legajos» (spec: Copy del listado sin legajo inventado).
- [x] 3.2 Assert badges sin email literal ni chip «Con email»; métricas `0`≠«—» y null→«—»; DNI completo; filtros cert/sin-email; paginación ≤20; estados + Reintentar; QA solo con override/token de test.
- [x] 3.3 Correr focused `students-list-page.spec.ts` hasta verde.

## Phase 4: HttpStudentsService (OPTIONAL / condicional)

- [x] 4.1 **SKIP / N/A** — inspección: `optionalCount` preserva `0` (`typeof number && Number.isFinite`); null solo si ausente/no numérico. Sin parche.
- [x] 4.2 **N/A** — no se extendió `http-students.service.spec.ts`.
- [x] 4.3 HTTP omitido: `http-students.service.*` sin cambios; 4.1–4.2 N/A.

## Phase 5: Cierre checklist P9

- [x] 5.1 Verificar checklist P9 (DNI, filtros, métricas, pager, vacíos/error, QA solo dev) sin editor/detalle.
- [x] 5.2 Confirmar deltas ya presentes en `specs/admin-students-frontend/` y `specs/frontend-http-services/` (sin reescribir salvo drift).
- [x] 5.3 `npx tsc --noEmit -p tsconfig.app.json` + focused tests del área; sin trailing whitespace.
