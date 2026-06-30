# Diseño: Leer documentación mínima y entender misión (F0-03)

## Contexto

F0-03 es el tercer y más importante ciclo del onboarding de Fase 1 de Matías. Produce una síntesis operativa que codifica su rol, alcance permitido, fuentes de verdad y límites **antes** de iniciar trabajo de producto frontend (ciclos F1+). Sin esta evidencia autocontenida, los ciclos F1+ arrancarían sobre terreno implícito: Matías "habría leído" la documentación, pero no habría evidencia verificable de qué entendió ni hasta dónde llega.

La síntesis debe **enlazar** las 8 fuentes vigentes (`README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md`), no duplicarlas (per `docs/AGENTS.md:11`). Dos hallazgos críticos del contexto actual: (a) `muestra_pagina/` **NO está vacía** — tiene v0 export con 7 pantallas disponibles (prompts 4-10) y 12 pendientes (prompts 11-22); (b) `apps/frontend-angular/` ya tiene el scaffold Angular 20 de Marcos (35/35 tests, build verde). F0-03 debe declarar ambos estados explícitamente para que F1+ no parta de supuestos erróneos.

## Decisiones técnicas

| Decisión | Alternativa | Elegida | Fundamento |
|----------|-------------|---------|------------|
| **(a) Estructura del archivo de síntesis** | Plan libre vs. secciones fijas | **9 secciones fijas** | Garantiza completitud y comparabilidad con F0-01/F0-02. Misión (3-5 líneas, qué hace Matías). Alcance permitido (bullets concretos de lo que SÍ). Fuera de alcance (bullets de lo que NO). Fuentes de verdad (descripción breve de cada una de las 8 fuentes, 1-2 líneas). Estado del proyecto (muestra_pagina/ 7/19, scaffold Angular preexistente). Qué sigue (apunta a F1+). Evidencia por ciclo (qué dejar al cerrar). Prohibiciones operativas (per AGENTS.md:21, con branch-confirmation gate). **Enlaces a las 8 fuentes** (sección standalone con los links explícitos y un párrafo por fuente, separada de "Fuentes de verdad" para que la spec acceptance checklist tenga 9 ítems verificables). |
| **(b) Integración con spec base** | Modificar ahora vs. delta aditivo + merge en archive | **Delta aditivo; merge en sdd-archive** | Evita tocar `guia-matias-angular-windows/spec.md` antes de verificar. El 10° Requirement se fusiona solo al cerrar, igual que F0-02. |
| **(c) Alcance de archivos modificados** | Tocar múltiples docs vs. 1 nuevo + parches archive | **1 nuevo + 2 parches archive** | La síntesis es el único entregable nuevo. El spec base y `MATIAS_PROMPTS:444` se tocan solo en `sdd-archive`, siguiendo el patrón de cierre. |
| **(d) Presupuesto de artefactos** | 7 vs. 8 artefactos SDD | **8 artefactos** | Igual que F0-02: explore, proposal, spec, design, tasks, apply-progress, verify-report, archive-report. El entregable permanente (`onboarding-matias-frontend.md`) está fuera del change directory. |

