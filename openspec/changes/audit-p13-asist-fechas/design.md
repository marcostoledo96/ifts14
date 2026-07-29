# Design: Auditoría P13 — intermedia de fechas de asistencia

## Technical Approach

Auditoría quirúrgica in-place sobre `AttendanceCourseDatesPage` (proposal + explore #1). Conservar orden cronológico, chips `programada`/`realizada`, CTA marcado, empty + link detalle, `loadGen`, sin PII. Cerrar gaps: **Reintentar** solo si `listarHub` falla (patrón P08/P11 `errorRecuperable`); título de panel distinto not-found vs carga. Delta corto `admin-attendances-frontend`. Sin HTTP, hub P12 ni marcado P14.

## Architecture Decisions

| Decisión | Opciones | Tradeoff | Elección |
|----------|----------|----------|----------|
| Alcance | Solo course-dates vs + HTTP/hub | Confirmado sin HTTP/hub/marcado | **`attendance-course-dates-page.{ts,html,spec.ts}`** |
| Flag recuperable | Siempre Reintentar vs `errorRecuperable` | Paridad P08/P11 | **`errorRecuperable`**: true solo en `catch` |
| Título panel | Un título vs bifurcado | Confirmado honesty | **`@if (errorRecuperable())`**: carga vs «Curso no encontrado» |
| Copy mensaje | Reusar strings vigentes | Sin inventar PII | Mantener «Curso no encontrado.» / «No se pudieron cargar las fechas. Reintentá.» |
| `onReintentar` | Siempre `cargar` vs gate | Evitar retry inútil | **no-op si `!errorRecuperable()`** |
| Sort/filtros/CTA | Refactor vs intactos | Riesgo regresión | **No tocar** sort, chips, `linkMarcado`, empty |

## Data Flow

```
paramMap :id → effect → cargar(id) [loadGen++]
    │
    ├─ id inválido / ≤0 → error + errorRecuperable=false → solo Volver
    │                     título: «Curso no encontrado»
    └─ id OK → listarHub()
              │
              ├─ curso ausente → error + errorRecuperable=false → solo Volver
              │                  título: «Curso no encontrado»
              ├─ catch → error + errorRecuperable=true → Reintentar|Volver
              │          título: «No pudimos cargar las fechas»
              └─ OK → filas (≠ cancelada) sort fecha→orden→id; chips/CTA intactos
```

Reintentar:

```
onReintentar()
    │
    ├─ !errorRecuperable → no-op (botón ausente en UI)
    └─ cargar() (misma generación/race que hoy)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../course-dates/attendance-course-dates-page.ts` | Modify | Signal `errorRecuperable`; false al inicio / id inválido / curso ausente / éxito; true en `catch`; gate `onReintentar` |
| `.../course-dates/attendance-course-dates-page.html` | Modify | Título bifurcated; Reintentar `@if (errorRecuperable())`; Volver siempre |
| `.../course-dates/attendance-course-dates-page.spec.ts` | Modify | Id inválido/9999 sin Reintentar + título not-found; catch con Reintentar + `listarHub` de nuevo; regresión checklist |
| `openspec/changes/.../specs/admin-attendances-frontend/spec.md` | Create | Delta intermedia: Reintentar recuperable + títulos |

**No modificar**: `attendances-list-page`, marcado P14, `ATTENDANCE_SOURCE`/`listarHub`, CSS salvo necesidad mínima inexistente, backend.

## Interfaces / Contracts

Sin cambios de API HTTP. Contratos UI:

```typescript
readonly errorRecuperable = signal(false);
// inicio de cargar / id inválido / !curso / OK → false
// catch de listarHub → true
// onReintentar: if (!errorRecuperable()) return;
```

Títulos (h2 `.estado-title`):

| Caso | Título | Mensaje (`error`) | Acciones |
|------|--------|-------------------|----------|
| Id inválido / curso ausente | Curso no encontrado | Curso no encontrado. | Solo Volver |
| Catch `listarHub` | No pudimos cargar las fechas | No se pudieron cargar las fechas. Reintentá. | Reintentar + Volver |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Id `abc` / curso `9999` → Volver, sin Reintentar, título not-found | `attendance-course-dates-page.spec.ts` |
| Unit | Stub throw `listarHub` → Reintentar+Volver; re-llama hub; título carga | mock reject + click |
| Unit | Regresión: orden, chips, CTA, empty, Volver hub, reset filtros al cambiar `:id` | asserts existentes |
| Unit | Mensajes sin DNI/token | textContent |
| Integration / E2E | — | Fuera; smoke staging opcional post-apply |

## Threat Matrix

N/A — sin routing/shell/subprocess/VCS/PR ni process-integration nuevos. Ruta `asistencias/curso/:id` ya existe.

## Migration / Rollout

No migration required. Frontend-only; rollback = revert `attendance-course-dates-page.*` + delta de spec.

## Open Questions

- Ninguna bloqueante (defaults confirmados).
- Pendiente apply: focused `npx ng test --include='**/attendance-course-dates-page.spec.ts' --no-watch --browsers=ChromeHeadless`.
