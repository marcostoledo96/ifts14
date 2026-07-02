# Apply Progress — backend-entrega-manual-certificados

**Change**: backend-entrega-manual-certificados
**Mode**: Standard (strict_tdd: false)
**Delivery**: single-pr, size:exception aprobado por Marcos (600–900 líneas estimadas)
**Branch**: backend-entrega-manual-certificados
**Fecha**: 2026-07-01

## Resumen ejecutivo

Reemplazo del flujo de reenvío por email por entrega manual de Bedelía. Se eliminó SMTP/PHPMailer/transporte `stub|smtp` y el endpoint `/reenviar` (queda 404). Se agregó `GET /admin/certificados/{id}/entrega-manual` (solo lectura, sin rotación, sin escritura). Se introdujo `token_cifrado` con AES-256-GCM (envelope `v1.<iv>.<tag>.<ciphertext>`, clave externa de 32 bytes) para reconstruir `publicValidationUrl` sin texto plano. La emisión persiste `token_cifrado` y devuelve `publicValidationUrl` + `tokenPrefix` además de `pdfDownloadUrl`. Certificados previos sin `token_cifrado` responden `409 TOKEN_NOT_RECOVERABLE` (no se regeneran).

### Pase correctivo (2026-07-01, post gate BLOCK)

Se corrigieron 4 blockers detectados por verificación fresca:

