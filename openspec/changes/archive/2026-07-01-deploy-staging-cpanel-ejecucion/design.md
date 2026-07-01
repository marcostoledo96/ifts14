# Diseño: preparación de staging real en cPanel

## Enfoque técnico

Preparar un paquete local revisable para `/certificados_staging/` con el mínimo cambio necesario: el backend debe aceptar `/certificados/api` y `/certificados_staging/api` sin duplicar rutas; Angular debe compilar una variante `production-staging`; y `deploy/staging/` debe dejar plantillas/checklist para ejecución manual en cPanel. No se ejecuta deploy remoto, no se leen secretos, no se toca `public_html` y no se versiona `vendor/`.

Delta spec activo: `openspec/changes/deploy-staging-cpanel-ejecucion/specs/deploy-cpanel-certificados/spec.md`. El diseño implementa esa delta spec y respeta la spec vigente `deploy-cpanel-certificados` sobre staging, prefijos, `.htaccess`, configuración externa, smoke y rollback.

## Gate humano previo a sdd-apply y ejecución real

`sdd-apply` y cualquier ejecución real quedan bloqueados hasta confirmación explícita de Marcos. La confirmación debe cubrir: dominio/ruta final, ventana operativa en cPanel, ruta externa de configuración staging, DB/esquema staging, backup previo, decisión Composer/`vendor/` y modo SMTP (`stub` o SMTP de prueba). Sin esos siete puntos confirmados, este cambio solo puede avanzar como diseño/documentación; ningún agente debe subir archivos, tocar `public_html`, modificar DB real ni acceder a cPanel.

## Decisiones de arquitectura

| Decisión | Opción elegida | Alternativas descartadas | Fundamento |
|---|---|---|---|
| Normalización de API PHP | Hacer `normalizePath()` compatible con `/certificados/api`, `/certificados_staging/api` e `/index.php`. | Duplicar `index.php` por entorno o editar PHP manualmente en cPanel. | Un solo router reduce deriva y evita que staging dependa de cambios manuales peligrosos. |
| Configuración Angular | Agregar `production-staging` con `baseHref: /certificados_staging/` y `fileReplacement` hacia `environment.staging.ts`. | Cambiar `environment.ts` productivo o pasar flags manuales sueltos. | Mantiene producción intacta y deja un comando reproducible. |
| `.htaccess` | Mantener el `.htaccess` productivo y crear plantillas versionables en `deploy/staging/`. | Sobrescribir `.htaccess` real o generar reglas dinámicas. | Las reglas dependen de cPanel; las plantillas son revisables y no ejecutan cambios remotos. |
| Paquete | Documentar manifiesto/checklist, sin script ZIP automático. | Automatización completa de empaquetado. | Para primera ejecución real, el riesgo principal es humano/configuración; un script agrega mantenimiento sin eliminar gates manuales. |

## Flujo de datos

```txt
Build local Angular production-staging
  → dist/frontend-angular/ con base /certificados_staging/
  → cPanel manual: public_html/certificados_staging/
  → SPA consulta /certificados_staging/api
  → .htaccess API enruta a index.php
  → normalizePath() entrega /health o /certificados/... al router
  → Config::load() usa CERTIFICADOS_CONFIG_PATH externo de staging
  → MariaDB/storage/SMTP de staging, definidos por operador
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `apps/backend-php/index.php` | Modificar | Ajustar `normalizePath()` para quitar prefijos `/certificados/api` y `/certificados_staging/api`. |
| `apps/frontend-angular/angular.json` | Modificar | Agregar configuración `production-staging` con `baseHref` de staging y reemplazo de environment. |
| `apps/frontend-angular/src/environments/environment.staging.ts` | Crear | Definir `useRealApi: true` y `apiBaseUrl: '/certificados_staging/api'`. |
| `deploy/staging/MANIFIESTO.md` | Crear | Listar contenido esperado del paquete y exclusiones (`vendor/`, secretos, dumps, logs, backups). |
| `deploy/staging/.htaccess-root` | Crear | Plantilla SPA para `/certificados_staging/` sin capturar `/api/`. |
| `deploy/staging/.htaccess-api` | Crear | Plantilla API con bloqueo de `src/`/`config/` y fallback a `/certificados_staging/api/index.php`. |
| `deploy/staging/CHECKLIST.md` | Crear | Gates manuales: ruta, config externa, DB staging, Composer, SMTP, backup, smoke, rollback. |
| `docs/deploy/01-staging-cpanel-certificados.md` | Modificar | Pasar de guía futura a runbook de preparación local + ejecución manual autorizada. |

## Interfaces / contratos

```ts
// environment.staging.ts
export const environment = {
  useRealApi: true,
  apiBaseUrl: '/certificados_staging/api',
};
```

```php
// normalizePath(): entradas esperadas
/certificados/api/health          => /health
/certificados_staging/api/health  => /health
/index.php/health                 => /health
```

## Estrategia de pruebas

| Capa | Qué probar | Enfoque |
|---|---|---|
| Unit/local | `normalizePath()` con prefijos productivo y staging. | Check PHP mínimo o prueba procedimental existente si aplica. |
| Build | Angular staging compila y usa reemplazo de environment. | `npm run build -- --configuration production-staging`. |
| Integración | API local responde rutas productivas y staging. | PHP built-in server con requests ficticios a `/certificados_staging/api/health`. |
| Runbook | Paquete no lista secretos ni rutas productivas para staging. | Revisión manual contra `MANIFIESTO.md` y `CHECKLIST.md`. |

## Migración / rollout

No hay migración de código productivo ni DB real ejecutada por el agente. Rollout: preparar PR, verificar localmente, esperar aprobación humana, backup de `/certificados_staging/` si existe, subida manual por Marcos, smoke ficticio y rollback limitado a staging.

## Preguntas abiertas

- [ ] Confirmar dominio/ruta final: `/certificados_staging/` en dominio principal o subdominio.
- [ ] Confirmar ruta externa de `CERTIFICADOS_CONFIG_PATH` para staging.
- [ ] Confirmar Composer en hosting o subida operativa de `vendor/` generado fuera de Git.
- [ ] Confirmar si SMTP queda en `stub` o usa SMTP de prueba.
