# Plan — certificados-qa-smoke-cpanel

## Objetivo

Paquete de humo (smoke) mínimo y versionable para probar el despliegue en cPanel bajo `public_html/certificados_qa/`.

## Estructura planificada

```
deploy/cpanel/certificados_qa_smoke/
├── index.html
├── .htaccess
├── README.md
└── api/
    ├── index.php
    ├── .htaccess
    ├── src/
    │   ├── Response.php
    │   ├── Config.php
    │   └── Database.php
    └── config/
        └── certificados-config.example.php
```

## Archivos y decisiones

### `index.html`

Página HTML mínima que demuestra que el fallback de la raíz funciona. Incluirá:
- Título y mensaje de confirmación.
- Enlace o instrucción para probar `/api/health`.
- Nota clara de que `/validar/ABC123` es solo humo de ruta, no implementación de validación real.

### `.htaccess` (raíz)

- `RewriteBase /certificados_qa/`
- No capturar rutas que comiencen con `/certificados_qa/api/`.
- Fallback a `index.html` para rutas no existentes (modo SPA provisional).

### `api/.htaccess`

- `RewriteBase /certificados_qa/api/`
- Bloquear acceso directo a `src/` y `config/` con `RewriteRule ^(src|config)/ - [F,L]`.
- Fallback a `index.php` para el resto.

### `api/index.php`

Adaptación del `apps/backend-php/index.php` existente:
- Ajustar `normalizePath` para eliminar el prefijo `/certificados_qa/api` (además de `/index.php`).
- Mantener `GET /health` sin carga de configuración ni PDO.
- Mantener manejo de 404, 405 y 500.
- No incluir credenciales reales.

### `api/src/Response.php`

Copia idéntica del original. No contiene lógica de negocio ni credenciales.

### `api/src/Config.php`

Copia idéntica del original. El path por defecto apunta a una ruta externa ficticia; si se invoca sin configuración real, lanzará excepción controlada. Esto es correcto para el paquete de humo.

### `api/src/Database.php`

Copia idéntica del original. No se ejecutará en `/health`.

### `api/config/certificados-config.example.php`

Copia idéntica del original. Contiene solo datos de ejemplo ficticios.

### `README.md`

Documentación en español argentino formal con:
- Instrucciones para comprimir el paquete localmente.
- Ruta de destino en cPanel File Manager: `public_html/certificados_qa/`.
- URLs de prueba y comandos `curl.exe` para Windows.
- Resultados esperados para cada URL.
- Notas de seguridad: no incluye credenciales reales, subida manual exclusiva, eliminar después de la prueba si se desea.

## URLs de prueba documentadas

- `https://ifts14.com.ar/certificados_qa/`
- `https://ifts14.com.ar/certificados_qa/validar/ABC123`
- `https://ifts14.com.ar/certificados_qa/api/health`
- `https://ifts14.com.ar/certificados_qa/api/no-existe`
- `https://ifts14.com.ar/certificados_qa/api/src/Response.php` (debe bloquearse)
- `https://ifts14.com.ar/certificados_qa/api/config/certificados-config.example.php` (debe bloquearse)

## Riesgos y mitigaciones

- **Riesgo**: el `.htaccess` de la raíz podría interferir con otros `.htaccess` de `public_html`.  
  **Mitigación**: usar `RewriteBase` explícito y condiciones que no capturen `/api/`.

- **Riesgo**: subida manual por File Manager puede dejar permisos incorrectos.  
  **Mitigación**: documentar en README que se debe verificar que los archivos sean accesibles (644) y directorios (755).

- **Riesgo**: el paquete contiene código PHP que, si se deja olvidado, expone estructura interna.  
  **Mitigación**: README debe advertir que es un paquete de prueba y recomendar su eliminación tras la validación.

## Listo para aplicación

Sí. No hay dependencias externas ni cambios en archivos existentes del repo. Se puede proceder a la fase `apply`.
