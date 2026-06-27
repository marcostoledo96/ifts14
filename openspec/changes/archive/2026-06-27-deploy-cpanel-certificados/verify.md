# Verification Report: deploy/cpanel-certificados (M3-05)

## Resultado

| Campo | Valor |
|---|---|
| Cambio | `deploy/cpanel-certificados` |
| Modo | `hybrid` |
| Veredicto | `PASS WITH WARNINGS` |
| Alcance verificado | Documentación manual de deploy cPanel para `/certificados/`, sin subida ni ejecución real. |

## Resumen ejecutivo

La verificación documental pasa. La guía de deploy y el mapa de `deploy/` cubren los requisitos de la spec activa: checklist imprimible, exclusiones de no subida, guardia de material privado, separación de `/certificados/` y `/certificados/api/`, configuración externa con placeholders, backup/rollback y validación con datos ficticios.

No se ejecutó deploy real, no se tocó `public_html`, no se creó `.env`, no se usó base real, no se instalaron dependencias y no se leyó material privado. El veredicto queda en `PASS WITH WARNINGS` porque el workspace conserva estado local fuera de alcance (`.codegraph/` sin versionar e `material_privado_no_versionar/` ignorado) y porque la compatibilidad real con cPanel queda explícitamente fuera de este ciclo.

## Artefactos revisados

| Artefacto | Resultado |
|---|---|
| `openspec/changes/deploy-cpanel-certificados/specs/deploy-cpanel-certificados/spec.md` | Leído y contrastado. |
| `openspec/changes/deploy-cpanel-certificados/tasks.md` | Leído; todos los checks están marcados. |
| Engram `sdd/deploy-cpanel-certificados/apply-progress` | Leído; confirma apply exitoso y alcance documental. |
| `openspec/changes/deploy-cpanel-certificados/proposal.md` | Leído como contexto SDD. |
| `openspec/changes/deploy-cpanel-certificados/design.md` | Leído como diseño vigente. |
| `docs/deploy/00-cpanel-certificados.md` | Revisado contra spec, diseño y contratos de ruta. |
| `deploy/README.md` | Revisado como mapa operativo. |
| `openspec/specs/deploy-cpanel-certificados/spec.md` | Revisado; coincide con la spec activa del cambio. |
| `docs/backend/00-php84-api.md` y `docs/backend/01-contrato-api-certificados.md` | Revisados solo para confirmar rutas documentales de API. |

## Completitud de tareas

| Grupo | Estado | Evidencia |
|---|---:|---|
| Phase 1 — Guía operativa | PASS | `docs/deploy/00-cpanel-certificados.md` contiene objetivo, estructura, exclusiones, `.htaccess`, checklist, backup/rollback, validación y pendientes. |
| Phase 2 — Mapa `deploy/` | PASS | `deploy/README.md` enlaza la guía vigente y lista artefactos permitidos/prohibidos. |
| Phase 3 — Trazabilidad | PASS | La tabla `Trazabilidad OpenSpec` mapea cada requisito a sección verificable. |
| Phase 4 — Seguridad documental | PASS WITH WARNINGS | Checks seguros ejecutados; persiste estado local fuera de alcance en `.codegraph/` y carpeta privada ignorada. |

No quedan tareas sin marcar en `tasks.md`.

## Evidencia de comandos

