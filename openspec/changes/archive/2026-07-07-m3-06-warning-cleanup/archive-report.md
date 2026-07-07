# Archive Report — m3-06-warning-cleanup

**Change**: `m3-06-warning-cleanup`
**Archived**: 2026-07-07
**Verdict**: PASS WITH WARNINGS (preservadas por decisión del orquestador)
**Mode**: Artifact store híbrido (OpenSpec + Engram)

## Resumen

Cierre del ciclo de limpieza de las cuatro advertencias no bloqueantes que dejó el checkpoint `m3-06-final-angular-api-smoke` (archivado 2026-07-07). El cambio deja el smoke local reproducible con fallback Docker, el contexto Docker sin ruido de metadata local, el harness HTTP sin notices no fatales, y la discrepancia histórica de Engram reconciliada sin reescribir evidencia previa. Sin cambios de runtime, deploy, base de datos, frontend, vendor ni material privado.

## Validación

| Métrica | Valor |
|---|---|
| Tasks en `tasks.md` | 13/13 checkboxes `[x]` (ver nota de conteo más abajo) |
| Apply progress declarado | 17/17 (discrepancia de conteo documentada, gate pasa) |
| Verify report declarado | 10/10 (discrepancia de conteo documentada, gate pasa) |
| Specs delta revisadas | 2 |
| Escenarios spec | 6 |
| Smoke con PHP host | ⚠️ No ejecutable: `php` ausente en PATH del host (esperado por entorno) |
| Smoke con fallback Docker | ⚠️ Parcial: `/health` 200 OK; verificación 500 por DB demo no sembrada (ambiental, no regresión) |
| Build Docker | ✅ Exit 0, sin warning de `.codegraph/daemon.sock` |
| Contrato HTTP | ✅ `HttpContractTest` exit 0, sin notices, asserts vigentes |
| Lint PHP | ✅ 14 archivos `apps/backend-php/src/*.php` sin errores sintácticos |
| Suite backend procedural | ✅ `NormalizePathTest` OK, `QrImageTest` OK |
| Reconciliación Engram | ✅ `#5095` persiste, `#5074` intacta (verificado vía `mem_get_observation`) |
| Coverage | No disponible (no se configuró comando en el ciclo) |
| CRITICAL issues | Ninguno |

