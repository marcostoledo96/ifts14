# Archive report — php84-docker-runtime

## Resultado

Cambio archivado en `openspec/changes/archive/2026-06-25-php84-docker-runtime/`. No se modificó `openspec/specs/` porque este cambio es tooling local (Docker runtime PHP 8.4) y no introduce ni modifica contrato de producto: no agrega endpoints, no cambia el envelope del API, no toca configuración ni base de datos.

**Veredicto del ciclo: PASS** (0 CRITICAL, 0 WARNING activos). SDD cycle complete.

- Veredicto actualizado tras evidencia runtime: PASS documentado en `verify-report.md`.
- Validación runtime (`bash scripts/php-docker-build.sh` y siguientes) ejecutada localmente por Marcos: build OK, PHP 8.4.22, módulos requeridos OK y `php -l` sin errores.

## Qué cambió

Runtime Docker mínimo basado en `php:8.4-cli` con las extensiones requeridas por el backend (`pdo_mysql`, `mbstring`, `curl`, `zip`, `xml`) y un set de scripts `php-docker-*.sh` para build, validación de versión, validación de módulos y `php -l` sobre `apps/backend-php/`. No usa Docker Compose, no copia credenciales, no accede a bases de datos reales.

| Componente | Estado | Detalle |
|---|---|---|
| `docker/php84/Dockerfile` | Creado | `FROM php:8.4-cli`, instala `pdo_mysql`, `mbstring`, `curl`, `zip`, `xml` vía `docker-php-ext-install`. Limpia `apt` lists. |
| `docker/php84/README.md` | Creado | Uso rápido, tabla de validaciones, alcance y restricciones. |
| `scripts/php-docker-build.sh` | Creado | `sudo docker build -t ifts14-php84 -f docker/php84/Dockerfile .` |
| `scripts/php-docker-version.sh` | Creado | `sudo docker run --rm ifts14-php84 php -v` |
| `scripts/php-docker-modules-check.sh` | Creado | Verifica presencia de `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `scripts/php-docker-lint.sh` | Creado | `sudo docker run --rm` con bind mount RO de `apps/backend-php/`, ejecuta `php -l` sobre `*.php`. |
| `apps/backend-php/README.md` | Modificado | Sección "QA local con Docker PHP 8.4" apuntando a los scripts. |
| `docs/backend/00-php84-api.md` | Modificado | Sección "Validación local con PHP 8.4" como nota descubrible desde el índice central. |

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| (ninguno) | — | El cambio es tooling de validación local, no capability de producto. No se crea ni se mergea nada en `openspec/specs/`. |

Nota: `openspec/AGENTS.md` indica "actualizar `openspec/specs/` si el contrato cambió". El contrato no cambió: el Dockerfile y los scripts no exponen ni modifican endpoints, DTOs, tablas, ni el envelope de error. Se respeta la convención local de no inflar `openspec/specs/` con artefactos no contractuales.

## Archivos leídos (artefactos del cambio)

| Artefacto | Origen |
|---|---|
| `plan.md` | `openspec/changes/php84-docker-runtime/` (ahora archivado) |
| `apply-progress.md` | id. |
| `verify-report.md` | id. |
| `docker/php84/Dockerfile` | Repo, evidencia de imagen |
| `docker/php84/README.md` | Repo, doc del runtime |
| `scripts/php-docker-build.sh`, `php-docker-version.sh`, `php-docker-modules-check.sh`, `php-docker-lint.sh` | Repo, evidencia de scripts |
| `apps/backend-php/README.md` | Repo, doc destino del delta menor |
| `apps/backend-php/AGENTS.md`, `docs/AGENTS.md`, `openspec/AGENTS.md` | Repo, reglas de scope |
| `docs/00-indice-general.md`, `docs/07-sdd-archive-y-mantenimiento-documentacion.md` | Repo, matriz de actualización de docs |
| `openspec/changes/archive/2026-06-25-certificados-qa-smoke-cpanel/archive-report.md` | Repo, referencia de formato |

Skills cargadas: `sdd-archive`, `cognitive-doc-design`, `karpathy-guidelines`, `ponytail`.

## Archivos modificados

| Archivo | Estado | Alcance |
|---|---|---|
| `docker/php84/Dockerfile` | Creado | 10 líneas, `FROM php:8.4-cli` + `docker-php-ext-install`. |
| `docker/php84/README.md` | Creado | 30 líneas, uso y alcance. |
| `scripts/php-docker-build.sh` | Creado | 7 líneas, build de la imagen local. |
| `scripts/php-docker-version.sh` | Creado | 5 líneas, muestra `php -v` del contenedor. |
| `scripts/php-docker-modules-check.sh` | Creado | 21 líneas, valida `pdo_mysql`/`openssl`/`mbstring`/`curl`/`zip`/`xml`. |
| `scripts/php-docker-lint.sh` | Creado | 10 líneas, bind mount RO + `find ... -exec php -l`. |
| `apps/backend-php/README.md` | Modificado | Sección Docker y validación runtime local. |
| `docs/backend/00-php84-api.md` | Modificado | Sección "Validación local con PHP 8.4". |
| `openspec/changes/archive/2026-06-25-php84-docker-runtime/` | Creado (movido) | `plan.md`, `apply-progress.md`, `verify-report.md`, este `archive-report.md`. |

No se tocaron `material_privado_no_versionar/`, `apps/backend-php/{index,src,config}/*.php`, `database/`, `openspec/specs/`, `git`, ni configuración real. Los 4 scripts Docker pasaron `bash -n` y la validación runtime pasó con evidencia de Marcos (ver `verify-report.md`).

## Notas sobre la Task Completion Gate

El skill `sdd-archive` exige revisar `tasks.md` (o la observación Engram equivalente) antes de archivar. Este cambio no tiene `tasks.md`: la tarea se planificó en `plan.md` y el progreso se documentó en `apply-progress.md`, donde las 7 tareas están marcadas `[x]`. Se considera pasada la gate con la salvedad de que el chequeo se hace sobre `apply-progress.md` en lugar de `tasks.md`, y se documenta aquí para auditoría — mismo patrón ya establecido en el archive `2026-06-25-certificados-qa-smoke-cpanel`. El `verify-report.md` avala el cierre.

## Evidencia de verificación

| Check | Resultado |
|---|---|
| `verify-report.md` | PASS. 0 CRITICAL, 0 WARNING activos. |
| `apply-progress.md` | 7/7 tareas marcadas `[x]`. |
| `bash -n scripts/php-docker-*.sh` (4 scripts) | PASS. |
| `bash scripts/php-docker-build.sh` | PASS; creó `ifts14-php84:latest` desde `php:8.4-cli`. Warning de legacy builder registrado como no bloqueante. |
| `bash scripts/php-docker-version.sh` | PASS; `PHP 8.4.22 (cli)`. |
| `bash scripts/php-docker-modules-check.sh` | PASS; `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml` OK. |
| `bash scripts/php-docker-lint.sh` | PASS; sin errores de sintaxis en los cinco PHP del backend base. |
| `git status --ignored --short` | Esperado: `apps/backend-php/README.md` mod, `docker/`, scripts y change folder nuevos; `material_privado_no_versionar/` ignorado. |
| `Dockerfile` usa `php:8.4-cli` | PASS. |
| Extensiones cubiertas | `pdo_mysql`, `mbstring`, `curl`, `zip`, `xml` instaladas; `openssl` validada por script. |
| Sin Docker Compose | Sin referencias ejecutables en scripts; sólo menciones documentales negativas (ver nota). |
| Sin credenciales ni DB real | No aparecen variables DB ni paths sensibles en Dockerfile/scripts. |
| Sin cambios de producto | `git status` no muestra PHP de producto modificado. |

## Warnings y notas

No quedan warnings activos.

### RESUELTO/PASS — Validación runtime del runtime

Marcos ejecutó localmente `bash scripts/php-docker-build.sh`, `bash scripts/php-docker-version.sh`, `bash scripts/php-docker-modules-check.sh` y `bash scripts/php-docker-lint.sh`. El build creó `ifts14-php84:latest`, la versión efectiva fue `PHP 8.4.22 (cli)`, los módulos requeridos están disponibles y el lint PHP no detectó errores.

### Nota — Menciones documentales a "Docker Compose"

El `verify-report.md` detecta menciones textuales negativas a Docker Compose en `plan.md`, `apply-progress.md`, `docker/php84/README.md` y `apps/backend-php/README.md`. No hay uso ni comandos Compose. No es bloqueante: la regla operativa es "no usar Docker Compose" y se preservan las menciones como recordatorio explícito del alcance standalone.

### SUGGESTION — Artefactos del cambio sin `proposal.md` / `design.md` / `specs/` / `tasks.md`

La carpeta activa del cambio contenía sólo `plan.md`, `apply-progress.md` y `verify-report.md`. Para un ciclo pequeño y puramente operacional (tooling local) la convención local admite ese formato mientras el `archive-report.md` documente el formato reducido. Mismo patrón que `2026-06-25-certificados-qa-smoke-cpanel`. Si en el futuro se quiere alinear 1:1 con el resto de archivados con spec delta, se puede replicar el esqueleto a partir de este archive-report.

## Riesgos abiertos

| Riesgo | Severidad | Mitigación |
|---|---|---|
| Docker legacy builder deprecado | Baja | El build pasó; si Docker vuelve ese warning bloqueante, migrar el script a BuildKit/buildx en un ciclo chico. |
| `php -l` no detecta todos los errores | Baja (limitación de `php -l`) | Documentado; para análisis estático profundo se necesita `phpstan` o `psalm` (fuera de alcance de este ciclo). |
| Olvido de que la imagen no incluye Composer | Baja | `docker/php84/README.md` lo aclara explícitamente en la sección "Alcance". |

## Comandos Git propuestos (no ejecutar)

Ninguno. La regla de `AGENTS.md` exige confirmación explícita antes de `git commit`, `push` o `merge`, y este ciclo no pidió versionar. Cuando se decida el siguiente commit seguro del proyecto, el working tree incluye:

- `apps/backend-php/README.md` modificado.
- `docs/backend/00-php84-api.md` modificado.
- `docker/php84/{Dockerfile,README.md}` nuevos.
- `scripts/php-docker-{build,version,modules-check,lint}.sh` nuevos.
- `openspec/changes/archive/2026-06-25-php84-docker-runtime/` con los artefactos del cambio y este `archive-report.md`.

## Estado

**SDD cycle complete.** Tooling local Docker PHP 8.4 archivado con 7/7 tareas completadas y verificación runtime PASS. El runtime quedó validado con PHP 8.4.22, módulos requeridos y `php -l` sobre el backend base. Próximo ciclo recomendado: cerrar el smoke HTTP local pendiente de `backend-base-php-certificados` usando este runtime o PHP 8.4 nativo, sin confundirlo con el verify ya cerrado de `php84-docker-runtime`.
