# Delta — deploy-cpanel-certificados

## ADDED Requirements

### Requirement: Gates documentados de Composer, SMTP y staging

La documentación DEBE declarar `/certificados_staging/` como ruta de staging, Composer/vendor como gate para dependencias PHP y SMTP de prueba/stub como gate de entrega. Este ciclo NO DEBE ejecutar deploy, tocar cPanel, subir `vendor/` versionado ni configurar SMTP real.

#### Scenario: Gates visibles antes de deploy

- DADO un operador preparando staging o producción
- CUANDO consulta la guía de deploy
- ENTONCES encuentra gates de ruta, backup, Composer/vendor, SMTP de prueba y aprobación humana.
- Y NO encuentra credenciales ni configuración real.

#### Scenario: Ejecución real bloqueada

- DADO que falta confirmar Composer, SMTP o ventana cPanel
- CUANDO se intenta pasar de documentación a ejecución
- ENTONCES la guía DEBE indicar bloqueo por aprobación humana explícita.
- Y NO DEBE automatizar subida ni tocar `public_html`.

## MODIFIED Requirements

### Requirement: Reescritura obligatoria de prefijos productivos en staging

La guía de staging DEBE exigir frontend, API, `.htaccess` y checks backend bajo `/certificados_staging/` y `/certificados_staging/api`, manteniendo `/certificados/` como producción separada.
(Previously: la regla no concentraba todos los gates D0 confirmados.)

#### Scenario: Paquete de staging sin prefijos productivos

- DADO un paquete futuro de staging
- CUANDO se revisa antes de subir
- ENTONCES Angular usa `baseHref /certificados_staging/` y API `/certificados_staging/api`.
- Y `.htaccess` y backend no fuerzan `/certificados/`.
