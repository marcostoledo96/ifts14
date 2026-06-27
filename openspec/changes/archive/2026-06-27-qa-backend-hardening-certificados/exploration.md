## Exploration: qa-backend-hardening-certificados

### Current State
El backend PHP 8.4 cuenta con:
- Front controller `index.php` con normalización de ruta, `set_exception_handler`, health check y tres endpoints públicos/admin.
- `CertificateValidator` con validación de token por regex, lookup por hash binario con pepper, auditoría no bloqueante y respuesta pública mínima.
- `AdminCertificateService` con emisión (transaccional) y revocación (transaccional), validación de payload, enmascaramiento de documento y auditoría mínima.
- `AuthGate` con comparación de tiempo constante (`hash_equals`) y falla cerrada si falta clave o header.
- `RateLimiter` basado en archivo JSON temporal con `flock`, bucket hasheado (no guarda IP cruda) y fail-open.
- `Config` que carga archivo PHP externo, valida claves requeridas y aplica defaults seguros.
- `Database` lazy con PDO y opciones seguras (`ERRMODE_EXCEPTION`, `EMULATE_PREPARES => false`).
- `Response` con envelope JSON consistente (`data/meta` o `error/meta`), sin stack traces ni detalles internos.
- Tests simples sin framework: `AuthGateTest.php`, `AdminCertificateServiceTest.php`, `fault-injection-audit.php`.
- `.gitignore` sólido: cubre `.env`, `*.key`, `**/config.php`, `material_privado_no_versionar/`, `graphify-out/`, dumps, logs, backups.
- Documentación y specs OpenSpec alineados con la implementación actual.

### Affected Areas
- `apps/backend-php/index.php` — gaps de validación de `Content-Type` y manejo inconsistente de JSON malformado en POST admin.
- `apps/backend-php/src/Response.php` — ausencia de headers de seguridad mínimos (`X-Content-Type-Options`, `X-Frame-Options`).
- `apps/backend-php/src/Config.php` — no valida longitud mínima de `admin_api_key`, permitiendo claves débiles o vacías si se configuran explícitamente.
- `apps/backend-php/src/CertificateValidator.php` — no actualiza `ultimo_uso_en` tras verificación pública (omisión funcional, no de seguridad).
- `docs/backend/00-php84-api.md` — documentar gaps conocidos de CORS y body size.
- `docs/backend/01-contrato-api-certificados.md` — documentar headers de seguridad y validación de `Content-Type` si se implementa.
- `openspec/specs/backend-contrato-api-certificados/spec.md` — posible delta por headers y validaciones.

### Approaches
1. **Hardening mínimo directo** — aplicar fixes quirúrgicos en `index.php`, `Response.php`, `Config.php` y actualizar docs.
   - Pros: bajo riesgo, rápido, mantiene contrato existente, cabe en un PR pequeño.
   - Cons: no resuelve CORS ni body size (requieren decisiones de arquitectura/deploy).
   - Effort: Low

2. **Hardening + mejoras de observabilidad** — agregar logging real (monolog o similar) y monitoreo de rate limiter.
   - Pros: mejora operabilidad.
   - Cons: agrega dependencia o complejidad, excede el scope de "hardening de seguridad y logs" para este ciclo; el prompt pide "minimal fixes only; no overengineering".
   - Effort: Medium/High

### Recommendation
Aplicar **Approach 1** (hardening mínimo directo). Los cambios son:
1. Validar `Content-Type: application/json` en endpoints POST (`/certificados/consulta`, `/admin/certificados`, `/admin/certificados/{id}/revocar`) o al menos en los admin; responder `415 UNSUPPORTED_MEDIA_TYPE` si no coincide.
2. Unificar manejo de JSON malformado: el endpoint de emisión (`/admin/certificados`) debe rechazar JSON inválido con `400 VALIDATION_ERROR`, igual que revocación.
3. Agregar headers `X-Content-Type-Options: nosniff` y `X-Frame-Options: DENY` (u `SAMEORIGIN`) en `Response::json()` y `Response::error()`.
4. Validar en `Config.php` que `admin_api_key`, si está presente, tenga longitud mínima (ej. 16 caracteres) para evitar claves débiles explícitas.
5. Documentar en `docs/backend/00-php84-api.md` los gaps intencionalmente no cubiertos: CORS preflight, límite de tamaño de body, rate limiting no distribuido.
6. Actualizar specs OpenSpec correspondientes con delta mínima si cambia comportamiento observable (ej. `415`).

### Risks
- **Riesgo 1**: El header `X-Frame-Options: DENY` puede interferir con embeds legítimos en el futuro. Mitigación: usar `SAMEORIGIN` si se prefiere, dado que la app es del mismo dominio.
- **Riesgo 2**: Validar `Content-Type` podría romper clientes existentes que no envían el header (aunque actualmente no hay clientes reales en producción). Mitigación: es un proyecto en desarrollo, el contrato ya especifica JSON; validar el header es correcto.
- **Riesgo 3**: Validar longitud mínima de `admin_api_key` puede romper configuraciones demo existentes si usan claves cortas. Mitigación: el config de ejemplo no incluye `admin_api_key`, y las demos pueden usar claves de 16+ chars.

### Ready for Proposal
**Yes**. El scope es claro, los fixes son quirúrgicos y caben en un PR bajo 400 líneas cambiadas. El orquestador debe informar al usuario que la exploración encontró el backend en buen estado general con 4 gaps pequeños y 1 omisión documentable, todos corregibles sin riesgo.
