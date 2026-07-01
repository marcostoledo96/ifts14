# Exploration: F1-01 — Auditar `muestra_pagina/`

## Goal

F1-01 es el primer ciclo de la Fase 1 de Matías (Semana 1) y la primera tarea de producto del lado visual tras los tres ciclos de onboarding (F0-01, F0-02, F0-03). Su objetivo es producir una auditoría documental del estado actual de la referencia v0 en `muestra_pagina/`, declarar formalmente que esa referencia cubre los prompts 4-10, y derivar los prompts 11-22 al documento `MATIAS_PROMPTS_SDD_FASE2.md` para no implementarlos en este ciclo ni en los siguientes hasta que se abran nuevos ciclos F4-F6. La auditoría es la condición previa (y suficiente) para que Matías pueda trabajar el sistema visual propio de Angular 20 sin copiar componentes, sin inventar pantallas para flujos sin diseño aprobado, y sin tocar código de producto en `apps/` ni el scaffold preexistente que Marcos dejó en `apps/frontend-angular/`. El ciclo es de documentación pura, no toca código Angular, y deja la base lista para que F1-02 (próximo ciclo de Matías) pueda arrancar el sistema visual sobre evidencia confirmada.

## Scope (in / out)

### Incluido

- Un nuevo documento de auditoría bajo `docs/frontend/` con nombre tentativo `01-auditoria-muestra-pagina-f1-01.md` (o `01-auditoria-muestra-pagina.md`). Debe contener al menos estas secciones: estado actual de `muestra_pagina/`, las 7 pantallas disponibles con sus estados y referencias a archivos en `muestra_pagina/app/`, `muestra_pagina/components/` y `muestra_pagina/capturas/`, las 12 pantallas pendientes con su prompt derivado a `MATIAS_PROMPTS_SDD_FASE2.md`, riesgos de portado a Angular 20 ya identificados, y próximos pasos (incluyendo el límite "no implementar UI final para prompts 11-22 en este ciclo"). Distinguir explícitamente entre diseño visual (capturas, `muestra_pagina/MANIFIESTO_V0.md`) y código fuente exportado (`app/`, `components/`, `lib/`, `tsconfig.json`, `next.config.mjs`).
- Opcional: un delta aditivo a la spec base `openspec/specs/guia-matias-angular-windows/spec.md` con un nuevo Requirement `auditoria-muestra-pagina-f1-01` y dos o tres escenarios Given/When/Then que codifiquen el resultado de la auditoría. Decisión: solo si el delta aporta criterio nuevo; si no, la auditoría como documento vigente es suficiente y la spec base no necesita crecer (la spec base ya tiene el Requirement "Uso de `muestra_pagina/`" que cubre la regla de no inventar pantallas).
- Opcional: un patch resumido a `docs/frontend/00-angular20-port-v0.md` durante `sdd-archive` para reflejar hallazgos concretos del ciclo (por ejemplo, cantidades de capturas en `muestra_pagina/capturas/`, o confirmaciones de tokens visuales observados), solo si la auditoría descubre algo que ya estaba en v0 pero no había quedado declarado en el documento vivo. No rehacer la sección completa: parchear quirúrgicamente lo que sume verdad.

### Excluido

