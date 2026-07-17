# Tasks: Lista alumnos polish + Nuevo alumno

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 550–900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes (diferido) |
| Suggested split | PR1 seams → PR2 list → PR3 editor/ruta |
| Delivery strategy | single-cycle apply (orquestador) |
| Chain strategy | size-exception (apply completo) |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test | Rollback |
|------|------|-----------|--------------|----------|
| 1 | Model + crear seam | PR1 | http/in-memory students specs | Revert service/models |
| 2 | Lista polish | PR2 | students-list-page.spec | Revert list.* |
| 3 | Editor + ruta | PR3 | student-editor + routes | Revert new/ + routes |

## Phase 1: Modelo + seam crear (REQ-SEDIT-003, REQ-SLIST-002…004)

- [x] 1.1 **RED** — Specs HTTP: list mapea nullables; `crear` POST body exacto; 201 map; 409. → REQ-SEDIT-003 / SLIST-002…004
- [x] 1.2 **GREEN** — `students.models` nullables + `AlumnoDraft`; `StudentsService.crear`; HTTP + InMemory. → idem
- [x] 1.3 **RED→GREEN** — In-memory `crear` con máscara dniMostrar; sin email en seed. → REQ-SEDIT-003

## Phase 2: Lista polish (REQ-SLIST-001…007)

- [x] 2.1 **RED** — Specs list: CTA; badges; placeholders; SVG estados; filtros null. → REQ-SLIST-*
- [x] 2.2 **GREEN** — Template/CSS/helpers list page. → REQ-SLIST-*

## Phase 3: Editor + ruta (REQ-SEDIT-001/002/004)

- [x] 3.1 **RED** — Specs editor: validación; doble submit; navigate; error sin DNI. → REQ-SEDIT-002/004
- [x] 3.2 **GREEN** — `pages/new/student-editor-page.*`. → REQ-SEDIT-002/004
- [x] 3.3 **RED→GREEN** — Ruta `alumnos/nuevo` antes de `:id` + `app.routes.spec`. → REQ-SEDIT-001
- [x] 3.4 **RED→GREEN** — CTA list + empty CTA. → REQ-SLIST-001/005

## Phase 4: Tracking

- [x] 4.1 `apply-progress.md` con checklist y evidencia.
- [x] 4.2 Tests focalizados verdes (verify formal = sdd-verify).
