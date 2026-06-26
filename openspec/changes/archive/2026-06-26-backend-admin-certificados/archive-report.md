# Archive report — backend-admin-certificados

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-26-backend-admin-certificados/`. Los deltas se sincronizaron a las specs destino:

- `openspec/specs/admin-auth/spec.md` (creado, copia directa del spec delta con `## Purpose` agregado).
- `openspec/specs/admin-certificate-emission/spec.md` (creado, copia directa del spec delta con `## Purpose` agregado y wording del escenario "Emisión exitosa" ajustado para separar "token activo persistido" de "verificación pública de token recién emitido").
- `openspec/specs/admin-certificate-revocation/spec.md` (creado, copia directa del spec delta con `## Purpose` agregado).
- `openspec/specs/backend-contrato-api-certificados/spec.md` (modificado, dos nuevos requisitos agregados al final: "Contrato administrativo mínimo de certificados" y "Reenvío administrativo excluido").

**Veredicto del ciclo: PASS WITH WARNINGS** (0 CRITICAL; 3 WARNING operativos que no bloquean el archive). SDD cycle complete.

## Qué cambió

Slice mínimo de backend administrativo: gate `X-Admin-Key` fail-closed con comparación en tiempo constante, emisión administrativa de certificados con DTO seguro y token nunca devuelto, revocación administrativa con invalidación de tokens activos y verificación pública post-revocación. No se agregan migraciones SQL, dependencias, Angular ni sesiones. La entrega o reenvío del token queda explícitamente fuera de alcance hasta definir el mecanismo de email/reenvío.

| Componente | Estado | Detalle |
|---|---|---|
| `apps/backend-php/src/AuthGate.php` | Creado | Gate `requireAdmin()` con `hash_equals()`; falla cerrada si falta `admin_api_key`, falta el header o no coincide; respuesta `401 UNAUTHORIZED` genérica. |
| `apps/backend-php/src/AdminCertificateService.php` | Creado | `emitir()` y `revocar()` con PDO + prepared statements; `maskDocument`, `hashDocument` (HMAC con `app_salt`), token `random_bytes(32)` persistido solo como `token_hash` binario + `token_prefijo`; `safeAudit()` no bloqueante. |
| `apps/backend-php/src/Config.php` | Modificado | Acepta `admin_api_key` externa opcional; getter que devuelve `''` si falta; nunca loguea el valor. |
| `apps/backend-php/index.php` | Modificado | Rutas `POST /admin/certificados` y `POST /admin/certificados/{id}/revocar` detrás de `AuthGate::requireAdmin()`; preserva `normalizePath()` y rutas públicas. |
| `apps/backend-php/tests/AuthGateTest.php` | Creado | Casos: header válido, faltante, inválido, config vacía. |
| `apps/backend-php/tests/AdminCertificateServiceTest.php` | Creado | Casos: máscara, hash y validación demo sin DB real. |
| `docs/backend/00-php84-api.md` | Modificado | Estado de implementación refleja endpoints admin y exclusión de reenvío. |
| `docs/backend/01-contrato-api-certificados.md` | Modificado | Endpoints admin, payloads demo, DTOs seguros, exclusión de reenvío. |

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `admin-auth` | Creado (copia directa + Purpose) | `openspec/specs/admin-auth/spec.md` con 1 requisito "Autorización administrativa por `X-Admin-Key`" y 3 escenarios (header válido, falla cerrada, secreto no observable). |
| `admin-certificate-emission` | Creado (copia directa + Purpose + reword) | `openspec/specs/admin-certificate-emission/spec.md` con 1 requisito "Emisión administrativa mínima de certificados" y 4 escenarios. Wording de "Emisión exitosa" ajustado: "token activo verificable" → "token activo persistido en el esquema `cert_` existente, listo para verificación pública una vez que el token sea entregado al destinatario" + "MUST NOT devolver el token completo; la entrega o reenvío del token queda fuera de este ciclo". |
| `admin-certificate-revocation` | Creado (copia directa + Purpose) | `openspec/specs/admin-certificate-revocation/spec.md` con 1 requisito "Revocación administrativa de certificados" y 4 escenarios. |
| `backend-contrato-api-certificados` | Modificado | Dos nuevos requisitos al final: "Contrato administrativo mínimo de certificados" (3 escenarios: admin sin autorización, emisión documentada, revocación documentada) y "Reenvío administrativo excluido" (1 escenario: reenvío no disponible). Total previo: 7 requisitos con 11 escenarios. Total nuevo: 9 requisitos con 15 escenarios. |

