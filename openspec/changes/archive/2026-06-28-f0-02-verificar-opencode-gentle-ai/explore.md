# Exploración: F0-02 — Verificar OpenCode/Gentle-AI

## Goal

F0-02 cubre la verificación operativa de que Matías puede iniciar OpenCode, pedir un ciclo SDD autocontenido y cerrarlo con evidencia sin delegar Git automático ni saltar a implementación de producto. El alcance se reduce respecto del original definido en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (líneas 368-408) porque la política Git con diff-confirmation gates ya quedó formalizada en los commits `79a72ca` y `e890c3c` (PR #6), y porque la spec base `guia-matias-angular-windows` ya codifica los requisitos de prohibiciones, flujo SDD, formato de ciclos F0-01 a F3-06 y reporte final. F0-02 pasa entonces de "definir reglas" a "verificar empíricamente que la pipeline SDD corre completa, respeta las prohibiciones y deja evidencia autocontenida" en un solo turno.

## Scope (in / out)

### Dentro de alcance

- Demostrar que OpenCode ejecuta las ocho fases SDD (`explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`) ante un pedido de ciclo chico de documentación, sin saltar a implementación de producto.
- Confirmar que OpenCode identifica el repositorio correcto `ifts14` y la rama activa divergente (`docs/matias-onboarding-f0-02-f0-03`).
- Confirmar que el reporte final respeta las prohibiciones vigentes (no `git merge`, no PR, no `git rebase`, no `git switch`, no `git checkout` salvo lectura, no `git push` a `main`) y que los comandos Git quedan como propuesta para aprobación explícita de Matías.
- Dejar evidencia autocontenida en un archivo nuevo bajo `docs/opencode/` que documente el ciclo corrido, las fases ejecutadas, los archivos tocados y los comandos Git propuestos.
- Producir un delta de spec mínimo y aditivo que no duplique lo ya codificado en `guia-matias-angular-windows`.

### Fuera de alcance

- Reescribir `AGENTS.md`, `GUIA.md`, `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` o la spec base: el contenido ya refleja la política post `79a72ca` y los fixes `e890c3c`. Modificarlos sería regresión.
- Implementar producto Angular, PHP, cambios de base de datos, deploy, ni configuración de OpenCode: el ciclo es de documentación pura.
- Tocar `material_privado_no_versionar/`, secretos, dumps, logs o cualquier ruta privada.
- Tocar `openspec/changes/backend-public-endpoint-hardening/`: es el cambio activo de Marcos, sin relación con F0-02.
- Cambiar de rama: la rama activa ya es la correcta para este ciclo (`docs/matias-onboarding-f0-02-f0-03`).
- Aprobar o ejecutar cualquier `git add`/`git commit`/`git push` por cuenta propia: siempre con aprobación explícita de Matías en el mismo turno del chat, con diff-confirmation gate previo.

## Existing assets

Activos que ya cubren la mayor parte de los criterios originales de F0-02 y que el nuevo change debe referenciar en lugar de duplicar:

| Recurso | Ubicación | Cubre |
|---------|-----------|-------|
| Regla Git con diff-confirmation gate | `AGENTS.md` línea 21 | Política vigente post `79a72ca` y `e890c3c` |
| Regla Git espejada en guía humana | `GUIA.md` línea 153 | Misma política en formato de lectura humana |
| "Contexto operativo y misión" | `openspec/specs/guia-matias-angular-windows/spec.md` líneas 9-16 | Misión, alcance y prohibiciones (incluye `merge`, PR, `rebase`, `switch`, `checkout`, `push` a `main`) |
| "Flujo OpenCode/Gentle-AI y SDD" | `openspec/specs/guia-matias-angular-windows/spec.md` líneas 27-34 | Flujo SDD, `sdd-archive`, reporte final y política Git (cita explícita commit `79a72ca`) |
| "Ciclos F0-01 a F3-06" | `openspec/specs/guia-matias-angular-windows/spec.md` líneas 63-70 | Formato estándar de cada ciclo: objetivo, rama, archivos, prompt, validaciones, QA, mensaje de commit |
| "Reporte final y propuestas Git" | `openspec/specs/guia-matias-angular-windows/spec.md` líneas 72-79 | Reporte con bloqueos, archivos, pruebas, QA, comandos Git solo con aprobación explícita |
| Rama operativa post PR #6 | `docs/matias-onboarding-f0-02-f0-03` | Rama activa limpia sincronizada con `origin`, HEAD en `9c631d0` |
| Plantilla de ciclo cerrado | `openspec/changes/archive/2026-06-26-f0-01-verificar-entorno-windows/` | Estructura completa `proposal.md` / `design.md` / `tasks.md` / `specs/.../spec.md` / `verify-report.md` / `archive-report.md` para reutilizar |
| Memoria de F0-01 | Engram ids `#6`, `#7`, `#8`, `#9`, `#10`, `#11`, `#12` | Observaciones de propuesta, spec, diseño, tasks, apply, verify y archive de F0-01 |
| Memoria regla Git | Engram ids `#14`, `#15`, `#16`, `#17`, `#18`, `#19`, `#20` | Observaciones de propuesta, spec, diseño, tasks, apply, verify y archive de `permitir-commit-con-aprobacion-explicita` |

## Delta needed

Para que F0-02 sea autocontenido y verificable, el change debe agregar **un solo requirement aditivo** a la spec base. No debe modificar, renombrar ni eliminar ningún requirement existente.

### Nueva capacidad propuesta: `verificacion-flujo-opencode-sdd`

#### Requirement ADDED: Verificación autocontenida del flujo OpenCode/SDD

El sistema DEBE demostrar, en una sola ejecución del ciclo, que OpenCode corre las ocho fases SDD sobre el repositorio `ifts14` sin saltar a implementación, deja evidencia escrita en `docs/opencode/` y respeta las prohibiciones Git vigentes.

#### Scenario: Identificación correcta del repositorio y la rama

- GIVEN que el operador ejecuta el ciclo en la rama `docs/matias-onboarding-f0-02-f0-03`
- WHEN OpenCode recibe el pedido del ciclo F0-02
- THEN el reporte DEBE identificar el repositorio como `ifts14` y la rama activa por su nombre
- AND la rama DEBE coincidir con la rama git real al momento de ejecutar

#### Scenario: Cobertura completa de las ocho fases SDD

- GIVEN que el operador pide un ciclo de documentación pura
- WHEN OpenCode responde
- THEN el reporte final DEBE mencionar explícitamente las ocho fases (`explore`, `propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`)
- AND DEBE explicar qué produjo o qué produciría en cada una
- AND NO DEBE proponer implementación de producto

#### Scenario: Respeto a las prohibiciones Git

- GIVEN que el ciclo llega a `sdd-verify` PASS
- WHEN OpenCode reporta el cierre
- THEN el reporte DEBE listar los comandos Git únicamente como propuesta
- AND NO DEBE afirmar que ejecutó `git add`, `git commit`, `git push`, `git merge`, `git rebase`, `git switch` ni `git checkout` (salvo lectura)
- AND DEBE recordar que toda ejecución Git requiere aprobación explícita de Matías en el mismo turno, con diff-confirmation gate previo

#### Scenario: Sin modificación de código de producto

- GIVEN que el ciclo es de verificación documental
- WHEN finaliza la fase `apply`
- THEN `git diff --name-only` NO DEBE listar archivos bajo `apps/`, `database/`, `public_html/`, `muestra_pagina/`, `material_privado_no_versionar/`, `openspec/specs/` ni `openspec/config.yaml`
- AND el único cambio admisible es el archivo de evidencia nuevo bajo `docs/opencode/` más los artefactos SDD bajo `openspec/changes/f0-02-verificar-opencode-gentle-ai/`

### Requirements modificados, renombrados o eliminados

- **Modified**: ninguno.
- **Renamed**: ninguno.
- **Removed**: ninguno.

## Proposed structure for the cycle

Artefactos OpenSpec que el change debe producir, reutilizando la plantilla de F0-01:

| Artefacto | Ruta | Alcance aproximado |
|-----------|------|-------------------|
| `proposal.md` | `openspec/changes/f0-02-verificar-opencode-gentle-ai/proposal.md` | Why (ciclo de verificación), What Changes (un archivo de evidencia nuevo + delta de spec aditivo), Capabilities (una nueva capacidad `verificacion-flujo-opencode-sdd`), Out of Scope (lo que ya está formalizado en PR #6 y la spec base), Approach (correr las 8 fases, dejar evidencia, cerrar), Risks (divergencia de rama, base spec solapada, primer ciclo en la rama), Rollback (borrar archivo de evidencia y carpeta del change), Evidence (rama, baseline, hash de los commits previos referenciados), Success Criteria (mapeo a los 4 scenarios del delta). ~80-100 líneas. |
| `specs/<capability>/spec.md` | `openspec/changes/f0-02-verificar-opencode-gentle-ai/specs/verificacion-flujo-opencode-sdd/spec.md` | Purpose + ADDED Requirements (un único Requirement con los 4 scenarios de arriba) + MODIFIED/RENAMED/REMOVED vacíos. ~50-70 líneas. |
| `design.md` | `openspec/changes/f0-02-verificar-opencode-gentle-ai/design.md` | Contexto, decisiones (ubicación del archivo de evidencia `docs/opencode/verificacion-flujo-opencode-sdd.md`, secciones obligatorias, formato de los ocho hitos), validación por fases, riesgos, preguntas abiertas. ~50-70 líneas. |
| `tasks.md` | `openspec/changes/f0-02-verificar-opencode-gentle-ai/tasks.md` | Fases 1 (preparación: rama + baseline) → 2 (apply: escribir archivo de evidencia) → 3 (verify: validar scenarios) → 4 (cierre: reporte final + comandos Git propuestos), numeradas jerárquicamente, con casillas. ~60-80 líneas. |
| `apply-progress.md` | `openspec/changes/f0-02-verificar-opencode-gentle-ai/apply-progress.md` | Estado general, tareas completadas, archivos efectivamente creados, capturas resumidas. ~40-60 líneas. |
| `verify-report.md` | `openspec/changes/f0-02-verificar-opencode-gentle-ai/verify-report.md` | Veredicto PASS/FAIL, 4 escenarios con Given/When/Then, hallazgos, comandos Git propuestos (NO ejecutados), recomendación. ~80-100 líneas. |
| `archive-report.md` | `openspec/changes/f0-02-verificar-opencode-gentle-ai/archive-report.md` | Cierre del ciclo, delta de spec sincronizado contra `openspec/specs/`, referencias a docs actualizadas. ~30-50 líneas. |

## Review workload forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas | ~90 (1 archivo nuevo `docs/opencode/verificacion-flujo-opencode-sdd.md` ~40-50 líneas + artefactos SDD ~330 líneas) |
| Riesgo de exceder presupuesto de 400 líneas | Low |
| PRs encadenados recomendados | No |
| Estrategia de entrega | single-pr |
| Tipo de cambio | Documentación pura (no toca código de producto) |
| Riesgos de regresión | Low (la spec base sigue intacta, sólo se agrega un requirement aditivo) |

Este change es sustancialmente más chico que `permitir-commit-con-aprobacion-explicita` (~24 líneas netas, 4 archivos) y comparable a F0-01 (~130 líneas, 1 archivo entregable). El grueso de las ~330 líneas de artefactos SDD son overhead de markdown propio del flujo y no cuentan como diff de producto.

## Risks

1. **Divergencia de rama documentada vs. operativa**: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 371 sugiere `docs/matias-onboarding-windows` como rama para F0-02, pero la rama activa es `docs/matias-onboarding-f0-02-f0-03` (post merge de PR #6). El cycle debe documentar la divergencia en el reporte, no tratarla como bloqueo. Riesgo: si Marcos espera la rama original, podría haber confusión. Mitigación: declarar la rama real en `proposal.md` y `verify-report.md` y referenciar explícitamente el merge de PR #6.
2. **Solapamiento con la spec base**: cuatro de los seis criterios originales de F0-02 ya están cubiertos por la spec `guia-matias-angular-windows`. Riesgo: el delta de spec termine duplicando texto existente. Mitigación: el delta agrega un único Requirement aditivo (`verificacion-flujo-opencode-sdd`) con escenarios nuevos; el resto se referencia, no se repite.
3. **Primer ciclo en la nueva rama**: no hay un F0-02 archivado previo en `docs/matias-onboarding-f0-02-f0-03/`. Riesgo: si la pipeline SDD no encuentra el change, podría intentar crearlo en otra ruta. Mitigación: el directorio `openspec/changes/f0-02-verificar-opencode-gentle-ai/` ya queda creado por este explore; las fases siguientes lo encuentran sin ambigüedad.
4. **Cambio activo de Marcos**: `openspec/changes/backend-public-endpoint-hardening/` sigue presente y no archivado. Riesgo: confusión entre cambios al listar `openspec/changes/`. Mitigación: F0-02 trabaja exclusivamente bajo su propia carpeta y no toca la de Marcos; el reporte final confirma que el `git diff` no cruza límites.
5. **Trampa de "auto-commit"**: la regla post `79a72ca` permite `git add` + `git commit` con aprobación explícita de Matías. Riesgo: el operador (Matías o el asistente) apruebe un commit sin revisar el diff. Mitigación: `verify-report.md` insiste en el diff-confirmation gate y deja los comandos Git solo como propuesta textual; el ciclo no commitea por su cuenta.

## Next recommended phase

`sdd-propose` — el change es pequeño, autocontenido, sin código de producto, y su propuesta debe fijar: la divergencia de rama como dato (no bloqueo), el delta de spec aditivo de un solo requirement, y el archivo de evidencia nuevo `docs/opencode/verificacion-flujo-opencode-sdd.md`. `sdd-propose` puede arrancar directamente desde este explore sin investigación adicional.
