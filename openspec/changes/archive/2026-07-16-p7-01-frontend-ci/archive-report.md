# Archive Report — P7-01 Frontend CI

**Change**: `p7-01-frontend-ci`
**Archived**: 2026-07-16
**Status**: DONE — PASS (6/6 requirements, 9/9 tasks, 0 blockers)
**Mode**: hybrid (Engram + OpenSpec)
**Topic key (Engram)**: `sdd/p7-01-frontend-ci/archive-report`

---

## 1. Verdict and gates

| Gate | Result |
|---|---|
| `verify-report.md` | `verdict: pass`, `requirements: 6/6`, `scenarios: 12/12` |
| `apply-progress.md` | 9/9 tasks complete, 4/4 verification commands exit 0 |
| `tasks.md` | 9/9 checkboxes checked, no stale implementation tasks |
| Native review receipt gate | n/a (ciclo sin dual-review explícito; PASS basado en runtime evidence) |
| Task completion gate | PASS |
| Verify CRITICAL issues | 0 |

All gates passed. Archive proceeded without override or reconciliation.

## 2. Spec sync (delta → canonical)

| Action | Domain | Result |
|---|---|---|
| Created | `openspec/specs/frontend-ci-quality-gates/spec.md` | 6 requirements synced from delta: REQ-CI-001 (TypeScript strict check), REQ-CI-002 (Build producción), REQ-CI-003 (Build staging), REQ-CI-004 (Detección explícita de mocks), REQ-CI-005 (Suite de tests en CI), REQ-CI-006 (Contrato de verificación de 3 pasos) |

The delta spec added 6 new requirements; the canonical spec preserves all 6 with the same Given/When/Then scenarios, plus notes operativas (branch protection manual, CSS budget warnings). No MODIFIED or REMOVED requirements — pure addition.

## 3. Archive move

```
openspec/changes/p7-01-frontend-ci/
  → openspec/changes/archive/2026-07-16-p7-01-frontend-ci/
```

Contents preserved: `proposal.md`, `spec.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `exploration.md`. Active changes directory no longer contains this change.

## 4. Files touched in this archive pass

| File | Action |
|---|---|
| `openspec/specs/frontend-ci-quality-gates/spec.md` | Created |
| `openspec/changes/p7-01-frontend-ci/` → `openspec/changes/archive/2026-07-16-p7-01-frontend-ci/` | Moved |
| `docs/deploy/00-cpanel-certificados.md` | Added section "Quality gates de CI (frontend)" |
| `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` | Updated frontmatter (version 1.6→1.7, fecha 2026-07-15→2026-07-16, fase_actual P7-01→P7-02, ultimo_ciclo_cerrado P6-05→P7-01); updated 4.2 P7 row evidence; added 4.3 archive row for P7-01; marked section 7 P7-01 as DONE; updated section 11 next step to P7-02; added historial 1.7 row |

## 5. Specs covered (source of truth now reflects new behavior)

- `openspec/specs/frontend-ci-quality-gates/spec.md` — 6 requirements, 14 scenarios (REQ-CI-001 a REQ-CI-006).

## 6. Open follow-ups (carried forward, do not block archive)

- **Branch protection manual**: la regla `Require status checks to pass before merging` para el check `frontend-tests` debe configurarse en GitHub Settings → Branches. Es tarea operativa de Marcos/Matías, no automatizable desde código.
- **ESLint**: diferido a ciclo posterior. No forma parte de los gates vigentes.
- **CSS budget warnings** (4 archivos: certification-pdf-preview-page, certification-preview-page, certification-revoke-page, student-detail-page): no bloqueantes, diferidos a ciclo de optimización de budgets.
- **P7-02 (Backend CI)**: próximo ciclo, scope en sección 7 y 11 del plan.
- **P7-04 (Seguridad/docs)**: sigue `PENDING`, scope: gitleaks, archivos prohibidos, OpenSpec mal archivado, enlaces internos, `git diff --check`.

## 7. Source of truth

| File | Role |
|---|---|
| `openspec/changes/archive/2026-07-16-p7-01-frontend-ci/verify-report.md` | Runtime evidence of the PASS |
| `openspec/changes/archive/2026-07-16-p7-01-frontend-ci/apply-progress.md` | What was actually done |
| `openspec/specs/frontend-ci-quality-gates/spec.md` | New canonical contract |
| `docs/deploy/00-cpanel-certificados.md` (sección "Quality gates de CI (frontend)") | Deploy-side documentation of the gates |
| `docs/planificacion/IFTS14_PLAN_CORRECCIONES_PREPRODUCCION_SDD_TDD.md` | Plan updated, section 11 points to P7-02 |

## 8. SDD cycle complete

P7-01 is closed. The `frontend-tests` CI job now enforces the 3-step core contract (test:ci, tsc --noEmit, build) plus staging build and mock guard. Ready for the next cycle: **P7-02 — Backend CI**.
