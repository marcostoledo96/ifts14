# Diseño: backend-public-endpoint-hardening

## Enfoque técnico

Se agregará una protección mínima, local al nodo, antes de cualquier búsqueda de certificado o auditoría. `index.php` cargará la configuración una sola vez, consultará un `RateLimiter` nuevo y responderá `429 RATE_LIMITED` con `Response::error()` cuando el bucket exceda el límite. La persistencia será un JSON temporal protegido con `flock()`, sin dependencias, sin migraciones y sin guardar IP cruda, token completo ni DNI.

## Decisiones de arquitectura

| Tema | Opción elegida | Alternativas descartadas | Racional |
|---|---|---|---|
| Persistencia | `apps/backend-php/src/RateLimiter.php` con JSON + `flock()` | `static array`, DB, Redis, dependencia externa | En PHP-FPM el estado estático no persiste entre requests; DB/Redis exceden el alcance. JSON local cumple el requisito de nodo único. |
| Clave de bucket | `substr(hash('sha256', $ip . '|' . $salt), 0, 32)`; GET y POST comparten el mismo bucket por origen | IP cruda, token, DNI, hash reversible, sin salt o clave con `routeKey` | Cumple el requisito de “límite público por origen”: ambos endpoints consumen el mismo cupo del origen y no se agrega separación no pedida. |
| Configuración | Leer claves opcionales desde config externa existente: `rate_limit_threshold`, `rate_limit_window_seconds`, `rate_limit_storage_path`, `app_salt`; fallback de salt a `token_pepper` | `.env`, config versionable real, constantes hardcodeadas | Respeta cPanel/config externa y evita crear secretos o archivos prohibidos. |
| Falla del limiter | Fail-open: si el archivo temporal no se puede bloquear/leer/escribir, permitir la solicitud | Fail-closed con `429` o logger nuevo | Es el comportamiento mínimo más seguro para disponibilidad: no expone datos nuevos y evita bloquear validaciones legítimas por permisos temporales. Se documenta como riesgo operativo. |

## Flujo de datos

```txt
Request público
  → normalizePath()
  → Config::load()
  → RateLimiter::allow($_SERVER)
      → hash de origen + JSON temporal con flock() exclusivo
  → si excede: Response::error(429, 'RATE_LIMITED', ...)
  → si permite: CertificateValidator::verify()
      → lookup PDO
      → audit no bloqueante
      → Response 200/400/404
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/src/RateLimiter.php` | Crear | Clase final, sin estado global, con lectura/escritura JSON bajo lock exclusivo, `rewind()`/`ftruncate()` antes de escribir, JSON corrupto tratado como fail-open, limpieza de buckets expirados y permisos restrictivos best-effort al crear el archivo. |
| `apps/backend-php/index.php` | Modificar | `require_once` del limiter, carga de config por request y chequeo antes de `respondToValidation()`. |
| `apps/backend-php/src/Config.php` | Modificar | Validar claves actuales y aceptar opcionales de rate limit sin exigirlas. |
| `apps/backend-php/tests/fault-injection-audit.php` | Crear | Script CLI mínimo para DB demo ficticia: renombra auditoría, ejecuta casos y restaura en `finally`. |
| `docs/backend/01-contrato-api-certificados.md` | Modificar | Documentar `429`, limitaciones de nodo único, NAT y permisos de temporales. |
| `openspec/specs/*` | Modificar en archive | Fusionar deltas al cerrar el ciclo. |

## Interfaces / contratos

```php
final class RateLimiter
{
    /** @param array<string,string> $config @param array<string,mixed> $server */
    public function __construct(array $config, array $server) {}
    public function allow(): bool {}
}
```

Config esperada, toda externa y opcional salvo claves existentes: `rate_limit_threshold` default razonable, `rate_limit_window_seconds`, `rate_limit_storage_path` default `sys_get_temp_dir() . '/ifts14-cert-rate-limit.json'`, `app_salt` o fallback `token_pepper`.

Estado persistido: `{ bucketHash: { count, resetAt } }`. La implementación debe tomar lock exclusivo durante lectura/modificación/escritura, truncar y rebobinar el archivo antes de guardar, tratar JSON inválido como estado no confiable con fail-open para esa solicitud, y aplicar permisos restrictivos con `chmod()` best-effort si el archivo se crea.

Contrato de error: `429 RATE_LIMITED` usa el sobre existente `{ error: { code, message, details: [] }, meta: { requestId } }` y no incluye bucket, IP, token ni DNI.

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unidad | Ventana, umbral, limpieza, privacidad del JSON y fail-open | Script/asserts PHP con archivo temporal propio. |
| Integración | GET y POST devuelven `429` antes del lookup/audit | Umbral bajo en config demo y requests repetidos. |
| Fault-injection | Auditoría caída no altera `200`, `404`, `400` | Script CLI contra DB local ficticia: usar storage limpio aislado o umbral alto del limiter para que `429` no enmascare las aserciones; `RENAME TABLE cert_eventos_auditoria TO cert_eventos_auditoria_bak`, ejecutar casos y restaurar en `finally`. |

## Migración / rollout

No requiere migración. Rollout: configurar valores externos en staging/cPanel, verificar escritura y `flock()` en temporales, ejecutar pruebas de rate limit y fault-injection, documentar limitaciones antes de archive.

## Preguntas abiertas

- [ ] Ninguna bloqueante.
