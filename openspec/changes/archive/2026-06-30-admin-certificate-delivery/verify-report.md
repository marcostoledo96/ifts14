## Verification Report

**Change**: `admin-certificate-delivery`  
**Branch**: `backend/admin-certificate-delivery`  
**Mode**: Standard (`strict_tdd: false`)  
**Artifact store**: hybrid (`openspec` + Engram)  
**Fecha**: 2026-06-30  
**Veredicto final**: **PASS WITH WARNINGS**

### Resumen ejecutivo

La corrección posterior al verify anterior resuelve los CRITICAL reportados: ahora existe cobertura runtime del flujo exitoso de reenvío con fake PDO/transporte, rotación de token, auditoría segura, `404 CERTIFICATE_NOT_FOUND`, cuerpo de email y hardening de `smtp_port`. Además, el handler HTTP ya falla cerrado con `503 DELIVERY_NOT_CONFIGURED` cuando `Config::requireDeliveryConfig()` rechaza la configuración de entrega.

Quedan advertencias no bloqueantes: la evidencia positiva usa fake PDO/fake transport en lugar de MariaDB/SMTP reales; los wrappers Docker documentados usan `sudo`, por lo que se ejecutaron equivalentes directos sin sudo; no hay métrica formal de cobertura.

### Artifacts Re-read

| Artefacto | Estado |
|---|---|
| `proposal.md` | Leído |
| `design.md` | Leído |
| `tasks.md` | Leído |
| `apply-progress.md` | Leído, incluida corrección post-verify |
| `verify-report.md` previo | Leído |
| Specs delta del cambio | 3/3 leídas |
| Código/tests modificados | Leídos: `index.php`, `Config.php`, `AdminCertificateService.php`, transportes, tests de entrega/reenvío/HTTP |
| Docs relevantes | Leídos: backend contract, deploy, README backend |

### Completeness

| Métrica | Valor |
|---|---:|
| Tasks totales | 22 |
| Tasks completas | 22 |
| Tasks incompletas | 0 |
| Specs delta leídas | 3 |
| CRITICAL previos resueltos | 5/5 |
| Tests procedurales backend ejecutados | 6 |

### Build, Tests & Validation Evidence

| Comando | Resultado | Evidencia relevante |
|---|---|---|
| `docker build -t ifts14-php84 -f docker/php84/Dockerfile .` | ✅ exit 0 | Imagen `ifts14-php84:latest` construida desde cache. |
| `docker run --rm ifts14-php84 php -v` | ✅ exit 0 | PHP `8.4.22` CLI. |
| `docker run --rm ifts14-php84 php -r '<module check>'` | ✅ exit 0 | `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml` presentes. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 sh -lc '... php -l ...'` | ✅ exit 0 | `PHP lint OK (21 files, vendor excluded)`. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app composer:2 composer validate --no-check-publish` | ✅ exit 0 | `composer.json is valid`; warning no bloqueante: falta `license`. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 php tests/AdminCertificateServiceTest.php` | ✅ exit 0 | `OK AdminCertificateServiceTest`. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 php tests/EmailDeliveryServiceTest.php` | ✅ exit 0 | `OK EmailDeliveryServiceTest`. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 php tests/ResendFlowTest.php` | ✅ exit 0 | `OK ResendFlowTest`. Cubre 200 lógico, rotación, auditoría, 404, body, privacidad y `smtp_port`. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 php tests/HttpContractTest.php` | ✅ exit 0 | `OK HttpContractTest`; `Notice` esperado por request sin `Content-Type` en el caso 415. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 php tests/AuthGateTest.php` | ✅ exit 0 | `OK AuthGateTest`. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 php tests/PdfResilienceTest.php` | ✅ exit 0 | `OK PdfResilienceTest`. |
| `docker run --rm -v "$PWD/apps/backend-php:/app:ro" --workdir /app ifts14-php84 php -r '<invalid numeric-string port check>'` | ✅ exit 0 | Puerto `"99999"` normalizado por Config falla cerrado en `SmtpEmailDeliveryTransport::assertConfigured()` antes de DB. |
| `git status --short --untracked-files=all -- <private/secret/vendor paths>` | ✅ sin cambios relevantes | Sin cambios en `material_privado_no_versionar/`, `.env`, `public_html`, cPanel real, backups, dumps ni `vendor/`. |
| `git status --short --ignored=matching -- apps/backend-php/vendor apps/backend-php/composer.lock` | ✅ política Composer | `?? apps/backend-php/composer.lock`; `!! apps/backend-php/vendor/`. |
| `git check-ignore -v apps/backend-php/vendor/autoload.php apps/backend-php/composer.lock` | ✅ política Composer | `vendor/` ignorado por `.gitignore:19`; `composer.lock` exceptuado por `.gitignore:22`. |

