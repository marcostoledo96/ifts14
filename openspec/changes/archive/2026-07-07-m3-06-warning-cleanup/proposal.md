# Propuesta: limpieza de advertencias M3-06

## Intención

Eliminar las 4 advertencias no bloqueantes del cierre `m3-06-final-angular-api-smoke` sin cambiar comportamiento de producto, deploy ni evidencia histórica. El objetivo es dejar el smoke local reproducible, el contexto Docker limpio, la salida de tests sin notices no fatales y la discrepancia de Engram reconciliada sin reescribir `#5074`.

## Alcance

### Incluido
- `scripts/m3-06-smoke.sh`: usar PHP del host si existe; si no, caer a la imagen Docker existente `ifts14-php84` y mostrar mensaje claro si falta.
- Crear `.dockerignore` raíz para excluir `.codegraph/` y ruido local/privado del build context, sin tocar `.gitignore`.
- `apps/backend-php/tests/HttpContractTest.php`: silenciar notices no fatales con cambio mínimo de harness.
- Registrar una observación/nota nueva que cierre la discrepancia `apply-progress 13/13` vs `tasks.md 17/17`, preservando `#5074`.

### Fuera de alcance
- Modificar `.atl/skill-registry.md`, `.gitignore`, material privado, vendor, deploy/cPanel, base de datos o runtime de producto.
- Reescribir artefactos archivados o alterar invariantes D0.

## Capacidades

### Capacidades nuevas
- Ninguna.

### Capacidades modificadas
- `repo-seguro`: el contexto Docker debe excluir metadata local, tooling y material privado.
- `backend-base-php-certificados`: el QA/smoke local debe poder ejecutarse con tooling Docker existente cuando falte PHP CLI en host.

## Enfoque

Aplicar correcciones quirúrgicas y reversibles: resolver comando PHP una vez en el smoke, agregar `.dockerignore` conservador, ajustar solo el harness de test y crear una nota Engram de reconciliación. No se agregan dependencias ni scripts paralelos.

## Áreas afectadas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `scripts/m3-06-smoke.sh` | Modificado | Fallback Docker para PHP CLI. |
| `.dockerignore` | Nuevo | Exclusiones de build context. |
| `apps/backend-php/tests/HttpContractTest.php` | Modificado | Salida de test sin notices no fatales. |
| Engram `sdd/m3-06-warning-cleanup/*` | Nuevo | Nota de reconciliación histórica. |

## Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Imagen `ifts14-php84` ausente | Media | Mensaje explícito: ejecutar `bash scripts/php-docker-build.sh`. |
| `.dockerignore` excluye algo necesario | Baja | No tocar fuentes usadas por el Dockerfile actual; verificar build. |
| Ocultar notice relevante | Baja | Limitar cambio al test harness; asserts siguen fallando ante contrato roto. |

## Plan de reversión

Revertir `proposal/spec/design/tasks/apply` del ciclo y los cambios en `scripts/m3-06-smoke.sh`, `.dockerignore`, `HttpContractTest.php` y la nota nueva. No tocar `#5074` ni archivos archivados.

## Dependencias

- Docker local y la imagen `ifts14-php84` construible con `scripts/php-docker-build.sh`.

## Criterios de éxito

- [ ] El smoke corre con PHP host o con Docker, y falla con mensaje claro si falta la imagen.
- [ ] El build Docker no advierte por `.codegraph/daemon.sock`.
- [ ] `HttpContractTest.php` no imprime notices no fatales.
- [ ] La discrepancia `13/13` vs `17/17` queda documentada en una observación nueva, sin modificar `#5074`.
