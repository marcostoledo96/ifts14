# Proposal: Auditoría P16 — listado de certificaciones admin

## Intent

Cerrar el gate P16 sobre `/admin/certificaciones` (`certifications-list-page.*`): checklist mayormente OK; cerrar pager hardcode `[1..5]`, resumen durante carga, grammar «coincide/coinciden», y drift de spec mock-only (entrega/borrador/vencido) vs HTTP + `vigente|revocado`.

## Scope

### In Scope

- Conservar checklist OK: filtros estado+curso+texto; DNI completo (`documentMasked`); vacíos; labels Válida/Revocado; CTA nueva; enlaces detalle/PDF; QA solo fuera de prod; catch fijo + Reintentar; sin token/PII en logs.
- `paginasVisibles` (≤5 botones + elipsis; páginas >5 alcanzables).
- Gate resumen (`mostrarResumen` / `!cargando() && !error()`).
- Copy singular/plural + assert del test.
- Tests mínimos: pager >5, resumen oculto en carga, grammar; sin debilitar anti-token/DNI ni «sin Estado de entrega».
- Delta MODIFIED `admin-certifications-frontend`: renombrar «Listado mock-only…» → «Listado admin de certificaciones»; HTTP/seam; filtros reales; DNI; pager 20; honesty; QA.

### Out of Scope

- `errorRecuperable` (listados usan `error` string).
- Filtro entrega / `borrador`/`vencido`/`pendiente` de v0.
- HTTP/backend; token/QR; P17–P21; P15 archive uncommitted; CSS salvo elipsis mínimo.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-certifications-frontend`: listado = HTTP/`CERTIFICATIONS_SOURCE`, filtros reales, DNI UI, `paginasVisibles`, resumen gated, honesty, QA; sin entrega/borrador/vencido en listado.

## Approach

Auditoría quirúrgica (explore #1): page + tests + delta. Paridad listados admin. Sin HTTP ni otras fases.

## Defaults locked

1–8 de explore aceptados. Heading: renombrar. Empty/error copy: sin cambios.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `certifications/pages/list/certifications-list-page.ts` | Modified | pager, resumen, grammar |
| `…/certifications-list-page.html` | Modified | pager + gate + copy |
| `…/certifications-list-page.spec.ts` | Modified | tests gaps |
| `…/certifications-list-page.css` | Conditional | elipsis si hace falta |
| `openspec/specs/admin-certifications-frontend/spec.md` | Modified | delta listado |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Restaurar entrega/v0 | Med | Hard lock |
| Forzar `errorRecuperable` | Low | Honesty as-is |
| Tocar HTTP | Med | Hard lock; filtros client-side |
| Mezclar P15 uncommitted | Med | No editar/stagear P15 |
| Scope creep P17–P21 | Med | Solo listado |
| Pager mal testeado | Low | Test >5 páginas |

## Rollback Plan

Revertir commits en `certifications-list-page.*` y delta de spec. Sin migraciones ni API.

## Dependencies

Explore P16; plan QA §P16; patrón listados admin; rama `audit/p16-certs-list`.

## Success Criteria

- [ ] Checklist P16 OK; páginas >5 alcanzables; resumen oculto en carga/error; grammar correcto.
- [ ] Spec sin mock-only/entrega/borrador/vencido en listado; tests verdes.
- [ ] Sin HTTP/backend, sin `errorRecuperable`, sin P15/P17–P21; sin commit/push en esta fase.
