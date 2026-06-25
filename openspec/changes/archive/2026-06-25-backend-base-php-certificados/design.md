# Diseño: base backend PHP para certificados

## Enfoque técnico

Crear una base PHP mínima para `/certificados/api/` con un único front controller, helpers chicos para configuración, respuestas JSON y PDO lazy. El ciclo M2-02 sólo entrega estructura técnica y `GET /health`; no toca Angular, no implementa validación pública, no conecta a base real durante health y no agrega dependencias.

## Decisiones de arquitectura

| Tema | Decisión | Alternativa descartada | Motivo |
|---|---|---|---|
| Estructura | `index.php` + `src/Config.php`, `src/Response.php`, `src/Database.php` | Framework, Composer o capas de servicios | Es suficiente para health, PDO futuro y errores seguros sin sobreingeniería. |
| Deploy M2-02 | Crear sólo `apps/backend-php/.htaccess` para la API | Tocar `deploy/.htaccess` o `deploy/htaccess/` en este ciclo | La propuesta menciona `deploy/.htaccess`, pero el repo usa `deploy/htaccess/`; M2-02 no debe modificar deploy global sin confirmación explícita. |
| Configuración | Archivo PHP externo no versionado, con fallback opcional a variables de entorno | `.env` versionado o `config.php` real en repo | Cumple seguridad del proyecto y evita dependencias. |
| Health | No cargar config ni abrir PDO | Verificar DB en `/health` | Health debe probar disponibilidad básica sin secretos ni base. |

## Flujo de datos

```txt
Cliente ──GET /certificados/api/health──> .htaccess ──> index.php
                                                    └──> Response::json(200)

Endpoint futuro ──> Config::load() ──> Database::pdo() ──> MariaDB
```

## Cambios de archivos previstos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Crear | Front controller: normaliza ruta, enruta `/health`, responde 404/405 y captura errores. |
| `apps/backend-php/src/Response.php` | Crear | Emite JSON UTF-8 con envelopes de éxito/error y `requestId` no sensible. |
| `apps/backend-php/src/Config.php` | Crear | Carga config externa sólo cuando un endpoint la necesita. |
| `apps/backend-php/src/Database.php` | Crear | Fábrica PDO lazy con opciones seguras. |
| `apps/backend-php/config/certificados-config.example.php` | Crear | Ejemplo ficticio, sin credenciales reales. |
| `apps/backend-php/.htaccess` | Crear | Reescritura mínima hacia `index.php` dentro de `/certificados/api/`; único `.htaccess` a tocar en M2-02. |
| `apps/backend-php/README.md` | Crear | Uso local, estructura, config externa y QA manual. |
| `deploy/.htaccess` / `deploy/htaccess/*` | No tocar | Queda fuera de M2-02; se documentará o implementará en M3-02 si corresponde. |

## Contratos e interfaces

Configuración exacta:

1. Si existe `CERTIFICADOS_CONFIG_PATH`, usar esa ruta absoluta.
2. Si no existe, usar un path externo por defecto documentado como ejemplo: `/home/usuario_demo/certificados_config/certificados-api.php`.
3. Si falta config cuando se la requiere, responder `500 INTERNAL_ERROR` sin imprimir rutas ni secretos.
4. No versionar `.env`; sólo aceptar variables de entorno si el hosting las provee.

Ejemplo versionado seguro: `apps/backend-php/config/certificados-config.example.php` con valores ficticios (`db_host: localhost`, `db_name: ifts14_certificados_demo`, `db_user: usuario_demo`, `db_pass: clave_demo_no_real`).

PDO: construir DSN MariaDB/MySQL con `charset=utf8mb4`, `PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION`, `PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC`, `PDO::ATTR_EMULATE_PREPARES => false`. La instancia se crea sólo al llamar `Database::pdo()`.

Respuestas:
- `GET /health`: `200`, `{ "data": { "status": "ok", "service": "certificados-api" }, "meta": { "requestId": "..." } }`.
- Ruta inexistente: `404 NOT_FOUND`.
- Método distinto de `GET` en `/health`: `405 METHOD_NOT_ALLOWED` y header `Allow: GET`.
- Excepción inesperada: `500 INTERNAL_ERROR` sin stack trace, SQL, rutas internas, DNI, token ni credenciales.

`.htaccess`: en M2-02 crear únicamente `apps/backend-php/.htaccess`. Preferir `FallbackResource /certificados/api/index.php`; si no está disponible, usar `mod_rewrite` mínimo que no agregue reglas para Angular ni archivos bajo `deploy/`.

## Estrategia de pruebas y QA manual

| Capa | Qué validar | Comando/enfoque |
|---|---|---|
| Sintaxis | PHP creado | `php -l apps/backend-php/index.php` y cada archivo en `src/`/`config/`. |
| Entorno | Extensiones | `php -m` y confirmar `pdo_mysql`, `openssl`, `mbstring`. |
| HTTP manual | Health y errores | `php -S 127.0.0.1:8080 -t apps/backend-php` + `curl -i http://127.0.0.1:8080/health`. |
| Seguridad | Sin secretos versionados | `git status --ignored --short` y revisión de diffs. |

## Migración / rollout

No requiere migración. En apply/archive actualizar `docs/backend/00-php84-api.md`, `docs/backend/01-contrato-api-certificados.md` si cambia el envelope y `docs/02-arquitectura.md` si se confirma estructura. No actualizar ni crear artefactos `deploy/.htaccess`; el repo contiene `deploy/htaccess/`, pero su uso queda para M3-02.

## Preguntas abiertas

- Ninguna bloqueante para M2-02.
