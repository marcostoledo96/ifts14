# Manifiesto de paquete — producción /certificados/

Lista revisable de artefactos que el operador debe copiar al paquete de producción y los que debe excluir. Este manifiesto es documental: no genera ZIP automáticamente ni sube nada a cPanel. El operador arma el paquete a mano siguiendo [`CHECKLIST.md`](CHECKLIST.md) e [`INSTRUCCIONES-SUBIDA.md`](INSTRUCCIONES-SUBIDA.md).

**URL objetivo (opción A):** `https://ifts14.com.ar/certificados/`

## Artefactos a copiar

| Origen (repositorio) | Destino (paquete producción) | Observación |
|---|---|---|
| `apps/frontend-angular/dist/frontend-angular/` | `certificados/` | Build `production`. Contiene `index.html`, assets y JS con `baseHref /certificados/`. `angular.json` usa `outputPath.browser: ""` (sin subcarpeta `browser/`). |
| `apps/backend-php/index.php` | `certificados/api/index.php` | Router único (soporta `/certificados/api`). |
| `apps/backend-php/src/` | `certificados/api/src/` | Fuente PHP. El `.htaccess-api` bloquea acceso directo. |
| `apps/backend-php/config/certificados-config.example.php` | `certificados/api/config/certificados-config.example.php` | Solo ejemplo. La config real queda fuera del paquete. |
| `apps/backend-php/composer.json` | `certificados/api/composer.json` | Requerido por `composer install`. |
| `apps/backend-php/composer.lock` | `certificados/api/composer.lock` | Fija versiones exactas. |
| `deploy/production/.htaccess-root` | `certificados/.htaccess` | Plantilla SPA producción. |
| `deploy/production/.htaccess-api` | `certificados/api/.htaccess` | Plantilla API + `AddHandler` ea-php84. |

## Artefactos a excluir (NUNCA copiar al paquete)

| Excluir | Motivo |
|---|---|
| `vendor/` | Regenerar con `composer install --no-dev` local e incluir solo en el ZIP operativo; nunca versionar. |
| `.env*` / `.user.ini` con secretos | Config real fuera de Git; `.user.ini` de prod se crea en el servidor. |
| `apps/backend-php/config/certificados-config.php` | Config real vía `CERTIFICADOS_CONFIG_PATH` externo. |
| `*.sql`, `*.dump`, `*.bak` | Volcados; migraciones se aplican por phpMyAdmin/CLI, no al webroot. |
| `*.log` | Bitácoras. |
| `public_html/` | Contenido del servidor. |
| `material_privado_no_versionar/` | Material privado. |
| `dist/` (raíz del repo) | Solo el `dist/frontend-angular/` del build `production` reciente. |
| `node_modules/` | Dependencias frontend. |
| Credenciales, tokens, peppers, claves | Nunca en el paquete. |
| Artefactos / ZIPs de **staging** | No mezclar entornos. |
| `deploy/staging/LIMPIA-*.sql` | Solo staging; **prohibido** contra producción. |

## Regla de exclusión

Si un archivo no es claramente seguro para copiar, excluirlo del paquete y consultar antes de continuar. La subida real queda gated por el gate PHP 8.4 y por [`CHECKLIST.md`](CHECKLIST.md).
