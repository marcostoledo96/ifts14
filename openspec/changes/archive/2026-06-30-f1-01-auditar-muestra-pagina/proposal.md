# Proposal: Auditar `muestra_pagina/` (F1-01)

## Intent

F1-01 es el primer ciclo de la Fase 1 de Matías (Semana 1) y la primera tarea de producto del lado visual tras los tres ciclos de onboarding (F0-01, F0-02, F0-03). Su objetivo es producir una auditoría documental del estado actual de la referencia v0 en `muestra_pagina/`, confirmar que esa referencia cubre los prompts 4-10, y registrar que los prompts 11-22 ya están derivados a `MATIAS_PROMPTS_SDD_FASE2.md` (Fase 2). El ciclo es de documentación pura: no toca código Angular, no modifica `muestra_pagina/`, y deja la base lista para que F1-02 arranque el sistema visual sobre evidencia confirmada.

La síntesis operativa de F0-03 (`docs/opencode/onboarding-matias-frontend.md`, en la rama `docs/matias-onboarding-f0-03` pendiente de merge) establece el contexto operativo de Matías. F1-01 no depende de ese archivo en la rama actual.

La spec base `guia-matias-angular-windows` ya tiene el Requirement "Uso de `muestra_pagina/`" que cubre la regla de "no inventar pantallas sin diseño aprobado". Por eso, **F1-01 NO incluye delta aditivo a la spec base** — la auditoría como documento vigente es suficiente. Si en fases posteriores aparece un criterio nuevo portable, se decide en `sdd-archive`.

## Scope

### In Scope
- Nuevo documento de auditoría: `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (~150 líneas) con secciones: estado de `muestra_pagina/`, 7 pantallas disponibles con estados, 12 pendientes con referencia a Fase 2, riesgos de portado a Angular 20, próximos pasos.
- 8 artefactos OpenSpec en `openspec/changes/f1-01-auditar-muestra-pagina/` (proposal, design, tasks, apply-progress, verify-report, archive-report + explore ya creado).
- Lectura de `muestra_pagina/` solo a nivel estructura (`Get-ChildItem -Force`), `README.md`, `AGENTS.md`, `MANIFIESTO_V0.md`.
- Confirmación de que `MATIAS_PROMPTS_SDD_FASE2.md` ya enumera prompts 11-22 en bloques F4/F5/F6.

### Out of Scope
- F2+ (siguientes ciclos de Fase 1).
- Scaffolding o modificación de Angular (el scaffold de Marcos en `apps/frontend-angular/` ya existe: 35/35 tests, build verde).
- Modificar contenido de `muestra_pagina/` (solo lectura en este ciclo).
- Copiar componentes React/Next, hooks, rutas, `tsconfig.json` o `next.config.mjs`.
- Tocar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Retomar o modificar ramas no mergeadas de F0-02, policy change (`docs/policy-git-switch-checkout`) ni F0-03 (`docs/matias-onboarding-f0-03`).
- Tocar `material_privado_no_versionar/`, dumps, logs, secretos.
- Instalar dependencias ni ejecutar builds.
- Inventar pantallas finales sin diseño utilizable.

## Capabilities

> Contract with sdd-spec phase.

### New Capabilities
- None (F1-01 is operational/audit, not a new capability).

### Modified Capabilities
- None (the base spec `guia-matias-angular-windows` already covers the "no inventar pantallas" rule in Requirement "Uso de `muestra_pagina/`").

## Approach

Documentación pura, sin código de producto. Se verifica la estructura real de `muestra_pagina/` contra lo declarado en `MANIFIESTO_V0.md` (7 disponibles + 12 pendientes), se confirma que `MATIAS_PROMPTS_SDD_FASE2.md` ya tiene los prompts 11-22 listados, y se produce un solo documento de auditoría en `docs/frontend/`. El scaffold existente en `apps/frontend-angular/` se respeta tal cual.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` | New | Documento de auditoría (entregable permanente). |
| `openspec/changes/f1-01-auditar-muestra-pagina/` | New | 8 artefactos OpenSpec (proposal, design, tasks, apply-progress, verify-report, archive-report + explore). |
| `docs/frontend/00-angular20-port-v0.md` | Optional patch | Solo si la auditoría descubre datos faltantes; decisión diferida a `sdd-archive`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `MANIFIESTO_V0.md` no existe o no coincide | Low | Ya verificado en explore: existe (41 líneas) y coincide con estructura real. |
| `MATIAS_PROMPTS_SDD_FASE2.md` no tiene prompts 11-22 | Low | Ya verificado: existe (146 líneas), enumera F4/F5/F6. |
| Copiar React/Next literalmente | Low | Auditoría distingue diseño visual de código exportado; regla explícita en `AGENTS.md`. |
| F0-03 synthesis no está en rama actual | Medium | Documento de auditoría es autocontenido; cita F0-03 como "pendiente de merge" si lo menciona. |
| Auto-commit trap | Low | `AGENTS.md:21`: git solo con aprobación explícita de Mati + diff-confirmation gate. |
| Archivos grandes en `muestra_pagina/` | Low | `pnpm-lock.yaml` (129 KB), `prompts_stitch_v0_ifts14.md` (114 KB), 26 PNG: listar por nombre/tamaño/rol, nunca abrir. |

