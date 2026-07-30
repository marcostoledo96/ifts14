# Proposal: U5 — estados loading / empty / error (sin design system)

## Intent

Cerrar PLAN §U5: alinear loading/empty/error+Reintentar en listados y `course-editor`; QA solo-dev; 401 por spec (redirect limpio). Sin design system ni rediseño API.

## Scope

### In Scope
- Listados (cursos/alumnos/certs/asistencias): Reintentar + empty CTA al patrón mayoritario P9–P23 (`btn-primary`, CTA útil)
- `course-editor`: Reintentar gated en carga recuperable; not-found sin retry
- QA forced views: gate solo-dev; tests con token false ocultan barra
- 401: regresión tests/spec only (NEVER+latch; exclusión login)
- Spec **ADDED** lean `frontend-angular-shell` SHELL-STATE-01..04

### Out of Scope
- U6 backend msgs; U9 smokes; EmptyState/`mensajeErrorApi` compartido
- QA asistencias; copy U3; archive U4; API/D0; commits

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `frontend-angular-shell`: **ADDED** lean —
  - SHELL-STATE-01: listados loading / error+Reintentar / empty CTA / no-results
  - SHELL-STATE-02: Reintentar solo carga recuperable; not-found/acciones sin retry
  - SHELL-STATE-03: QA forced views solo no-prod
  - SHELL-STATE-04: 401 (≠ login) → clearSession + `/admin/login` sin panel error

> Specs por feature: evitar salvo outlier que no quepa en shell.

## Approach

**Approach 1 (locked):** (1) listados micro CTA/Reintentar → (2) course-editor Reintentar → (3) QA solo-dev → (4) 401 tests/spec. Patrones P9–P23.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `*-list-page.*` (4) | Modified/smoke | Alinear Reintentar+empty |
| `course-editor-page.*` | Modified | Reintentar load-only |
| `csrf.interceptor.ts` (+spec) | Regression | Contrato 401 intacto |
| Tokens `*_QA_ENABLED` | Verify | Solo no-prod |
| `frontend-angular-shell` | Delta ADDED | SHELL-STATE-01..04 |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Creep EmptyState/util | Med | Hard DEFER |
| Reabrir U3/U4 | Low | No tocar |
| QA rompe `ng serve` | Med | Preservar `isDevMode` |
| Tocar interceptor | Low | Solo tests/spec |
| Diff >400 | Med | Encadenar slices |

## Rollback Plan

Revert FE + delta shell. Sin DB/API.

## Dependencies

Explore U5; Approach 1; D0; post-U4 (`7b7d3db`). No U6/U9.

## Success Criteria

- [ ] Listados: error+Reintentar y empty CTA alineados al patrón dominante
- [ ] `course-editor`: Reintentar load recuperable; not-found sin retry
- [ ] QA no visible con token/`isDevMode` false
- [ ] 401 redirect limpio sin panel error (regresión)
- [ ] SHELL-STATE-01..04; sin API/D0/U3/U4; sin commit aquí

## Proposal question round

**Locked:** Approach 1 A–D; DEFER U6/U9/EmptyState/U4/API; shell SHELL-STATE-01..04; canónico `btn-primary`.

1. ¿Cursos abandona `btn-secondary` en Reintentar?
2. ¿Empty certs deja `cta-nueva` solo visual y usa `btn-primary`+link?
3. ¿Si staging ya es `isDevMode===false`, refuerzo = tests+spec sin flag `environment`?
4. ¿Dashboard/config solo smoke salvo regresión?
5. ¿Asistencias entra completo en SHELL-STATE-01 o solo paridad existente?
