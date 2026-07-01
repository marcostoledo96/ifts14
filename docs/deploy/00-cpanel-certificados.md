# Deploy cPanel — /certificados/

## Objetivo

Preparar el deploy manual futuro del módulo de certificaciones en cPanel, bajo:

```txt
https://ifts14.com.ar/certificados/
```

Este ciclo SDD **no ejecuta la subida**, no toca `public_html`, no crea `.env`, no instala dependencias y no modifica configuraciones reales del servidor. La guía deja el procedimiento revisable para una ventana operativa posterior.

### Gates D0 confirmados

| Gate | Regla |
|---|---|
| Staging | `/certificados_staging/` separado de producción `/certificados/`. Ver `docs/deploy/01-staging-cpanel-certificados.md`. |
| Composer/vendor | Gate: si Composer no está disponible en cPanel, generar `vendor/` localmente y subir como artefacto operativo. Nunca versionar `vendor/`. |
| SMTP | Cuenta de prueba / `stub`. Producción queda gated hasta aprobación. |
| Auth admin | `X-Admin-Key` temporal. Login real es fase posterior. |
| Token/QR | Permanente. El reenvío normal no rota token. |

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

La configuración real debe quedar fuera del repositorio y preferentemente fuera del webroot. Para validar certificados, el archivo externo debe devolver un array PHP con las claves reales esperadas por `Config::load()`: `db_host`, `db_name`, `db_user`, `db_pass`, `token_pepper`, `public_base_url` y `certificate_storage_path`; la guía no debe registrar valores reales. Tomar como referencia de estructura el ejemplo versionable `apps/backend-php/config/certificados-config.example.php`, reemplazando sus valores ficticios fuera de Git. Sin `token_pepper`, `public_base_url` o `certificate_storage_path`, `Config::load()` debe fallar de forma segura con error genérico y la API no debe exponer stack traces ni rutas internas. La verificación local del ciclo `backend-validacion-publica-certificados` se ejecutó contra el ejemplo versionable y contra un config ficticio bajo `/tmp`; la configuración productiva permanece fuera de Git.

### Entrega por email (reenvío administrativo)

El endpoint `POST /admin/certificados/{id}/reenviar` entrega el certificado por email mediante un enlace público de validación. El transporte es configurable y desacoplado: modo `stub` (default, no envía real) y modo `smtp` (PHPMailer con credenciales externas).

#### Dependencias Composer

El backend versiona `apps/backend-php/composer.lock` para fijar `tecnickcom/tcpdf` y `phpmailer/phpmailer`. La carpeta `vendor/` permanece ignorada por Git y se regenera en deploy con:

```bash
composer install --no-dev --no-interaction
```

No subir `vendor/` al repo; subir el `composer.lock` versionado y ejecutar `composer install` en el servidor (o subir `vendor/` generado localmente solo si el hosting no dispone de Composer, dejando constancia operativa).

#### Configuración SMTP externa

Las credenciales SMTP viven en el archivo de configuración externo (nunca en Git). Claves:

| Clave | Uso |
|---|---|
| `delivery_transport` | `stub` (default seguro) o `smtp`. |
| `smtp_host` | Host SMTP. Exigido en modo `smtp`. |
| `smtp_port` | Puerto SMTP (1-65535). Exigido en modo `smtp`. |
| `smtp_username` | Usuario SMTP. Exigido en modo `smtp`. |
| `smtp_password` | Contraseña SMTP. Exigida en modo `smtp`. |
| `smtp_secure` | `tls` (default) o `ssl`. Vacío o cualquier otro valor se rechaza (riesgo de credenciales en claro). |
| `mail_from` | Remitente. Exigido en modo `smtp`. |
| `mail_from_name` | Nombre del remitente (opcional). |
| `public_base_url` | Base pública absoluta para armar `/validar/{token}`. Exigida en modo `smtp`. |

En modo `stub`, el endpoint responde `503 DELIVERY_NOT_CONFIGURED` sin rotar token ni enviar email. En modo `smtp` sin credenciales, también responde `503`. El envío real solo ocurre con modo `smtp` + credenciales válidas.

#### Rollback de entrega por email

1. Cambiar `delivery_transport` a `stub` en la configuración externa (el endpoint pasa a responder `503`).
2. O retirar la ruta `POST /admin/certificados/{id}/reenviar` del backend.
3. Los certificados y tokens vigentes permanecen válidos: el rollback no toca `cert_certificados` ni `cert_tokens_verificacion`.
4. No requiere migraciones de base: la auditoría reutiliza `cert_eventos_auditoria.detalle_seguro`.

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

## .htaccess

Los fragmentos siguientes son **orientativos y revisables**. Validar primero en una carpeta aislada o en una ventana controlada. La regla principal: el fallback SPA de `/certificados/` no debe capturar `/certificados/api/`.

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
