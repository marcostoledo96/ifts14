# Archive report — backend-entrega-manual-certificados

## Resultado

Cambio archivado en `openspec/changes/archive/2026-07-02-backend-entrega-manual-certificados/`. Deltas sincronizados a las specs destino. SDD cycle complete con **intentional-with-warnings** (autorización explícita del orquestador: "Archive SDD change after verify PASS WITH WARNINGS").

**Veredicto del ciclo: PASS WITH WARNINGS** (0 CRITICAL; 5 WARNING operativos que NO bloquean el archive pero requieren gate humano de DB y de Composer antes de deploy real).

## Qué cambió

Reemplazo del flujo de reenvío automático por email por entrega manual de Bedelía. Sin SMTP/PHPMailer/transporte `stub|smtp` activos en el MVP. `/reenviar` quedó como ruta inexistente (404). Nueva ruta `GET /admin/certificados/{id}/entrega-manual` admin-only, solo lectura, sin rotación ni mutación de estado. Se introdujo `token_cifrado` con AES-256-GCM (envelope `v1.<iv_b64url>.<tag_b64url>.<ciphertext_b64url>`, clave externa 32 bytes) para reconstruir `publicValidationUrl` sin texto plano. La emisión persiste `token_cifrado` y devuelve `publicValidationUrl` + `tokenPrefix` además de `pdfDownloadUrl`. Certificados previos sin `token_cifrado` responden `409 TOKEN_NOT_RECOVERABLE` (no se regeneran). Migración `002` additive (`token_cifrado VARBINARY(512) NULL AFTER token_prefijo`).

