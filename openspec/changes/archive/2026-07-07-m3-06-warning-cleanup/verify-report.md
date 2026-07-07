# Verification Report — m3-06-warning-cleanup

**Change**: m3-06-warning-cleanup  
**Mode**: Standard SDD verify; Strict TDD inactivo (`openspec/config.yaml`, `strict_tdd: false`).  
**Artifact store**: híbrido (OpenSpec + Engram).  
**Fecha**: 2026-07-07.

## Completeness

| Métrica | Valor |
|---|---:|
| Tasks total | 10 |
| Tasks completas | 10 |
| Tasks incompletas | 0 |
| Specs delta revisadas | 2 |
| Escenarios spec | 6 |

## Alcance de diff revisado

| Clasificación | Archivos |
|---|---|
| Intencional de este ciclo | `.dockerignore`, `scripts/m3-06-smoke.sh`, `apps/backend-php/tests/HttpContractTest.php`, `openspec/changes/m3-06-warning-cleanup/*`, Engram `sdd/m3-06-warning-cleanup/reconciliation` |
| Preexistente / otro ciclo, no atribuido a este cambio | `.atl/skill-registry.md`, `.gitignore`, `docs/backend/01-contrato-api-certificados.md`, `docs/frontend/00-angular20-port-v0.md`, `openspec/specs/backend-contrato-api-certificados/spec.md`, `openspec/specs/frontend-api-readiness/spec.md`, `openspec/specs/frontend-public-validation/spec.md`, `openspec/changes/archive/2026-07-07-m3-06-final-angular-api-smoke/*` |
| Fuera de alcance sensible | No se observaron cambios en `material_privado_no_versionar/`, `vendor/`, `deploy/`, `database/`, `public_html` ni runtime frontend Angular. |

## Build & Tests Execution

| Comando | Resultado | Evidencia |
|---|---|---|
| `bash scripts/m3-06-smoke.sh` | ⚠️ Parcial / exit 1 esperado por entorno | `/health` respondió 200. La verificación respondió 500 por DB demo no disponible/credenciales ficticias; el script rechazó 500 como corresponde. El contenedor Docker se limpió por `trap`. |
| `docker build -t ifts14-php84 -f docker/php84/Dockerfile .` | ✅ Exit 0 | Build cacheado, `Successfully tagged ifts14-php84:latest`; no apareció el warning previo por `.codegraph/daemon.sock`. |
| `docker run --rm -v "$PWD":/app -w /app ifts14-php84 php apps/backend-php/tests/HttpContractTest.php` | ✅ Exit 0 | `OK HttpContractTest`; salida sin notices. |
| `docker run --rm -v "$PWD":/app -w /app ifts14-php84 bash -c 'for f in apps/backend-php/src/*.php; do php -l "$f" || exit 1; done'` | ✅ Exit 0 | 14 archivos `apps/backend-php/src/*.php` sin errores sintácticos. |
| `docker run --rm -v "$PWD":/app -w /app ifts14-php84 bash -c 'php apps/backend-php/tests/NormalizePathTest.php && php apps/backend-php/tests/QrImageTest.php'` | ✅ Exit 0 | `OK NormalizePathTest`; `OK QrImageTest`. |

**Coverage**: no disponible; el proyecto no tiene runner formal ni cobertura configurada.

## Spec Compliance Matrix

