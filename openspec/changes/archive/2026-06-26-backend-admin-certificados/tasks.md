# Tasks: backend-admin-certificados

## Review Workload Forecast

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

> Estimado ~380–460 líneas. Slice mínimo; reenvío excluido por propuesta. Si `sdd-apply` observa >400, escalar a `ask-on-risk` antes de PR.

## Phase 1 — Foundation: AuthGate y Config

- [x] 1.1 Crear `apps/backend-php/src/AuthGate.php` con `requireAdmin(array $config, array $server, string $requestId): void`; comparar `X-Admin-Key` con `hash_equals()` contra `Config::adminApiKey()`; responder 401 genérico si falta config, header, está vacío o no coincide.
- [x] 1.2 Modificar `apps/backend-php/src/Config.php`: aceptar `admin_api_key` externa opcional sin exigirla globalmente; exponer getter que devuelve `''`; nunca loguear valor.
- [x] 1.3 Crear `apps/backend-php/tests/AuthGateTest.php`: casos header válido, faltante, inválido, config vacía; asserts sin red.

## Phase 2 — Core: AdminCertificateService

- [x] 2.1 Crear `apps/backend-php/src/AdminCertificateService.php` con constructor `(PDO $pdo, string $tokenPepper, string $requestId, ?LoggerInterface $logger = null)`.
- [x] 2.2 Implementar `emitir(array $payload)`: validar demo; convertir `documentNumber` inbound a `documento_hash` (HMAC con `app_salt`) y `documento_enmascarado`; descartar crudo sin log; token = `random_bytes(32)`; persistir solo `token_hash` binario y `token_prefijo`; prepared statements.
- [x] 2.3 Implementar `revocar(int|string $id, ?string $reason)`: UPDATE `cert_certificados` a `estado='revocado'`, `revocado_en=NOW()`, `motivo_revocacion`; UPDATE en `cert_tokens_verificacion` activos a `revocado`; devolver DTO con `tokensRevoked` y `revokedAt`.
- [x] 2.4 `safeAudit(string $action, string $result, array $meta=[])` no bloqueante con `try/catch(Throwable)`; nunca DNI completo, token completo, SQL ni secretos.
- [x] 2.5 Helpers privados: `maskDocument`, `hashDocument`, `validatePayload` lanzando `ValidationException` con código seguro.

## Phase 3 — Routing e integración

- [x] 3.1 Modificar `apps/backend-php/index.php`: `require_once` de `AuthGate.php` y `AdminCertificateService.php`; instanciar `Database` solo dentro del handler admin.
- [x] 3.2 Rama `POST /admin/certificados`: `AuthGate::requireAdmin()` + `emitir()` → 201 con DTO (`id`, `certificateCode`, `status`, `student.displayName`, `student.documentMasked`, `course.name`, `issuedAt`, `expiresAt?`, `tokenPrefix`).
- [x] 3.3 Rama `POST /admin/certificados/{id}/revocar`: misma protección; payload opcional `{reason}`; 200 con `{id, status:'revocado', revokedAt, tokensRevoked}`; mapear 400/404/409/401.
- [x] 3.4 Mantener `normalizePath()` y rutas públicas intactas; verificar `/health`, `/certificados/.../verificacion` y `/certificados/consulta`.

## Phase 4 — Testing y validación

- [x] 4.1 `php -l` y tests simples de `tests/` (AuthGate + máscara/hash) sin DB real.
- [x] 4.2 Stack Docker PHP 8.4 + MariaDB con `001_certificados_qr.sql` y datos ficticios; `admin_api_key` solo en config demo fuera del repo.
- [x] 4.3 E2E parcial por diseño: emitir → token activo persistido verificado en DB; revocar → verificación pública falla. Revisión de JSON y logs: ausencia de DNI completo, token completo, `admin_api_key` y SQL. Cobertura E2E: emisión admin `201`, revocación `200` y verificación pública post-revocación `404` ejecutadas con datos ficticios. La verificación pública del token recién emitido queda fuera de alcance porque el contrato prohíbe devolver el token completo y la entrega/reenvío depende de un ciclo posterior.
- [x] 4.4 Confirmar que `POST /admin/certificados/{id}/reenviar` devuelve 404; documentar limitación de entrega del token en `docs/backend/`.

## Phase 5 — Documentación y archive

- [x] 5.1 Actualizar `docs/backend/01-contrato-api-certificados.md` con endpoints admin, payloads demo, DTOs seguros y exclusión de reenvío.
- [x] 5.2 Merge del delta en `openspec/specs/backend-contrato-api-certificados/spec.md` (archive); registrar `admin-auth`, `admin-certificate-emission`, `admin-certificate-revocation` como vigentes.
- [x] 5.3 Confirmar que no se versionaron `.env`, config real, dumps, `material_privado_no_versionar/`, credenciales ni dependencias nuevas.
- [x] 5.4 Cerrar con `sdd-archive`; dejar nota de deuda: reenvío/entrega de token pendiente hasta definir mecanismo de email.
