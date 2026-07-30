# Delta for deploy-cpanel-certificados

## ADDED Requirements

### Requirement: Deny de src|config en `.htaccess` de API

El `.htaccess` de la API versionado en el árbol app (y plantillas deploy/smoke alineadas) DEBE denegar acceso directo a `src` y `config` con `RewriteRule` que use flags `[F,L]` **antes** de `FallbackResource` (u otra regla de enrutamiento equivalente a `index.php`). DEBE NOT servir código o configuración bajo esas rutas cuando Apache aplica ese `.htaccess`.

#### Scenario: Deny declarado antes del fallback

- GIVEN un `.htaccess` de API versionado en el repositorio
- WHEN se inspeccionan las reglas de reescritura
- THEN DEBE existir una `RewriteRule` que deniegue `src|config` con `[F,L]`
- AND esa regla DEBE aparecer antes de `FallbackResource`

#### Scenario: Acceso directo a src denegado

- GIVEN API servida por Apache con el `.htaccess` canónico y archivos reales bajo `src/`
- WHEN un cliente solicita una URL bajo `src/`
- THEN la respuesta DEBE ser Forbidden (403)
- AND DEBE NOT devolver el contenido del archivo fuente
