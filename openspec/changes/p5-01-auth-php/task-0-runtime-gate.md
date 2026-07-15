# Gates runtime Task 0: P5-01 Autenticación PHP

## Estado de gates

| Campo | Valor |
|---|---|
| Fecha UTC | 2026-07-15T00:17:52Z |
| Operador | OpenCode, sesión local no autenticada |
| Rama verificada | `integration/admin-session-http` |
| Entornos evaluados | Producción y staging |
| Gate local de implementación | **PASS LOCAL**; evidencia final en `task-0-local-gate.md` (Docker PHP 8.4, código `0`). |
| Gate de despliegue | **STOP** |

El gate local fue de falla cerrada hasta obtener `PASS LOCAL`; esa evidencia ya habilitó la implementación local. El gate de despliegue sigue fail-closed: el `FAIL` y la evidencia `UNAVAILABLE` existentes prohíben deploy y activación browser en staging/producción.

## Gate A: implementación local

La evidencia incompleta inicial fue reemplazada por el `PASS LOCAL` final registrado en `task-0-local-gate.md`: path privado y descartable, API/config nativa, cookies exactas, ciclo de sesión, CSRF antes de efectos, errores genéricos, privacidad y salida `0`. Ese resultado habilita edición local, pero no declara equivalencia con PHP-FPM/cPanel.

## Gate B: evidencia de despliegue conservada

| Gate | Estado | Evidencia sanitizada | Bloqueo exacto |
|---|---|---|---|
| Sesiones | **UNAVAILABLE** | El contenedor descartable `ifts14-php84` informó PHP `8.4.22`, handler `files`, `save_path=""`, `is_dir=false`, `is_writable=false`, permisos no disponibles. | No se obtuvo evidencia desde el mismo PHP/FPM de cPanel sobre path privado, existencia, escritura y permisos no world-readable. El contenedor local no sustituye al entorno objetivo. |
| Runtime settings | **UNAVAILABLE** | En PHP local descartable `8.4.22`, `ini_set` fue aceptado y `ini_get` devolvió: `session.use_strict_mode=1`, `session.use_cookies=1`, `session.use_trans_sid=0`, `session.gc_maxlifetime=28800`. | La comprobación local es suplementaria; no demuestra que el PHP/FPM objetivo `8.4.21` acepte los cuatro valores. |
| HTTPS/rutas | **FAIL** | `curl -I --max-redirs 0 https://ifts14.com.ar/certificados/api/health` y su equivalente bajo `/certificados_staging/` devolvieron ambos `HTTP/1.1 200 OK`, sin `Location`, `Content-Type: text/html`, `Content-Length: 20303` y el mismo `Last-Modified`. | Los dos paths entregan el mismo HTML estático; no prueban llegada al controlador frontal PHP ni un health diferenciado por base. No hubo downgrade HTTPS, pero el criterio completo no se cumple. |
| Parámetros de cookie | **UNAVAILABLE** | En PHP local descartable `8.4.22`, producción devolvió lifetime `0`, path `/certificados/`, domain vacío, secure `true`, httponly `true`, samesite `Strict`; staging devolvió los mismos atributos con path `/certificados_staging/`. | La API local acepta los parámetros, pero no existe evidencia del PHP/FPM objetivo ni de la configuración efectiva de ambos entornos. |
| Límites/reloj | **UNAVAILABLE** | La cabecera pública `Date: Wed, 15 Jul 2026 00:17:53 GMT` fue observada frente al reloj local UTC `2026-07-15T00:17:52Z`, diferencia observada de 1 segundo. | No se obtuvo evidencia de cPanel/Apache/PHP para header mínimo de 8 KiB ni body mínimo de 64 KiB. El reloj aislado no alcanza para aprobar el gate compuesto. |
| Control de fuerza bruta | **UNAVAILABLE** | La configuración pública versionada no identifica un control efectivo ModSecurity, WAF o rate-limit aplicado al futuro login administrativo. El rate limit documentado en el repositorio corresponde a endpoints públicos de validación, no al login. | Falta evidencia read-only del control efectivo vigente para login en producción y staging. Requiere verificación operativa autorizada o un cambio de infraestructura separado. |

## Comandos seguros ejecutados

```text
git branch --show-current
php -v
docker version --format <versiones>
docker images --format <repositorio:tag e id>
docker run --rm ifts14-php84 php -r <inspección sanitizada de sesiones>
docker run --rm ifts14-php84 php -r <ini_set/ini_get de cuatro directivas>
docker run --rm ifts14-php84 php -r <parámetros de cookie de producción y staging>
curl -sS -I --max-redirs 0 --connect-timeout 10 --max-time 20 <health público>
date -u
```

No se leyeron secretos, `.env`, material privado, credenciales, dumps ni logs. No se hicieron llamadas autenticadas a cPanel ni cambios de fuente, infraestructura, deploy, base de datos, Git o sistemas remotos.

## Acción requerida

1. Gate A local completado: ver `task-0-local-gate.md` para evidencia `PASS LOCAL`.
2. Mantener **STOP DESPLIEGUE**. Para reabrir el gate B se necesita evidencia sanitizada y autorizada del PHP/FPM y cPanel reales para sesiones, ini efectivo, cookies, límites/reloj y control anti-fuerza-bruta, además de corregir o explicar la respuesta HTML idéntica de los health checks de producción y staging.
3. No desplegar ni habilitar login browser en staging/producción hasta `PASS DESPLIEGUE` completo.
