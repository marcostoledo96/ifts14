# Contexto, decisiones y stack

## Contexto

El IFTS N.° 14 necesita un módulo de certificaciones QR bajo:

```txt
/certificados/            → producción (pendiente de activación)
/certificados_staging/    → staging operativo (entorno de trabajo)
```

Permite emitir certificados de curso con fechas asistidas y validarlos públicamente por QR o link.

## Autores

Desarrollado por **Marcos Ezequiel Toledo** y **Matías Ríos**.

| Persona | LinkedIn |
|---|---|
| Marcos Ezequiel Toledo | [linkedin.com/in/marcos-ezequiel-toledo](https://www.linkedin.com/in/marcos-ezequiel-toledo/) |
| Matías Ríos | [linkedin.com/in/matiasgermanrios](https://www.linkedin.com/in/matiasgermanrios/) |

## Stack confirmado

```txt
Frontend: Angular 20
Backend:  PHP 8.4.22 CGI/FastCGI (verificado en staging)
Base:     MariaDB 10.6.27
Hosting:  cPanel
Gestión DB: phpMyAdmin / MySQL de cPanel
```

## Decisiones vigentes (D0)

| ID | Decisión |
|---|---|
| D0-QR | Token/QR permanente. Actualizar certificado, regenerar PDF o reenviar link **no** rota el token. Solo revocación explícita o regeneración excepcional auditada. |
| D0-DNI | DNI completo en validación pública y UI admin. Logs/auditoría/errores/dumps sin DNI ni token completos. |
| D0-AUTH | Sesión PHP nativa + CSRF. `X-Admin-Key` solo CLI/smokes; no autoriza HTTP. |
| D0-MAIL | Email de alumno opcional. Entrega manual. SMTP futuro sin proveedor elegido. |
| D0-PDF | Folio Angular y TCPDF backend son ambos válidos; el instituto elige el canal de entrega. |
| D0-COMPOSER | `vendor/` no versionado; se puede subir como artefacto si no hay Composer en hosting. |
| D0-FIRMAS | Rector/a y Asesor/a Pedagógica desde configuración institucional. |
| D0-UI | Paridad visual institucional en Angular 20 (sin dependencia de export React/Next en el repo). |

## Principios de implementación

- Código nuevo en `apps/frontend-angular/` y `apps/backend-php/`.
- Tablas nuevas con prefijo `cert_`.
- Configuración real fuera de Git y fuera del webroot.
- Envelope JSON `{ data, meta }` / `{ error, meta }` en la API.
- Specs en `openspec/` recomendadas para cambios no triviales.

## Pendientes abiertos (no bloquean staging)

- Sin proveedor SMTP; plantillas de mail pendientes.
- Gestor de usuarios y roles (reemplazo del admin único por config).
- Importación masiva de alumnos/cursos.
- Activación de producción (operación de Marcos; no es ítem de roadmap de producto).

Ver [`04-roadmap.md`](04-roadmap.md).