## Rollback Plan

F1-01 es un ciclo de documentación pura sin código de producto. El rollback consiste en:
1. Revertir el commit con `git revert <sha>` (solo si Mati lo aprueba).
2. Eliminar `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` y el directorio `openspec/changes/f1-01-auditar-muestra-pagina/`.
3. No hay impacto en `apps/`, `muestra_pagina/`, ni runtime.

## Dependencies

- Ninguna dependencia externa. F1-01 se ejecuta sobre la rama `frontend/v0-design-system` (HEAD `711e3ca`, synced con `origin/main`).
- Precedente estructural: F0-03 archive (8 artefactos OpenSpec) y Marcos's `frontend-angular-shell-public-validation-api-readiness`.

## Success Criteria

- [ ] El change directory `openspec/changes/f1-01-auditar-muestra-pagina/` sigue las reglas OpenSpec (8 artefactos).
- [ ] El documento de auditoría existe en `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` con las secciones requeridas.
- [ ] La auditoría confirma 7 pantallas disponibles y 12 pendientes, o explica diferencias.
- [ ] `muestra_pagina/MANIFIESTO_V0.md` verificado como existente y consistente.
- [ ] La auditoría distingue diseño visual de código fuente exportado.
- [ ] Prompts 11-22 referenciados a `MATIAS_PROMPTS_SDD_FASE2.md`.
- [ ] No se modifica código Angular en este ciclo.
- [ ] Se respeta el scaffold existente en `apps/frontend-angular/`.
- [ ] No se copian componentes React/Next.
- [ ] No se toca `material_privado_no_versionar/`.
- [ ] `verify-report.md` confirma sdd-verify PASS sin hallazgos CRITICAL.
- [ ] El ciclo propone a Mati el commit con mensaje `docs(matias): auditar muestra_pagina (F1-01)` — sin ejecutar git.

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas | ~300 (1 doc auditoría ~150 + 7 SDD artifacts ~80 promedio + verify-report ~70 + apply-progress ~25 + archive-report ~40) |
| Riesgo de exceder 400 líneas | **Low** |
| PRs encadenados | **No** (single PR sobre `frontend/v0-design-system`) |
| Decisión antes de apply | **No** (Mati ya dio el alcance) |

## Open Questions

| # | Pregunta | Recomendación |
|---|----------|---------------|
| Q1 | Nombre del doc de auditoría | `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (sigue convención de `00-angular20-port-v0.md`). |
| Q2 | Delta a spec base | **NO** — la regla ya está en el Requirement "Uso de `muestra_pagina/`". Si aparece criterio nuevo, diferir a `sdd-archive`. |
| Q3 | Patch a `00-angular20-port-v0.md` | Deferir a `sdd-archive`. Solo si la auditoría descubre datos faltantes. |
| Q4 | Mensaje de commit | `docs(matias): auditar muestra_pagina (F1-01)` — consistente con F0-02/F0-03. |
