# Deploy

Mapa operativo para deploy cPanel del módulo `/certificados/`.

## Guía vigente

- Procedimiento manual principal: [`docs/deploy/00-cpanel-certificados.md`](../docs/deploy/00-cpanel-certificados.md).
- Staging documental: [`docs/deploy/01-staging-cpanel-certificados.md`](../docs/deploy/01-staging-cpanel-certificados.md), para preparación futura bajo `/certificados_staging/`.
- Alcance de este ciclo: documentación y criterios de validación; no se ejecuta deploy ni se sube contenido al servidor.

> Producción usa `/certificados/`. Staging usa `/certificados_staging/`. No mezclar rutas, configuración ni smoke checks entre ambos entornos.

## Artefactos permitidos

- Documentación de deploy.
- `.htaccess` o ejemplos revisables sin secretos.
- Paquetes de smoke test ficticios y controlados, cuando un ciclo SDD los apruebe.
- Archivos `.example` sin configuración real.

## Artefactos prohibidos

- Paquetes comprimidos descargados del servidor.
- Copias de resguardo de cPanel o de base de datos.
- Credenciales, tokens, peppers o claves privadas.
- Configuraciones reales de conexión.
- Dumps SQL, logs productivos y material privado fuera de versión.

Si un archivo no es claramente seguro para versionar, no se agrega a esta carpeta.
