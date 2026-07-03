# Verification Report — backend-qr-image-download

## Resumen ejecutivo

Verificación ejecutada en modo Standard, con artefactos OpenSpec y diff actual. El cambio cumple el objetivo del ciclo: `GET /certificados/api/admin/certificados/{id}/qr.png` queda protegido por `X-Admin-Key`, genera PNG on-demand desde la misma URL pública permanente, no rota token, no muta base/auditoría, usa headers anti-cache y filenames seguros. El smoke DB-backed contra MariaDB descartable pasó con `200 image/png` y validó ausencia de mutación del token.

**Veredicto:** PASS WITH WARNINGS.

Warnings no bloqueantes: PHP local no está instalado, los scripts del proyecto que usan `sudo docker` no pueden autenticar en esta sesión, y la documentación humana de backend debe sincronizarse en `sdd-archive` para listar el nuevo endpoint QR.

## Modo y alcance

| Campo | Valor |
|---|---|
| Cambio | `backend-qr-image-download` |
| Modo | Verificación Standard |
| Artifact store | OpenSpec + Engram |
| Artefacto OpenSpec | `openspec/changes/backend-qr-image-download/verify.md` |
| Engram topic_key | `sdd/backend-qr-image-download/verify-report` |
| Alcance verificado | Backend PHP, tests HTTP/unitarios, Docker PHP 8.4/GD, MariaDB 10.6 descartable, specs/tasks del cambio |
| Alcance excluido | Frontend, migraciones nuevas, email/reenvío/regeneración, reemplazo de auth, material privado/secrets/dumps/logs/vendor, Git stage/commit/push/merge/rebase |

## Artefactos revisados

| Artefacto | Resultado |
|---|---|
| `proposal.md` | Alcance correcto: endpoint QR admin, anti-cache, filenames seguros, GD; fuera de alcance respetado. |
| `design.md` | Diseño coherente con implementación: helper común, `CertificateQrImageService`, PNG on-demand, `Response::noStoreSecurityHeaders()`. |
| `tasks.md` | Todas las tareas y el correctivo C1 están marcados como completos y tienen evidencia runtime. |
| Specs delta | Requisitos y escenarios cubiertos por tests unitarios, HTTP y E2E DB-backed. |
| Apply progress Engram | Coherente con el diff y con el correctivo post apply-gate. |

## Matriz de completitud

| Dimensión | Estado | Evidencia |
|---|---|---|
| Tareas | PASS | 1.1–5.4 y C1 completos en `tasks.md`. |
| Specs | PASS | Tests ejecutados cubren success/error/no-side-effects/runtime PNG. |
| Diseño | PASS | Código inspeccionado coincide con decisiones principales del diseño. |
| Seguridad | PASS | `X-Admin-Key`, errores seguros, sin token completo como campo separado, sin DB mutation/audit en QR. |
| Documentación humana | WARNING | `docs/backend/01-contrato-api-certificados.md`, `docs/backend/API.md` y `docs/backend/00-php84-api.md` deben sincronizarse durante `sdd-archive`. |

## Evidencia de comandos

