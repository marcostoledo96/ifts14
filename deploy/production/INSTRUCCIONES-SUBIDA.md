# Instrucciones de subida — producción `/certificados/` (opción A)

Guía operativa para el operador (humano). El agente no ejecuta cPanel, no genera ZIP hasta pedido explícito y no hace land `staging1.0`→`main` sin OK.

**URL objetivo:** `https://ifts14.com.ar/certificados/`  
**Document root efectivo:** `public_html/certificados/`  
**Plantillas:** `.htaccess-root`, `.htaccess-api` en esta carpeta.  
**Gates:** [`CHECKLIST.md`](CHECKLIST.md) · [`MANIFIESTO.md`](MANIFIESTO.md) · guía [`docs/deploy/00-cpanel-certificados.md`](../../docs/deploy/00-cpanel-certificados.md)

Si el **gate PHP** falla, **parar**. No mezclar con opción C en el mismo deploy; ver apéndice en la guía `00-cpanel`.

---

## 0) Gate PHP (antes de todo el paquete)

El dominio principal suele estar en PHP 8.1. Producción debe forzar **ea-php84** por carpeta (mismo patrón que staging).

1. Crear `public_html/certificados/api/` (vacía alcanza).
2. Subir un `ping.php` mínimo:

```php
<?php
header('Content-Type: text/plain; charset=utf-8');
echo 'PHP_VERSION=' . PHP_VERSION . PHP_EOL;
```

3. Copiar `deploy/production/.htaccess-api` como `public_html/certificados/api/.htaccess` (incluye `AddHandler application/x-httpd-ea-php84`).
4. Abrir `https://ifts14.com.ar/certificados/api/ping.php`.
5. **PASS** = respuesta con `8.4.x`. **FAIL** = sigue `8.1` u otra → no seguir con opción A; reabrir plan opción C (subdominio).
6. **Borrar** `ping.php`. No dejarlo en el webroot.

---

## 1) Base de datos nueva (separada de staging)

En cPanel → MySQL® Databases:

1. Crear DB (nombre tipo `<cpanel_prefix>_cert_prod` — el prefijo lo impone cPanel).
2. Crear usuario dedicado; privilegios solo sobre esa DB.
3. **No** reutilizar la DB ni las credenciales de staging (`*_cert_stg` u equivalentes).
4. Aplicar migraciones `database/migrations/001` → `015` en orden sobre la DB nueva (phpMyAdmin o CLI local contra el host remoto si hay acceso). Verificar versión/esquema con el script o checklist SQL del paquete.
5. Empezar **vacía** (sin copiar filas de staging). Firmas y PDFs se regeneran en prod.

**Prohibido:** scripts `deploy/staging/LIMPIA-*.sql` contra producción.

---

## 2) Config externa (fuera del webroot)

Este host **no** tiene `mod_env`: no usar `SetEnv`. Patrón canónico: `.user.ini` + `auto_prepend_file`.

Estructura sugerida (ajustar `<user>` al home real de cPanel):

```txt
/home/<user>/ifts14_config/          # 0700
  certificados-production.php        # secretos REALES — nunca Git
  bootstrap-certificados-prod.php    # putenv CERTIFICADOS_CONFIG_PATH (NO solo define())
```

Ejemplo de bootstrap (valores de path reales solo en el servidor).

`Config::load()` lee **`getenv('CERTIFICADOS_CONFIG_PATH')`**, no la constante PHP.
Un `define()` solo deja la API apuntando al path demo inexistente → login **401** silencioso.

```php
<?php
declare(strict_types=1);

$path = '/home/<user>/ifts14_config/certificados-production.php';

putenv('CERTIFICADOS_CONFIG_PATH=' . $path);
$_ENV['CERTIFICADOS_CONFIG_PATH'] = $path;
$_SERVER['CERTIFICADOS_CONFIG_PATH'] = $path;
```

En `public_html/certificados/api/.user.ini` (**crear solo para prod**; no sobrescribir el de staging):

```ini
auto_prepend_file = "/home/<user>/ifts14_config/bootstrap-certificados-prod.php"
```

Campos obligatorios en `certificados-production.php` (valores **nuevos** de prod; estructura en `apps/backend-php/config/certificados-config.example.php`):

| Campo | Regla |
|---|---|
| `db_*` | DB prod nueva |
| `admin_username` / `admin_password_hash` | bcrypt nuevo |
| `admin_session_idle_seconds` | **14400** exacto |
| `admin_session_absolute_seconds` | **28800** exacto |
| `public_base_url` | `https://ifts14.com.ar/certificados` |
| `token_pepper`, `token_encryption_key`, `dni_cipher_key` | **claves nuevas**; keys de cifrado = 32 bytes decode |
| `certificate_storage_path`, `signature_storage_path`, `rate_limit_storage_path` | absolutos fuera de webroot, escribibles |
| `admin_legacy_key_enabled` | `false` en producción |

Permisos: directorio config `0700`; archivo config `0600`.

---

## 3) Build y paquete local

1. Frontend:

```bash
cd apps/frontend-angular
ng build --configuration production
```

Verificar en `dist/frontend-angular/index.html` que el `base href` sea `/certificados/`.

2. Backend: `composer install --no-dev --no-interaction` en `apps/backend-php/` (incluir `vendor/` solo en el artefacto operativo ZIP; no versionar).

3. Armar árbol según [`MANIFIESTO.md`](MANIFIESTO.md): FE en `certificados/`, API en `certificados/api/`, plantillas `.htaccess` de esta carpeta.

4. Scan: sin `.env`, dumps, configs reales, ZIPs de staging, `public_html/` anidado.

**ZIP:** solo cuando el operador lo pida explícitamente. Este documento no genera el ZIP.

---

## 4) Subida en cPanel

1. Backup de `public_html/certificados/` si ya existe contenido.
2. Extraer FE en `public_html/certificados/` + `.htaccess` desde `.htaccess-root`.
3. Extraer API en `public_html/certificados/api/` + `.htaccess` desde `.htaccess-api`.
4. **Conservar** `.user.ini` de prod (no pisarlo con un archivo vacío del ZIP).
5. Confirmar que no quedó `ping.php`.

---

## 5) Smoke

| Check | Esperado |
|---|---|
| `GET https://ifts14.com.ar/certificados/api/health` | 200 JSON |
| `GET …/api/src/` (o archivo bajo `src/`) | bloqueado (403/404 controlado; sin fuente) |
| Login admin | OK; cookie `ifts14_cert_admin` con `Path=/certificados/` |
| Mutación admin | CSRF OK |
| Emitir / entrega manual → PDF → `/certificados/validar/…` | flujo completo |

Si algo falla: rollback = restaurar backup o retirar la carpeta. **No tocar** staging.

---

## Qué no hacer

- No apuntar prod a la DB de staging.
- No reutilizar `token_encryption_key` / `dni_cipher_key` de staging.
- No usar `SetEnv`.
- No activar/anunciar producción hasta gate PHP + smoke verdes.
- No merge L1 (`staging1.0`→`main`) sin OK explícito del operador.
- No generar ZIP hasta pedido explícito.
