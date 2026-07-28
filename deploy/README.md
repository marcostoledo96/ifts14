# Deploy

Mapa operativo cPanel del módulo de certificaciones.

## Guías canónicas (leer estas)

| Documento | Uso |
|---|---|
| [`docs/deploy/00-cpanel-certificados.md`](../docs/deploy/00-cpanel-certificados.md) | Deploy general, lecciones del host, producción vs staging |
| [`docs/deploy/01-staging-cpanel-certificados.md`](../docs/deploy/01-staging-cpanel-certificados.md) | Runbook de staging (entorno de trabajo actual) |
| [`staging/CHECKLIST.md`](staging/CHECKLIST.md) | Gates manuales de subida |
| [`staging/MANIFIESTO.md`](staging/MANIFIESTO.md) | Qué entra en el paquete de staging |

## Entornos

| | Staging | Producción |
|---|---|---|
| Ruta web | `/certificados_staging/` | `/certificados/` |
| Estado | Operativo | No activada para este módulo |
| Config/DB | Dedicadas | Dedicadas cuando se active |

No mezclar rutas, configs ni smokes entre entornos.

## Flujo habitual de staging

1. Build Angular `production-staging`.
2. `composer install --no-dev` local → incluir `vendor/` en el ZIP del API (no versionar).
3. Armar paquete revisable (front + `api/` + `.htaccess`).
4. Backup de la carpeta remota.
5. Subir por File Manager / ZIP.
6. Aplicar migraciones SQL pendientes en DB staging.
7. Smoke: `GET …/api/health`, login, un flujo corto.

Detalle y traps del host (sin `SetEnv`, TTL fijos, envelope API): ver guías en `docs/deploy/`.

## Artefactos permitidos aquí

- Documentación, plantillas `.htaccess`, checklists, manifiestos.
- Scripts SQL de **limpieza de staging** claramente nombrados (nunca contra producción sin decisión explícita).
- Archivos `.example` sin secretos.

## Prohibido versionar

Credenciales, configs reales, dumps, backups, ZIPs descargados del servidor, logs productivos, `vendor/`, `dist/`.
