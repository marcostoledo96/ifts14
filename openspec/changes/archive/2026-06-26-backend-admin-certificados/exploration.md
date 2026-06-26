# Exploration: backend-admin-certificados

## Current State

El backend PHP 8.4 (`apps/backend-php/`) tiene implementados solo los endpoints públicos de validación:

- `GET /health` — disponibilidad técnica.
- `GET /certificados/{token}/verificacion` — validación pública por token en URL.
- `POST /certificados/consulta` — validación pública por JSON body.

La base de datos MariaDB ya soporta las capacidades administrativas necesarias:

- `cert_certificados` posee campos `estado`, `revocado_en`, `motivo_revocacion`.
- `cert_tokens_verificacion` posee `estado`, `revocado_en`, `vigente_desde`, `vigente_hasta`.
- `cert_eventos_auditoria` ya define los tipos de evento `emision`, `verificacion`, `revocacion`, `reenvio`, `error`.

No existe superficie de administración en PHP: ni rutas, ni controladores, ni autorización, ni servicios de escritura.

## Affected Areas

- `apps/backend-php/index.php` — agregar rutas administrativas con chequeo de autorización antes del handler.
- `apps/backend-php/src/Config.php` — validar/agregar `admin_api_key` (o equivalente) para gate mínimo.
- `apps/backend-php/src/CertificateValidator.php` — no se toca; es solo lectura pública.
- Nuevos archivos posibles:
  - `apps/backend-php/src/AdminCertificateService.php` — lógica de emisión, revocación y reenvío.
  - `apps/backend-php/src/AuthGate.php` — gate de autorización mínimo (header API key vs config externa).
- `docs/backend/01-contrato-api-certificados.md` — extender con endpoints y DTOs administrativos.
- `docs/backend/00-php84-api.md` — actualizar estado de implementación.
- `openspec/specs/backend-contrato-api-certificados/spec.md` — agregar escenarios administrativos.
- `database/migrations/` — probablemente no requiera cambios; el modelo actual ya cubre los estados y auditoría.

## Approaches

### 1. Gate API key por header + servicio monolítico (recomendado)

Agregar en `index.php` rutas tipo `POST /admin/certificados`, `POST /admin/certificados/{id}/revocar`, `POST /admin/certificados/{id}/reenviar`. Antes de cada handler, validar un header `X-Admin-Key` contra un hash configurable en la config externa. La lógica de negocio vive en una clase `AdminCertificateService` que usa PDO preparado y audita cada acción.

- **Pros**: mínimo número de archivos nuevos, coherente con el patrón actual (front controller + clases de servicio), no requiere sesiones ni cookies, no inventa seguridad falsa.
- **Cons**: una sola API key compartida no permite auditoría por usuario individual; la clave debe rotarse manualmente.
- **Effort**: Low-Medium

### 2. Delegar autenticación al webserver (cPanel/Apache)

Proteger la ruta `/certificados/api/admin/` con `.htaccess` + Basic Auth o IP allowlist a nivel Apache. El PHP admin asume que toda request que llega está autorizada.

- **Pros**: cero código de auth en PHP, usa mecanismos estándar del hosting.
- **Cons**: menos flexible para errores JSON uniformes, acopla el deploy a la configuración del servidor, dificulta testing local sin replicar Apache.
- **Effort**: Low

### 3. Auth por sesión PHP/cookie

Implementar login con sesiones PHP para administradores.

- **Pros**: permite múltiples usuarios y auditoría por sesión.
- **Cons**: sobreingeniería para el alcance actual; requiere tabla de usuarios, manejo de sesiones, CSRF, etc. Angular no está listo para consumir esto.
- **Effort**: High
- **Veredicto**: descartada por sobrealcance respecto al ciclo M3-03.

## Recommendation

**Opción 1: gate API key por header + servicio monolítico.**

Razonamiento:

