# Archive report — certificados-qa-smoke-cpanel

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/`. No se modificó `openspec/specs/` porque este cambio no introduce ni modifica contrato de producto: entrega un paquete local versionable de humo para validación manual en cPanel aislado, no agrega endpoints, no cambia el envelope ni la API del backend base.

Veredicto del ciclo al archivar: `PASS WITH WARNINGS` (0 CRITICAL, 1 WARNING de `php -l` no disponible en la sesión de verify). SDD cycle complete.

Veredicto del smoke HTTP real post-archive: PASS. 0 CRITICAL. La WARNING previa de `php -l` local se preserva por transparencia y se suma una segunda WARNING no bloqueante sobre el cuerpo HTML que cPanel entrega en las respuestas 403 (no expone archivos internos). Detalle completo en la sección "Smoke HTTP real post-archive" más abajo.

## Qué cambió

Paquete local `deploy/cpanel/certificados_qa_smoke/` pensado para subirse manualmente por cPanel File Manager a `public_html/certificados_qa/` y validar que la carpeta aislada sirve el fallback de raíz, que la API responde `GET /api/health` sin tocar configuración ni PDO, y que `.htaccess` bloquea `api/src/` y `api/config/`. No es implementación de `/certificados/`; es un smoke aislado.

| Componente | Estado | Detalle |
|---|---|---|
| `deploy/cpanel/certificados_qa_smoke/index.html` | Creado | Página estática mínima y fallback para rutas tipo `/validar/ABC123`. |
| `deploy/cpanel/certificados_qa_smoke/.htaccess` | Creado | `RewriteBase /certificados_qa/`, excluye `/api/`, fallback a `index.html`. |
| `deploy/cpanel/certificados_qa_smoke/api/.htaccess` | Creado | `RewriteBase /certificados_qa/api/`, bloquea `src/` y `config/`, fallback a `index.php`. |
| `deploy/cpanel/certificados_qa_smoke/api/index.php` | Adaptado | `normalizePath` ajustado para `/certificados_qa/api`; `/health` sin Config ni Database. |
| `deploy/cpanel/certificados_qa_smoke/api/src/{Response,Config,Database}.php` | Copiados | Réplicas del backend base; no se ejecutan en `/health`. |
| `deploy/cpanel/certificados_qa_smoke/api/config/certificados-config.example.php` | Copiado | Valores ficticios. No usar en producción. |
| `deploy/cpanel/certificados_qa_smoke/README.md` | Creado | ZIP, ruta cPanel, URLs, `curl.exe`, resultados esperados, seguridad y limpieza. |
| `docs/deploy/00-cpanel-certificados.md` | Modificado | Nota breve que apunta al paquete smoke y al propósito de prueba manual. |

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| (ninguno) | — | El cambio no introduce ni modifica requisitos de producto. No se crea ni se mergea nada en `openspec/specs/`. |

Nota: `openspec/AGENTS.md` indica "actualizar `openspec/specs/` si el contrato cambió". El contrato no cambió: el smoke package es una herramienta de QA manual, no una capability de producto. Se respeta la convención local de no inflar `openspec/specs/` con artefactos no contractuales.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `plan.md` | `openspec/changes/certificados-qa-smoke-cpanel/` (ahora archivado) |
| `apply-progress.md` | id. |
| `verify-report.md` | id. |
| `openspec/AGENTS.md`, `docs/AGENTS.md`, `deploy/AGENTS.md` | Repo, reglas de scope |
| `docs/deploy/00-cpanel-certificados.md` | Repo, doc objetivo del delta menor |
| `openspec/changes/archive/2026-06-24-mejorar-guia-matias-angular-windows/archive-report.md` | Repo, referencia de formato |
| 8 archivos del paquete smoke | `deploy/cpanel/certificados_qa_smoke/` |

Skills cargadas: `sdd-archive`, `cognitive-doc-design`, `karpathy-guidelines`, `ponytail`.

## Archivos modificados

| Archivo | Estado | Alcance |
|---|---|---|
| `deploy/cpanel/certificados_qa_smoke/index.html` | Creado | Página de smoke, sin lógica. |
| `deploy/cpanel/certificados_qa_smoke/.htaccess` | Creado | 8 líneas, fallback de raíz. |
| `deploy/cpanel/certificados_qa_smoke/api/.htaccess` | Creado | 8 líneas, fallback de API + bloqueo. |
| `deploy/cpanel/certificados_qa_smoke/api/index.php` | Creado (adaptado) | `normalizePath` ajustado al prefijo nuevo. |
| `deploy/cpanel/certificados_qa_smoke/api/src/Response.php` | Copiado | Idéntico al backend base. |
| `deploy/cpanel/certificados_qa_smoke/api/src/Config.php` | Copiado | Idéntico; ruta ficticia externa por defecto. |
| `deploy/cpanel/certificados_qa_smoke/api/src/Database.php` | Copiado | Idéntico; no se ejecuta en `/health`. |
| `deploy/cpanel/certificados_qa_smoke/api/config/certificados-config.example.php` | Copiado | Ejemplo ficticio. |
| `deploy/cpanel/certificados_qa_smoke/README.md` | Creado | Guía de empaquetado, subida y limpieza. |
| `docs/deploy/00-cpanel-certificados.md` | Modificado | Agregada una sección breve "Smoke aislado (`certificados_qa`)" con puntero al paquete. |
| `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/` | Movido | Carpeta del cambio con `plan.md`, `apply-progress.md`, `verify-report.md` y este `archive-report.md`. |

No se tocaron `material_privado_no_versionar/`, `apps/`, `database/`, `openspec/specs/`, `git`, ni configuración real de cPanel.

## Notas sobre la Task Completion Gate

El skill `sdd-archive` exige revisar `tasks.md` (o la observación Engram equivalente) antes de archivar. Este cambio no tiene `tasks.md`: la tarea completa se planificó en `plan.md` y el progreso se documentó en `apply-progress.md`, donde las 5 tareas están marcadas `[x]`. Se considera pasada la gate con la salvedad de que el chequeo se hace sobre `apply-progress.md` en lugar de `tasks.md`, y se documenta aquí para auditoría. El `verify-report.md` avala el cierre.

## Evidencia de verificación

| Check | Resultado |
|---|---|
| `verify-report.md` | PASS WITH WARNINGS. 0 CRITICAL, 1 WARNING (`php -l` no disponible en la sesión). |
| `apply-progress.md` | 5/5 tareas marcadas `[x]`. |
| Estructura del paquete | 9 archivos en las rutas planificadas, sin extras. |
| `.htaccess` raíz | `RewriteBase /certificados_qa/`, exclusión de `/api/`, fallback a `index.html`. |
| `api/.htaccess` | `RewriteBase /certificados_qa/api/`, `RewriteRule ^(src|config)/ - [F,L]`, fallback a `index.php`. |
| `api/index.php` | `normalizePath` elimina `/certificados_qa/api`; `/health` solo requiere `Response.php`. |
| README | Cubre ZIP, cPanel, URLs, `curl.exe`, resultados esperados, seguridad y limpieza. |
| Búsqueda segura dentro del paquete | Sin `.env`, `*.sql`, `*.log`, `*.zip`, `config.php`, `db.php`, `database.php` ni `conexion.php`. |
| `php -l` | WARNING: `php` no disponible en la sesión. Sugerido ejecutar antes de subir el ZIP a cPanel. |

## Warnings y notas

### WARNING — `php -l` no ejecutable en la sesión de verify

El `verify-report.md` no pudo correr `php -l` sobre los cinco archivos PHP porque `php` no está disponible en el entorno. No es bloqueante para archivar (0 CRITICAL). Sugerencia: ejecutar `php -l` sobre los cinco archivos antes de comprimir el ZIP o antes de subirlo a `public_html/certificados_qa/`. El usuario lo puede hacer localmente con su stack PHP 8.4.21 ya configurado.

### SUGGESTION — Artefactos del cambio sin `proposal.md` / `design.md` / `specs/` / `tasks.md`

La carpeta activa del cambio contiene solo `plan.md`, `apply-progress.md` y `verify-report.md`. Para un ciclo pequeño y puramente operacional (smoke package) la convención local admite ese formato mientras el `archive-report.md` documente el formato reducido. Si en el futuro se quiere alinear 1:1 con el resto de archivados, se puede replicar el esqueleto a partir de este `archive-report.md`. Decisión consciente del ciclo, no omisión silenciosa.

### SUGGESTION — `docs/deploy/00-cpanel-certificados.md` mantiene el foco en `/certificados/`

La nota agregada es breve y apunta al smoke package sin reemplazar la documentación principal del deploy real. Cuando exista el `apply` del módulo `/certificados/`, el doc volverá a actualizarse con el flujo productivo.

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| `.htaccess` raíz del smoke colisiona con `.htaccess` de `public_html` | Baja | El `RewriteBase /certificados_qa/` y la condición de no captura de `/api/` están documentados; subir a carpeta aislada evita pisar reglas globales. |
| Permisos incorrectos tras la subida manual | Baja | README indica verificar `644` archivos y `755` directorios. |
| Olvido del paquete en producción | Media | README instruye eliminar `public_html/certificados_qa/` tras la validación. |
| `php -l` no corrido en la sesión | Baja | Sugerido antes de comprimir el ZIP; PHP sí está disponible localmente para el usuario. |

## Comandos Git propuestos (no ejecutar)

Ninguno. La regla de `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, y este ciclo no pidió versionar. Cuando se decida el primer commit seguro del proyecto, el working tree incluye:

