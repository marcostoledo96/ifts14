# Verification Report — backend-entrega-manual-certificados

**status:** PASS WITH WARNINGS  
**change:** `backend-entrega-manual-certificados`  
**project:** `ifts14`  
**branch:** `backend-entrega-manual-certificados`  
**mode:** Standard (`strict_tdd: false`)  
**artifact store:** OpenSpec + Engram  
**fecha:** 2026-07-02

## executive_summary

La implementación cumple el objetivo central del MVP de entrega manual con la evidencia disponible: no queda flujo activo de email/SMTP/PHPMailer en código de producto, `/reenviar` responde 404, la emisión genera PDF/QR y devuelve `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, la entrega manual es admin-only y de solo lectura a nivel servicio, `TokenCipher` falla cerrado, y la migración `002` existe con `token_cifrado VARBINARY(512) NULL`.

El resultado no es `PASS` pleno porque quedan gates de entorno/deploy sin evidencia runtime real: aplicación de la migración 002 contra MariaDB, smoke HTTP 200/409 DB-backed de `GET /entrega-manual`, regeneración de `composer.lock` content-hash y limpieza/regeneración operativa de `vendor/` antes de deploy. No se falsificó evidencia de DB.

## artifacts

| Artefacto | Estado | Evidencia |
|---|---|---|
| `proposal.md` | Leído | Define entrega manual sin email y sin regenerar certificados viejos. |
| `design.md` | Leído | Define `/reenviar` removido → 404, `TokenCipher` AES-256-GCM, migración 002 y endpoint read-only. |
| `tasks.md` | Leído | 21/24 tareas marcadas completas; pendientes 1.2, 3.3b y 4.7. |
| `apply-progress.md` | Leído | Declara gates abiertos de DB, HTTP DB-backed y content-hash de Composer. |
| `specs/**/spec.md` | Leídos | 6 deltas verificados: delivery, emission, contrato API, modelo DB, PDF/QR y prompts/v0. |
| Código/diff actual | Inspeccionado | `git status --short`, `git diff --name-status`, `git diff --stat`; sin stage ni commit. |
| Reporte OpenSpec | Creado | `openspec/changes/backend-entrega-manual-certificados/verify-report.md`. |

## completeness

| Métrica | Valor |
|---|---:|
| Tareas totales en `tasks.md` | 24 |
| Tareas marcadas completas | 21 |
| Tareas abiertas | 3 |
| Gates abiertos no falsificados | 3 |

Tareas abiertas:

- `1.2`: aplicar 002 contra DB ficticia local y validar con `DESCRIBE cert_tokens_verificacion`.
- `3.3b`: smoke HTTP 200/409 DB-backed de `GET /admin/certificados/{id}/entrega-manual` contra MariaDB real/ficticia accesible.
- `4.7`: ejecutar `sdd-archive` luego de esta fase.

## validations_run

| Validación | Resultado | Evidencia resumida |
|---|---|---|
| `bash scripts/php-docker-lint.sh` | ⚠️ Bloqueado por sudo | Falló con `sudo: A terminal is required to authenticate`. |
| Lint equivalente en Docker sin sudo | ✅ PASS | `docker run --rm ... ifts14-php84 find apps/backend-php -type f -name '*.php' -exec php -l '{}' +` → sin errores de sintaxis. Ejecutado con mount read-only. |
| `bash scripts/php-docker-modules-check.sh` | ⚠️ Bloqueado por sudo | Falló con `sudo: A terminal is required to authenticate`. |
| Modules check equivalente en Docker sin sudo | ✅ PASS | PHP 8.4.22; módulos presentes: `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| Procedural tests PHP | ✅ PASS | `EntregaManualTest`, `AdminCertificateServiceTest`, `HttpContractTest`, `AuthGateTest`, `NormalizePathTest`, `PdfResilienceTest` pasaron. `HttpContractTest` emitió notices preexistentes por requests sin `Content-Type`, sin fallar. |
| Emisión service-level adicional | ✅ PASS | Check ad hoc en contenedor: `emitir()` persistió `token_cifrado` envelope `v1`, generó PDF en `/tmp`, devolvió `publicValidationUrl`, `pdfDownloadUrl` y `tokenPrefix`, sin token completo como campo separado. |
| `composer validate` local | ⚠️ No disponible | `composer: orden no encontrada`. |
| `composer validate --no-check-publish` en Docker | ⚠️ PASS con warning | `composer.json` válido, pero `composer.lock` no está actualizado contra `composer.json`; requiere `composer update --lock`. |
| MariaDB smoke / migración aplicada | ⚠️ No ejecutado | Cliente `mariadb` existe, pero conexión local sin credenciales falló con acceso denegado. No se aplicó 002 ni se ejecutó `DESCRIBE`. |
| Búsqueda de email/reenvío activo en backend | ✅ PASS | `apps/backend-php/src` solo conserva comentario `ponytail` que documenta eliminación de `reenvio`; `/reenviar` solo aparece en tests que validan 404. |
| Búsqueda de `X-Admin-Key` en Angular | ✅ PASS | Sin coincidencias en `apps/frontend-angular/src/**/*.ts` para `X-Admin-Key`, `admin_api_key`, `adminKey`, `localStorage`, `sessionStorage`. |

