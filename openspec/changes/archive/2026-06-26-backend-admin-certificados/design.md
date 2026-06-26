# Diseño: backend-admin-certificados

## Enfoque técnico

Se agrega un slice mínimo al backend PHP existente: dos rutas administrativas en `apps/backend-php/index.php`, un gate `AuthGate` para `X-Admin-Key` y un `AdminCertificateService` para emitir/revocar usando las tablas `cert_` ya versionadas. No hay Angular, migraciones ni dependencias nuevas. Se mantienen `Response`, `Config`, `Database`, PDO preparado, tokens con `hash + pepper` y auditoría no bloqueante.

## Decisiones de arquitectura

| Opción | Tradeoff | Decisión |
|---|---|---|
| Gate por `X-Admin-Key` único | Simple, sin identidad individual por administrador. | Usar `AuthGate` porque es el mínimo definido para M3-03. Falla cerrada si falta config/header o no coincide, compara con `hash_equals()` y responde `401` genérico. |
| Validar `admin_api_key` en `Config` vs. exigirlo globalmente | Exigirlo globalmente rompería endpoints públicos si aún no está configurado. | `Config` normaliza/expone el valor, pero `AuthGate` decide la autorización admin y falla cerrada solo en rutas admin. |
| Devolver token completo al emitir | Facilita pruebas manuales, pero aumenta exposición. | No devolver token completo. Generar token aleatorio, guardar solo `token_hash` binario y `token_prefijo`; responder identificadores y datos enmascarados. El reenvío/entrega queda fuera. |
| Servicio nuevo vs. lógica inline | Inline achica archivos pero mezcla routing, SQL y seguridad. | Crear `AdminCertificateService` porque ya existe separación `CertificateValidator` + `Database`; evita inflar el front controller. |
| Auditoría transaccional estricta vs. no bloqueante | Estricta puede bloquear emisión/revocación por falla secundaria. | Mantener auditoría no bloqueante con `try/catch(Throwable)`, sin secretos, DNI completo, SQL ni token completo. |

## Flujo de datos

```txt
Request admin
  -> index.php normaliza /certificados/api
  -> Config::load()
  -> AuthGate::requireAdmin($config, $_SERVER, $requestId)
  -> AdminCertificateService
       -> valida payload/id
       -> PDO prepared statements
       -> cert_certificados / cert_tokens_verificacion
       -> cert_eventos_auditoria (best effort)
  -> Response::json/error con envelope existente
```

La revocación actualiza `cert_certificados.estado = 'revocado'`, `revocado_en` y `motivo_revocacion`; además marca tokens activos del certificado como `revocado` con `revocado_en`. La verificación pública ya filtra `t.estado = 'activo'`, `t.revocado_en IS NULL`, `c.estado = 'vigente'` y `c.revocado_en IS NULL`, por lo que el token revocado deja de verificar.

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificar | Requerir nuevos archivos y agregar `POST /admin/certificados` y `POST /admin/certificados/{id}/revocar` después de rutas públicas existentes, respetando `normalizePath()`. |
| `apps/backend-php/src/Config.php` | Modificar | Aceptar `admin_api_key` externa como string opcional para carga general; la falta/valor vacío se rechaza en `AuthGate`. |
| `apps/backend-php/src/AuthGate.php` | Crear | Validación fail-closed de `X-Admin-Key` con `hash_equals()` y error `401 UNAUTHORIZED` genérico. |
| `apps/backend-php/src/AdminCertificateService.php` | Crear | Emisión, revocación, validación mínima demo, SQL preparado, DTOs seguros y auditoría best effort. |
| `docs/backend/01-contrato-api-certificados.md` | Actualizar en archive | Documentar endpoints, payload demo, respuestas seguras y exclusión de reenvío. |
| `openspec/specs/backend-contrato-api-certificados/spec.md` | Actualizar en archive | Fusionar delta administrativo al cerrar el ciclo. |

## Contratos

`POST /certificados/api/admin/certificados`

Payload demo mínimo: `studentDisplayName`, `documentNumber`, `courseName`, `issuedAt`, `expiresAt?`. Validaciones: strings no vacíos, longitudes razonables, documento solo demo numérico corto, fechas ISO `YYYY-MM-DD`, `expiresAt >= issuedAt` si existe.

Respuesta `201`: `id`, `certificateCode`, `status`, `student.displayName`, `student.documentMasked`, `course.name`, `issuedAt`, `expiresAt`, `tokenPrefix`. Nunca DNI completo ni token completo.

`POST /certificados/api/admin/certificados/{id}/revocar`

Payload opcional: `reason` string breve. Respuesta `200`: `id`, `status: revocado`, `revokedAt`, `tokensRevoked`. Errores seguros: `401`, `400 VALIDATION_ERROR`, `404 CERTIFICATE_NOT_FOUND`, `409 CERTIFICATE_NOT_REVOCABLE`.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit/simple PHP | `AuthGate`, máscara de documento, validación demo, generación hash/prefix. | Checks mínimos ejecutables sin DB real. |
| Integración | Emisión, revocación e invalidación pública. | Docker/MariaDB con migración y seed ficticios; config demo externa temporal, sin `.env` real. |
| Contrato | Envelopes, códigos HTTP y ausencia de DNI/token/secretos. | Requests HTTP locales a `/certificados/api/...`; revisar respuestas JSON. |

## Migración / rollout

No requiere migraciones. Usar el esquema `001_certificados_qr.sql` existente y datos ficticios de demo. Rollback: quitar rutas y archivos nuevos, restaurar `Config.php` y documentación.

## Preguntas abiertas

Ninguna bloqueante. La entrega/reenvío del token queda explícitamente fuera de alcance.