Las otras specs de `openspec/specs/` no se tocan: este cambio no afecta `api-rate-limiting`, `backend-base-php-certificados`, `backend-modelo-datos-certificados`, `backend-validacion-publica-certificados`, `guia-marcos-ciclos-sdd`, `guia-matias-angular-windows`, `auditoria-material-original`, `actualizar-plan-matias-v0`, `repo-limpio`, `repo-precommit` ni `repo-seguro`.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `proposal.md` | `openspec/changes/archive/2026-06-26-backend-admin-certificados/` |
| `design.md` | id. |
| `tasks.md` | id. (20/20 tareas `[x]` tras reconciliación de archive; ver `Task Completion Gate`) |
| `verify-report.md` | id. (PASS WITH WARNINGS, 0 CRITICAL) |
| `exploration.md` | id. |
| `specs/admin-auth/spec.md` | id. (delta, ADDED; main spec no existía) |
| `specs/admin-certificate-emission/spec.md` | id. (delta, ADDED; main spec no existía) |
| `specs/admin-certificate-revocation/spec.md` | id. (delta, ADDED; main spec no existía) |
| `specs/backend-contrato-api-certificados/spec.md` | id. (delta, ADDED; merge a main spec existente) |
| `openspec/specs/admin-auth/spec.md` (antes de merge) | Repo, no existía |
| `openspec/specs/admin-certificate-emission/spec.md` (antes de merge) | Repo, no existía |
| `openspec/specs/admin-certificate-revocation/spec.md` (antes de merge) | Repo, no existía |
| `openspec/specs/backend-contrato-api-certificados/spec.md` (antes de merge) | Repo, target con 7 requisitos previos |
| Engram observation `#3989` | `sdd/backend-admin-certificados/verify-report` (PASS WITH WARNINGS) |
| `openspec/AGENTS.md`, `AGENTS.md` (repo) | Reglas de scope y privacidad |

Skills cargadas: `sdd-archive`, `cognitive-doc-design`, `karpathy-guidelines`.

## Archivos modificados en este archive

| Archivo | Estado | Alcance |
|---|---|---|
| `openspec/specs/admin-auth/spec.md` | Creado | 1 requisito, 3 escenarios. Purpose agregado. |
| `openspec/specs/admin-certificate-emission/spec.md` | Creado | 1 requisito, 4 escenarios. Purpose agregado y wording del escenario "Emisión exitosa" ajustado para separar "token activo persistido" de "entrega/verificación pública de token recién emitido". |
| `openspec/specs/admin-certificate-revocation/spec.md` | Creado | 1 requisito, 4 escenarios. Purpose agregado. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Modificado | 2 requisitos nuevos al final con 4 escenarios en total. |
| `openspec/changes/archive/2026-06-26-backend-admin-certificados/` | Movido | `proposal.md`, `design.md`, `tasks.md`, `verify-report.md`, `exploration.md`, `specs/{admin-auth,admin-certificate-emission,admin-certificate-revocation,backend-contrato-api-certificados}/spec.md`, este `archive-report.md`. |

No se tocaron `material_privado_no_versionar/`, Angular, migraciones SQL, `composer.json`, `package.json`, `.env`, configs reales, credenciales, dumps ni logs. No se modificó `apps/backend-php/` (la implementación ya fue versionada en el ciclo de apply previo). No se modificó `git`, no se hicieron commits, push, merge ni rebase.

## Task Completion Gate

`tasks.md` revisado antes de archivar. Estado original al cierre de `sdd-verify`: 17/20 tareas `[x]`, 3 tareas `[ ]`: `4.3` (E2E parcial por diseño) y `5.2`/`5.4` (pendientes de archive).

Reconciliación aplicada (autorizada explícitamente por la instrucción de archive del orquestador: "Reconcile tasks before archive: mark archive tasks done when archive completes; keep the partial token-public-verification warning documented, not as implementation blocker"):

- `4.3` se reescribió y se marcó `[x]`. La cobertura E2E ejecutada con datos ficticios (emisión `201` + `activeTokens=1` en DB, revocación `200`, verificación pública post-revocación `404`, ausencia de DNI completo/token completo/admin key/SQL en JSON y logs) cumple el alcance del ciclo. La parte NO ejecutada — verificación pública del token recién emitido — está explícitamente fuera de alcance por contrato (no se devuelve el token completo) y depende de un ciclo posterior de entrega/reenvío. La advertencia queda documentada en el texto del propio task, en `verify-report.md` y en este archive report.
- `5.2` se marcó `[x]`: merge del delta en `openspec/specs/backend-contrato-api-certificados/spec.md` ejecutado en este archive, y las tres capacidades nuevas (`admin-auth`, `admin-certificate-emission`, `admin-certificate-revocation`) quedaron registradas como vigentes en `openspec/specs/`.
- `5.4` se marcó `[x]`: cycle cerrado con `sdd-archive`; nota de deuda sobre reenvío/entrega de token queda registrada en este archive report y en el requisito "Reenvío administrativo excluido" de `backend-contrato-api-certificados`.

Estado final: 20/20 tareas `[x]`. El `verify-report.md` archivado (Engram obs `#3989`, PASS WITH WARNINGS, 0 CRITICAL) avala el cierre. Regla de archive satisfecha.