## requirements_verification

| Requisito / escenario | Estado | Evidencia |
|---|---|---|
| Sin email automático, SMTP ni PHPMailer activo en MVP | ✅ COMPLIANT | `composer.json` solo requiere PHP y TCPDF; `src/EmailDeliveryTransport*` eliminados; `index.php` no requiere transporte email; grep backend sin usos activos. |
| `/reenviar` removido / 404 seguro | ✅ COMPLIANT | `index.php` no tiene rama `/reenviar`; fallback 404 en línea 250; `HttpContractTest.php` valida POST y GET `/admin/certificados/1/reenviar` → `404 NOT_FOUND`. |
| Emisión devuelve `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`, sin side effect email | ✅ COMPLIANT | `AdminCertificateService::emitir()` persiste `token_cifrado` y retorna los tres campos; check runtime service-level adicional pasó con PDF real en storage temporal. Sin transporte email activo. |
| Entrega manual admin-only | ✅ COMPLIANT | `index.php` exige `requireAdmin()` antes de instanciar el servicio; `HttpContractTest.php` cubre 401 sin `X-Admin-Key`. |
| Entrega manual read-only, sin rotación ni mutación de estado de negocio | ✅ COMPLIANT service-level / ⚠️ DB-backed abierto | `EntregaManualTest.php` valida 200 con fake PDO sin transacción ni auditoría; `AdminCertificateService::entregaManual()` solo hace `SELECT`. Falta HTTP 200/409 contra MariaDB real/ficticia accesible. |
| TokenCipher envelope seguro y fail-closed | ✅ COMPLIANT | `TokenCipher.php` exige key 32 bytes, envelope `v1.<iv>.<tag>.<ciphertext>`, IV 12 bytes, tag 16 bytes; `EntregaManualTest.php` cubre IV/tag malformados, clave inválida, partes inválidas, versión inválida y round-trip. |
| Migración 002 existe y es correcta | ✅ COMPLIANT estático / ⚠️ aplicación abierta | `database/migrations/002_token_cifrado_entrega_manual.sql` agrega `token_cifrado VARBINARY(512) NULL AFTER token_prefijo` y documenta rollback `DROP COLUMN`. No se verificó aplicada por falta de credenciales DB. |
| Certificados viejos sin `token_cifrado` → 409 | ✅ COMPLIANT service-level / ⚠️ HTTP DB-backed abierto | `EntregaManualTest.php` cubre `409 TOKEN_NOT_RECOVERABLE` por token ausente, envelope inválido, clave incorrecta y clave ausente. Falta ruta HTTP 409 DB-backed. |
| PDF con QR permanente y descarga admin protegida | ✅ COMPLIANT parcial | Emisión service-level generó PDF con URL pública derivada del token emitido; `CertificatePdfService` recibe URL de validación, no token suelto. `HttpContractTest.php` cubre PDF 401/405/400; `PdfResilienceTest.php` cubre guardas de descarga. Falta PDF 200 DB-backed con MariaDB real. |
| Docs/prompts/v0 actualizados | ✅ COMPLIANT en fuentes activas | `docs/backend/*`, `docs/database/*`, `docs/deploy/*`, `docs/frontend/*`, `MATIAS_PROMPTS_SDD_FASE2.md`, `muestra_pagina/MANIFIESTO_V0.md` y `prompts_stitch_v0_ifts14.md` reflejan entrega manual y no prometen email activo. Persisten menciones históricas en docs de planificación/auditoría antiguas, tratadas como referencia no vigente. |
| `composer.json`/`composer.lock` coherentes o caveat documentado | ⚠️ WARNING | `composer.json` y `composer.lock` ya no declaran PHPMailer, pero `composer validate` advierte que el lock no está actualizado. `apply-progress.md` documenta el caveat; falta regenerar content-hash con Composer. |

