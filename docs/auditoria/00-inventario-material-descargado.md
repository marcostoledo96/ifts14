# Inventario de material descargado del servidor

Inventario estructural del material privado local. No incluye contenido de archivos, credenciales, filas SQL, logs ni datos personales.

## Reglas de lectura

- Registrar solo nombres, rutas relativas, tamaños y tipo probable.
- No abrir configuraciones con credenciales ni logs.
- No descomprimir zips.
- No copiar filas de dumps SQL.

## Inventario principal

| Ítem | Ruta relativa | Tamaño | Tipo probable |
|---|---:|---:|---|
| `servidor_original/` | `material_privado_no_versionar/servidor_original/` | 4 KiB | Carpeta de exportación del servidor. |
| `well-known/` | `material_privado_no_versionar/servidor_original/well-known/` | 4 KiB | Raíz descargada del sitio. |
| `db_dumps_originales/` | `material_privado_no_versionar/db_dumps_originales/` | 4 KiB | Dumps SQL originales. |
| `ifts14c8_db.sql` | `material_privado_no_versionar/db_dumps_originales/ifts14c8_db.sql` | 7.2 KiB | Dump SQL sensible. |
| `ifts14c8_dev.sql` | `material_privado_no_versionar/db_dumps_originales/ifts14c8_dev.sql` | 15.5 KiB | Dump SQL sensible. |

## Raíz del sitio descargado

| Ítem | Ruta relativa | Tamaño | Tipo probable |
|---|---:|---:|---|
| `.htaccess` | `.../well-known/.htaccess` | 796 B | Reglas Apache. |
| `.well-known/` | `.../well-known/.well-known/` | 4 KiB | Validaciones ACME u otros desafíos. |
| `3rdpartylicenses.txt` | `.../well-known/3rdpartylicenses.txt` | 21.3 KiB | Licencias del build frontend. |
| `api/` | `.../well-known/api/` | 4 KiB | Backend PHP desplegado. |
| `api.zip` | `.../well-known/api.zip` | 28.7 KiB | Paquete comprimido no inspeccionado. |
| `assets/` | `.../well-known/assets/` | 4 KiB | Recursos estáticos. |
| `browser.zip` | `.../well-known/browser.zip` | 21.2 MiB | Paquete comprimido no inspeccionado. |
| `cgi-bin/` | `.../well-known/cgi-bin/` | 4 KiB | Carpeta cPanel vacía en esta muestra. |
| `chunk-*.js` | `.../well-known/chunk-*.js` | 5.9 KiB a 191.6 KiB | Chunks del build Angular. |
| `error_log` | `.../well-known/error_log` | 725 B | Log sensible no inspeccionado. |
| `favicon.ico` | `.../well-known/favicon.ico` | 14.7 KiB | Ícono del sitio. |
| `ifts-14-backend/` | `.../well-known/ifts-14-backend/` | 4 KiB | Carpeta con `.git/` interno. |
| `index.html` | `.../well-known/index.html` | 19.8 KiB | Entrada del frontend. |
| `main-*.js` | `.../well-known/main-*.js` | 347.6 KiB a 348.8 KiB | Bundles principales del frontend. |
| `media/` | `.../well-known/media/` | 4 KiB | Media emitida por build. |
| `polyfills-*.js` | `.../well-known/polyfills-5CFQRCPP.js` | 33.8 KiB | Polyfills Angular. |
| `prerendered-routes.json` | `.../well-known/prerendered-routes.json` | 18 B | Evidencia de prerender. |
| `styles-*.css` | `.../well-known/styles-*.css` | 25.6 KiB | Estilos compilados. |
| `test-connection.php` | `.../well-known/test-connection.php` | 851 B | Script PHP candidato de prueba de conexión. |

## Backend PHP desplegado

| Ítem | Ruta relativa | Tamaño | Tipo probable |
|---|---:|---:|---|
| `.htaccess` | `.../well-known/api/.htaccess` | 768 B | Reglas Apache para API. |
| `db.php` | `.../well-known/api/db.php` | 203 B | Configuración/conexión sensible no inspeccionada. |
| `config/database.php` | `.../well-known/api/config/database.php` | 1.1 KiB | Configuración sensible no inspeccionada. |
| `anuncios/` | `.../well-known/api/anuncios/` | 4 KiB | Endpoints PHP candidatos. |
| `contacto/` | `.../well-known/api/contacto/` | 4 KiB | Endpoints PHP candidatos. |
| `horarios/` | `.../well-known/api/horarios/` | 4 KiB | Endpoints PHP candidatos. |
| `materias/` | `.../well-known/api/materias/` | 4 KiB | Endpoints PHP candidatos. |
| `posts/` | `.../well-known/api/posts/` | 4 KiB | Endpoints PHP candidatos. |
| `profesores/` | `.../well-known/api/profesores/` | 4 KiB | Endpoints PHP candidatos. |
| `uploads/` | `.../well-known/api/uploads/` | 4 KiB | Carpeta de carga. |
| `error_log` | `.../well-known/api/**/error_log` | 547 B a 17.2 KiB | Logs sensibles no inspeccionados. |

## Assets estáticos

| Ítem | Ruta relativa | Tamaño | Tipo probable |
|---|---:|---:|---|
| `bg-*.webp` | `.../well-known/assets/bg-*.webp` | 81.7 KiB a 2.3 MiB | Imágenes institucionales. |
| `globals/` | `.../well-known/assets/globals/` | 4 KiB | SVG u otros recursos globales. |
| `icons/` | `.../well-known/assets/icons/` | 4 KiB | Íconos. |
| `logos/` | `.../well-known/assets/logos/` | 4 KiB | Logos/redes. |
| `pdf/` | `.../well-known/assets/pdf/` | 4 KiB | PDFs públicos del sitio. |
| `profesores/` | `.../well-known/assets/profesores/` | 4 KiB | Imágenes institucionales por docente; nombres no se replican acá. |
| `media/bg-*.webp` | `.../well-known/media/bg-*.webp` | 81.7 KiB a 1.1 MiB | Media emitida por build. |

## Riesgos estructurales

- `api/config/database.php` y `api/db.php` son archivos con alto riesgo de credenciales; no fueron abiertos.
- `error_log` aparece en raíz y subcarpetas de `api/`; no fue leído.
- `api.zip` y `browser.zip` no fueron descomprimidos.
- `ifts-14-backend/.git/` confirma presencia de Git interno descargado; permanece bajo material privado ignorado.