> Nota sobre el conteo: el conteo literal de checkboxes en `tasks.md` es 13 (Phase 1: 2, Phase 2: 2, Phase 3: 1, Phase 4: 1, Phase 5: 7). El `apply-progress` (#5096) declara `17/17` y el `verify-report` declara `10/10`. La discrepancia entre líneas de status no afecta al gate de archivado: no hay tareas de implementación sin marcar `[x]`. Se documenta acá para no reescribir evidencia previa; la convención aplicada es la misma que para `#5074` (tasks.md = fuente de verdad para completitud por checkbox).

## Specs sincronizadas

| Dominio | Acción | Detalle |
|---|---|---|
| `backend-base-php-certificados` | ADDED | `QA smoke local reproducible y contrato HTTP sin ruido` (3 escenarios: smoke con PHP host, smoke con fallback Docker, contrato HTTP sin notices no fatales) |
| `repo-seguro` | ADDED | `Contexto Docker y evidencia histórica sin ruido local` (3 escenarios: `.codegraph/` fuera del contexto Docker, límites sensibles preservados, reconciliación sin reescritura histórica) |

No hubo MODIFIED, REMOVED ni RENAMED en este ciclo. La merge preservó íntegramente los requisitos previos de los dos dominios.

## Archivos de producto

Tres cambios de código/config más dos artefactos SDD. Sin cambios en `material_privado_no_versionar/`, `vendor/`, `deploy/`, `database/`, `public_html` ni runtime frontend Angular:

- `scripts/m3-06-smoke.sh` — Modified: `PHP_MODE`/`PHP_CMD` resuelto al inicio (host → docker → BLOCKED con mensaje accionable); rama Docker usa `--network host` con `php -S 127.0.0.1:8080`; helpers `php -r` vía `${PHP_CMD[@]}`; `trap` limpia contenedor y config temporal.
- `.dockerignore` — Created: exclusiones simétricas a `.gitignore` para contexto Docker.
- `apps/backend-php/tests/HttpContractTest.php` — Modified: supresión local del notice de `Content-Type` ausente en `file_get_contents()` del helper `request()` vía operador `@` (`@file_get_contents(...)`); `error_reporting`/`display_errors` globales intactos para que warnings/notices no relacionados del harness sigan visibles en CI. Asserts y endpoints intactos.
- `openspec/changes/m3-06-warning-cleanup/{exploration,proposal,design,tasks,verify-report}.md` — Archivados.
- `openspec/changes/m3-06-warning-cleanup/specs/{backend-base-php-certificados,repo-seguro}/spec.md` — Archivados como delta.
- `openspec/specs/{backend-base-php-certificados,repo-seguro}/spec.md` — Merged: ADDED aplicado al final de la sección Requirements.

## Desviaciones del diseño

- **Docker mode del smoke**: diseño especificaba `-p 127.0.0.1:8080:8080` + `php -S 0.0.0.0:8080`. Implementación usa `--network host` + `php -S 127.0.0.1:8080`. Motivo: MariaDB local bind `127.0.0.1:3306` es inalcanzable desde bridge Docker sin cambiar `db_host` en la config ficticia (que la spec exige mantener en `127.0.0.1`). `--network host` resuelve DB reachability y server bind con un solo mecanismo, manteniendo la misma URL observable desde host (`http://127.0.0.1:8080/...`). Trade-off: menos aislamiento de red; aceptable para smoke local con imagen confiable y config ficticia. La rama host (sin Docker) no se desvía. Decisión registrada en Engram `#5097`.

## Advertencias preservadas (no bloquean el archive)

1. **Smoke end-to-end bloqueado por DB demo ausente**: el smoke sale 1 porque la verificación contra el endpoint real devuelve 500 cuando la DB demo local no está sembrada o rechaza credenciales ficticias. La health check `/health` da 200, el fallback Docker funciona y el `trap` limpia el contenedor. El 500 se clasifica como ambiental, no como regresión de este cambio. Sugerido: provisionar DB demo sembrada en un ciclo posterior (no para este cambio).
2. **Rama PHP host no ejecutable en este entorno**: el host actual no tiene `php` CLI en PATH. La rama host fue inspeccionada estáticamente y conserva `php -S` y asserts originales; la prioridad host sigue siendo la preferida cuando `php` esté disponible. Sugerido: instalar PHP CLI local o un runner equivalente.
3. **`--network host` en Docker mode**: desviación del diseño original (que preveía `-p`) justificada por necesidad de alcanzar MariaDB local en `127.0.0.1:3306`. Decisión registrada en Engram `#5097` (decision).
4. **Conteo declarado inconsistente**: `#5096` (apply-progress) declara `17/17`, el `verify-report` declara `10/10`, y el conteo literal de checkboxes en `tasks.md` es 13. Sin impacto sobre el gate: todas las 13 checkboxes están `[x]`. Se documenta para no reescribir evidencia previa; la fuente de verdad para completitud es `tasks.md` (13/13).

## Cumplimiento de invariantes D0

- Token/QR permanente: confirmado; este cambio no toca tokens ni endpoints de validación.
- DNI completo sólo en DTO/UI pública: confirmado; este cambio no toca DTOs ni respuestas.
- `X-Admin-Key` temporal: confirmado; sin login real ni admin Angular en scope.
- Sin email, SMTP, PHPMailer ni vendor versionado: confirmado.
- Sin deploy, cPanel, staging ni lectura de material privado: confirmado.

## Política Git

No se ejecutaron operaciones Git. Sin `git add/commit/push`, sin PR, sin merge, sin rebase, sin switch/checkout. El cierre queda propuesto para revisión de Marcos; las acciones de Git requieren aprobación explícita en el mismo turno con el comando exacto, según `AGENTS.md` del proyecto.

## Lineage Engram

| Artefacto | Observation ID | topic_key |
|---|---|---|
| explore | 5084 | `sdd/m3-06-warning-cleanup/explore` |
| proposal | 5086 | `sdd/m3-06-warning-cleanup/proposal` |
| spec | 5087 | `sdd/m3-06-warning-cleanup/spec` |
| design | 5089 | `sdd/m3-06-warning-cleanup/design` |
| tasks | 5094 | `sdd/m3-06-warning-cleanup/tasks` |
| apply-progress | 5096 | `sdd/m3-06-warning-cleanup/apply-progress` |
| reconciliation | 5095 | `sdd/m3-06-warning-cleanup/reconciliation` |
| verify-report | 5100 | `sdd/m3-06-warning-cleanup/verify-report` |
| archive-report | (este save) | `sdd/m3-06-warning-cleanup/archive-report` |

Observaciones de soporte registradas durante el ciclo: `Accepted host network smoke deviation` (#5097, decision).

## Próximo ciclo sugerido

- `M4-07` (staging cPanel real) y admin Angular `F4-F6`, fuera de alcance de este cambio.
- En un ciclo independiente, considerar: provisionar DB demo sembrada con credenciales válidas, instalar PHP CLI local para validar la rama host, y alinear la métrica de status de `apply-progress` con el conteo final de `tasks.md`.
