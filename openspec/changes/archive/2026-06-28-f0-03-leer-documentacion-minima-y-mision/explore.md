# Exploración: F0-03 — Leer documentación mínima y entender misión

## Goal

F0-03 cubre la formalización del "misión" de Matías al arrancar el proyecto: la síntesis operativa de su rol, alcance permitido, fuera de alcance, fuentes de verdad vigentes y límites de acción, como cierre del bloque F0 del onboarding y antes del primer ciclo frontend (F1-01). Es el ciclo más importante de la Fase 1 de onboarding porque es el que vuelve explícita, verificable y firmada por Matías la lectura que ya se hizo de la documentación base (`README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `muestra_pagina/AGENTS.md`, `apps/frontend-angular/AGENTS.md`). Sin esta síntesis, los ciclos F1+ empezarían sobre un terreno implícito: Matías "habría leído" la documentación, pero no habría evidencia autocontenida de qué entendió ni hasta dónde llega. F0-03 pasa de "leer" a "dejar evidencia firmada de haber entendido" en un solo turno.

## Scope (in / out)

### Dentro de alcance

- Producir un **resumen operativo para Matías** con secciones fijas: misión, alcance permitido, fuera de alcance, fuentes de verdad, qué hacer si `muestra_pagina/` está vacía y qué evidencia debe dejar al cerrar cada ciclo. El resumen debe **enlazar** las fuentes, no duplicarlas.
- Producir evidencia autocontenida en un archivo nuevo bajo `docs/opencode/` (nombre propuesto: `onboarding-matias-frontend.md`, decisión final en `sdd-apply`), indexable por `docs/00-indice-general.md`.
- Verificar, mediante el resumen, que las 8 fuentes listadas en la definición de F0-03 están vigentes y son coherentes con el estado actual del repo.
- Confirmar que el estado real de `muestra_pagina/` (no vacía: tiene v0) y de `apps/frontend-angular/` (scaffold Angular 20 ya presente) es compatible con la regla "no UI final si referencia pendiente" del spec base.
- Producir un delta de spec mínimo y aditivo sobre `guia-matias-angular-windows` que codifique el criterio "Matías puede explicar misión, alcance, fuentes de verdad y límites antes de F1" (un solo Requirement ADDED con escenarios Given/When/Then en español argentino formal, siguiendo el patrón de F0-02).
- Parchar la línea 444 de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` que ya fue parcheada en F0-02 (commit `182ec32`) pero quedó apuntando a `docs/matias-onboarding-f0-02-f0-03` (stale respecto de la rama operativa real `docs/matias-onboarding-f0-03`).
- Cerrar el ciclo con `sdd-verify` PASS, reportar el cierre en `verify-report.md` y dejar los comandos Git solo como propuesta para aprobación explícita de Matías (diff-confirmation gate).

### Fuera de alcance

- Scaffold Angular, código de producto, dependencias frontend, instalar nada. F0-03 es un ciclo de documentación pura; el scaffold ya está en `apps/frontend-angular/` (gestionado por Marcos en su ciclo `frontend-angular-shell-public-validation-api-readiness` archivado en `2026-06-29-frontend-angular-shell-public-validation-api-readiness`) y no se toca.
- Inventar contrato API, PDF, QR, permisos o configuración institucional. La referencia canónica sigue siendo `docs/backend/01-contrato-api-certificados.md` (cuando exista) y `docs/frontend/00-angular20-port-v0.md`.
- Resumir, abrir, copiar o listar el contenido de `material_privado_no_versionar/`. Aunque F0-03 es documental, las reglas de `AGENTS.md:33-37` y la convención del proyecto siguen aplicando.
- Modificar `apps/frontend-angular/`, `muestra_pagina/` (más allá de lectura), `database/`, `deploy/`, `.htaccess`, `Dockerfile*`, `docker-compose*`, `scripts/`, `material_privado_no_versionar/`, `public_html/` ni archivos de runtime/configuración.
- Tocar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos, sin relación con F0-03).
- Tocar la rama `docs/matias-onboarding-f0-02-f0-03` (HEAD `182ec32`, PR pendiente de Mati) ni la rama `docs/policy-git-switch-checkout` (PR de la política Git pendiente de merge). F0-03 corre exclusivamente sobre `docs/matias-onboarding-f0-03`.
- Aprobar o ejecutar `git add` / `git commit` / `git push` por cuenta del agente: siempre con aprobación explícita de Matías en el mismo turno del chat, con diff-confirmation gate previo, conforme a `AGENTS.md:21` y `GUIA.md:153`.
- Cambiar de rama: la rama activa ya es la correcta para este ciclo (`docs/matias-onboarding-f0-03`, HEAD `711e3ca` descendiente de `main` post PR #10).
- Reescribir `AGENTS.md`, `GUIA.md`, `docs/00-indice-general.md` o el spec base: el contenido ya refleja la política post `79a72ca`, los fixes `e890c3c` y el delta de F0-02. Modificarlos sería regresión.
- El spec base `guia-matias-angular-windows` ya tiene 9 Requirements (no 11 como sugería la expectativa de Mati al preparar este explore). El delta de F0-03 agregará el Requirement número 10; no se tocan los 9 existentes.

## Existing assets

Activos que ya cubren la mayor parte del F0-03 y que el nuevo change debe referenciar en lugar de duplicar:

### Las 8 fuentes que el ciclo pide leer

| # | Archivo | Líneas relevantes | Cubre |
|---|---------|-------------------|-------|
| 1 | `README.md` | 1-78 (78 líneas) | Objetivo, stack, responsables (Marcos/Matías), carpetas principales, regla de seguridad, cómo empezar. **Cubre rol y scope general de Matías.** |
| 2 | `GUIA.md` | 1-165 (165 líneas) | Guía humana: objetivo, stack, alcance `/certificados/`, estado actual, `muestra_pagina/`, roles, metodología SDD, documentación mínima, Git, regla principal. **Cubre metodología, roles y lectura mínima.** |
| 3 | `AGENTS.md` | 1-127 (127 líneas) | Reglas obligatorias para OpenCode, stack, lectura mínima, `material_privado_no_versionar/`, `muestra_pagina/`, frontend, backend, base, deploy, sdd-archive. **Cubre prohibiciones, flujo y reglas por área.** |
| 4 | `docs/00-indice-general.md` | 1-52 (52 líneas) | Índice general: lectura base, prompts operativos, lectura por área, referencias condicionales. **Cubre el mapa de navegación de la documentación.** |
| 5 | `docs/frontend/00-angular20-port-v0.md` | 1-134 (134 líneas) | Estado de referencia v0, división de responsabilidades Marcos/Matías, inventario v0 disponible (7 pantallas prompts 4-10) y pendiente (12 pantallas prompts 11-22), tokens visuales, componentes candidatos, reglas de portado, riesgos, build cPanel, estado actual del shell Angular. **Cubre portado visual y división de responsabilidades frontend.** |
| 6 | `muestra_pagina/README.md` | 1-29 (29 líneas) | Estado actual de la referencia v0 (7 pantallas disponibles, 12 pendientes), uso permitido, prohibido, fuente de verdad del port. |
| 7 | `muestra_pagina/AGENTS.md` | 1-17 (17 líneas) | Reglas: si solo están `README.md` y `AGENTS.md`, no implementar frontend final; referencia visual, no código definitivo. |
| 8 | `apps/frontend-angular/AGENTS.md` | 1-18 (18 líneas) | Reglas del scaffold Angular 20: estructura por features, no UI final si `muestra_pagina/` no tiene diseño aprobado, no copiar React/Next, priorizar accesibilidad/responsive/rendimiento, mantener conexión futura con API PHP. |

### Estado real del filesystem (relevante para F0-03)

| Carpeta | Estado real | Impacto sobre F0-03 |
|---------|-------------|---------------------|
| `muestra_pagina/` | **NO está vacía.** Tiene 11 archivos y 5 directorios: `app/`, `capturas/`, `components/`, `lib/`, `public/`, `MANIFIESTO_V0.md`, `components.json`, `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `postcss.config.mjs`, `prompts_stitch_v0_ifts14.md`, `tsconfig.json`. La referencia v0 está parcialmente poblada (7 pantallas disponibles, 12 pendientes según `MANIFIESTO_V0.md` y el README). | La regla "si está vacía, bloquea UI final" del spec base y del `muestra_pagina/AGENTS.md` no aplica en su forma estricta. La regla efectiva hoy es: "hay referencia v0 utilizable, pero todavía incompleta (7/19 pantallas) → Matías puede iniciar `frontend/v0-design-system` (F1-01) y trabajar sistema visual, pero NO debe inventar pantallas para flujos 11-22 que siguen sin diseño aprobado (detalle certificación, vista previa PDF, listado cursos, etc.)". F0-03 debe dejar esto explícito en el resumen. |
| `apps/frontend-angular/` | Tiene scaffold Angular 20 (`angular.json`, `package.json`, `src/`, `public/`, `tsconfig.app.json`, `tsconfig.spec.json`, `.editorconfig`, `.gitignore`, `AGENTS.md`, `README.md`). Cierra 35/35 tests y build prod verde según `docs/frontend/00-angular20-port-v0.md:111`. | El scaffold técnico (hecho por Marcos) está listo. Matías NO debe rehacer el scaffold; sí puede empezar a trabajar diseño visual sobre esa base. F0-03 debe dejar explícito: "no rehacer scaffold; respetar estructura existente". |
| `openspec/changes/` | Contiene `archive/` (con F0-01, F0-02 y muchos otros) y `backend-public-endpoint-hardening/` (Marcos, activo). **No contiene** `f0-03-leer-documentacion-minima-y-mision/` aún. | F0-03 puede crear su change directory sin colisión. |
| `docs/opencode/` | Tiene `AGENTS.md`, `optimizacion-tokens.md`, `archive/`, `verificacion-entorno-windows.md` (F0-01) y `verificacion-flujo-opencode-sdd.md` (F0-02). | El nuevo resumen operativo de F0-03 puede vivir aquí (`docs/opencode/onboarding-matias-frontend.md` o nombre similar), siguiendo el patrón de los dos F0 anteriores. |

### Spec base y deltas previos relevantes

- `openspec/specs/guia-matias-angular-windows/spec.md` (108 líneas, **9 Requirements**):
  - Req. "Contexto operativo y misión" (líneas 9-16): misión, alcance frontend Angular 20, fuentes de verdad, prohibiciones (backend, base, deploy, `material_privado_no_versionar/`, dependencias no aprobadas, `git merge`/`rebase`/`push` a `main`).
  - Req. "Uso de `muestra_pagina/`" (líneas 36-43): si está vacía, bloquea UI final.
  - Req. "Ciclos F0-01 a F3-06" (líneas 63-70): formato estándar de cada ciclo.
  - Req. "Verificación del flujo OpenCode/Gentle-AI" (líneas 81-106): agregado por F0-02, 5 Scenarios.
  - Los 5 Requirements restantes también son relevantes para F0-03: preparación entorno, flujo SDD, política frontend/QA, errores comunes, reporte final.
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 444: ya fue parcheada en `182ec32` (F0-02) y dice `Rama sugerida: docs/matias-onboarding-f0-02-f0-03`, pero la rama operativa real de F0-03 es `docs/matias-onboarding-f0-03` (Mati la creó desde `origin/main` post PR #10). F0-03 debería parchar esa línea otra vez en `sdd-archive` para que diga `Rama sugerida: docs/matias-onboarding-f0-03`.

### Engram: observaciones de F0-01 y F0-02 como referencia

- F0-01: `#6` proposal, `#7` spec, `#8` design, `#9` tasks, `#10` apply-progress, `#11` verify-report, `#12` archive (más `#13` session close). Topic key: `sdd/f0-01-verificar-entorno-windows/*`.
- F0-02: `#28` explore, `#29` proposal, `#30` spec, `#31` design, `#32` tasks, `#33` apply-progress, `#34` verify-report, `#35` archive, `#36` session summary. Topic key: `sdd/f0-02-verificar-opencode-gentle-ai/*`.
- Regla Git (`permitir-commit-con-aprobacion-explicita`): `#14`-`#20`.
- `sdd-init/ifts14`: `#3`.

El nuevo explore de F0-03 debe seguir el topic key `sdd/f0-03-leer-documentacion-minima-y-mision/explore` (F0-02 ya estableció el patrón con explore como fase propia).

## Delta needed

F0-03 es un ciclo de síntesis documental. Produce:

1. **Un nuevo archivo de evidencia** bajo `docs/opencode/` (nombre tentativo: `onboarding-matias-frontend.md`) que consolida el resumen operativo de Mati. Estructura sugerida:
   - **Misión de Matías en ifts14** (3-5 líneas, tomado de `README.md:37-42` y `GUIA.md:104-114`).
   - **Alcance permitido** (frontend Angular 20, sistema visual, UI/UX, admin, responsive, accesibilidad, QA, handoff visual).
   - **Fuera de alcance** (backend PHP, base de datos, deploy, configuración institucional, `material_privado_no_versionar/`, secretos, dumps, logs, inventar contratos API/PDF/QR/permisos).
   - **Fuentes de verdad vigentes** (tabla con `README.md`, `GUIA.md`, `AGENTS.md`, `docs/00-indice-general.md`, `docs/frontend/00-angular20-port-v0.md`, `muestra_pagina/README.md`, `apps/frontend-angular/AGENTS.md`, spec base `guia-matias-angular-windows`).
   - **Estado actual de `muestra_pagina/` y `apps/frontend-angular/`** (con la advertencia: la regla "si está vacía, bloquea UI final" del spec base NO aplica en forma estricta; lo que aplica es "si no hay diseño aprobado para una pantalla, no inventarla").
   - **Evidencia que Mati debe dejar al cerrar cada ciclo** (reporte final por ciclo, `sdd-archive`, `verify-report.md`, comandos Git solo como propuesta, diff-confirmation gate).
   - **Links clave** (a la spec base, a F0-01/F0-02 archives, a `AGENTS.md`, a `GUIA.md`, a `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`).

   Tamaño estimado: **~150-180 líneas** (más grande que los reportes de F0-01 y F0-02 porque consolida más información y porque va a ser la "carta de presentación" de Mati ante F1+).

2. **Un delta de spec aditivo** sobre `openspec/specs/guia-matias-angular-windows/spec.md` con **un único Requirement ADDED** y 3-4 Scenarios Given/When/Then. Propuesta de capacidad: `mision-matias-sintetizada` (o `mision-y-alcance-matias`). Scenarios tentativos:
   - **Síntesis firmada de la misión**: DADO que Mati arrancó la fase 1 de onboarding, CUANDO se cierra F0-03, ENTONCES existe un documento en `docs/opencode/onboarding-matias-frontend.md` que sintetiza misión, alcance permitido, fuera de alcance, fuentes de verdad, estado de `muestra_pagina/` y política de evidencia, sin duplicar las 8 fuentes originales.
   - **Aplicación correcta de la regla de `muestra_pagina/`**: DADO que la regla "si está vacía, bloquea UI final" del spec base, CUANDO se evalúa el estado real de `muestra_pagina/`, ENTONCES el documento de F0-03 declara explícitamente que la carpeta NO está vacía (tiene v0 parcial) y traduce la regla a "no inventar pantallas para flujos sin diseño aprobado".
   - **Aplicación correcta de la regla del scaffold Angular**: DADO que `apps/frontend-angular/` ya tiene scaffold Angular 20 hecho por Marcos, CUANDO Mati entra a F1+, ENTONCES respeta el scaffold existente, no lo rehace, y trabaja sobre la base semántica y accesible ya creada.
   - **Cero modificaciones de producto en F0-03**: DADO que F0-03 es un ciclo de documentación pura, CUANDO el ciclo termina, ENTONCES el diff de la rama NO incluye cambios en `apps/`, `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, ni archivos de runtime/configuración.

3. **Parche opcional de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 444**: cambiar `Rama sugerida: docs/matias-onboarding-f0-02-f0-03` → `Rama sugerida: docs/matias-onboarding-f0-03`. Decisión final en `sdd-archive`, igual que en F0-02.

4. **Actualización del índice F0-F3** en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 15 (fila F0-03): estado `⏳` → `✅` durante `sdd-archive`, igual que se hizo con F0-02 en la línea 14.

### Requirements modificados, renombrados o eliminados

- **Modified**: ninguno.
- **Renamed**: ninguno.
- **Removed**: ninguno.

El spec base ya cubre 6 de los 7 temas del F0-03 con sus 9 Requirements existentes (Contexto operativo, Flujo SDD, `muestra_pagina/`, Errores comunes, Ciclos F0-F3, Reporte final, Verificación OpenCode). El delta de F0-03 solo agrega la **formalización de la síntesis firmada de la misión**, no duplica los requisitos individuales.

## Proposed structure for the cycle

Artefactos OpenSpec que el change debe producir, reutilizando la plantilla de F0-02 (que a su vez reutiliza la de F0-01):

| Artefacto | Ruta | Alcance aproximado | Líneas |
|-----------|------|-------------------|-------:|
| `explore.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/explore.md` | Este archivo | ~330 |
| `proposal.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/proposal.md` | Why (síntesis firmada), What Changes (1 archivo de evidencia nuevo + 1 delta de spec aditivo + 1 parche opcional en MATIAS_PROMPTS:444), Capabilities (1 nueva capacidad `mision-matias-sintetizada`), Out of Scope, Approach, Risks, Rollback, Evidence, Success Criteria | ~120 |
| `design.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/design.md` | Contexto, decisiones (ubicación `docs/opencode/onboarding-matias-frontend.md`, estructura de las 6 secciones, formato de enlace a fuentes sin duplicar), plan de validación, riesgos | ~90 |
| `tasks.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/tasks.md` | Fases 1-5 (preparación, escritura del resumen, spec delta, apply, cierre), numeradas jerárquicamente, con casillas | ~80 |
| `specs/<capability>/spec.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/specs/mision-matias-sintetizada/spec.md` | Purpose + ADDED Requirements (1 Requirement con 3-4 scenarios) + MODIFIED/RENAMED/REMOVED vacíos | ~80 |
| `apply-progress.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/apply-progress.md` | Estado general, tareas completadas, archivos efectivamente creados, capturas resumidas, decisión sobre el parche de MATIAS_PROMPTS:444 | ~100 |
| `verify-report.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/verify-report.md` | Veredicto PASS/FAIL, 3-4 scenarios con Given/When/Then + Plan de validación con ~10 checks, hallazgos, comandos Git propuestos (NO ejecutados) | ~120 |
| `archive-report.md` | `openspec/changes/f0-03-leer-documentacion-minima-y-mision/archive-report.md` | Cierre del ciclo, delta de spec sincronizado contra `openspec/specs/`, índice F0-F3 actualizado, referencias a docs | ~50 |

**Entregable permanente (fuera del change directory):**

| Archivo | Acción | Descripción | Líneas |
|---------|--------|-------------|-------:|
| `docs/opencode/onboarding-matias-frontend.md` | CREAR | Resumen operativo consolidado de Mati con 6 secciones (misión, alcance, fuera de alcance, fuentes, estado muestra_pagina, evidencia) | ~150-180 |

**Archivos opcionales (parches en `sdd-archive`):**

- `openspec/specs/guia-matias-angular-windows/spec.md`: agregar 1 Requirement ADDED (~30 líneas).
- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md`: línea 444 (rama F0-03) + línea 15 (índice F0-F3) (~3 líneas).

## Review workload forecast

| Campo | Valor |
|-------|-------|
| Líneas estimadas modificadas/agregadas (total) | **~330-370** (8 artefactos SDD ~970 líneas propias del flujo markdown + 1 archivo entregable ~170 + 1 spec delta ~30 + 2 parches opcionales ~3) |
| Líneas de diff de producto (lo que cuenta para presupuesto PR) | **~200-230** (1 archivo nuevo `docs/opencode/onboarding-matias-frontend.md` ~170 + 1 spec delta ~30 + 2 líneas en MATIAS_PROMPTS) |
| Riesgo de exceder presupuesto de 400 líneas | **Low to Moderate** (similar a F0-02 ~250, pero con un poco más por el resumen operativo y la spec delta; **monitorear en `sdd-tasks`**) |
| PRs encadenados recomendados | **No** (single-pr) |
| Estrategia de entrega | single-pr |
| Tipo de cambio | Documentación pura (no toca código de producto) |
| Riesgos de regresión | Low (la spec base sigue intacta, solo se agrega un requirement aditivo) |
| Decisión necesaria antes de `sdd-apply` | **No** (Mati ya dio el alcance de F0-03; las dos preguntas opcionales —nombre exacto del archivo de evidencia y parche de MATIAS_PROMPTS:444— se pueden resolver dentro de `sdd-tasks`) |

Este change es comparable a F0-02 (~250 líneas netas) y a F0-01 (~130 líneas, pero sin el overhead de `explore.md` propio). El grueso de las ~970 líneas de artefactos SDD son overhead de markdown propio del flujo (8 archivos a ~120 líneas promedio) y no cuentan como diff de producto. El diff de producto real es ~200-230 líneas y entra holgado en el presupuesto de 400.

## Risks

1. **Divergencia entre el ciclo definido y el estado real de `muestra_pagina/`** (CRÍTICO): la definición original de F0-03 dice "Queda claro que `muestra_pagina/` bloquea UI final si está vacía" (línea 478 de `MATIAS_PROMPTS`). En el estado actual del repo, `muestra_pagina/` **NO está vacía**: tiene 11 archivos + 5 directorios con la referencia v0 exportada de Next.js/React, incluyendo `MANIFIESTO_V0.md` que declara 7 pantallas disponibles y 12 pendientes. La regla "si está vacía, bloquea UI final" del spec base NO aplica en su forma estricta; lo que aplica hoy es la regla "no inventar pantallas para flujos sin diseño aprobado" (que sigue siendo una versión fuerte del bloqueo, pero con un universo distinto: ya no es "no hacer nada hasta que llegue v0", sino "no inventar flujos 11-22 sin spec previa"). Mitigación: el resumen operativo de F0-03 debe declarar el estado real, traducir la regla al contexto actual y mantener la coherencia con el spec base sin contradecirlo. **Recomendación**: el delta de spec debe usar la regla "no inventar pantallas para flujos sin diseño aprobado" como Scenario, no la regla "si está vacía, bloquea" como está hoy en el spec base, para que el spec refleje el estado real del repo.

2. **Document duplication**: el nuevo `docs/opencode/onboarding-matias-frontend.md` podría terminar duplicando texto ya presente en `README.md`, `GUIA.md`, `AGENTS.md` y `docs/frontend/00-angular20-port-v0.md`. Riesgo: documentación inflada, fuera de la regla de `docs/AGENTS.md:11` ("No duplicar documentación: enlazar la fuente vigente"). Mitigación: el resumen debe **enlazar, no duplicar**; cada sección tiene máximo 5-10 líneas + 2-5 links a las fuentes; el spec delta debe referenciar los Requirements existentes en lugar de repetirlos.

3. **Scaffold Angular preexistente**: `apps/frontend-angular/` ya tiene scaffold Angular 20 (35/35 tests, build prod verde según `docs/frontend/00-angular20-port-v0.md:111`), hecho por Marcos en su ciclo archivado `2026-06-29-frontend-angular-shell-public-validation-api-readiness`. Riesgo: que Mati quiera "reorganizar" el scaffold como parte de su misión UI/UX. Mitigación: el resumen debe declarar explícitamente "respetar scaffold existente, no rehacerlo"; el spec base Requirement "Política frontend, pruebas y QA" (líneas 45-52) ya cubre esta regla pero F0-03 debe reiterarla en el resumen de Mati.

4. **Material privado**: aunque F0-03 es documental, el proyecto tiene reglas duras sobre `material_privado_no_versionar/` (`AGENTS.md:33-37`). Riesgo: que el resumen operativo liste archivos de esa carpeta como referencia. Mitigación: el resumen solo nombra la existencia de la carpeta y la regla ("no versionar, no abrir, no copiar credenciales"), nunca su contenido.

5. **Cambio activo de Marcos y ramas de otros**: `openspec/changes/backend-public-endpoint-hardening/` (Marcos, activo) y las ramas `docs/matias-onboarding-f0-02-f0-03` (F0-02 PR pendiente) y `docs/policy-git-switch-checkout` (PR de política Git pendiente) están en el repo. Riesgo: que F0-03 los toque por error o que se confundan. Mitigación: F0-03 trabaja exclusivamente bajo `openspec/changes/f0-03-leer-documentacion-minima-y-mision/` y no toca ninguna otra carpeta `openspec/changes/`; el verify-report confirma que el diff no cruza límites.

6. **Dependencia del merge de la política Git**: F0-03 está sobre `origin/main` (HEAD `711e3ca`) que NO incluye aún la política `permitir-git-switch-checkout-con-aprobacion-explicita` (PR pendiente de merge, rama `docs/policy-git-switch-checkout`, HEAD `a012b25`). El spec base `guia-matias-angular-windows` SÍ incluye la política más reciente (en el Req. "Contexto operativo y misión" línea 11, "Flujo OpenCode/Gentle-AI y SDD" línea 29, "Reporte final y propuestas Git" línea 74) porque la spec fue parcheada en commits previos. F0-03 no depende estrictamente de que la política esté mergeada para correr, pero si Mati quiere esperar al merge para mayor coherencia, podemos frenar el ciclo. **Decisión sugerida**: no frenar; el spec base ya tiene la política codificada y la rama F0-03 funciona sobre la versión actual.

7. **Divergencia de nombre de rama**: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 444 dice `Rama sugerida: docs/matias-onboarding-f0-02-f0-03` (parcheado en F0-02 commit `182ec32`) pero la rama operativa real de F0-03 es `docs/matias-onboarding-f0-03`. Riesgo: confusión sobre cuál es la rama correcta. Mitigación: declarar la rama real en `proposal.md` y `verify-report.md`; volver a parchar la línea 444 en `sdd-archive` con el nombre canónico (esta es la **segunda vez** que se parchea, esta vez bien: Mati ya usó el nombre canónico `docs/matias-onboarding-f0-03` desde el inicio, así que el parche es solo de documentación, no de proceso).

8. **Trampa de auto-commit**: la regla post `79a72ca` permite `git add` + `git commit` con aprobación explícita de Mati. Riesgo: que Mati apruebe un commit sin revisar el diff. Mitigación: `verify-report.md` insiste en el diff-confirmation gate (`git status --short` + `git diff --name-only` antes de stage; `git log origin/<rama>..<rama> --oneline` + `git diff origin/<rama>..<rama> --stat` antes de push) y deja los comandos Git solo como propuesta textual; el ciclo no commitea por su cuenta.

9. **Tamaño del resumen operativo**: el archivo `docs/opencode/onboarding-matias-frontend.md` es más grande que los reportes de F0-01 y F0-02 (~150-180 líneas vs ~70-100) porque consolida más información. Riesgo: que el archivo se vuelva un "mega-doc" difícil de mantener. Mitigación: estructura en 6 secciones discretas con anchor links internos; cada sección tiene un máximo claro de líneas; el resumen se mantiene como **índice de la documentación existente** más que como nueva fuente de verdad.

## Next recommended phase

`sdd-propose`. El change es pequeño, autocontenido, sin código de producto, y su propuesta debe fijar:

- El nombre canónico del archivo de evidencia (sugerido: `docs/opencode/onboarding-matias-frontend.md`; alternativa: `docs/opencode/lectura-minima-y-mision.md`; decisión en `sdd-apply`).
- El delta de spec aditivo de un solo Requirement (`mision-matias-sintetizada` o nombre equivalente) con 3-4 Scenarios en español argentino formal.
- La traducción de la regla de `muestra_pagina/` desde su forma estricta ("si está vacía, bloquea") hacia su forma contextual ("no inventar pantallas para flujos sin diseño aprobado"), coherente con el estado real del repo.
- El parche opcional de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 444 (rama F0-03) y línea 15 (índice F0-F3) durante `sdd-archive`.
- La lista de exclusiones explícitas (scaffold, contratos API, `material_privado_no_versionar/`, cambio activo de Marcos, F0-02 branch, política Git branch).

`sdd-propose` puede arrancar directamente desde este explore sin investigación adicional.
