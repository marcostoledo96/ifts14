# Delta para deploy-cpanel-certificados

## ADDED Requirements

### Requisito: Preparación local ejecutable para staging

El sistema DEBE permitir preparar localmente una instalación revisable para `/certificados_staging/`, manteniendo producción en `/certificados/` sin cambios.

#### Escenario: Build frontend de staging

- DADO el código fuente del frontend
- CUANDO se genere el build de staging
- ENTONCES el frontend DEBE usar `baseHref /certificados_staging/`
- Y DEBE consultar la API en `/certificados_staging/api`.

#### Escenario: API compatible con staging y producción

- DADO una instalación bajo `/certificados_staging/api`
- CUANDO se solicite un endpoint público o de health
- ENTONCES el backend DEBE resolver la ruta sin forzar `/certificados/api`.

### Requisito: Paquete versionable de staging

El repositorio DEBE incluir artefactos versionables de preparación en `deploy/staging/` para que el operador arme el paquete sin secretos ni material prohibido.

#### Escenario: Manifiesto revisable

- DADO un operador que arma el paquete
- CUANDO consulta `deploy/staging/`
- ENTONCES encuentra qué artefactos copiar y cuáles excluir
- Y no encuentra credenciales, dumps, logs, `vendor/` ni configuración real.

#### Escenario: Plantillas de servidor sin secretos

- DADO la preparación de staging
- CUANDO se revisan las plantillas `.htaccess`
- ENTONCES usan rutas de `/certificados_staging/`
- Y no contienen valores privados ni productivos reales.

### Requisito: Gates humanos para ejecución real

La ejecución real en cPanel DEBE quedar bloqueada hasta aprobación humana explícita y NO DEBE ser automatizada por este cambio.

#### Escenario: Gate previo a implementación

- DADO el ciclo antes de `sdd-apply`
- CUANDO falten ruta, ventana cPanel, config externa, DB, backup, Composer o SMTP
- ENTONCES el cambio DEBE quedar pendiente de confirmación humana.

#### Escenario: Sin deploy automatizado

- DADO un agente ejecutando este ciclo
- CUANDO completa la preparación local y documental
- ENTONCES NO DEBE subir archivos, tocar `public_html`, modificar DB real ni acceder a cPanel.

## MODIFIED Requirements

### Requisito: Guía documental de staging separada

La documentación DEBE mantener una guía de staging separada para `/certificados_staging/`, distinguirla del deploy productivo `/certificados/` y describir preparación local ejecutable, paquete revisable, ejecución manual gated y rollback limitado a staging.
(Anteriormente: la guía era solo documental y declaraba staging no ejecutable en el ciclo.)

#### Escenario: Preparación local de staging

- DADO un operador que prepara staging
- CUANDO consulta la documentación de deploy
- ENTONCES encuentra pasos locales para build, paquete, rutas y checklist
- Y distingue staging de producción.

#### Escenario: Ejecución real gated

- DADO una persona que busca ejecutar staging real
- CUANDO consulta la guía
- ENTONCES la guía indica que cPanel, `public_html`, DB real y SMTP real requieren aprobación humana explícita
- Y que el agente no ejecuta esos pasos.
