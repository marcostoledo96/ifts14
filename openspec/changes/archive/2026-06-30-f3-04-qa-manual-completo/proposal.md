# Proposal: F3-04 — QA manual completo

## Intent

F3-04 es un ciclo **estrictamente documental y operativo** que registra la pasada manual de QA de la app Angular 20 de Marcos antes del build de entrega (F3-05). Es el primer ciclo F3 que ejecuta Mati (Marcos hizo F3-01, F3-02 y F3-03). Los 9 criterios de aceptación hard de la guía son los objetivos de verificación. Precedentes: F1-01 (auditoría de `muestra_pagina/`) y F1-02 (sistema visual v0) fueron ciclos Mati documentation-only sin spec delta; F3-04 sigue ese mismo patrón.

## Scope

### In Scope
- Crear `docs/frontend/03-qa-manual-f3-04.md` con el reporte completo de QA manual (build, responsive 360/390/430/tablet/desktop, teclado y foco, contraste, estados carga/vacío/error/éxito, consola, datos sensibles, pendientes).
- Ejecutar `npm run build` desde `apps/frontend-angular/` para documentar evidencia automática (exit code, output, warnings).
- 7 artefactos SDD en `openspec/changes/f3-04-qa-manual-completo/` (explore, proposal, design, tasks, apply-progress, verify-report, archive-report).
- Patch mínimo opcional a `docs/frontend/00-angular20-port-v0.md` con resumen de QA (decisión diferida a `sdd-archive`).

### Out of Scope
- F3-05 (build para `/certificados/`) y F3-06 (handoff a Marcos).
- Scaffolding o modificación de código Angular (la app ya está construida; F3-04 solo verifica).
- Modificar `muestra_pagina/` (solo lectura como referencia visual).
- Tocar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Agregar dependencias ni ejecutar deploy real.
- Auto-corregir errores de consola o issues de a11y (F3-04 documenta; ciclos futuros corrigen).
- Generar PDF/QR reales ni modificar `public_html`.
- Delta a la spec base `guia-matias-angular-windows` (ciclo operativo, no nueva capacidad).

## Capabilities

> This section is the CONTRACT between proposal and specs phases.

### New Capabilities
- None (F3-04 is operational/audit, not a new capability).

### Modified Capabilities
- None.

## Approach

Documentación pura, sin código de producto. Mati ejecuta la checklist manual en navegador (Chrome estable, DevTools abiertos) recorriendo las 4 features (landing, not-found, public-validation, admin) en 5 anchos. OpenCode estructura el reporte, ejecuta `npm run build` para evidencia de build, y produce los artefactos SDD. La QA manual y los tests automatizados (420/420 post F4-01) se distinguen explícitamente en el reporte.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `docs/frontend/03-qa-manual-f3-04.md` | New | Reporte de QA manual (~150-200 líneas). |
| `openspec/changes/f3-04-qa-manual-completo/` | New | 7 artefactos SDD (sin `specs/`). |
| `docs/frontend/00-angular20-port-v0.md` | Optional patch | Sección "Estado F3-04" con resumen y pendientes (diferido a `sdd-archive`). |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Mati no puede hacer la pasada manual en el ciclo | Medium | OpenCode estructura la checklist con celdas "pendiente de pasada manual"; `verify-report.md` declara estado real al cierre. |
| `npm run build` puede tener warnings/errores | Low | Se documenta con exit code y causa probable; no se auto-corrige. |
| Modificar código de Marcos sería violación CRITICAL | Low | Regla explícita: `git diff --name-only` solo contra docs y `openspec/changes/f3-04-*`. Cualquier otro path es blocker. |
| Console errors y a11y issues esperables | Medium | Se documentan como "pendientes" con severidad; no se corrigen en F3-04. |
| Auto-commit trap | Low | `AGENTS.md:21`: git solo con aprobación explícita de Mati + diff-confirmation gate. |
| Local `ahead 76` vs remote stale `origin/frontend/v0-design-system` | Low | Push requiere `--force-with-lease`; comparar contra `main` (no contra remote stale) en pre-push safety. |
| Tech debt observado (HeaderInstitucional, Tailwind budget) | Medium | F3-04 documenta, no corrige. Queda para ciclo posterior. |
| Confundir F3-03 (tests) con F3-04 (QA manual) | Low | El reporte distingue explícitamente "QA manual" de "tests automatizados". |

