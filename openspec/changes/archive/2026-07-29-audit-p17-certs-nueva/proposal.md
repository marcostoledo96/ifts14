# Proposal: Auditoría P17 — Nueva certificación

## Intent

Cerrar §P17 en `/admin/certificaciones/nueva`: pantalla edge válida, pero hoy expone `Error.message` crudo, el fallo de par no ofrece Reintentar, y el copy («complementario») no posiciona el rol frente al flujo habitual Asistencias (P14→P15).

## Scope

### In Scope

- Honesty quirúrgica en `certification-new-page.*` (paridad P15).
- Copy mínimo de rol vs Asistencias (subtítulo; opcional nota CTA).
- Tests honesty + copy.
- Delta MODIFIED `admin-certifications-frontend` / «Emisión directa…».

### Out of Scope

- Eliminar ruta/CTAs o deprecar «Nueva».
- HTTP, backend, `admin-certificate-emission`, token/QR.
- P14 marking, P15 date-certs, P18–P21, listado P16.
- Archive P16 uncommitted; commit/push.
- Link a Asistencias; rediseño preview.

## Capabilities

### New Capabilities

- None

### Modified Capabilities

- `admin-certifications-frontend`: MODIFIED «Emisión directa de certificación (pantalla nueva)» — honesty (`errorRecuperable` + Reintentar solo en loads catálogo/par; `mensajeErrorApi` en emit else sin Reintentar) + copy de rol edge vs hub; conservar ruta/CTAs y gates vigentes.

## Approach

Enfoque 1, defaults locked:

1. Conservar pantalla, ruta estática y CTAs.
2. Sin raw `Error.message` en catálogos, par ni emit else; `errorRecuperable` + Reintentar solo en catch de loads; emit else → `mensajeErrorApi` / genérico es-AR, sin Reintentar.
3. Subtítulo: emisión puntual alumno+curso; flujo habitual = marcar asistencias en una fecha y generar desde ahí. Quitar «complementario». Solo copy.
4. Spec: delta MODIFIED «Emisión directa…».
5. Tests honesty (catálogos/par/emit else) + copy; no debilitar anti-folio / 409 / query.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.../new/certification-new-page.ts` | Modified | Honesty + flags en loads |
| `.../new/certification-new-page.html` | Modified | Copy rol; Reintentar en `errorPar` |
| `.../new/certification-new-page.spec.ts` | Modified | Tests honesty + copy |
| `.../new/certification-new-page.css` | Modified | Solo si reusa `.btn-retry` |
| `openspec/.../admin-certifications-frontend/spec.md` | Modified | Delta «Emisión directa…» |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `errorRecuperable` en emit | Med | Solo loads; emit sin Reintentar |
| Copy vs guía admin | Low | Alinear con «alternativa» |
| Mezclar archive P16 | Med | No tocar; no commit/push |

## Rollback Plan

Revertir solo `certification-new-page.*` y el delta de spec del cambio.

## Dependencies

- Explore `audit-p17-certs-nueva` (defaults 1–9 locked).
- Paridad honesty P13–P15.

## Success Criteria

- [ ] Sin raw `Error.message` en catálogos / par / emit else.
- [ ] Reintentar en fallo de par; `errorRecuperable` solo en loads.
- [ ] Emit else con `mensajeErrorApi` / genérico; sin Reintentar.
- [ ] Subtítulo edge vs Asistencias; sin «complementario».
- [ ] Tests honesty + copy verdes; ruta/CTAs intactas.
- [ ] Delta MODIFIED «Emisión directa…»; hard locks respetados.
