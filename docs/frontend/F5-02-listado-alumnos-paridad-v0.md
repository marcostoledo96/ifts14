# F5-02 — Listado administrativo de alumnos

## Estado

Cerrado y archivado en `openspec/changes/archive/2026-07-13-f5-02-students-list/`. `sdd-verify` PASS (6/6 requisitos, 14/14 escenarios; suite 521/521; build exit 0) y `sdd-archive` ejecutado el 2026-07-13.

## Alcance implementado

- Ruta mock-only `/admin/alumnos`, protegida por la sesión mock existente.
- DTO mínimo con documento enmascarado ficticio único por alumno (`NN****NN`) y booleano de contacto; sin direcciones, legajo ni documento completo.
- Búsqueda por nombre o documento enmascarado; filtros combinables, paginación de cinco y guard anti-respuestas obsoletas.
- Tabla desktop, tarjetas mobile, estados accesibles y harness QA limitado a desarrollo/tests.
- Sidebar y dashboard activan Alumnos; detalle continúa deshabilitado con handoff a F5-03 y sin ruta `:id`.

## Referencias

- Spec: `openspec/changes/archive/2026-07-13-f5-02-students-list/specs/admin-students-frontend/spec.md`.
- Diseño: `openspec/changes/archive/2026-07-13-f5-02-students-list/design.md`.
- Referencia visual: `muestra_pagina/components/admin/lista-alumnos.tsx` (adaptada, no portada literalmente).
- Paridad visual: `openspec/changes/archive/2026-07-13-f5-02-students-list/evidence/parity-notes.md`.
- Red y privacidad runtime: `openspec/changes/archive/2026-07-13-f5-02-students-list/evidence/network-privacy-check.md`.
- Evidencia de verify: `openspec/changes/archive/2026-07-13-f5-02-students-list/verify-report.md`.

## Handoff F5-03

El detalle administrativo requiere un ciclo propio que defina datos visibles y una ruta nueva. No debe habilitarse desde F5-02.
