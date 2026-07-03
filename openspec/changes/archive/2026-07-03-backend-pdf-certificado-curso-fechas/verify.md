# Verificación — backend-pdf-certificado-curso-fechas

## Resultado

**Estado:** PASS WITH WARNINGS

El bloqueo crítico previo quedó resuelto: `apps/backend-php/tests/HttpEmissionE2eTest.php` ahora invoca la URL `pdfDownloadUrl` del certificado emitido y verifica descarga HTTP real del PDF con `200`, `Content-Type: application/pdf`, `Content-Disposition: attachment` y cuerpo iniciado en `%PDF-`. La suite enfocada con Docker PHP 8.4 + MariaDB 10.6.27 pasó. Persisten solo advertencias ambientales locales: PHP nativo no está instalado y el script con `sudo` queda bloqueado en esta sesión sin TTY.

## Evidencia de comandos

| Comando | Resultado |
|---|---|
| `php -v` | WARNING ambiental: `php: orden no encontrada`. |
| `bash scripts/php-docker-lint.sh` | WARNING ambiental: `sudo: A terminal is required to authenticate`. |
| `docker --version` | PASS: Docker 29.1.3 disponible. |
| `rtk docker run --rm -v "$PWD/apps/backend-php:/app:ro" -w /app php:8.4-cli sh -lc 'php -v && for f in src/AdminCertificateService.php src/CertificatePdfService.php tests/SnapshotEmissionTest.php tests/HttpEmissionE2eTest.php tests/PdfResilienceTest.php tests/HttpContractTest.php tests/EntregaManualTest.php; do php -l "$f" || exit 1; done'` | PASS: PHP 8.4.22 Docker; sin errores de sintaxis en servicios y tests relevantes. |
| `rtk docker run --rm -v "$PWD/apps/backend-php:/app:ro" -w /app php:8.4-cli sh -lc 'for f in src/*.php; do php -l "$f" || exit 1; done'` | PASS: sin errores de sintaxis en `apps/backend-php/src/*.php`. |
| `rtk docker run --rm -v "$PWD/apps/backend-php:/app" -w /app php:8.4-cli sh -lc 'php tests/HttpContractTest.php && php tests/EntregaManualTest.php'` | PASS: `OK HttpContractTest`, `OK EntregaManualTest`, `OK TokenCipher fail-closed + round-trip`. `HttpContractTest` emitió notices conocidos de `Content-type not specified`, sin fallo. |
| `rtk docker run --rm -v "$PWD/apps/backend-php:/app" -w /app php:8.4-cli sh -lc 'php tests/PdfResilienceTest.php'` | PASS: `OK PdfResilienceTest`. |
| `rtk docker run --rm ifts14-php84 php -m` | PASS: módulos requeridos disponibles, incluyendo `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| MariaDB 10.6.27 descartable + Docker network + `ifts14-php84`: `php apps/backend-php/tests/SnapshotEmissionTest.php && php apps/backend-php/tests/HttpEmissionE2eTest.php` | PASS: readiness PDO OK; `OK SnapshotEmissionTest`; `OK HttpEmissionE2eTest`. |
| `rtk git diff --check` | PASS: sin whitespace errors reportados. |

## Matriz de cumplimiento

| Dimensión | Estado | Evidencia |
|---|---|---|
| Configuración institucional desde `cert_configuracion_institucional` con fallback seguro | PASS | `AdminCertificateService::loadInstitutionalConfig()` usa prepared statement sobre `id = 1`, merge con defaults y `mb_substr(..., 0, 255)`; `SnapshotEmissionTest.php` y `HttpEmissionE2eTest.php` pasaron con config presente y ausente. |
| Render PDF con DTO institucional, texto, firmantes, fechas snapshot y QR | PASS WITH WARNING | `CertificatePdfService::generate()` renderiza institución, texto escapado, alumno/curso/DNI, fechas snapshot, firmantes y QR. `PdfResilienceTest.php` genera PDF institucional binario válido. No se parsea texto del PDF por decisión de diseño para evitar pruebas frágiles. |
| Emisión administrativa conserva DTO y token permanente | PASS | `SnapshotEmissionTest.php` y `HttpEmissionE2eTest.php` pasaron con `publicValidationUrl`, `pdfDownloadUrl`, `tokenPrefix`, sin DNI completo administrativo ni token completo separado. |
| Validación pública conserva snapshot | PASS | `SnapshotEmissionTest.php` verifica `documentNumber` y `attendedDates`, incluso después de anular asistencia y mutar fecha viva. |
| Entrega manual conserva token/QR y no rota | PASS | `HttpEmissionE2eTest.php` compara `publicValidationUrl` y `tokenPrefix`; `EntregaManualTest.php` cubre recuperación, fail-closed y round-trip de token cifrado. |
| `/reenviar` fuera de alcance/ausente | PASS | `HttpEmissionE2eTest.php` y `HttpContractTest.php` verifican `404 NOT_FOUND`; no se agregó SMTP/email/reenvío automático. |
| Descarga PDF positiva conserva contrato HTTP | PASS | `HttpEmissionE2eTest.php` usa `pdfDownloadUrl`, ejecuta `GET /admin/certificados/{id}/pdf` con `X-Admin-Key` y `assertPdfDownload()` valida `200`, `application/pdf`, `attachment` y `%PDF-`. |
| Tasks/docs exactos | PASS | `tasks.md` traza Descarga PDF a T3.3 y la prueba runtime versionada ahora lo cubre. |

## Hallazgos

### CRITICAL

- Ninguno.

### WARNING

- PHP local no está instalado (`php -v` falla). La evidencia se obtuvo con Docker PHP 8.4.22 y la imagen `ifts14-php84`.
- `scripts/php-docker-lint.sh` usa `sudo docker` y queda bloqueado por autenticación interactiva sin TTY. Se ejecutó lint equivalente con Docker directo sin `sudo`.
- La verificación textual del contenido del PDF no parsea el binario. Es coherente con el diseño aprobado; la cobertura runtime valida generación/persistencia/descarga binaria y headers.
- `HttpContractTest.php` emite notices PHP conocidos por requests sin `Content-Type`; no fallan la prueba.

### SUGGESTION

- Si se quiere endurecer aún más la descarga, agregar en `assertPdfDownload()` una aserción de `Content-Length > 100`. No bloquea: el prefijo `%PDF-`, headers y generación binaria ya están cubiertos.

## Riesgos

- La máquina local depende de Docker para reproducir evidencia backend porque no tiene PHP nativo instalado.
- El contenido textual del PDF sigue validándose por source inspection + generación binaria, no por parseo del PDF.

## Próximo paso recomendado

Proceder con `sdd-archive` del ciclo si el usuario lo aprueba. No hacer stage, commit, push, merge ni rebase en esta verificación.

## Resolución de skills

- Leídos antes del trabajo: `sdd-verify`, `karpathy-guidelines`, `ponytail`, `php-best-practices`.
- `systematic-debugging`: no se cargó en esta re-verificación porque no apareció un fallo de implementación; los bloqueos fueron ambientales y ya estaban caracterizados.
- Strict TDD: inactivo por `openspec/config.yaml` (`strict_tdd: false`).