| Componente | Estado | Detalle |
|---|---|---|
| `database/migrations/002_token_cifrado_entrega_manual.sql` | Creado | `ALTER TABLE cert_tokens_verificacion ADD token_cifrado VARBINARY(512) NULL AFTER token_prefijo` + rollback `DROP COLUMN`. |
| `apps/backend-php/src/TokenCipher.php` | Creado | AES-256-GCM, envelope textual `v1.<iv>.<tag>.<ciphertext>`, base64url, fail-closed (key 32B, IV 12B, tag 16B, formato 4 partes, versión v1). |
| `apps/backend-php/src/Config.php` | Modificado | `requireTokenCipherKey()` agregado; `requireDeliveryConfig()` y normalización SMTP eliminados. |
| `apps/backend-php/src/AdminCertificateService.php` | Modificado | `emitir()` persiste `token_cifrado` y devuelve `publicValidationUrl`. Nuevos: `entregaManual()`, `encryptToken()`, `recoverToken()`, `buildPublicValidationUrl()`. Eliminados: `reenviar()`, `maskEmail()`, referencias a `EmailDeliveryTransport*`. |
| `apps/backend-php/index.php` | Modificado | `require_once` email removidos. Bloque `/reenviar` eliminado (404 por default). Nueva ruta `GET /admin/certificados/{id}/entrega-manual` con `requireAdmin()` + `requirePdfConfig()` + `loadTokenCipherKey()`. |
| `apps/backend-php/src/EmailDeliveryTransport.php`, `StubEmailDeliveryTransport.php`, `SmtpEmailDeliveryTransport.php`, `EmailDeliveryTransportFactory.php` | Borrados | Sin email en MVP. |
| `apps/backend-php/composer.json` / `composer.lock` | Modificados | `phpmailer/phpmailer` removido. `tecnickcom/tcpdf` y `php: >=8.4` mantenidos. |
| `apps/backend-php/config/certificados-config.example.php` | Modificado | SMTP removido; `token_encryption_key` y `admin_api_key` ficticios agregados. |
| `apps/backend-php/tests/EntregaManualTest.php` | Creado | 200/409/404/400 con fake PDO. Cubre IV/tag malformados, clave inválida, envelope inválido, descifrado fallido. |
| `apps/backend-php/tests/EmailDeliveryServiceTest.php`, `ResendFlowTest.php` | Borrados | Sin email/reenvío en MVP. |
| `apps/backend-php/tests/HttpContractTest.php` | Modificado | `/entrega-manual` 401/405/400 pre-DB; `/reenviar` → 404 (POST y GET); config con `token_encryption_key`. |
| `apps/backend-php/tests/AdminCertificateServiceTest.php` | Modificado | Asserts sobre `buildPublicValidationUrl` (con y sin base URL). |
| `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md` | Modificados | Endpoints actualizados, DTO 201/200, error 409, reenvío removido. |
| `docs/database/01-modelo-datos-certificados.md` | Modificado | `token_cifrado` VARBINARY(512), migración 002, `reenvio` obsoleto. |
| `docs/deploy/00-cpanel-certificados.md`, `docs/deploy/01-staging-cpanel-certificados.md` | Modificados | `token_encryption_key` externa, sin SMTP/PHPMailer. |
| `docs/frontend/00-angular20-port-v0.md`, `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | Modificados | Pantalla 18 → entrega manual; notas QR sin reenvío. |
| `MATIAS_PROMPTS_SDD_FASE2.md` | Modificado | Prompt 18 → entrega manual (copiar link / descargar PDF); sin reenvío/email. |
| `muestra_pagina/MANIFIESTO_V0.md` | Modificado | CTAs manuales, sin SMTP/PHPMailer/reenvío. |
| `muestra_pagina/prompts_stitch_v0_ifts14.md` | Modificado (pase correctivo + final) | Sección 18 "Entrega manual" reemplaza "Enviar/reenviar". Dashboard, pendientes, curso-editor, asistencias, listado, auditoría sin email/SMTP/reenvío. Configuración institucional: Contacto metadata sin envío. 0 drift activo verificado por grep. |

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-certificate-delivery` | Modificado (3 requirements) + Eliminado (3 requirements con Reason/Migration) | `### Requirement: Reenvío administrativo por email` reescrito para reflejar `GET /entrega-manual` admin-only read-only con `publicValidationUrl` + `pdfDownloadUrl` + `tokenPrefix`; escenarios "Reenvío exitoso" → "Entrega manual exitosa", "Token conservado tras reenvío" → "Token conservado tras entrega manual", "Reenvío sin autorización" → "Entrega manual sin autorización"; nuevo escenario "Certificado sin token recuperable" (409). `### Requirement: Privacidad del token en el canal de entrega` reescrito: el token completo solo vive en `publicValidationUrl`, no en email. `### Requirement: Rollback documentado` reescrito: ahora remueve `/entrega-manual`. Eliminados con Reason/Migration: `### Requirement: Adaptador de transporte configurable`, `### Requirement: Contenido del email limitado a enlace`, `### Requirement: Bloqueo de envío real sin configuración confirmada`. |
| `admin-certificate-emission` | Modificado (2 requirements) | `### Requirement: Emisión administrativa mínima de certificados` reescrito: emisión exige `token_cifrado` AES-256-GCM envelope v1, respuesta 201 con `publicValidationUrl`+`pdfDownloadUrl`+`tokenPrefix`, sin email. Nuevos escenarios: "Emisión exitosa con datos de entrega manual", "Emisión sin clave de cifrado" (fail-closed), "Envelope de token inválido" (fail-closed). `### Requirement: DTO de emisión ampliado con \`pdfDownloadUrl\`` reemplazado por `### Requirement: DTO de emisión ampliado con \`publicValidationUrl\`, \`pdfDownloadUrl\` y \`tokenPrefix\`` con escenarios "Respuesta operativa segura" y "Respuesta sin token completo independiente". `### Requirement: Rechazo de JSON malformado en emisión` preservado sin cambios. |
| `backend-contrato-api-certificados` | Modificado (2 requirements) | `### Requirement: Validación y seguridad del token QR` reescrito: `token_cifrado` AES-256-GCM con formato/IV/tag/clave exactos; descifrado fail-closed; nuevo escenario "Descifrado falla cerrado". `### Requirement: Contrato administrativo mínimo de certificados` reescrito: lista de endpoints actualizada (sustituye `/reenviar` por `/entrega-manual`), "Emisión documentada con PDF" → "Emisión documentada con entrega manual", nuevo escenario "Entrega manual documentada", "Reenvío documentado"/"Reenvío sin transporte" eliminados y reemplazados por "Reenvío removido". |
| `backend-modelo-datos-certificados` | Modificado (2 requirements) | `### Requirement: Token QR sin texto plano y recuperable para reenvío` reescrito: persistir `token_hash`+`token_prefijo`+`token_cifrado`; clave externa obligatoria. Escenarios "Token verificable por hash"/"Token recuperable para reenvío permanente" reemplazados por "Token verificable y recuperable"/"Clave externa obligatoria". `### Requirement: Persistencia de entrega con reutilización de tablas \`cert_\`` reescrito: entrega manual es de solo lectura (no inserta evento `reenvio`, no crea `cert_entregas`); nuevos escenarios "Sin auditoría operativa en este endpoint", "Certificados anteriores sin token cifrado" (no regenera), "Tabla \`cert_entregas\` diferida". |
| `certificate-pdf-qr-generation` | Modificado (1 requirement) | `### Requisito: Generación sincrónica de PDF con QR durante la emisión` reescrito: el QR apunta al link permanente; sistema persiste artefacto recuperable para entrega manual y regeneración con el mismo QR. Nuevos escenarios: "Regeneración conserva link", "Token no recuperable" (rechazo seguro). |
| `actualizar-plan-matias-v0` | Anexo (1 requirement) | `### Requirement: Copys de entrega manual para Matías/v0` agregado al final. Escenarios: "Botones principales del flujo administrativo" (CTAs "Copiar link"/"Descargar PDF"/"Entrega manual"), "Texto de ayuda del MVP" (Bedelía externa, no-email), "Coherencia con token permanente" (sin rotación por reenvío normal). |