- Archivos nuevos en `deploy/cpanel/certificados_qa_smoke/`.
- Modificaciones menores en `docs/deploy/00-cpanel-certificados.md`.
- Carpeta `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/` con los artefactos del cambio y este `archive-report.md`.

## Smoke HTTP real post-archive (evidencia cPanel)

Esta sub-sección documenta la verificación real del paquete en cPanel, ejecutada por el usuario después del archive del cambio. Se conserva la WARNING original de `php -l` local (preservada por transparencia, no bloqueante) y se distingue del PASS del smoke HTTP real.

### Resultados del smoke HTTP real

| # | Método | URL | Estado HTTP | Content-Type | Veredicto |
|---|---|---|---|---|---|
| 1 | GET | `/certificados_qa/` | 200 | `text/html` | PASS — sirve el `index.html` del paquete smoke. |
| 2 | GET | `/certificados_qa/validar/ABC123` | 200 | `text/html` | PASS — fallback correcto a `index.html` (ruta Angular futura). |
| 3 | GET | `/certificados_qa/api/health` | 200 | `application/json; charset=utf-8` | PASS — JSON con `status: ok` y `service: certificados-api`. |
| 4 | GET | `/certificados_qa/api/no-existe` | 404 | `application/json; charset=utf-8` | PASS — JSON controlado con `code: NOT_FOUND`. |
| 5 | GET | `/certificados_qa/api/src/Response.php` | 403 | HTML del sitio principal | PASS en seguridad (no expone el fuente); WARNING en consistencia de cuerpo (ver abajo). |
| 6 | GET | `/certificados_qa/api/config/certificados-config.example.php` | 403 | HTML del sitio principal | PASS en seguridad (no expone la config); WARNING en consistencia de cuerpo (ver abajo). |
| 7 | POST | `/certificados_qa/api/health` | 405 | `application/json; charset=utf-8` | PASS — JSON controlado con `code: METHOD_NOT_ALLOWED`. Header `Allow: GET` presente. |