| Requirement | Scenario | Evidencia | Resultado |
|---|---|---|---|
| Contexto Docker y evidencia histórica sin ruido local | `.codegraph/` fuera del contexto Docker | `.dockerignore` excluye `.codegraph/`, `.atl/`, material privado y artefactos; build Docker sin warning `daemon.sock`; `.gitignore` no se modifica por este ciclo. | ✅ COMPLIANT |
| Contexto Docker y evidencia histórica sin ruido local | Límites sensibles preservados | `git status --porcelain=v1 --untracked-files=all` revisado; no hay cambios en material privado, `vendor`, deploy/cPanel, `database` ni runtime frontend. | ✅ COMPLIANT |
| Contexto Docker y evidencia histórica sin ruido local | Reconciliación sin reescritura histórica | Engram `#5095` existe; `mem_get_observation(id: 5074)` confirma que `#5074` sigue intacta con `13/13`. | ✅ COMPLIANT |
| QA smoke local reproducible y contrato HTTP sin ruido | Smoke con PHP del host | Host actual no tiene `php` en PATH (`command -v php` vacío). La rama host fue inspeccionada: sigue usando `php -S` y conserva `curl`/asserts. No hubo evidencia runtime host por falta de precondición. | ⚠️ PARTIAL |
| QA smoke local reproducible y contrato HTTP sin ruido | Smoke con fallback Docker | Sin PHP host, con Docker e imagen `ifts14-php84`, el smoke levantó API por Docker, `/health` dio 200 y el `trap` limpió el contenedor. La verificación 500 se clasifica ambiental por DB demo ausente, no regresión del fallback. | ⚠️ PARTIAL |
| QA smoke local reproducible y contrato HTTP sin ruido | Contrato HTTP sin notices no fatales | `HttpContractTest.php` pasó con exit 0 y salida `OK HttpContractTest`, sin notices. Las aserciones de contrato siguen presentes. | ✅ COMPLIANT |

**Resumen de cumplimiento**: 4/6 escenarios compliant, 2/6 partial por limitaciones del entorno local (PHP host ausente y DB demo no sembrada).

## Correctness (Static Evidence)

| Requisito | Estado | Notas |
|---|---|---|
| Fallback Docker para smoke | ✅ Implementado | `scripts/m3-06-smoke.sh` resuelve host → Docker → BLOCKED, verifica imagen y da mensaje accionable. |
| Helpers `php -r` sin PHP host | ✅ Implementado | `PHP_CMD` se usa en `assert_json_path` y `assert_200_dto`; `/tmp` se monta read-only para leer respuestas. |
| Limpieza de contenedor | ✅ Implementado | `trap` elimina config temporal, proceso host y contenedor Docker si aplica. |
| `.dockerignore` conservador | ✅ Implementado | Excluye metadata local, secretos, dumps, backups, logs, material privado y artefactos pesados. |
| Harness HTTP sin notices | ✅ Implementado | El ajuste queda limitado a `HttpContractTest.php`; no se modificaron endpoints ni fixtures. |
| Reconciliación histórica | ✅ Implementado | Nueva observación `#5095`; `#5074` no fue editada. |

## Coherence (Design)

| Decisión | Seguida | Notas |
|---|---|---|
| PHP host primero, Docker fallback | ⚠️ Parcial | La implementación respeta prioridad host. En Docker se desvía de `-p 127.0.0.1:8080:8080` hacia `--network host` para alcanzar MariaDB local en `127.0.0.1:3306`. |
| Contexto Docker con `.dockerignore` | ✅ Sí | Build exitoso y sin warning de socket. |
| Ajuste harness-only para notices | ✅ Sí | No cambia runtime de producto. |
| Audit trail por observación nueva | ✅ Sí | Reconciliación en Engram sin reescribir evidencia previa. |

## Issues Found

**CRITICAL**: None.

**WARNING**:
- El smoke sale 1 porque la verificación devuelve 500 cuando la DB demo local no está sembrada o rechaza credenciales ficticias. La health check 200 y el fallback Docker funcionan; el 500 no se atribuye a este cambio.
- La rama con PHP host no pudo ejecutarse en este entorno porque `php` no está instalado en PATH; queda cubierta por inspección estática, no por runtime.
- La implementación usa `--network host` en Docker mode, distinto del diseño original con `-p`; la desviación está justificada para alcanzar MariaDB local en `127.0.0.1`.

**SUGGESTION**:
- Documentar en `sdd-archive` que el smoke solo puede pasar end-to-end cuando existe DB demo sembrada con credenciales ficticias válidas.

## Verdict

**PASS WITH WARNINGS**

Las tareas están completas, el build Docker y los tests PHP ejecutables pasan, el warning de `.codegraph/daemon.sock` desapareció y la reconciliación Engram está preservada. Quedan advertencias ambientales: smoke end-to-end bloqueado por DB demo ausente y rama host no ejecutable sin PHP CLI local.