## Rollback Plan

F3-04 es un ciclo de documentación pura sin código de producto. El rollback consiste en:
1. Revertir el commit con `git revert <sha>` (solo con aprobación de Mati).
2. Eliminar `docs/frontend/03-qa-manual-f3-04.md` y `openspec/changes/f3-04-qa-manual-completo/`.
3. Revertir el patch a `docs/frontend/00-angular20-port-v0.md` si se aplicó.
4. No hay impacto en `apps/`, `muestra_pagina/`, ni runtime.

## Dependencies

- Ninguna dependencia externa. Se ejecuta sobre `frontend/v0-design-system` (HEAD `e399833`, synced con `origin/main`).
- Precedentes: F1-01, F1-02 (ciclos Mati documentation-only sin spec delta).

## Success Criteria

- [ ] El change directory `openspec/changes/f3-04-qa-manual-completo/` sigue las reglas OpenSpec (7 artefactos, sin `specs/`).
- [ ] El reporte de QA existe en `docs/frontend/03-qa-manual-f3-04.md` con secciones: Resumen ejecutivo, Build, Responsive, Teclado y foco, Contraste y legibilidad, Estados, Consola del navegador, Datos sensibles, Pendientes y blockers.
- [ ] El reporte incluye el resultado de `npm run build` (exit code, output, warnings).
- [ ] El reporte documenta la pasada manual en 5 anchos (360 px, 390 px, 430 px, tablet, desktop).
- [ ] El reporte documenta navegación por teclado y foco visible (Tab, Shift+Tab, Enter, Escape).
- [ ] El reporte documenta contrastes y legibilidad (WCAG AA).
- [ ] El reporte documenta los 4 estados (carga, vacío, error, éxito) por flujo.
- [ ] El reporte confirma 0 errores nuevos en consola del navegador.
- [ ] El reporte confirma: NO DNI completo en admin, NO tokens completos, NO claves admin en bundle, NO tokens en URL.
- [ ] El reporte distingue explícitamente "QA manual" de "tests automatizados" (420/420 post F4-01).
- [ ] `verify-report.md` confirma sdd-verify PASS sin hallazgos CRITICAL.
- [ ] El ciclo propone a Mati el commit (y push con `--force-with-lease`) con mensaje `test(frontend): documentar qa manual completo` — sin ejecutar git.

## Review Workload Forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | ~250 (1 reporte QA ~150 + 1 verify-report ~70 + 1 apply-progress ~25 + 1 archive-report ~40 + 6 SDD artifacts ~80 promedio + optional patch ~10) |
| Riesgo de exceder 400 líneas | **Low** (bien por debajo de 400) |
| PRs encadenados recomendados | **No** (single PR con `--force-with-lease` por local `ahead 76`) |
| Decisión antes de apply | **No** (Mati ya dio el alcance) |

## Open Questions

| # | Pregunta | Recomendación |
|---|----------|---------------|
| Q1 | Nombre del doc de QA | `docs/frontend/03-qa-manual-f3-04.md` (sigue numeración `00-`/`01-`/`02-`). |
| Q2 | Verificación de build | Sí, ejecutar `npm run build` y documentar el output. |
| Q3 | Profundidad de la pasada manual | Full pass por feature para flujo público; spot-checks para admin (menos crítico para release). |
| Q4 | Mensaje de commit | `test(frontend): documentar qa manual completo` (per F3-04 cycle definition, línea 1232). |