## Estructura de la entrega

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/explore.md` | Crear (HECHO) | Exploración del change |
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/proposal.md` | Crear (HECHO) | Propuesta con alcance y riesgos |
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/specs/mision-matias-sintetizada/spec.md` | Crear (HECHO) | Delta aditivo: 1 Requirement, 5 Scenarios |
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/design.md` | Crear (este archivo) | Diseño técnico del ciclo |
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/tasks.md` | Crear (posterior — sdd-tasks) | Plan de tareas jerárquico |
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/apply-progress.md` | Crear (posterior — sdd-apply) | Estado de implementación |
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/verify-report.md` | Crear (posterior — sdd-verify) | Veredicto PASS/FAIL |
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/archive-report.md` | Crear (posterior — sdd-archive) | Cierre y sincronización |
| `docs/opencode/onboarding-matias-frontend.md` | Crear (posterior — sdd-apply) | Síntesis operativa consolidada (~150-180 líneas) |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Modificar (sdd-archive) | Fusionar el 10° Requirement ADDED |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:444` | Modificar (sdd-archive) | Corregir rama stale → `docs/matias-onboarding-f0-03` |

## Plan de validación

| Comando / Check | Resultado esperado | Scenario cubierto |
|-----------------|-------------------|-------------------|
| `git status --short` | Solo untracked/modified dentro del change dir + el nuevo synthesis file | Scenario 5 (cero código de producto) |
| `git diff --name-only` | 1 file (spec base si se modifica en archive; 0 si no) | Scenario 5 |
| `git rev-parse --abbrev-ref HEAD` | `docs/matias-onboarding-f0-03` | Scenario 1 (rama correcta) |
| `git rev-parse HEAD` | `711e3ca` o descendiente (no commits agente) | Scenario 1 |
| `git remote get-url origin` | URL contiene `ifts14` | Scenario 1 |
| `git log origin/docs/matias-onboarding-f0-03..docs/matias-onboarding-f0-03 --oneline` | Vacío (pre-push) | Scenario 5 |
| Engram topics | 7+ observaciones bajo `sdd/f0-03-leer-documentacion-minima-y-mision/*` | Scenario 5 |
| `git grep -c "mision-matias-sintetizada" docs/opencode/onboarding-matias-frontend.md` | ≥ 1 | Scenario 2 |
| `git grep -c "muestra_pagina" docs/opencode/onboarding-matias-frontend.md` | ≥ 1 | Scenario 3 |
| `git grep -c "apps/frontend-angular" docs/opencode/onboarding-matias-frontend.md` | ≥ 1 | Scenario 3 |
| `git grep -c "material_privado_no_versionar" docs/opencode/onboarding-matias-frontend.md` | ≥ 1 | Scenario 4 |
| `git grep -c "secreto\|dump\|credencial\|DNI" docs/opencode/onboarding-matias-frontend.md` | 0 | Scenario 4 |
| Spec delta acceptance | 5/5 Scenarios con PASS en `verify-report.md` | Scenario 5 |
| Marcos change NO tocado | `openspec/changes/backend-public-endpoint-hardening/` sin cambios | Fuera de alcance |
| Ramas F0-02 y policy NO tocadas | Sin diff en esas ramas | Fuera de alcance |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Duplicación de documentación | Per `docs/AGENTS.md:11`, la síntesis enlaza, no duplica; máx. 200 líneas |
| `muestra_pagina/` no vacía: supuesto original erróneo | El spec delta declara estado real: 7/19 pantallas, no inventar flujos 11-22 |
| Scaffold Angular: riesgo de rehacer | Prohibición explícita en spec scope + declaración en síntesis |
| Auto-commit trap | Verify-report lista diff-confirmation gate; comandos Git solo propuesta |
| Material privado: listar contenido | Síntesis nombra solo la carpeta y su regla; grep check por secretos |
| Tocar cambio activo de Marcos o ramas ajenas | F0-03 trabaja exclusivamente en su change directory; verify confirma límites |
| `MATIAS_PROMPTS:444` stale | Se parchea en `sdd-archive`; se documenta en proposal |
| Presupuesto 400 líneas (~350 estimado) | Monitorear en `sdd-tasks`; surface a Mati si se acerca |

## Fuera de alcance

- F0-04+ (próximos ciclos).
- Scaffolding o modificación de Angular (ya existe; F1+ construye sobre él).
- Tocar `muestra_pagina/` (solo lectura; F1+ la usará).
- Modificar `openspec/changes/backend-public-endpoint-hardening/` (Marcos).
- Reanudar o modificar la rama F0-02 (`docs/matias-onboarding-f0-02-f0-03`) ni la rama de política Git (`docs/policy-git-switch-checkout`).
- Resumir o abrir `material_privado_no_versionar/`.
- Instalar dependencias o ejecutar builds.
- Inventar contratos API.

## Migración / Rollout

No se requiere migración. El ciclo es documental puro: no hay cambios de configuración, schema, datos ni deploy.

## Preguntas abiertas resueltas

1. **Nombre del archivo de evidencia**: `docs/opencode/onboarding-matias-frontend.md` (propuesta aceptada).
2. **Ubicación del spec delta**: extiende `guia-matias-angular-windows` como 10° Requirement (propuesta aceptada).
3. **Parche de `MATIAS_PROMPTS:444`**: sí, en `sdd-archive`, corrigiendo el nombre stale de F0-02 (propuesta aceptada).
4. **Sección "Qué sigue"**: sí, apunta explícitamente a ciclos F1+ (propuesta aceptada).
