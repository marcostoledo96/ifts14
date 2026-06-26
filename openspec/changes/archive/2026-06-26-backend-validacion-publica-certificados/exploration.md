# Exploration: backend-validacion-publica-certificados

## Current State

El backend base PHP 8.4 (`apps/backend-php/`) ya existe con:

- `index.php` — front controller con `GET /health`, 404, 405 y 500 seguro.
- `src/Response.php` — respuestas JSON UTF-8 con envelope `data/meta` o `error/meta`.
- `src/Config.php` — carga configuración externa no versionada desde `CERTIFICADOS_CONFIG_PATH` o ruta fija por defecto.
- `src/Database.php` — fábrica PDO lazy con `ERRMODE_EXCEPTION`, `FETCH_ASSOC`, `EMULATE_PREPARES=false`.
- `config/certificados-config.example.php` — ejemplo con `db_host`, `db_name`, `db_user`, `db_pass`.

El contrato de API (`docs/backend/01-contrato-api-certificados.md`) y las specs (`openspec/specs/backend-contrato-api-certificados/spec.md`) ya definen los endpoints de validación pública, pero no hay implementación PHP todavía.

El modelo de datos (`database/migrations/001_certificados_qr.sql` y seeds demo) ya crea:

- `cert_certificados` — datos del certificado y alumno.
- `cert_tokens_verificacion` — `token_hash` (BINARY 32), prefijo, estado, vigencia.
- `cert_eventos_auditoria` — eventos mínimos sin datos sensibles.

## Affected Areas

- `apps/backend-php/index.php` — agregar rutas `GET /certificados/{token}/verificacion` y `POST /certificados/consulta`.
- `apps/backend-php/src/Config.php` — validar que cargue `token_pepper` (no existe en el example todavía).
- `apps/backend-php/src/Database.php` — ya listo, no requiere cambios.
- `apps/backend-php/src/Response.php` — ya listo, no requiere cambios.
- `apps/backend-php/config/certificados-config.example.php` — agregar campo `token_pepper` de ejemplo.
- `docs/backend/01-contrato-api-certificados.md` — posible ajuste menor si la implementación revela gaps.
- `docs/backend/00-php84-api.md` — documentar endpoint validado.

## Approaches

### 1. Extensión mínima en `index.php` (procedural)

Agregar bloques de ruta directamente en `index.php` con funciones helper locales para validar token, calcular hash y consultar PDO.

- **Pros**: mínimo cambio, reutiliza el patrón actual, un solo archivo nuevo de lógica (o ninguno).
- **Cons**: puede crecer desordenado si se agregan más endpoints después.
- **Effort**: Low

### 2. Router + Controller + Service + Repository

Extraer un mini-router, un `CertificateController`, un `CertificateService` y un `CertificateRepository`.

- **Pros**: separación clara, escalable, fácil de testear.
- **Cons**: más archivos, más boilerplate, posible overengineering para un solo endpoint público.
- **Effort**: Medium

### 3. Solo GET (omitir POST consulta en este ciclo)

Implementar solo `GET /certificados/{token}/verificacion` y dejar `POST /certificados/consulta` para un ciclo posterior.

- **Pros**: aún más chico, cumple el 80 % del valor.
- **Cons**: no cubre el contrato completo documentado.
- **Effort**: Low

## Recommendation

**Opción 1 (extensión mínima en `index.php`) pero con un solo archivo de servicio extra: `src/CertificateValidator.php`.**

Razonamiento:

- El proyecto ya tiene `Response.php`, `Config.php`, `Database.php` como clases utilitarias. Agregar `CertificateValidator.php` mantiene coherencia sin inflar la estructura.
- No se justifica un controller/repository full hasta que haya más endpoints de negocio.
- `index.php` solo enruta y delega; la lógica vive en `CertificateValidator`.
- Incluir `POST /certificados/consulta` en el mismo ciclo porque el contrato ya lo documenta y es trivial una vez hecho el GET.

## Risks

- **Config sin `token_pepper`**: el `certificados-config.example.php` no tiene campo `token_pepper`. Si no se agrega, la validación de hash no funciona. Mitigación: agregar en este ciclo.
- **No hay rate limiting**: el contrato menciona `429 RATE_LIMITED` pero no hay infraestructura de rate limiting. Mitigación: documentar como pendiente, no implementar ahora (YAGNI hasta que haya tráfico real).
- **No hay auditoría real**: `cert_eventos_auditoria` existe en el schema pero no hay código de escritura. Mitigación: registrar evento mínimo dentro de `CertificateValidator` (un `INSERT` simple) o dejar como `TODO` documentado.
- **404 unificado**: token inexistente, revocado, vencido o certificado no vigente deben responder igual. Requiere cuidado en la query SQL para no filtrar diferencias.
- **SHA-256 + pepper**: hay que verificar que `hash('sha256', $token . $pepper)` coincida con lo que generó el seed/demo. El seed usa `SHA2('TOKEN_DEMO_FICTICIO_NO_USAR', 256)` sin pepper; si agregamos pepper, el seed debería actualizarse.

## Ready for Proposal

**Yes.** El backend base existe, el contrato está documentado, el schema SQL y los seeds están listos. El siguiente paso es `sdd-propose` para definir el scope exacto, decidir si incluir auditoría mínima y confirmar el campo `token_pepper`.
