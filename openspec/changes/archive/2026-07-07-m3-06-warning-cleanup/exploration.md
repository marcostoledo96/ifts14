# Exploración — m3-06-warning-cleanup

## Estado actual

El ciclo `m3-06-final-angular-api-smoke` quedó archivado el 2026-07-07 con veredicto `PASS WITH WARNINGS`. Quedaron cuatro advertencias no bloqueantes que este cambio (`m3-06-warning-cleanup`) busca eliminar en un único ciclo chico. El repositorio está en buen estado: backend PHP 8.4.21 con `docker/php84/Dockerfile` operativo, suite de tests procedurales verdes (6/6 unit + 4/4 E2E), `scripts/m3-06-smoke.sh` reproducible, y CI backend con Docker + MariaDB 10.6 pasando. No hay cambios de runtime pendientes ni deuda abierta sobre invariantes D0.

## Áreas afectadas

- `scripts/m3-06-smoke.sh` — requiere `php` CLI en PATH; sale 2 si no está.
- `docker/php84/Dockerfile` (build context raíz) — incluye `.codegraph/daemon.sock` por ausencia de `.dockerignore`.
- `apps/backend-php/tests/HttpContractTest.php` — emite notices PHP no fatales al ejecutar la suite.
- `sdd/m3-06-final-angular-api-smoke/apply-progress` (Engram obs #5074) — declara `13/13` mientras que `tasks.md` tiene `17/17` checkboxes marcadas.

Archivos no afectados (fuera de alcance por regla explícita): `.atl/skill-registry.md`, `.gitignore`. Tampoco se tocan `.codegraph/`, `material_privado_no_versionar/`, `apps/frontend-angular/`, `apps/backend-php/src/`, `database/`, `deploy/` ni `public_html`.

## Causa raíz por advertencia

### 1. Smoke local bloqueado por `php` CLI faltante

`scripts/m3-06-smoke.sh:32-35` exige `command -v php >/dev/null 2>&1` y sale 2 si no está. La causa raíz es operacional, no de código: el host de desarrollo actual no tiene `php` instalado y el script no ofrece ruta alternativa. La imagen Docker local `ifts14-php84` (construida por `scripts/php-docker-build.sh` con `docker/php84/Dockerfile`) ya tiene `php` 8.4 CLI con `pdo_mysql`, `mbstring`, `curl`, `zip`, `xml`, `gd` y `openssl` disponibles (verificado en M3-06 unit/E2E). Reutilizar esa imagen evita instalar PHP en el host y respeta la regla de preferir tooling existente.

Mecánica interna del script que debe preservarse: usa `php -S 127.0.0.1:8080` para arrancar el backend (línea 68) y `php -r` para helpers de assert JSON inline (líneas 91-100 y 105-117). Ambos se pueden invocar dentro de la imagen montando el repo.

### 2. Docker warning: `.codegraph/daemon.sock` en el build context

`scripts/php-docker-build.sh:8` corre `docker build -f docker/php84/Dockerfile .` con el directorio raíz como contexto. No existe un archivo `.dockerignore` en la raíz del repo (verificado: `glob **/.dockerignore` → 0 resultados). El `.gitignore` excluye `.codegraph/`, pero Git y Docker usan mecanismos independientes: Docker incluye en el contexto todo lo del árbol de archivos salvo lo que figure en `.dockerignore`. El socket Unix `.codegraph/daemon.sock` entra al contexto y Docker emite `sockets not supported` (warning, no error). El build termina pero ralentiza y contamina el contexto con metadata local de indexado.

Regla del proyecto en `AGENTS.md`: `.codegraph/` es metadata local no versionada. La capa Docker debe tratarlo igual: no incluirlo en el contexto.

### 3. `HttpContractTest.php` notices no fatales

`HttpContractTest.php:32-39` arranca el servidor embebido (`proc_open(PHP_BINARY, '-S', '127.0.0.1:'.port, ...)`) y dispara requests locales. La función `request()` (líneas 199-223) usa `stream_context_create(['http' => [...]])` + `file_get_contents()`. Cuando `$headers` está vacío (caso de los GETs a `/health`, `/no-existe`, `/admin/certificados/1/pdf`, `/admin/certificados/1/qr.png`, `/admin/certificados/1/entrega-manual`), el header del stream sale como cadena vacía y PHP 8.4 puede emitir notices de `file_get_contents` por configuración de contexto sin `Content-Type` o por la rama `Content-Type` en `Response::error()` cuando se cumplen condiciones de borde. La suite sigue verde (6/6 unit OK en M3-06) pero la salida limpia incluye esas notices que ensucian la verificación reproducible.

El test no configura `error_reporting` ni `display_errors` al inicio, a diferencia de cómo se reportan errores de PHP en otros tests. La convención para tests de servidor embebido es suprimir notices/warnings a nivel de runner y dejar que los asserts detecten fallos reales.

### 4. Engram `apply-progress` 13/13 vs `tasks.md` 17/17

Observación Engram `#5074` (`sdd/m3-06-final-angular-api-smoke/apply-progress`) cierra con la línea `Status: 13/13 tasks complete`. El artefacto `openspec/changes/archive/2026-07-07-m3-06-final-angular-api-smoke/tasks.md` contiene 17 checkboxes (`1.1` a `1.6` = 6, `2.1` a `2.5` = 5, `3.1` a `3.3` = 3, `4.1` a `4.3` = 3), todas marcadas `[x]`. La discrepancia ya está documentada como `discrepancia preservada` en el `archive-report.md` (línea 26) y en el `verify-report.md` (línea 17) con la regla explícita: `tasks.md` es la fuente de verdad.

Causa raíz: el reporte de apply consolidó tareas por fase en su métrica de status pero el conteo de cabecera quedó desfasado. No hay pérdida de información: las 17 tareas individuales sí están listadas con `[x]` dentro del cuerpo de la observación. El número solo aparece en la línea de status.

Decisión sobre archivo fuente: la observación archivada en `archive/2026-07-07-m3-06-final-angular-api-smoke/` es evidencia histórica (regla de `openspec/AGENTS.md`: "no borrar cambios archivados: son evidencia"). Reescribir `#5074` con `mem_update` alteraría la métrica original. La opción más segura es registrar la reconciliación en este nuevo cambio (`m3-06-warning-cleanup`) y dejar la observación original como está, con el `archive-report.md` ya explicando la discrepancia.

## Enfoques

### 1. Smoke local sin PHP CLI

| Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|
| A. Wrapper Docker en el mismo script: si `php` no está en PATH, usar `docker run --rm -v "$PWD":/app -w /app ifts14-php84 php ...` | Reutiliza la imagen ya construida; preserva la firma del script; cero dependencias nuevas; un solo archivo tocado. | Rama condicional en el script; la imagen `ifts14-php84` debe existir localmente (documentar prerequisito). | Bajo |
| B. Script nuevo `scripts/m3-06-smoke-docker.sh` que envuelve al actual | Aísla la ruta Docker del script principal. | Archivo nuevo; usuario debe recordar cuál correr; duplicación de lógica. | Bajo |
| C. Instalar `php` en el host (`apt install php8.4-cli`) | Caso nativo, sin wrapper. | Rompe regla explícita del usuario: "preferir tooling existente sobre instalar PHP en host o agregar dependencias". | Medio |

Recomendado: **A**. Modificar `m3-06-smoke.sh` para resolver un `php_cmd` al inicio (con fallback Docker al `ifts14-php84` ya disponible) y reemplazar las invocaciones literales `php -S` y `php -r` por la variable. La imagen ya cubre la suite y se documenta el prerequisito en el README del script.

### 2. `.codegraph/daemon.sock` en build context

| Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|
| A. Crear `.dockerignore` raíz excluyendo `.codegraph/`, `.atl/`, `.git/`, `node_modules/`, `dist/`, `coverage/`, `graphify-out/`, `material_privado_no_versionar/`, `backups*/`, `db_dumps_originales/`, `servidor_original/`, `*.sql*`, `*.zip`, `*.bak`, `deploy_tmp/`, `tmp_deploy/`, `*.log` | Aplica a todos los `docker build -f ... .`; un solo archivo nuevo; no toca `.gitignore` (regla explícita). | Archivo nuevo a mantener. | Bajo |
| B. Modificar el comando `docker build` para usar contexto limitado (ej. `docker build -f docker/php84/Dockerfile apps/backend-php` o directorio temporal) | Evita `.dockerignore`. | Rompe la firma actual del script; requiere cambios en `php-docker-build.sh` y CI workflow; menos limpio. | Medio |
| C. No hacer nada (aceptar el warning como ruido operativo) | Cero trabajo. | El warning persiste y la advertencia queda abierta indefinidamente. | Nulo |

Recomendado: **A**. Un `.dockerignore` raíz resuelve el warning sin tocar nada del flujo Git ni del workflow CI. La regla del proyecto ya excluye `.codegraph/` del versionado; replicar la exclusión en `.dockerignore` mantiene simetría sin modificar `.gitignore`.

### 3. Notices de `HttpContractTest.php`

| Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|
| A. Suprimir notices/warnings al inicio del test: `error_reporting(E_ERROR | E_PARSE); ini_set('display_errors', '0');` | Una o dos líneas al inicio del archivo; preserva la lógica del test; convención estándar para tests con servidor embebido. | Toca un archivo de test (no de producto). | Muy bajo |
| B. Investigar la causa específica y parchear el helper `request()` (ej. setear header `Content-Type: application/octet-stream` en GETs) | Corrige la causa raíz si la notice viene del cliente stream. | Toca lógica del test; puede no ser la causa real; más diff. | Bajo |
| C. Configurar `php.ini` o `error_reporting` a nivel del runner del script de test | No toca el test. | Afecta a todos los tests que se ejecuten en ese contexto; menos quirúrgico. | Bajo |

Recomendado: **A**. La notice es no fatal y la suite pasa; el camino más seguro es silenciar notices a nivel del archivo de test, sin tocar lógica ni aserts. El test no debe propagar ruido de PHP a la salida de CI. Si la investigación durante `apply` revela una causa raíz real (ej. header que falta en el server), se documenta como descubrimiento y se evalúa el fix en un ciclo aparte, no en este.

### 4. Reconciliación `apply-progress` 13/13 vs `tasks.md` 17/17

| Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|
| A. `mem_update` sobre la observación #5074 para corregir el status a `17/17` | Reconciliación directa; una sola observación queda consistente. | Modifica evidencia histórica (la observación original se pierde en el historial de Engram; rompe el contrato "el archivo archivado es audit trail"). | Muy bajo |
| B. Registrar la reconciliación en una observación nueva bajo `sdd/m3-06-warning-cleanup/explore` (o sub-artefacto), preservando `#5074` intacta | Preserva audit trail; deja trazabilidad explícita de que el conteo de Engram estaba desfasado; la observación archivada sigue diciendo lo que decía. | La observación #5074 queda con el `13/13` original; se necesita una nueva nota que apunte a la corrección. | Muy bajo |
| C. Reescribir el `archive-report.md` para "corregir" la métrica | Cambia la evidencia archivada. | Viola `openspec/AGENTS.md`: "no borrar cambios archivados: son evidencia"; reabre un ciclo cerrado. | Nulo (no recomendado) |

Recomendado: **B**. La regla del proyecto y de OpenSpec es clara: lo archivado no se modifica. La discrepancia ya está documentada en el `archive-report.md` y `verify-report.md` con la regla `tasks.md` como fuente de verdad. Este cambio (`m3-06-warning-cleanup`) deja una observación Engram explícita (`sdd/m3-06-warning-cleanup/apply-progress-reconciliation` o nota en el propio `explore`) que reconoce la discrepancia histórica y la cierra para futuros ciclos sin tocar la evidencia previa.

## Recomendación

Ejecutar el ciclo `m3-06-warning-cleanup` como un único cambio chico de 4 tareas independientes, sin acoplamiento entre sí:

1. Modificar `scripts/m3-06-smoke.sh` para soportar ejecución vía Docker cuando `php` no esté en PATH (resolver `php_cmd` con fallback a `docker run --rm ifts14-php84 php ...`).
2. Crear `.dockerignore` raíz con exclusiones simétricas a `.gitignore` (`.codegraph/`, `.atl/`, `node_modules/`, `dist/`, etc.). No modificar `.gitignore`.
3. Agregar `error_reporting(E_ERROR | E_PARSE); ini_set('display_errors', '0');` al inicio de `apps/backend-php/tests/HttpContractTest.php`.
4. Registrar en este cambio (`m3-06-warning-cleanup/explore` o sub-artefacto) la reconciliación del conteo `apply-progress` 13/13 vs `tasks.md` 17/17, preservando la observación Engram #5074 intacta.

Estimación de diff: ~30-60 líneas de cambios (smoke script: ~10-15, `.dockerignore`: ~20-30, test: 2, Engram note: 1 observación nueva). Bien dentro del presupuesto de 1000 líneas y del forecast de 80-110 del ciclo anterior. No se requieren tests nuevos (las suites existentes validan el cambio), no hay cambios de runtime de producto, no se tocan invariantes D0.

## Riesgos

- **R1**: si la imagen `ifts14-php84` no está construida localmente, el fallback Docker del smoke fallará con un mensaje críptico. Mitigación: el script debe detectar la imagen y dar un mensaje claro tipo "Ejecutar primero: `bash scripts/php-docker-build.sh`".
- **R2**: un `.dockerignore` muy permisivo podría romper el build de la imagen si en el futuro se necesita copiar algún archivo desde el contexto. Mitigación: el `Dockerfile` actual no hace `COPY` desde el contexto (sólo `docker-php-ext-install`), así que el `.dockerignore` puede ser conservador; revisar antes de mergear.
- **R3**: silenciar notices en `HttpContractTest.php` puede ocultar un bug real si la notice reaparece con un mensaje nuevo. Mitigación: si durante la ejecución de CI/verify se ve un nuevo tipo de notice, se reabre y se investiga; por ahora es `file_get_contents` conocido y no fatal.
- **R4**: Engram `mem_update` sobre #5074 rompería el audit trail. Mitigación: NO se usa `mem_update`; la reconciliación se hace con una observación nueva en este cambio.
- **R5**: bajo presupuesto de review (1000 líneas), las 4 tareas son seguras y no requieren chained PR; aún así el forecast debe confirmar `400-line budget risk: Low`.

## Listo para propuesta

Sí. El alcance está acotado, las cuatro tareas son independientes, ninguna toca `.atl/skill-registry.md` ni `.gitignore`, el presupuesto está holgado, y la raíz causal de cada advertencia está identificada con evidencia en código o en la observación Engram. La propuesta debe formalizar el cambio en un solo ciclo `sdd-propose` → `sdd-spec` → `sdd-design` → `sdd-tasks` → `sdd-apply` → `sdd-verify` → `sdd-archive`, sin chained PRs (single PR), con `verify` confirmando que el smoke corre end-to-end (idealmente con y sin `php` en PATH) y que la imagen Docker se construye sin warnings de sockets.
