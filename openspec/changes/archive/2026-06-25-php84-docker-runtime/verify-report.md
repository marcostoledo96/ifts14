# Verify Report — php84-docker-runtime

## Estado

- Veredicto: **PASS**.
- Modo: verificación runtime local con evidencia provista por Marcos. OpenCode no ejecutó Docker en esta sesión.
- Strict TDD: no activo según `apply-progress.md`; no hay runner de tests para este ciclo de tooling local.

## Evidencia de comandos

| Comando | Resultado |
|---|---|
| `bash -n scripts/php-docker-build.sh` | PASS |
| `bash -n scripts/php-docker-version.sh` | PASS |
| `bash -n scripts/php-docker-modules-check.sh` | PASS |
| `bash -n scripts/php-docker-lint.sh` | PASS |
| `rtk git status --ignored --short` | PASS; cambios esperados: `apps/backend-php/README.md`, `docker/`, `openspec/changes/php84-docker-runtime/`, scripts `php-docker-*`; `material_privado_no_versionar/` figura solo como ignorado. |
| `bash scripts/php-docker-build.sh` | PASS; imagen `ifts14-php84:latest` creada desde `php:8.4-cli`. Docker informó un warning no bloqueante por legacy builder deprecado. |
| `bash scripts/php-docker-version.sh` | PASS; reportó `PHP 8.4.22 (cli)`. |
| `bash scripts/php-docker-modules-check.sh` | PASS; módulos instalados incluyen `curl`, `mbstring`, `openssl`, `PDO`, `pdo_mysql`, `xml`, `zip`; check requerido OK para `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. |
| `bash scripts/php-docker-lint.sh` | PASS; sin errores de sintaxis en `config/certificados-config.example.php`, `index.php`, `src/Config.php`, `src/Response.php`, `src/Database.php`. |

## Matriz de completitud

| Requisito | Evidencia | Estado |
|---|---|---|
| `openspec/changes/php84-docker-runtime/plan.md` existe | Archivo leído. | PASS |
| `openspec/changes/php84-docker-runtime/apply-progress.md` existe | Archivo leído; tareas marcadas como completas. | PASS |
| `docker/php84/Dockerfile` existe | Archivo leído. | PASS |
| `docker/php84/README.md` existe | Archivo leído. | PASS |
| Scripts `php-docker-*` existen | Los cuatro scripts fueron leídos y pasaron `bash -n`. | PASS |
| `apps/backend-php/README.md` actualizado | Contiene sección “QA local con Docker PHP 8.4”. | PASS |
| Runtime Docker validado | Build, versión, módulos y `php -l` ejecutados localmente por Marcos. | PASS |

## Cumplimiento técnico

| Requisito | Evidencia | Estado |
|---|---|---|
| Usar imagen oficial PHP 8.4 CLI | `Dockerfile`: `FROM php:8.4-cli`. | PASS |
| Cubrir `pdo_mysql`, `mbstring`, `curl`, `zip`, `xml` | `Dockerfile` instala esas extensiones con `docker-php-ext-install`. | PASS |
| Verificar `openssl` por script | `php-docker-modules-check.sh` incluye `openssl` en `required`. | PASS |
| Usar `sudo docker build` | `php-docker-build.sh` usa `sudo docker build`. | PASS |
| Usar `sudo docker run` | Version, modules-check y lint usan `sudo docker run`. | PASS |
| No usar Docker Compose en scripts | No hay referencias ni uso en `scripts/php-docker-*.sh`. | PASS |
| No modificar endpoints/lógica de producto | `git status` muestra solo `apps/backend-php/README.md` dentro del backend; no aparecen PHP de producto modificados. | PASS |
| No incluir credenciales ni configuración DB real en Docker/scripts | No se detectaron credenciales ni variables DB en Dockerfile/scripts inspeccionados. | PASS |
| Build real de imagen Docker | `bash scripts/php-docker-build.sh` creó `ifts14-php84:latest`. | PASS |
| Versión PHP efectiva | `bash scripts/php-docker-version.sh` reportó `PHP 8.4.22 (cli)`. | PASS |
| Extensiones efectivas dentro del contenedor | `php-docker-modules-check.sh` confirmó `pdo_mysql`, `openssl`, `mbstring`, `curl`, `zip`, `xml`. | PASS |
| Sintaxis PHP del backend dentro del contenedor | `php-docker-lint.sh` pasó sin errores en los cinco PHP del backend base. | PASS |

## Observaciones sobre Docker Compose

No se detectó uso ejecutable de Docker Compose. Sí hay menciones textuales negativas en documentación (`plan.md`, `apply-progress.md`, `docker/php84/README.md`, `apps/backend-php/README.md`) indicando que no se usa Docker Compose. No son un warning activo: documentan el alcance standalone del runtime.

## Checks omitidos

- Docker build/run por OpenCode: omitido por instrucción explícita. La evidencia runtime fue ejecutada localmente por Marcos.
- Cobertura de escenarios de spec: no existe spec delta para este cambio; se verificó contra `plan.md` y `apply-progress.md`.

## Issues

### CRITICAL

- Ninguno.

### WARNING

- Ninguno activo.

### SUGGESTION

- En un ciclo futuro, considerar BuildKit si el warning de legacy builder pasa a ser bloqueante en la instalación local de Docker.

## Veredicto final

**PASS**: la estructura mínima, scripts, documentación y validación runtime local cumplen. La imagen quedó construida como `ifts14-php84:latest`, PHP efectivo es `8.4.22`, las extensiones requeridas están disponibles y `php -l` no detectó errores en el backend base.
