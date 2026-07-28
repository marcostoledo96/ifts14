# IFTS14 — Certificaciones QR

Módulo de certificaciones de curso con validación pública por QR/link, integrado en la web del IFTS N.° 14.

```txt
Staging (entorno de trabajo):  /certificados_staging/
Producción (aún no activada):  /certificados/
```

## Stack

```txt
Frontend: Angular 20
Backend:  PHP 8.4.22 (CGI/FastCGI en staging)
Base:     MariaDB 10.6.27
Hosting:  cPanel
```

## Estado actual

| Entorno | Estado |
|---|---|
| Staging (`/certificados_staging/`) | Operativo; es el entorno de trabajo diario. |
| Producción (`/certificados/`) | Aún no activada ni validada para este módulo. |

El producto admin cubre: login con sesión, cursos, alumnos, fechas, asistencias, emisión, expediente, PDF/QR, entrega manual, revocación y configuración institucional (firmas). La validación pública muestra el certificado vigente o revocado.

## Decisiones vigentes (D0)

| Tema | Regla |
|---|---|
| QR / token | Permanente. Actualizar, reenviar o regenerar PDF **no** rota el token/QR. Solo revocación explícita o regeneración excepcional auditada lo invalidan. |
| DNI en UI | Completo en validación pública y en listados/detalle/expediente admin. Logs, auditoría, errores y dumps **no** exponen DNI ni token completos. |
| Certificado | De curso, con fechas asistidas del alumno. |
| Auth admin | Sesión PHP (cookie `HttpOnly`/`Secure`/`SameSite=Strict`) + CSRF. `X-Admin-Key` solo CLI/smokes server-side; no autoriza HTTP. |
| Email | Campo opcional en alumno. Entrega manual (copiar link / descargar PDF). SMTP automático aún no definido. |
| PDF | Hay dos salidas válidas: folio Angular y PDF TCPDF del backend. El instituto elige cuál usar. |
| Composer | Si no hay Composer en cPanel, `vendor/` se genera local y se sube como artefacto; nunca se versiona. |
| Firmantes | Rector/a y Asesor/a Pedagógica vía configuración institucional. |

## Cómo empezar

1. Leer [`GUIA.md`](GUIA.md) (onboarding humano).
2. Ver el índice [`docs/00-indice-general.md`](docs/00-indice-general.md).
3. Levantar entorno local: [`docs/05-desarrollo-local.md`](docs/05-desarrollo-local.md).
4. Revisar qué ya está hecho: [`docs/03-changelog.md`](docs/03-changelog.md).
5. Ver pendientes recomendados: [`docs/04-roadmap.md`](docs/04-roadmap.md).

Para agentes IA: [`AGENTS.md`](AGENTS.md) y prompts en [`docs/opencode/`](docs/opencode/).

## Responsables

| Rol | Alcance |
|---|---|
| Marcos | Backend PHP, MariaDB, integración, deploy cPanel, arquitectura, seguridad, documentación. |
| Matías | UI/UX Angular 20, port visual desde `muestra_pagina/`, admin, responsive, a11y, QA visual. |

## Carpetas principales

| Carpeta | Uso |
|---|---|
| `apps/frontend-angular/` | SPA Angular 20. |
| `apps/backend-php/` | API PHP. |
| `database/` | Migraciones SQL y seeds ficticios. |
| `docs/` | Documentación humana y de agentes. |
| `openspec/` | Specs por módulo (recomendadas para cambios no triviales). |
| `deploy/` | Artefactos y checklists de deploy (sin secretos). |
| `muestra_pagina/` | Referencia visual v0. No compilar ni portar React/Next literalmente. |
| `scripts/` | Scripts auxiliares seguros. |
| `material_privado_no_versionar/` | Material del servidor. **Nunca** versionar. |

## Seguridad

No subir al repositorio: dumps SQL reales, backups, ZIPs del servidor, logs, credenciales, `.env`, configs reales de conexión, ni `.codegraph/`.

## Lectura mínima por área

| Área | Documento |
|---|---|
| Deploy staging | [`docs/deploy/01-staging-cpanel-certificados.md`](docs/deploy/01-staging-cpanel-certificados.md) |
| API | [`docs/backend/API.md`](docs/backend/API.md) y contrato en [`docs/backend/01-contrato-api-certificados.md`](docs/backend/01-contrato-api-certificados.md) |
| Frontend | [`docs/frontend/00-angular20-port-v0.md`](docs/frontend/00-angular20-port-v0.md) |
| Base de datos | [`docs/database/00-mariadb.md`](docs/database/00-mariadb.md) |
| QA manual | [`docs/qa/CHECKLIST-TESTING-MANUAL.md`](docs/qa/CHECKLIST-TESTING-MANUAL.md) |
