# Apply Progress: mejorar-guia-matias-angular-windows

## Mode

Standard. Documentation-only slice; Strict TDD is not active and no code tests were run.

## Delivery

- Strategy: force-chained.
- Chain strategy: stacked-to-main, conceptual only.
- Current work unit: WU4 — referencias, checklist final y verificación spec → guía.
- Boundary: starts after WU3 detailed cycles F2-01..F3-06 and ends with final references, cross-cutting QA/security checklists, `sdd-archive` checklist, manual QA checklist by screen, final report template, proposed Git commands and spec-to-guide mapping.

## Completed Tasks

- [x] 1.1 Encabezado y ruta rápida.
- [x] 1.2 Misión y contexto operativo.
- [x] 1.3 Preparación de entorno Windows.
- [x] 1.4 Flujo OpenCode/Gentle-AI y SDD.
- [x] 1.5 Uso de `muestra_pagina/`.
- [x] 1.6 Política frontend, pruebas y QA.
- [x] 1.7 Errores comunes y límites.
- [x] 1.8 Plantilla de ciclo y cómo leer un ciclo.
- [x] 1.9 Plantilla de reporte final por ciclo.
- [x] 2.1 F0-01..F0-03 (preparación Windows + onboarding) con campos requeridos por ciclo.
- [x] 2.2 F1-01..F1-05 (auditoría v0, sistema visual, app Angular 20, Tailwind y layout base) sin instalar deps no aprobadas.
- [x] 2.3 Mini-troubleshooting F0-F1 (Windows/Git/Angular CLI/Tailwind).
- [x] 3.1 F2-01..F2-06 (features y componentes Angular) con QA manual detallada por ciclo.
- [x] 3.2 F3-01..F3-03 (servicios mock, conexión futura y tests básicos) con checklist específico por ciclo.
- [x] 3.3 F3-04 (QA manual completo) con checklist transversal de responsive, accesibilidad, estados, consola y datos sensibles.
- [x] 3.4 F3-05 (build para `/certificados/`) con `ng build --configuration production --base-href /certificados/` sin deploy real.
- [x] 3.5 F3-06 (handoff a Marcos) con reporte revisable y comandos Git propuestos sin ejecución automática.
- [x] 3.6 Mini-troubleshooting F2-F3 aplicable a build, rutas SPA, API PHP futura, datos sensibles y deploy estático.
- [x] 4.1 Referencias finales: índice de comandos PowerShell, fuentes de verdad y referencias OpenSpec.
- [x] 4.2 Checklist final de cierre con QA transversal y seguridad.
- [x] 4.3 Revisión de `docs/00-indice-general.md`: no requirió cambios porque la ruta y función de la guía no cambiaron.
- [x] 4.4 Mapeo spec → guía para los 8 requirements y scenarios.
- [x] 4.5 Verificación de límites: la guía no autoriza dependencias nuevas sin aprobación, material privado, Git automático, deploy, backend ni base de datos.
- [x] 4.6 Reporte final documental incorporado con comandos Git propuestos, no ejecutados.

## Verification Performed

- Read `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, frontend guide, `muestra_pagina/README.md`, tasks, spec and design.
- Confirmed WU1 tasks are marked `[x]` in `tasks.md`.
- Documentation-only review against WU1 scope: no Angular, PHP, database, dependencies, private material, branch, commit, push or PR changes.
- Read previous apply-progress from OpenSpec and Engram before editing, then merged WU2 progress with WU1 completions.
- Read `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md` and Angular 20 Tailwind docs via Context7 for command accuracy.
- Confirmed WU2 tasks are marked `[x]` in `tasks.md` after the update.
- Documentation-only WU2 review: only guide/tasks/apply-progress artifacts changed; no Angular, PHP, database, dependencies, private material, branch, commit, push or PR changes.
- Read previous apply-progress from OpenSpec and Engram before editing WU3, then merged WU3 progress with WU1-WU2 completions.
- Added detailed Semana 2 and Semana 3 cycles using the user-requested IDs F2-01..F3-06.
- Confirmed WU3 tasks are marked `[x]` in `tasks.md` after the update.
- Documentation-only WU3 review: only guide/tasks/apply-progress artifacts changed; no Angular, PHP, database, dependencies, private material, branch, commit, push, PR or deploy changes.
- Read previous apply-progress from OpenSpec and Engram before editing WU4, then merged WU4 progress with WU1-WU3 completions.
- Replaced the outdated “Mapa de ciclos pendientes” wording with final references/checklists/mapping because only WU4 remained before this slice.
- Added final references, cross-cutting checklist, `sdd-archive` checklist, manual QA checklist by screen, final report template, proposed Git commands and spec → guide mapping.
- Confirmed WU4 tasks are marked `[x]` in `tasks.md` after the update.
- Documentation-only WU4 review: only guide/tasks/apply-progress artifacts changed; no Angular, PHP, database, dependencies, private material, branch, commit, push, PR or deploy changes.

## Remaining Work Units

None. WU1-WU4 are complete.

## Deviations

None. Implementation matches the design and keeps the guide as one main file. `docs/00-indice-general.md` was not modified because the guide title/path/function remained current.

## Risks

- `openspec/config.yaml` does not exist in this repo; strict TDD mode was resolved from user-provided init state and documentation-only scope.
