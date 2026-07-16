# Design: F3-06 — Handoff a Marcos

## Contexto

F3-06 es el **sexto y último ciclo de Fase 3**: un ciclo estrictamente documental que entrega a Marcos un handoff revisable con el estado completo del módulo `/certificados/`, evidencia de F3-04 (QA manual) y F3-05 (build), los 12 ciclos F4-F6 como roadmap, riesgos, pendientes y comandos Git propuestos para decisión humana. No introduce código de producto, no despliega, no modifica specs ni toca el cambio activo de Marcos (`backend-public-endpoint-hardening/`). Cierra formalmente la entrega de Mati y abre la puerta a los ciclos F4-F6.

El precedente directo son los ciclos operativos F3-04 (QA manual transversal) y F3-05 (verificación de build), ambos de naturaleza documental y con siete artefactos SDD estándar. F3-06 sigue el mismo patrón estructural, pero sustituye el foco de QA/build por consolidación del handoff a Marcos.

Contexto crítico: Mati ya está sobre la rama `qa/frontend-release-readiness` (HEAD `e8b3f56`, 1 commit adelante de `origin/main@ca2f9c3`). F3-05 fue el commit anterior; F3-06 continúa sobre la misma rama sin necesidad de crear una nueva. `docs/frontend/03-qa-manual-f3-04.md` NO existe en este árbol (commit `70008f0` solo en `frontend/v0-design-system`), por lo que F3-04 se describe abstractamente en el handoff.

## Decisiones técnicas

### (a) Estructura del handoff

El entregable principal es `docs/frontend/05-handoff-marcos-f3-06.md` con nueve secciones fijas:

1. **Resumen ejecutivo** — 1-2 oraciones: ciclo cerrado, handoff listo, decisiones requeridas de Marcos.
2. **Estado de Mati en Fase 3** — Tabla con los 5 entregables cerrados (F2-04..F2-06 de admin + F3-04 QA + F3-05 build), rama, HEAD y evidencia.
3. **Estado de los 7 PRs en cola para Marcos** — F0-02, F0-03, F1-01, F1-02, F3-04, F3-05 y policy commits; status, rama y acción requerida.
4. **Resumen de F3-04 (QA manual)** — Descripción abstracta (el doc no está en este árbol): 5 secciones con placeholders "Pendiente" por diseño; Mati completa la pasada visual en navegador.
5. **Resumen de F3-05 (build)** — Comando ejecutado, output, 30 artefactos, base href verificada, 2 warnings CSS budget (carry-forward).
6. **Roadmap F4-F6** — Tabla con los 12 ciclos (F4-01..F4-04, F5-01..F5-04, F6-01..F6-04): objetivo one-liner, rama sugerida, estado (habilitado/pendiente/bloqueado) y decisión humana si aplica.
7. **Riesgos y pendientes** — Tabla con severidad, descripción, mitigación y ciclo siguiente sugerido.
8. **Comandos Git propuestos (NO ejecutados por OpenCode)** — Bloque verbatim con 5-6 comandos (`git status`, `git diff`, `git add`, `git commit`, `git push`).
9. **Decisiones requeridas de Marcos** — Lista explícita de 5-7 decisiones (merge F3-05 primero, pasada visual F3-04, F4-01+F4-02 acoplados/separados, prioridad admin-certifications vs certificate-detail-pdf, etc.).

Justificación: cada sección responde a una pregunta concreta de Marcos (¿qué cambió?, ¿qué validar?, ¿qué decidir?, ¿qué correr?).

### (b) Estrategia de integración con specs

No hay delta aditivo. El ciclo es operacional; la spec base (`guia-matias-angular-windows`) ya cubre el handoff bajo "Reporte final y propuestas Git". No se crea `spec.md` en el change dir.

### (c) Patch a `docs/frontend/00-angular20-port-v0.md`

En `sdd-archive`, agregar 3 sub-entradas en la sección "Ver también" (creada en F3-05) con enlaces a F3-04 (referencia abstracta), F3-05 (reporte existente) y F3-06 (handoff). ~6 líneas.

