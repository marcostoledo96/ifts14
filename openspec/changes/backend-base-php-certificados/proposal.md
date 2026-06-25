# Propuesta: backend-base-php-certificados (M2-02)

## Intento

Crear la base mínima y segura del backend PHP 8.4.21 para el módulo de certificados QR, de modo que los endpoints de negocio (M2-03) se construyan sobre una estructura con configuración externa, errores controlados y PDO listo para prepared statements.

## Alcance

### En alcance
- Estructura base en `apps/backend-php/` (front controller, config, respuesta, fábrica PDO).
- Cargador de configuración desde archivo PHP externo no versionado (sin `.env`).
- Ejemplo ficticio de config (`config/certificados-config.example.php`) sin credenciales reales.
- Fábrica PDO lazy con opciones seguras (errores como excepciones, sin emulación).
- Helper JSON estático para envelope `data/meta` y `error/meta`, sin filtrar detalles internos.
- Ruta `GET /health` que no requiere base de datos ni expone secretos.
- `.htaccess` mínimo para reescribir todo hacia `index.php` bajo `/certificados/api/`.
- README breve en `apps/backend-php/README.md` con estructura y deploy.

### Fuera de alcance
- Angular, migraciones SQL, endpoint `/{token}/verificacion` (M2-03), `POST /consulta`.
- Conexión a base real ni credenciales verdaderas en el repo.
- `.env` versionado, Composer ni dependencias de terceros.
- Servicios, controladores o repositorios de negocio.

## Capabilities

### Nuevas capabilities
- `backend-base-php-certificados`: estructura mínima PHP segura con carga externa de config, fábrica PDO, helper JSON de respuesta/error y ruta de salud.

### Capabilities modificadas
- Ninguna. No cambian los requisitos de `backend-contrato-api-certificados` ni `backend-modelo-datos-certificados`.

## Approach

Separación mínima por responsabilidad, modo Ponytail: un front controller que carga config, enruta `/health` y captura errores globales; helpers aislados en archivos pequeños. No se agregan capas de servicio ni `public/` adicional. La config real se carga desde una ruta fuera del webroot; el repo solo entrega un ejemplo ficticio.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/backend-php/` | Nuevo | `index.php`, `src/Config.php`, `src/Response.php`, `src/Database.php`, `README.md`, `.htaccess` |
| `docs/backend/00-php84-api.md` | Actualizar en archive | Documentar estructura real creada |
| `docs/02-arquitectura.md` | Validar | Confirmar separación config/rutas/datos |
| `deploy/.htaccess` | Nuevo/Actualizar | Reglas mínimas de rewrite para `/certificados/api/` |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Ruta de config externa no coincide con cPanel | Media | Documentar ruta esperada; validar en M3-02 |
| Extensión `pdo_mysql` no habilitada local | Media | Checkpoint `php -m` antes de avanzar |
| `.htaccess` incompatible con Apache del hosting | Media | Usar `FallbackResource` o reglas mínimas; probar en entorno aislado |
| Abstracción prematura | Baja | Solo archivos imprescindibles para PDO + errores seguros |

## Plan de rollback

Eliminar los archivos creados en `apps/backend-php/` (excepto `AGENTS.md`) y revertir cualquier cambio en `deploy/.htaccess`. Como M2-02 no toca base real ni endpoints públicos, el rollback no afecta datos ni a usuarios.

## Dependencias

- PHP 8.4.21 (confirmado).
- Extensión `pdo_mysql` habilitada para fases posteriores (no requerida para `GET /health`).
- Apache 2.4+ con `mod_dir` (FallbackResource) o `mod_rewrite`.

## Criterios de éxito

- [ ] `php -l` pasa en todos los archivos `.php` creados.
- [ ] `GET /certificados/api/health` responde `200` con envelope JSON `{ "data": { "status": "ok" }, "meta": { ... } }`.
- [ ] No hay credenciales, tokens ni rutas privadas reales en el repositorio.
- [ ] El cargador de config falla de forma segura (HTTP 500 controlado) cuando el archivo externo no existe.
