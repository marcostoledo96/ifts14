# Exploration: backend-public-endpoint-hardening

## Current State

El backend PHP 8.4 (`apps/backend-php/`) ya tiene implementados los endpoints públicos de validación de certificados:

- `GET /certificados/{token}/verificacion` — validación pública por token en URL.
- `POST /certificados/consulta` — validación pública por JSON body.
- `src/CertificateValidator.php` — lógica de validación con SHA-256 + pepper, auditoría no bloqueante.
- `src/Response.php` — respuestas JSON con envelope `data/meta` o `error/meta`.
- `src/Config.php` — carga configuración externa no versionada.
- `src/Database.php` — fábrica PDO lazy para MariaDB.

El contrato de API (`openspec/specs/backend-validacion-publica-certificados/spec.md`) ya documenta los códigos de error esperados, incluyendo `429 RATE_LIMITED`, pero no hay implementación de rate limiting.

**Corrección respecto al intento 1:** `private static array $buckets` en PHP no persiste entre requests HTTP en PHP-FPM/cPanel porque cada request corre en un proceso separado (o worker distinto) y las variables estáticas se reinician por request. Eso produce rate limiting falso-positivo o falso-negativo y no genera `429` confiable entre llamadas HTTP independientes.

## Affected Areas

- `apps/backend-php/index.php` — agregar chequeo de rate limit antes de `respondToValidation()`.
- `apps/backend-php/src/Config.php` — validar/agregar parámetros de rate limiting (`rate_limit_max_requests`, `rate_limit_window_seconds`, `rate_limit_salt`).
- `apps/backend-php/src/Response.php` — ya soporta `429` via `Response::error()`.
- `docs/backend/01-contrato-api-certificados.md` — documentar el comportamiento de rate limiting.
- `database/migrations/` — posible schema si se elige opción de tabla demo.

## Approaches

### 1. Archivo temporal JSON con flock (recomendado)

Usar un archivo JSON en `sys_get_temp_dir()` o directorio local writable como store de buckets. Cada request lee el archivo, actualiza el contador de su ventana de tiempo, y escribe de vuelta usando `flock()` para exclusión mutua básica.

- **Pros**: cero dependencias, cero schema de DB, funciona en cualquier hosting PHP sin extensiones extra, fácil de verificar localmente con scripts curl.
- **Cons**: `flock()` no es distribuido (suficiente para un solo servidor cPanel), bajo alta concurrencia puede haber contención de archivo, requiere limpieza periódica de entradas viejas.
- **Effort**: Low

**Detalle de privacidad:** La clave del bucket es `hash('sha256', $ip . $tokenPrefix . $salt)` — nunca se almacena IP cruda, token completo ni DNI. Se guarda solo prefijo del hash (16 chars) y contador/ventana.

### 2. Tabla SQLite local

Crear un archivo `.sqlite` local y usar PDO SQLite para manejar rate limit buckets. SQLite soporta concurrencia básica via file locking y es parte de PHP estándar.

- **Pros**: mejor concurrencia que JSON+flock, queries simples, no requiere MariaDB.
- **Cons**: requiere que la extensión `pdo_sqlite` esté habilitada (lo está en la mayoría de los hostings pero no garantizado en cPanel sin verificar), schema mínimo necesario.
- **Effort**: Low-Medium

### 3. Tabla en la DB demo MariaDB existente

Agregar una tabla `cert_rate_limit` en el schema demo existente y usar `Database::pdo()` para insertar/actualizar contadores.

- **Pros**: reutiliza conexión existente, transacciones ACID, sin archivos extra en disco.
- **Cons**: requiere migración SQL, acopla rate limiting a la base de datos de negocio, para demo local requiere que MariaDB esté corriendo.
- **Effort**: Medium

### 4. Memoria compartida nativa (APCu, shmop, sysvshm)

Usar extensiones de memoria compartida de PHP.

- **Pros**: muy rápido, sin I/O de disco.
- **Cons**: `APCu` no está disponible en todos los hostings compartidos/cPanel; `shmop`/`sysvshm` son complejas, no portables y requieren claves numéricas.
- **Effort**: High
- **Veredicto**: descartada por falta de portabilidad en cPanel.

## Recommendation

**Opción 1: archivo temporal JSON con flock.**

Razonamiento:

- Es la opción más simple que realmente persiste entre requests HTTP (el archivo vive en disco, no en memoria de proceso).
- No requiere extensiones adicionales ni schema de DB.
- Se puede verificar localmente fácilmente: hacer N requests con curl y observar el `429`.
- El locking con `flock()` es suficiente para el volumen esperado de un endpoint de validación QR institucional.
- La limpieza de entradas viejas se puede hacer en el mismo ciclo de escritura (borrar buckets con `window < now - window_seconds`).

**Ubicación del archivo:** preferir un path configurable con default en `sys_get_temp_dir() . '/cert_rate_limit.json'` para no ensuciar el proyecto. El path puede venir de `Config.php` o default razonable.

**Estructura del bucket:**

```json
{
  "abc123...": {
    "window_start": 1719500000,
    "count": 3,
    "key_prefix": "abc123"
  }
}
```

**Clave `abc123...`:** `substr(hash('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown' . $salt), 0, 16)`.

## Risks

- **Race condition bajo flock**: si el servidor usa NFS o algún filesystem distribuido, `flock()` puede no funcionar. Mitigación: documentar que este rate limiter es para single-node; si el proyecto escala a múltiples servidores, se deberá reemplazar por Redis o DB central.
- **Archivo creciendo indefinidamente**: si no se limpian entradas expiradas, el JSON crece. Mitigación: purgar entradas con `window_start < time() - window_seconds` en cada escritura.
- **Permisos de escritura**: el usuario del servidor web debe tener permiso de escritura en el directorio temporal. Mitigación: usar `sys_get_temp_dir()` que suele ser world-writable, o hacer fallback a un directorio local del proyecto si es necesario.
- **IP spoofing / proxies**: `$_SERVER['REMOTE_ADDR']` puede estar detrás de proxy. Mitigación: usar `REMOTE_ADDR` directamente sin confiar en headers forwarded (evita spoofing), documentar que en cPanel compartido esto suele ser la IP real del visitante.
- **Falso positivo en NAT compartido**: múltiples usuarios detrás de la misma IP comparten bucket. Mitigación: aceptable para un endpoint público institucional; si es problema, agregar token al hash para granularidad.

## Ready for Proposal

**Yes.** La corrección del enfoque de rate limiting está clara. El siguiente paso es `sdd-propose` para definir los parámetros exactos (requests/ventana), confirmar la ubicación del archivo y decidir si se incluye granularidad por IP+token o solo por IP.
