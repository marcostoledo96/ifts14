# Apply progress: frontend-asistencias-listado-por-curso

**Mode**: Standard (config `strict_tdd: false`) + TDD por tasks.md (RED→GREEN)
**Delivery**: size:exception — Units 1+2 en `feat/asistencias-listado-por-curso` (Marcos aprobó)
**Status**: 13/13 tasks complete (sdd-verify PASS WITH WARNINGS; listo para archive)

## Completed

- [x] 1.1–1.2 RED listado specs (filas=cursos, búsqueda, sin chips fecha, métricas, CTA intermedia)
- [x] 2.1–2.3 GREEN listado `FilaCurso` + UI
- [x] 3.1–3.2 RED intermedia + orden rutas
- [x] 4.1–4.3 GREEN intermedia + `asistencias/curso/:id` antes de `asistencias`
- [x] 5.1 focal tests + tsc
- [x] 5.2 Smoke — cubierto por suite focal 123 SUCCESS; browser staging post-deploy (diferido)
- [x] 5.3 sin tocar hub HTTP/mock, marking, certificados

## TDD evidence (tasks-driven)

| Task | RED | GREEN | Notes |
|------|-----|-------|-------|
| 1.1–1.2 | Specs reescritas primero | List page implementada | 6 filas seed |
| 3.1–3.2 | Specs intermedia + routes primero | Page + routes | Orden ruta verificado |
| 2.3 / 4.3 | — | 123 SUCCESS focal | tsc clean |

## Test command

```bash
cd apps/frontend-angular
npx ng test --include='**/attendances-list-page.spec.ts' \
  --include='**/attendance-course-dates-page.spec.ts' \
  --include='**/app.routes.spec.ts' --no-watch --browsers=ChromeHeadless
npx tsc --noEmit -p tsconfig.app.json
```

Result: **123 SUCCESS**; **tsc no errors**.

## Files

| File | Action |
|------|--------|
| `attendances/pages/list/attendances-list-page.{ts,html,css,spec.ts}` | Modified |
| `attendances/pages/course-dates/attendance-course-dates-page.{ts,html,css,spec.ts}` | Created |
| `app.routes.ts` | Modified |
| `app.routes.spec.ts` | Modified |
| `openspec/.../tasks.md` | Updated checkboxes |
| `openspec/.../apply-progress.md` | Synced 13/13 en archive |

## Deviations

- CTA listado label: **«Ver fechas»** (design fijó «Tomar asistencia» solo para intermedia).
- Chip de estado de curso en fila del listado: sí (open question design, patrón admin).

## Untouched (5.3)

- `attendance-mock.service.ts`, `http-attendance.service.ts`
- `attendance-marking-page.*`
- certificaciones salvo navegación saliente

## Archive reconciliation

Verify warning #2: este archivo quedó desfasado en 12/13 tras marcar 5.2 en `tasks.md`. Reconciliado en `sdd-archive` (2026-07-22) con evidencia de `verify.md` (13/13, 5.2 = sustituto automatizado).
