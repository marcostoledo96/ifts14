# Archive Report — frontend-backend-config-firmas-autoridades

**Change**: `frontend-backend-config-firmas-autoridades`  
**Branch**: `feat/config-upload-firmas-autoridades`  
**Archived**: 2026-07-23  
**Mode**: hybrid  
**Verdict verify**: PASS WITH WARNINGS (0 CRITICAL)  
**Tasks**: 21/21 complete  

## Resumen ejecutivo

Ciclo SDD cerrado: firmas manuscritas (PNG/JPEG) de Rector/a y Asesor/a Pedagógica con persistencia inmediata (Opción A), storage fuera de webroot, flags en GET config, PDF con imagen o fallback tipográfico, y documentación de deploy.

## Traceabilidad Engram (observation IDs)

| Artefacto | topic_key | ID |
|-----------|-----------|-----|
| proposal | `sdd/frontend-backend-config-firmas-autoridades/proposal` | #7173 |
| spec | `sdd/frontend-backend-config-firmas-autoridades/spec` | #7176 |
| design | `sdd/frontend-backend-config-firmas-autoridades/design` | #7177 |
| tasks | `sdd/frontend-backend-config-firmas-autoridades/tasks` | #7178 |
| verify-report (PASS) | `sdd/frontend-backend-config-firmas-autoridades/verify-report` | #7186 |
| verify-report (FAIL previo) | mismo topic (revisión anterior) | #7184 |
| archive-report | `sdd/frontend-backend-config-firmas-autoridades/archive-report` | #7188 |

## Specs sincronizadas a `openspec/specs/`

| Dominio | Acción | Detalle |
|---------|--------|---------|
| `admin-institutional-signatures` | **Created** | 4 requirements (persistencia, validación, storage, UI) |
| `frontend-http-services` | **Updated** | 1 MODIFIED (`HttpInstitutionalConfigService` + flags); 1 ADDED (métodos HTTP firmas) |
| `admin-certificate-consulta` | **Updated** | 1 MODIFIED (flags GET / PUT sin multipart); 1 ADDED (rutas firmas) |
| `certificate-pdf-qr-generation` | **Updated** | 1 MODIFIED (imagen \| fallback; PDF viejo intacto) |
| `backend-modelo-datos-certificados` | **Updated** | 1 ADDED (migración 014) |
| `deploy-cpanel-certificados` | **Updated** | 1 ADDED (`signature_storage_path`) |

**REMOVED / RENAMED**: ninguno — merge no destructivo.

## Documentación

Apply ya actualizó `docs/backend/01-contrato-api-certificados.md`, `docs/frontend/configuracion-institucional.md`, `docs/deploy/00-cpanel-certificados.md` y `database/docs/014-firmas-autoridades.md`. En archive solo se ajustó la referencia del change activo → ruta de archive en `docs/frontend/configuracion-institucional.md` (sin duplicar contenido).

## Archive path

`openspec/changes/archive/2026-07-23-frontend-backend-config-firmas-autoridades/`

## Contenido del archive

- proposal.md ✅
- design.md ✅
- tasks.md ✅ (21/21 `[x]`)
- specs/ ✅ (6 deltas)
- verify-report.md ✅ (evidencia preservada)
- state.yaml ✅
- archive-report.md ✅

## Warnings residuales (no bloquean)

- Storage no público sin probe URL
- GET/PUT consulta flags no re-ejecutados en suite HTTP de firmas
- Escenarios PDF/QR legacy fuera de SignaturePdfTest
- Migración 014 sin apply en CI

## Próximo paso

Ninguno para este ciclo. Listo para commit/PR cuando el usuario lo pida (no ejecutado en archive).
