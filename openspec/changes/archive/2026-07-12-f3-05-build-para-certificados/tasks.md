# Tasks: F3-05 — Build para `/certificados/`

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas | ~300 (1 spec NO se crea + 1 build report ~150 + 1 verify-report ~80 + 1 apply-progress ~30 + 1 archive-report ~50 + 7 SDD artifacts ~80 average + opcional 1 pequeño patch ~10) |
| Riesgo de exceder presupuesto de 400 líneas | **Low** (well under 400) |
| PRs encadenados recomendados | **No** (single PR con `--set-upstream` porque la rama es nueva) |
| Estrategia de entrega | single-pr |
| Decisión antes de apply | **No** (Mati ya dio el OK en la conversación) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: none
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Reporte de build + 7 artefactos SDD + patch opcional de port-v0 | PR 1 (single, sobre `qa/frontend-release-readiness`) | Base: `qa/frontend-release-readiness` HEAD `ca2f9c3`; `--set-upstream` en push. |

## Open Question

None — all 5 decisions resolved in the proposal.

## Phase 1 — Preparación

- [ ] 1.1 Confirmar rama activa con `git rev-parse --abbrev-ref HEAD`; debe devolver `qa/frontend-release-readiness`.
- [ ] 1.2 Registrar baseline del working tree con `git status --short`; debe estar limpio (solo el change dir untracked).
- [ ] 1.3 Confirmar HEAD en `ca2f9c3` con `git rev-parse HEAD`; sin commits del agente.
- [ ] 1.4 Confirmar que `apps/frontend-angular/angular.json` tiene `baseHref: "/certificados/"` en production (línea 41 aprox).

## Phase 2 — Ejecución del build y reporte

- [ ] 2.1 **PREREQUISITO — Mati debe ejecutar `cd apps/frontend-angular && npm ci`** (o `npm install`) para resolver el blocker de `node_modules`. Sin esto, el build falla. Si Mati no puede hacerlo en este momento, OpenCode documenta el blocker con acción correctiva.
- [ ] 2.2 Ejecutar `cd apps/frontend-angular && ng build --configuration production --base-href /certificados/`. Documentar exit code, output literal, errors, warnings.
- [ ] 2.3 Verificar que el directorio `dist/frontend-angular/browser/` (o el outputPath real) se generó. Listar los archivos generados con tamaños (`Get-ChildItem -Recurse | Select-Object Name, Length`).
- [ ] 2.4 Verificar que `dist/frontend-angular/browser/index.html` contiene `<base href="/certificados/">` en el `<head>`.
- [ ] 2.5 Crear `docs/frontend/04-build-validacion-f3-05.md` con las 8 secciones fijas según el design (Resumen ejecutivo, Comando ejecutado, Output del build, Artefactos generados, Tamaño del bundle, Errores y warnings, Base href verificada, Pendientes). Total: ~150 líneas.
- [ ] 2.6 Sección "Resumen ejecutivo": 2-3 oraciones (build verde/warning/blocker, base href verificada, artefactos generados, pendientes categorizados).
- [ ] 2.7 Sección "Comando ejecutado": literal `ng build --configuration production --base-href /certificados/`.
- [ ] 2.8 Sección "Output del build": verbatim output del `ng build` (exit code, output, errors, warnings).
- [ ] 2.9 Sección "Artefactos generados": lista de archivos en `dist/` con tamaños.
- [ ] 2.10 Sección "Tamaño del bundle": raw, transferido, gzip; warnings de CSS budget.
- [ ] 2.11 Sección "Errores y warnings": documentar cada uno con causa probable.
- [ ] 2.12 Sección "Base href verificada": confirmar `dist/.../index.html` tiene `<base href="/certificados/">`.
- [ ] 2.13 Sección "Pendientes": categorizar como blocker / high / medium / low.

## Phase 3 — Validación previa al verify

- [ ] 3.1 Ejecutar `git status --short` y verificar que solo aparezcan paths esperados (change dir untracked + new file untracked).
- [ ] 3.2 Ejecutar `git diff --name-only` y verificar 0 tracked changes.
- [ ] 3.3 Ejecutar `git diff --stat apps/frontend-angular/` y verificar 0 líneas modificadas (F3-05 es documental puro, no toca código de Marcos).
- [ ] 3.4 Ejecutar `git diff --stat dist/` y verificar 0 líneas (dist no versionado).
- [ ] 3.5 Listar filesystem de `openspec/changes/f3-05-build-para-certificados/` y confirmar los 7 artefactos SDD propios (sin spec, por la decisión de omitirla).
- [ ] 3.6 Verificar que el nuevo archivo de build `docs/frontend/04-build-validacion-f3-05.md` tiene 8 secciones (usar `Get-Content` + `Select-String -Pattern "^## "`).
- [ ] 3.7 Verificar que el archivo NO contiene secretos (`Select-String -Pattern "secreto|dump|credencial|real.*DNI"` debe ser 0) y que menciona los términos clave (`ng build`, `base-href`, `dist/`, `baseHref`, etc.). También verificar que contiene el output literal del build (sección 3): `Select-String "Build at:|complete\.\$"` ≥ 1.
- [ ] 3.8 Confirmar que Engram tiene las observaciones `explore`, `proposal`, `design`, `tasks` (las 4); después de sdd-apply se debe agregar `apply-progress`.

## Phase 4 — Cierre

- [ ] 4.1 Registrar el veredicto honesto de sdd-verify. Sin exit code preservado, usar `PARTIAL / EVIDENCIA HISTÓRICA NO REPRODUCIBLE`; PASS requiere regenerar el build y capturar su exit code.
- [ ] 4.2 Documentar en `apply-progress.md` la decisión final sobre el patch opcional de `docs/frontend/00-angular20-port-v0.md` (hecho o descartado con justificación). Decisión recomendada: SÍ, hacer el patch de 1-2 líneas con enlace al reporte.
- [ ] 4.3 Proponer al operador los comandos Git exactos (NO ejecutarlos):
      `git add openspec/changes/f3-05-build-para-certificados/ docs/frontend/04-build-validacion-f3-05.md [y el patch opcional de 00-angular20-port-v0.md]`
      `git commit -m "build(frontend): validar build certificados"`
      `git push -u origin qa/frontend-release-readiness` (pre-push con el diff-confirmation gate; como la rama es nueva, necesita `--set-upstream` para tracking).
- [ ] 4.4 Documentar en `apply-progress.md` que el ciclo NO se ejecutó `git add`/`git commit`/`git push` por cuenta propia — eso queda para Mati.

## Phase 5 — Sanity final

- [ ] 5.1 Confirmar que el working tree final sigue limpio o tiene solo los paths esperados.
- [ ] 5.2 Confirmar que NO se ejecutó `git add` / `git commit` / `git push` por cuenta propia — eso queda para Mati.

## Hard rules

- No modificar ningún archivo fuera de la creación de este `tasks.md`.
- No correr `git add`, `git commit`, `git push`, `git switch`, `git checkout`, `git merge`, PR, `git rebase` — el orchestrator surfacea esa decisión a Mati.
- No tocar `material_privado_no_versionar/`, secretos, dumps, logs.
- No tocar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- No modificar código de Marcos en `apps/frontend-angular/`.
- Si se descubre algo bloqueante, frenar y reportar.
