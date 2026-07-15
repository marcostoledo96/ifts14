# Proposal: F3-06 — Handoff a Marcos

## Intent

F3-06 es el **sexto y último ciclo de Fase 3**: un ciclo estrictamente documental que entrega a Marcos un handoff revisable con el estado completo del módulo `/certificados/`, evidencia de F3-04 (QA manual) y F3-05 (build), los 12 ciclos F4-F6 como roadmap, riesgos, pendientes y comandos Git propuestos para decisión humana. No introduce código de producto, no despliega, no modifica specs ni toca el cambio activo de Marcos (`backend-public-endpoint-hardening/`). Cierra formalmente la entrega de Mati y abre la puerta a los ciclos F4-F6.

## Scope

### In Scope
- Crear `docs/frontend/05-handoff-marcos-f3-06.md` (~250-300 líneas) con 9 secciones: Resumen ejecutivo, Estado de Mati en Fase 3, 7 PRs en cola, Resumen F3-04 (QA), Resumen F3-05 (build), Roadmap F4-F6 (12 ciclos), Riesgos y pendientes, Comandos Git propuestos, Decisiones requeridas de Marcos.
- Parchar `docs/frontend/00-angular20-port-v0.md` con 3 sub-entradas en "Ver también" (F3-04, F3-05, F3-06).
- Completar los 7 artefactos SDD estándar (explore, proposal, design, tasks, apply-progress, verify-report, archive-report). Sin `spec.md` (ciclo operacional, no nueva capacidad).
- Cerrar con `sdd-archive` (mover change dir a `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/`).

### Out of Scope
- Código de producto: no se modifica `apps/frontend-angular/src/**`, `package.json`, lockfiles ni `angular.json`.
- Scaffold Angular, dependencias, `npm install`/`npm ci`, build, deploy, `ng build`, copia a `public_html/`, configuración de servidor real.
- Modificar el cambio activo de Marcos: `openspec/changes/backend-public-endpoint-hardening/` (off-limits).
- Ramas F0 sin mergear (`frontend/v0-design-system`, etc.): no se hace merge, cherry-pick ni rebase.
- Tocar `muestra_pagina/` (sólo referencia visual), `material_privado_no_versionar/`, `database/`, `deploy/`, `apps/backend-php/`.
- Delta a `openspec/specs/`: F3-06 no introduce ni modifica capacidades.
- Implementar nada de F4-F6: F3-06 sólo **documenta** el roadmap, no ejecuta ni un solo ciclo posterior.
- Auto-commit: los comandos Git son PROPUESTOS; OpenCode NO ejecuta `git add`/`commit`/`push` por su cuenta.

## Capabilities

> Este ciclo no introduce ni modifica capacidades a nivel de spec. Es operacional.

### New Capabilities
- None

### Modified Capabilities
- None

## Approach

