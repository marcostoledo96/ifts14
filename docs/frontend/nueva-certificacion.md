# Nueva certificación (emisión directa + paridad P-11)

## Estado

- Emisión: archivada en `openspec/changes/archive/2026-07-16-frontend-nueva-certificacion/`.
- Paridad visual P-11: archivada en `openspec/changes/archive/2026-07-17-frontend-parity-nueva-certificacion/`.  
  Verify focalizado: **15/15 SUCCESS** (`certification-new-page.spec.ts`, CHROME_BIN wrapper, 2026-07-17).

## Alcance implementado

- Ruta `/admin/certificaciones/nueva` (antes de `:id`): pantalla única (no wizard).
- Selección: combobox alumno activos + select curso + ciclo lectivo (`cuatrimestre`).
- Preview documental alineada a v0: banda ink, declaración, registro de asistencia (tabla Presente / vacíos), autoridades tipográficas desde config, trazabilidad con QR decorativo.
- Aside: resumen de emisión, avisos (sin fechas / sin presentes / duplicado / sin email), CTA **Emitir certificación** + Cancelar, skeleton loading.
- `emitir()` → `POST /admin/certificados` con `{ alumnoId, cursoId, issuedAt, expiresAt: null }`; handoff a detalle.

## Honestidad (sin inventar API)

- Sin folio ni número de certificado definitivos pre-emisión (“Se asigna al emitir”).
- `dniMostrar` en admin; sin email en claro.
- Firmas: tipográficas desde `InstitutionalConfig` + badge “Configuración institucional” / “Representación tipográfica” (sin claim de firma criptográfica ni upload).
- QR decorativo hasta la emisión real.

## Fuera de alcance

Wizard multi-paso; logos/firmas archivo; inventar carga horaria; endpoint “preparar emisión”.

## Referencias

- Archive P-11: `openspec/changes/archive/2026-07-17-frontend-parity-nueva-certificacion/`
- Archive emisión: `openspec/changes/archive/2026-07-16-frontend-nueva-certificacion/`
- Página: `apps/frontend-angular/src/app/features/admin/certifications/pages/new/`
- v0: `muestra_pagina/components/admin/nueva-certificacion-editor.tsx`
