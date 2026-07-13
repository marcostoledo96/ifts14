# Apply progress — F4-04 course detail

## Mode

Standard mode with user-requested TDD evidence. Delivery: `single-pr-default`, budget 4000, no chain and no size exception.

## Completed tasks

- 1.1–1.4: RED tests and effect/load-generation implementation with optional attendance metrics via `Promise.allSettled`.
- 2.1–2.5: accessible ficha, one live summary, desktop table and mobile cards, empty state and existing attendance/editor routes.
- 3.1–3.8: focused tests cover reuse, metrics, seams, empty state, accessibility, privacy and the complete suite/build result.
- 4.1–4.3: dedicated no-real-data test confirms only count/action reach the DOM; no-secret/no-network check and full validation completed.
- 5.1–5.9: desktop, mobile, cancelled, empty and realised runtime evidence; realised state confirms present counts and follows `Ver`; parity notes, handoff docs and apply handoff report are complete.

## TDD cycle evidence

| Work unit | RED | GREEN | REFACTOR |
|---|---|---|---|
| Detail loading and UI states | `npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/admin/courses/course-detail-page.spec.ts'` → 6 failed assertions across 7 specs | same command → 9/9 SUCCESS | Extracted `conteoAsistencia()` after Angular template narrowing rejected direct union access. |
| Sync-throw seam hardening | same focused command → 1 failing spec: a synchronous throw aborted `allSettled` and exposed its message | same command → 10/10 SUCCESS after `Promise.resolve().then(...)` normalizes the nonconforming throw to a rejection | No abstraction added; the guard stays at the optional seam boundary. |
| F4-04 review corrections | same focused command → 3 failed assertions: unavailable seam rendered `Pendiente`/`Cargar` | same command → 10/10 SUCCESS after separating empty from missing/rejected/throw and removing duplicate error announcement | Added one availability predicate; no provider, route or dependency change. |

## Work unit evidence

| Evidence | Result |
|---|---|
| Focused test | Page 10/10, no-real-data 8/8 and no-secrets 2/2 SUCCESS under ChromeHeadless. |
| Runtime harness | `npm run start -- --host 127.0.0.1 --port 4200`; mock-login SPA walkthrough confirmed `/admin/cursos/4` at 1280×800 and 390×844, 8/7 presentes and `Ver` → existing marking route. |
| Rollback boundary | Revert `course-detail-page.{ts,html,css,spec.ts}`, courses negative check, F4-04 evidence/docs and handoff report; routes/providers/contracts remain unchanged. |

## F4-04 review correction evidence

- Missing `ATTENDANCE_SOURCE`, rejected `listarAsistencias`, and synchronous throw now render `No disponible` without an attendance link in both table and cards.
- A fulfilled empty list alone remains `Pendiente` with the existing `Cargar` link.
- The page uses only the existing `<output aria-live="polite">`; the visual error has no `role="alert"`. The DOM test models `<output>` as its implicit `status` role rather than looking only for an explicit attribute.
- Focused check: `npx ng test --watch=false --browsers=ChromeHeadless --include='src/app/features/admin/courses/course-detail-page.spec.ts'` → 10/10 SUCCESS.
- Full check: `npm run test:ci` → 487/487 SUCCESS.
- Build: `npm run build` → exit 0; the two pre-existing certification CSS budget warnings remain.
- Diff: `git diff --check` → exit 0, no output.
- Runtime harness: mock-login SPA → `/certificados/admin/cursos/4` at 1280×800 → table shows 8/7 presentes and two `Ver` links. Fallback seam cases are dependency-injected unit scenarios; no production route exposes a failure switch.

## Validation

- `npm run test:ci` → 487/487 SUCCESS.
- `npm run build` → exit 0; two pre-existing certification CSS budget warnings, none from course detail.
- `git diff --check` → exit 0.

## Pending

- Phase 6 only: `sdd-verify` must issue a new lineage/receipt, then `sdd-archive` merges the delta and archives the change.