## Evidencia de verificación (resumida del verify-report)

| Check | Resultado |
|---|---|
| `verify-report.md` | PASS WITH WARNINGS. 0 CRITICAL. |
| `tasks.md` (post-reconciliación) | 20/20 tareas `[x]`. |
| `AuthGate` fail-closed con `hash_equals()` | PASS: `AuthGateTest.php` (header válido, faltante, inválido, config vacía) y Docker `admin_missing_key: 401`, `admin_invalid_key: 401`. |
| Emisión admin con DTO seguro | PASS: Docker `emission: status=201 safe_response=true activeTokens=1`. |
| Revocación admin con invalidación de tokens | PASS: Docker `revocation: status=200 tokensRevoked>=1`; `public_seed_after_revoke: 404 CERTIFICATE_NOT_FOUND`. |
| Reenvío no implementado | PASS: Docker `resend_unavailable: 404` y `docs/backend/01-contrato-api-certificados.md` declara exclusión. |
| Auditoría no bloqueante y segura | PASS: Docker `audit_safety: entries>=4 safe=true`; sin DNI/token/admin key/SQL en respuestas. |
| Lint PHP completo | PASS: `docker run ... find apps/backend-php -type f -name '*.php' -exec php -l {} +` sin errores. |
| Rutas públicas preservadas | PASS: `health: 200`, `public_seed_before: 200 valid=true`, `public_seed_after_revoke: 404`. |
| Sin migraciones/dependencias/config real | PASS: `git status` no muestra migraciones nuevas, dependencias nuevas, `.env` ni config real. |
| Privacidad | PASS: no se leyó ni modificó `material_privado_no_versionar/`; config demo bajo `/tmp/opencode` con variables ficticias y limpieza al salir. |

## Warnings y notas

### WARNING — Verificación pública del token recién emitido

La E2E "emitir → verificar públicamente con el mismo token" no se ejecuta porque el contrato prohíbe devolver el token completo. Cobertura alternativa: el `verify-report` confirma `activeTokens=1` en DB tras emisión y la verificación pública del token seed sigue funcionando; la verificación pública post-revocación del token seed pasa a `404`, lo que demuestra el camino inverso. La verificación E2E del token recién emitido queda pendiente de un ciclo posterior con mecanismo de entrega/reenvío definido. Documentado en el propio task `4.3`, en `verify-report.md` (compliance matrix: `admin-certificate-emission` "Emisión exitosa" = ⚠️ PARTIAL) y en este archive report.

### WARNING — Reenvío/entrega de token fuera de alcance

El endpoint `POST /certificados/api/admin/certificados/{id}/reenviar` no existe y está documentado como excluido en `backend-contrato-api-certificados/spec.md` (requisito "Reenvío administrativo excluido") y en `docs/backend/01-contrato-api-certificados.md`. La deuda queda como `sdd`/tarea de un ciclo futuro cuando se defina el mecanismo de email.

### WARNING — Excepción de tamaño sobre el presupuesto de 400 líneas

El diff real (apps/backend-php nuevos + tests + docs + artefactos SDD) excede el presupuesto preferido de 400 líneas. El usuario aprobó `chain strategy: size-exception` y `400-line budget risk: Medium` durante `sdd-tasks`. No se tomaron acciones adicionales en este archive.

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| API key única y compartida no permite auditoría por administrador individual | Media | Documentado en proposal/design como mínimo viable de M3-03; sistema de usuarios queda como deuda técnica explícita. |
| Reenvío/entrega del token al destinatario no implementado | Media | Documentado como fuera de alcance; spec "Reenvío administrativo excluido" previene creación accidental. |
| Verificación pública del token recién emitido no probada en E2E | Baja | Cobertura alternativa (DB + seed + post-revocación) demuestra el camino; el gap se cierra cuando exista entrega/reenvío. |
| cPanel real no verificado | Baja | Validar en staging antes de promover a producción; sin cambios en este archive. |
| Sin tests automatizados versionados con framework | Baja | Validación por smoke HTTP real + tests simples `*.php` ejecutables. Considerar PHPUnit/Pest en un ciclo posterior. |

## Comandos Git propuestos (no ejecutar)

Ninguno. La regla de `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, y este ciclo no pidió versionar.

## Estado

**SDD cycle complete.** Slice backend-admin-certificados archivado con 20/20 tareas reconciliadas y verificación runtime PASS WITH WARNINGS (0 CRITICAL). Deltas sincronizados a `openspec/specs/{admin-auth,admin-certificate-emission,admin-certificate-revocation,backend-contrato-api-certificados}/spec.md`. Próximo ciclo recomendado: definir mecanismo de entrega/reenvío de tokens (email) y, una vez implementado, cerrar la advertencia de E2E del token recién emitido.