1. **TokenCipher fail-closed endurecido**: `decrypt()` ahora valida explícitamente que IV decodificado == 12 bytes y tag decodificado == 16 bytes (además de clave 32 bytes y formato `v1.…` de 4 partes). Antes aceptaba envelopes con IV/tag de longitud arbitraria. Agregados 6 escenarios procedurales en `EntregaManualTest.php` (IV 11/13 bytes, tag 15/17 bytes, clave 31 bytes, partes != 4, versión v2, round-trip válido).
2. **Drift email/reenvío en docs/prompts/v0 corregido**: `prompts_stitch_v0_ifts14.md` sección 18 ("Enviar / reenviar certificación" → "Entrega manual de certificación"), líneas de dashboard/pendientes/curso-editor/asistencias/listado/auditoría; `docs/frontend/00-angular20-port-v0.md` (tabla pantalla 18 + notas QR); `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (tabla pantalla 18). Sin SMTP, sin "Enviar ahora", sin "reenviar" en MVP.
3. **Migración 002 — gate humano explícito**: no se falsó evidencia. MariaDB activo pero sin credenciales accesibles (sin sudo). Tarea 1.2 permanece `- [ ]` con comando exacto de verificación documentado.
4. **HTTP 200/409 DB-backed — gate de integración explícito**: service-level 200/409 probado sobre fake PDO; HTTP DB-backed diferido a `sdd-verify`/DB real. No se falsó evidencia.

### Pase correctivo final (2026-07-01, post segundo gate BLOCK)

Corrige los 2 blockers restantes detectados por recheck fresco:

1. **Drift email/reenvío activo fuera de sección 18 en `prompts_stitch_v0_ifts14.md`**: se reemplazó TODO el lenguaje MVP activo de envío/reenvío por entrega manual fuera del sistema. Puntos corregidos:
   - Línea ~46: "se reenvía el PDF/aviso…" → entrega manual por canal externo, mismo QR, sin SMTP/PHPMailer/reenviar.
   - Dashboard actividad reciente: "certificado reenviado" → "entrega manual realizada".
   - Curso-editor aviso: "reenviar el certificado al alumno" → nueva entrega manual (copiar link / descargar PDF), mismo QR.
   - Nueva certificación (Stitch + v0): "Emitir y enviar" → "Emitir certificado"; texto de apoyo sin "envío al alumno", con aclaración de entrega manual y no-email.
   - Detalle certificación (Stitch + v0): objetivo sin "reenviar"; "estado de envío"/"fecha de último envío" → "fecha de última entrega manual"/"estado de entrega"; acciones principales sin "Enviar por email"/"Reenviar certificado", con "Copiar link" en su lugar; aviso sin reenvío; historial sin "enviada"/"reenviada", con "entrega manual realizada".
   - Auditoría (Stitch + v0): "PDF reenviado" → "Entrega manual realizada".
   - Configuración institucional (Stitch + v0): objetivo sin "emails" como destino de envío; secciones "4. Email" (remitente/asunto/texto base) → "4. Contacto institucional (metadata, sin envío automático)" con aclaración explícita de no-SMTP/no-PHPMailer/no-reenviar y que el email es solo metadata institucional/persona.
   - Verificación grep: 0 coincidencias activas de `reenv|enviar por email|PDF reenviado|Emitir y enviar|SMTP|enviar email|enviar el PDF|enviar el aviso|estado de envío|fecha de último envío|remitente|asunto por defecto`. Las menciones restantes de "email" son datos de persona/alumno (campo email, filtro "sin email"), advertencias de no-envío, o la aclaración de metadata institucional.
2. **`tasks.md` tarea 3.3 — split veraz**: se dividió en 3.3a (HTTP 401/405/400/404 pre-DB, cubierto, marcado `[x]`) y 3.3b (HTTP 200/409 DB-backed, **pendiente**, marcado `[ ]` con nota explícita: service-level cubierto por fake PDO, ruta HTTP no ejecutada contra DB viva, diferido a `sdd-verify`/DB real, sin falsificación de evidencia). Alinea con `apply-progress.md` item abierto 2.

## Tareas completadas

### Phase 1: Foundation (migración + cifrado + Config)
- [x] 1.1 Migración `002_token_cifrado_entrega_manual.sql` (ALTER TABLE ADD token_cifrado VARBINARY(512) NULL + rollback).
- [ ] 1.2 Aplicar 002 contra DB ficticia local — **PENDIENTE**: requiere MariaDB/Docker con sudo; queda para Marcos/Matías.
- [x] 1.3 `TokenCipher.php` (AES-256-GCM, envelope v1, IV 12B, tag 16B, clave 32B, fail closed).
- [x] 1.4 `Config.php`: `requireTokenCipherKey()` agregado; `requireDeliveryConfig()` y normalización SMTP eliminados.
- [x] 1.5 `certificados-config.example.php`: SMTP removido; `token_encryption_key` ficticio agregado.

### Phase 2: Core (servicio + router + limpieza email)
- [x] 2.1 `emitir()` persiste `token_cifrado` en INSERT dentro de la transacción; DTO 201 incluye `publicValidationUrl`; fallo de cifrado aborta sin commit.
- [x] 2.2 `entregaManual()` agregado: lee certificado vigente + token activo, descifra en memoria, devuelve `{certificadoId, publicValidationUrl, pdfDownloadUrl, tokenPrefix}`; 409 TOKEN_NOT_RECOVERABLE ante ausencia/envelope inválido/clave inválida/descifrado fallido.
- [x] 2.3 `reenviar()`, `maskEmail()` y referencias a `EmailDeliveryTransport*` eliminados; rama `reenvio` en `safeAudit()` quitada con `// ponytail:`.
- [x] 2.4 `index.php`: `require_once` de email removidos; bloque `/reenviar` eliminado (404 por default).
- [x] 2.5 `index.php`: ruta `GET /admin/certificados/{id}/entrega-manual` agregada con method/auth/filter_var/requirePdfConfig/requireTokenCipherKey; mapeo 200/400/401/404/405/409/500.
- [x] 2.6 Archivos email borrados: `EmailDeliveryTransport.php`, `StubEmailDeliveryTransport.php`, `SmtpEmailDeliveryTransport.php`, `EmailDeliveryTransportFactory.php`.
- [x] 2.7 `composer.json`: `phpmailer/phpmailer` removido; `tecnickcom/tcpdf` y `php: >=8.4` mantenidos. `composer.lock` editado manualmente (phpmailer entry removido). **OPEN**: content-hash no se pudo regenerar sin Composer local; ejecutar `composer update --lock` antes de deploy.