- Copiar componentes React/Next, hooks, rutas, `tsconfig.json` o `next.config.mjs` desde `muestra_pagina/` a `apps/frontend-angular/`.
- Instalar dependencias desde `muestra_pagina/package.json` o `pnpm-lock.yaml` en el proyecto Angular.
- Escaffoldar o modificar nada en `apps/` o `apps/frontend-angular/`.
- Tocar `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess` o configuración de runtime.
- Modificar `muestra_pagina/` (lectura de nombres y lectura de `README.md`, `AGENTS.md`, `MANIFIESTO_V0.md`; nada más en este ciclo).
- Tocar `material_privado_no_versionar/`, dumps, logs, secretos, `.env*` o credenciales.
- Tocar `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Tocar las ramas no mergeadas de F0-02, del policy change (`docs/policy-git-switch-checkout`) ni de F0-03 (`docs/matias-onboarding-f0-03`). Los archivos del F0-03 que estén en esa rama (notablemente `docs/opencode/onboarding-matias-frontend.md`) no están en `frontend/v0-design-system` y deben leerse desde su rama si se necesita contexto adicional.
- Implementar cualquier pantalla de los prompts 11-22 ni siquiera como placeholder; la derivación a `MATIAS_PROMPTS_SDD_FASE2.md` es registro, no inicio de trabajo.
- Crear archivos de spec, design, tasks, apply-progress, verify-report, archive-report durante este ciclo de exploración; eso es responsabilidad de las fases siguientes (`sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`).

## Existing assets

- `muestra_pagina/README.md` (29 líneas) — declara estado actual (7 pantallas disponibles, 12 pendientes), uso permitido y prohibiciones; confirma que las pantallas disponibles cubren prompts 4-10.
- `muestra_pagina/AGENTS.md` (17 líneas) — refuerza reglas: usar como referencia visual, no como código definitivo, no copiar React/Next, documentar hallazgos en `docs/frontend/` durante `sdd-archive`.
- `muestra_pagina/MANIFIESTO_V0.md` (41 líneas) — declara origen (exportación v0/Stitch), inventario (7 pantallas para prompts 4-10, 12 para prompts 11-22), pantallas incluidas con su prompt asociado, pendientes que siguen `../MATIAS_PROMPTS_SDD_FASE2.md`, y reglas de privacidad (DNI enmascarado en validación pública, no portar capturas con DNI completo).
- Estructura segura de `muestra_pagina/` confirmada con `Get-ChildItem -Force`: 11 archivos en raíz (`.gitignore`, `AGENTS.md`, `components.json`, `MANIFIESTO_V0.md`, `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `postcss.config.mjs`, `prompts_stitch_v0_ifts14.md`, `README.md`, `tsconfig.json`) y 5 directorios (`app/`, `capturas/`, `components/`, `lib/`, `public/`). Las capturas suman 26 imágenes (5 públicas válidas/no encontradas/error/revocadas, 4 admin desktop/mobile, 2 curso, 2 asistir, 3 emitir certificación, 2 login, 1 envío, etc.), alineadas con los prompts 4-10 del MANIFIESTO.
- `docs/frontend/00-angular20-port-v0.md` (134 líneas) — fuente de verdad del port: declara el inventario disponible (tabla de prompts 4-10 con sus rutas Next.js), inventario pendiente (tabla de prompts 11-22 con su complejidad y regla de bloqueo), tokens visuales observados, componentes Angular candidatos, reglas de portado (extraer intención visual, no código), riesgos de portado y estado del scaffold Angular 20 de Marcos en `apps/frontend-angular/` (35/35 tests, build verde, 252.97 kB initial).
- `MATIAS_PROMPTS_SDD_FASE2.md` (146 líneas, ya existe en la raíz) — guía marco de Fase 2 que ya enumera prompts 11-22 en tres bloques (F4, F5, F6) con sus objetivos y bloqueos obligatorios. El ciclo F1-01 NO necesita crear este archivo: ya existe y los prompts 11-22 ya están derivados. El trabajo de F1-01 es confirmar la derivación, no crearla.
- `openspec/changes/archive/2026-06-29-frontend-angular-shell-public-validation-api-readiness/` — ciclo de Marcos más reciente archivado; sirve como referencia estructural de los 8 artefactos OpenSpec (proposal, design, tasks, spec, apply-progress, verify-report, archive-report + explore). Es el template más cercano en tamaño y tipo (ciclo "base técnica", no producto).
- `openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/` — el ciclo F0-02 archivado: usa el mismo branch de política Git (diff-confirmation gate) y tiene una sección de "Review Workload Forecast" muy alineada con la que F1-01 va a necesitar.
- Engram: 8 observaciones archivadas para `sdd/f0-03-leer-documentacion-minima-y-mision/*` (IDs #49 a #56) con la síntesis completa del ciclo F0-03. Útil como precedente de tamaño/estructura de auditoría documental para Mati. La observación clave es #49 (Explore F0-03) y #54 (Apply progress) — confirman que la síntesis de F0-03 dejó un `docs/opencode/onboarding-matias-frontend.md` de ~153 líneas con 9 secciones; F1-01 es un ciclo similar en naturaleza (documental, sin código de producto) pero con un deliverable físicamente más pequeño (un solo archivo de auditoría + opcional un delta a spec base + opcional un patch al `00-angular20-port-v0.md`).
- Spec base `openspec/specs/guia-matias-angular-windows/spec.md` (108 líneas, 9 Requirements) — ya cubre, mediante el Requirement "Uso de `muestra_pagina/`", la regla de "no inventar pantallas si no hay diseño utilizable". Eso significa que el delta aditivo a la spec base en F1-01 es estrictamente opcional y solo tiene sentido si la auditoría descubre un criterio nuevo que la spec base no contemple (por ejemplo, "toda referencia v0 debe tener un MANIFIESTO_V0.md que declare inventario, capturas y pendientes"; este criterio ya está implícito en el MANIFIESTO pero no en la spec base).

## Delta needed

F1-01 debe producir el siguiente contenido nuevo en este orden de prioridad:

1. **Nuevo documento de auditoría** (`docs/frontend/01-auditoria-muestra-pagina-f1-01.md` o `docs/frontend/01-auditoria-muestra-pagina.md`, ~150 líneas estimadas). Secciones mínimas obligatorias:
   - **Estado de `muestra_pagina/`**: confirma la estructura real (11 archivos en raíz, 5 directorios) y que coincide con lo declarado en `muestra_pagina/MANIFIESTO_V0.md` (7 disponibles + 12 pendientes).
   - **Las 7 pantallas disponibles (con estados)**: tabla con prompt, pantalla/flujo, ruta Next.js de referencia, componentes asociados en `muestra_pagina/components/` y capturas disponibles en `muestra_pagina/capturas/`. Cubre prompts 4-10. Estados diferenciados: válido, no exitoso (revocado, no encontrado, expirado), error técnico, login, dashboard, curso nuevo/editar, asistencia, emisión.
   - **Las 12 pendientes (con prompts derivados a `MATIAS_PROMPTS_SDD_FASE2.md`)**: tabla con prompt, pantalla/flujo, complejidad, regla de bloqueo obligatorio (PDF, QR, contrato API, permisos, datos personales, etc.). Cubre prompts 11-22 y referencia el archivo de Fase 2 como fuente.
   - **Riesgos para portar a Angular 20**: lista expandida a partir de la tabla de `docs/frontend/00-angular20-port-v0.md` (8 riesgos declarados), agregando los que la auditoría encuentra al revisar la estructura real (por ejemplo: 26 capturas sin etiquetar explícitamente con el prompt al que corresponden, código Next.js/React con `app/` Router que no es 1:1 traducible a Angular standalone routing, `pnpm-lock.yaml` no compatible con `npm`/Angular, etc.).
   - **Próximos pasos**: dejar claro qué sigue para Matías (F1-02 sobre el sistema visual propio, F4-F6 sobre las pantallas 11-22) y qué bloqueos obligatorios siguen vigentes. Confirmar que prompts 11-22 NO se implementan en este ciclo ni en los siguientes hasta abrir nuevos ciclos F4-F6.
2. **Opcional: 1 ADDED Requirement** a la spec base `openspec/specs/guia-matias-angular-windows/spec.md` (capacidad `auditoria-muestra-pagina-f1-01`, ~40-50 líneas). Decisión recomendada: **NO** en este ciclo, porque la spec base ya cubre la regla general en el Requirement "Uso de `muestra_pagina/`" y la auditoría como documento vigente es suficiente. Si `sdd-propose` o `sdd-spec` encuentra un criterio nuevo realmente portable (por ejemplo, "toda referencia v0 debe declarar su MANIFIESTO_V0.md"), ahí se decide incorporarlo. Esta decisión se documenta en `proposal.md` y se revisa en `sdd-spec`.
3. **Opcional: patch quirúrgico a `docs/frontend/00-angular20-port-v0.md`** durante `sdd-archive`, solo si la auditoría descubre datos puntuales que faltaban (cantidad exacta de capturas, mapeo prompt↔captura, confirmaciones de tokens visuales que el MANIFIESTO declara pero que la auditoría pudo verificar con las imágenes). Cambios esperados: una o dos líneas o una tabla compacta; nada de reescritura.

## Proposed structure for the cycle

El change directory será `openspec/changes/f1-01-auditar-muestra-pagina/` con los 8 artefactos OpenSpec estándar (más `explore.md` que se crea en este turno). Estimación de tamaño por artefacto, basada en el precedente de F0-03 (que produjo 8 artefactos ~970 líneas en total) y en el tamaño esperado más acotado de F1-01:

| Artefacto | Acción | Tamaño estimado | Descripción |
|---|---|---:|---|
| `explore.md` | Crear (este turno) | ~150 | Este archivo: goal, scope, existing assets, delta needed, proposed structure, workload forecast, risks, next phase. |
| `proposal.md` | Crear en `sdd-propose` | ~80 | Why, what changes, capabilities (audit + opcional delta), approach, affected areas, risks, success criteria, review workload forecast, open questions. |
| `design.md` | Crear en `sdd-design` | ~60 | Enfoque de la auditoría (estilo documental, sin código), decisiones de formato (nombre del archivo, secciones obligatorias, tabla de pantallas), cambios de archivo (1 nuevo + opcional 1 patch + opcional 1 delta). |
| `tasks.md` | Crear en `sdd-tasks` | ~70 | 4-5 fases / ~12-15 sub-tareas: (1) verificar estructura, (2) redactar documento de auditoría, (3) opcional delta a spec base, (4) opcional patch a `00-angular20-port-v0.md`, (5) validaciones y cierre. Forecast de revisión. |
| `specs/<capacidad>/spec.md` | Crear en `sdd-spec` si se decide delta | ~50 | Solo si se decide incluir el delta a la spec base. 1 Requirement ADDED, 2-3 escenarios Given/When/Then. Si se decide no incluir delta, este artefacto no existe. |
| `apply-progress.md` | Crear en `sdd-apply` | ~25 | Bitácora de aplicación de las tareas. F1-01 es corto: debería ser un solo bloque. |
| `verify-report.md` | Crear en `sdd-verify` | ~70 | Validaciones automáticas (las 4 del prompt) + QA manual (las 3 del prompt) + diff confirmation + PASS/FAIL. |
| `archive-report.md` | Crear en `sdd-archive` | ~40 | Sync del delta si existe, confirmación de cierre, comandos Git solo propuestos. |

**Tamaño total estimado**: ~250-350 líneas de artefactos OpenSpec (más 150 del doc de auditoría si se cuenta como deliverable permanente). F1-01 es estructuralmente más pequeño que F0-03 porque no consolida requirements preexistentes (la spec base ya está estable) y porque el deliverable principal es un solo documento nuevo, no una síntesis con muchas secciones.

## Review workload forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | ~250-300 (1 doc auditoría ~150 + 7 SDD artifacts ~80 promedio + opcional 1 delta a spec base ~50 + opcional 1 patch al port-v0 ~20 + verify-report ~70) |
| Riesgo de exceder el presupuesto de 400 líneas | **Low** (bien por debajo de 400) |
| PRs encadenados recomendados | **No** (single-pr) |
| Estrategia de entrega | single-pr sobre `frontend/v0-design-system` |
| Decisión antes de apply | **No** (Mati ya dio el alcance en el prompt exacto del archivo `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 494-533; las únicas decisiones pendientes —nombre exacto del doc de auditoría, incluir o no el delta a spec base, incluir o no el patch al port-v0— se resuelven en `sdd-propose` y `sdd-spec`) |
| Tiempo estimado de revisión | Bajo: un solo diff legible, sin código de producto, sin build, sin tests runtime |

## Risks

- **`muestra_pagina/MANIFIESTO_V0.md` no existe o no coincide con la estructura real** — Mitigación: ya verificado en este explore, el archivo existe (41 líneas) y coincide con la estructura (5 directorios: `app/`, `capturas/`, `components/`, `lib/`, `public/`; 11 archivos en raíz; 7 disponibles + 12 pendientes). No requiere acción adicional.
- **`MATIAS_PROMPTS_SDD_FASE2.md` no existe o no tiene los prompts 11-22 listados** — Mitigación: ya verificado en este explore, el archivo existe (146 líneas) y enumera prompts 11-22 en tres bloques (F4, F5, F6) con objetivos y bloqueos obligatorios. La derivación que el prompt original pide está cumplida de antemano. El trabajo de F1-01 es confirmar la derivación y enlazarla desde el documento de auditoría, no crearla.
- **Trampa de copiar React/Next literalmente** — El prompt F1-01 explícitamente prohíbe copiar. Mitigación: la auditoría distingue diseño visual (`capturas/`, `MANIFIESTO_V0.md`) de código fuente exportado (`app/`, `components/`, `lib/`, `tsconfig.json`, `next.config.mjs`) y deja claro que `apps/frontend-angular/` se construye con componentes propios, no portados.
- **No tocar `apps/`, `apps/frontend-angular/` ni `muestra_pagina/`** — F1-01 es estrictamente de solo lectura sobre esas carpetas (excepto `README.md`, `AGENTS.md`, `MANIFIESTO_V0.md` que ya están leídos). El deliverable es 100% en `docs/frontend/`, `openspec/changes/f1-01-auditar-muestra-pagina/`, y opcionalmente `openspec/specs/guia-matias-angular-windows/spec.md` (delta aditivo) o `docs/frontend/00-angular20-port-v0.md` (patch).
- **El doc de F0-03 (`docs/opencode/onboarding-matias-frontend.md`) NO está en la rama actual `frontend/v0-design-system`** — Está en la rama `docs/matias-onboarding-f0-03` (PR pendiente de merge). Si el documento de auditoría F1-01 necesita referenciar la síntesis de Mati, debe enlazarla por ruta sin asumir que está en la rama actual. Mitigación: el documento de auditoría es autocontenido y no necesita el doc de F0-03; lo cita como "pendiente de merge" si lo menciona, o lo omite.
- **La spec base ya cubre la regla de "no inventar pantallas sin diseño aprobado"** — El delta a la spec base puede ser redundante. Mitigación: en `sdd-propose` se documenta la decisión de no incluir delta a menos que aparezca un criterio nuevo realmente portable; en `sdd-tasks` se planifica solo si la decisión cambia.
- **Trampa de auto-commit / auto-push** — `AGENTS.md:21` y `GUIA.md:153` siguen exigiendo aprobación explícita de Mati en el mismo turno del chat + diff-confirmation gate (`git status --short` y `git diff --name-only` antes de `git add`; `git log` y `git diff --stat` antes de `git push`). Mitigación: el verify-report insiste en este gate, y los comandos Git quedan solo como propuesta. `git merge`, `git rebase`, `git push` a `main` y merge de PR siguen prohibidos. La rama de trabajo es `frontend/v0-design-system`, no `main`.
- **Rama de trabajo `frontend/v0-design-system` con trabajo previo de Marcos ya mergeado** — `git log` muestra que la rama está en `711e3ca` con merges de Marcos (PR #10, PR #8). El árbol está limpio. Mitigación: en `sdd-archive` se confirma que el diff de F1-01 solo agrega archivos nuevos en `docs/frontend/`, `openspec/changes/f1-01-auditar-muestra-pagina/` y opcionalmente las dos áreas ya mencionadas; no debe tocar `apps/`, `apps/frontend-angular/`, `apps/backend-php/`, `database/`, `deploy/`, `muestra_pagina/` ni `material_privado_no_versionar/`.
- **Confusión con la rama de trabajo de F0-03** — El prompt F1-01 usa `frontend/v0-design-system` (línea 497), no `docs/matias-onboarding-f0-03` (la rama del F0-03). Mitigación: el `sdd-propose` declara explícitamente la rama operativa correcta.
- **No hay ciclo `sdd-archive` previo de la rama actual** — El último cambio archivado de la rama es el de Marcos (`2026-06-29-frontend-angular-shell-public-validation-api-readiness`). F1-01 no debe asumir artefactos previos de Mati en la rama; debe leer los archivos vigentes al momento de la auditoría.
- **Tamaño del `pnpm-lock.yaml` (129258 bytes) y de `prompts_stitch_v0_ifts14.md` (114631 bytes)** — Son archivos grandes que no se deben abrir ni pegar en respuestas. Mitigación: la auditoría solo los lista por nombre, tamaño y rol (lockfile de pnpm, bitácora de prompts de Stitch). El F1-01 NO los abre ni los resume en el documento de auditoría.

## Ready for Proposal

**Yes.** El alcance de F1-01 es claro y autocontenido: confirmar la referencia visual v0 con un documento nuevo, sin tocar código de producto. La estructura esperada es 8 artefactos OpenSpec pequeños (~250-300 líneas en total), con un solo deliverable permanente nuevo (`docs/frontend/01-auditoria-muestra-pagina-f1-01.md`, ~150 líneas) y dos opcionales (delta a spec base, patch al port-v0) que se deciden en `sdd-propose` y `sdd-spec`. Las dos verificaciones de precondición críticas ya están completas en este explore: `muestra_pagina/MANIFIESTO_V0.md` existe y coincide con la estructura real, y `MATIAS_PROMPTS_SDD_FASE2.md` ya tiene los prompts 11-22 listados.

**Próxima fase recomendada**: `sdd-propose`. Decisiones a resolver en esa fase:

1. Nombre exacto del archivo de auditoría: `01-auditoria-muestra-pagina-f1-01.md` (recomendado, sigue la convención de `docs/frontend/00-angular20-port-v0.md`) o `01-auditoria-muestra-pagina.md` (más limpio, sin el sufijo del ciclo). Recomendación: la primera, porque la auditoría es de F1-01 y la convención del repo ya numera los docs por orden de aparición.
2. Incluir o no el delta aditivo a la spec base. Recomendación inicial: NO; se reactiva en `sdd-spec` solo si aparece un criterio nuevo.
3. Incluir o no el patch a `docs/frontend/00-angular20-port-v0.md`. Recomendación: solo si la auditoría descubre un dato puntual faltante (por ejemplo, la lista de 26 capturas con su mapeo a prompt); si no, se omite.
4. Mensaje de commit sugerido (a proponer en `sdd-archive`, NO a ejecutar): `docs(matias): auditar muestra_pagina v0 (F1-01)`.

## Relevant files (read in this exploration)

- `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 494-533 — definición original del ciclo F1-01.
- `AGENTS.md` — reglas operativas del repo (línea 21: política Git con diff-confirmation gate; sección sobre `muestra_pagina/`).
- `GUIA.md` — guía humana del proyecto (línea 153: política Git equivalente).
- `docs/frontend/00-angular20-port-v0.md` — fuente de verdad del port (134 líneas, incluye inventario disponible prompts 4-10, inventario pendiente prompts 11-22, tokens visuales, componentes candidatos, riesgos de portado, estado del scaffold Angular de Marcos).
- `muestra_pagina/README.md` (29 líneas) — estado y reglas de uso de la referencia v0.
- `muestra_pagina/AGENTS.md` (17 líneas) — reglas operativas de la carpeta.
- `muestra_pagina/MANIFIESTO_V0.md` (41 líneas) — manifiesto declarando origen, inventario, pantallas incluidas, pendientes y reglas de privacidad.
- `MATIAS_PROMPTS_SDD_FASE2.md` (146 líneas) — guía de Fase 2 que ya enumera prompts 11-22 en bloques F4, F5, F6.
- `openspec/specs/guia-matias-angular-windows/spec.md` (108 líneas, 9 Requirements) — spec base consolidada con 1 Requirement dedicado a "Uso de `muestra_pagina/`".
- `openspec/changes/archive/2026-06-29-frontend-angular-shell-public-validation-api-readiness/` — template estructural más cercano (8 artefactos OpenSpec sobre `frontend-angular-shell`).
- `openspec/changes/archive/2026-06-28-f0-02-verificar-opencode-gentle-ai/proposal.md` — precedente de F0-02 con sección de "Review Workload Forecast" alineada.
- `openspec/changes/backend-public-endpoint-hardening/exploration.md` — ejemplo de estilo OpenSpec de `exploration.md` (sigue estructura Current State / Affected Areas / Approaches / Recommendation / Risks / Ready for Proposal).
- Engram observación #49 (Explore F0-03) — precedente del ciclo F0-03 archivado: 9 secciones en el doc de síntesis, 153 líneas, sin código de producto. Sirve como benchmark de tamaño/estructura para F1-01.

## Do not touch (read-only this cycle)

- `apps/`, `apps/frontend-angular/` (scaffold de Marcos, 35/35 tests).
- `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess`.
- `muestra_pagina/` — solo lectura de `README.md`, `AGENTS.md`, `MANIFIESTO_V0.md` y nombres vía `Get-ChildItem`. No abrir `app/`, `components/`, `lib/`, `public/`, `package.json`, `pnpm-lock.yaml`, `next.config.mjs`, `tsconfig.json`, `postcss.config.mjs`, `components.json`, `prompts_stitch_v0_ifts14.md` ni las 26 imágenes en `capturas/`.
- `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos.
- `openspec/changes/backend-public-endpoint-hardening/` (cambio activo de Marcos).
- Ramas no mergeadas: `docs/matias-onboarding-f0-03` (F0-03 PR), `docs/policy-git-switch-checkout` (policy change PR), `docs/matias-onboarding-f0-02-f0-03` (F0-02 PR).
- `main` (HEAD `711e3ca`) — rama de solo lectura.