1. **Crear el handoff** (`docs/frontend/05-handoff-marcos-f3-06.md`) con las 9 secciones definidas, reusando evidencia de F3-04 (abstracta, el archivo no está en este árbol), F3-05 (reporte existente), y los 12 ciclos F4-F6 de la guía unificada (líneas 1485-1755).
2. **Parchar `00-angular20-port-v0.md`** con 3 entradas en "Ver también" para F3-04, F3-05 y F3-06.
3. **Completar artefactos SDD** (design, tasks, apply-progress, verify-report, archive-report) siguiendo el patrón F3-05.
4. **Archivar** con `sdd-archive` al directorio `archive/2026-07-12-f3-06-handoff-a-marcos/`.
5. **Proponer commit** a Mati con mensaje `docs(frontend): preparar handoff a marcos` + push a `origin/qa/frontend-release-readiness` (rama ya tracked, no necesita `--set-upstream`).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/frontend/05-handoff-marcos-f3-06.md` | Nuevo | Handoff a Marcos (~250-300 líneas, 9 secciones). |
| `docs/frontend/00-angular20-port-v0.md` | Patch menor | 3 sub-entradas en "Ver también" (~6 líneas). |
| `openspec/changes/f3-06-handoff-a-marcos/` | Completar | 6 artefactos SDD restantes (proposal, design, tasks, apply-progress, verify-report, archive-report). |
| `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/` | Nuevo (archive) | Directorio de archive tras `sdd-archive`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **R1 (MEDIO)**: `docs/frontend/03-qa-manual-f3-04.md` NO está en este árbol (commit `70008f0` sólo en `frontend/v0-design-system`). | Medium | El handoff describe F3-04 abstractamente (5 secciones con placeholders "Pendiente") y enlaza al archive de F3-04 si existe. |
| **R2 (MEDIO)**: 5 placeholders del F3-04 QA pendientes (Mati debe completar la pasada visual en navegador). | Medium | El handoff documenta explícitamente esta deuda; no es blocker para el cierre de F3-06. |
| **R5 (MEDIO)**: `.htaccess` SPA fallback para deep links en cPanel no validado. | Medium | El handoff lo lista como decisión de Marcos; F3-06 no toca `.htaccess` ni cPanel. |
| **R11 (MEDIO)**: Tentación de "empezar" F4-01 en el mismo commit. | Medium | El handoff es roadmap, no implementación. La guía línea 1312 lo prohíbe explícitamente. |
| **R3 (BAJO)**: 2 warnings CSS budget (14.31 kB + 13.70 kB) y 2 chunks unnamed carry-forward. | Low | Documentados en el handoff como pendiente futuro; no bloqueantes. |
| **R7 (BAJO)**: 7 PRs en cola para Marcos (5 mergeados, 2 pendientes: F3-04 + F3-05). | Low | El handoff los lista todos con status y acción requerida. |
| **R8 (BAJO)**: Auto-commit trap — Git commands son PROPUESTOS, no ejecutados. | Low | Comandos documentados como propuesta; Mati decide en su turno. |
| **R10 (BAJO)**: Off-limits scope (cambio activo de Marcos, ramas F0, `muestra_pagina/`, `material_privado_no_versionar/`). | Low | Verificación explícita en verify-report; out of scope documentado. |
| **R13 (BAJO)**: Si F3-05 PR no se mergea antes de F3-06, PR combinado diluye review. | Low | El handoff documenta ambas opciones (merge primero o PR combinado). |
| **R14 (BAJO)**: `node_modules` blocker puede reaparecer si Mati corre build de cero. | Low | El handoff menciona que F3-05 requirió `npm ci` previo. |

## Rollback Plan

Ciclo documental sin código de producto. Si el handoff tiene errores:
1. Corregir el documento antes de commitear (no hay código que revertir).
2. Si el patch a `00-angular20-port-v0.md` crea conflicto de merge, resolver manualmente o proponer issue a Marcos.
3. No commitear `dist/`, `node_modules/`, ni archivos de `material_privado_no_versionar/`.
4. Si Mati no aprueba el commit, el change dir queda listo para re-ejecutar apply con correcciones.

## Dependencies

- `explore.md` de F3-06 (ya creado en el change dir).
- `docs/frontend/04-build-validacion-f3-05.md` (reporte F3-05, fuente de evidencia).
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1279-1325 (definición F3-06) + 1485-1755 (roadmap F4-F6).
- Rama `qa/frontend-release-readiness` (HEAD `e8b3f56`, 1 commit adelante de `origin/main@ca2f9c3`, ya tracked en origin).

## Success Criteria

- [ ] El change directory tiene los 7 artefactos SDD estándar (explore, proposal, design, tasks, apply-progress, verify-report, archive-report); sin `spec.md`.
- [ ] `docs/frontend/05-handoff-marcos-f3-06.md` existe con las 9 secciones: Resumen ejecutivo, Estado de Mati en Fase 3, 7 PRs en cola, Resumen F3-04 (QA manual), Resumen F3-05 (build), Roadmap F4-F6, Riesgos y pendientes, Comandos Git propuestos, Decisiones requeridas de Marcos.
- [ ] El handoff referencia los 7 PRs (F0-02, F0-03, F1-01, F1-02, F3-04, F3-05, policy commits) con status y acción.
- [ ] El handoff documenta los 5 placeholders pendientes del F3-04 QA (Mati completa en navegador).
- [ ] El handoff documenta los 2 CSS budget warnings de F3-05 (carry-forward).
- [ ] El handoff lista `.htaccess` SPA fallback como decisión de Marcos.
- [ ] El handoff NO despliega, NO copia a `public_html`, NO modifica cPanel.
- [ ] El handoff NO contiene secretos, DNI real ni credenciales de producción.
- [ ] `verify-report.md` confirma sdd-verify PASS sin hallazgos CRITICAL.
- [ ] El ciclo termina con propuesta de commit a Mati (no se ejecuta Git automáticamente).
- [ ] Mensaje de commit propuesto: `docs(frontend): preparar handoff a marcos`.
- [ ] Push propuesto: `git push origin qa/frontend-release-readiness` (no `--set-upstream`, rama ya tracked).

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | **~280** (1 handoff ~200 + 1 verify-report ~70 + 1 apply-progress ~25 + 1 archive-report ~40 + 7 SDD artifacts ~80 avg + 1 doc patch ~10) |
| 400-line budget risk | **Low** (well under 400) |
| Chained PRs recommended | **No** (single PR a `qa/frontend-release-readiness`) |
| Decision needed before apply | **No** (Mati ya dio el scope) |