Las otras specs de `openspec/specs/` no se tocan: este cambio no afecta `api-rate-limiting`, `auditoria-material-original`, `backend-base-php-certificados`, `backend-validacion-publica-certificados`, `certificados-qa-smoke-cpanel` (no existe), `deploy-cpanel-certificados`, `frontend-angular-shell`, `frontend-api-readiness`, `frontend-public-validation`, `guia-marcos-ciclos-sdd`, `guia-matias-angular-windows`, `opencode-eficiencia-token`, `repo-limpio`, `repo-precommit`, `repo-seguro`, `admin-auth`, `admin-certificate-revocation` ni las demás capabilities no listadas en el delta.

## Drift documental intencional (no modificado, fuera de scope del delta)

El delta de este cambio no incluye secciones de "Purpose" — OpenSpec convention sólo mergea `ADDED/MODIFIED/REMOVED/RENAMED Requirements`. Por lo tanto, los siguientes "Purpose" y requisitos adyacentes quedaron con wording de la dirección anterior (email resend), son **drift intencional** y se documentan aquí como warnings de mantenimiento futuro:

| Archivo | Drift | Severidad |
|---|---|---|
| `openspec/specs/admin-certificate-delivery/spec.md` `## Purpose` | Dice "entrega y reenvío administrativo de certificados por email mediante un enlace público" y menciona "transporte de email queda como adaptador configurable con modo `stub` o `smtp`". La nueva dirección es entrega manual sin email. | Media — requiere ciclo futuro de limpieza de Purpose. |
| `openspec/specs/admin-certificate-emission/spec.md` `## Purpose` | Dice "separa explícitamente el acto de 'token activo persistido + PDF emitido' de la 'verificación pública del token recién emitido' (dependiente del mecanismo de entrega/reenvío, fuera de alcance)". | Baja — la verificación pública sigue siendo camino, ya no depende de reenvío. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` `## Purpose` y `### Requirement: Conceptos de datos existentes sin migración nueva` | `## Purpose` menciona "reenvío por email"; `Conceptos de datos` escenario dice "MUST NOT existir migración SQL nueva por este cambio", pero `002` ES nueva. | Media — contradice la nueva dirección. |
| `openspec/specs/certificate-pdf-qr-generation/spec.md` `## Propósito` | Dice "para soportar el reenvío y la regeneración del PDF con el mismo QR". El reenvío ya no aplica. | Baja — la regeneración sí aplica. |
| `openspec/specs/backend-modelo-datos-certificados/spec.md` `### Requirement: Auditoría sin datos sensibles` | Menciona "reenvío" en el cuerpo y en el escenario "Reenvío auditable" (tipo `reenvio`). | Media — la entrega manual no audita (read-only). |

