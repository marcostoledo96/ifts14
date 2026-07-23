# Configuración institucional (admin)

## Estado

- Base funcional archivada en `openspec/changes/archive/2026-07-16-frontend-configuracion-institucional/`.
- Paridad de layout **P-14** archivada en `openspec/changes/archive/2026-07-17-frontend-parity-configuracion-layout/`.
- Firmas de autoridades (Opción A): archivado en `openspec/changes/archive/2026-07-23-frontend-backend-config-firmas-autoridades/`.

## Alcance implementado

- Ruta lazy `/admin/configuracion` bajo `AdminShell`.
- Ítem de sidebar **Configuración** con estado activo por prefijo.
- Seam `InstitutionalConfigService`:
  - `obtener()` / `guardar()` → GET/PUT JSON `/admin/configuracion-institucional`
  - `subirFirma(role, file)` → POST multipart `/firmas/{rector|asesor}` (inmediato)
  - `quitarFirma(role)` → DELETE
  - `previewFirma(role)` → GET blob autenticado
- Modelo con flags `rectorSignaturePresent` / `advisorSignaturePresent` (solo lectura).
- Provider `useRealApi ? HttpInstitutionalConfigService : InMemoryInstitutionalConfigService`.
- UI Autoridades: `input[type=file]` real; POST al elegir; Quitar; **no marca dirty** del formulario de textos; Guardar no envía multipart.
- Logos institucionales: fijos del sistema (sin upload).
- Validación cliente alineada a límites PHP (160 / 80 / 255); `institutionName` obligatorio.

## Firmas (Opción A)

- Formatos: PNG o JPEG; máx. 1 MB; recomendado ≤~1200×400.
- Persistencia inmediata al elegir archivo; independiente de «Guardar configuración».
- Preview tipográfica en la página; el PDF usa imagen si el archivo existe (fallback tipográfico si no).

## Fuera de alcance

Logos upload, firma criptográfica, correo automático, rotación de QR, auth nueva.

## Referencias

- Archive: `openspec/changes/archive/2026-07-23-frontend-backend-config-firmas-autoridades/`
- Spec firmas: `openspec/specs/admin-institutional-signatures/spec.md`
- Spec HTTP: `openspec/specs/frontend-http-services/spec.md`
- Referencia visual: `muestra_pagina/components/admin/configuracion-institucional.tsx` (no portar React)
- Página: `apps/frontend-angular/src/app/features/admin/institutional-config/pages/`