## correctness_static_evidence

| Archivo | Evidencia |
|---|---|
| `apps/backend-php/index.php` | Ruta `GET /admin/certificados/{id}/entrega-manual` con método GET, validación de id, `requireAdmin()`, `requirePdfConfig()`, `loadTokenCipherKey()` y respuesta 200 por `entregaManual()`; fallback general 404 cubre `/reenviar`. |
| `apps/backend-php/src/AdminCertificateService.php` | `emitir()` crea token, hash, prefijo y `token_cifrado`; genera PDF antes del commit; DTO 201 incluye URL pública, PDF y prefijo. `entregaManual()` solo consulta, descifra en memoria y devuelve DTO seguro. |
| `apps/backend-php/src/TokenCipher.php` | AES-256-GCM con envelope textual versionado y validaciones de key/IV/tag/formato/descifrado. |
| `apps/backend-php/src/Config.php` | `requireTokenCipherKey()` decodifica clave externa a 32 bytes exactos; config real sigue fuera de Git. |
| `database/migrations/002_token_cifrado_entrega_manual.sql` | Migración additive, nullable y compatible con 001 aplicada; rollback documentado. |

## warnings_or_failures

### CRITICAL

- Ninguno con la evidencia disponible.

### WARNING

1. **DB gate abierto:** no se aplicó `002` ni se ejecutó `DESCRIBE cert_tokens_verificacion` por falta de credenciales MariaDB accesibles. Bloquea deploy real, no la evidencia estática de migración.
2. **HTTP DB-backed abierto:** falta ejecutar `GET /admin/certificados/{id}/entrega-manual` 200/409 contra MariaDB real/ficticia accesible. La cobertura actual es service-level + contratos HTTP pre-DB.
3. **Composer lock hash:** Docker Composer valida el JSON pero advierte que `composer.lock` no está actualizado. Ejecutar `composer update --lock` antes de deploy.
4. **Vendor operativo stale:** el lint equivalente mostró restos locales de `vendor/phpmailer/...`. `vendor/` no está versionado ni fue modificado, pero antes de deploy hay que regenerarlo/limpiarlo desde el lock actualizado para no subir artefactos PHPMailer obsoletos.
5. **Docs históricas:** documentos de planificación/auditoría antiguos aún mencionan SMTP/reenvío como referencia histórica. Las fuentes activas del ciclo están actualizadas; conviene marcar o consolidar históricos si generan confusión.

### SUGGESTION

- En `docs/deploy/00-cpanel-certificados.md`, reforzar en el párrafo de claves reales esperadas que `token_encryption_key` también es obligatoria para emisión/entrega manual; el documento ya lo explica más abajo, pero conviene evitar lectura parcial.

## next_recommended

1. Si hay MariaDB demo accesible: aplicar `database/migrations/002_token_cifrado_entrega_manual.sql`, verificar `DESCRIBE cert_tokens_verificacion` y ejecutar smoke HTTP 200/409 DB-backed de entrega manual.
2. Ejecutar Composer real: `composer update --lock` en `apps/backend-php/` y regenerar `vendor/` operativo antes de deploy.
3. Ejecutar `sdd-archive` documentando explícitamente los gates DB/Composer si no se cierran antes.

## skill_resolution

- `sdd-verify`: cargado y aplicado como verificación Standard; se ejecutó evidencia runtime disponible y se registraron dimensiones no cubiertas.
- `karpathy-guidelines`: aplicado para evitar afirmaciones sin evidencia y separar PASS de gates abiertos.
- `php-best-practices`: aplicado sobre PHP 8.4; se revisaron tipos, PDO/prepared statements, fail-closed y configuración externa.
- `systematic-debugging`: aplicado para tratar los warnings de sudo/Composer/DB como causa de entorno, no como fixes especulativos.
- `ponytail`: activo; no se agregaron abstracciones ni cambios de código, solo verificación y reporte.

## final_verdict

**PASS WITH WARNINGS.** La funcionalidad MVP queda verificada con pruebas y evidencia estática/runtime disponible, pero no queda habilitada para deploy real hasta cerrar los gates de MariaDB y Composer/vendor.
