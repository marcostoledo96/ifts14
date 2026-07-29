# Design: Auditoría P11 — detalle de alumnos

## Technical Approach

Auditoría quirúrgica in-place sobre `StudentDetailPage` (proposal + explore #1). Conservar trayectoria, links expediente/emitir, DNI completo UI, mensajes sin PII y panel asistencias read-only. Cerrar gaps: copy sin «legajo»; `certificacionesRevocadas` null → «—» (paridad `formatoMetrica` del listado); **Reintentar** solo si `obtener` falla de forma recuperable (patrón P10 `errorCargaRecuperable`). Delta `admin-students-frontend`. Sin HTTP, listado, editor, backend ni cambio de `estadoCert` unknown.

## Architecture Decisions

| Decisión | Opciones | Tradeoff | Elección |
|----------|----------|----------|----------|
| Alcance de archivos | Solo detail vs + HTTP/listado | HTTP/`ingreso` fuera de P11 | **`student-detail-page.{ts,html,css,spec.ts}`** |
| Copy «legajo» | Diferir vs eliminar | Confirmado; honesty P9/P10 | **Eliminar** kicker/título error; kicker «Ficha» + chip `#id` |
| CSS `kicker-legajo` | Dejar nombre vs rename | Nombre miente | **Rename** a `kicker-ficha` (o reusar `.kicker` si el estilo es idéntico) |
| Revocadas null | Coerce → 0 vs «—» | Confirmado paridad listado | **null → «—»**, `0` → `0`; quitar coerce del computed |
| Presentación métrica | Nuevo helper vs ternario template | Válidas/cursos ya usan ternario | **Ternario** en template como válidas/cursos; acentos solo si número > 0 |
| Error carga | Siempre Reintentar vs flag | Id inválido / no encontrado no se curan | **`errorRecuperable`**: true solo en `catch` de `cargar` |
| `estadoCert` unknown | Mapear ahora vs diferir | Confirmado diferido | **No tocar** fallback `'pendiente'` |
| Fuente | Cambiar seam vs `STUDENTS_SOURCE` | Patrón vigente | Conservar **HTTP staging / in-memory tests** |

## Data Flow

```
paramMap :id
    │
    ├─ ausente / no numérico → error (no recuperable) → solo Volver
    └─ id válido → cargar(id) [loadGeneration++]
              │
              ├─ obtener → null → «Alumno no encontrado.» (no recuperable) → Volver
              ├─ catch → error + errorRecuperable=true → Reintentar|Volver
              └─ OK → alumno + métricas (revocadas: null→«—», 0→0)
                        │
                        └─ trayectoria / links / asistencias (sin cambio de contrato)
```

Reintentar:

```
onReintentar()
    │
    ├─ !errorRecuperable → no-op (botón ausente en UI)
    └─ parseInt(:id) OK → cargar(id) (misma generación/race que hoy)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../detail/student-detail-page.ts` | Modify | Quitar coerce revocadas; `errorRecuperable` signal; set true solo en `catch`; reset en id inválido / null / éxito; `onReintentar` gate |
| `.../detail/student-detail-page.html` | Modify | Kicker «Ficha»; título error sin «legajo»; Reintentar `@if (errorRecuperable())`; revocadas null→«—» |
| `.../detail/student-detail-page.css` | Modify | Rename `.kicker-legajo` → `.kicker-ficha` (mínimo) |
| `.../detail/student-detail-page.spec.ts` | Modify | Sin Legajo; métricas null vs 0; carga + Reintentar; id inválido / no encontrado sin Reintentar; DNI UI / sin PII |
| `openspec/changes/.../specs/admin-students-frontend/spec.md` | Create | Delta detalle: copy, métricas 0 vs —, Reintentar recuperable |

**No modificar**: listado, editor, `http-students.service.ts`, backend PHP, token/QR, hub asistencias (P12), fallback `estadoCert`.

## Interfaces / Contracts

Sin cambios de API HTTP. Contratos UI:

- Copy: sin «legajo»/«Legajo»/«legajos»; kicker «Ficha»; chip `#{{ id }}` con title honesto.
- Métricas: `cursosConAsistencia` / `certificacionesValidas` / `certificacionesRevocadas` — null → «—», número (incl. 0) literal.
- Error: id inválido / ausente / no encontrado → solo «Volver a Alumnos»; fallo `obtener` → Reintentar + Volver.
- DNI: `dniMostrar` completo en ficha; mensajes de error sin DNI ni token.
- Trayectoria y links: sin cambio (emitida→expediente; pendiente→emitir; en-curso→copy).

```typescript
readonly errorRecuperable = signal(false);
// catch de cargar → errorRecuperable.set(true)
// id inválido | null | OK → errorRecuperable.set(false)
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Copy sin legajo/legajos | `student-detail-page.spec.ts` (invertir assert Legajo) |
| Unit | Revocadas null→«—», 0→`0`; otras métricas sin regresión | stub `AlumnoDetalle` con null/0 |
| Unit | Id inválido / null → Volver, sin Reintentar | navigate/`paramMap` + textContent |
| Unit | Catch recuperable → Reintentar llama `obtener` de nuevo | stub throw + `onReintentar` |
| Unit | DNI completo; error sin DNI/token; links trayectoria | asserts existentes + refuerzo |
| Integration / E2E | — | Fuera; smoke staging opcional post-apply |

## Threat Matrix

N/A — sin routing/shell/subprocess/VCS/PR ni process-integration nuevos. Ruta `alumnos/:id` ya existe.

## Migration / Rollout

No migration required. Frontend-only; rollback = revert `student-detail-page.*` + delta de spec.

## Open Questions

- Ninguna bloqueante (defaults confirmados: sin legajo; revocadas «—»; Reintentar solo recuperable; `estadoCert` diferido).
- Pendiente `sdd-spec`: Given/When/Then del delta detalle.
- Pendiente apply: elegir rename CSS vs reusar `.kicker` si el estilo coincide byte a byte.
