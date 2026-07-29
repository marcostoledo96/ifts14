# Proposal: Auditoría P14 — marcado de asistencias + emisión

## Intent

Cerrar gaps CRITICAL P14 en `/admin/cursos/:id/fechas/:fechaId/asistencias` (`attendance-marking-page.*`): Reintentar recuperable, envelope 400 en catch de `marcar`, tests de fecha futura + emisión serial. Checklist (marcar/guardar, bucle serial, token estable, navigate+state, DNI completo) ya OK.

**Defaults confirmados**: página+tests+delta; sin tocar `HttpAttendanceService.marcar` salvo 401 en guardar; Reintentar solo `errorRecuperable`; `mensajeErrorApi` en catch marcar; `regenerado:false` como actualizado; delta corto; **prohibido** rotar token/QR, backend o P15.

## Scope

### In Scope

- `errorRecuperable` + Reintentar solo en catch de carga; id/fecha inválidos o not-found sin Reintentar.
- Catch de `marcar` → `mensajeErrorApi` para envelopes 400.
- Conservar bucle serial emit/regen.
- Tests: fecha futura (mensaje + `fallidos`, sin emit/regen); spies seriales; tokenPrefix; Reintentar.
- Delta corto `admin-attendances-frontend`: SERIAL; mensajes 400 futura/programada/sin presentes; invariante token permanente (solo documentar).

### Out of Scope

- HTTP `marcar` / certificaciones / backend; P15 date-certificates; honesty `regenerado:false`; SMTP; rediseño; P12/P13.

## Capabilities

### New Capabilities

None

### Modified Capabilities

- `admin-attendances-frontend`: Hub/Guardar — Reintentar recuperable; emit/regen en serie; mensajes 400 futura/programada/sin presentes; token no rota (invariante vía `pdf-regeneration` / `admin-certificate-emission`, sin cambiar esos specs).

## Approach

Auditoría quirúrgica (explore #1): flag carga; `mensajeErrorApi` en marcar; suite CRITICAL; delta mínimo. HTTP solo documentado. Verify: smoke staging multi-PDF sin 401 (gate).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `attendance-marking-page.ts` | Modified | `errorRecuperable`; catch marcar; serial intacto |
| `attendance-marking-page.html` | Modified | Reintentar condicional |
| `attendance-marking-page.spec.ts` | Modified | Futura, serial, Reintentar; tokenPrefix |
| `admin-attendances-frontend` | Modified | Delta corto |
| HTTP / backend / P15 | Unchanged | Fuera de alcance |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Paralelizar emit → 401 | Med | No tocar serial; test orden |
| Rotar token/QR | Low | Hard rule; tokenPrefix; no backend |
| Serializar `marcar` a ciegas | Low | Prohibido en P14 |
| Scope creep P15/backend | Low | Solo `marking` page.* |
| PII en mensajes | Low | Copy fijo sin DNI/token |

## Rollback Plan

Revertir PR de `attendance-marking-page.*` y delta; sin migración ni backend.

## Dependencies

- Explore P14 + defaults; patrón P08/P11/P13 `errorRecuperable`; `mensajeErrorApi`.

## Success Criteria

- [ ] Catch carga: Reintentar; id/fecha inválidos o not-found sin Reintentar.
- [ ] Catch `marcar`: envelope 400 vía `mensajeErrorApi`; sin PII.
- [ ] Fecha futura: guardado OK; sin emit/regen; `fallidos` + copy.
- [ ] Emit/regen serial; tokenPrefix estable.
- [ ] Delta OK; sin HTTP/backend/P15.
