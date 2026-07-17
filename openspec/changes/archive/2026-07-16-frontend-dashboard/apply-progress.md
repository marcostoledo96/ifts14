# Apply progress: frontend-dashboard

## Estado

**Apply completo** (single-cycle). Listo para `sdd-verify` del orquestador.

## Hecho

| Tarea | Evidencia |
|-------|-----------|
| 1.1–1.2 Specs workbench | `admin-dashboard-page.spec.ts` reescrito (8 casos) |
| 2.1–2.3 Página | `admin-dashboard-page.{ts,html,css}` — mesa de trabajo |
| 2.4 Ruta | `app.routes.ts` título “Panel de certificaciones” |
| Foundation delta | `openspec/specs/admin-foundation/spec.md` actualizado |
| 3.1 Tests | `ng test --include='**/admin-dashboard-page.spec.ts'` → **8/8 SUCCESS** |

## Archivos tocados

- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.ts`
- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.html`
- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.css`
- `apps/frontend-angular/src/app/features/admin/admin-dashboard-page.spec.ts`
- `apps/frontend-angular/src/app/app.routes.ts`
- `openspec/specs/admin-foundation/spec.md`
- `sdd/frontend-dashboard/{proposal,spec,design,tasks,apply-progress,exploration}.md`

## Decisiones de apply

- Acciones según proposal del ciclo (no las 5 exactas de v0): Nueva certificación, Nuevo curso, Alumnos, Configuración, Carga masiva disabled.
- Resumen: un `listar()` de certificados filtra emitidas (`vigente|vencido`) y revocadas; cursos vía `listar().length`; alumnos vía `contar()`.
- Sin N+1 de fechas; sin `ATTENDANCE_SOURCE`.
- Bandeja: badges “—” + copy “Dato no disponible…”; meta “Sin totales — fuente pendiente”.
- Actividad: empty state sin tabla seed.

## Pendiente para verify (orquestador)

- `npm run test:ci` completo
- `npm run build`
- Paridad visual rápida vs `muestra_pagina/capturas/admin-*.png` (jerarquía; wording de acciones propio del ciclo)
- Archive + docs/frontend

## No hecho (fuera de alcance)

- API actividad/pendientes
- Shell topbar v0 (buscador/campana)
- Carga masiva real
