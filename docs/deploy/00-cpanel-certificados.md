# Deploy cPanel — /certificados/

> **Estado:** staging operativo y en uso diario. **Producción** (`https://ifts14.com.ar/certificados/`) en **preparación opción A** (path bajo el dominio principal + PHP 8.4 por carpeta). Plantillas y checklist: [`deploy/production/`](../../deploy/production/). **No activada** hasta gate PHP + smoke verdes. Sin ZIP ni land a `main` sin OK explícito del operador.

## Entorno real de staging (P8-01)

| Recurso | Valor |
|---|---|
| Subdominio | `certificados-qa.ifts14.com.ar` |
| Document root | `/public_html/certificados_qa/` |
| Backend | `/certificados_staging/api/` |
| PHP | 8.4.22 (ea-php84, CGI/FastCGI) |
| MariaDB | 10.6.27 (`ifts14c8_cert_stg`) |
| Config externa | `/home/ifts14c8/ifts14_config/` (0700) |
| Sesiones | files, strict_mode=1, use_only_cookies=1, use_trans_sid=0 |

### Config admin — reglas no negociables

| Campo | Valor obligatorio | Nota |
|---|---|---|
| `admin_username` | string | Ej: `bedelia_admin` |
| `admin_password_hash` | bcrypt | `password_hash()` |
| `admin_session_idle_seconds` | **14400** exacto (4 h) | `Config::adminSessionSettings()` compara igualdad estricta |
| `admin_session_absolute_seconds` | **28800** exacto (8 h) | Cualquier otro valor → login 401 silencioso |
| `CERTIFICADOS_CONFIG_PATH` | path al `.php` de config | **Nunca `IFTS14_CONFIG_PATH`** — ese nombre no lo lee el código |

### Lecciones del entorno

1. **SetEnv NO funciona.** `mod_env` no está habilitado → usar `.user.ini` + `auto_prepend_file`.
2. **No hay Terminal ni SSH.** Todo se prepara local y se sube.
3. **Composer no instalado.** Generar `vendor/` localmente y subir como ZIP.
4. **Dominio principal usa PHP 8.1.** No cambiarlo globalmente.
5. **PHP-FPM no disponible.** CGI/FastCGI funciona correctamente.
6. **Rate-limit login:** 5 intentos / 300s por IP → 429. Borrar bucket `ifts14-admin-login-*.json` en `runtime/` para resetear.
7. **Backend usa envelope `{ data, meta }`.** El frontend debe leer `res.data.*`, no `res.*`. Fix commiteado en `875e3dc`.
8. **TTL admin son fijos (14400/28800).** No son configurables sin cambiar constantes en `Config.php`.
9. **Nunca compartir:** contraseñas, hashes, tokens, DNI, rutas privadas, IPs, credenciales DB.

## Producción — opción A (path `/certificados/`)

Decisión cerrada para la primera activación del módulo en el dominio principal:

| Pieza | Valor |
|---|---|
| URL | `https://ifts14.com.ar/certificados/` |
| Document root efectivo | `public_html/certificados/` (sin subdominio si el gate PHP pasa) |
| FE | `baseHref=/certificados/`, `apiBaseUrl=/certificados/api` (build `production`) |
| Cookie admin | `Path=/certificados/`, nombre `ifts14_cert_admin` |
| PHP | Forzar **ea-php84** en `certificados/api/.htaccess` (`AddHandler`), sin cambiar el PHP 8.1 global del dominio |
| DB / config | **Separadas** de staging; claves de cifrado **nuevas** |
| Plantillas | [`deploy/production/`](../../deploy/production/) (espejo de staging) |
| Runbook operador | [`deploy/production/INSTRUCCIONES-SUBIDA.md`](../../deploy/production/INSTRUCCIONES-SUBIDA.md) |
| Checklist | [`deploy/production/CHECKLIST.md`](../../deploy/production/CHECKLIST.md) |

### Gate PHP (bloqueante)

Antes del paquete completo:

