# Proposal: Paridad layout configuración institucional (P-14)

## Intent

Calcar el layout de `/admin/configuracion` hacia `muestra_pagina/.../configuracion-institucional.tsx`: nav sticky, secciones numeradas, copy de impacto y barra dirty, sin inventar persistencia fuera del DTO real.

## Scope

### In Scope
- Header «Folio institucional» + copy v0
- Banner de impacto con tres bullets
- Índice lateral sticky (desktop) con anclas a 5 secciones
- Secciones card: Identidad, Certificados, Autoridades, Contacto, Validación
- Campos editables solo del DTO: `institutionName`, `certificateText`, `rectorName`/`rectorRole`, `advisorName`/`advisorRole`, metadata `updatedAt`
- Bloques sin API (logos, upload firmas, email SMTP, sello, mensajes validación): presentacionales disabled u omitidos con nota honesta
- Preview tipográfica de firmas + sticky bar Guardar/Descartar
- Tests de página + gates `test:ci` / `tsc` / `build`

### Out of Scope
- Backend, uploads, SMTP, sello persistente, mensajes públicos editables
- Port literal React/Next o dependencia lucide npm
- Cambiar contrato `InstitutionalConfig` / HTTP

## Approach

Approach 1: rediseño HTML/CSS de `institutional-config-page.*` sobre el seam existente; SVG Lucide-like inline; sin nuevos endpoints.

## Risks

| Risk | Mitigation |
|------|------------|
| Controles fantasma leídos como reales | `disabled` + nota «sin API» / omitir |
| Spec previa REQ-CFG exige «sin inputs fantasma» | Mantener: sin `input[type=file]`; email/validación sin inputs editables |
| Budget CSS | Un solo stylesheet de página; tokens `:root` existentes |

## Rollback

Revertir `institutional-config-page.*` y docs del ciclo.

## Ready for Spec

Yes.
