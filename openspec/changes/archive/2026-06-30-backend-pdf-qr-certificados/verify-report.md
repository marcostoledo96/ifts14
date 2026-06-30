# Verification Report — backend-pdf-qr-certificados

## Resumen

| Campo | Resultado |
|---|---|
| Cambio | `backend-pdf-qr-certificados` |
| Modo | Hybrid / Standard verify (`strict_tdd: false`) |
| Rama observada | `backend/pdf-qr-certificados` |
| Veredicto | **PASS WITH WARNINGS** |

La implementación cumple las specs, el diseño y las tareas del ciclo M4-01 con evidencia de ejecución en Docker PHP 8.4 y MariaDB 10.6 ficticia. No se leyeron datos privados, secretos, dumps, logs, cPanel real, `public_html` ni `material_privado_no_versionar/`.

## Artifacts leídos

| Artifact | Fuente |
|---|---|
| Proposal | `openspec/changes/backend-pdf-qr-certificados/proposal.md` + Engram `#4447` |
| Specs | `openspec/changes/backend-pdf-qr-certificados/specs/**/spec.md` + Engram `#4448` |
| Design | `openspec/changes/backend-pdf-qr-certificados/design.md` + Engram `#4451` |
| Tasks | `openspec/changes/backend-pdf-qr-certificados/tasks.md` + Engram `#4459` |
| Apply progress | Engram `#4464` |

## Completeness

| Dimensión | Estado | Evidencia |
|---|---|---|
| Tasks | PASS | `tasks.md` marca 17/17 completas; inspección y comandos confirmaron los entregables. |
| Specs | PASS | Todos los escenarios requeridos tienen evidencia runtime o documental verificable. |
| Design | PASS WITH WARNINGS | Diseño implementado; queda advertencia de reproducibilidad por `composer.lock` ignorado. |
| Apply gate | PASS | Contexto gatekeeper indica apply gate PASS; verify reejecutó checks. |

## Evidencia de build/tests/runtime

| Comando / check | Resultado |
|---|---|
| `php -v` local | `php: orden no encontrada`; se usó Docker fallback. |
| `docker image inspect ifts14-php84:latest` | Imagen disponible. |
| `docker run ... ifts14-php84:latest php -v` | PHP `8.4.22` disponible en Docker. |
| `composer install --no-dev --no-interaction --prefer-dist` vía `php /composer-cache/composer` | OK; autoload regenerado desde lock. |
| `vendor/autoload.php` + `composer show tecnickcom/tcpdf` | OK; `tecnickcom/tcpdf` `6.11.3`. |
| `php -l` sobre los 14 PHP no-vendor de `apps/backend-php` | PASS; sin errores de sintaxis. |
| `php apps/backend-php/tests/AdminCertificateServiceTest.php` | PASS; `OK AdminCertificateServiceTest`. |
| `php apps/backend-php/tests/HttpContractTest.php` | PASS; `OK HttpContractTest` con Notice conocido de test helper por GET sin `Content-Type`. |
| TCPDF smoke | PASS; PDF generado, header `%PDF`, QR ejecutado vía `write2DBarcode`. |
| PDF security smoke | PASS; PDF `%PDF`, sin DNI completo ni token completo visibles como texto. |
| MariaDB ficticia: emisión directa con `AdminCertificateService::emitir()` | PASS; genera PDF, DTO seguro, token hash/prefijo y rollback ante falla PDF. |
| MariaDB ficticia: `GET /admin/certificados/{id}/pdf` | PASS; `200` PDF con headers y `404 PDF_NOT_FOUND` sin filtrar rutas/código. |
| `git status --short --ignored -- apps/backend-php/composer.lock apps/backend-php/vendor/autoload.php` | `composer.lock` y `vendor/` están ignorados. |

Coverage formal no está configurado en este backend; la verificación se basó en scripts PHP existentes, smokes específicos y checks DB-backed ficticios.

## Spec compliance matrix

