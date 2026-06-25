# Verify report — certificados-qa-smoke-cpanel

## Estado

PASS WITH WARNINGS.

El paquete smoke para `public_html/certificados_qa/` cumple la estructura, reglas `.htaccess`, adaptación de API, documentación operativa y control básico de artefactos inseguros. La única advertencia histórica de la sesión de verify original es que esta sesión no tiene `php` disponible, por lo que no se pudo ejecutar `php -l`. Esa limitación es independiente del smoke HTTP real, que se ejecutó contra el cPanel del usuario y se documenta más abajo con resultado PASS.

## Evidencia ejecutada

| Check | Resultado |
|---|---|
| Lectura de `plan.md` y `apply-progress.md` | OK. Tareas marcadas completas y coherentes con archivos presentes. |
| Estructura del paquete | OK. Contiene exactamente los 9 archivos esperados. |
| `.htaccess` raíz | OK. Incluye `RewriteBase /certificados_qa/`, excluye `api/` y hace fallback a `index.html`. |
| `api/.htaccess` | OK. Incluye `RewriteBase /certificados_qa/api/`, bloquea `src/` y `config/`, y hace fallback a `index.php`. |
| API PHP | OK. `normalizePath()` elimina `/certificados_qa/api`; `/health` solo requiere `Response.php` y no carga `Config`, `Database` ni `PDO`. |
| README | OK. Documenta ZIP, ruta cPanel, URLs, `curl.exe`, resultados esperados, ausencia de credenciales y limpieza. |
| `git status --ignored --short` | Ejecutado. Muestra cambios no stageados/no trackeados preexistentes y el paquete smoke; también lista `material_privado_no_versionar/` como ignorado sin leerlo. |
| `php -l` | WARNING. `php` no está disponible en esta sesión (`php unavailable`). |
| Búsqueda segura dentro del paquete | OK. No se encontraron `.env`, `*.sql`, `*.log`, `*.zip`, `config.php`, `db.php`, `database.php` ni `conexion.php`. |

## Estructura verificada

```txt
deploy/cpanel/certificados_qa_smoke/index.html
deploy/cpanel/certificados_qa_smoke/.htaccess
deploy/cpanel/certificados_qa_smoke/README.md
deploy/cpanel/certificados_qa_smoke/api/index.php
deploy/cpanel/certificados_qa_smoke/api/.htaccess
deploy/cpanel/certificados_qa_smoke/api/src/Response.php
deploy/cpanel/certificados_qa_smoke/api/src/Config.php
deploy/cpanel/certificados_qa_smoke/api/src/Database.php
deploy/cpanel/certificados_qa_smoke/api/config/certificados-config.example.php
```

## Matriz de cumplimiento

| Requisito | Estado | Evidencia |
|---|---|---|
| Paquete con estructura exacta | PASS | Listado de directorios y glob del paquete. |
| Fallback raíz para `/certificados_qa/` | PASS | `.htaccess` raíz, líneas 1-8. |
| API aislada bajo `/certificados_qa/api/` | PASS | `api/.htaccess`, líneas 1-8. |
| Bloqueo directo de `src/` y `config/` | PASS | `RewriteRule ^(src|config)/ - [F,L]`. |
| `/health` sin configuración ni PDO | PASS | `api/index.php` solo requiere `src/Response.php`; `Config.php` y `Database.php` no se cargan en bootstrap. |
| README operativo y seguro | PASS | `README.md`, secciones de ZIP, cPanel, URLs, PowerShell, seguridad y limpieza. |
| Sin artefactos inseguros obvios en paquete | PASS | Globs específicos sin hallazgos. |
| Lint PHP | WARNING | `php` no disponible en el entorno actual. |

## Issues

### CRITICAL

- Ninguno.

### WARNING

- No se pudo ejecutar `php -l` porque `php` no está instalado/disponible en esta sesión original de verify. No bloquea archive; sugerencia diferida al usuario (ver SUGGESTION).
- En el smoke HTTP real post-archive, cPanel sirve el código 403 correcto para `api/src/Response.php` y `api/config/certificados-config.example.php` (los archivos no se exponen) pero el cuerpo de la respuesta 403 es HTML del sitio principal en lugar de un JSON controlado por la API. No bloquea archive. Mitigación futura opcional documentada abajo.

