# Diseño: Verificar OpenCode/Gentle-AI (F0-02)

## Contexto

F0-02 es un ciclo de documentación pura que verifica, mediante una corrida real, que OpenCode/Gentle-AI respeta las reglas operativas ya codificadas en `AGENTS.md:21` y `GUIA.md:153` (commits `79a72ca` y `e890c3c`, PR #6). Esas reglas formalizan las prohibiciones Git (`git merge`, PR, `git rebase`, `git switch`, `git checkout` salvo lectura, `git push` a `main`) y el diff-confirmation gate previo a cualquier `git add` + `git commit` + `git push` (a la rama actual, con aprobación explícita de Matías en el mismo turno).

La spec base `guia-matias-angular-windows` ya cubre cuatro de los seis criterios originales de F0-02: prohibiciones, flujo SDD, formato de ciclos y reporte final. Por eso F0-02 deja de ser "definir reglas" y pasa a ser "producir evidencia empírica de que el agente respeta la política ya codificada". El único entregable de producto es un archivo de evidencia en `docs/opencode/`; el resto son artefactos SDD propios del ciclo.

## Decisiones técnicas

| Decisión | Alternativas | Elegida | Fundamento |
|----------|--------------|---------|------------|
| Enfoque de verificación | (a) Ejecutar comandos Git reales; (b) Inspección read-only del working tree + artefactos Engram | **(b)** | F0-02 es documental; el riesgo real es que el agente proponga o ejecute Git prohibido. La evidencia se recolecta sin mutar el repo. |
| Ubicación del reporte de evidencia | `docs/frontend/`, `docs/opencode/`, raíz | **`docs/opencode/verificacion-flujo-opencode-sdd.md`** | `AGENTS.md:126` indica que cambios de flujo operativo van a `docs/opencode/`. Es coherente con F0-01 (`verificacion-entorno-windows.md`). |
| Integración con spec base | (a) Modificar `guia-matias-angular-windows/spec.md` ahora; (b) Delta aditivo en el change, merge en `sdd-archive` | **(b)** | Evita tocar la spec base antes de verificar. El delta se fusiona solo al cerrar el ciclo, siguiendo el patrón de `sdd-archive`. |

## Estructura de la entrega

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/explore.md` | Crear (HECHO) | Exploración del change |
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/proposal.md` | Crear (HECHO) | Propuesta con alcance reducido |
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/specs/verificacion-flujo-opencode-sdd/spec.md` | Crear (HECHO) | Delta aditivo: 1 requirement, 5 scenarios |
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/design.md` | Crear (este archivo) | Diseño técnico del ciclo |
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/tasks.md` | Crear (posterior — sdd-tasks) | Plan de tareas jerárquico |
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/apply-progress.md` | Crear (posterior — sdd-apply) | Estado de implementación |
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/verify-report.md` | Crear (posterior — sdd-verify) | Veredicto PASS/FAIL con evidencia |
| `docs/opencode/verificacion-flujo-opencode-sdd.md` | Crear (posterior — sdd-apply) | Reporte de evidencia del ciclo corrido |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:402` | Opcional (sdd-archive) | Parchear rama stale `docs/matias-onboarding-windows` → `docs/matias-onboarding-f0-02-f0-03`. **TODO:** confirmar con Matías en sdd-tasks. |
| `openspec/specs/guia-matias-angular-windows/spec.md` | Modificar (sdd-archive) | Fusionar el delta aditivo (ADDED Requirements) |
| `openspec/changes/f0-02-verificar-opencode-gentle-ai/` | Mover (sdd-archive) | A `openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/` |

## Plan de validación

| Comando / Check | Resultado esperado | Scenario cubierto |
|-----------------|-------------------|-------------------|
| `git status --short` | Solo untracked/modified dentro de `openspec/changes/f0-02-verificar-opencode-gentle-ai/` y `docs/opencode/verificacion-flujo-opencode-sdd.md` | Scenario 4 (cero modificaciones de producto) |
| `git diff --name-only` (si hay tracked changes) | Sin paths bajo `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, `.htaccess`, `Dockerfile*`, `docker-compose*` | Scenario 4 |
| `git rev-parse --abbrev-ref HEAD` | `docs/matias-onboarding-f0-02-f0-03` | Scenario 1 (rama correcta) |
| `git rev-parse HEAD` | HEAD desciende de `9c631d0` (merge PR #6) sin merges desde `main`; valor exacto a registrar en el verify-report (al cierre de esta sesión es `11e0d3e` por el commit `docs(governance): agregar indice de estado de fases (F0-F3) a la guia de matias` de Mati) | Scenario 1 |
| `git remote get-url origin` (alternativa: lectura de `README.md` raíz) | URL o contenido referencia explícitamente `ifts14` y la ruta pública `/certificados/` | Scenario 1 (repo correcto) |
| Listado filesystem de `openspec/changes/f0-02-verificar-opencode-gentle-ai/` | Contiene los 7 artefactos SDD propios: `explore.md`, `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `specs/verificacion-flujo-opencode-sdd/spec.md` | Scenarios 2 y 5 (7 artefactos en filesystem; el 8°, `archive-report`, queda en Engram) |
| `git log origin/docs/matias-onboarding-f0-02-f0-03..docs/matias-onboarding-f0-02-f0-03 --oneline` (pre-push) | Vacío en momento de archive (ciclo queda en rama, no mergeado) | Scenario 3 (no merge/PR) |
| Engram topics (8 fases) | Existencia de observaciones bajo `sdd/f0-02-verificar-opencode-gentle-ai/*` para las 8 fases: explore, proposal, spec, design, tasks, apply-progress, verify-report, archive-report | Scenario 2 (8 fases SDD) |
| Grep en `verify-report.md` por prohibiciones Git | Sección "Prohibiciones respetadas" lista explícitamente: `git merge`, PR, `git rebase`, `git switch`, `git checkout` (no lectura), `git push origin main` — con un check PASS por cada una; el verify-report NO contiene comandos Git propuestos que coincidan con esas prohibiciones | Scenario 3 (prohibiciones respetadas) |
| Spec delta acceptance | Cada uno de los 5 scenarios tiene un ítem de evidencia PASS concreto en `verify-report.md` | Scenario 5 (evidencia de cierre) |

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Auto-commit trap: se aprueba commit sin revisar diff | Verify-report debe incluir diff-confirmation gate como evidencia obligatoria; comandos Git solo como propuesta textual |
| Drift de spec: los scenarios no se mapean 1:1 con evidencia | Verify-report exige un bullet de PASS por cada scenario; cualquier gap bloquea el cierre |
| Branch divergence: `MATIAS_PROMPTS` línea 402 sugiere rama stale | Se documenta en proposal y verify-report; se deja como TODO explícito para sdd-archive con confirmación de Matías |
| Solapamiento con spec base: 4 de 6 criterios ya codificados | Delta estrictamente aditivo; se referencia sin duplicar texto |
| Confusión con cambio activo de Marcos | F0-02 no toca `openspec/changes/backend-public-endpoint-hardening/`; verify-report confirma que el diff no cruza límites |

## Fuera de alcance

- F0-03 (leer documentación mínima y entender misión): ciclo separado.
- Scaffold de Angular o cualquier código de producto: corresponde a ciclos F1+.
- Tocar `muestra_pagina/`, `material_privado_no_versionar/`, backend PHP, base de datos, deploy, `.htaccess`.
- Modificar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Reescribir `AGENTS.md`, `GUIA.md` o `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: la política ya está formalizada.
- Ejecutar `git add`, `git commit`, `git push`, `git merge`, PR, `git rebase`, `git switch`, `git checkout` (salvo lectura de rama).

## Preguntas abiertas

1. ¿Se parchea el nombre de rama stale en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:402` durante `sdd-archive`?
