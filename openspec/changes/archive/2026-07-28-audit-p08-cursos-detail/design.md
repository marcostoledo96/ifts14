# Design: Auditoría P8 — detalle de curso admin

## Technical Approach

Fix quirúrgico in-place en `CourseDetailPage` (proposal + explore #1). Sin tocar `HttpCoursesService`, listado, editor ni hub. El catch de `cargar()` normaliza not-found vs recuperable; la plantilla expone CTA al hub real, labels humanas y fechas es-AR. Asunciones confirmadas: CTA «Ver fechas del curso»; conservar «Ver y entregar»; 404 solo en página; ocultar cuatrimestre placeholder; alcance `course-detail-page.*` (+ delta spec).

## Architecture Decisions

| Decisión | Opciones | Tradeoff | Elección |
|----------|----------|----------|----------|
| Dónde mapear 404/not-found | Página vs `HttpCoursesService.obtener` | Servicio limpia API global pero ensancha blast radius | **Página** (`cargar` catch) |
| Criterio not-found | Solo `status===404` vs 404 + mensaje in-memory | Staging HTTP + tests in-memory | **Ambos**: `HttpErrorResponse.status===404` **o** `Error.message` que empiece con `Curso no encontrado` |
| Copy not-found | Mensaje con id vs limpio | Id filtra al DOM hoy | **`Curso no encontrado.`** único |
| Error recuperable | Texto plano vs + Reintentar | Checklist P8 exige reintento | Mensaje amigable + **Reintentar** → `cargar()` |
| Acceso hub | Ruta v0 ficticia vs hub Angular | v0 `/admin/cursos/:id/asistencias` no existe | **`/admin/asistencias/curso/:id`** copy «Ver fechas del curso» |
| Deep-links fila | Quitar vs conservar | Honestidad operativa | Conservar «Abrir primera fecha» y «Ver y entregar» |
| Labels estado curso | Crudo / editor detallado / listado | Paridad listado | **Activo / Inactivo** (`estado==='activo'` vs resto) |
| Labels estado fecha | Crudo vs hub | Consistencia admin | **Programada / Realizada / Cancelada** (patrón hub) |
| Fechas ISO | `date` pipe / ISO crudo / `Intl es-AR` | Hub ya usa Intl | **`formatFecha` local** (mismo patrón que `AttendanceCourseDatesPage`) |
| Cuatrimestre | Mostrar placeholder vs ocultar | Listado oculta «Sin programar» | **No renderizar** en ficha |
| «—» tras Pendiente | Dejar vs quitar | Confunde con null | **Quitar** el `@if` de «—» en tabla y cards |
| a11y error | Nuevo `role=alert` vs `output` existente | Specs actuales prohíben alert extra | Mantener **un** `aria-live` (`resumen`) |

## Data Flow

```
Route :id ──effect──► cargar(id)
                         │
              cid inválido ──► error=not-found; sin Reintentar
                         │
              courses.obtener(+ asistencias opcional)
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    OK → detalle    404 / "Curso     otro error
                    no encontrado*"  ──► error recuperable
                         │               + Reintentar
                         ▼
              error = "Curso no encontrado."

UI éxito: badge labels + formatFecha + CTA hub
         + deep-links marcado (sin cambio de ruta)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/frontend-angular/.../courses/course-detail-page.ts` | Modify | `mapearErrorCarga`; `errorRecuperable`; `onReintentar`; `etiquetaEstadoCurso`/`etiquetaEstadoFecha`; `formatFecha`; link hub |
| `.../course-detail-page.html` | Modify | UI error+Reintentar; CTA hub; labels; fechas; quitar «—»; sin cuatrimestre |
| `.../course-detail-page.css` | Modify | Ajuste menor CTAs/error si hace falta (budget bajo) |
| `.../course-detail-page.spec.ts` | Modify | Id inválido, 404 HTTP, in-memory not-found, Reintentar, hub href, labels, sin «—» |
| `openspec/changes/audit-p08-cursos-detail/specs/admin-courses-frontend/spec.md` | Create | Delta MODIFIED acotado a detalle (fase spec) |

**No modificar**: `http-courses.service.ts`, list/editor, backend, `AttendanceCourseDatesPage` (solo consumir ruta).

## Interfaces / Contracts

Contrato de UI (sin cambios de API):

- Not-found (id inválido, inexistente, HTTP 404): mensaje exacto `Curso no encontrado.` — sin id ni cuerpo técnico; **sin** botón Reintentar.
- Recuperable: copy estable tipo `No se pudo cargar el curso. Reintentá.` + botón Reintentar.
- Hub: `routerLink=['/admin/asistencias/curso', d.id]`, `data-testid` estable (p. ej. `cta-ver-fechas-curso`).
- Helpers privados en la página (no shared nuevo): detección 404 vía `HttpErrorResponse` + prefijo mensaje in-memory.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Not-found limpio (id/`Error`/404 mock) | `course-detail-page.spec.ts` + stub `COURSES_SOURCE` / `HttpErrorResponse` |
| Unit | Reintentar llama `cargar` | Spy / contador de `obtener` |
| Unit | CTA hub, labels, sin «—», «Ver y entregar» | DOM queries / `data-testid` |
| Integration | — | Fuera de alcance P8 |
| E2E | — | Fuera de alcance; QA manual staging opcional |

## Migration / Rollout

No migration required. Deploy frontend-only; rollback = revert de `course-detail-page.*` + delta.

## Open Questions

- Ninguna bloqueante: asunciones de propuesta confirmadas por el orquestador.
- Pendiente de fase `sdd-spec`: redactar escenarios Given/When/Then del delta (en paralelo o antes de tasks).
