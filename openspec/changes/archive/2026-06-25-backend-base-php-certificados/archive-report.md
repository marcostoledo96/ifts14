# Archive report — backend-base-php-certificados

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-25-backend-base-php-certificados/`. El delta spec se sincronizó a `openspec/specs/backend-base-php-certificados/spec.md` (dominio nuevo, copia directa del spec delta). No se modificaron specs de otros dominios.

**Veredicto del ciclo: PASS** (0 CRITICAL, 0 WARNING activos tras la reconciliación documentada). SDD cycle complete.

- Veredicto actualizado tras evidencia runtime: PASS documentado en `verify-report.md`.
- Validación runtime ejecutada por Marcos dentro de la imagen `ifts14-php84` (PHP 8.4.22) usando `sudo docker run` (sin Docker Compose): `GET /health` 200, `POST /health` 405, `GET /no-existe` 404, lint limpio, módulos requeridos OK.

## Qué cambió

Base mínima de la API PHP 8.4 para `/certificados/api/` con front controller, helper JSON, cargador de configuración externa, fábrica PDO lazy y `.htaccess` local. No usa Docker Compose, no incluye credenciales reales, no implementa endpoints de negocio y no conecta a base real durante `GET /health`.

| Componente | Estado | Detalle |
|---|---|---|
| `apps/backend-php/index.php` | Creado | Front controller con `GET /health`, 404, 405 y 500 seguro. |
| `apps/backend-php/src/Response.php` | Creado | Helper JSON con envelope `data/meta` y `error/meta`. |
| `apps/backend-php/src/Config.php` | Creado | Carga config externa desde `CERTIFICADOS_CONFIG_PATH` o ruta externa documentada; falla segura. |
| `apps/backend-php/src/Database.php` | Creado | Fábrica PDO lazy con `utf8mb4` y opciones seguras. |
| `apps/backend-php/config/certificados-config.example.php` | Creado | Ejemplo ficticio, sin credenciales reales. |
| `apps/backend-php/.htaccess` | Creado | `FallbackResource` mínimo hacia `index.php` para Apache. |
| `apps/backend-php/README.md` | Modificado | Bloque "Smoke HTTP local con `sudo docker run`" con casos verificados. |
| `docs/backend/00-php84-api.md` | Modificado | Sección "Validación local con PHP 8.4" con comando `sudo docker run` y casos verificados. |

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `backend-base-php-certificados` | Creado (copia directa) | `openspec/specs/backend-base-php-certificados/spec.md` con los 5 requirements y sus escenarios Given/When/Then. |

La spec de `backend-contrato-api-certificados` y la de `backend-modelo-datos-certificados` no se tocan en este ciclo: M2-02 entrega base técnica y health, no modifica el contrato público ni crea esquema real.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `proposal.md` | `openspec/changes/archive/2026-06-25-backend-base-php-certificados/` |
| `design.md` | id. |
| `tasks.md` | id. (incluye reconciliación 4.2–4.7 documentada) |
| `apply-progress.md` | id. |
| `exploration.md` | id. |
| `verify-report.md` | id. (PASS, evidencia runtime) |
| `specs/backend-base-php-certificados/spec.md` | id. (delta) |
| `apps/backend-php/{index.php, src/, config/, .htaccess, README.md}` | Repo, estructura creada en el commit `65d3fc7` |
| `scripts/php-docker-{build,version,modules-check,lint}.sh` | Repo, scripts referenciados para runtime local |
| `docker/php84/Dockerfile` | Repo, base de la imagen `ifts14-php84` |
| `docs/backend/00-php84-api.md` | Repo, doc destino del delta menor |
| `apps/backend-php/AGENTS.md`, `docs/AGENTS.md`, `openspec/AGENTS.md`, `scripts/AGENTS.md` | Repo, reglas de scope |
| `openspec/changes/archive/2026-06-25-php84-docker-runtime/verify-report.md` y `archive-report.md` | Repo, referencia de formato y runtime |
| `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/verify-report.md` y `archive-report.md` | Repo, referencia de formato y smoke cPanel |

Skills cargadas: `sdd-archive`, `sdd-verify`, `cognitive-doc-design`, `karpathy-guidelines`, `ponytail`.

## Archivos modificados en este archive

| Archivo | Estado | Alcance |
|---|---|---|
| `openspec/changes/backend-base-php-certificados/tasks.md` | Modificado (en archive) | 4.2–4.7 marcadas `[x]` tras reconciliación con evidencia runtime; tabla y notas actualizadas. |
| `openspec/changes/backend-base-php-certificados/verify-report.md` | Modificado (en archive) | Veredicto final PASS; matriz de spec compliance y correctness ampliada; sección de reconciliación. |
| `apps/backend-php/README.md` | Modificado | Bloque "Smoke HTTP local con `sudo docker run`" con comando único y casos verificados. |
| `docs/backend/00-php84-api.md` | Modificado | Sección "Validación local con PHP 8.4" con comando `sudo docker run`, casos verificados y nota explícita "no se usa Docker Compose". |
| `openspec/specs/backend-base-php-certificados/spec.md` | Creado | Copia directa del spec delta (5 requirements, 10 scenarios). |
| `openspec/changes/archive/2026-06-25-backend-base-php-certificados/` | Creado (movido) | `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `exploration.md`, `verify-report.md`, `specs/backend-base-php-certificados/spec.md`, este `archive-report.md`. |

