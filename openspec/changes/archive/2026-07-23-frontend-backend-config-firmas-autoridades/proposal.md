# Proposal: Firmas de autoridades en configuración institucional

## Intent

Habilitar upload real de firmas manuscritas (imagen) para Rector/a y Asesor/a Pedagógica en `/admin/configuracion`. Hoy la UI está disabled/mock; solo se persisten nombres/cargos y el PDF usa tipografía.

## Scope

### In Scope
- **Opción A**: upload/DELETE inmediato, independiente del Guardar.
- `POST|DELETE|GET /admin/configuracion-institucional/firmas/{rol}` (`rector`|`asesor`); GET = preview admin autenticado (sin URL pública adivinable).
- GET/PUT textos sin multipart; flags `rectorSignaturePresent` / `advisorSignaturePresent` (o equivalente).
- PNG + JPEG (sin SVG); máx **1 MB** y ~1200×400 px.
- Storage `signature_storage_path` fuera de webroot; DB solo filename/hash; sin path traversal.
- Migración `014` sobre `cert_configuracion_institucional` (fila única).
- PDF: imagen en `renderSignatory` si hay archivo; si no, fallback tipográfico. PDFs emitidos no cambian hasta regenerar.
- UI Autoridades con input file real; paridad `muestra_pagina`.

### Out of Scope
- Logos; firma criptográfica; SMTP; rotación token/QR; auth admin nueva.

## Capabilities

### New Capabilities
- `admin-institutional-signatures`: upload/DELETE/GET preview por rol, validación MIME/tamaño, storage y UI con persistencia inmediata.

### Modified Capabilities
- `frontend-http-services`: flags de presencia + métodos HTTP de firmas.
- `admin-certificate-consulta`: GET/PUT config + rutas multipart firmas.
- `certificate-pdf-qr-generation`: imagen si existe; fallback tipográfico.
- `backend-modelo-datos-certificados`: columnas firma en `014`.
- `deploy-cpanel-certificados`: documentar `signature_storage_path`.

## Approach

Endpoints por rol + storage con basename seguro/hash. Guardar textos sin multipart. `CertificatePdfService::renderSignatory` usa imagen si existe. Auth admin temporal vigente.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.../institutional-config/` | Modified | Upload/DELETE/preview UI |
| `.../http-*institutional*` | Modified | Seam firmas + flags |
| Backend InstitutionalConfig / `index` | Modified | Rutas multipart/preview |
| `CertificatePdfService` | Modified | Imagen o texto |
| `database/migrations/014_*.sql` | New | Columnas firma |
| Deploy / config docs | Modified | `signature_storage_path` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Replace no atómico | Med | Temp + rename; borrar viejo tras éxito |
| Path traversal / MIME spoof | Med | Basename fijo, sniff MIME, whitelist |
| Límites rechazan escaneos | Med | Confirmación residual; errores claros |
| PDFs viejos vs firma nueva | Low | Solo al regenerar/emitir |

## Rollback Plan

Revertir FE/BE; revertir `014` en entorno controlado; vaciar directorio de firmas. PDFs previos intactos.

## Dependencies

Sesión admin vigente; patrón `certificate_storage_path`; referencia v0 `configuracion-institucional.tsx`.

## Success Criteria

- [ ] Subir/quitar firmas PNG/JPEG de ambos roles sin Guardar textos.
- [ ] Preview autenticado; sin URL pública adivinable.
- [ ] GET config con flags; PUT textos sin multipart.
- [ ] Emisión/regeneración dibuja imagen o fallback tipográfico.
- [ ] Storage fuera de webroot; deploy documentado; sin path traversal.