Estos drifts no rompen el contrato (los requisitos modificados son la fuente de verdad vigente), pero se registran para una posible limpieza en un ciclo futuro.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `proposal.md` | `openspec/changes/archive/2026-07-02-backend-entrega-manual-certificados/` |
| `design.md` | id. |
| `tasks.md` | id. (24 tareas; 22 `[x]`, 2 `[ ]` por gates de entorno; ver `Task Completion Gate`) |
| `apply-progress.md` | id. (declaró gates abiertos 1.2, 3.3b, 4.7 y desvíos = ninguno) |
| `verify-report.md` | id. (PASS WITH WARNINGS, 0 CRITICAL) |
| `exploration.md` | id. |
| `specs/admin-certificate-delivery/spec.md` (delta) | id. |
| `specs/admin-certificate-emission/spec.md` (delta) | id. |
| `specs/backend-contrato-api-certificados/spec.md` (delta) | id. |
| `specs/backend-modelo-datos-certificados/spec.md` (delta) | id. |
| `specs/certificate-pdf-qr-generation/spec.md` (delta) | id. |
| `specs/actualizar-plan-matias-v0/spec.md` (delta) | id. |
| `openspec/specs/{admin-certificate-delivery,admin-certificate-emission,backend-contrato-api-certificados,backend-modelo-datos-certificados,certificate-pdf-qr-generation,actualizar-plan-matias-v0}/spec.md` (antes de merge) | Repo, targets con requisitos previos |
| `openspec/config.yaml`, `openspec/AGENTS.md` | Repo, reglas SDD y convenciones de archive |
| `AGENTS.md` (repo), `docs/00-indice-general.md`, `docs/07-sdd-archive-y-mantenimiento-documentacion.md`, `docs/AGENTS.md` | Repo, reglas de scope, privacidad, y matriz de mantenimiento documental |
| `verify-report.md` previo del ciclo `2026-06-26-backend-admin-certificados` | `openspec/changes/archive/2026-06-26-backend-admin-certificados/archive-report.md` (referencia de patrón) |

Skills cargadas: `sdd-archive` (phase-common, status-contract, openspec-convention, engram-convention, persistence-contract), `cognitive-doc-design`, `karpathy-guidelines`, `ponytail`.

## Archivos modificados en este archive

