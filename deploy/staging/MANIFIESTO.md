# Manifiesto de paquete — staging /certificados_staging/

Lista revisable de artefactos que el operador debe copiar al paquete de staging y los que debe excluir. Este manifiesto es documental: no genera ZIP automáticamente ni sube nada a cPanel. El operador arma el paquete a mano siguiendo [`CHECKLIST.md`](CHECKLIST.md).

## Artefactos a copiar

| Origen (repositorio) | Destino (paquete staging) | Observación |
|---|---|---|
| `apps/frontend-angular/dist/frontend-angular/` | `certificados_staging/` | Build `production-staging`. Contiene `index.html`, assets y JS bundles con `baseHref /certificados_staging/`. `angular.json` usa `outputPath.browser: ""`, por lo que el build cae directo en `dist/frontend-angular/` (sin subcarpeta `browser/`). |
| `apps/backend-php/index.php` | `certificados_staging/api/index.php` | Router único (ya soporta `/certificados_staging/api`). |
| `apps/backend-php/src/` | `certificados_staging/api/src/` | Fuente PHP. El `.htaccess-api` bloquea acceso directo. |
| `apps/backend-php/config/certificados-config.example.php` | `certificados_staging/api/config/certificados-config.example.php` | Solo ejemplo. La config real queda fuera del paquete. |
| `apps/backend-php/composer.json` | `certificados_staging/api/composer.json` | Requerido por `composer install`: el lock por sí solo no basta para resolver dependencias. |
| `apps/backend-php/composer.lock` | `certificados_staging/api/composer.lock` | Fija versiones exactas para `composer install` en hosting o para regenerar `vendor/` local. El `.htaccess-api` bloquea acceso directo a ambos. |
| `deploy/staging/.htaccess-root` | `certificados_staging/.htaccess` | Plantilla SPA para raíz de staging. |
| `deploy/staging/.htaccess-api` | `certificados_staging/api/.htaccess` | Plantilla API para staging. |

## Artefactos a excluir (NUNCA copiar al paquete)

| Excluir | Motivo |
|---|---|
| `vendor/` | Dependencias Composer: regenerar con `composer install` en hosting o local, nunca versionar ni copiar como parte del repo. |
| `.env*` | Variables de entorno reales. |
| `apps/backend-php/config/certificados-config.php` | Config real. La config de staging se carga vía `CERTIFICADOS_CONFIG_PATH` externo. |
| `*.sql`, `*.dump`, `*.bak` | Volcados y copias de resguardo. |
| `*.log` | Bitácoras productivas o de staging. |
| `public_html/` | Contenido descargado del servidor. |
| `material_privado_no_versionar/` | Material privado del proyecto. |
| `dist/` (carpeta raíz del repo) | Artefactos de build previos. Solo se copia el `dist/frontend-angular/` del build `production-staging` reciente. |
| `node_modules/` | Dependencias frontend. |
| Credenciales, tokens, peppers, claves privadas | Nunca en el paquete. |

## Regla de exclusión

Si un archivo no es claramente seguro para copiar, excluirlo del paquete y consultar antes de continuar. La preparación local es revisable; la subida real queda gated por [`CHECKLIST.md`](CHECKLIST.md).