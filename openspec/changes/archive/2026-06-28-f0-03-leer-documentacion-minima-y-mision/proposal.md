# Propuesta: Leer documentación mínima y entender misión (F0-03)

## Why

F0-03 es el tercer y más importante ciclo del onboarding de Fase 1 de Matías. Produce una **síntesis operativa** que codifica el rol, alcance, fuentes de verdad y límites de Matías **antes** de iniciar trabajo de producto frontend (ciclos F1+). Sin esta evidencia autocontenida, los ciclos F1+ arrancarían sobre terreno implícito: Matías "habría leído" la documentación, pero no habría evidencia verificable de qué entendió ni hasta dónde llega.

La síntesis debe **enlazar** las 8 fuentes vigentes (`README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md`), no duplicarlas (regla de `docs/AGENTS.md:11`: "No duplicar documentación: enlazar la fuente vigente").

**Contexto crítico descubierto en la exploración:**
- `muestra_pagina/` **NO está vacía**: contiene la referencia v0 Next.js/React con 7 pantallas disponibles (prompts 4-10) y 12 pendientes (prompts 11-22). La regla estricta del spec base "si está vacía, bloquea UI final" no aplica en su forma literal; la regla efectiva hoy es "no inventar pantallas para flujos sin diseño aprobado".
- `apps/frontend-angular/` ya tiene scaffold Angular 20 hecho por Marcos (35/35 tests, build prod verde). F0-03 debe declarar "respetar scaffold existente, no rehacerlo".
- La spec base `guia-matias-angular-windows` tiene **9 Requirements** (no 11). F0-03 agregará el décimo.

## What Changes

- Se agrega **1 Requirement ADDED** a la spec base `guia-matias-angular-windows` bajo la capacidad `mision-matias-sintetizada`, con 4-5 escenarios Given/When/Then.
- Se crea **1 archivo de evidencia nuevo**: `docs/opencode/onboarding-matias-frontend.md` (resumen operativo consolidado de Matías).
- Opcional (decisión en `sdd-archive`): parche a `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:444` para corregir el nombre de rama stale (`docs/matias-onboarding-f0-02-f0-03` → `docs/matias-onboarding-f0-03`).
- **No se modifica código de producto**, `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `.htaccess`, migraciones ni deploy.
- **No se toca** `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- **No se toca** la rama F0-02 (`docs/matias-onboarding-f0-02-f0-03`) ni la rama de política Git (`docs/policy-git-switch-checkout`).

## Capabilities

> This section is the CONTRACT between proposal and specs phases.

### New Capabilities
- `mision-matias-sintetizada`: Evidencia documental de que Matías puede explicar su misión, alcance permitido, fuera de alcance, fuentes de verdad, estado real de `muestra_pagina/` y scaffold Angular, y política de evidencia por ciclo — todo sintetizado en un solo archivo que enlaza las 8 fuentes sin duplicarlas.

### Modified Capabilities
- None (el delta referencia la spec base `guia-matias-angular-windows` sin modificar requirements existentes).

## Impact

| Área | Impacto | Descripción |
|------|---------|-------------|
| `openspec/specs/guia-matias-angular-windows/spec.md` | Delta aditivo (sdd-archive) | Gana 1 Requirement ADDED con 4-5 scenarios |
| `docs/opencode/onboarding-matias-frontend.md` | Nuevo | Resumen operativo consolidado de Matías (~150-180 líneas) |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:444` | Opcional (sdd-archive) | Corregir nombre de rama stale → `docs/matias-onboarding-f0-03` |

## Approach

1. Producir un delta de spec mínimo y aditivo (1 Requirement, 4-5 Scenarios) que formalice la síntesis firmada de la misión de Matías.
2. Crear `docs/opencode/onboarding-matias-frontend.md` con secciones fijas: misión, alcance permitido, fuera de alcance, fuentes de verdad (enlazadas), estado real de `muestra_pagina/` y `apps/frontend-angular/`, evidencia por ciclo, prohibiciones, y links clave.
3. Ejecutar las 8 fases SDD sobre el change `f0-03-leer-documentacion-minima-y-mision`.
4. Cerrar con `sdd-verify` PASS y proponer a Matías los comandos Git exactos (sin ejecutarlos).

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `openspec/changes/f0-03-leer-documentacion-minima-y-mision/` | Nuevo | Proposal, spec delta, design, tasks, verify-report, apply-progress, archive-report |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Delta aditivo (sdd-archive) | 1 Requirement nuevo (~50 líneas) |
| `docs/opencode/onboarding-matias-frontend.md` | Nuevo | Evidencia del ciclo (~180 líneas) |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:444` | Opcional | 1 línea corregida |

