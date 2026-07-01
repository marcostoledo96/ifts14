# Propuesta: preparación de staging real en cPanel

## Intención

Preparar una ejecución real de staging bajo `/certificados_staging/` sin tocar cPanel desde el agente. La exploración detectó prefijos productivos hardcodeados en PHP y Angular; si no se corrigen antes del paquete, staging puede responder 404 o consumir `/certificados/` productivo.

## Alcance

### Incluye
- Cambios mínimos locales para soportar `/certificados_staging/` en backend PHP y build Angular.
- Artefactos versionables en `deploy/staging/`: manifiesto, `.htaccess` de ejemplo y checklist operativo.
- Actualización del runbook de staging separando preparación local de ejecución manual en cPanel.
- Gates de entrada humana antes de `sdd-apply` y antes de cualquier ejecución real.

### No incluye
- Deploy remoto, uploads, cambios en `public_html`, DB real, SMTP real o cPanel.
- Credenciales, `.env`, dumps, logs, `vendor/` versionado o material privado.
- Automatización completa de ZIP/deploy si el paquete manual documentado alcanza.

## Capacidades

### Nuevas capacidades
- Ninguna.

### Capacidades modificadas
- `deploy-cpanel-certificados`: staging pasa de guía documental a preparación local ejecutable con prefijos de staging, paquete revisable, gates humanos y rollback manual limitado a staging.

## Enfoque

Usar la opción mínima de la exploración: detectar/configurar prefijo de API en PHP para aceptar producción y staging, agregar configuración Angular `production-staging` con `baseHref /certificados_staging/` y `apiBaseUrl /certificados_staging/api`, y documentar el paquete/manual de cPanel sin secretos.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `apps/backend-php/index.php` | Modificado | Normalización de ruta compatible con staging. |
| `apps/frontend-angular/angular.json` | Modificado | Build `production-staging`. |
| `apps/frontend-angular/src/environments/environment.staging.ts` | Nuevo | API real de staging sin tocar producción. |
| `deploy/staging/` | Nuevo | Manifiesto, plantillas `.htaccess`, checklist. |
| `docs/deploy/01-staging-cpanel-certificados.md` | Modificado | Runbook de ejecución manual controlada. |

## Riesgos

| Riesgo | Prob. | Mitigación |
|--------|-------|------------|
| Mezclar staging y producción | Media | Checklist con rutas explícitas y smoke ficticio. |
| Subir secretos o material privado | Baja | Excluir `.env`, dumps, logs, `vendor/` y configs reales. |
| Config externa incompleta | Media | Gate humano para `CERTIFICADOS_CONFIG_PATH`, DB, Composer y SMTP. |

## Plan de reversión

Revertir los cambios locales del PR y retirar `deploy/staging/`. Si Marcos ejecuta staging manualmente luego, rollback limitado a renombrar/restaurar `/certificados_staging/`; nunca tocar `/certificados/`.

## Dependencias

- Confirmación humana de ruta final, ventana cPanel, config externa, DB de staging, backup, Composer y modo SMTP.

## Criterios de éxito

- [ ] La preparación local distingue explícitamente `/certificados/` de `/certificados_staging/`.
- [ ] El paquete/runbook no contiene secretos ni artefactos prohibidos.
- [ ] La ejecución real queda bloqueada hasta aprobación humana explícita.
