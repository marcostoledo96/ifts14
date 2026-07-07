# Diseño: limpieza de advertencias M3-06

## Enfoque técnico

Corrección quirúrgica de cuatro advertencias del cierre `m3-06-final-angular-api-smoke`, sin cambios de runtime, deploy, base de datos ni frontend. El diseño sigue las specs `repo-seguro` y `backend-base-php-certificados`: reutilizar tooling Docker existente, excluir ruido local del contexto Docker, limpiar el harness HTTP y reconciliar evidencia histórica sin reescribirla.

## Decisiones de arquitectura

| Decisión | Opción elegida | Alternativas descartadas | Fundamento |
|---|---|---|---|
| PHP para smoke | Priorizar PHP host; si falta, levantar `ifts14-php84` con puerto publicado `-p 127.0.0.1:8080:8080`, backend/config temporal montados y servidor PHP ligado a `0.0.0.0:8080` dentro del contenedor | Instalar PHP en host; crear script paralelo; usar Docker sin publicar puerto | Host `curl` debe llegar por `http://127.0.0.1:8080/...`; el binding interno `127.0.0.1` no sería alcanzable desde el host. |
| Contexto Docker | Crear `.dockerignore` raíz conservador | Tocar `.gitignore`; cambiar contexto de `docker build` | Docker no lee `.gitignore`; `.gitignore` queda fuera por auditoría. |
| Notices HTTP | Reproducir primero el notice en apply y ajustar solo `apps/backend-php/tests/HttpContractTest.php`; si se suprime, debe ser harness-only y conservar asserts | Modificar endpoints; cambiar todos los tests HTTP; ocultar fallas de contrato | La advertencia es del harness; las aserciones HTTP deben seguir fallando ante regresiones reales. |
| Audit trail | Nueva observación Engram de reconciliación | `mem_update` sobre `#5074`; editar archivos archivados | OpenSpec archivado es evidencia; la discrepancia se cierra con nota nueva. |

## Flujo de datos

```txt
scripts/m3-06-smoke.sh
  ├─ detecta php host ───────────────→ php -S 127.0.0.1:8080 / php -r
  └─ si falta php host:
       1. docker image inspect ifts14-php84 || mensaje para correr bash scripts/php-docker-build.sh
       2. docker run -d --name ifts14-m3-06-smoke-$$ \
            -p 127.0.0.1:8080:8080 \
            -v "$BACKEND_DIR":/app/apps/backend-php:ro \
            -v "$CFG":/tmp/m3-06-cfg.php:ro \
            -e CERTIFICADOS_CONFIG_PATH=/tmp/m3-06-cfg.php \
            ifts14-php84 php -S 0.0.0.0:8080 -t /app/apps/backend-php /app/apps/backend-php/index.php
       3. host curl sigue usando http://127.0.0.1:8080/certificados/api/...
       4. trap: docker rm -f "$CONTAINER" y rm -f "$CFG"

docker build -f docker/php84/Dockerfile .
  └─ .dockerignore excluye .codegraph/ y material no versionable

HttpContractTest.php → servidor embebido PHP → asserts HTTP existentes

tasks.md archivado 17/17 + Engram #5074 13/13 → observación nueva de reconciliación
```

## Cambios de archivos

| Archivo | Acción | Descripción |
|---|---|---|
| `scripts/m3-06-smoke.sh` | Modificar | Resolver PHP host primero. Si falta, verificar `ifts14-php84`, iniciar contenedor con `-p 127.0.0.1:8080:8080`, montar backend y config temporal, ligar `php -S` a `0.0.0.0:8080`, usar `curl` desde host contra `127.0.0.1:8080` y limpiar con `trap`. Si falta imagen, mensaje: `bash scripts/php-docker-build.sh`. |
| `.dockerignore` | Crear | Excluir `.codegraph/`, `.git/`, `.atl/`, `node_modules/`, `dist/`, `coverage/`, `graphify-out/`, `material_privado_no_versionar/`, dumps, zips, backups y logs. |
| `apps/backend-php/tests/HttpContractTest.php` | Modificar | En apply, reproducir primero el notice. Luego corregir el harness con el cambio mínimo; si se usa supresión, limitarla al harness y no a requests/asserts. |
| `openspec/changes/m3-06-warning-cleanup/tasks.md` | Crear | Plan de implementación y verificación. |
| `openspec/changes/m3-06-warning-cleanup/verify-report.md` | Crear | Evidencia de smoke, build Docker y test PHP. |
| `openspec/changes/archive/YYYY-MM-DD-m3-06-warning-cleanup/` | Crear durante archive | Mover el ciclo y preservar evidencia. |
| Engram `sdd/m3-06-warning-cleanup/reconciliation` | Crear | Nota nueva: `tasks.md` archivado es fuente de verdad 17/17; `#5074` queda intacta. |

No tocar: `.atl/skill-registry.md`, `.gitignore`, `material_privado_no_versionar/`, `vendor/`, `deploy/`, `database/`, `apps/frontend-angular/` ni rutas cPanel.

## Interfaces / contratos

No hay contratos HTTP nuevos. El contrato operativo interno del smoke conserva la misma invocación y resuelve PHP con prioridad host → Docker alcanzable por host → error accionable. En Docker, el servidor embebido corre dentro del contenedor en `0.0.0.0:8080`, se publica como `127.0.0.1:8080:8080`, y todos los `curl` del script siguen apuntando a `http://127.0.0.1:8080/certificados/api/...`.

## Estrategia de verificación

| Capa | Qué validar | Comando diseñado |
|---|---|---|
| Smoke | Health y verificación 200/404 con PHP host o Docker alcanzable desde host | `bash scripts/m3-06-smoke.sh`; probar host PHP si está disponible y Docker fallback en entorno sin `php` host o simulando PATH |
| Docker | Build sin warning por `.codegraph/daemon.sock` | `bash scripts/php-docker-build.sh` |
| Backend contrato | Reproducción inicial del notice, luego `HttpContractTest.php` sin notices y con asserts vigentes | `docker run --rm -v "$PWD":/app -w /app ifts14-php84 php apps/backend-php/tests/HttpContractTest.php` antes y después del ajuste |
| Backend suite | Unit/E2E procedurales si el entorno lo permite | scripts PHP existentes vía imagen `ifts14-php84` |

Angular no es necesario salvo que se toque runtime frontend; este diseño no lo toca.

## Migración / rollout

No requiere migración. Rollback: revertir estos tres cambios de código/config, eliminar la nota nueva de reconciliación y archivar/revertir artefactos del ciclo; no modificar `#5074`.

## Preguntas abiertas

Ninguna bloqueante.
