# Deploy

Mapa operativo cPanel del módulo de certificaciones.

## Guías canónicas (leer estas)

| Documento | Uso |
|---|---|
| [`docs/deploy/00-cpanel-certificados.md`](../docs/deploy/00-cpanel-certificados.md) | Deploy general, lecciones del host, producción opción A vs staging |
| [`docs/deploy/01-staging-cpanel-certificados.md`](../docs/deploy/01-staging-cpanel-certificados.md) | Runbook de staging (entorno de trabajo actual) |
| [`staging/CHECKLIST.md`](staging/CHECKLIST.md) | Gates manuales de subida (staging) |
| [`staging/MANIFIESTO.md`](staging/MANIFIESTO.md) | Qué entra en el paquete de staging |
| [`production/CHECKLIST.md`](production/CHECKLIST.md) | Gates manuales de activación (producción opción A) |
| [`production/INSTRUCCIONES-SUBIDA.md`](production/INSTRUCCIONES-SUBIDA.md) | Runbook operador: gate PHP → DB → config → build → smoke |
| [`production/MANIFIESTO.md`](production/MANIFIESTO.md) | Qué entra en el paquete de producción |

## Entornos

| | Staging | Producción (opción A) |
|---|---|---|
| Ruta web | `/certificados_staging/` | `/certificados/` |
| Estado | Operativo | Preparación (plantillas listas); no activada hasta gate PHP + smoke |
| Config/DB | Dedicadas | Dedicadas (nunca reutilizar staging) |
| Plantillas | [`staging/`](staging/) | [`production/`](production/) |

No mezclar rutas, configs ni smokes entre entornos.

## Flujo habitual de staging

1. Build Angular `production-staging`.
2. `composer install --no-dev` local → incluir `vendor/` en el ZIP del API (no versionar).
3. Armar paquete revisable (front + `api/` + `.htaccess`).
4. Backup de la carpeta remota.
5. Subir por File Manager / ZIP.
6. Aplicar migraciones SQL pendientes en DB staging.
7. Smoke: `GET …/api/health`, login, un flujo corto.

## Flujo de activación producción (opción A)

Detalle en [`production/INSTRUCCIONES-SUBIDA.md`](production/INSTRUCCIONES-SUBIDA.md):

1. Gate `ping.php` → PHP **8.4.x** bajo `/certificados/api/` (si falla → opción C, no seguir).
2. DB prod nueva + migraciones `001`→`015` (vacía de negocio).
3. Config externa + `.user.ini` (sin `SetEnv`); claves de cifrado nuevas.
4. Build Angular `production` + API con `vendor/` local.
5. Subida a `public_html/certificados/`; smoke health/login/emit/validar.
6. ZIP y land a `main` solo con OK explícito del operador.

Detalle y traps del host (sin `SetEnv`, TTL fijos, envelope API): ver guías en `docs/deploy/`.

## Artefactos permitidos aquí

- Documentación, plantillas `.htaccess`, checklists, manifiestos, instrucciones de subida.
- Scripts SQL de **limpieza de staging** claramente nombrados (nunca contra producción sin decisión explícita).
- Archivos `.example` sin secretos.

## Prohibido versionar

Credenciales, configs reales, dumps, backups, ZIPs descargados del servidor, logs productivos, `vendor/`, `dist/`.
