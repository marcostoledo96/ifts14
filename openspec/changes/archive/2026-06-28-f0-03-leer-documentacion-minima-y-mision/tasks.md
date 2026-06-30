# Tasks: F0-03 — Leer documentación mínima y entender misión

## Review Workload Forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas | ~400 |
| Riesgo de exceder 400 líneas | **Moderate** |
| PRs encadenados recomendados | **No** |
| Estrategia de entrega | single-pr |
| Decisión antes de apply | **No** (Mati ya dio el OK) |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: single-pr
400-line budget risk: Moderate

## Decisión tomada por el operador

1. **Patch de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md:444` durante `sdd-archive` — SÍ, aplicar.** Decisión tomada por el orquestador el 2026-06-29 a recomendación propia (Mati delegó explícitamente "vos que me recomendas"). La línea está mal desde el patch de F0-02 (decía `docs/matias-onboarding-f0-02-f0-03` en lugar de la rama real `docs/matias-onboarding-f0-03`); corregirla ahora cierra el issue definitivamente. Adelantar este fix deja la guía consistente y evita que el próximo ciclo tenga que volver a tocar este archivo.

## 1. Preparación

- [x] 1.1 Confirmar rama con `git rev-parse --abbrev-ref HEAD` → `docs/matias-onboarding-f0-03`; baseline limpio (`git status --short`).
- [x] 1.2 HEAD en `711e3ca` con `git rev-parse HEAD`; sin commits del agente.
- [x] 1.3 Confirmar `muestra_pagina/` y `apps/frontend-angular/` en estado conocido (read-only).

## 2. Escritura de la síntesis operativa

- [x] 2.1 Crear `docs/opencode/onboarding-matias-frontend.md` con 9 secciones del design (~150-180 lns).
- [x] 2.2 "Misión": 3-5 líneas (Angular 20, `muestra_pagina/`, UI/UX, Tailwind, responsive, accesibilidad).
- [x] 2.3 "Alcance permitido": bullets SÍ (Angular 20, portar v0, accesibilidad, rendimiento, docs frontend).
- [x] 2.4 "Fuera de alcance": bullets NO (backend PHP, MariaDB, cPanel, `material_privado_no_versionar/`, secretos, Marcos).
- [x] 2.5 "Fuentes de verdad": tabla con 8 fuentes + 1-2 líneas por fuente.
- [x] 2.6 "Estado del proyecto": `muestra_pagina/` (7/19), `apps/frontend-angular/` (scaffold Marcos 35/35 verde). NO rehacer.
- [x] 2.7 "Qué sigue": apuntar a F1+ (auditar `muestra_pagina/`, decidir portar).
- [x] 2.8 "Evidencia por ciclo": qué dejar (resumen, archivos, pruebas, QA, bloqueos, riesgos, docs, Git, commit).
- [x] 2.9 "Prohibiciones operativas": `AGENTS.md:21` + gates + "no inventar pantallas sin diseño".
- [x] 2.10 "Enlaces a las 8 fuentes": 8 links markdown + 1-3 líneas por fuente.

## 3. Validación previa al verify

- [x] 3.1 `git status --short`; solo paths OK.
- [x] 3.2 (Si tracked) `git diff --name-only`; NO bajo `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, `.htaccess`, `Docker*`.
- [x] 3.3 Confirmar 7 SDD: explore, proposal, design, tasks, apply-progress, verify-report, specs/mision-matias-sintetizada/spec.
- [x] 3.4 Verificar 9 secciones en `docs/opencode/onboarding-matias-frontend.md` (grep).
- [x] 3.5 Archivo SIN secretos (`grep -c "secreto\|dump\|credencial\|DNI\|token\|password"` = 0) y SIN refs a `material_privado_no_versionar/`.
- [x] 3.6 Confirmar Engram con 5 obs (explore, proposal, spec, design, tasks); tras apply se agrega `apply-progress`.

## 4. Cierre

- [x] 4.1 Esperar sdd-verify PASS.
- [x] 4.2 **Aplicar DOS patches de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` durante sdd-archive**:
  - **Línea 444**: cambiar `Rama sugerida: \`docs/matias-onboarding-f0-02-f0-03\`.` → `Rama sugerida: \`docs/matias-onboarding-f0-03\`.` (corrige el patch erróneo de F0-02).
  - **Línea 15 (fila F0-03 del índice F0-F3)**: cambiar `⏳` → `✅` (consistente con el precedent de F0-02 que actualizó la fila F0-02 en commit `182ec32`).
  - NO tocar otras líneas del archivo. Decisión tomada por el orquestador el 2026-06-29 a recomendación propia (Mati delegó).
- [x] 4.3 Proponer al operador comandos Git exactos (NO ejecutar): `git add openspec/changes/f0-03-leer-documentacion-minima-y-mision/ docs/opencode/onboarding-matias-frontend.md [+ patch]`; `git commit -m "docs(matias): registrar onboarding frontend"`; `git push` (diff gate).
- [x] 4.4 Al cierre del archive, documentar en `apply-progress.md` la decisión final sobre el patch.

## 5. Sanity final

- [x] 5.1 Working tree final limpio o con solo paths esperados.
- [x] 5.2 NO se ejecutó `git add` / `commit` / `push` por cuenta propia — eso queda para Mati.