| Comando | Resultado | Nota |
|---|---|---|
| `git status --ignored --short` | PASS para recolección de estado | Cambios esperados: `deploy/README.md`, `docs/deploy/00-cpanel-certificados.md`, artefactos OpenSpec activos. También muestra `.codegraph/` local fuera de alcance e `material_privado_no_versionar/` ignorado. No se leyó contenido privado. |
| `git diff --name-only` | PASS | Solo cambios tracked en `deploy/README.md` y `docs/deploy/00-cpanel-certificados.md` antes de crear este reporte. |
| `git diff --cached --name-only` | PASS | Sin archivos staged. |
| `git diff --check` | PASS | Sin errores de whitespace en el diff tracked. |
| Escaneo Python de diff tracked | PASS | Sin rutas agregadas a `material_privado_no_versionar/`, sin asignaciones `.env`, sin literales de credenciales no-placeholder. |
| Escaneo Python de fences Markdown | PASS | La guía contiene bloques `txt`, `bash` y `apache`; no hay bloques PHP nuevos para ejecutar con `php -l`. |
| Escaneo Python de rutas clave | PASS | Se encontraron `/certificados/`, `/certificados/api/`, `GET /certificados/api/health`, regla `RewriteRule ^api(/.*)?$ - [L]` y `FallbackResource /certificados/api/index.php`. |

## Matriz de cumplimiento de spec

| Requisito | Evidencia documental | Estado |
|---|---|---|
| Checklist manual previo | `docs/deploy/00-cpanel-certificados.md`, sección `Checklist imprimible` con pre/subida/validación/cierre. | PASS |
| Exclusiones de no subida | Objetivo y checklist declaran que este ciclo no sube, no toca `public_html`, no crea `.env`, no instala ni modifica configuración real. | PASS |
| Guardia de material privado | Artefactos prohibidos y seguridad prohíben credenciales, dumps, logs, backups, zips, `.env` y material privado. | PASS |
| Rutas `.htaccess` para API | Fragmento raíz excluye `api`; fragmento API usa `FallbackResource /certificados/api/index.php`; contrato backend confirma `/certificados/api/`. | PASS |
| Configuración externa con placeholders | Backend PHP documenta placeholders `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `TOKEN_PEPPER` y config real fuera de Git/webroot. | PASS |
| Backup y rollback manual | Secciones `Backup previo` y `Rollback` describen compresión, resguardo, renombre/restauración y verificación. | PASS |
| Validación posterior con datos ficticios | Tabla de validación usa health, token ficticio, consulta pública, fallback SPA y no usa base real. | PASS |

## Coherencia de diseño

| Decisión de diseño | Estado |
|---|---|
| Cambio documental y mínimo, sin scripts ni deploy real | PASS |
| Guía principal en `docs/deploy/00-cpanel-certificados.md` | PASS |
| Mapa breve en `deploy/README.md` | PASS |
| `.htaccess` solo documentado, no modificado | PASS |
| Configuración real fuera de Git y sin `.env` | PASS |
| API bajo `/certificados/api/` sin que el fallback SPA capture `/api/` | PASS |

## Seguridad y exclusiones confirmadas

- No se leyó `material_privado_no_versionar/`; solo se observó por estado Git que sigue ignorado.
- No se leyeron dumps, logs, zips, `.env`, credenciales ni configuraciones reales.
- No se usó base de datos real.
- No se creó `.env`.
- No se ejecutó deploy real.
- No se subió nada a `public_html` ni se modificó una carpeta `public_html` local.
- No se instalaron dependencias.
- No se ejecutaron commit, push, merge, rebase ni reset.
- No se modificó `.codegraph/`.

## Issues

### CRITICAL

- Ninguno.

### WARNING

- `.codegraph/` aparece como estado local sin versionar/ignorado y queda fuera del alcance del ciclo. No bloquear, pero no incluir en commit/revisión.
- `material_privado_no_versionar/` aparece como ignorado. No bloquear; mantener sin leer, sin versionar y fuera de documentación detallada.
- No se verificó compatibilidad real en cPanel porque el objetivo del ciclo prohíbe subir o ejecutar deploy real.

### SUGGESTION

- En `sdd-archive`, fusionar la spec activa con la spec principal y conservar este reporte como evidencia del cierre M3-05.

## Veredicto final

`PASS WITH WARNINGS` — listo para `sdd-archive`, manteniendo fuera de alcance `.codegraph/`, material privado y cualquier acción real de deploy.
