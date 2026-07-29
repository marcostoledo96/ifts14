# Design: Auditoría P14 — marcado de asistencias + emisión

## Technical Approach

Auditoría quirúrgica in-place sobre `AttendanceMarkingPage` (proposal + explore #1). Conservar checklist CRITICAL ya OK: marcar/guardar, bucle **serial** `for`+`await` emit/regen, navigate+state a certificados, DNI completo, token estable. Cerrar gaps: **`errorRecuperable` + Reintentar** solo en catch de carga (paridad P08/P11/P13); **`mensajeErrorApi`** en catch externo de `marcar`; suite de tests (fecha futura, serial, Reintentar); delta corto `admin-attendances-frontend`. Sin HTTP `marcar`, backend, rotación token/QR ni P15.

## Architecture Decisions

| Decisión | Opciones | Tradeoff | Elección |
|----------|----------|----------|----------|
| Alcance | Página+tests+delta vs +HTTP marcar | Confirmado enfoque 1 | **`attendance-marking-page.{ts,html,spec.ts}`** + delta |
| HTTP `marcar` `Promise.all` | Serializar DELETE/POST vs intacto | Riesgo latencia / sin evidencia 401 guardar | **NO TOCAR** |
| Flag recuperable | Siempre Reintentar vs `errorRecuperable` | Paridad P13 | **true solo en `catch` de `cargar`** |
| Catch `marcar` | `(e as Error).message` vs `mensajeErrorApi` | Envelope 400 | **`mensajeErrorApi(e)`** |
| Bucle emit/regen | Parallelizar vs serial | **401 session lock** cPanel | **DO NOT TOUCH** (solo tests de orden) |
| `regenerado:false` | No-op vs cuenta actualizado | Honesty menor | **dejar as-is** |
| Token/QR | Documentar vs tocar regen | Hard rule AGENTS | **solo invariante en delta**; no backend |
| P15 date-certificates | Tocar feedback vs lectura | Scope creep | **solo lectura** |

## Data Flow

```
paramMap :id/:fechaId → effect → cargar(id,fid) [loadGen++]
    │
    ├─ id/fecha inválidos → error + errorRecuperable=false → sin Reintentar
    └─ Promise.all(obtener, listarAlumnos, listarAsistencias)
              │
              ├─ catch → error + errorRecuperable=true → Reintentar|Volver
              └─ OK → roster; fechaNoEncontrada si fid ∉ fechas (sin Reintentar)

guardarYGenerar():
    marcar(todos) ──catch──→ mensajeErrorApi → error (sin tocar serial)
    │
    ├─ fechaClase > hoy AR → fallidos=presentes; copy futura; SIN emitir/regen
    └─ else → listar vigentes → for+await regenerarPdf|emitir (SERIAL)
              → navigate certificados { resumenGen, mensaje }
```

Reintentar:

```
onReintentar()
    │
    ├─ !errorRecuperable → no-op
    └─ cargar(id(), fechaId())  // misma generación/race
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../marking/attendance-marking-page.ts` | Modify | Signal `errorRecuperable`; false al inicio / id inválido / éxito; true en catch `cargar`; gate `onReintentar`; catch `marcar` → `mensajeErrorApi` |
| `.../marking/attendance-marking-page.html` | Modify | Reintentar `@if (errorRecuperable())` junto al error de carga |
| `.../marking/attendance-marking-page.spec.ts` | Modify | Futura (mensaje+fallidos, sin emit/regen); spies seriales; Reintentar; conservar tokenPrefix |
| `openspec/changes/.../specs/admin-attendances-frontend/spec.md` | Create | Delta: SERIAL; mensajes 400 futura/programada/sin presentes; invariante token (documentar) |

**No modificar**: `http-attendance.service` (`marcar` Promise.all), `http-certifications`, backend, `date-certificates-page` (P15), CSS salvo necesidad mínima inexistente, bucle serial salvo asserts.

## Interfaces / Contracts

Sin cambios de API HTTP. Contratos UI:

```typescript
readonly errorRecuperable = signal(false);
// inicio cargar / id|fecha inválidos / OK → false
// catch Promise.all carga → true
// onReintentar: if (!errorRecuperable()) return;
// catch marcar: this.error.set(this.mensajeErrorApi(e));
```

| Caso | `errorRecuperable` | Acciones |
|------|--------------------|----------|
| Id/fecha inválidos | false | Sin Reintentar (mensaje vigente) |
| Catch carga | true | Reintentar + navegación existente |
| `fechaNoEncontrada` | false | Panel existente (detalle/editar) |
| Catch `marcar` | n/a | `mensajeErrorApi`; copy sin DNI/token |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Id/fecha inválidos → sin Reintentar | `attendance-marking-page.spec.ts` |
| Unit | Stub throw carga → Reintentar; re-llama fuentes | mock reject + click |
| Unit | Fecha futura → guardado OK; emit/regen no llamados; fallidos+copy | stub fecha > hoy AR |
| Unit | Emit/regen en serie (no solapados) | spies + orden de llamadas |
| Unit | Regenerar: `tokenPrefix` estable | assert existente |
| Unit | Catch marcar con envelope 400 → mensaje API | `HttpErrorResponse` stub |
| Verify | Smoke staging multi-PDF sin 401 | gate post-apply (no implementación) |

## Threat Matrix

N/A — sin routing/shell/subprocess/VCS/PR ni process-integration nuevos.

**Nota CRITICAL (session lock)**: paralelizar emit/regen o tocar el bucle serial → riesgo **401** por session lock PHP en cPanel. Mitigación de diseño: bucle intacto + test de secuencia. HTTP `marcar` paralelo queda documentado fuera de alcance.

## Migration / Rollout

No migration required. Frontend-only; rollback = revert `attendance-marking-page.*` + delta de spec. Sin migración ni backend.

## Open Questions

- Ninguna bloqueante (defaults locked).
- Pendiente apply: focused `npx ng test --include='**/attendance-marking-page.spec.ts' --no-watch --browsers=ChromeHeadless`.
- Verify: smoke staging multi-presentes sin 401 (gate).