**Coverage**: no hay herramienta de coverage configurada. La cobertura se verificó por escenarios ejecutados + inspección de código.

### Prior CRITICAL Resolution

| CRITICAL previo | Estado | Evidencia |
|---|---|---|
| Reenvío exitoso sin cobertura runtime | ✅ Resuelto | `ResendFlowTest.php` ejecuta `AdminCertificateService::reenviar(10, ...)` con certificado vigente y transporte capturador; devuelve DTO seguro y captura URL de validación. |
| Rotación y auditoría DB sin evidencia ejecutada | ✅ Resuelto | Fake PDO en memoria verifica token previo revocado, token nuevo activo y auditoría `reenvio/ok` con `destinatarioEnmascarado`. |
| `404 CERTIFICATE_NOT_FOUND` autorizado sin cobertura | ✅ Resuelto | `ResendFlowTest.php` cubre certificado inexistente y certificado no vigente, sin envío de email. |
| `EmailDeliveryServiceTest.php` sobredeclaraba cobertura | ✅ Resuelto | La cobertura fuerte queda en `ResendFlowTest.php`; `EmailDeliveryServiceTest.php` queda como unitario complementario. |
| Bypass de configuración SMTP inválida | ✅ Resuelto | `index.php` responde `503` inmediato si `Config::requireDeliveryConfig()` falla; `HttpContractTest.php` confirma `503` con SMTP incompleto sin intentar DB. |

### Spec Compliance Matrix

