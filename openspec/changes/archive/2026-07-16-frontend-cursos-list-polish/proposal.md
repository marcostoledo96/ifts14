# Proposal: Lista de cursos — UI polish

## Intent

Alinear la lista Angular `/admin/cursos` a la paridad visual de `muestra_pagina` (chips de estado, badges con dot, acento lateral, estados con iconos) **sin inventar métricas** ni tocar backend. Presentes/Certificaciones siguen `—` porque la API no expone conteos.

## Scope

### In Scope
- Reemplazar `<select>` de estado por chips toggle con dots (Borrador / Activos / Cerrados / Archivados).
- Badge de estado con dot + borde semántico; etiqueta humana.
- Acento lateral en filas tabla y franja en cards mobile.
- Loading / error / empty / sin-coincidencias con iconos SVG inline; empty con CTA “Crear primer curso”.
- Mantener chips Con/Sin fechas y placeholders honestos de Presentes/Certificaciones.
- Actualizar specs TDD de `CoursesListPage`.
- Delta menor en `admin-courses-frontend` (chips vs select; estados enriquecidos).

### Out of Scope
- Backend, DTO, agregados SQL, N+1 a asistencias/certificados.
- Fabricar `alumnosPresentes` / `certificaciones` en mock o HTTP.
- Vista QA demo (opcional; no bloqueante).
- Port literal de React/lucide; shell/sidebar; editor/detalle.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `admin-courses-frontend`: filtro estado = chips toggle; badge+acento; estados UI con iconos/CTA; placeholders Presentes/Certif. se mantienen.

## Approach

**UI polish only** (explore Approach 1). Toggle **single** (como certs): `onEstado(e)` desactiva si ya está activo → `todos`. Labels adaptados al contrato de 4 estados (no binario v0). Tokens F1-02; SVG inline. Identifiers EN; copy UI ES-AR.

## Proposal question round

Cerrado por locks del orquestador (no se pide nueva ronda):

1. Presentes/Certif. → `—` (no inventar / no N+1).
2. Chips Activos/Cerrados/Archivados + Borrador (modelo ya lo tiene).
3. Badge dot+borde; acento lateral; iconos SVG en estados.
4. Mantener Con/Sin fechas; no backend; no React literal.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `courses-list-page.{ts,html,css,spec.ts}` | Modified | Polish principal + TDD |
| `openspec/specs/admin-courses-frontend` | Modified | Chips + estados UI |
| Servicios / models / backend | Unchanged | Sin conteos inventados |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Specs asumen `<select>` | High | Reescribir tests en apply |
| Labels ≠ v0 Activos/Inactivos | Low | Documentar adaptación de contrato |
| `cantidadFechas=0` HTTP engañoso | Med | No inventar; mostrar valor derivado existente |
| Budget CSS | Med | Reutilizar tokens; sin deps nuevas |

## Rollback Plan

Revertir `courses-list-page.*` y el delta de `admin-courses-frontend`. Sin DB/API.

## Dependencies

- `COURSES_SOURCE` / `CursosFiltros.estado?` singular.
- Referencia visual: `muestra_pagina/.../lista-cursos.tsx` + capturas.
- Patrón hermano: chips `aria-pressed` de certificaciones.

## Success Criteria

- [ ] Chips de 4 estados con dots; toggle single.
- [ ] Badge + acento lateral; fechas filter intacto.
- [ ] Presentes/Certif. = `—` + copy a11y.
- [ ] Estados loading/error/empty con iconos; empty con CTA.
- [ ] Specs focalizados verdes; sin cambios backend.
