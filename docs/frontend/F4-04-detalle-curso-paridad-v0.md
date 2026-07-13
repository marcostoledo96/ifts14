# F4-04 — Detalle de curso con paridad v0

## Alcance

`/admin/cursos/:id` evoluciona in-place con ficha del curso, tabla desktop, tarjetas mobile y el estado de asistencias por fecha. Reutiliza `COURSES_SOURCE`, el seam opcional `ATTENDANCE_SOURCE` y las rutas existentes; no agrega backend, HTTP, storage, dependencias ni asociación de certificaciones por nombre.

## Evidencia

| Escenario | Evidencia |
|---|---|
| Desktop | [Captura desktop 1280](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/evidence/desktop-1280.png) |
| Mobile | [Captura mobile 390](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/evidence/mobile-390.png) |
| Cancelada | [Captura de fecha cancelada](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/evidence/cancelada.png) |
| Sin fechas | [Captura de curso sin fechas](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/evidence/empty.png) |
| Realizada con presentes y acción `Ver` | [Captura desktop](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/evidence/realizada.png) y [captura mobile](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/evidence/mobile-390-realizada.png) |

La captura de realizadas fue producida en runtime mock con el curso 4: muestra 8 y 7 presentes. La acción `Ver` fue recorrida hacia `/admin/cursos/4/fechas/41/asistencias`.

## Accesibilidad y privacidad

- Un único `output[aria-live="polite"][aria-atomic="true"]` resume carga, error y métricas.
- La tabla tiene `caption` y encabezados `scope="col"`; las tarjetas mobile representan la misma fecha, estado, conteo y acción.
- Fechas canceladas no exponen acción; sin fechas ofrece el enlace existente `Agregar fecha` al editor.
- Una lista de asistencia vacía real muestra `Pendiente` y habilita `Cargar`; un seam ausente, rechazado o con throw síncrono muestra `No disponible` sin acción habilitada.
- El detalle solo deriva el conteo de filas de asistencia. No muestra DNI, email, token, UUID, legajo ni matrícula.
- Un throw síncrono no conforme del seam de asistencia se transforma en rechazo de `Promise.allSettled`, por lo que degrada solo esa fecha.

## Handoff explícito

- La carga y edición real de asistencias sigue en `/admin/cursos/:id/fechas/:fechaId/asistencias`; F4-04 solo la enlaza mediante `Cargar` o `Ver` cuando la asistencia está disponible.
- Certificaciones permanece fuera de alcance: el contrato no expone una asociación inequívoca por `cursoId`, por lo que F4-04 no infiere ni muestra totales.
- Persistencia, backend, HTTP y autenticación real requieren un ciclo posterior con contrato aprobado.

## Referencias

- [Proposal](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/proposal.md)
- [Design](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/design.md)
- [Delta spec](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/specs/admin-courses-frontend/spec.md)
- [Notas de paridad](../../openspec/changes/archive/2026-07-13-f4-04-course-detail/evidence/parity-notes.md)
