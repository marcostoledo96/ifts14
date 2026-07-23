# Tasks: Firmas de autoridades (configuración institucional)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650–950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR1 DB+API → PR2 PDF → PR3 FE+docs |
| Delivery strategy | exception-ok (size:exception) |
| Chain strategy | size-exception |

Decision needed before apply: No (Marcos aceptó size:exception — un solo PR full-stack)
Chained PRs recommended: Yes (forecast); override: size-exception
Chain strategy: size-exception
400-line budget risk: High (aceptado)

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Migración 014 + API firmas + scripts BE | PR1 (base `feat/config-upload-firmas-autoridades`) | `php apps/backend-php/tests/InstitutionalSignature*.php` | Staging: POST/DELETE/GET firmas + GET flags | DROP cols 014 + revert API; vaciar dir firmas |
| 2 | PDF Image/fallback | PR2 (base PR1) | script PDF firma presente/ausente | Emisión staging; PDF viejo intacto | Revert `CertificatePdfService` / `InstitutionalConfig` |
| 3 | FE TDD + docs | PR3 (base PR2) | `ng test --include='**/institutional-config/**/*.spec.ts'` | UI Autoridades upload/quitar | Revert feature FE + docs |

## Phase 1: Base de datos

- [x] 1.1 Crear `database/migrations/014_firmas_autoridades.sql`: cols `rector_firma_filename/sha256`, `asesor_firma_*` nullable; aditiva MariaDB 10.6.
- [x] 1.2 Crear `database/docs/014-firmas-autoridades.md` (apply/rollback; no tocar PDFs emitidos).

## Phase 2: Backend — config y API

- [x] 2.1 RED: `apps/backend-php/tests/InstitutionalSignatureValidationTest.php` — SVG/MIME, >1 MB, >~1200×400 → `400 VALIDATION_ERROR` sin persistir.
- [x] 2.2 RED: `…/InstitutionalSignatureSecurityTest.php` — sin auth 401/403; rol inválido 400; traversal rechazado; replace fallido deja firma previa.
- [x] 2.3 Añadir `signature_storage_path` en `certificados-config.example.php`; normalizar/requerir en `Config.php`.
- [x] 2.4 Extender `AdminInstitutionalConfigService`: upload (finfo+size+dims; tmp→rename→DB→unlink viejo), delete, preview; flags en DTO GET; basename+sha256.
- [x] 2.5 Registrar en `index.php` `POST|DELETE|GET …/firmas/{rector|asesor}` bajo auth admin; PUT textos sin multipart.
- [x] 2.6 GREEN: pasar scripts 2.1–2.2; happy path PNG/JPEG + flags GET.

## Phase 3: Backend — PDF

- [x] 3.1 RED: script emisión — con archivo → Image; sin archivo → tipografía; PDF previo intacto.
- [x] 3.2 Extender `InstitutionalConfig` con paths opcionales de firma; `CertificatePdfService::renderSignatory` Image|fallback (verificar GD/TCPDF).
- [x] 3.3 GREEN: pasar 3.1; `php -l` en PHP tocados.

## Phase 4: Frontend (TDD)

- [x] 4.1 RED Jasmine: modelo/flags en `institutional-config.service.spec.ts`; upload multipart + DELETE + GET preview (`HttpTestingController`); in-memory paralelo.
- [x] 4.2 GREEN: flags + métodos en `institutional-config.service.ts`, `http-…`, `in-memory-…`.
- [x] 4.3 RED: `institutional-config-page.spec.ts` — file input real; POST al elegir; DELETE al quitar; Guardar sin multipart; sin dirty por firma.
- [x] 4.4 GREEN: habilitar UI en `institutional-config-page.{ts,html,css}` (paridad `muestra_pagina`).

## Phase 5: Documentación

- [x] 5.1 Actualizar `docs/backend/01-contrato-api-certificados.md` (rutas firmas, flags, errores).
- [x] 5.2 Actualizar `docs/frontend/configuracion-institucional.md` (upload inmediato, flags).
- [x] 5.3 Actualizar `docs/deploy/00-cpanel-certificados.md` (`signature_storage_path` fuera webroot; rollback firmas ≠ PDFs).

## Phase 6: Remediation verify (runtime coverage)

- [x] 6.1 Auth HTTP: `POST|DELETE|GET …/firmas/{rol}` sin sesión → 401; mutaciones sin CSRF → 403 (`InstitutionalSignatureHttpTest` + matriz admin).
- [x] 6.2 Preview autenticado: assert `X-Content-Type-Options: nosniff`, `Cache-Control` con `no-store`, MIME `image/png|jpeg`.
- [x] 6.3 DELETE BE: `deleteSignature` → flags false, archivo unlinked, filename/hash NULL (`InstitutionalSignatureSecurityTest` + DELETE HTTP).