| Spec / escenario | Estado | Evidencia |
|---|---|---|
| Generación sincrónica de PDF con QR durante emisión | PASS | Smoke DB-backed de `emitir()` generó PDF `%PDF`; `CertificatePdfService` usa `AddPage('L')` y `write2DBarcode`. |
| Falla de PDF aborta emisión | PASS | Smoke DB-backed con `pdfService = null` propagó error PDF y el conteo de certificados quedó igual. |
| PDF persistido como `{certificateCode}.pdf` | PASS | Smokes generaron/descargaron `CERT-...pdf`; `pathForCode()` nombra por código saneado, no por token. |
| Storage protegido / fuera del webroot | PASS | Runtime de integración montó storage fuera del docroot (`/pdf-storage` vs `/app`); docs describen fuera de webroot y `.htaccess` alternativo. |
| Descarga autorizada `200` | PASS | MariaDB ficticia + fixture PDF: respuesta `200`, body `%PDF`, `Content-Type: application/pdf`, attachment con filename por código. |
| Descarga sin autorización `401` | PASS | `HttpContractTest` cubre `GET /admin/certificados/1/pdf` sin `X-Admin-Key`. |
| Descarga PDF inexistente `404 PDF_NOT_FOUND` | PASS | MariaDB ficticia: certificado inexistente responde `404 PDF_NOT_FOUND` sin ruta interna ni código. |
| Configuración externa con placeholders ficticios | PASS | `certificados-config.example.php` contiene `public_base_url` y `certificate_storage_path` ficticios; no hay valores reales. |
| DNI enmascarado en PDF/DTO | PASS | `emitir()` devuelve `12****78`; `CertificatePdfService` recibe `documentMasked`; smoke PDF no contiene DNI completo visible. |
| DTO emisión con `pdfDownloadUrl` sin token completo | PASS | Test Reflection + smoke DB-backed: URL `/api/admin/certificados/{id}/pdf`, sin `/validar/` ni token completo. |
| Auditoría segura | PASS | Inspección: `safeAudit()` guarda `request_id`, resultado y prefijo hash; no DNI/token/SQL/secretos. |
| Persistencia segura | PASS | Inspección: INSERT/SELECT/UPDATE usan `PDO::prepare()` y binds/execute, sin concatenar valores de usuario. |
| Documentación deploy | PASS | `docs/deploy/00-cpanel-certificados.md` documenta storage, `.htaccess` alternativo y rollback de PDFs ficticios. |

## Correctness / security checks

| Check | Estado | Evidencia |
|---|---|---|
| Token completo no persistido | PASS | Se persiste `token_hash` binario y `token_prefijo`; token completo solo existe en memoria para QR. |
| Token completo no devuelto | PASS | DTO contiene `tokenPrefix` y `pdfDownloadUrl`; no contiene `/validar/{token}`. |
| DNI completo no devuelto ni visible en PDF smoke | PASS | DTO usa `documentMasked`; smoke PDF no contiene `12345678`. |
| Errores sin rutas internas | PASS | `PDF_NOT_FOUND` smoke no filtra `/pdf-storage` ni código interno. |
| Configuración real fuera de Git | PASS | Ejemplo usa demo/ficticio; no se tocaron configs reales. |
| PDF download filename seguro | PASS | Filename basado en `codigo_certificado`, y `pathForCode()` sanea caracteres fuera de `[A-Za-z0-9_-]`. |

## Design coherence

| Decisión de diseño | Estado | Evidencia |
|---|---|---|
| TCPDF vía Composer | PASS WITH WARNINGS | Implementado y probado; lockfile existe localmente pero está ignorado. |
| PDF dentro de transacción antes de `commit` | PASS | `emitir()` llama `generatePdfWithinTransaction()` antes de `commit()`; rollback probado con MariaDB ficticia. |
| Descarga administrativa por endpoint | PASS | `index.php` registra `/admin/certificados/{id}/pdf` con `requireAdmin()` y streaming PDF. |
| Sin migraciones nuevas | PASS | Se usó esquema `cert_` existente. |
| DNI siempre enmascarado | PASS | `maskDocument()` + `documentMasked` en DTO/PDF. |

## Issues

### CRITICAL

- Ninguno.

### WARNING

- `composer.lock` está ignorado por `.gitignore` (`composer.lock` global). El lock existe localmente y fija `tecnickcom/tcpdf 6.11.3`, pero no será versionado salvo decisión explícita de Marcos (`git add -f` o ajuste de `.gitignore`). Esto afecta reproducibilidad del deploy/CI, no bloquea la implementación verificada.
- PHP local no está instalado; toda la evidencia runtime se obtuvo con Docker `ifts14-php84:latest`. Es aceptable para este ciclo, pero CI/deploy debe definir cómo ejecutar Composer/PHP.

### SUGGESTION

- Definir en `sdd-archive`/ciclo posterior si el proyecto versionará `apps/backend-php/composer.lock` pese al ignore global o si aceptará resolver `^6.8` en cada instalación.

## Final verdict

**PASS WITH WARNINGS** — listo para `sdd-archive`. Las advertencias son operativas/reproducibilidad, no incumplimientos funcionales del spec.
