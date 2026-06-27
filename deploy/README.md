# Deploy

Mapa operativo para deploy cPanel del módulo `/certificados/`.

## Guía vigente

- Procedimiento manual principal: [`docs/deploy/00-cpanel-certificados.md`](../docs/deploy/00-cpanel-certificados.md).
- Alcance de este ciclo: documentación y criterios de validación; no se ejecuta deploy ni se sube contenido a `public_html`.

## Artefactos permitidos

- Documentación de deploy.
- `.htaccess` o ejemplos revisables sin secretos.
- Paquetes de smoke test ficticios y controlados, cuando un ciclo SDD los apruebe.
- Archivos `.example` sin configuración real.

## Artefactos prohibidos

- Zips descargados del servidor.
- Backups de cPanel o de base de datos.
- Credenciales, tokens, peppers o claves privadas.
- Configuraciones reales de conexión.
- Dumps SQL, logs productivos y material privado fuera de versión.

Si un archivo no es claramente seguro para versionar, no se agrega a esta carpeta.