## Risks

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Duplicación de documentación: el nuevo archivo repite info de las 8 fuentes | Media | Per `docs/AGENTS.md:11`, la síntesis debe ENLAZAR, no DUPLICAR; máximo 5-10 líneas por sección + links |
| `muestra_pagina/` no vacía: la regla original del spec base "si está vacía, bloquea" no aplica literalmente | Media | El spec delta traduce la regla al contexto actual: "no inventar pantallas para flujos sin diseño aprobado" (flujos 11-22) |
| Scaffold Angular preexistente: riesgo de que Matías quiera rehacerlo | Baja | Prohibición explícita en el spec scope y en el resumen operativo |
| Nombre de rama stale en `MATIAS_PROMPTS:444` | Baja | Se declara en proposal; se parchea en sdd-archive |
| Trampa de auto-commit: aprobar commit sin revisar diff | Baja | Verify-report insiste en diff-confirmation gate; comandos Git solo como propuesta |
| Material privado: listar contenido de `material_privado_no_versionar/` | Baja | El resumen solo nombra la carpeta y su regla, nunca su contenido |
| Tocar cambio activo de Marcos o ramas de otros | Baja | F0-03 trabaja exclusivamente en su change directory; verify-report confirma que el diff no cruza límites |

## Rollback Plan

Al ser un ciclo de documentación pura:
1. Eliminar la carpeta `openspec/changes/f0-03-leer-documentacion-minima-y-mision/`.
2. Eliminar `docs/opencode/onboarding-matias-frontend.md`.
3. Revertir el delta aditivo en `openspec/specs/guia-matias-angular-windows/spec.md` (sdd-archive).
4. Revertir el parche opcional de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:444` si se aplicó.
5. No hay dependencias, migraciones ni configuración que revertir.

## Dependencies

- Ninguna externa. La spec base `guia-matias-angular-windows` ya existe y es estable (9 Requirements).
- F0-01 y F0-02 archivados como referencia estructural.

## Success Criteria

- [ ] El change directory sigue la estructura OpenSpec completa: `proposal.md`, `design.md`, `tasks.md`, `specs/mision-matias-sintetizada/spec.md`, `verify-report.md`, `apply-progress.md`, `archive-report.md`.
- [ ] La spec base `guia-matias-angular-windows` gana exactamente 1 Requirement ADDED con 4-5 escenarios Given/When/Then cubriendo: (a) Matías puede explicar misión, alcance y fuera de alcance desde la síntesis; (b) la síntesis cita las 8 fuentes por nombre y las enlaza; (c) declara explícitamente el estado de `muestra_pagina/` (NO vacía, 7/19 pantallas) y su implicancia para F1+; (d) respeta el scaffold Angular existente en `apps/frontend-angular/` y no propone rehacerlo; (e) declara que el ciclo es documental (cero código de producto).
- [ ] Existe `verify-report.md` con veredicto PASS y sin hallazgos CRÍTICOS.
- [ ] Existe `docs/opencode/onboarding-matias-frontend.md` con secciones fijas: misión, alcance, fuera de alcance, fuentes de verdad, estado de `muestra_pagina/`, scaffold Angular, evidencia por ciclo, prohibiciones, y links a las 8 fuentes.
- [ ] El archivo de evidencia NO duplica contenido de las 8 fuentes — las ENLAZA (per `docs/AGENTS.md:11`).
- [ ] El archivo de evidencia NO contiene secretos, dumps, credenciales ni referencias al contenido de `material_privado_no_versionar/`.
- [ ] El ciclo cierra proponiendo a Matías el mensaje de commit convencional exacto `docs(matias): registrar onboarding frontend` — sin ejecutar Git por cuenta propia.

## Out of Scope

- F0-04+ (próximos ciclos de la Fase 1).
- Scaffolding o modificación de Angular (el scaffold ya está en `apps/frontend-angular/`; F1+ construirá sobre él).
- Tocar `muestra_pagina/` (solo lectura en este ciclo; F1+ lo usará como referencia).
- Modificar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Reanudar o modificar la rama F0-02 (`docs/matias-onboarding-f0-02-f0-03`).
- Reanudar o modificar la rama de política Git (`docs/policy-git-switch-checkout`).
- Resumir o abrir `material_privado_no_versionar/`.
- Instalar dependencias ni ejecutar builds.
- Inventar contratos API, PDF, QR o permisos.

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas (total) | **~350** (1 spec delta ~50 + 1 evidencia nueva ~180 + 1 verify-report ~80 + 1 apply-progress ~25 + 1 archive-report ~40 + 8 artefactos SDD ~80 promedio) |
| Riesgo de exceder presupuesto de 400 líneas | **Low to Moderate** (justo en el límite — monitorear en sdd-tasks) |
| PRs encadenados recomendados | **No** (single PR) |
| Estrategia de entrega | single-pr |
| Decisión necesaria antes de apply | **No** (Matías ya dio el alcance de F0-03) |

## Open Questions

1. ¿Confirmar el nombre del archivo de evidencia: `docs/opencode/onboarding-matias-frontend.md` (recomendado) vs. alternativas como `docs/opencode/onboarding-matias.md` o `docs/frontend/onboarding-matias.md`?
2. ¿Confirmar que el nuevo Requirement va en la spec base `guia-matias-angular-windows` (extendiéndola con el décimo Requirement) vs. en una spec nueva independiente?
3. ¿Confirmar que el parche de `MATIAS_PROMPTS:444` (rama F0-03) se aplica durante sdd-archive (corrigiendo el parche de F0-02)?
4. ¿El archivo de evidencia debe incluir una sección "Qué sigue" apuntando a los ciclos F1 (donde empieza el trabajo de producto)?
