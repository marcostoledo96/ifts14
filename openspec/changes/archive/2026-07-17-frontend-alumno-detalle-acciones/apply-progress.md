# Apply progress: frontend-alumno-detalle-acciones

**Mode**: Standard (strict_tdd: false)  
**Workload**: size:exception — single cycle  
**Status**: 12/12 tasks complete. Re-verify **PASS WITH WARNINGS**. Ready for archive (orchestrator).

## Completed

- [x] 1.1–1.3 Seam `listarAsistenciasPorAlumno` (types + HTTP + mock + stubs)
- [x] 2.1–2.2 Query preselect en `CertificationNewPage` + aviso no bloqueante
- [x] 3.1–3.3 Detalle: CTAs emisión, toggle asistencias, motivos honestos, CSS
- [x] 4.1–4.3 Tests focalizados + tasks + este progreso

## Files changed

| File | Action |
|------|--------|
| `attendances/models/attendance.types.ts` | Modified |
| `attendances/data/http-attendance.service.ts` (+spec) | Modified |
| `attendances/data/attendance-mock.service.ts` (+spec) | Modified |
| `courses/...` / `marking` stubs | Modified |
| `certifications/pages/new/certification-new-page.{ts,html,spec.ts}` | Modified |
| `students/pages/detail/student-detail-page.{ts,html,css,spec.ts}` | Modified |
| `openspec/changes/frontend-alumno-detalle-acciones/*` | Created/updated |

## Focused tests

```text
CHROME_BIN=.verify-tmp/chrome-wrapper.sh
ng test --watch=false --browsers=ChromeHeadless
  --include='**/student-detail-page.spec.ts'
  --include='**/certification-new-page.spec.ts'
  --include='**/http-attendance.service.spec.ts'
  --include='**/attendance-mock.service.spec.ts'
→ TOTAL: 47 SUCCESS
```

## Deviations from design

None — Approach 2 acotado. Preselect tested vía `aplicarQueryPreselect` (ActivatedRoute real cubierto en runtime; harness DI conflict documentado en spec).

## Issues Found

None blocking.

## Re-verify (2026-07-17)

- Focused `student-detail-page.spec.ts`: **9 SUCCESS**, exit 0 (incluye empty/loading/error)
- Gates: `test_ci=0` (718 SUCCESS), `tsc=0`, `build=0`
- Veredicto: **PASS WITH WARNINGS** (CSS budget)
- Artifact: `verify.md`

## Next

Ready for `sdd-archive` (orchestrator). No archive from apply.
