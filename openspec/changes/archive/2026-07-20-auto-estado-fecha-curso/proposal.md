# Proposal: Auto-gestión de estado de fecha de curso

## Intent

Tras marcar presentes en una fecha **pasada**, auto-pasar `cert_curso_fechas.estado` a `realizada` y syncar snapshot para que «Guardar y generar» (emitir/regenerar) vea la clase. Hoy el estado es solo manual y la emisión exige `cf.estado = 'realizada'`.

## Scope

### In Scope
- Helper BE `refreshCourseDateEstado` en `recordAttendance` / `voidAttendance` (cubre batch FE N×DELETE+POST).
- Reglas: auto nunca toca `cancelada`; `realizada` solo si ≥1 asistencia activa y `fecha < hoy` (`America/Argentina/Buenos_Aires`); si no → `programada` (same-day, futura, o sin presentes).
- Sync snapshot existente cuando el estado involucra `realizada`.
- Tests PHP + mock FE con la misma regla.
- Deltas de specs + nota docs DB 003 (sin migración ENUM).

### Out of Scope
- Cron; safety-net en `emitir` (**diferido**, effort Medium).
- Endpoint batch; rediseño editor; regla `fecha <= hoy`; SMTP.

## Decisiones fijadas

| Tema | Decisión |
|------|----------|
| Momento | Solo write-path asistencia |
| Same-day | Queda `programada`; override manual `realizada` si Bedelía certifica el mismo día |
| Safety-net emitir | Diferido |
| Precedencia | Auto sobrescribe `programada`↔`realizada`; nunca `cancelada` |

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-master-data-api`: auto `programada`↔`realizada` al registrar/anular asistencias.
- `admin-attendances-frontend`: mock aplica la misma regla.
- `admin-certificate-emission`: filtro intacto; documentar certificables = activas en `realizada` (post-auto).

## Approach

Mutar asistencia → refresh estado (si no `cancelada`) → sync si involucra `realizada`. FE HTTP sin cambio de contrato (`fechaEstado` del DTO).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `AdminMasterDataService.php` | Modified | refresh + sync en record/void |
| Tests master-data / revision / snapshot | Modified | transiciones auto |
| `attendance-mock.service.ts` (+specs) | Modified | paridad |
| Specs master-data, attendances, emission | Modified | deltas |
| `database/docs/003-*.md` | Modified | semántica (archive) |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Same-day emit falla | High (esperado) | Override manual; documentar |
| Snapshot stale al anular último | Med | Sync al salir de `realizada` |
| Override manual pisado | Med | Documentar; UI diferida |

## Rollback Plan

Revertir helper, llamadas, tests, mock y specs. Sin migración. Fechas corregibles por PATCH editor.

## Dependencies

Sync snapshot y TZ AR ya existentes; hub FE ya marca antes de emitir.

## Success Criteria

- [ ] Fecha pasada + ≥1 presente → `realizada` + sync; emitir incluye la fecha.
- [ ] Anular todos → `programada` (si no cancelada); `cancelada` intacta.
- [ ] Same-day/futura → `programada`; mock y tests en verde.
