# Design: F3-04 — QA manual completo

## Contexto

F3-04 es un ciclo estrictamente documental y operativo que registra la pasada manual transversal de QA de la app Angular 20 de Marcos antes del build de entrega (F3-05). Es el primer ciclo de la Fase 3 que ejecuta Matías (Marcos hizo F3-01, F3-02 y F3-03). El ciclo sigue el patrón de los precedentes F1-01 (auditoría de `muestra_pagina/`) y F1-02 (sistema visual v0), ambos ciclos Mati documentation-only sin spec delta.

El entregable principal es `docs/frontend/03-qa-manual-f3-04.md`: un reporte de QA manual que documenta el resultado de la pasada en 5 anchos (360/390/430 px, tablet, desktop) contra los 9 criterios de aceptación hard de la guía. Mati ejecuta los clicks reales en navegador; OpenCode estructura el reporte, corre `npm run build` para evidencia automática y produce los artefactos SDD.

## Decisiones técnicas

| # | Decisión | Detalle |
|---|---|---|
| (a) | Estructura del reporte de QA | `docs/frontend/03-qa-manual-f3-04.md` con 9 secciones fijas: (1) Resumen ejecutivo, (2) Build, (3) Responsive, (4) Teclado y foco, (5) Contraste y legibilidad, (6) Estados, (7) Consola del navegador, (8) Datos sensibles, (9) Pendientes y blockers. Cada sección mapea 1:1 a un criterio hard de la guía; la tabla de resultados usa columnas `Flujo / Criterio / Resultado / Evidencia / Notas`. |
| (b) | Integración con la spec | **NO** delta aditivo. La spec base `guia-matias-angular-windows` ya cubre la checklist de QA manual en el Requirement "Política frontend, pruebas y QA". F3-04 es operacional; `sdd-spec` se omite. |
| (c) | Patch a `docs/frontend/00-angular20-port-v0.md` | Diferido a `sdd-archive`. Solo un enlace de 1-2 líneas al nuevo reporte de QA y una sección "Estado F3-04" con resumen de pendientes. |
| (d) | Artefactos del ciclo | 7 artefactos OpenSpec en `openspec/changes/f3-04-qa-manual-completo/`: explore (hecho), proposal (hecho), design (este archivo), tasks, apply-progress, verify-report, archive-report. **No** `specs/`. |

## Estructura de la entrega

| Archivo | Acción | Descripción |
|---|---|---|
| `openspec/changes/f3-04-qa-manual-completo/explore.md` | Crear (hecho) | Exploración del ciclo. |
| `openspec/changes/f3-04-qa-manual-completo/proposal.md` | Crear (hecho) | Propuesta del ciclo. |
| `openspec/changes/f3-04-qa-manual-completo/design.md` | Crear (este archivo) | Diseño técnico del ciclo. |
| `openspec/changes/f3-04-qa-manual-completo/tasks.md` | Crear (sdd-tasks) | Tareas de implementación. |
| `openspec/changes/f3-04-qa-manual-completo/apply-progress.md` | Crear (sdd-apply) | Bitácora de aplicación. |
| `openspec/changes/f3-04-qa-manual-completo/verify-report.md` | Crear (sdd-verify) | Reporte de verificación. |
| `openspec/changes/f3-04-qa-manual-completo/archive-report.md` | Crear (sdd-archive) | Reporte de cierre y sync. |
| `docs/frontend/03-qa-manual-f3-04.md` | Crear (sdd-apply) | Reporte de QA manual principal (~150-200 líneas). |
| `openspec/changes/f3-04-qa-manual-completo/` | Mover (sdd-archive) | Directorio completo a `openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/`. |
| `docs/frontend/00-angular20-port-v0.md` | Modificar opcional (sdd-archive) | Patch quirúrgico: enlace al reporte y sección de estado F3-04. |

## Plan de validación