### (d) Patches opcionales

- `docs/opencode/` — solo si el flujo de trabajo con OpenCode cambió (no aplica en F3-06).
- `docs/00-indice-general.md` — solo si cambió una ruta vigente (no aplica; el handoff entra como doc de `docs/frontend/`, no como spec nueva).

### (e) Artefactos del ciclo

Siete artefactos SDD estándar: `explore.md` (listo), `proposal.md` (listo), `design.md` (este archivo), `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md`. Sin `spec.md`.

## Estructura de la entrega

| Archivo | Acción | Descripción |
|---|---|---|
| `openspec/changes/f3-06-handoff-a-marcos/explore.md` | Crear | Listo — exploración del ciclo. |
| `openspec/changes/f3-06-handoff-a-marcos/proposal.md` | Crear | Listo — propuesta con criterios de aceptación. |
| `openspec/changes/f3-06-handoff-a-marcos/design.md` | Crear | Este documento. |
| `openspec/changes/f3-06-handoff-a-marcos/tasks.md` | Crear | Downstream — `sdd-tasks`. |
| `openspec/changes/f3-06-handoff-a-marcos/apply-progress.md` | Crear | Downstream — `sdd-apply`. |
| `openspec/changes/f3-06-handoff-a-marcos/verify-report.md` | Crear | Downstream — `sdd-verify`. |
| `openspec/changes/f3-06-handoff-a-marcos/archive-report.md` | Crear | Downstream — `sdd-archive`. |
| `docs/frontend/05-handoff-marcos-f3-06.md` | Crear | Downstream — `sdd-apply`; handoff principal (~250-300 líneas). |
| `docs/frontend/00-angular20-port-v0.md` | Patch menor | En `sdd-archive`: 3 sub-entradas en "Ver también". |
| `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/` | Mover | En `sdd-archive`: todo el change dir. |

## Plan de validación

| Comando / Check | Resultado esperado | Acceptance criterion cubierto |
|---|---|---|
| `git status --short` | Solo untracked dentro del change dir + el nuevo handoff report. | Working tree limpio, sin cambios tracked no esperados. |
| `git diff --name-only` | 0 tracked changes (solo untracked). | F3-06 no modifica archivos versionados en apply. |
| `git rev-parse --abbrev-ref HEAD` | `qa/frontend-release-readiness` | Rama correcta de trabajo. |
| `git rev-parse HEAD` | `e8b3f56` + 1 nuevo commit (F3-06) encima, o `e8b3f56` si aún no se commiteó. | Base correcta de F3-05. |
| `git remote get-url origin` | URL conteniendo `ifts14` | Repo correcto. |
| `Select-String "^## "` en `05-handoff-marcos-f3-06.md` | 9 secciones | Estructura del handoff completa. |
| `Select-String "Marcos"` en handoff | ≥ 1 match | Handoff dirigido a Marcos. |
| `Select-String "F3-04\|F3-05"` en handoff | ≥ 1 match | Referencia a ciclos previos. |
| `Select-String "F4-F6\|F4-01\|F4-02"` en handoff | ≥ 1 match | Referencia a ciclos futuros. |
| `Select-String "secreto\|dump\|credencial\|real.*DNI"` en handoff | 0 matches | Sin filtración de secretos. |
| `git diff --stat apps/frontend-angular/` | 0 líneas modificadas | F3-06 no toca código de producto. |
| `Select-String "F3-04.*03-qa-manual\|F3-05.*04-build-validacion\|F3-06.*05-handoff"` en `docs/frontend/00-angular20-port-v0.md` | ≥ 3 coincidencias (las 3 sub-entradas del "## Ver también") | Patch del port-v0 aplicado correctamente. |
| `Test-Path` sobre los 7 artefactos SDD en el change dir | `True` × 7 (explore, proposal, design, tasks, apply-progress, verify-report, archive-report) | Completitud de artefactos. |
| `Test-Path` sobre `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/` | `True` (post `sdd-archive`) | Archive dir creado correctamente. |
| `Select-String "PR\|placeholder\|CSS budget\|\.htaccess"` en el handoff | ≥ 4 coincidencias (cubre los 4 success criteria específicos del proposal) | Contenido del handoff completo. |
| Spec delta acceptance | No aplica (ciclo operacional) | Los 12 success criteria del proposal son los targets de verify. |
| Marcos's active change | Sin tocar | `openspec/changes/backend-public-endpoint-hardening/` intacto. |
| Working tree final | 2 untracked (handoff report + change dir), 0 modified, 0 staged, HEAD `e8b3f56` | Estado consistente post-verify. |

