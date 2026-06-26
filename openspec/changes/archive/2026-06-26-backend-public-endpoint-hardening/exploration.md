## Exploration: backend-public-endpoint-hardening

### Current State

El backend PHP 8.4 tiene dos endpoints públicos de verificación implementados y verificados en el ciclo anterior (`backend-validacion-publica-certificados`):

- `GET /certificados/api/certificados/{token}/verificacion`
- `POST /certificados/api/certificados/consulta`

Ambos rutean por `apps/backend-php/index.php` hacia `CertificateValidator::verify()`, que:

1. Valida formato del token con regex (`32-128` chars alfanuméricos, `_`, `-`).
2. Calcula `SHA-256(token + token_pepper)` binario.
3. Busca en `cert_tokens_verificacion` via PDO prepared statement.
4. Inserta auditoría no bloqueante en `cert_eventos_auditoria` (try/catch silencioso).
5. Devuelve `200`, `400` o `404` según el contrato público.

El contrato ya documenta `429 RATE_LIMITED` como pendiente. La auditoría tiene `try/catch` interno pero no se ejecutó fault-injection en runtime.

### Affected Areas

- `apps/backend-php/index.php` — punto de entrada; es el lugar más limpio para insertar el rate limiter antes de `respondToValidation()`.
- `apps/backend-php/src/CertificateValidator.php` — método `audit()` es el objetivo de fault-injection.
- `apps/backend-php/src/Config.php` — debe proveer `app_salt` o reutilizar `token_pepper` para hashear la clave de bucket sin almacenar IP cruda.
- `docs/backend/00-php84-api.md` — pendientes de rate limiting y auditoría.
- `docs/backend/01-contrato-api-certificados.md` — define el error `429`.
- `openspec/specs/backend-contrato-api-certificados/spec.md` — escenario "Rate limiting ausente" debe actualizarse.

### Approaches

#### 1. Rate limiting — archivo JSON temporal con `flock()` (mínimo viable)

Implementar una clase `RateLimiter` que persista buckets en un archivo JSON dentro de `sys_get_temp_dir()`, usando `flock()` para exclusión mutua entre requests. La clave de bucket es un hash truncado de IP cliente combinado con `app_salt` o `token_pepper` existente (ej. `substr(hash('sha256', $ip . $salt), 0, 16)`); nunca se almacena IP cruda, token completo ni DNI. En cada escritura se limpian buckets expirados para evitar crecimiento ilimitado.

- **Pros**: persiste entre requests y workers PHP-FPM; cero cambios de schema; cero dependencias nuevas; funciona en cPanel compartido; no almacena datos sensibles.
- **Cons**: limitado a un solo nodo (sin distribución); depende de permisos de `sys_get_temp_dir()`; clientes bajo NAT comparten bucket; no es un sistema anti-abuso distribuido.
- **Effort**: Bajo.

#### 2. Rate limiting — tabla auxiliar en MariaDB

Crear `cert_rate_limit` y contar filas por `ip_hash` en ventana de tiempo.

- **Pros**: persistente, compartido entre workers.
- **Cons**: requiere migración SQL, INSERT/SELECT adicional por request, sobreingeniería para esta etapa.
- **Effort**: Medio.

#### 3. Fault-injection de auditoría — renombrar tabla en demo DB

Usar el entorno Docker/MariaDB local ficticio existente. Un script de prueba ejecuta:

1. Validación normal → espera `200`.
2. Renombra `cert_eventos_auditoria` → `_cert_eventos_auditoria`.
3. Re-ejecuta validación con token válido → espera `200` (no excepción).
4. Re-ejecuta con token inválido → espera `400`.
5. Re-ejecuta con token no verificable → espera `404`.
6. Restaura nombre de tabla.

- **Pros**: prueba el código real sin tocarlo; usa infraestructura ya validada.
- **Cons**: paso manual de SQL; requiere limpieza segura.
- **Effort**: Bajo.

#### 4. Fault-injection — mock de PDO

Reemplazar temporalmente `Database::$pdo` con un mock que falle en `prepare()` del INSERT de auditoría.

- **Pros**: puro PHP, repetible.
- **Cons**: `Database::$pdo` es privado estático; requiere reflexión o modificar la clase, lo que invalida la prueba de código productivo.
- **Effort**: Medio.

### Recommendation

- **M3-01 (rate limiting)**: Opción 1 (archivo JSON temporal con `flock()`). Es la solución mínima viable que persiste entre requests sin dependencias ni schema nuevo. Se documenta explícitamente que es protección básica de nodo único, no un sistema anti-abuso distribuido, y que agrupa clientes bajo NAT.
- **M3-02 (fault-injection)**: Opción 3 (renombrar tabla en demo DB). Es el camino más directo para demostrar que el `try/catch` silencioso de `audit()` no rompe el contrato público, sin alterar código productivo.

### Risks

- El rate limiter por archivo es local al nodo; bajo ataque distribuido o balanceo de carga no comparte estado. Mitigación: documentar que es capa básica y que cPanel + Apache ya ofrecen otras defensas.
- Los clientes detrás de NAT o proxy compartido agrupan buckets por IP pública. Mitigación: aceptar el riesgo para endpoints públicos de baja sensibilidad o documentar límite generoso.
- El archivo temporal requiere permisos de escritura en `sys_get_temp_dir()`. Mitigación: verificar en staging; documentar fallback si `flock()` no está disponible.
- El script de fault-injection debe incluir limpieza garantizada (`finally` o script de restauración) para no dejar la DB demo rota entre corridas.
- No crear archivos `config.php`, `db.php`, etc. reales versionables según `apps/backend-php/AGENTS.md`.

### Ready for Proposal

**Sí.** El alcance está claro: agregar una clase `RateLimiter` mínima basada en archivo JSON temporal con `flock()`, integrarla en `index.php` para los endpoints públicos usando clave de bucket hasheada y sin almacenar IPs crudas, y verificar con un script de prueba local que la falla de auditoría no rompe `200`/`400`/`404`. No se requieren migraciones nuevas ni dependencias.