| Archivo | Estado | Alcance |
|---|---|---|
| `openspec/specs/admin-certificate-delivery/spec.md` | Modificado | 3 requirements reemplazados + 3 requirements eliminados (con Reason/Migration). |
| `openspec/specs/admin-certificate-emission/spec.md` | Modificado | 2 requirements reemplazados. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Modificado | 2 requirements reemplazados. |
| `openspec/specs/backend-modelo-datos-certificados/spec.md` | Modificado | 2 requirements reemplazados. |
| `openspec/specs/certificate-pdf-qr-generation/spec.md` | Modificado | 1 requirement reemplazado (4 escenarios). |
| `openspec/specs/actualizar-plan-matias-v0/spec.md` | Anexo | 1 requirement nuevo agregado. |
| `openspec/changes/archive/2026-07-02-backend-entrega-manual-certificados/` | Movido desde `openspec/changes/backend-entrega-manual-certificados/` | `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `exploration.md`, `specs/{admin-certificate-delivery,admin-certificate-emission,backend-contrato-api-certificados,backend-modelo-datos-certificados,certificate-pdf-qr-generation,actualizar-plan-matias-v0}/spec.md`, este `archive-report.md`. |
| `openspec/changes/backend-entrega-manual-certificados/` | Eliminado (movido) | Carpeta activa removida; el cambio ahora vive solo en `archive/`. |

No se tocaron `material_privado_no_versionar/`, Angular, `public_html/`, `vendor/` (vendor no versionado), `.env`, configs reales, credenciales demo de `muestra_pagina/login-form.tsx`, dumps SQL ni logs. No se modificó `git`, no se hicieron commits, push, merge, rebase ni stage. `docs/00-indice-general.md` no requirió cambios: la matriz ya cubre todas las áreas tocadas (backend, database, deploy, frontend, prompts Matías, referencia v0) y los archivos modificados ya están listados en sus secciones vigentes.

## Task Completion Gate

`sdd-archive` debe validar el `tasks.md` antes de cerrar el ciclo. Estado original al cierre de `sdd-verify`: 22/24 tareas `[x]`, 2 tareas abiertas (`1.2` y `3.3b`) más `4.7` (archive mismo) sin marcar.

Reconciliación aplicada (autorizada explícitamente por la instrucción de archive del orquestador: "Archive SDD change after verify PASS WITH WARNINGS" + lista de warnings a documentar):

- `1.2` permanece `[ ]`. El artefacto `database/migrations/002_token_cifrado_entrega_manual.sql` existe y es correcto (verificado estáticamente), pero su aplicación contra MariaDB requiere credenciales con sudo no disponibles en este entorno. No se falsificó evidencia. La validación con `DESCRIBE cert_tokens_verificacion` queda como gate humano de DB antes de deploy. Anotación agregada al task: "gate humano de DB, sin sudo/credenciales; queda como WARNING en archive-report; no se falsificó evidencia".
- `3.3b` permanece `[ ]`. La cobertura service-level 200/409 de `entregaManual()` está probada sobre fake PDO en memoria (`EntregaManualTest.php`: escenarios 1–5 cubren 200 exitoso y 409 por token ausente / envelope inválido / clave incorrecta / clave ausente). `HttpContractTest.php` cubre 401/405/400/404 del contrato HTTP pre-DB. **No existe evidencia HTTP 200/409 con MariaDB real** (la ruta `GET /admin/certificados/{id}/entrega-manual` no se ejecutó contra DB viva). No se falsificó evidencia. La verificación DB-backed HTTP completa queda como item abierto diferido a un ciclo con DB real. Anotación agregada al task: "gate de entorno sin DB real; queda como WARNING en archive-report; service-level cubierto; no se falsificó evidencia".
- `4.7` marcado `[x]`. El archive en sí mismo: deltas sincronizados a `openspec/specs/`, carpeta movida a `openspec/changes/archive/2026-07-02-backend-entrega-manual-certificados/`, este `archive-report.md` creado y persistido a Engram (`sdd/backend-entrega-manual-certificados/archive-report`). Anotación agregada al task: "archive en curso: deltas sincronizados, folder a punto de moverse, archive-report con warnings; autorizado por orquestador".

Estado final: 22/24 tareas `[x]`, 2 tareas `[ ]` operativas (`1.2` migracion DB application + `3.3b` HTTP DB-backed). El `verify-report.md` archivado (PASS WITH WARNINGS, 0 CRITICAL) avala el cierre con gates abiertos. La instrucción del orquestador ("Archive SDD change after verify PASS WITH WARNINGS") autoriza el archive con los gates registrados como WARNING explícitos en este reporte. Regla de archive satisfecha con `intentional-with-warnings`.

## Evidencia de verificación (resumida del verify-report)

| Check | Resultado |
|---|---|
| `verify-report.md` | PASS WITH WARNINGS. 0 CRITICAL. 5 WARNING. |
| `tasks.md` (post-reconciliación) | 22/24 tareas `[x]`; 2 `[ ]` (`1.2` migracion DB application + `3.3b` HTTP DB-backed). |
| Lint PHP completo | PASS: `docker run ... find apps/backend-php -type f -name '*.php' -exec php -l {} +` sin errores. |
| Modules check | PASS: PHP 8.4.22; `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml` presentes. |
| Procedural tests PHP | PASS: `EntregaManualTest`, `AdminCertificateServiceTest`, `HttpContractTest`, `AuthGateTest`, `NormalizePathTest`, `PdfResilienceTest` pasaron. |
| `TokenCipher` fail-closed | PASS: `EntregaManualTest.php` cubre IV/tag malformados, clave inválida, partes inválidas, versión inválida, round-trip. |
| `composer.json` válido | PASS con warning (lock desactualizado). |
| Emisión service-level | PASS: check ad hoc en contenedor — `emitir()` persistió `token_cifrado` envelope `v1`, generó PDF, devolvió `publicValidationUrl`+`pdfDownloadUrl`+`tokenPrefix` sin token completo como campo separado. |
| Búsqueda de email/reenvío activo en backend | PASS: solo comentario `ponytail` documenta eliminación; `/reenviar` solo en tests que validan 404. |
| Búsqueda de `X-Admin-Key` en Angular | PASS: 0 coincidencias en `apps/frontend-angular/src/**/*.ts` para `X-Admin-Key`, `admin_api_key`, `adminKey`, `localStorage`, `sessionStorage`. |
| Migración 002 aplicada (DB real) | ⛔ NO ejecutado — gate humano. |
| HTTP 200/409 DB-backed | ⛔ NO ejecutado — service-level cubierto; gate de entorno. |

## Warnings y notas

### WARNING — Migración 002 no aplicada (gate humano de DB)

`database/migrations/002_token_cifrado_entrega_manual.sql` existe y es correcta (verificación estática: `ALTER TABLE cert_tokens_verificacion ADD token_cifrado VARBINARY(512) NULL AFTER token_prefijo` + rollback `DROP COLUMN`). En esta sesión, `mariadb` está activo pero sin credenciales accesibles sin sudo (`root` requiere socket-auth, sudo denegado, usuarios `ifts14`/`admin` rechazados). No se falsificó evidencia. Antes de deploy, Marcos/Matías deben:

1. Aplicar `database/migrations/002_token_cifrado_entrega_manual.sql` contra DB de staging/producción.
2. Verificar con: `DESCRIBE cert_tokens_verificacion;` — debe mostrar la columna `token_cifrado` de tipo `varbinary(512)` con `NULL` permitido, ubicada después de `token_prefijo`.
3. Verificar rollback: `SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'token_cifrado';` debe devolver vacío tras `DROP COLUMN`.

Este gate es **bloqueante para deploy real**; la tarea `1.2` permanece `[ ]` en `tasks.md`.

### WARNING — HTTP 200/409 DB-backed sin evidencia (gate de integración)

La cobertura service-level 200/409 de `entregaManual()` está probada sobre fake PDO en memoria (`EntregaManualTest.php`: escenarios 1–5). `HttpContractTest.php` cubre 401/405/400/404 del contrato HTTP pre-DB. **No existe evidencia HTTP 200/409 con MariaDB real** (la ruta `GET /admin/certificados/{id}/entrega-manual` no se ejecutó contra DB viva). No se falsificó evidencia. La verificación DB-backed HTTP completa queda como item abierto diferido a un ciclo con DB real. Mismo patrón que el 200/404 de `/pdf` preexistente (pre-DB, diferido a integración real). Tarea `3.3b` permanece `[ ]`.

### WARNING — `composer.lock` content-hash desactualizado

`composer.json` y `composer.lock` ya no declaran PHPMailer, pero `composer validate` (Docker `composer:latest`) advierte que el lock no está actualizado contra el `composer.json`. El content-hash se editó manualmente sin Composer; ejecutar `composer update --lock` antes de deploy para regenerar el hash real y limpiar `vendor/phpmailer/`. `composer.json` válido para uso simple (errores de `publish` por falta de `name`/`description` son esperados para una app interna no publicable).

### WARNING — `vendor/` operativo stale (no versionado)

El lint equivalente mostró restos locales de `vendor/phpmailer/...`. `vendor/` no está versionado ni fue modificado por este ciclo, pero antes de deploy hay que regenerarlo/limpiarlo desde el lock actualizado para no subir artefactos PHPMailer obsoletos. Solo aplica a entornos con `vendor/` cacheado o pre-existente; el repo versionado nunca tuvo `vendor/` bajo control.

### WARNING — Docs históricos pueden mencionar SMTP/reenvío como referencia no vigente

Documentos de planificación/auditoría antiguos aún mencionan SMTP/reenvío como referencia histórica (no activa). Las **fuentes activas del ciclo** (`docs/backend/*`, `docs/database/*`, `docs/deploy/*`, `docs/frontend/*`, `MATIAS_PROMPTS_SDD_FASE2.md`, `muestra_pagina/MANIFIESTO_V0.md`, `muestra_pagina/prompts_stitch_v0_ifts14.md`) están actualizadas y verificadas por grep: 0 drift activo de `reenv|enviar por email|PDF reenviado|Emitir y enviar|SMTP|enviar email|enviar el PDF|enviar el aviso|estado de envío|fecha de último envío|remitente|asunto por defecto`. Si en algún momento los históricos generan confusión operativa, conviene marcarlos o consolidarlos en un ciclo dedicado.

### WARNING — Drift intencional en Purpose/specs adyacentes (no modificado en este ciclo)

Ver sección "Drift documental intencional" arriba. Cinco specs mantienen `## Purpose` o requisitos adyacentes con wording de la dirección anterior (email resend). No contradice los requisitos modificados (que son la fuente de verdad vigente) pero se registra para limpieza futura.

### WARNING — Excepción de tamaño sobre el presupuesto de 400 líneas (reiterado)

El diff real (apps/backend-php nuevos + tests + borrados + composer + docs + artefactos SDD) excede el presupuesto preferido de 400 líneas. El usuario aprobó `chain strategy: size-exception` y `400-line budget risk: Medium` durante `sdd-tasks`. El delivery fue `single-pr-default` con `size:exception` aprobado por Marcos. No se tomaron acciones adicionales en este archive.

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Migración 002 no aplicada contra DB real | Alta para deploy, Baja para evidencia de ciclo | Gate humano de DB antes de deploy; script de migración es reversible. |
| HTTP 200/409 DB-backed sin evidencia con MariaDB real | Media para deploy, Baja para evidencia de ciclo | Service-level + contratos HTTP pre-DB cubren el alcance. Diferir a ciclo con DB real. |
| `composer.lock` content-hash desactualizado | Media para deploy | `composer update --lock` antes de deploy. |
| `vendor/` con restos de PHPMailer | Baja para repo (no versionado), Media para deploy | Regenerar `vendor/` desde lock actualizado antes de deploy. |
| Pérdida de clave de cifrado externa | Media | Clave externa a Git; documentar generación, ubicación y backup operativo. |
| Certificados previos sin `token_cifrado` (limitación operativa documentada) | Baja | `409 TOKEN_NOT_RECOVERABLE` en entrega manual. No se regeneran salvo decisión auditada explícita. |
| Drift intencional en `## Purpose` de 5 specs | Baja | Requisitos modificados son la fuente de verdad; cleanup en ciclo futuro. |
| cPanel real no verificado | Baja | Validar en staging antes de promover a producción. |
| Sin tests automatizados versionados con framework | Baja | Validación por smoke HTTP real + tests procedurales `*.php`. Considerar PHPUnit/Pest en un ciclo posterior. |

## Comandos Git propuestos (no ejecutar)

Ninguno. La regla de `AGENTS.md` exige confirmación explícita antes de `git commit`, `push`, `merge`, `rebase` o `stage`, y este ciclo no pidió versionar. El estado actual del repo muestra 16 archivos modificados + 4 archivos borrados + 3 archivos nuevos sin stage (ver `git status --short`).

## Estado

**SDD cycle complete con intentional-with-warnings.** Cambio `backend-entrega-manual-certificados` archivado con 23/24 tareas reconciliadas, 0 CRITICAL, 5 WARNING documentados (DB application, HTTP DB-backed, composer.lock, vendor stale, docs históricos como referencia no vigente) y drift intencional en `## Purpose` de 5 specs registrado. Deltas sincronizados a `openspec/specs/{admin-certificate-delivery,admin-certificate-emission,backend-contrato-api-certificados,backend-modelo-datos-certificados,certificate-pdf-qr-generation,actualizar-plan-matias-v0}/spec.md`. Carpeta activa movida a `openspec/changes/archive/2026-07-02-backend-entrega-manual-certificados/`. Archive report persistido a Engram (topic_key `sdd/backend-entrega-manual-certificados/archive-report`).

**Próximo ciclo recomendado:** aplicar `database/migrations/002_token_cifrado_entrega_manual.sql` contra DB real, ejecutar `composer update --lock`, regenerar `vendor/`, y luego correr el smoke HTTP 200/409 DB-backed de `GET /entrega-manual` para cerrar `1.2` y `3.3b`. Considerar también un ciclo de limpieza de `## Purpose` drifts en las 5 specs afectadas.
