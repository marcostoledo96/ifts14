# Configuración institucional (admin)

## Estado

- Base funcional archivada en `openspec/changes/archive/2026-07-16-frontend-configuracion-institucional/`.
- Paridad de layout **P-14** archivada en `openspec/changes/archive/2026-07-17-frontend-parity-configuracion-layout/`.
  Verify P-14: `test:ci` 772/772, `tsc --noEmit` exit 0, `npm run build` exit 0 (PASS WITH WARNINGS: budget CSS página 9.99 kB > 8 kB).

## Alcance implementado

- Ruta lazy `/admin/configuracion` bajo `AdminShell`.
- Ítem de sidebar **Configuración** con estado activo por prefijo.
- Seam `InstitutionalConfigService`: `obtener()` (GET) y `guardar()` (PUT) contra `/admin/configuracion-institucional`.
- Modelo 1:1 con el DTO backend: `institutionName`, `certificateText`, `rectorName`, `rectorRole`, `advisorName`, `advisorRole`, `updatedAt`.
- Provider `useRealApi ? HttpInstitutionalConfigService : InMemoryInstitutionalConfigService`.
- UI P-14 (calco v0, sin inventar persistencia):
  - Kicker «Folio institucional», lede y banner de impacto con tres bullets.
  - Nav lateral sticky (desktop) con anclas `#identidad` … `#validacion`.
  - Secciones card numeradas 01–05 con iconos SVG Lucide-like.
  - Campos editables solo del DTO; preview tipográfica de firmas; barra sticky dirty (Guardar configuración / Descartar cambios + `updatedAt`).
  - Logos, upload de firmas, email SMTP y sello: nota honesta o control disabled (sin `input[type=file]`).
  - Contacto y Validación pública: bloques informativos sin inputs inventados.
- Validación cliente alineada a límites PHP (160 / 80 / 255); `institutionName` obligatorio.

## Fuera de alcance (sin persistencia backend)

Logos upload, dirección, email editable, upload de firmas, formato de numeración, mensajes de validación pública, sello / link base QR.

## Referencias

- Archive P-14: `openspec/changes/archive/2026-07-17-frontend-parity-configuracion-layout/`
- Archive base: `openspec/changes/archive/2026-07-16-frontend-configuracion-institucional/`
- Spec canónica HTTP: `openspec/specs/frontend-http-services/spec.md` (InstitutionalConfig)
- Referencia visual: `muestra_pagina/components/admin/configuracion-institucional.tsx` (no portar React)
- Página: `apps/frontend-angular/src/app/features/admin/institutional-config/pages/`