### Phase 3: Testing
- [x] 3.1 `EntregaManualTest.php` creado: 200 exitoso, 409 (sin token, envelope inválido, clave inválida, descifrado fallido, clave ausente), 404 (inexistente, revocado, vencido), 400 (id no numérico), privacidad (token solo en URL).
- [x] 3.2 `EmailDeliveryServiceTest.php` y `ResendFlowTest.php` eliminados.
- [x] 3.3a `HttpContractTest.php`: casos 401/405/400 para `/entrega-manual` (pre-DB, cubiertos); `/reenviar` → 404 NOT_FOUND (POST y GET).
- [ ] 3.3b **GATE de integración pendiente**: HTTP 200/409 DB-backed para `GET /admin/certificados/{id}/entrega-manual` contra MariaDB real. Service-level cubierto por fake PDO; ruta HTTP no ejecutada contra DB viva. Diferido a `sdd-verify`.
- [x] 3.4 `AdminCertificateServiceTest.php`: asserts sobre `buildPublicValidationUrl` (con y sin base URL).

### Phase 4: Docs + Prompts + v0
- [x] 4.1 `docs/backend/00-php84-api.md` y `01-contrato-api-certificados.md`: endpoints, DTO 201, DTO 200 entrega manual, error 409, reenvío removido.
- [x] 4.2 `docs/database/01-modelo-datos-certificados.md`: `token_cifrado` VARBINARY(512), migración 002, `reenvio` obsoleto.
- [x] 4.3 `docs/deploy/00-cpanel-certificados.md` y `01-staging-cpanel-certificados.md`: `token_encryption_key` externa, sin SMTP/PHPMailer.
- [x] 4.4 `MATIAS_PROMPTS_SDD_FASE2.md`: prompt 18 → entrega manual (copiar link / descargar PDF); sin reenvío/email.
- [x] 4.5 `muestra_pagina/MANIFIESTO_V0.md`: CTAs manuales, sin SMTP/PHPMailer/reenvío.
- [x] 4.6 Confirmado: no se versionaron secretos, `.env`, `material_privado_no_versionar/`, `public_html/`, `vendor/`, ni dumps.
- [ ] 4.7 `sdd-verify` + `sdd-archive` — fase posterior (no es parte de apply).

## Archivos cambiados

