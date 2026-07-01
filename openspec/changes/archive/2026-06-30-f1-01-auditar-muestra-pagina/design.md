# Design: Auditar `muestra_pagina/` (F1-01)

## Contexto

F1-01 es el primer ciclo de producto visual de Matías tras la onboarding (F0-01..F0-03). Produce una auditoría documental de la referencia v0 en `muestra_pagina/`, confirmando que los prompts 4-10 tienen 7 pantallas disponibles y que los prompts 11-22 ya están derivados a `MATIAS_PROMPTS_SDD_FASE2.md`. El ciclo es de documentación pura: no modifica código Angular, no toca `muestra_pagina/` ni `apps/frontend-angular/`.

La síntesis operativa de F0-03 (`docs/opencode/onboarding-matias-frontend.md`) existe en la rama `docs/matias-onboarding-f0-03` (pendiente de merge); F1-01 la menciona como precedente pero no depende de ella en la rama actual.

Los datos críticos ya existen: `muestra_pagina/MANIFIESTO_V0.md` declara el inventario (7 disponibles + 12 pendientes) y `MATIAS_PROMPTS_SDD_FASE2.md` enumera los prompts 11-22 en bloques F4/F5/F6. El objetivo de F1-01 es verificar y registrar, no crear desde cero.

## Decisiones técnicas

| # | Decisión | Detalle |
|---|---|---|
| (a) | Estructura del documento de auditoría | `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` con 7 secciones fijas: (1) Resumen ejecutivo, (2) Estado de `muestra_pagina/`, (3) Las 7 pantallas disponibles, (4) Las 12 pendientes, (5) Diseño visual vs código fuente exportado, (6) Riesgos para portar a Angular 20, (7) Próximos pasos. Cada sección justifica su existencia: (1) da la noticia en 2-3 oraciones; (2) declara la estructura real leída; (3) y (4) mapean prompts a pantallas; (5) evita copiar React/Next; (6) lista gaps técnicos; (7) orienta F1-02 y Fase 2. |
| (b) | Estrategia de integración con la spec | **NO** delta aditivo. La spec base `guia-matias-angular-windows` ya tiene el Requirement "Uso de `muestra_pagina/`" con la regla de no inventar pantallas sin diseño aprobado. F1-01 es operacional, no una nueva capacidad. sdd-spec se omite. |
| (c) | Patch opcional a `docs/frontend/00-angular20-port-v0.md` | Diferido a `sdd-archive`. Solo si la auditoría descubre información nueva que el port-v0 no tenga (por ejemplo, cantidad exacta de capturas o mapeo prompt-captura). |
| (d) | Artefactos del ciclo | 8 artefactos OpenSpec en `openspec/changes/f1-01-auditar-muestra-pagina/`: proposal (hecho), design (este archivo), tasks, apply-progress, verify-report, archive-report + explore ya creado. spec se salta. |

## Estructura de la entrega