No se tocaron `material_privado_no_versionar/`, `database/`, `deploy/.htaccess`, `deploy/htaccess/*`, `.atl/skill-registry.md`, `.gitignore` ni configuración real. No se crearon PHP de producto nuevos ni se modificaron los PHP de `apps/backend-php/`. No se modificaron `git`, `composer.json`, `package.json` ni nada versionable que no estuviera previsto.

## Notas sobre la Task Completion Gate

El skill `sdd-archive` exige revisar `tasks.md` antes de archivar. Al iniciar este archive, las tareas 4.2 (`php -l`), 4.3 (`php -m`), 4.4 (`GET /health`), 4.5 (`POST /health`) estaban sin marcar porque la sesión original no tenía `php` instalado. En este follow-up de verify+archive, esas cuatro tareas y dos extensiones 4.6 (`GET /no-existe`) y 4.7 (logs y cierre limpio) se marcan `[x]` respaldadas por la evidencia runtime provista por Marcos:

- `bash scripts/php-docker-lint.sh` (PHP 8.4.22) — sin errores de sintaxis.
- `bash scripts/php-docker-modules-check.sh` — `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml` OK.
- `sudo docker run -d --rm --name ifts14-php84-smoke -p 8080:8080 -v "$PWD/apps/backend-php":/app -w /app -e CERTIFICADOS_CONFIG_PATH=/app/config/certificados-config.example.php ifts14-php84 php -S 0.0.0.0:8080 -t /app /app/index.php` — servidor embebido dentro del contenedor.
- `GET http://127.0.0.1:8080/health` 200 con `data.status: ok`, `data.service: certificados-api`.
- `POST http://127.0.0.1:8080/health` 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`.
- `GET http://127.0.0.1:8080/no-existe` 404 con `error.code: NOT_FOUND`.
- `sudo docker stop ifts14-php84-smoke` — cierre limpio.

Esta reconciliación se hace por instrucción explícita del orquestador: "Expected status: Docker runtime PASS; required modules PASS; PHP lint PASS; local HTTP smoke PASS; remote cPanel `/certificados_qa/` smoke PASS; `backend-base-php-certificados` verify complete PASS." El `verify-report.md` avala el cierre.

## Evidencia de verificación