| Archivo | Acción | Descripción |
|---|---|---|
| `database/migrations/002_token_cifrado_entrega_manual.sql` | Creado | ALTER TABLE ADD token_cifrado VARBINARY(512) NULL + rollback. |
| `apps/backend-php/src/TokenCipher.php` | Creado | AES-256-GCM encrypt/decrypt, envelope v1, base64url, fail closed. |
| `apps/backend-php/src/Config.php` | Modificado | `requireTokenCipherKey()` agregado; `requireDeliveryConfig()` y SMTP removidos. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificado | `entregaManual()`, `encryptToken()`, `recoverToken()`, `buildPublicValidationUrl()` agregados; `reenviar()`, `maskEmail()` eliminados; `emitir()` persiste token_cifrado + DTO con publicValidationUrl; nuevo param `tokenCipherKey`. |
| `apps/backend-php/index.php` | Modificado | require_once email removidos; `/reenviar` eliminado; `GET /entrega-manual` agregado; `loadTokenCipherKey()` helper. |
| `apps/backend-php/config/certificados-config.example.php` | Modificado | SMTP removido; `token_encryption_key` + `admin_api_key` ficticios. |
| `apps/backend-php/composer.json` | Modificado | `phpmailer/phpmailer` removido. |
| `apps/backend-php/composer.lock` | Modificado | Entrada phpmailer removida manualmente (content-hash pendiente de regenerar). |
| `apps/backend-php/src/EmailDeliveryTransport.php` | Borrado | Sin email en MVP. |
| `apps/backend-php/src/StubEmailDeliveryTransport.php` | Borrado | Sin email en MVP. |
| `apps/backend-php/src/SmtpEmailDeliveryTransport.php` | Borrado | Sin email en MVP. |
| `apps/backend-php/src/EmailDeliveryTransportFactory.php` | Borrado | Sin email en MVP. |
| `apps/backend-php/tests/EntregaManualTest.php` | Creado | 200/409/404/400 con fake PDO en memoria. |
| `apps/backend-php/tests/AdminCertificateServiceTest.php` | Modificado | Asserts sobre `buildPublicValidationUrl`. |
| `apps/backend-php/tests/HttpContractTest.php` | Modificado | `/entrega-manual` 401/405/400; `/reenviar` → 404; config con token_encryption_key. |
| `apps/backend-php/tests/EmailDeliveryServiceTest.php` | Borrado | Sin email en MVP. |
| `apps/backend-php/tests/ResendFlowTest.php` | Borrado | Sin reenvío en MVP. |
| `docs/backend/00-php84-api.md` | Modificado | Endpoints, pendientes sin SMTP/PHPMailer. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Contrato entrega manual, reenvío removido, error 409. |
| `docs/database/01-modelo-datos-certificados.md` | Modificado | token_cifrado VARBINARY(512), migración 002. |
| `docs/deploy/00-cpanel-certificados.md` | Modificado | Entrega manual, token_encryption_key, sin SMTP. |
| `docs/deploy/01-staging-cpanel-certificados.md` | Modificado | Sin SMTP, token_encryption_key en config. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Modificado | Prompt 18 → entrega manual. |
| `muestra_pagina/MANIFIESTO_V0.md` | Modificado | CTAs manuales, sin reenvío/email. |
| `muestra_pagina/prompts_stitch_v0_ifts14.md` | Modificado (pase correctivo + pase correctivo final) | Sección 18 "Entrega manual" reemplaza "Enviar/reenviar"; dashboard, pendientes, curso-editor, asistencias, listado, auditoría sin email/SMTP/reenvío. Pase final: además líneas ~46, ~1266/1381 (Emitir certificado), ~1479/1531–1542 (detalle cert: sin Enviar por email/Reenviar, historial sin reenviada), ~2906/2981 (Entrega manual realizada), ~3112/3162 (Configuración institucional: Contacto metadata sin envío). 0 drift activo verificado por grep. |
| `docs/frontend/00-angular20-port-v0.md` | Modificado (pase correctivo) | Pantalla 18 → entrega manual; notas QR sin reenvío. |
| `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | Modificado (pase correctivo) | Pantalla 18 → entrega manual. |

## Comandos de verificación y resultados

### Pase correctivo (2026-07-01)

| Comando | Resultado |
|---|---|
| `php -l` (Docker `ifts14-php84`, PHP 8.4.22, sin vendor) | ✅ Sin errores de sintaxis en todos los `.php` de `apps/backend-php`. |
| `php -m` (Docker) | ✅ openssl, pdo_mysql, mbstring, curl, zip, xml, SimpleXML presentes. |
| `php tests/EntregaManualTest.php` | ✅ OK EntregaManualTest + OK TokenCipher fail-closed + round-trip (15 escenarios: 9 servicio + 6 cifrado). |
| `php tests/AdminCertificateServiceTest.php` | ✅ OK AdminCertificateServiceTest |
| `php tests/HttpContractTest.php` | ✅ OK HttpContractTest (notices preexistentes de GET sin Content-Type). |
| `php tests/AuthGateTest.php` | ✅ OK AuthGateTest |
| `php tests/NormalizePathTest.php` | ✅ OK NormalizePathTest |
| `php tests/PdfResilienceTest.php` | ✅ OK PdfResilienceTest |
| `composer validate` (imagen `composer:latest`) | ✅ Válido para uso simple. Errores de publish esperados (falta `name`/`description`, app interna no publicable). |
| `DESCRIBE cert_tokens_verificacion` | ⛔ NO ejecutado — MariaDB activo pero sin credenciales accesibles (sin sudo). Gate humano de DB antes de deploy. |
| HTTP 200/409 DB-backed smoke | ⛔ NO ejecutado — requiere MariaDB real. Service-level 200/409 cubierto por fake PDO. Ver item abierto 2. |

## Desviaciones del diseño

Ninguna — la implementación coincide con `design.md`. Las decisiones de arquitectura (remover `/reenviar` → 404, AES-256-GCM envelope v1, `entregaManual()` en el servicio existente, migración 002 additive, quitar PHPMailer) se respetaron.

## Riesgos / items abiertos

1. **Migración 002 no aplicada (tarea 1.2) — GATE HUMANO DE DB**: requiere MariaDB accesible con credenciales válidas. En esta sesión, `mariadb` está activo (`systemctl is-active mariadb` → active, socket `/run/mysqld/mysqld.sock` presente) pero no hay credenciales accesibles sin sudo (`root` requiere socket-auth, sudo denegado, usuarios `ifts14`/`admin` rechazados). **No se simuló ni falsó evidencia.** Antes de deploy, Marcos/Matías deben:
   - aplicar `database/migrations/002_token_cifrado_entrega_manual.sql` contra DB ficticia local, y
   - verificar con: `DESCRIBE cert_tokens_verificacion;` — debe mostrar la columna `token_cifrado` de tipo `varbinary(512)` con `NULL` permitido, ubicada después de `token_prefijo`.
   - verificar rollback: `SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'token_cifrado';` debe devolver vacío tras `DROP COLUMN`.
   Este gate es **bloqueante para deploy**; la tarea 1.2 permanece `- [ ]` en `tasks.md`.

2. **HTTP 200/409 DB-backed — GATE DE VERIFICACIÓN DE INTEGRACIÓN**: la cobertura service-level 200/409 de `entregaManual()` está probada sobre fake PDO en memoria (`EntregaManualTest.php`: escenarios 1–5 cubren 200 exitoso y 409 por token ausente / envelope inválido / clave incorrecta / clave ausente). `HttpContractTest.php` cubre 401/405/400/404 del contrato HTTP pre-DB, pero **no existe evidencia HTTP 200/409 con MariaDB real** (la ruta `GET /admin/certificados/{id}/entrega-manual` no se ejecutó contra una DB viva). **No se falsó evidencia.** La verificación DB-backed HTTP completa queda como item abierto diferido a `sdd-verify` / entorno con DB real. Es el mismo patrón que el 200/404 de `/pdf` preexistente (pre-DB, diferido a integración real). Ver `tasks.md` tarea 3.3: los casos 200/409 de `/entrega-manual` requieren MariaDB real.

3. **`composer.lock` content-hash**: editado manualmente sin Composer. Ejecutar `composer update --lock` antes de deploy para regenerar el hash real y limpiar `vendor/phpmailer/`. `composer validate` (imagen `composer:latest`) confirma que `composer.json` es válido para uso simple (errores de publish por falta de `name`/`description` son esperados para una app interna no publicable).

4. **Certificados previos sin `token_cifrado`**: responden `409 TOKEN_NOT_RECOVERABLE` en entrega manual. No se regeneran salvo decisión auditada explícita. Comportamiento documentado y testeado.

5. **`fault-injection-audit.php`**: requiere `CERTIFICADOS_CONFIG_PATH` explícito; no se modificó (no referenciaba email/reenvío).

## Próximo recomendado

`sdd-verify` — ejecutar verificación formal del cambio antes de `sdd-archive`.

## Skill resolution

- `sdd-apply`: seguido (Standard Mode, no Strict TDD).
- `work-unit-commits`: single PR (size:exception aprobado).
- `karpathy-guidelines`: cambios quirúrgicos, supuestos explícitos, mínimo cambio viable.
- `ponytail`: stdlib (`openssl_encrypt`) sobre dependencias; `// ponytail:` en safeAudit; borrado sobre adición.
- `php-best-practices`: PDO prepared statements, strict types, fail closed, sin texto plano.
- `systematic-debugging`: no se encontraron bugs; tests verificados.