| Requirement | Scenario | Evidencia runtime | Resultado |
|---|---|---|---|
| Reenvío administrativo por email | Reenvío exitoso | `ResendFlowTest.php` ejecuta flujo exitoso con certificado vigente, transporte configurado fake, DTO seguro y URL `/validar/{token}`. `index.php` enruta el resultado del servicio como `200`. | ✅ COMPLIANT |
| Reenvío administrativo por email | Rotación revoca token anterior | `ResendFlowTest.php` confirma token anterior `revocado` con `revocado_en` y token nuevo `activo` con prefijo distinto. | ✅ COMPLIANT |
| Reenvío administrativo por email | Reenvío sin autorización | `HttpContractTest.php` confirma `401 UNAUTHORIZED`; `AuthGateTest.php` cubre claves faltantes/inválidas. | ✅ COMPLIANT |
| Reenvío administrativo por email | Certificado inexistente | `ResendFlowTest.php` confirma `404 CERTIFICATE_NOT_FOUND` para id inexistente y certificado no vigente; transporte no envía. | ✅ COMPLIANT |
| Reenvío administrativo por email | Transporte no configurado | `HttpContractTest.php` confirma `503 DELIVERY_NOT_CONFIGURED` en `stub` y SMTP incompleto; `EmailDeliveryServiceTest.php` confirma stub antes de transacción. | ✅ COMPLIANT |
| Privacidad del token | Token solo en email | `ResendFlowTest.php` confirma token completo en URL capturada, no en DTO ni auditoría; body SMTP contiene el token una sola vez dentro del enlace. | ✅ COMPLIANT |
| Privacidad del token | Auditoría de entrega sin token | `ResendFlowTest.php` verifica `reenvio/ok`, `request_id`, `destinatarioEnmascarado` y ausencia de email/token completo en `detalle_seguro`. | ✅ COMPLIANT |
| Adaptador configurable | Modo stub explícito | `StubEmailDeliveryTransport` + tests HTTP/servicio responden `503` sin DB/rotación. | ✅ COMPLIANT |
| Adaptador configurable | Modo SMTP sin credenciales | `HttpContractTest.php` confirma `503`; `Config::requireDeliveryConfig()` y transporte fallan cerrados. | ✅ COMPLIANT |
| Adaptador configurable | Modo SMTP con credenciales | `SmtpEmailDeliveryTransport::assertConfigured()` acepta config completa; envío real queda como `MAY` y requiere credenciales externas no versionadas. | ✅ COMPLIANT |
| Contenido del email limitado | Email solo con enlace | `ResendFlowTest.php` inspecciona `buildBody()` vía reflection: contiene `/validar/{token}` y el token aparece una vez. Código no llama `addAttachment()`. | ✅ COMPLIANT |
| Contenido del email limitado | Adjunto PDF diferido | Docs/spec mantienen adjuntos fuera de alcance; código SMTP no agrega adjuntos. | ✅ COMPLIANT |
| Bloqueo sin configuración | Stub sin entrega real | HTTP `503` en modo `stub`; validación de transporte ocurre antes de abrir PDO. | ✅ COMPLIANT |
| Bloqueo sin configuración | Decisión SMTP confirmada | `composer.json` agrega PHPMailer; `composer.lock` fija `phpmailer/phpmailer v6.12.0` y `tecnickcom/tcpdf 6.11.3`; `vendor/` ignorado. | ✅ COMPLIANT |
| Rollback documentado | Rollback ejecutable | `docs/deploy/00-cpanel-certificados.md` documenta volver a `delivery_transport => 'stub'`, retirar ruta y conservar certificados/tokens. | ✅ COMPLIANT |
| Modelo de datos | Rotación sobre tabla existente | `ResendFlowTest.php` ejecuta SQL mapeado contra fake PDO usando `cert_tokens_verificacion`; no hay migración nueva. | ✅ COMPLIANT |
| Modelo de datos | Auditoría de reenvío sobre tabla existente | `ResendFlowTest.php` verifica inserción en `cert_eventos_auditoria` fake con tipo `reenvio`. | ✅ COMPLIANT |
| Modelo de datos | Sin `cert_entregas` salvo necesidad | No se modificó `database/migrations/001_certificados_qr.sql`; no existe tabla nueva. | ✅ COMPLIANT |
| Contrato API | Reenvío documentado | `docs/backend/01-contrato-api-certificados.md` documenta endpoint, DTO, errores y privacidad. | ✅ COMPLIANT |
| Composer / privacidad repo | `composer.lock` versionable, `vendor/` ignorado | `.gitignore` exceptúa `apps/backend-php/composer.lock`; `git check-ignore` confirma `vendor/` ignorado. | ✅ COMPLIANT |

**Compliance summary**: 20 compliant / 0 partial / 0 failing. Veredicto: **PASS WITH WARNINGS** por límites de evidencia operativa, no por incumplimiento de spec.

### Correctness Table

| Área | Estado | Evidencia |
|---|---|---|
| Handler HTTP falla cerrado ante config delivery inválida | ✅ Correcto | `index.php` captura `RuntimeException` de `Config::requireDeliveryConfig()` y responde `503 DELIVERY_NOT_CONFIGURED` con `return` antes del factory/DB. |
| `smtp_port` validado | ✅ Correcto | `SmtpEmailDeliveryTransport::assertConfigured()` exige int `1..65535`; `ResendFlowTest.php` cubre ausente y fuera de rango; check adicional confirma numeric-string inválido falla cerrado en transporte. |
| Token no aparece en JSON | ✅ Correcto | DTO de `reenviar()` solo contiene `certificadoId`, `enviadoEn`, `destinatarioEnmascarado`; test valida ausencia de email completo/token. |
| Token no aparece en auditoría como texto plano | ✅ Correcto | Auditoría `reenvio` usa `destinatarioEnmascarado` y `token_hash_prefijo`; test valida ausencia del token del enlace. |
| Token no se guarda en DB plaintext | ✅ Correcto | Servicio inserta `token_hash` binario + `token_prefijo`; test confirma prefijo distinto del token completo del enlace. |
| Rotación de token | ✅ Correcto | Test confirma token activo previo revocado y token nuevo activo. |
| Errores seguros | ✅ Correcto | HTTP tests cubren `401`, `400`, `405`, `415`, `503`; service test cubre `404`; envelopes sin email/token. |
| Material privado/secretos/cPanel/vendor | ✅ Correcto | Status focalizado no lista material privado, `.env`, `public_html`, cPanel real, dumps, backups ni `vendor/` versionable. |

