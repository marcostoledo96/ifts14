# Proposal: Auditoría P15 — certificados por fecha

## Intent

Cerrar honesty y gap P15 en `DateCertificatesPage`: catches pintan `(e as Error).message` crudo; sin `errorRecuperable`/Reintentar; falta link a expediente. Listado por `cursoId`, empty, Copiar/QR/PDF y DNI completo ya OK.

## Scope

### In Scope

- Carga: `errorRecuperable` + Reintentar solo en catch recuperable; mensaje fijo.
- Id inválido / not-found: mensaje controlado **sin** Reintentar.
- Acciones (Copiar, QR, PDF): `mensajeErrorApi`/genérico; sin Reintentar; sin raw `Error.message`.
- Link «Expediente» por fila → `/admin/certificaciones/:id`.
- Tests: vacío, honesty, expediente; anti-token/DNI; orden Copiar→QR→PDF.
- Delta corto en `admin-attendances-frontend`.

### Out of Scope

- P14 marcado; P16 listado; HTTP/backend/token/QR.
- Filtrar por `fechaId`; ruta `/entrega`; aviso fecha huérfana.
- Copy empty/intro salvo typo.

## Capabilities

### New Capabilities

None

### Modified Capabilities

- `admin-attendances-frontend`: «Página de certificados del curso (por fecha)» — honesty + Expediente por fila.

## Approach

Enfoque 1 (explore): solo `date-certificates-page.*` + delta. Conservar listado `cursoId` y entrega inline (Copiar+QR); agregar Expediente; errores al patrón P13/P14.

### Assumptions confirmadas

1. Enfoque 1 quirúrgico.
2. Link «Expediente» por fila.
3. Entrega = Copiar + QR inline (sin `/entrega`).
4. Reintentar solo en load catch.
5. Acciones: `mensajeErrorApi`; sin Reintentar.
6. Fecha huérfana diferida.
7. Hard lock: no P14/P16/HTTP/token/backend.
8. DNI completo en UI; sin PII en logs/errores.
9. Sin cambios empty/intro salvo typo.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `date-certificates-page.ts` | Modified | `errorRecuperable`; `mensajeErrorApi` |
| `date-certificates-page.html` | Modified | Reintentar condicional; Expediente |
| `date-certificates-page.spec.ts` | Modified | Vacío, honesty, expediente |
| `date-certificates-page.css` | Modified | Estilo mínimo del link si hace falta |
| delta `admin-attendances-frontend` | Modified | Honesty + expediente |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Filtrar por fecha → vacío falso | Low | Hard lock: listado `cursoId` |
| Raw message / PII en UI | Med | `mensajeErrorApi` + tests |
| Reintentar en not-found | Low | Flag solo catch recuperable |
| Scope creep P16 | Low | Solo página + delta |

## Rollback Plan

Revertir `date-certificates-page.*` y el delta; sin migración ni HTTP nuevo.

## Dependencies

- Patrón honesty P13/P14; ruta expediente admin ya existente.

## Success Criteria

- [ ] Load recuperable: Reintentar; not-found: no.
- [ ] Acciones: mensaje seguro; sin raw `Error.message`.
- [ ] Link «Expediente» por fila a `/admin/certificaciones/:id`.
- [ ] Tests vacío/honesty/expediente; anti-token/DNI intactos.
- [ ] Delta refleja honesty + expediente; sin P14/P16/backend.
