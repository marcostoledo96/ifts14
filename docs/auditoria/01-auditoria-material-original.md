# Auditoría del material original

Hallazgos estructurales sobre el material descargado. Todo lo indicado es evidencia por nombre, ruta y tamaño; no se inspeccionaron valores sensibles.

## Frontend Angular

- **Observado**: hay `index.html`, `main-*.js`, `chunk-*.js`, `polyfills-*.js`, `styles-*.css` y `3rdpartylicenses.txt`, compatibles con un build Angular publicado.
- **Observado**: `prerendered-routes.json` sugiere que el build usó prerender o salida estática equivalente.
- **Observado**: `assets/` y `media/` contienen recursos institucionales reutilizables, pero cualquier archivo con nombres personales debe tratarse como material sensible.
- **Hipótesis**: el frontend actual puede servir como referencia funcional y visual, pero no debe copiarse literalmente a Angular 20 sin revisar accesibilidad, rutas y contratos.

## Backend PHP

- **Observado**: `test-connection.php` existe en la raíz descargada como candidato de prueba de conexión.
- **Observado**: `api/` contiene subcarpetas por dominio (`anuncios`, `contacto`, `horarios`, `materias`, `posts`, `profesores`) con archivos PHP de operaciones CRUD.
- **Observado**: existen `api/db.php` y `api/config/database.php`; por riesgo de credenciales no fueron abiertos.
- **Observado**: `api.zip` existe y no fue descomprimido.
- **Hipótesis**: el backend original parece una API PHP procedural por recurso, desplegada directamente bajo la carpeta pública.

## Base de datos

- **Observado**: hay dos dumps SQL ignorados: `ifts14c8_db.sql` y `ifts14c8_dev.sql`.
- **Observado**: la extracción DDL limitada identificó tablas académicas, publicaciones, contacto y anuncios. Ver `docs/auditoria/02-hallazgos-dumps-sql.md`.
- **Hipótesis**: existen dos esquemas o etapas distintas: uno de sitio público y otro de desarrollo académico más amplio.
- **Hipótesis**: el futuro módulo de certificaciones debe usar migraciones nuevas y prefijo `cert_`, sin reutilizar dumps reales como fuente versionable.

## Deploy / cPanel

- **Observado**: hay `.htaccess`, `cgi-bin/`, `.well-known/acme-challenge/`, zips de despliegue, logs y carpetas públicas típicas de hosting compartido.
- **Observado**: `browser.zip` y `api.zip` parecen artefactos comprimidos de despliegue; no fueron abiertos.
- **Observado**: `ifts-14-backend/.git/` indica que una carpeta Git interna fue descargada desde el servidor.
- **Hipótesis**: el despliegue actual combina frontend compilado y API PHP en una misma raíz pública, compatible con cPanel/Apache.

## Limitaciones

- No se leyó contenido de logs.
- No se abrieron archivos de configuración o conexión.
- No se descomprimieron zips.
- No se auditó código PHP línea por línea; este ciclo solo documenta estructura y riesgos.
