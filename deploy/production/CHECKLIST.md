# Checklist de producción — /certificados/ (opción A)

Gates manuales. La subida real la ejecuta un humano (Marcos). El agente no toca cPanel ni genera ZIP hasta pedido explícito.

**URL:** `https://ifts14.com.ar/certificados/`  
**Detalle paso a paso:** [`INSTRUCCIONES-SUBIDA.md`](INSTRUCCIONES-SUBIDA.md)

## Phase 0 — Gate PHP (bloqueante)

- [ ] Carpeta `public_html/certificados/api/` creada.
- [ ] `.htaccess-api` con `AddHandler` ea-php84 aplicado.
- [ ] `ping.php` reporta **8.4.x** en `https://ifts14.com.ar/certificados/api/ping.php`.
- [ ] `ping.php` eliminado tras el gate.
- [ ] Si el gate falla → **parar**. No seguir con opción A; abrir plan opción C.

## Phase 1 — Antes de subir el paquete completo

- [ ] Ventana y backup de `public_html/certificados/` acordados (si ya existe).
- [ ] DB **producción** nueva (no reutilizar staging); usuario dedicado.
- [ ] Migraciones `001`→`015` aplicadas en DB prod; esquema vacío de negocio.
- [ ] Config externa **prod** fuera del webroot (bootstrap + `CERTIFICADOS_CONFIG_PATH`; **no** `SetEnv`).
- [ ] `.user.ini` en `certificados/api/` apunta al bootstrap prod (no tocar el de staging).
- [ ] `admin_username` + `admin_password_hash` + TTL **14400** / **28800**.
- [ ] `token_encryption_key` y `dni_cipher_key` **nuevos** (32 bytes decode); no reutilizar staging.
- [ ] `public_base_url=https://ifts14.com.ar/certificados`.
- [ ] Paths de storage/runtime fuera del webroot, escribibles (`0700` dirs).
- [ ] `vendor/` generado local con `composer install --no-dev` (host sin Composer).
- [ ] Entrega manual (sin SMTP automático) confirmada.

## Phase 2 — Paquete local

- [ ] Build `production` (`baseHref` `/certificados/`); verificar `href="/certificados/"` en `index.html`.
- [ ] Backend sin secretos versionados; `vendor/` solo en artefacto operativo.
- [ ] Plantillas `.htaccess` de [`deploy/production/`](./).
- [ ] Scan del paquete: sin `.env`, passwords, dumps, `public_html/` anidado, ZIPs de staging.

## Phase 3 — Subida (manual)

- [ ] Backup remoto de `certificados/` (si aplica).
- [ ] Extraer front sobre `public_html/certificados/`.
- [ ] Extraer API sobre `public_html/certificados/api/` **conservando** `.user.ini`.
- [ ] Verificar `.htaccess` root + api.
- [ ] Permisos: config externa `0600`, dirs runtime `0700`.

## Phase 4 — Smoke

- [ ] `GET /certificados/api/health` → 200.
- [ ] Deny/bloqueo a `/certificados/api/src/` (no código fuente).
- [ ] Login admin OK; mutación con CSRF OK.
- [ ] Emisión o entrega manual de un certificado de prueba; validación pública `/certificados/validar/…`.
- [ ] Cookie admin con `Path=/certificados/` (nombre esperado `ifts14_cert_admin`).

## Rollback

Restaurar backup de `public_html/certificados/` o retirar la carpeta nueva. **No tocar** staging (`certificados_staging` / `certificados_qa`). **No** aplicar scripts `LIMPIA-*.sql` de staging sobre prod.
