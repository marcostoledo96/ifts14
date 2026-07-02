# Apply progress — backend-entrega-manual-certificados-operational-gates

## Estado

- **Modo**: Standard (`strict_tdd: false`; no hubo implementación funcional nueva).
- **Estrategia**: single PR, presupuesto 800 líneas.
- **Resultado**: cierre operacional parcial con gates exactos para DB/HTTP por falta de entorno aprobado sin secretos.
- **No ejecutado**: stage, commit, push, merge, rebase, deploy, DB real, HTTP smoke real, lectura de `vendor/`, `public_html/`, dumps, logs, secretos o `material_privado_no_versionar/`.

## Resumen ejecutivo

Se cerraron los checks estáticos seguros: Composer quedó validable con `composer validate --strict`, `composer.lock` fue refrescado con `composer update --lock --no-install`, PHPMailer no figura en `composer.json`/`composer.lock`, la migración `002` fue verificada estáticamente y el lint PHP pasó dentro de la imagen Docker `ifts14-php84`. No había `CERTIFICADOS_CONFIG_PATH` ni endpoint smoke aprobado, por lo que la migración real, la confirmación de `token_encryption_key` y los smokes `200`/`409` quedan como gates de operador documentados.

## Tareas completadas

- [x] 1.1 `composer validate --strict`; OK con Docker `composer:2` después de agregar metadata mínima del paquete.
- [x] 1.2 Grep PHPMailer/SMTP/`/reenviar`; broad grep devuelve menciones históricas y notas de ausencia, pero el backend activo fuera de tests y los manifests Composer no tienen PHPMailer.
- [x] 1.3 Migración `002` re-leída y confirmada: `ADD COLUMN token_cifrado VARBINARY(512) NULL` + rollback comentado.
- [x] 1.4 `php -l` sobre `index.php` y `src/*.php`; OK con Docker `ifts14-php84`.
- [x] 1.5 `git status --short`; ejecutado.
- [x] 2.1 `composer update --lock --no-install`; ejecutado sin `install` y sin tocar `vendor/`.
- [x] 2.2 `composer.lock`; diff limitado al `content-hash`.
- [x] 2.3 PHPMailer ausente de `composer.json` y `composer.lock`.
- [x] 2.4 Regeneración de `vendor/` documentada en deploy; `vendor/` no se leyó ni modificó.
- [x] 3.1 DB/env detectado como no disponible en sesión segura.
- [x] 3.4 Gate DB documentado en `docs/database/01-modelo-datos-certificados.md`.
- [x] 4.1 Endpoint/config smoke detectado como no disponible en sesión segura.
- [x] 4.4 Gate HTTP documentado en `docs/backend/00-php84-api.md`.
- [x] 5.1–5.5 Documentación mínima de deploy/staging/backend/database actualizada.
- [x] 5.6 Limpieza editorial de `## Purpose` en `openspec/specs/admin-certificate-delivery/spec.md`.
- [x] 6.1–6.3 Verificación estática, diff/status y handoff a verify.

## Tareas pendientes de operador

- [ ] 3.2 Aplicar `database/migrations/002_token_cifrado_entrega_manual.sql` tras backup aprobado.
- [ ] 3.3 Verificar en DB aprobada: `SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'token_cifrado';`.
- [ ] 3.5 Confirmar `token_encryption_key` externo: presencia y decode a 32 bytes, sin registrar valor.
- [ ] 4.2 Ejecutar smoke recuperable `GET /entrega-manual` → `200` con evidencia redactada.
- [ ] 4.3 Ejecutar smoke legacy `GET /entrega-manual` → `409 TOKEN_NOT_RECOVERABLE` con evidencia redactada.

## Comandos y resultados

