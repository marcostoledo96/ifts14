# Checklist de staging — /certificados_staging/

Gates manuales. La subida real la ejecuta un humano (Marcos). El agente no toca cPanel.

## Phase 0 — Antes de subir

- [ ] Ventana y backup de `/certificados_staging/` acordados.
- [ ] Config externa de **staging** (`CERTIFICADOS_CONFIG_PATH` vía `.user.ini` + bootstrap; **no** `SetEnv`).
- [ ] DB staging dedicada; migraciones pendientes identificadas.
- [ ] `admin_username` + `admin_password_hash` + TTL **14400** / **28800**.
- [ ] `token_encryption_key` y `dni_cipher_key` (32 bytes decode) presentes; no registrar valores.
- [ ] `vendor/` generado local con `composer install --no-dev` si el host no tiene Composer.
- [ ] SMTP: seguir en modo manual (sin envío automático) salvo aprobación explícita.

## Phase 1 — Paquete local

- [ ] Build `production-staging` (`baseHref` `/certificados_staging/`).
- [ ] Backend sin secretos versionados; `vendor/` solo en el artefacto ZIP.
- [ ] Plantillas `.htaccess` de root y api.
- [ ] Scan del paquete: sin `.env`, passwords, dumps, `public_html/` anidado.

## Phase 2 — Subida (manual)

- [ ] Backup remoto.
- [ ] Subir front a `certificados_staging/`.
- [ ] Subir API a `certificados_staging/api/`.
- [ ] Verificar `.user.ini` / bootstrap de config.
- [ ] Aplicar migraciones SQL nuevas.
- [ ] Permisos: config `0600`, dirs runtime `0700` cuando aplique.

## Phase 3 — Smoke

- [ ] `GET /certificados_staging/api/health` → 200.
- [ ] Login admin OK; mutación con CSRF OK.
- [ ] Bloqueo `403` a `/api/src/`, vendor, configs.
- [ ] Emisión o entrega manual de un certificado de prueba; validación pública.
- [ ] Si `409 TOKEN_NOT_RECOVERABLE` en datos viejos: backup + `LIMPIA-DATOS-NEGOCIO.sql` **solo staging**, reemitir.

## Rollback

Restaurar backup de `/certificados_staging/` o retirar la carpeta nueva. **No tocar** `/certificados/`.