## Riesgos y mitigaciones

| Riesgo | Severidad | Mitigación |
|---|---|---|
| `docs/frontend/03-qa-manual-f3-04.md` NO está en este árbol (commit `70008f0` solo en `frontend/v0-design-system`). | MEDIO | El handoff describe F3-04 abstractamente (5 secciones con placeholders "Pendiente") y enlaza al archive de F3-04 si existe. |
| 5 placeholders del F3-04 QA pendientes (Mati debe completar la pasada visual en navegador). | MEDIO | El handoff documenta explícitamente esta deuda; no es blocker para el cierre de F3-06. |
| `.htaccess` SPA fallback para deep links en cPanel no validado. | MEDIO | El handoff lo lista como decisión de Marcos; F3-06 no toca `.htaccess` ni cPanel. |
| F3-06 podría tentarse a "empezar" F4-01 en el mismo commit. | MEDIO | El handoff es roadmap, no implementación. La guía línea 1312 lo prohíbe explícitamente. |
| 2 warnings CSS budget (14.31 kB + 13.70 kB) y 2 chunks unnamed carry-forward. | BAJO | Documentados en el handoff como pendiente futuro; no bloqueantes. |
| 7 PRs en cola para Marcos (5 mergeados, 2 pendientes: F3-04 + F3-05). | BAJO | El handoff los lista todos con status y acción requerida. |
| Auto-commit trap — Git commands son PROPUESTOS, no ejecutados. | BAJO | Comandos documentados como propuesta; Mati decide en su turno. |
| Off-limits scope (Marcos's active change, F0 unmerged branches, `muestra_pagina/`, `material_privado_no_versionar/`). | BAJO | Exclusión explícita en out-of-scope y verificación de diff. |
| F3-05 PR no se mergea antes de F3-06 → PR combinado diluye review. | BAJO | El handoff documenta ambas opciones (merge primero o PR combinado). |
| `node_modules` blocker puede reaparecer si Mati corre build de cero. | BAJO | El handoff menciona que F3-05 requirió `npm ci` previo. |

## Fuera de alcance

- F4-01+ (ciclos siguientes de Fase 4; explícitamente out per guía línea 1312).
- Scaffolding o modificación de Angular (la app ya está construida).
- Tocar `muestra_pagina/` (solo referencia visual, read-only).
- Modificar el cambio activo de Marcos (`backend-public-endpoint-hardening/`).
- Deploy a servidor real o modificar `public_html`.
- Agregar nuevas dependencias.
- Mezclar pendientes con funcionalidades terminadas.
- Auto-fix de errores de build o a11y (F3-05 documentó; ciclos futuros corrigen).

## Preguntas abiertas resueltas

- **Q1 — Nombre del handoff**: `docs/frontend/05-handoff-marcos-f3-06.md`.
- **Q2 — Rama de trabajo**: `qa/frontend-release-readiness` (no se crea rama nueva; F3-05 ya la usó).
- **Q3 — Contenido del handoff**: 9 secciones fijas (resumen, estado, PRs, F3-04, F3-05, roadmap, riesgos, comandos Git, decisiones).
- **Q4 — F3-04 placeholders**: El handoff los documenta como pendiente para Mati.
- **Q5 — Commit message**: `docs(frontend): preparar handoff a marcos`.
- **Q6 — Push command**: `git push origin qa/frontend-release-readiness` (rama ya tracked, no requiere `--set-upstream`).