| Comando | Resultado |
|---|---|
| `composer validate --strict` en host | BLOCKED: `composer` no instalado. |
| `docker run --rm --volume "$PWD:/workspace" --workdir /workspace/apps/backend-php composer:2 composer validate --strict` | PASS: `./composer.json is valid`. Composer emite warnings no bloqueantes de ownership/version por el mount Docker. |
| `docker run --rm --volume "$PWD:/workspace" --workdir /workspace/apps/backend-php composer:2 composer update --lock --no-install --no-interaction` | PASS: `Nothing to modify in lock file`, `Writing lock file`; actualizó `content-hash`. |
| `git grep -niE 'phpmailer|smtp|/reenviar' -- apps/backend-php ':(exclude)apps/backend-php/tests/*'` | PASS: `no active backend hits outside tests`. Antes del cleanup detectó drift en `apps/backend-php/README.md`, corregido. |
| `git grep -ni 'phpmailer' -- apps/backend-php/composer.json apps/backend-php/composer.lock` | PASS: `PHPMailer absent from composer manifests`. |
| `git grep -nE 'ADD COLUMN token_cifrado VARBINARY\(512\) NULL|Rollback manual seguro|DROP COLUMN token_cifrado' -- database/migrations/002_token_cifrado_entrega_manual.sql` | PASS: líneas esperadas presentes. |
| `php -l ...` en host | BLOCKED: `php` no instalado. |
| `docker run --rm --volume "$PWD:/workspace:ro" --workdir /workspace ifts14-php84 sh -lc 'php -l apps/backend-php/index.php && for f in apps/backend-php/src/*.php; do php -l "$f" || exit 1; done'` | PASS: sin errores de sintaxis en `index.php` y `src/*.php`. |
| `test CERTIFICADOS_CONFIG_PATH` | `CERTIFICADOS_CONFIG_PATH not present`; DB/key gate pendiente. |
| `test CERTIFICADOS_SMOKE_BASE_URL` | `CERTIFICADOS_SMOKE_BASE_URL not present`; HTTP smoke gate pendiente. |
| `git status --short` | PASS: solo cambios versionables esperados y carpeta del cambio SDD sin trackear. |
| `git diff --stat` | 8 archivos modificados antes de `tasks.md`/`apply-progress.md`; diff bajo presupuesto. |

## Archivos cambiados

| Archivo | Acción | Motivo |
|---|---|---|
| `apps/backend-php/composer.json` | Modificado | Metadata mínima (`name`, `description`, `license`) para que `composer validate --strict` pase sin convertir una app interna en paquete publicable. |
| `apps/backend-php/composer.lock` | Modificado | `content-hash` actualizado por `composer update --lock --no-install`. |
| `apps/backend-php/README.md` | Modificado | Eliminado drift operativo de reenvío/SMTP/PHPMailer; documenta entrega manual y lock-only update. |
| `docs/deploy/00-cpanel-certificados.md` | Modificado | Gates D0 previos a deploy: Composer/vendor, migración `002`, smoke DB-backed y clave externa. |
| `docs/deploy/01-staging-cpanel-certificados.md` | Modificado | Gates equivalentes para staging. |
| `docs/backend/00-php84-api.md` | Modificado | Gate HTTP `200`/`409` documentado con comandos redactados. |
| `docs/database/01-modelo-datos-certificados.md` | Modificado | Estado estático de migración `002` y gate de aplicación/verificación DB. |
| `openspec/specs/admin-certificate-delivery/spec.md` | Modificado | Cleanup editorial del `Purpose` heredado. |
| `openspec/changes/backend-entrega-manual-certificados-operational-gates/tasks.md` | Modificado | Checkboxes actualizados con resultados reales. |
| `openspec/changes/backend-entrega-manual-certificados-operational-gates/apply-progress.md` | Creado | Evidencia de apply y handoff. |

## Desviaciones del diseño

- Se modificó `apps/backend-php/composer.json` además de `composer.lock`: era el mínimo necesario para que `composer validate --strict` pase (faltaban `name`, `description` y `license`).
- Se actualizó `apps/backend-php/README.md`: el grep seguro encontró drift activo de documentación backend sobre SMTP/PHPMailer/reenvío. No tocarlo habría dejado evidencia contradictoria.

## Gates abiertos

1. DB real/staging: aplicar/verificar migración `002` solo con backup y acceso aprobado.
2. Config externa: confirmar `token_encryption_key` de 32 bytes sin exponer valor.
3. HTTP smoke DB-backed: ejecutar `200` recuperable y `409 TOKEN_NOT_RECOVERABLE` legacy con `X-Admin-Key` real fuera de Git y evidencia redactada.

## Handoff

- **Siguiente fase recomendada**: `sdd-verify`.
- **Después de verify**: `sdd-archive` para sincronizar deltas canónicos y documentación final.