1. Crear `public_html/certificados/api/` y subir un `ping.php` que imprima `PHP_VERSION`.
2. Aplicar `.htaccess-api` de producción (`AddHandler application/x-httpd-ea-php84`).
3. Abrir `https://ifts14.com.ar/certificados/api/ping.php`.
4. **PASS** = `8.4.x` → seguir opción A. **FAIL** = sigue 8.1 u otra → **parar**; ver [Apéndice: contingencia opción C](#contingencia-opcion-c).
5. Borrar `ping.php`.

### DB y config (no mezclar con staging)

- DB nueva (ej. prefijo cPanel + `cert_prod`); usuario dedicado; migraciones `001`→`015` sobre esquema vacío de negocio.
- Config externa bajo `~/ifts14_config/` + bootstrap; `.user.ini` con `auto_prepend_file` en `certificados/api/` (**nunca** `SetEnv`).
- `public_base_url=https://ifts14.com.ar/certificados`; TTL admin **14400** / **28800** exactos.
- No reutilizar `token_encryption_key` / `dni_cipher_key` de staging.

### Qué no hacer en esta preparación

- No apuntar prod a la DB de staging.
- No generar ZIP hasta pedido explícito del operador.
- No land L1 (`staging1.0`→`main`) sin OK explícito.
- No mezclar deploy opción A y opción C en la misma ventana.

## Objetivo

Documentar el deploy manual del módulo en cPanel bajo:

```txt
https://ifts14.com.ar/certificados/
```

Esta guía **no ejecuta la subida**, no toca `public_html`, no crea `.env` con secretos, no instala dependencias en el servidor y no modifica configuraciones reales. El procedimiento operativo revisable está en `deploy/production/`.

### Gates D0 confirmados

| Gate | Regla |
|---|---|
| Staging | `/certificados_staging/` separado de producción `/certificados/`. Ver `docs/deploy/01-staging-cpanel-certificados.md`. |
| Composer/vendor | Gate: si Composer no está disponible en cPanel, generar `vendor/` localmente y subir como artefacto operativo. Nunca versionar `vendor/`. |
| SMTP/Email | Sin flujo de email en el MVP. SMTP/PHPMailer fueron removidos. La entrega es manual: Bedelía copia link y descarga PDF. |
| Auth admin | Sesión PHP nativa con cookie segura y CSRF. `X-Admin-Key` solo CLI/smoke server-side; no autoriza HTTP. |
| Token/QR | Permanente. La entrega manual no rota token. `token_cifrado` (AES-256-GCM, clave externa) habilita recuperación. |
| Clave de cifrado | `token_encryption_key` se inyecta por config externa a Git; debe decodificar (base64/base64url) a 32 bytes exactos. Su pérdida vuelve los certificados existentes no recuperables (`409`). |

### Checklist Composer en cPanel

Antes de asumir que Composer está disponible, verificar en orden:

```bash
which composer
composer --version
php -v
```

- Si `which composer` devuelve una ruta, Composer está disponible por terminal: usar `composer install --no-dev --no-interaction` en el servidor.
- Si no hay terminal o `composer` no se reconoce, revisar en cPanel: **Terminal** (si está habilitado), **Setup Python App**, **Node.js App**, **PHP Composer** (algunos cPanel exponen Composer como sección propia).
- Si ninguna vía está disponible: generar `vendor/` localmente desde `composer.lock` y subirlo como artefacto operativo. **Nunca versionar `vendor/`** en Git. Dejar constancia operativa del fallback usado.

## Estructura esperada en cPanel

```txt
public_html/
└── certificados/
    ├── index.html
    ├── assets/
    ├── .htaccess
    └── api/
        ├── index.php
        ├── .htaccess
        ├── src/
        └── config/
```

| Ruta | Rol | Observación |
|---|---|---|
| `/certificados/` | Raíz pública del frontend Angular. | Debe resolver rutas profundas sin capturar `/api/`. |
| `/certificados/api/` | API PHP pública. | Debe responder endpoints controlados, empezando por `GET /certificados/api/health`. |
| Configuración real | Archivo externo al repo y preferentemente fuera del webroot. | Usar placeholders o `.example`; nunca subir valores reales. |

## Artefactos permitidos y prohibidos

### Permitidos para preparar el paquete futuro

- Build compilado del frontend, generado con base href `/certificados/`.
- Código PHP versionado del backend.
- `.htaccess` revisados para raíz y API.
- Archivos `.example` sin secretos.
- Documentación operativa versionada.

### Prohibidos

- Credenciales, configuraciones reales, tokens, peppers o claves privadas.
- Archivos `.env`.
- Dumps SQL, logs, backups y zips descargados del servidor.
- Material privado fuera de versión o contenidos copiados de auditorías.
- Carpetas `.git` internas provenientes de cPanel.

## Frontend Angular

Cuando el ciclo de frontend habilite el deploy, compilar localmente con:

```bash
ng build --configuration production --base-href /certificados/
```

Subir únicamente el contenido generado de `dist/...` a `public_html/certificados/`. Si todavía no existe frontend productivo, el deploy puede quedar API-only o esperar el ciclo correspondiente; no inventar pantallas para cubrir ese hueco.

## Backend PHP

Subir la API PHP versionada a:

```txt
public_html/certificados/api/
```

La configuración real debe quedar fuera del repositorio y preferentemente fuera del webroot. Para validar certificados, el archivo externo debe devolver un array PHP con las claves reales esperadas por `Config::load()`: `db_host`, `db_name`, `db_user`, `db_pass`, `token_pepper`, `public_base_url` y `certificate_storage_path`; la guía no debe registrar valores reales. Para firmas de autoridades, agregar `signature_storage_path` (fuera del webroot; ver `Config::requireSignatureStoragePath`). Tomar como referencia de estructura el ejemplo versionable `apps/backend-php/config/certificados-config.example.php`, reemplazando sus valores ficticios fuera de Git. Sin `token_pepper`, `public_base_url` o `certificate_storage_path`, `Config::load()` / `requirePdfConfig()` debe fallar de forma segura con error genérico y la API no debe exponer stack traces ni rutas internas. La verificación local del ciclo `backend-validacion-publica-certificados` se ejecutó contra el ejemplo versionable y contra un config ficticio bajo `/tmp`; la configuración productiva permanece fuera de Git.

### Entrega manual (reemplaza al reenvío por email)

El endpoint `GET /admin/certificados/{id}/entrega-manual` entrega el certificado de forma manual: Bedelía copia el link público (`publicValidationUrl`) y descarga el PDF (`pdfDownloadUrl`) por canal externo. No hay email, SMTP, PHPMailer ni transporte `stub|smtp` en el MVP. El endpoint es de solo lectura: no rota token, no modifica estado, no inserta auditoría operativa. El token se descifra en memoria con `token_cifrado` (AES-256-GCM) y clave externa.

#### Dependencias Composer

El backend versiona `apps/backend-php/composer.lock` para fijar `tecnickcom/tcpdf`. `phpmailer/phpmailer` fue removido: no hay flujo de email. La carpeta `vendor/` permanece ignorada por Git y se regenera en deploy con:

```bash
composer install --no-dev --no-interaction
```

No subir `vendor/` al repo; subir el `composer.lock` versionado y ejecutar `composer install` en el servidor (o subir `vendor/` generado localmente solo si el hosting no dispone de Composer, dejando constancia operativa).

#### Clave de cifrado de tokens (externa a Git)

La clave `token_encryption_key` vive en el archivo de configuración externo (nunca en Git). Reglas:

| Clave | Uso |
|---|---|
| `token_encryption_key` | Clave AES-256-GCM (32 bytes exactos, base64/base64url). Habilita descifrar `token_cifrado` para reconstruir `publicValidationUrl`. |
| `token_pepper` | Pepper del hash público (ya existente). |
| `public_base_url` | Base pública absoluta para armar `/validar/{token}`. |
| `certificate_storage_path` | Ruta absoluta del storage de PDFs (fuera del webroot). |
| `signature_storage_path` | Ruta absoluta del storage de firmas de autoridades PNG/JPEG (fuera del webroot). |

Si la clave falta, no decodifica a 32 bytes o el descifrado falla, el endpoint responde `409 TOKEN_NOT_RECOVERABLE` sin regenerar token. La pérdida de la clave vuelve no recuperables los certificados existentes.

#### Rollback de entrega manual

1. Retirar la ruta `GET /admin/certificados/{id}/entrega-manual` del backend (revertir el código).
2. Los certificados y tokens vigentes permanecen válidos: el rollback no toca `cert_certificados` ni `cert_tokens_verificacion`.
3. No reactivar SMTP/PHPMailer sin un nuevo ciclo SDD.
4. La columna `token_cifrado` puede quedar sin uso; no borrar datos cifrados.

#### Gates operativos D0 previos al deploy

Antes de declarar listo el deploy de entrega manual, el operador debe cerrar estos gates con evidencia real o dejarlos explícitamente pendientes:

| Gate | Verificación esperada | Estado local del ciclo |
|---|---|---|
| Composer/vendor | `composer validate --strict` y `composer install --no-dev --no-interaction` desde `composer.lock`; si cPanel no tiene Composer, subir `vendor/` generado localmente como artefacto operativo, nunca versionado. | `composer.lock` actualizado; `vendor/` no se tocó. |
| Migración `002` | Backup aprobado, aplicar `database/migrations/002_token_cifrado_entrega_manual.sql` y verificar `SHOW COLUMNS FROM cert_tokens_verificacion LIKE 'token_cifrado';`. | Sin DB aprobada en esta sesión; gate queda para operador. |
| Migración `005` (prevenir duplicados) | Backup aprobado, ejecutar la consulta preflight incluida en `database/migrations/005_prevenir_certificados_duplicados.sql` (`SELECT alumno_id, curso_id, COUNT(*) ... HAVING COUNT(*) > 1`); debe devolver 0 filas. Si devuelve filas, resolver duplicados vigentes antes de aplicar el `ALTER TABLE` que agrega la columna `certificado_bloqueo_activo` y el índice único `uq_cert_certificados_alumno_curso_activo (alumno_id, curso_id, certificado_bloqueo_activo)`. Verificar con `SHOW INDEX FROM cert_certificados WHERE Key_name = 'uq_cert_certificados_alumno_curso_activo';`. | Sin DB aprobada en esta sesión; gate queda para operador. |
| Smoke DB-backed | `GET /certificados/api/admin/certificados/<id_recuperable>/entrega-manual` debe responder `200`; `<id_legacy>` debe responder `409 TOKEN_NOT_RECOVERABLE`. Usar `X-Admin-Key` real solo fuera de Git y no pegarlo en evidencia. | Sin endpoint/config aprobados en esta sesión; gate queda para operador. |
| `token_encryption_key` | Confirmar presencia externa y decode a 32 bytes sin imprimir el valor. | Sin configuración real aprobada en esta sesión; gate queda para operador. |

### Almacenamiento de PDFs de certificados

`certificate_storage_path` es la ruta absoluta donde se persisten los PDFs generados durante la emisión administrativa. Cada PDF se guarda como `{certificateCode}.pdf` (ej. `CERT-2026-AB12CD34.pdf`); el nombre nunca incluye el token de verificación.

Recomendación preferente: ubicar `certificate_storage_path` **fuera del webroot** (ej. `/home/usuario_demo/certificados_storage/`) para que los PDFs no sean accesibles por URL pública directa. El endpoint administrativo `GET /certificados/api/admin/certificados/{id}/pdf` es la única vía de descarga y exige `X-Admin-Key`.

Alternativa si el hosting obliga a colocar el storage dentro de `public_html`: proteger la carpeta con `.htaccess`:

```apache
Options -Indexes
Deny from all
```

Registrar la excepción con justificación operativa. En ningún caso los PDFs deben listarse ni servirse por URL pública directa.

#### Rollback de PDFs de prueba

Si se revierte el cambio PDF/QR:

1. Eliminar los PDFs ficticios generados en pruebas del storage (identificables por `certificateCode` de prueba).
2. Retirar la ruta `GET /admin/certificados/{id}/pdf` del frontend/backend sin afectar certificados emitidos previamente.
3. Los certificados previos permanecen intactos: el rollback no toca `cert_certificados` ni `cert_tokens_verificacion`.

No requiere migraciones de base.

### Almacenamiento de firmas de autoridades

`signature_storage_path` es la ruta absoluta donde se persisten las firmas imagen (PNG/JPEG) de rector y asesor. Basenames fijos: `rector.png|jpg`, `asesor.png|jpg`. La base solo guarda basename + sha256 (migración `014`).

Recomendación: **fuera del webroot**, espejo de `certificate_storage_path` (ej. `/home/usuario_demo/certificados_firmas/`). No hay URL pública de firmas; el preview es `GET /admin/configuracion-institucional/firmas/{rol}` autenticado.

Tomar la clave del ejemplo versionable `apps/backend-php/config/certificados-config.example.php` y configurarla en el archivo externo (nunca en Git).

#### Rollback de firmas de prueba

1. Vaciar el directorio de firmas de prueba bajo `signature_storage_path`.
2. Revertir código API/FE y, si corresponde, DROP controlado de columnas `*_firma_*` (ver `database/docs/014-firmas-autoridades.md`).
3. **No borrar** PDFs en `certificate_storage_path`: los certificados emitidos permanecen intactos hasta regeneración explícita.

## .htaccess

**Plantillas canónicas de producción:** [`deploy/production/.htaccess-root`](../../deploy/production/.htaccess-root) y [`deploy/production/.htaccess-api`](../../deploy/production/.htaccess-api) (incluye `AddHandler` ea-php84). Copiar esas plantillas en la ventana de activación.

Los fragmentos siguientes son **orientativos y revisables** (histórico de la guía). Validar primero en una carpeta aislada o en una ventana controlada. La regla principal: el fallback SPA de `/certificados/` no debe capturar `/certificados/api/`.

### Separación `base href` vs `apiBaseUrl` (checkpoint M3-06)

| Concepto | Valor | Aplica a | No mezclar con |
|---|---|---|---|
| `base href` Angular | `/certificados/` | Rutas del frontend (SPA, assets, rutas profundas) | URL de la API |
| `apiBaseUrl` frontend | `/certificados/api` | Endpoint de la API PHP consumido por `HttpValidationSource` | Rutas Angular |

- En `ng serve` (desarrollo local), `apiBaseUrl` se resuelve vía `apps/frontend-angular/proxy.conf.json` (`/certificados/api` → `127.0.0.1:8080`); **no** se deriva de `baseHref`.
- En cPanel, `base href /certificados/` resuelve rutas Angular y `apiBaseUrl /certificados/api` resuelve la API PHP pública bajo la misma carpeta, sin solaparse.
- `.htaccess` de raíz aplica fallback SPA **solo fuera de `/api/`** (ver regla `RewriteRule ^api(/.*)?$ - [L]` más abajo).

### Raíz `/certificados/.htaccess`

```apache
Options -Indexes
RewriteEngine On
RewriteBase /certificados/

# La API se resuelve en su propia carpeta.
RewriteRule ^api(/.*)?$ - [L]

# Archivos y carpetas reales se sirven directo.
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# Rutas profundas del frontend Angular.
RewriteRule . /certificados/index.html [L]
```

### API `/certificados/api/.htaccess`

```apache
Options -Indexes

RewriteEngine On
RewriteRule ^(src|config)/ - [F,L]

FallbackResource /certificados/api/index.php
```

La regla de denegación para `src/` y `config/` debe ir antes del fallback para que Apache no sirva archivos internos existentes. Si cPanel no respeta `FallbackResource`, reemplazarlo por reglas mínimas equivalentes hacia `index.php`, manteniendo primero la denegación explícita de `src/`, `config/` y cualquier directorio interno que se agregue en el futuro.

## Checklist imprimible

### 1. Antes de subir

- [ ] Confirmar responsable y ventana de aprobación.
- [ ] Confirmar que este ciclo SDD solo prepara documentación: no ejecuta subida.
- [ ] Confirmar ruta pública objetivo: `/certificados/`.
- [ ] Confirmar API bajo `/certificados/api/`.
- [ ] Confirmar que el paquete futuro no contiene `.env`, credenciales, dumps, logs, backups ni zips del servidor.
- [ ] Confirmar que la configuración real queda fuera de Git y preferentemente fuera del webroot.
- [ ] Confirmar backup manual previo desde cPanel File Manager.

### 2. Subida manual futura

- [ ] Subir frontend compilado con base href `/certificados/`, si ya está disponible.
- [ ] Subir backend PHP versionado a `/certificados/api/`.
- [ ] Subir `.htaccess` revisados para raíz y API.
- [ ] No sobrescribir configuración real sin backup y aprobación explícita.
- [ ] No subir material privado ni artefactos descargados del servidor.

### 3. Validación posterior

- [ ] Verificar `GET /certificados/api/health`.
- [ ] Verificar una ruta profunda del frontend fuera de `/api/`.
- [ ] Verificar endpoint público con token ficticio, sin base real ni certificados reales.
- [ ] Confirmar que rutas internas de API no quedan expuestas.
- [ ] Registrar resultado operativo sin pegar secretos ni datos reales.

### 4. Cierre

- [ ] Confirmar si se conserva el deploy o se ejecuta rollback.
- [ ] Documentar hallazgos generales y pendientes.
- [ ] Eliminar paquetes temporales de prueba si se usaron.
- [ ] Mantener backups fuera de Git.

## Backup manual y rollback

### Backup previo

1. Entrar a cPanel File Manager.
2. Ubicar `public_html/certificados/` si existe.
3. Comprimir la carpeta completa desde File Manager.
4. Descargar o mover el backup a una ubicación segura fuera de Git.
5. Registrar nombre, fecha y responsable sin incluir credenciales ni contenido sensible.

### Rollback

1. Detener cambios manuales en curso.
2. Renombrar la carpeta afectada, por ejemplo `certificados_fallido_YYYYMMDD_HHMM`.
3. Restaurar el backup previo en `public_html/certificados/`.
4. Verificar `GET /certificados/api/health` y una ruta pública esperada.
5. Si el rollback falla, no improvisar: conservar evidencia general y volver al responsable técnico.

## Validación con datos ficticios

Usar únicamente valores ficticios y endpoints públicos. Ejemplos de intención verificable:

| Caso | Ruta | Resultado esperado |
|---|---|---|
| Health | `GET /certificados/api/health` | `200` con JSON controlado. |
| Token inexistente | `GET /certificados/api/certificados/TOKEN_FICTICIO/verificacion` | Respuesta pública controlada, sin datos reales ni stack trace. |
| Consulta pública | `POST /certificados/api/certificados/consulta` | Validación controlada con payload ficticio. |
| Ruta frontend | `GET /certificados/validar/TOKEN_FICTICIO` | Fallback SPA, sin pasar por `/api/`. |
| Archivo interno | Ruta interna de `src/` o `config/` | No expuesto públicamente. |

No usar base real, certificados reales, DNI reales, logs productivos ni capturas con información sensible durante este ciclo.

## Seguridad

- No subir credenciales al repo.
- No tocar `public_html` sin backup.
- No sobrescribir la web oficial.
- Probar primero en carpeta aislada.
- No crear `.env` ni configuración real versionada.
- No copiar contenidos privados a la documentación.

## Trazabilidad OpenSpec

| Requisito | Sección verificable |
|---|---|
| Checklist manual previo | `Checklist imprimible` |
| Exclusiones de no subida | `Objetivo`, `Artefactos permitidos y prohibidos`, `Checklist imprimible` |
| Guardia de material privado | `Artefactos permitidos y prohibidos`, `Seguridad` |
| Rutas `.htaccess` para API | `.htaccess` |
| Configuración externa con placeholders | `Backend PHP`, `Artefactos permitidos y prohibidos` |
| Backup y rollback manual | `Backup manual y rollback` |
| Validación posterior con datos ficticios | `Validación con datos ficticios` |

## Quality gates de CI (frontend)

El job `frontend-tests` de `.github/workflows/backend-tests.yml` ejecuta 6 pasos en cada PR contra frontend, en este orden:

1. `npm ci`.
2. `npm run test:ci` (Karma headless + guarda `no-focused-tests.mjs`).
3. `npx tsc --noEmit -p tsconfig.app.json` (TypeScript estricto).
4. `npm run build` (build AOT de producción, `baseHref=/certificados/`).
5. `npm run build -- --configuration production-staging` (build AOT de staging, `baseHref=/certificados_staging/`).
6. `node scripts/ci-mock-guard.mjs` (verifica `useRealApi === true` en `environment.ts`).

Contrato vigente: el job solo se marca como `success` si los pasos 2, 3 y 4 pasan (contrato de 3 pasos núcleo). Un fallo en cualquier paso impide el merge. Spec canónica: `openspec/specs/frontend-ci-quality-gates/spec.md`. Detalle del ciclo en `openspec/changes/archive/2026-07-16-p7-01-frontend-ci/`.

**Branch protection**: la regla `Require status checks to pass before merging` para el check `frontend-tests` debe configurarse manualmente en GitHub (Settings → Branches → Branch protection rules). El script de CI no la aplica; queda como tarea operativa de Marcos o Matías.

**ESLint**: diferido a un ciclo posterior. No es parte de los gates vigentes.

## Quality gates de CI (backend)

El job `php-tests` de `.github/workflows/backend-tests.yml` ejecuta los quality gates de backend en cada PR contra código PHP, en este orden (resumen operativo; detalles del paso exacto en el YAML):

1. Build de la imagen PHP 8.4 (`docker build -t ifts14-php84 -f docker/php84/Dockerfile .`).
2. `composer install` desde `composer:2` con `--no-dev --no-interaction --prefer-dist`.
3. `composer validate --strict` — falla si `composer.json` o `composer.lock` no son válidos.
4. `composer audit` — falla si hay advisories de seguridad en dependencias.
5. Unit tests (sin DB): 12/12 tests PHP procedimentales.
6. E2E con MariaDB 10.6: 11/11 tests PHP procedimentales.
7. `php -l` sobre todo `apps/backend-php/**/*.php` (excluyendo `vendor/`) — falla ante cualquier error de sintaxis.
8. `scripts/test-privacy-headers.sh` (verifica `Referrer-Policy`, `X-Robots-Tag`, etc.).

Contrato vigente: el job se marca como `success` solo si composer validate, composer audit, los 12 unit tests, los 11 E2E con MariaDB, `php -l` y la guarda de privacy headers pasan. Un fallo en cualquier paso impide el merge. Spec canónica: `openspec/specs/backend-ci-quality-gates/spec.md`. Detalle del ciclo en `openspec/changes/archive/2026-07-16-p7-02-backend-ci/`.

PHPUnit/Pest, cobertura de código y reestructuración del workflow se difieren a ciclos posteriores y no forman parte de estos gates.

## Quality gates de CI (MariaDB)

El job `php-tests` de `.github/workflows/backend-tests.yml` ejecuta los quality gates de MariaDB 10.6 contra el service container del workflow, en este orden (resumen operativo; detalles del paso exacto en el YAML):

1. `mariadb-client` instalado vía `apt-get` en el runner Ubuntu (la imagen PHP 8.4 `ifts14-php84` no incluye el cliente).
2. `database-setup` (paso nuevo) — aplica las 10 migraciones `001.sql`–`010.sql` en orden numérico vía `mariadb` CLI contra el service container en `127.0.0.1:3306`. Falla con código distinto de `0` ante cualquier error de SQL o de conexión.
3. `Schema contract` (paso nuevo) — ejecuta `apps/backend-php/tests/DatabaseSchemaContractTest.php` (201 líneas) dentro del contenedor PHP 8.4 con las variables de entorno del service container. El test valida 10 tablas, columnas (vía substring sobre `INFORMATION_SCHEMA.COLUMNS`), enums (post-006/009) y versiones registradas en `cert_schema_migrations` (007–010). Falla con `exit(1)` si la DB no está disponible.
4. `E2E con MariaDB` — encadena 11/11 tests PHP con `&&`: `SnapshotEmission, HttpEmissionE2e, AdminMasterDataHttp, AdminCertificadosConsultaHttp, Readiness, CertificateRevisionMigration, AttendanceRevision, CourseDateRevision, QrImage, RegenerarPdf, fault-injection-audit`. Ningún test puede hacer SKIP silencioso: 7/7 con guarda de DB usan `fwrite(STDERR, "FATAL: ..."); exit(1);` cuando falta `IFTS14_TEST_DB_DSN` o `ALLOW_RESET≠1`.
5. `Upgrade test` (paso nuevo) — `scripts/test-database-upgrade.sh` (53 líneas, sintaxis validada con `bash -n`). Crea dos contenedores MariaDB descartables, aplica `schema_003_historical.sql` y `schema_003_current.sql`, converge a través de 006–010 y compara con `diff`; sale con `0` solo si ambos convergen a la misma estructura exacta.

Contrato vigente: el job se marca como `success` solo si el paso `database-setup` aplica 10/10 migraciones, el schema contract valida la estructura esperada, los 11 tests E2E pasan sin SKIP y el upgrade test confirma la convergencia de variantes históricas. Un fallo en cualquier paso impide el merge. Spec canónica: `openspec/specs/mariadb-ci-quality-gates/spec.md`. Detalle del ciclo en `openspec/changes/archive/2026-07-16-p7-03-mariadb-ci/`.

PHPUnit/Pest, cobertura de código y refactor de los tests E2E a un framework se difieren a ciclos posteriores y no forman parte de estos gates.

## Quality gates de CI (security/docs)

El job `security-docs-gates` de `.github/workflows/backend-tests.yml` ejecuta los quality gates de seguridad y mantenimiento documental en cada PR, en este orden (resumen operativo; detalles del paso exacto en el YAML):

1. **Gitleaks** (`gitleaks/gitleaks-action@v2`) — escanea el repositorio en busca de secretos versionados. Falla con código distinto de `0` ante cualquier API key, token o private key real. La configuración de allowlist vive en `.gitleaks.toml` versionado en la raíz y cubre `muestra_pagina/` (referencia visual), código de test (`apps/backend-php/tests/**`, `apps/frontend-angular/src/**/*.spec.ts`) y migraciones SQL (`database/migrations/**/*.sql`).
2. **`git diff --check origin/main...HEAD`** — falla si hay errores de whitespace (espacios al final, tabs mezclados, líneas sin newline final). Se ejecuta **antes** de los chequeos documentales para detectar regresiones de formato de forma temprana.
3. **Enlaces internos** (`scripts/ci-link-check.sh`) — verifica que los enlaces internos en `docs/` y `openspec/specs/` apunten a archivos existentes. Falla con código distinto de `0` ante cualquier enlace roto. Los enlaces externos (http/https) quedan fuera del alcance.
4. **Términos obsoletos** (`scripts/ci-obsolete-terms.sh`, rewrite con `awk` para performance) — busca términos obsoletos en docs activas: `SMTP` (como feature activo), `PHPMailer` (como feature activo), `firma digital verificada`, `reenvío automático`, `M4-01B` (como pendiente cuando ya está implementado), `entregado` (como estado), `pendiente-entrega` y `requiere-nueva-entrega`. Aplica filtro de contexto para reducir falsos positivos en frases históricas o de remoción.
5. **OpenSpec sin huérfanos** (`scripts/ci-openspec-orphan-check.sh`) — verifica que no haya carpetas que estén **simultáneamente** activas en `openspec/changes/<nombre>/` y archivadas en `openspec/changes/archive/YYYY-MM-DD-<nombre>/`. Falla con código distinto de `0` ante cualquier huérfano. Un ciclo SDD en curso (no archivado) no es huérfano.

Contrato vigente: el job se marca como `success` solo si los cinco pasos pasan con código `0`. Un fallo en cualquier paso impide el merge. Spec canónica: `openspec/specs/security-docs-ci-gates/spec.md`. Detalle del ciclo en `openspec/changes/archive/2026-07-16-p7-04-seguridad-docs/`.

Los tres scripts (`ci-link-check.sh`, `ci-obsolete-terms.sh`, `ci-openspec-orphan-check.sh`) son POSIX-shellscripts validables con `bash -n` y exit-code explícito. ESLint, hooks de pre-commit, escaneo de `muestra_pagina/` y escaneo de `material_privado_no_versionar/` se difieren a ciclos posteriores y no forman parte de estos gates.

## Estado de capacidad pública

Rate limiting y fault-injection ya fueron implementados y verificados en el ciclo `backend-public-endpoint-hardening` (archivado en `openspec/changes/archive/2026-06-26-backend-public-endpoint-hardening/`):

- **Rate limiting (`429 RATE_LIMITED`)**: aplicado a `GET /certificados/api/certificados/{token}/verificacion` y `POST /certificados/api/certificados/consulta` antes del lookup y la auditoría. Rate limiter de nodo único basado en JSON temporal con `flock()`, bucket hasheado con salt, fail-open ante problemas de storage. Detalle del contrato y limitaciones operativas (NAT, permisos de temporales) en `docs/backend/01-contrato-api-certificados.md`.
- **Auditoría fault-injection**: el `INSERT` en `cert_eventos_auditoria` está envuelto en `try/catch`. Se ejecutó fault-injection en runtime (renombrando la tabla en DB demo ficticia y restaurándola en `finally`) demostrando que la falla de auditoría no rompe las respuestas `200`, `404` ni `400` del contrato público.

Limitación documentada: el rate limiting es de nodo único y no distribuido. Antes de producción conviene confirmar la estrategia si el entorno usa balanceo de carga o múltiples nodos.

## Smoke aislado (`certificados_qa`)

Existe un paquete de humo local en `deploy/cpanel/certificados_qa_smoke/` para validar manualmente que cPanel sirve una carpeta aislada en `public_html/certificados_qa/`, que el fallback de raíz funciona y que la API responde `GET /api/health` sin tocar configuración ni PDO.

- Subida: manual por cPanel File Manager (comprimir el paquete en ZIP y extraer en `public_html/certificados_qa/`).
- No incluye credenciales reales, no valida certificados y no reemplaza al módulo final en `/certificados/`.
- Se debe eliminar `public_html/certificados_qa/` desde File Manager al terminar la prueba.
- Detalle operativo y comandos `curl.exe` en `deploy/cpanel/certificados_qa_smoke/README.md`.

### Resultado del smoke en cPanel real

**Veredicto: REMOTE VERIFY PASSED.** El usuario ejecutó el bloque de pruebas contra `https://ifts14.com.ar/certificados_qa/` y los siete casos respondieron según lo esperado: `200` en raíz y SPA-fallback, `200 application/json` en `/api/health`, `404` JSON controlado en `/api/no-existe`, `403` en `/api/src/Response.php` y `/api/config/certificados-config.example.php` (archivos no expuestos), y `405` con header `Allow: GET` en `POST /api/health`. Evidencia completa en `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/verify-report.md`.

#### Advertencias no bloqueantes

- **Cuerpo HTML en respuestas 403**: cPanel entrega código HTTP 403 correcto y no expone archivos internos; el cuerpo de la respuesta es HTML del sitio principal, no JSON controlado por la API. Severidad WARNING no bloqueante. Mitigación futura opcional: `ErrorDocument 403` propio en `certificados_qa/.htaccess` o `certificados_qa/api/.htaccess`.
- **`php -l` local SKIPPED/BLOCKED**: el entorno local de la sesión de verify no tiene PHP instalado. No es falla del smoke cPanel de este ciclo. Permanece como pendiente para futuros ciclos del backend (p. ej. `backend-base-php-certificados`). No se instaló PHP en este ciclo por decisión explícita.

> Recordatorio: una vez validado, eliminar `public_html/certificados_qa/` desde cPanel File Manager para no dejar el paquete expuesto en producción.

## Hallazgos de auditoría (hipótesis)

- **Observado**: el material original incluye `.htaccess`, `.well-known/acme-challenge/`, `cgi-bin/`, zips de despliegue y logs.
- **Observado**: existe una carpeta con `.git/` interno dentro del material descargado; permanece bajo `material_privado_no_versionar/`.
- **Observado**: `browser.zip` y `api.zip` no fueron descomprimidos por seguridad.
- **Hipótesis**: el sitio actual combina frontend compilado y API PHP en una misma raíz pública compatible con cPanel/Apache.

<a id="contingencia-opcion-c"></a>

## Apéndice: contingencia opción C

Solo si el **gate PHP** de opción A falla (sigue 8.1 u otra versión bajo `/certificados/api/` pese a `AddHandler`).

**No implementar en el mismo deploy que A.** Requiere ciclo de código aparte:

| Cambio | Valor esperado |
|---|---|
| Subdominio | p. ej. `certificados.ifts14.com.ar` |
| Document root | `public_html/certificados` (raíz del vhost) |
| `baseHref` FE | `/` |
| `apiBaseUrl` | `/api` |
| Cookie admin | `Path=/` (nombre de cookie según path de producción root) |
| `normalizePath` / `.htaccess` | `RewriteBase /` (y `/api/`) |
| Build FE | configuración nueva alineada a raíz |

Hasta que se abra ese ciclo: documentar el fallo del gate, conservar staging intacto y no forzar path A con PHP incorrecto.