| Comando / Check | Resultado esperado | Criterio de aceptación cubierto |
|---|---|---|
| `git status --short` | Solo untracked: change dir + `docs/frontend/03-qa-manual-f3-04.md`. | Entorno limpio, sin cambios accidentales en tracked files. |
| `git diff --name-only` | 0 tracked changes (solo untracked). | No se modificó código existente. |
| `git rev-parse --abbrev-ref HEAD` | `frontend/v0-design-system` | Rama de trabajo correcta. |
| `git rev-parse HEAD` | `e399833` | Sin commits del agente en este ciclo. |
| `git remote get-url origin` | URL que contiene `ifts14`. | Repositorio correcto. |
| `Get-Content docs/frontend/03-qa-manual-f3-04.md \| Select-String "^## "` | Count = 9 (las 9 secciones obligatorias). | Estructura del reporte completa. |
| `Select-String "build"` en reporte | ≥ 1 match. | Sección Build presente. |
| `Select-String "360\|390\|430\|responsive"` en reporte | ≥ 1 match. | Sección Responsive presente. |
| `Select-String "carga\|vacío\|error\|éxito\|estado"` en reporte | ≥ 4 matches. | Sección Estados presente. |
| `Select-String "DNI\|token\|contraseña\|password\|clave"` en reporte | ≥ 1 match. | Sección Datos sensibles presente. |
| `Select-String "secreto\|dump\|credencial\|real.*DNI"` en reporte | 0 matches. | Sin filtración de secretos reales. |
| `Select-String "build\|webpack\|bundle"` en reporte | ≥ 1 match. | Proceso de build documentado. |
| `git diff --stat` sobre `apps/frontend-angular/` | 0 líneas modificadas. | F3-04 es documentation-only. |
| Delta de spec | No existe delta (ciclo operacional). | La spec base ya cubre la regla. |
| Marcos active change | `backend-public-endpoint-hardening/` sin cambios. | Off-limits respetado. |
| Unmerged branches | Sin modificaciones. | Off-limits respetado. |
| Engram topics | 7 observaciones bajo `sdd/f3-04-qa-manual-completo/*`. | Pipeline SDD completo en memoria. |
| Working tree | 2 untracked, 0 modified, 0 staged. | HEAD sin cambios en `e399833`. |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Mati debe hacer la pasada manual (clicks reales). | OpenCode provee la checklist estructurada; Mati completa las celdas de resultado. |
| `npm run build` puede tener warnings/errores. | Se documenta exit code y output sin auto-corregir. |
| Modificar código de Marcos sería violación CRITICAL. | `git diff --stat apps/frontend-angular/` = 0 líneas como gate obligatorio. |
| Console errors y a11y issues esperables. | Se documentan como "pendientes" con severidad (blocker/high/medium/low); no se corrigen. |
| No spec delta (ciclo operacional). | `sdd-spec` se omite; los 9 criterios de la guía son los verify targets. |
| Auto-commit trap (`AGENTS.md:21`). | Git operations solo con aprobación de Mati + diff-confirmation gate; verify-report lista comandos como propuesta. |
| Local `ahead 76` vs remote stale. | Push requiere `--force-with-lease` tras aprobación de Mati; comparar contra `main`. |
| Off-limits: Marcos active change, F0 unmerged branches. | Exclusión explícita en diseño y verificación. |
| Tech debt observado (HeaderInstitucional, Tailwind budget). | Se documenta como "pendiente" en el reporte; no se corrige en F3-04. |

## Fuera de alcance

- F3-05 (build para `/certificados/`) y F3-06 (handoff a Marcos).
- Scaffolding o modificación de código Angular (la app ya está construida; F3-04 solo verifica).
- Tocar `muestra_pagina/` (solo lectura).
- Modificar el cambio activo de Marcos (`backend-public-endpoint-hardening/`).
- Agregar nuevas dependencias.
- Auto-corregir errores de consola o issues de a11y (F3-04 documenta; ciclos futuros corrigen).
- Deploy a servidor real ni modificar `public_html`.
- Generar PDF/QR reales.

## Preguntas abiertas resueltas

| # | Pregunta | Resolución |
|---|---|---|
| Q1 | Nombre del doc de QA | `docs/frontend/03-qa-manual-f3-04.md` (sigue numeración `00-`/`01-`/`02-`). |
| Q2 | Verificación de build | Sí, ejecutar `npm run build` y documentar output. |
| Q3 | Profundidad de la pasada manual | Full pass por feature en flujo público; spot-checks en admin (menos crítico para release). |
| Q4 | Mensaje de commit | `test(frontend): documentar qa manual completo`. |
