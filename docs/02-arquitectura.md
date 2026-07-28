# Arquitectura general

## Enfoque

Arquitectura modular simple, pensada para cPanel: pocas capas, responsabilidades claras, sin frameworks backend pesados.

```txt
Browser (Angular SPA)
    │  HTTPS
    ▼
Apache (.htaccess + SPA fallback)
    │
    ├─ /certificados[_staging]/          → estáticos Angular
    └─ /certificados[_staging]/api/      → front controller PHP (index.php)
            │
            ├─ Auth sesión + CSRF
            ├─ Servicios de dominio
            └─ PDO → MariaDB (tablas cert_*)
```

Configuración sensible: archivo PHP fuera del webroot, referenciado por `CERTIFICADOS_CONFIG_PATH` (vía `.user.ini` + `auto_prepend_file`; el host no tiene `mod_env`/`SetEnv` usable).

## Estructura del repo

```txt
apps/frontend-angular/   SPA Angular 20 (features admin + público)
apps/backend-php/        API PHP (index.php + src/)
database/migrations/     SQL versionado
deploy/                  Artefactos y checklists (sin secretos)
docs/                    Documentación
openspec/specs/          Contratos por módulo
muestra_pagina/          Referencia visual v0
```

## Frontend

- Organización por features (`admin/*`, validación pública).
- Servicios HTTP separados de páginas; modelos tipados.
- Build con `baseHref` `/certificados/` o `/certificados_staging/`.
- Diseño inspirado en `muestra_pagina/` sin portar React/Next.

## Backend

- PHP 8.4 + PDO prepared statements.
- Envelope `data/meta` o `error/meta`.
- Token público: hash + pepper; cifrado recuperable solo para entrega/PDF.
- DNI: hash + cifrado; UI puede mostrar completo; logs no.
- Rate limit de login y endpoints públicos sensibles.

## Base de datos

- MariaDB 10.6.27, migraciones `001`…`015`+ bajo `database/migrations/`.
- Prefijo `cert_`.
- Estados de certificado vigentes: `vigente` | `revocado`.

## PDF y QR

| Canal | Origen | Uso |
|---|---|---|
| Folio Angular | html2canvas + jsPDF en admin | Vista/descarga institucional desde expediente |
| PDF backend | TCPDF | Endpoint de descarga administrativa |
| QR PNG | Backend on-demand (`gd`) | Descarga aislada del QR |

Ambos PDF son válidos; el instituto decide cuál entregar.

## Entornos

| | Staging | Producción |
|---|---|---|
| Ruta | `/certificados_staging/` | `/certificados/` |
| Estado | Operativo | No activada para este módulo |
| Config/DB | Dedicadas, separadas | Separadas cuando se active |

## Seguridad (resumen)

- Sin secretos en Git.
- Cookies de sesión endurecidas.
- CSRF en mutaciones admin.
- Bloqueo de acceso HTTP a `src/`, `vendor/`, configs y `.user.ini`.
- No loguear DNI/token completos.
