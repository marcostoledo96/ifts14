# Apply progress — certificados-qa-smoke-cpanel

## Estado

Completado localmente. No se ejecutaron commit, push, merge, rebase, staging, PR ni subida a cPanel.

## Tareas completadas

- [x] Crear paquete local `deploy/cpanel/certificados_qa_smoke/` con página estática, `.htaccess` raíz y API PHP mínima.
- [x] Adaptar el prefijo de API de `/certificados/api` a `/certificados_qa/api` en la copia smoke de `api/index.php`.
- [x] Mantener `GET /api/health` sin carga de configuración ni conexión PDO.
- [x] Bloquear acceso directo a `api/src/` y `api/config/` desde `api/.htaccess`.
- [x] Documentar generación del ZIP, subida manual por cPanel File Manager, URLs de prueba, comandos `curl.exe`, resultados esperados, seguridad y limpieza.

## Archivos creados

| Archivo | Propósito |
|---|---|
| `deploy/cpanel/certificados_qa_smoke/index.html` | Página estática de smoke y fallback para rutas como `/validar/ABC123`. |
| `deploy/cpanel/certificados_qa_smoke/.htaccess` | Fallback raíz con `RewriteBase /certificados_qa/` sin capturar `/api/`. |
| `deploy/cpanel/certificados_qa_smoke/README.md` | Guía de empaquetado, subida manual, pruebas y limpieza. |
| `deploy/cpanel/certificados_qa_smoke/api/index.php` | API mínima copiada/adaptada para `/certificados_qa/api`. |
| `deploy/cpanel/certificados_qa_smoke/api/.htaccess` | Reglas API con `RewriteBase /certificados_qa/api/`, bloqueo de `src/` y `config/`, fallback a `index.php`. |
| `deploy/cpanel/certificados_qa_smoke/api/src/Response.php` | Respuestas JSON copiadas del backend base. |
| `deploy/cpanel/certificados_qa_smoke/api/src/Config.php` | Configuración copiada con ruta ficticia externa. |
| `deploy/cpanel/certificados_qa_smoke/api/src/Database.php` | PDO copiado; no se ejecuta en `/health`. |
| `deploy/cpanel/certificados_qa_smoke/api/config/certificados-config.example.php` | Configuración de ejemplo ficticia. |

## Verificación ejecutada

| Check | Resultado |
|---|---|
| `git status --ignored --short` | Ejecutado. Se observaron cambios preexistentes en `.atl/skill-registry.md`, `.gitignore`, `apps/backend-php/` y otros cambios SDD; este apply solo creó el paquete smoke y este reporte. |
| Listado de archivos creados | Ejecutado con glob del paquete smoke; coincide con la estructura planificada. |
| Búsqueda de indicios prohibidos en el paquete | Ejecutada solo dentro de `deploy/cpanel/certificados_qa_smoke/`. Hallazgos esperados: `clave_demo_no_real` en el ejemplo ficticio y referencias al ZIP en README. No se detectaron `.env`, nombres reales de config ni dumps/logs reales. |
| `php -l` sobre PHP smoke | Bloqueado: `php` no está disponible en esta sesión. |

## Seguridad

- No se leyó ni tocó `material_privado_no_versionar/`.
- No se incluyeron credenciales reales.
- No se incluyeron dumps ni logs.
- No se creó endpoint de validación real.
- No se implementó Angular.
- No se agregaron dependencias.
- No se modificó código fuente existente bajo `apps/backend-php/`.

## Próximo paso recomendado

Ejecutar `sdd-verify` en una sesión con PHP disponible, o validar manualmente en cPanel aislado si se decide subir el paquete por File Manager.
