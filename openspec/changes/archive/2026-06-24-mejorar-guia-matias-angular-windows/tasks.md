# Tasks: Reescribir guía de Matías como manual ejecutable Windows

## Review Workload Forecast

Estimated lines: 850-1000 (rewrite de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` + retoque opcional de `docs/00-indice-general.md`).
Split: WU1 base → WU2 F0-F1 → WU3 F2-F3 → WU4 cierre. Sin branches/commits/PRs reales en apply.

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

## Phase 1 — Estructura y secciones base (work unit 1)

- [x] 1.1 Encabezado y ruta rápida en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`.
- [x] 1.2 "Misión y contexto operativo": alcance Angular 20, fuentes de verdad, prohibiciones.
- [x] 1.3 "Preparación de entorno Windows": PowerShell para Node.js, npm, Angular CLI, Git, VS Code + `winget` + alternativa manual.
- [x] 1.4 "Flujo OpenCode/Gentle-AI y SDD": ciclos pequeños, TDD si aplica, `sdd-archive` obligatorio, reporte final.
- [x] 1.5 "Uso de `muestra_pagina/`" como referencia visual/funcional; bloqueo si está vacía.
- [x] 1.6 "Política frontend, pruebas y QA": checklist obligatoria (responsive, accesibilidad, carga/error/vacío, consola limpia, no regresión).
- [x] 1.7 "Errores comunes y límites": trabajo en `main`, saltear SDD, copiar React/Next, deps no aprobadas, inventar contratos, material privado.
- [x] 1.8 Plantilla de ciclo (objetivo, rama, leer, prompt, ejecutar/verificar, QA, no hacer, archive, commit) y mini-sección "Cómo leer un ciclo".
- [x] 1.9 Plantilla de "Reporte final por ciclo": resumen, archivos, pruebas, QA, bloqueos, docs, riesgos, comandos Git propuestos sin ejecutar.

## Phase 2 — Ciclos F0-01..F1-05 (work unit 2)

- [x] 2.1 F0-01..F0-03 (preparación Windows + onboarding) con los campos requeridos de la plantilla por ciclo.
- [x] 2.2 F1-01..F1-05 (auditoría v0, sistema visual, app Angular 20, Tailwind y layout base) sin instalar deps no aprobadas; referenciar `docs/frontend/00-angular20-port-v0.md`.
- [x] 2.3 Mini-troubleshooting al cierre aplicable a F0-F1 (Windows/Git/Angular CLI/Tailwind).

## Phase 3 — Ciclos F2-01..F3-06 (work unit 3)

- [x] 3.1 F2-01..F2-06 (features y componentes Angular) con QA manual detallada por ciclo.
- [x] 3.2 F3-01..F3-03 (servicios mock, conexión futura con API PHP y tests automáticos básicos) con checklist específico por ciclo.
- [x] 3.3 F3-04 (QA manual completo) con checklist transversal de responsive, accesibilidad, estados, consola y datos sensibles.
- [x] 3.4 F3-05 (build para `/certificados/`) con `ng build` y base href `/certificados/`, sin deploy real.
- [x] 3.5 F3-06 (handoff a Marcos) cubriendo reporte, archive, trazabilidad y comandos Git propuestos sin ejecución automática.
- [x] 3.6 Mini-troubleshooting al cierre aplicable a build, rutas y deploy estático.

## Phase 4 — Referencias, cierre y verificación (work unit 4)

- [x] 4.1 "Referencias" finales: índice de comandos PowerShell, tabla de fuentes de verdad, enlaces a `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md` y spec OpenSpec.
- [x] 4.2 "Checklist final de cierre": QA transversal (no regresión, consola limpia, accesibilidad) y seguridad (sin commits/push automáticos).
- [x] 4.3 Ajustar `docs/00-indice-general.md` solo si cambia el título/función de la guía; sin duplicar contenido.
- [x] 4.4 Verificar mapeo spec → guía: los 8 requirements con su scenario tienen sección o ciclo asignado.
- [x] 4.5 Verificar que la guía NO autoriza código, deps nuevas, acceso a `material_privado_no_versionar/` ni comandos Git ejecutados.
- [x] 4.6 Reporte final del ciclo SDD con archivos tocados, líneas estimadas, work units completados, cobertura de spec y comandos Git propuestos.