| Comando | Resultado | Nota |
|---|---|---|
| `php -v` | WARNING | `php: orden no encontrada`; no hay PHP local. |
| `docker build -t ifts14-php84 -f docker/php84/Dockerfile .` | PASS | Imagen construida; Dockerfile instala `libpng-dev` y `gd`. |
| `docker run --rm ifts14-php84 php -m` | PASS | Módulos incluyen `gd`, `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `php -l` vía Docker sobre archivos PHP modificados/nuevos | PASS | Sin errores de sintaxis en `index.php`, servicios y tests QR/HTTP. |
| `docker run ... php tests/QrImageTest.php` | PASS | `OK QrImageTest`. |
| `docker run ... php tests/HttpContractTest.php` | PASS | `OK HttpContractTest`; emitió notices benignos de `file_get_contents()` por requests sin `Content-Type`, esperados por los casos negativos. |
| MariaDB 10.6.27 descartable + `php tests/HttpEmissionE2eTest.php` | PASS | `OK HttpEmissionE2eTest`; cubre emisión real + descarga QR `200 image/png` + token sin mutación. |
| `bash scripts/php-docker-modules-check.sh` | WARNING | Falla por `sudo: A terminal is required to authenticate`; se ejecutó equivalente directo con Docker sin sudo. |

## Matriz de cumplimiento por spec

| Requisito / escenario | Estado | Evidencia runtime |
|---|---|---|
| Descarga QR autorizada | PASS | `HttpEmissionE2eTest.php`: emisión real, `GET /admin/certificados/{id}/qr.png`, `200`, `image/png`, `attachment`, `Content-Length`, magic bytes PNG. |
| Errores de contrato seguros | PASS | `HttpContractTest.php`: `401`, `405 Allow: GET`, `400`, errores JSON con security + anti-cache. |
| Token no recuperable | PASS | `QrImageTest.php`: `409 TOKEN_NOT_RECOVERABLE` para token ausente/clave inválida. |
| Anti-cache PDF/QR/JSON | PASS | `Response::noStoreSecurityHeaders()`, `streamPdf()`, `streamQrPng()`, `HttpContractTest.php`, `HttpEmissionE2eTest.php`. |
| Filename seguro PDF/QR | PASS | `safeDownloadName()` en `streamPdf()`/`streamQrPng()`; `QrImageTest.php` valida `CERT;2026\nDEMO` → `CERT_2026_DEMO-qr.png`. |
| QR usa URL pública canónica | PASS | `AdminCertificateService::deliveryTokenData()` reutiliza `buildPublicValidationUrl()`; `QrImageTest.php` verifica token permanente en la URL. |
| Sin side effects | PASS | `QrImageTest.php` valida sin auditoría, sin transacción abierta, sin persistir PNG, tokens sin cambios; `HttpEmissionE2eTest.php` compara snapshot de token antes/después. |
| Dependencia runtime PNG | PASS | Docker PHP contiene `gd`; `QrImageTest.php` valida magic bytes si `imagecreate()` está disponible y falla cerrado ante URL vacía. |
| Entrega QR no cambia flujo | PASS | `/reenviar` sigue `404`; entrega manual/PDF no se reemplazan; no hay email ni regeneración. |

## Coherencia de diseño

| Decisión | Estado | Evidencia |
|---|---|---|
| Helper común en `AdminCertificateService` | PASS | `loadManualDeliveryData()` centraliza lectura, token y URL; `entregaManual()` suma PDF; `deliveryTokenData()` no exige PDF. |
| Servicio QR mínimo sin Composer nuevo | PASS | `CertificateQrImageService` usa TCPDF existente y devuelve string PNG. |
| PNG on-demand | PASS | No hay persistencia de PNG; tests verifican ausencia de archivo. |
| Anti-cache centralizado | PASS | `Response::noStoreSecurityHeaders()` usado por JSON, errores, PDF y QR. |
| GD en Docker | PASS | Dockerfile y módulo runtime verificados. |

## Hallazgos

### CRITICAL

Ninguno.

### WARNING

1. PHP local no está instalado (`php -v` falla). La verificación se ejecutó con Docker PHP 8.4.
2. Los scripts `scripts/php-docker-build.sh` / `scripts/php-docker-modules-check.sh` dependen de `sudo`; en esta sesión `sudo` no puede autenticar por falta de TTY. El equivalente directo con `docker` pasó.
3. La documentación humana de backend todavía no lista el endpoint QR; debe sincronizarse en `sdd-archive` según las reglas del ciclo.

### SUGGESTION

1. En `sdd-archive`, agregar el endpoint `GET /certificados/api/admin/certificados/{id}/qr.png` en los docs backend y aclarar que requiere `gd`/soporte PNG en hosting.

## Riesgos residuales

- Falta confirmar `gd` o soporte PNG equivalente en cPanel/staging real antes de deploy.
- La auth simple `X-Admin-Key` sigue siendo temporal por decisión vigente; no se reemplaza en este ciclo.

## Resultado

`PASS WITH WARNINGS`: listo para `sdd-archive` y sincronización documental. No se ejecutó stage, commit, push, merge ni rebase.