### Design Coherence Table

| Decisión de diseño | ¿Seguida? | Evidencia |
|---|---|---|
| Transporte `EmailDeliveryTransport` con stub y SMTP | ✅ Sí | Interfaz, stub, SMTP y factory existen; `index.php` usa factory. |
| PHPMailer + `composer.lock` versionado, `vendor/` ignorado | ✅ Sí | `composer.json`/`composer.lock` actualizados; `.gitignore` exceptúa lock y mantiene `vendor/`. |
| Config externa `delivery_transport=stub|smtp` | ✅ Sí | `Config::requireDeliveryConfig()` normaliza modo; docs/config example actualizados. |
| SMTP incompleto no abre transacción | ✅ Sí | `index.php` valida config y `transport->assertConfigured()` antes de `Database::pdo()`. |
| Auditoría sobre `cert_eventos_auditoria.detalle_seguro` | ✅ Sí | No hay migración nueva; `safeAudit('reenvio', ...)` usa `destinatarioEnmascarado`. |
| Token completo solo en email | ✅ Sí | Servicio usa token completo solo para `$validationUrl`; tests validan DTO/auditoría/body. |
| Rollback a `stub` | ✅ Sí | Deploy docs describen rollback sin tocar certificados/tokens. |

### Issues Found

#### CRITICAL

Ninguno.

#### WARNING

1. **Evidencia positiva acotada a fake PDO/fake transport**: suficiente para el gate SDD de este slice, pero no reemplaza un smoke futuro con MariaDB demo y SMTP real/configurado. El envío SMTP real es `MAY` según spec y requiere credenciales externas no versionadas.
2. **Wrappers Docker con `sudo`**: se usaron equivalentes directos sin sudo porque los scripts documentados requieren un entorno interactivo/TTY para `sudo`. Los equivalentes pasaron.
3. **Sin coverage formal**: no hay runner de coverage PHP configurado; la verificación se hizo por matriz escenario → test runtime.

#### SUGGESTION

1. Agregar en un ciclo posterior un smoke opcional con MariaDB demo + endpoint HTTP `POST /admin/certificados/{id}/reenviar` exitoso, si se quiere evidencia end-to-end por encima del fake PDO.
2. Si OpenCode debe ejecutar siempre los wrappers, documentar/crear variantes sin `sudo` de `scripts/php-docker-*.sh`.
3. Como defensa en profundidad menor, revalidar rango después de castear `smtp_port` numérico-string dentro de `Config::requireDeliveryConfig()`; el flujo actual ya falla cerrado en `SmtpEmailDeliveryTransport::assertConfigured()`.

### Security / Privacy Gate

| Check | Resultado |
|---|---|
| `material_privado_no_versionar/` tocado | ✅ No |
| `.env` / secretos tocados | ✅ No |
| cPanel real / `public_html` tocado | ✅ No |
| dumps/logs/backups tocados | ✅ No |
| `apps/backend-php/vendor/` versionable | ✅ No, ignorado |
| `apps/backend-php/composer.lock` versionable | ✅ Sí, exceptuado por `.gitignore` |

### Final Verdict

**PASS WITH WARNINGS** — listo para `sdd-archive` si el equipo acepta que la evidencia positiva de reenvío usa fake PDO/fake transport y que el smoke con SMTP/MariaDB reales queda fuera de este ciclo.

### next_recommended

Ejecutar `sdd-archive` para sincronizar specs/docs. No stagear, commitear ni pushear desde esta verificación.