| Archivo | Acción | Descripción |
|---|---|---|
| `openspec/changes/f1-01-auditar-muestra-pagina/explore.md` | Crear (hecho) | Exploración del ciclo. |
| `openspec/changes/f1-01-auditar-muestra-pagina/proposal.md` | Crear (hecho) | Propuesta del ciclo. |
| `openspec/changes/f1-01-auditar-muestra-pagina/design.md` | Crear (este archivo) | Diseño técnico del ciclo. |
| `openspec/changes/f1-01-auditar-muestra-pagina/tasks.md` | Crear (sdd-tasks) | Tareas de implementación. |
| `openspec/changes/f1-01-auditar-muestra-pagina/apply-progress.md` | Crear (sdd-apply) | Bitácora de aplicación. |
| `openspec/changes/f1-01-auditar-muestra-pagina/verify-report.md` | Crear (sdd-verify) | Reporte de verificación. |
| `openspec/changes/f1-01-auditar-muestra-pagina/archive-report.md` | Crear (sdd-archive) | Reporte de cierre y sync. |
| `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | Crear (sdd-apply) | Documento de auditoría principal (~150 líneas). |
| `openspec/changes/f1-01-auditar-muestra-pagina/` | Mover (sdd-archive) | Directorio completo a `openspec/changes/archive/2026-06-30-f1-01-auditar-muestra-pagina/`. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar opcional (sdd-archive) | Patch quirúrgico solo si surgen datos nuevos. |

## Plan de validación

| Comando / Check | Resultado esperado | Criterio de aceptación cubierto |
|---|---|---|
| `git status --short` | Solo archivos no rastreados dentro del directorio del cambio + el nuevo archivo de auditoría. | Entorno limpio, sin cambios accidentales en tracked files. |
| `git diff --name-only` | 0 cambios tracked; solo untracked. | No se modificó código existente. |
| `git rev-parse --abbrev-ref HEAD` | `frontend/v0-design-system` | Rama de trabajo correcta. |
| `git rev-parse HEAD` | `711e3ca` | Sin commits del agente en este ciclo. |
| `git remote get-url origin` | URL que contiene `ifts14`. | Repositorio correcto. |
| `git log origin/frontend/v0-design-system..frontend/v0-design-system --oneline` | Vacío (pre-push) | Sin commits locales pendientes de push. |
| `Get-ChildItem .\muestra_pagina -Force` | Lista solo nombres, sin abrir contenido. | Lectura estructural segura. |
| Engram topics | 7 observaciones bajo `sdd/f1-01-auditar-muestra-pagina/*`. | Pipeline SDD completo en memoria. |
| `git grep -c "7 pantallas" docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | ≥ 1 | El auditoría menciona las 7 disponibles. |
| `git grep -c "12 pendientes" docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | ≥ 1 | El auditoría menciona las 12 pendientes. |
| `git grep -c "MANIFIESTO_V0" docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | ≥ 1 | Referencia al manifiesto como fuente de verdad. |
| `git grep -c "MATIAS_PROMPTS_SDD_FASE2" docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | ≥ 1 | Referencia al documento de Fase 2. |
| `git grep -c "secreto\|dump\|credencial\|DNI\|token\|password" docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | 0 | Sin filtración de secretos. |
| `git grep -c "apps/frontend-angular" docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | ≥ 1 | Referencia al scaffold Angular existente. |
| `git grep -c "apps/\|muestra_pagina/\|material_privado_no_versionar/" docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | 0 fuera de referencias normativas | Sin scope creep. |
| Delta de spec | No existe delta (ciclo operacional). | La spec base ya cubre la regla. |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| `MANIFIESTO_V0.md` no existe o no coincide con la estructura | Ya verificado en explore mediante `Get-ChildItem -Force`. |
| `MATIAS_PROMPTS_SDD_FASE2.md` no existe o falta prompts 11-22 | Ya verificado en explore; el archivo existe con 146 líneas. |
| Copiar React/Next de `muestra_pagina/` | El diseño del ciclo establece auditoría de solo lectura; sin copias. |
| No hay modificaciones de código | Exclusión explícita de `apps/` y `muestra_pagina/` en el alcance. |
| La síntesis de F0-03 no está en la rama actual | Se menciona como contexto externo sin depender del archivo. |
| La spec base ya tiene la regla; delta redundante | Decisión documentada: no se añade delta. |
| Trampa de auto-commit | `AGENTS.md:21`: git solo con aprobación de Mati + diff-confirmation gate. |
| Material privado | Solo se nombra la carpeta y sus reglas; nunca su contenido. |
| Alcance externo (Marcos, ramas no mergeadas) | Exclusión explícita en el diseño y verificación. |
| Patch a `00-angular20-port-v0.md` podría no ser necesario | Diferido a `sdd-archive`; se aplica solo si hay datos nuevos. |
| Archivos grandes en `muestra_pagina/` (lockfile, stitch, 26 PNG) | Listado por nombre/tamaño/rol; nunca se abren. |

## Fuera de alcance

- F1-02 y ciclos siguientes de la Fase 1.
- Scaffolding o modificación del proyecto Angular (ya existe; este ciclo solo audita).
- Modificación del contenido de `muestra_pagina/` (solo lectura).
- Tocar el cambio activo de Marcos (`backend-public-endpoint-hardening/`).
- Retomar o modificar ramas no mergeadas (`docs/matias-onboarding-f0-03`, `docs/policy-git-switch-checkout`, `docs/matias-onboarding-f0-02-f0-03`).
- Abrir, listar o versionar `material_privado_no_versionar/`.
- Instalar dependencias o ejecutar builds.
- Copiar componentes React/Next.
- Inventar pantallas finales sin diseño utilizable.

## Preguntas abiertas resueltas

| # | Pregunta | Resolución |
|---|---|---|
| Q1 | Nombre del documento de auditoría | `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (sigue la convención de `00-angular20-port-v0.md`). |
| Q2 | Delta a la spec base | **NO** delta aditivo. La regla ya está en el Requirement "Uso de `muestra_pagina/`". sdd-spec se omite. |
| Q3 | Patch a `docs/frontend/00-angular20-port-v0.md` | Diferido a `sdd-archive`. Solo si la auditoría descubre datos faltantes. |
| Q4 | Mensaje de commit propuesto | `docs(matias): auditar muestra_pagina (F1-01)`. |