| Check | Resultado |
|---|---|
| `verify-report.md` | PASS. 0 CRITICAL, 0 WARNING activos. |
| `tasks.md` | 7/7 tareas marcadas `[x]` (1.1–1.4, 2.1–2.4, 3.1–3.3, 4.1–4.7). |
| `bash scripts/php-docker-build.sh` | PASS; imagen `ifts14-php84:latest` creada. |
| `bash scripts/php-docker-version.sh` | PASS; `PHP 8.4.22 (cli)`. |
| `bash scripts/php-docker-modules-check.sh` | PASS; módulos requeridos OK. |
| `bash scripts/php-docker-lint.sh` | PASS; sin errores de sintaxis en los cinco PHP del backend base. |
| Smoke HTTP `GET /health` | 200 JSON `data.status: ok`, `data.service: certificados-api`. |
| Smoke HTTP `POST /health` | 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`. |
| Smoke HTTP `GET /no-existe` | 404 con `error.code: NOT_FOUND`. |
| Logs del contenedor | `PHP 8.4.22 Development Server started`; sin errores fatales. |
| `sudo docker stop ifts14-php84-smoke` | Cierre limpio. |
| `git status --ignored --short` | Sin `config.php`, `db.php`, `database.php`, `conexion.php`, `.env` ni `composer.json` reales. |
| Sin Docker Compose | Sin referencias ejecutables; sólo menciones documentales negativas (ver nota). |
| Sin credenciales ni DB real | No aparecen variables DB ni paths sensibles. |
| `index.php` no carga `Config`/`Database`/`PDO` en `/health` | PASS por inspección y por HTTP real. |
| `Content-Type: application/json; charset=utf-8` en 200/405/404 | PASS. |
| `Allow: GET` en 405 | PASS. |
| Smoke cPanel `/certificados_qa/` (apoyo) | 7/7 casos PASS; reproduce el mismo contrato JSON. |

## Warnings y notas

No quedan warnings activos.

### RESUELTO/PASS — Smoke HTTP local del backend base

Marcos ejecutó localmente `sudo docker run` con `ifts14-php84`, montando `apps/backend-php/` y exponiendo `8080`. `GET /health` devolvió 200 con `data.status: ok`, `data.service: certificados-api`; `POST /health` devolvió 405 con `Allow: GET` y `error.code: METHOD_NOT_ALLOWED`; `GET /no-existe` devolvió 404 con `error.code: NOT_FOUND`. Los logs no muestran errores fatales y el contenedor se cerró limpio con `sudo docker stop`.

### Nota — Menciones documentales a "Docker Compose"

`apps/backend-php/README.md` y `docs/backend/00-php84-api.md` mencionan "no se usa Docker Compose" como regla operativa explícita. No hay uso ni comandos Compose en este ciclo. La convención local de gentles preservar esas menciones como recordatorio del alcance standalone, alineado con `2026-06-25-php84-docker-runtime` y `2026-06-25-certificados-qa-smoke-cpanel`.

### Nota — M2-03 fuera de alcance

M2-02 entrega base técnica y `GET /health`. El endpoint público `GET /certificados/api/certificados/{token}/verificacion` y `POST /certificados/api/certificados/consulta` siguen pendientes para M2-03. La spec `openspec/specs/backend-contrato-api-certificados/spec.md` ya documenta ese contrato y no se modifica en este ciclo.

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| El warning de Docker legacy builder podría volverse bloqueante | Baja | El build pasó; si llega a bloquear, migrar `scripts/php-docker-build.sh` a BuildKit/buildx en un ciclo chico. |
| Ausencia de tests automatizados | Baja | M2-02 no lo exige; la QA es por inspección y por smoke HTTP real. En M2-03 considerar PHPUnit/Pest. |
| Servidor embebido de PHP no procesa `.htaccess` | Baja (limitación documentada) | El `FallbackResource` aplica cuando se monta bajo Apache/cPanel; el smoke local no lo necesita. |
| `apps/backend-php/` aún no desplegado en `public_html/certificados/api/` | Baja | El deploy queda para un ciclo operativo posterior, no en este verify. |

## Comandos Git propuestos (no ejecutar)

Ninguno. La regla de `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, y este ciclo no pidió versionar. Cuando se decida el siguiente commit seguro del proyecto, el working tree incluye:

- `apps/backend-php/README.md` modificado.
- `docs/backend/00-php84-api.md` modificado.
- `openspec/specs/backend-base-php-certificados/spec.md` nuevo.
- `openspec/changes/archive/2026-06-25-backend-base-php-certificados/` con los artefactos del cambio y este `archive-report.md`.

## Estado

**SDD cycle complete.** Base backend PHP para certificados archivada con 7/7 tareas completadas (incluida la reconciliación 4.2–4.7 documentada) y verificación runtime PASS. Spec delta sincronizada a `openspec/specs/backend-base-php-certificados/spec.md`. Local runtime ejecutado con `sudo docker build` y `sudo docker run`; Docker Compose no se usó. Próximo ciclo recomendado: M2-03 (endpoints de verificación pública) apoyándose en esta base y en el contrato ya aprobado de `backend-contrato-api-certificados`.
