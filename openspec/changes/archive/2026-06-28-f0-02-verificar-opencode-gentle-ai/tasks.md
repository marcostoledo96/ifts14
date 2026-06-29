# Tasks: F0-02 — Verificar flujo OpenCode/Gentle-AI

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas | ~250 (1 spec delta ~60 + 1 evidencia ~100 + 1 verify-report ~70 + 1 apply-progress ~20) |
| Riesgo de exceder presupuesto de 400 líneas | **Low** |
| PRs encadenados recomendados | **No** |
| Estrategia de entrega | single-pr |
| Decisión antes de apply | **No** (la confirmación del patch de MATIAS_PROMPTS es interna a sdd-tasks/sdd-apply, no bloquea apply) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Reporte F0-02 + 7 artefactos SDD | PR 1 | Único entregable; sin tests, solo docs |

## 1. Preparación

- [x] 1.1 Confirmar rama activa con `git rev-parse --abbrev-ref HEAD`; debe devolver `docs/matias-onboarding-f0-02-f0-03`.
- [x] 1.2 Registrar baseline del working tree con `git status --short`; verificar que solo aparecen paths esperados de fases SDD previas.
- [x] 1.3 Verificar que HEAD desciende de `9c631d0` (merge PR #6) con `git rev-parse HEAD`; documentar el hash actual (al cierre de la exploración es `11e0d3e`).
- [x] 1.4 Decisión tomada por Mati (2026-06-28, sesión actual): **SÍ, patchear F0-02 (línea 402) y F0-03 (línea 444) de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`** durante el apply, reemplazando la rama sugerida `docs/matias-onboarding-windows` por la rama operativa real `docs/matias-onboarding-f0-02-f0-03`. Adelantar el trabajo de F0-03 deja la guía consistente y evita que F0-03 tenga que volver a tocar este archivo.

## 2. Escritura del reporte de evidencia

- [x] 2.1 Crear `docs/opencode/verificacion-flujo-opencode-sdd.md` con las 5 secciones fijas: Objetivo del ciclo, Comandos ejecutados y resultados, Archivos tocados, Validaciones (mapping 1:1 con los 5 spec Scenarios), Bloqueos / riesgos materializados, Comandos Git SOLO propuestos.
- [x] 2.2 Llenar cada sección con evidencia concreta basada en el estado actual del repo (rama, hash HEAD, paths esperados, lista de prohibiciones respetadas).
- [x] 2.3 Validar manualmente que el reporte NO contiene secretos, dumps, credenciales, ni rutas privadas reales.
- [x] 2.4 Validar que el reporte declara el ciclo como documental puro (cero código de producto modificado).

## 3. Validación previa al verify

- [x] 3.1 Ejecutar `git status --short` y verificar que solo aparezcan paths esperados (artefactos SDD propios + `docs/opencode/verificacion-flujo-opencode-sdd.md`).
- [x] 3.2 Ejecutar `git diff --name-only` (si hay tracked changes) y verificar que NO hay paths bajo `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, `.htaccess`, `Dockerfile*`, `docker-compose*`.
- [x] 3.3 Listar filesystem de `openspec/changes/f0-02-verificar-opencode-gentle-ai/` y confirmar los 7 artefactos SDD propios (`explore.md`, `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `specs/verificacion-flujo-opencode-sdd/spec.md`).
- [x] 3.4 Confirmar que Engram tiene las observaciones `explore` (#28), `proposal` (#29), `spec` (#30), `design` (#31); después de sdd-apply se debe agregar `apply-progress`.

## 4. Cierre

- [x] 4.1 Esperar a que sdd-verify retorne PASS.
- [x] 4.2 Aplicar el patch de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` aprobado en 1.4: editar las líneas 402 y 444 cambiando la `Rama sugerida: docs/matias-onboarding-windows` por `Rama sugerida: docs/matias-onboarding-f0-02-f0-03` (referencias dentro de los ciclos F0-02 y F0-03 respectivamente). NO tocar otras líneas del archivo.
- [x] 4.3 Proponer al operador los comandos Git exactos (NO ejecutarlos): `git add openspec/changes/f0-02-verificar-opencode-gentle-ai/ docs/opencode/verificacion-flujo-opencode-sdd.md MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`, `git commit -m "docs(matias): verificar flujo opencode sdd (F0-02)"`, `git push origin docs/matias-onboarding-f0-02-f0-03` (pre-push con el diff-confirmation gate: `git log origin/<rama>..<rama> --oneline` + `git diff origin/<rama>..<rama> --stat`).
- [x] 4.4 Documentar en `apply-progress.md` la decisión final sobre el patch de `MATIAS_PROMPTS:402` (hecho o descartado con justificación).

## 5. Sanity final

- [x] 5.1 Confirmar que el working tree final sigue limpio o tiene solo los paths esperados.
- [x] 5.2 Confirmar que NO se ejecutó `git add` / `git commit` / `git push` por cuenta propia — eso queda para Mati.

## Decisiones tomadas por el operador

1. **Patch de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 402 y 444 — SÍ, aplicar durante el apply.** Decisión tomada por Mati el 2026-06-28 en la sesión actual (pregunta formulada por el orquestador antes de `sdd-apply`). Adelantar el trabajo de F0-03 deja la guía consistente y evita que F0-03 tenga que volver a tocar este archivo.
