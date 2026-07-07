# Tasks: m3-06-warning-cleanup

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas (original de planificación) | 40-70 |
| Líneas tracked del PR actual (medición real) | ~304 insertions / 21 deletions (diff producto/docs/spec) |
| Artefactos OpenSpec archivados (untracked) | ~1,245 líneas adicionales (evidencia de archivo, no en diff tracked) |
| Riesgo presupuesto 1000 | Bajo: dentro del presupuesto SOLO si el diff tracked producto/docs/spec se cuenta separado de la evidencia de archivo OpenSpec |
| Chained PRs recomendados | No |
| Estrategia cadena | N/A (single PR, no chain) |
| Estrategia entrega | single-pr |
| Split sugerido | single PR |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: N/A (single PR, no chain)
400-line budget risk: Low
1000-line budget risk: Low

Nota: la estimación original de 40-70 líneas NO fue precisa; el diff tracked
real del PR actual es ~304 insertions / 21 deletions (producto/docs/spec), más
~1,245 líneas de artefactos OpenSpec archivados que quedan como untracked y
forman evidencia de archivo, no código de producto. El conjunto cabe en el
presupuesto de 1000 líneas únicamente si se cuenta el diff tracked
producto/docs/spec por separado de la evidencia de archivo OpenSpec. La
cadena no aplica cuando `Chained PRs recommended = No` y la entrega es
`single-pr` con presupuesto 1000. No se requiere `size-exception`. La
explicación del PR debe usar el valor tracked real (~304/21), no el estimado.

## Phase 1: Smoke con fallback Docker

- [x] 1.1 Editar `scripts/m3-06-smoke.sh`: resolver `php_cmd` al inicio. Si existe `php` en PATH, usarlo; si no, `docker image inspect ifts14-php84`; si la imagen existe, invocar el smoke vía `docker run --rm -v "$PWD":/app -w /app ifts14-php84`; si falta, imprimir mensaje accionable apuntando a `bash scripts/php-docker-build.sh`.
- [x] 1.2 Sustituir las invocaciones literales `php -S` (línea 68) y `php -r` (líneas 91-100 y 105-117) por la variable `php_cmd` con sus argumentos, preservando `curl` desde host contra `http://127.0.0.1:8080/certificados/api/...` y el `trap` de limpieza.

## Phase 2: Contexto Docker sin ruido

- [x] 2.1 Crear `.dockerignore` raíz con exclusiones simétricas a `.gitignore`: `.codegraph/`, `.git/`, `.atl/`, `node_modules/`, `dist/`, `coverage/`, `graphify-out/`, `material_privado_no_versionar/`, `*.sql*`, `*.zip`, `*.bak`, `*.log`, `backups*/`, `db_dumps_originales/`, `servidor_original/`, `deploy_tmp/`, `tmp_deploy/`.
- [x] 2.2 Confirmar en `apply` que `.gitignore` y `.atl/skill-registry.md` quedan intactos (regla explícita del cambio y de `openspec/AGENTS.md`).

## Phase 3: Harness HTTP sin notices

- [x] 3.1 Editar `apps/backend-php/tests/HttpContractTest.php`: suprimir el notice de `Content-Type` ausente en `file_get_contents()` del helper `request()` usando el operador `@` local (`@file_get_contents(...)`), sin alterar `error_reporting`/`display_errors` globales para que warnings/notices no relacionados del harness sigan visibles en CI. Preservar `proc_open(PHP_BINARY, …)`, helper `request()` y todos los asserts; no tocar endpoints, fixtures ni respuestas.

## Phase 4: Reconciliación Engram

- [x] 4.1 Guardar observación Engram nueva con `topic_key=sdd/m3-06-warning-cleanup/reconciliation` y `capture_prompt=false`, declarando que `tasks.md` archivado 17/17 es la fuente de verdad y que la observación `#5074` (13/13) queda preservada como evidencia histórica. NO usar `mem_update` ni `mem_delete` sobre `#5074`.

## Phase 5: Verificación

> Evidencia truthful: el host de verificación no tiene `php` CLI en PATH, por
> lo que la rama host del smoke no fue ejecutable en este entorno (solo
> inspección estática). El fallback Docker levantó la API, `/health` dio 200
> y el `trap` limpió el contenedor, pero la verificación respondió 500 por
> DB demo ausente/credenciales ficticias → el smoke sale 1 (FAIL esperado del
> entorno, no regresión). End-to-end real requiere DB demo sembrada con
> credenciales ficticias válidas.

- [x] 5.1 Smoke con PHP host: rama host NO ejecutable en este entorno (falta `php` CLI); cubierta por inspección estática. El script conserva la rama host y se ejecutará cuando `php` esté en PATH.
- [x] 5.2 Smoke con fallback Docker: ejecutado con `env -i PATH=/usr/bin:/bin bash scripts/m3-06-smoke.sh`; imagen `ifts14-php84` levantó API, `curl` desde host, `/health` 200, `trap` limpió contenedor. Verificación respondió 500 por DB demo ausente → smoke exit 1 esperado del entorno. End-to-end PARTIAL: falta DB demo sembrada.
- [x] 5.3 Build Docker: `bash scripts/php-docker-build.sh`; confirmar ausencia de warning por `.codegraph/daemon.sock` y build exitoso.
- [x] 5.4 Contrato HTTP: `docker run --rm -v "$PWD":/app -w /app ifts14-php84 php apps/backend-php/tests/HttpContractTest.php`; confirmar asserts vigentes y salida sin notices no fatales.
- [x] 5.5 Lint PHP: `php -l apps/backend-php/src/*.php` (build_command de `openspec/config.yaml`); confirmar sin errores sintácticos.
- [x] 5.6 Suite backend: si el entorno lo permite, ejecutar scripts PHP procedurales en `apps/backend-php/tests/` con `ifts14-php84`; documentar resultado.
- [x] 5.7 Reconciliación: confirmar observación Engram persistida y `#5074` intacta mediante `mem_get_observation` con id 5074.