### Veredicto del smoke HTTP real

PASS. Cobertura: happy path de raíz y SPA-fallback (1, 2), health-check sin Config/PDO (3), 404 controlado (4), bloqueo de acceso a `src/` y `config/` (5, 6), y 405 con header `Allow` (7). El comportamiento coincide con el bloque de resultados esperados del README.

### WARNING no bloqueante: cuerpo HTML en respuestas 403

Casos 5 y 6. cPanel entrega el código HTTP 403 correcto y no expone los archivos internos, pero el cuerpo de la respuesta es HTML correspondiente a la página principal del sitio, no un JSON de error controlado por la API. Seguridad: intacta. Observabilidad del cliente API: el cuerpo no es consistente con los errores 404/405 JSON del mismo paquete. Mitigación futura opcional: definir `ErrorDocument 403` propio dentro de `certificados_qa/.htaccess` o `certificados_qa/api/.htaccess`.

### Distinción de advertencias

| Advertencia | Origen | Bloquea archive | Acción |
|---|---|---|---|
| `php -l` no ejecutable localmente | Sesión original de verify (entorno sin `php`) | No | Sugerida al usuario; no requerida para el smoke HTTP real. |
| Cuerpo HTML en 403 | cPanel real observado en smoke HTTP | No | Documentada; mitigación opcional futura. |

### Observación Engram

El resultado completo del smoke real se guardó en Engram bajo el topic_key `sdd/certificados-qa-smoke-cpanel/real-cpanel-verify` del proyecto `ifts14` (capture_prompt: false por ser artefacto SDD automatizado) para trazabilidad entre sesiones.

## Estado

SDD cycle complete. Smoke HTTP real en `/certificados_qa/` ejecutado por el usuario contra cPanel: PASS. La WARNING local de `php -l` y la WARNING nueva de cuerpo HTML en 403 son no bloqueantes y se preservan para auditoría. Próximo ciclo recomendado, según prioridad del usuario: continuar con el ciclo del backend base de certificados (`backend-base-php-certificados` ya está activo) o repetir el smoke en otra carpeta aislada si se necesita re-validar tras un cambio mayor. Independiente del orden: el smoke package queda versionado, archivado y validado en cPanel real para reutilización.

Recordatorio de limpieza: tras la validación, eliminar `public_html/certificados_qa/` desde cPanel File Manager para no dejar el paquete expuesto en producción.
