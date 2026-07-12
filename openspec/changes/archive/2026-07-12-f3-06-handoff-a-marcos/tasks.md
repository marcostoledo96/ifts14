# Tasks: F3-06 — Handoff a Marcos

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas | ~300 (1 handoff ~200 + 1 verify-report ~80 + 1 apply-progress ~25 + 1 archive-report ~40 + 7 SDD artifacts ~80 average + opcional 1 pequeño patch port-v0 ~10) |
| Riesgo de exceder presupuesto de 400 líneas | **Low** (well under 400) |
| PRs encadenados recomendados | **No** (single PR, no `--set-upstream` porque la rama ya está tracked) |
| Estrategia de entrega | single-pr |
| Decisión antes de apply | **No** (Mati ya dio el OK en la conversación) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Handoff a Marcos + 7 artefactos SDD + patch opcional de port-v0 | PR 1 (single, sobre `qa/frontend-release-readiness`) | Base: `qa/frontend-release-readiness` HEAD `e8b3f56`; la rama ya está tracked, push sin `--set-upstream`. |

## Open Question

None — all 6 decisions resolved in the proposal.

## Phase 1 — Preparación

- [x] 1.1 Confirmar rama activa con `git rev-parse --abbrev-ref HEAD`; debe devolver `qa/frontend-release-readiness`.
- [x] 1.2 Registrar baseline del working tree con `git status --short`; debe estar limpio (solo el change dir y el build report de F3-05 untracked).
- [x] 1.3 Confirmar HEAD en `e8b3f56` con `git rev-parse HEAD`; F3-05 intacto, sin commits del agente.
- [x] 1.4 Confirmar que `docs/frontend/04-build-validacion-f3-05.md` está en este árbol (F3-05 deliverable) y que `apps/frontend-angular/dist/frontend-angular/` existe (F3-05 build output).

## Phase 2 — Escritura del handoff

- [x] 2.1 Crear `docs/frontend/05-handoff-marcos-f3-06.md` con las 8 secciones fijas (Resumen ejecutivo, Estado de Mati en Fase 3, Resumen F3-04, Resumen F3-05, Roadmap F4-F6, Riesgos y pendientes, Comandos Git propuestos, Decisiones requeridas de Marcos). Total: ~200 líneas.
- [x] 2.2 Sección "Resumen ejecutivo": 1-2 oraciones (ciclo cerrado, handoff listo, decisiones requeridas de Marcos).
- [x] 2.3 Sección "Estado de Mati en Fase 3": qué se completó (F3-04 QA manual + F3-05 build), 7 PRs en cola (F0-02, policy, F0-03, F1-01, F1-02, F3-04, F3-05), 2 pendientes de merge.
- [x] 2.4 Sección "Resumen de F3-04": QA manual descrito abstractamente (el doc no está en este árbol, hallazgos en `archive/2026-06-30-f3-04-qa-manual-completo/`). Mencionar los 5 placeholders pendientes de Mati.
- [x] 2.5 Sección "Resumen de F3-05": build con `base-href /certificados/`, 6.256s, 30 archivos, 2 warnings CSS budget. Referenciar al doc `04-build-validacion-f3-05.md`.
- [x] 2.6 Sección "Roadmap F4-F6": 12 ciclos (F4-01..F4-04, F5-01..F5-04, F6-01..F6-04) con objetivo, rama, estado y decisión humana.
- [x] 2.7 Sección "Riesgos y pendientes": CSS budget, unnamed chunks, `.htaccess` SPA fallback, F3-04 placeholders, `node_modules`.
- [x] 2.8 Sección "Comandos Git PROPUESTOS": lista verbatim (no ejecutados) para que Marcos mergee, valide o fuerce cambios.
- [x] 2.9 Sección "Decisiones requeridas de Marcos": qué necesita su sign-off antes de F4-01.

## Phase 3 — Validación previa al verify

- [x] 3.1 Ejecutar `git status --short` y verificar que solo aparezcan paths esperados (change dir untracked + new handoff untracked).
- [x] 3.2 Ejecutar `git diff --name-only` y verificar 0 tracked changes.
- [x] 3.3 Ejecutar `git diff --stat apps/frontend-angular/` y verificar 0 líneas modificadas (F3-06 es documental puro).
- [x] 3.4 Listar filesystem de `openspec/changes/f3-06-handoff-a-marcos/` y confirmar los 7 artefactos SDD propios (sin spec, por la decisión de omitirla).
- [x] 3.5 Verificar que el nuevo archivo de handoff `docs/frontend/05-handoff-marcos-f3-06.md` tiene 8 secciones (usar `Get-Content` + `Select-String -Pattern "^## "`).
- [x] 3.6 Verificar que el archivo NO contiene secretos y menciona los términos clave: `Select-String "Marcos"` ≥ 1, `Select-String "F3-04|F3-05"` ≥ 1, `Select-String "F4-F6|F4-01|F4-02"` ≥ 1, `Select-String "PR|placeholder|CSS budget|\.htaccess"` ≥ 4.
- [x] 3.7 Confirmar que Engram tiene las observaciones `explore`, `proposal`, `design`, `tasks` (las 4); después de sdd-apply se debe agregar `apply-progress`.

## Phase 4 — Cierre

- [x] 4.1 No se invoca sdd-verify en apply; queda para el orquestador.
- [x] 4.2 Documentar en `apply-progress.md` la decisión final sobre el patch opcional de `docs/frontend/00-angular20-port-v0.md`. Decisión aplicada: SÍ, hacer el patch de 3-6 líneas con sub-entradas para F3-04, F3-05 y F3-06, pero aplicarlo en `sdd-archive`.
- [x] 4.3 Proponer al operador los comandos Git exactos (NO ejecutarlos): `git add openspec/changes/f3-06-handoff-a-marcos/ docs/frontend/05-handoff-marcos-f3-06.md [y el patch opcional de 00-angular20-port-v0.md]`; `git commit -m "docs(frontend): preparar handoff a marcos"`; `git push origin qa/frontend-release-readiness`.
- [x] 4.4 Documentar en `apply-progress.md` que el ciclo NO se ejecutó `git add`/`git commit`/`git push` por cuenta propia — eso queda para Mati.

## Phase 5 — Sanity final

- [x] 5.1 Confirmar que el working tree final sigue limpio o tiene solo los paths esperados.
- [x] 5.2 Confirmar que NO se ejecutó `git add` / `git commit` / `git push` por cuenta propia — eso queda para Mati.

## Hard rules

- No modificar ningún archivo fuera de la creación de este `tasks.md`.
- No correr `git add`, `git commit`, `git push`, `git switch`, `git checkout`, `git merge`, PR, `git rebase` — el orchestrator surfacea esa decisión a Mati.
- No tocar `material_privado_no_versionar/`, secretos, dumps, logs.
- No tocar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- No modificar código de Marcos en `apps/frontend-angular/`.
- Si se descubre algo bloqueante, frenar y reportar.