### SUGGESTION

- Ejecutar `php -l` sobre los cinco archivos PHP antes de subir el ZIP o validar el paquete en cPanel aislado.
- Opcional futuro: si se quiere coherencia con los errores JSON controlados (404, 405), definir un `ErrorDocument 403` propio dentro de `certificados_qa/.htaccess` o `certificados_qa/api/.htaccess`. No requerido para el smoke actual.

## Real cPanel HTTP smoke verification (post-archive)

Esta sección documenta los resultados reales obtenidos por el usuario al desplegar el paquete en `public_html/certificados_qa/` y ejecutar el bloque de `curl.exe` del README contra `https://ifts14.com.ar/certificados_qa/`. Se conserva la advertencia previa sobre `php -l` local; el smoke HTTP real se evalúa de forma independiente.

| # | Método | URL | Estado HTTP | Content-Type | Resultado | Veredicto |
|---|---|---|---|---|---|---|
| 1 | GET | `/certificados_qa/` | 200 | `text/html` | Sirve el `index.html` del paquete smoke. | PASS |
| 2 | GET | `/certificados_qa/validar/ABC123` | 200 | `text/html` | Fallback correcto a `index.html` (preparado para ruta Angular futura). | PASS |
| 3 | GET | `/certificados_qa/api/health` | 200 | `application/json; charset=utf-8` | JSON con `status: ok` y `service: certificados-api`. Sin carga de Config ni PDO. | PASS |
| 4 | GET | `/certificados_qa/api/no-existe` | 404 | `application/json; charset=utf-8` | JSON controlado con `code: NOT_FOUND`. | PASS |
| 5 | GET | `/certificados_qa/api/src/Response.php` | 403 | (no verificado en este chequeo) | Bloquea el acceso al fuente PHP. No expone el archivo. | PASS |
| 6 | GET | `/certificados_qa/api/config/certificados-config.example.php` | 403 | (no verificado en este chequeo) | Bloquea el acceso al archivo de configuración. No expone el archivo. | PASS |
| 7 | POST | `/certificados_qa/api/health` | 405 | `application/json; charset=utf-8` | JSON controlado con `code: METHOD_NOT_ALLOWED`. Header `Allow: GET` presente. | PASS |

### Resultado del smoke HTTP real

PASS. Los siete casos cubren el happy path (1, 2, 3), el error controlado de la API (4), el bloqueo de rutas sensibles (5, 6) y la validación de método (7). El comportamiento observado coincide con el contrato del paquete y con el bloque de resultados esperados del README.

### Observación no bloqueante sobre los casos 403 (5 y 6)

El servidor conserva el código HTTP 403 y no expone los archivos internos (`src/Response.php`, `config/certificados-config.example.php`). Sin embargo, el cuerpo de la respuesta 403 que entrega cPanel es HTML correspondiente a la página principal del sitio, no un JSON de error controlado por la API.

- Severidad: WARNING no bloqueante.
- Impacto de seguridad: nulo. El estado HTTP 403 se preserva y los archivos no se exponen.
- Impacto de observabilidad: el cliente API no recibe un cuerpo JSON consistente con el resto de errores controlados (404, 405).
- Mitigación futura opcional: servir un `ErrorDocument 403` propio dentro de `certificados_qa/.htaccess` o `certificados_qa/api/.htaccess` que devuelva un cuerpo JSON; no es necesario para el smoke actual.

### Distinción entre advertencias

| Advertencia | Origen | Bloquea archive | Estado |
|---|---|---|---|
| `php -l` no ejecutable localmente | Sesión de verify previa (entorno sin `php`) | No | Preservada como WARNING histórica. Sugerencia: correr `php -l` sobre los 5 PHP con el stack PHP 8.4.21 local del usuario. |
| Cuerpo HTML en 403 | cPanel real observado en smoke HTTP | No | WARNING nueva no bloqueante. Documentada arriba. |

## Veredicto final

PASS WITH WARNINGS. 0 CRITICAL. 2 WARNING, ninguna bloqueante: (1) `php -l` local no ejecutable en la sesión original de verify, preservada por transparencia; (2) cuerpo HTML en respuestas 403 observado en cPanel real, no expone archivos internos. El smoke HTTP real en `/certificados_qa/` se valida como PASS.