- El modelo de datos ya soporta emisión, revocación y reenvío sin migraciones nuevas.
- La arquitectura actual (front controller + clases de servicio + prepared statements + auditoría no bloqueante) se extiende naturalmente.
- Un header `X-Admin-Key` comparado contra un valor en configuración externa es el mínimo gate verificable sin simular seguridad.
- Mantiene el contrato JSON uniforme con el mismo sobre de errores (`error/meta`).
- El esfuerzo se concentra en reglas de negocio, no en infraestructura de auth.

**Endpoints mínimos propuestos:**

| Método | Ruta | Acción |
|---|---|---|
| `POST` | `/admin/certificados` | Emitir certificado y token de verificación. |
| `POST` | `/admin/certificados/{id}/revocar` | Revocar certificado y tokens activos. |
| `POST` | `/admin/certificados/{id}/reenviar` | Generar nuevo token, invalidar anterior; audit `reenvio`. |

**Gate de autorización mínimo:**

- `Config.php` valida que exista `admin_api_key` (string no vacía) en la config externa.
- `index.php` (o una función helper) rechaza con `401 UNAUTHORIZED` si falta el header `X-Admin-Key` o no coincide exactamente con la clave configurada.
- No se hashdea la clave en memoria: se compara en constant time con `hash_equals()`.

**Auditoría:**

- Cada endpoint admin DEBE registrar `cert_eventos_auditoria` con `tipo_evento` correspondiente (`emision`, `revocacion`, `reenvio`), `resultado` (`ok`/`rechazado`/`error`), `request_id` y `detalle_seguro` sin datos sensibles.
- La falla de auditoría NO debe romper la respuesta del endpoint admin (mismo patrón que la validación pública).

**Privacidad:**

- Los endpoints admin NO deben devolver DNI completo ni token completo en respuestas.
- El DTO de emisión puede devolver `certificateCode` y `tokenPrefix` (últimos 4 o prefijo documentado) para confirmación, nunca el token íntegro.

## Risks

- **Autorización insuficiente para producción**: una sola API key compartida no escala a múltiples bedeles/administradores ni permite revocación granular. Mitigación: documentar explícitamente que este gate es el mínimo viable para M3-03 y que un sistema de usuarios/administradores es deuda técnica conocida.
- **Exposición accidental de admin endpoints**: si se despliega sin `admin_api_key` configurado, los endpoints podrían quedar abiertos o fallar cerrados. Mitigación: `Config.php` debe exigir `admin_api_key` como obligatorio (no default) para levantar la app si existen rutas admin; o bien los endpoints deben rechazar si la clave no está configurada.
- **Token regeneration sin invalidación previa**: si el reenvío no revoca/vence el token anterior, quedan múltiples tokens válidos para un mismo certificado. Mitigación: el endpoint de reenvío DEBE invalidar (estado `revocado` o `vencido`) el token activo previo antes de insertar el nuevo.
- **Límite de 400 líneas cambiadas**: emisión + revocación + reenvío + auth + tests pueden exceder el presupuesto de revisión. Mitigación: considerar dividir en dos unidades de trabajo revisables (ej. emisión primero, revocación+reenvío después) o reducir el scope a emisión + revocación si el reenvío depende de mecanismo de email no confirmado.

## Ready for Proposal

**Yes.** La exploración confirma que:

1. El modelo de datos actual ya soporta las tres capacidades (emisión, revocación, reenvío).
2. No se requieren migraciones SQL nuevas.
3. El patrón de auth mínimo por header es viable y no simula seguridad falsa.
4. El principal riesgo es el tamaño del cambio respecto al presupuesto de 400 líneas.

**Recomendación al orquestador**: preguntarle a Marcos si prefiere:
- (A) Un solo PR con emisión + revocación + reenvío + auth, asumiendo que puede acercarse al límite de 400 líneas.
- (B) Dividir en dos: primero auth + emisión (PR 1), luego revocación + reenvío (PR 2), ambos sobre la misma rama `backend/admin-certificados`.
- (C) Excluir reenvío de M3-03 si no hay mecanismo de email confirmado, y dejarlo para M3-04 o ciclo posterior.

El orquestador debería también confirmar si la config externa real ya puede incluir `admin_api_key` o si Marcos debe agregarlo manualmente fuera de Git.
