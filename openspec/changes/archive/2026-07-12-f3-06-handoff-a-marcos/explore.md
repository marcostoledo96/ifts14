# Exploración — F3-06 Handoff a Marcos

**Change**: `f3-06-handoff-a-marcos`
**Tipo**: exploration (planning, no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-12
**Almacén de artefactos**: OpenSpec + Engram (hybrid, `capture_prompt: false` en Engram)
**Rama actual**: `qa/frontend-release-readiness` (HEAD `e8b3f56`, 1 commit adelante de `origin/main@ca2f9c3`)
**Rama objetivo sugerida**: continuar sobre `qa/frontend-release-readiness` (la guía unificada de Mati lo permite, y la rama ya es la base de F3-05)
**Referencia normativa**: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1279-1325 (definición de F3-06) + líneas 1485-1755 (definiciones de F4-F6)
**Store mode**: `both` (OpenSpec + Engram, `capture_prompt: false`)

## 1. Goal

F3-06 es el **sexto y último ciclo de Fase 3** y consiste en entregar a Marcos un **handoff revisable** con el estado completo del módulo `/certificados/`: evidencia, riesgos, pendientes, handoff a F4-F6 y comandos Git propuestos para decisión humana. Es un ciclo **estrictamente documental**: no introduce código de producto, no despliega, no modifica specs, no toca el cambio activo de Marcos (`openspec/changes/backend-public-endpoint-hardening/`) ni la rama de F0 sin merge. Su cierre formaliza la entrega de Mati a la cadena de release/admin de Marcos y abre la puerta a los 12 ciclos pendientes de F4-F6.

A diferencia de F3-04 (QA manual transversal) y F3-05 (verificación de build), F3-06 **no ejecuta verificaciones automáticas nuevas**: consolida la evidencia ya producida en F2-04/F2-05/F2-06/F3-04/F3-05/F4-01/F4-02/M3-06, la empaqueta en un solo documento legible, y deja a Marcos un mapa de qué cambió, qué validar, qué decidir y qué comandos Git correr. Los comandos Git se **proponen** (no se ejecutan por OpenCode) y los flujos 11-22 **no se mezclan** con el cierre de F3.

## 2. Scope (in / out)

### 2.1 In scope

- **Crear 1 documento nuevo** en `docs/frontend/` con el handoff a Marcos. Nombre propuesto: `05-handoff-marcos-f3-06.md` (sigue la numeración 00-/01-/02-/03-/04- de la carpeta y deja F4-01/F4-02 con su nomenclatura propia `F4-01-`/`F4-02-`; alternativa: `handoff-marcos-f3-06.md` sin número, decisión a tomar en `sdd-propose`). Secciones esperadas (~250-300 líneas, basado en el precedent F3-05 + F3-04):
  1. **Resumen ejecutivo** — estado consolidado del módulo, qué queda listo, qué requiere decisión humana.
  2. **Estado de Mati en Fase 3** — tabla con los 4-5 entregables cerrados (F2-04/F2-05/F2-06 de la fase admin + F3-04/F3-05 release-readiness), rama, HEAD, evidencia.
  3. **Estado de los 7 PRs en cola para Marcos** — F0-02 (verificar OpenCode), F0-03 (leer documentación mínima), F1-01 (auditar muestra_pagina), F1-02 (v0 design system), F3-04 (QA manual), F3-05 (build), policy (permitir-commit / permitir-switch con aprobación). Status, rama, decisión pendiente.
  4. **Resumen de F3-04 (QA manual)** — qué se verificó, qué placeholders están pendientes (las 5 secciones con "Pendiente" en `docs/frontend/03-qa-manual-f3-04.md` que Mati debe completar en navegador).
  5. **Resumen de F3-05 (build)** — comando ejecutado, output, 30 artefactos en `dist/`, base href verificada, 2 warnings de CSS budget (carry-forward desde F4-01/F4-02: 14.31 kB y 13.70 kB < 16 kB error).
  6. **Roadmap F4-F6** — los 12 ciclos definidos en `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1485-1755, con objetivo, rama sugerida, archivos a leer, validaciones, QA, archive y commit sugerido. Marcar cuáles están **habilitados** (F4-01, F4-02, F4-03, F4-04, F5-01, F5-02, F5-03, F5-04, F6-01, F6-02, F6-03, F6-04), **bloqueados** (los que requieren spec previa de PDF/QR/revocación/permisos: F4-02, F6-01, F6-04; F4-01 si incluye historial/QR/revocación real), y **pendientes** (los que requieren acción previa de Marcos: F4-01 si quiere F4-02 acoplable, F6-02 si carga masiva real, F6-03 si auditoría real).
  7. **Riesgos y pendientes** — 2 warnings CSS budget, 2 chunks unnamed (`chunk-JQPWM6M7.js` 141.49 kB, `chunk-7EIYO3ES.js` 114.56 kB), 5 placeholders del F3-04 QA, `.htaccess` SPA fallback necesario para deep links en cPanel, `dist/` no versionado, `muestra_pagina/` solo referencia visual, sin auth admin real, sin composer/vendor versionado.
  8. **Comandos Git propuestos (NO ejecutados por OpenCode)** — `git status --short` + `git diff --stat` como evidencia, más `git add` + `git commit -m "docs(frontend): preparar handoff a marcos"` + `git push -u origin qa/frontend-release-readiness` (la rama ya está tracked, no necesita `--set-upstream` nuevo pero el comando se incluye como `git push origin` para Mati).
  9. **Decisiones requeridas de Marcos** — lista explícita: ¿mergea F3-05 PR primero o acepta el handoff en la misma PR? ¿corre la pasada visual de F3-04 antes del handoff? ¿bloquea F4-01+F4-02 acoplados o separados? ¿prioriza admin-certifications o certificate-detail-pdf?
- **Parchear `docs/frontend/00-angular20-port-v0.md`** con dos sub-secciones nuevas (o un párrafo) que documenten el cierre de Fase 3 de Mati: (a) F3-04 (link al QA report) y (b) F3-05 (link al build report) y (c) F3-06 (link al handoff). Esto completa la sección "Ver también" creada en F3-05 y mantiene trazabilidad cruzada.
- **Crear los 7 artefactos SDD estándar** del change: `explore.md` (este), `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md`. Sin `spec.md` (ciclo operacional, no nueva capacidad).
- **Cerrar con `sdd-archive`**: mover el change dir a `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/` (la fecha `2026-07-12` es coherente con la fecha de hoy del entorno, el timestamp del F3-05 commit `e8b3f56` y el patrón de archives recientes del mismo día: `2026-07-12-f3-05-build-para-certificados/`, `2026-07-12-f4-01-certificate-detail/`, `2026-07-12-f4-02-certificate-pdf-preview/`).

### 2.2 Out of scope

- **Código de producto**: no se modifica `apps/frontend-angular/src/**`, ni `package.json`, ni lockfiles, ni `angular.json`. F3-06 es documental puro.
- **Scaffold Angular, dependencias, `npm install`/`npm ci`**, build, deploy, `ng build`, copy a `public_html/`, configuración de servidor real.
- **Modificar el cambio activo de Marcos**: `openspec/changes/backend-public-endpoint-hardening/` (off-limits per AGENTS.md y guia línea 1282-1290).
- **Ramas F0 sin mergear** (`frontend/v0-design-system`, `frontend/admin-foundation`, `frontend/admin-courses-dates`, `frontend/admin-attendance`, `frontend/admin-certifications`): no se hace merge, cherry-pick, ni rebase desde ellas. El F3-04 work vive sólo en `frontend/v0-design-system` (commit `70008f0`) y queda como "pendiente de decisión" para Marcos.
- **Tocar `muestra_pagina/`** (sólo referencia visual; no compilar, no portar React/Next literalmente), `material_privado_no_versionar/` (off-limits per AGENTS.md), ni `database/`, `deploy/`, `apps/backend-php/`.
- **Delta a `openspec/specs/`**: F3-06 no introduce ni modifica capacidades. La spec base (release-readiness implícito en la metodología SDD) ya cubre el handoff.
- **Implementar nada de F4-F6**: F3-06 sólo **documenta** el roadmap, no ejecuta ni un solo ciclo posterior. El handoff es a Marcos, no a OpenCode.
- **Mezclar flujos 11-22 con el cierre de F3**: el handoff lista los 12 ciclos F4-F6 como roadmap, pero NO empieza a implementar detalle de certificación, PDF, cursos, alumnos, entrega, revocación, auditoría, configuración ni carga masiva. Esos son 12 cambios separados que Marcos toma como propios.
- **No convertir el handoff en commit automático**: los comandos Git son PROPUESTOS; OpenCode NO ejecuta `git add` / `git commit` / `git push` por su cuenta (per AGENTS.md:21, per guia línea 1298, per auto-commit trap documentado en riesgos).

## 3. Existing assets

Esta sección lista los archivos y secciones que ya cubren (parcial o totalmente) el tema "handoff a Marcos" y que el explore recomienda reusar en lugar de reescribir.

| Archivo | Estado | Rol en F3-06 |
|---|---|---|
| `docs/frontend/00-angular20-port-v0.md` | Existe, ya parcheado en F3-04 + F3-05 (sección "## Ver también" creada). Tiene estado F2-03..F2-06 + F4-01 + F4-02 + M3-06 final; **NO tiene estado F3-04 ni F3-05** (esos quedaron sólo en los reportes, no en el port-v0). | **Patch menor** (3 sub-entradas adicionales en "Ver también": F3-04, F3-05, F3-06). |
| `docs/frontend/04-build-validacion-f3-05.md` | Existe (171 líneas, 10 secciones). Resumen ejecutivo + comando + output verbatim + 30 artefactos + warnings CSS + base href verificada. | **Reusar tal cual** como evidencia de F3-05. Enlazar desde el handoff. |
| `docs/frontend/03-qa-manual-f3-04.md` | **NO existe en este árbol** (`Test-Path` ⇒ `False`). Sólo en `frontend/v0-design-system` (commit `70008f0`, no mergeado a main). | **Describir abstractamente** en el handoff: "5 secciones de QA manual (Responsive, Teclado y foco, Contraste, Estados, Consola) tienen placeholders 'Pendiente' por diseño; Mati completa la pasada visual en navegador antes de aceptar el handoff como completo". Enlazar al archive de F3-04 en Engram si está disponible. |
| `openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/` | Existe (7 artefactos: explore, proposal, design, tasks, apply-progress, verify-report, archive-report). | **Reusar como precedente estructural** y como fuente de la sección "Resumen de F3-05" del handoff. Enlazar al `archive-report.md` desde el handoff. |
| `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/` | Existe (F4-01 cerrado). | Referencia para handoff a Marcos: el handoff debe indicar que F4-01 está cerrado y mergeado (no requiere acción). |
| `openspec/changes/archive/2026-07-12-f4-02-certificate-pdf-preview/` | Existe (F4-02 cerrado). | Idem F4-01. |
| `openspec/changes/archive/2026-07-12-f4-02-codex-feedback/` | Existe (F4-02 review). | Referencia para handoff: documenta el feedback Codex aplicado en F4-02. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1279-1325 | Existe, definición de F3-06. | **Fuente normativa**. La propuesta y el design del change derivan directamente de este prompt. |
| `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1485-1755 | Existe, definiciones de F4-F6 (12 ciclos: F4-01..F4-04, F5-01..F5-04, F6-01..F6-04). | **Fuente normativa del roadmap**. El handoff reusa estas definiciones casi literalmente (objetivo, archivos a leer, validaciones, QA, archive, commit sugerido) sin reescribirlas — sólo agrega el estado (habilitado/pendiente/bloqueado). |
| `docs/00-indice-general.md` | Existe (52 líneas). | **NO requiere patch** — el handoff entra como un doc nuevo en `docs/frontend/`, no como spec nueva. El índice no lista los docs de `docs/frontend/` uno por uno (lista por área). Mantiene el principio "enlazar la fuente vigente, no duplicar". |
| `apps/frontend-angular/dist/frontend-angular/` | Existe, 30 archivos, `index.html` línea 6 con `<base href="/certificados/">`. | **NO se toca**; es artefacto del F3-05, no se versiona. El handoff referencia el output del F3-05 por enlace al `04-build-validacion-f3-05.md`, no por inspección directa. |

### Estado de los PRs de Mati en cola para Marcos (al cierre de F3-05)

El handoff debe listar estos PRs (estimación basada en Engram #98 + archive de F3-05 + tabla de responsibilities en `00-angular20-port-v0.md` línea 21):

| PR / ciclo | Estado | Rama | Acción de Marcos |
|---|---|---|---|
| F0-02 — verificar OpenCode/Gentle-AI | Cerrado, mergeado a `main` (archive 2026-06-28) | N/A (main) | Ninguna — referencia histórica. |
| F0-03 — leer documentación mínima y misión | Cerrado, mergeado a `main` (archive 2026-06-28) | N/A (main) | Ninguna — referencia histórica. |
| F1-01 — auditar `muestra_pagina/` | Cerrado, mergeado a `main` (archive 2026-06-30). PR #33 en main. | N/A (main) | Ninguna — referencia histórica. |
| F1-02 — v0 design system | Cerrado, mergeado a `main` (archive 2026-07-07). PR #33 en main. | N/A (main) | Ninguna — referencia histórica. |
| F3-04 — QA manual completo | Cerrado en archive, **NO mergeado a main**. Commit `70008f0` sólo en `frontend/v0-design-system`. | `frontend/v0-design-system` | Decisión: ¿mergea el commit `70008f0` + el reporte F3-04, o re-corre F3-04 sobre `qa/frontend-release-readiness`? |
| F3-05 — build para `/certificados/` | Cerrado en `qa/frontend-release-readiness`, commit `e8b3f56` pusheado a origin, **PR pendiente de crear** (per Engram #98). | `qa/frontend-release-readiness` | Decisión: ¿crea el PR contra `main` o acepta el handoff F3-06 antes? |
| Policy commits (F0-02-related: `2026-06-28-permitir-commit-con-aprobacion-explicita`, `2026-06-28-permitir-git-switch-checkout-con-aprobacion-explicita`) | Mergeados a main (archives 2026-06-28). | N/A (main) | Ninguna — referencia histórica. |

Total: **2 PRs pendientes reales** (F3-04 y F3-05) + 5 PRs ya mergeados como referencia. El handoff debe ser claro sobre cuáles requieren acción y cuáles son contexto.

### Estado de la rama al cierre de F3-05

- Rama activa: `qa/frontend-release-readiness`.
- HEAD local y remoto: `e8b3f56` (commit `build(frontend): validar build certificados`).
- `origin/main` HEAD: `ca2f9c3`.
- Diferencia: **1 commit adelante de `origin/main`** (F3-05).
- `git status --short` esperado: limpio, 0 untracked, 0 modified (per Engram #97 + #98). Verificar al inicio de F3-06.
- Archivos modificados por F3-05: `docs/frontend/00-angular20-port-v0.md` (patch +4 líneas en "Ver también") + `docs/frontend/04-build-validacion-f3-05.md` (nuevo, 171 líneas) + 7 archivos en `openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/`.
- Working tree F3-05 final: 1 modified + 1 untracked + 1 untracked (archive dir). **El F3-05 commit ya consolidó todo**, así que al inicio de F3-06 el árbol está limpio desde `e8b3f56`.

## 4. Delta needed

### 4.1 Contenido nuevo

1. **`docs/frontend/05-handoff-marcos-f3-06.md`** (NUEVO, ~250-300 líneas) con 9 secciones:
   - **Resumen ejecutivo** (5-8 líneas) — módulo release-ready, requiere decisión humana para merge, 12 ciclos F4-F6 mapeados.
   - **Estado de Mati en Fase 3** (tabla) — 5 entregables cerrados, rama, HEAD, archive path.
   - **Estado de los 7 PRs en cola para Marcos** (tabla) — ver §3 arriba.
   - **Resumen de F3-04 (QA manual)** (~30 líneas) — qué se verificó, qué placeholders quedan, dónde está el reporte si Mati lo necesita.
   - **Resumen de F3-05 (build)** (~40 líneas) — comando, output, 30 artefactos, base href verificada, 2 warnings CSS, pendientes.
   - **Roadmap F4-F6** (tabla, 12 filas) — para cada ciclo: objetivo one-liner, rama sugerida, estado (habilitado/pendiente/bloqueado), archivo de spec/contrato previo, decisión humana si aplica.
   - **Riesgos y pendientes** (tabla, ~10 filas) — severidad, descripción, mitigación, ciclo siguiente sugerido.
   - **Comandos Git propuestos (NO ejecutados por OpenCode)** — bloque verbatim con 5-6 comandos.
   - **Decisiones requeridas de Marcos** (lista, ~5-7 bullets) — cada decisión con la pregunta exacta, el impacto, y la rama/PR afectado.

2. **Patch a `docs/frontend/00-angular20-port-v0.md`** (~3-6 líneas) — agregar 3 sub-entradas a la sección "Ver también":
   - `- F3-04 — QA manual completo: ver \`docs/frontend/03-qa-manual-f3-04.md\` (commit \`70008f0\` en \`frontend/v0-design-system\`; archive OpenSpec en \`openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/\` si existe; reporte vivo en rama actual).`
   - `- F3-05 — Build para \`/certificados/\`: ver \`docs/frontend/04-build-validacion-f3-05.md\` (archive \`openspec/changes/archive/2026-07-12-f3-05-build-para-certificados/\`).`
   - `- F3-06 — Handoff a Marcos: ver \`docs/frontend/05-handoff-marcos-f3-06.md\` (archive \`openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/\`).`

   **Decisión recomendada en `sdd-propose`**: incluir el F3-04 como referencia abstracta (el archivo no está en el árbol actual), el F3-05 como referencia directa (el archivo está commiteado), y el F3-06 como self-link.

3. **Artefactos OpenSpec del change** (esperados en `sdd-propose` → `sdd-design` → `sdd-tasks`):
   - `explore.md` (este archivo, ~280 líneas estimadas).
   - `proposal.md` (~100-120 líneas, patrón F3-05: scope in/out, capabilities = none, affected areas, risks, success criteria).
   - `design.md` (~80-100 líneas: 9 secciones del handoff, plan de validación, comandos Git, out of scope).
   - `tasks.md` (~60-80 líneas, 4-5 fases: setup, redacción del handoff, patch port-v0, verify, archive).
   - `apply-progress.md` (~80-100 líneas, log de ejecución con timestamps).
   - `verify-report.md` (~80-100 líneas, 12-15 checks de validación).
   - `archive-report.md` (~80-100 líneas, resumen + comandos Git propuestos).

4. **Cambio de directorio de archive en `sdd-archive`**: mover `openspec/changes/f3-06-handoff-a-marcos/` a `openspec/changes/archive/2026-07-12-f3-06-handoff-a-marcos/`. El archivo permanente (`docs/frontend/05-handoff-marcos-f3-06.md`) NO se mueve (queda accesible como referencia para F4+).

### 4.2 Contenido NO modificado

- `docs/00-indice-general.md` — sin cambios (el handoff entra como doc de `docs/frontend/`, no requiere nuevo índice).
- `docs/opencode/` — sin cambios (no se modificó el flujo OpenCode; F3-06 es lineal y no introduce gates nuevos).
- `openspec/specs/` — sin cambios (F3-06 no es nueva capacidad).
- `apps/frontend-angular/` — sin cambios (no se toca código).
- `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, `apps/backend-php/`, `apps/frontend-angular/dist/` — off-limits.

## 5. Proposed structure for the cycle

Estructura SDD estándar para F3-06, replicando el patrón F3-05 (sin `specs/` ni `spec.md`):

| Artefacto OpenSpec | Tamaño esperado | Notas |
|---|---:|---|
| `explore.md` | ~280 líneas | Este archivo. |
| `proposal.md` | ~100-120 líneas | Patrón F3-05: 9-12 criterios de aceptación hard, lista de deliverables, out-of-scope explícito, success criteria verificables. |
| `design.md` | ~80-100 líneas | Plan de validación: 12-15 checks, estructura del handoff (9 secciones), comandos Git propuestos, fallback si Mati no aprueba el push. |
| `tasks.md` | ~60-80 líneas | 4-5 fases: setup (verificar rama/HEAD/working tree), redacción (crear handoff + patch port-v0), validación previa al verify (estructura, secretos, ortografía), cierre (archive), sanity final. |
| `apply-progress.md` | ~80-100 líneas | Log con timestamps de cada paso. |
| `verify-report.md` | ~80-100 líneas | Veredicto PASS, 12-15 checks PASS, 9-12 criterios PASS, 0 CRITICAL. |
| `archive-report.md` | ~80-100 líneas | Resumen del handoff, comandos Git PROPUESTOS al operador (NO ejecutados), handoff a F4-F6, observaciones Engram. |

**Forecast total**: ~780-880 líneas tracked, ~10 archivos tocados (7 SDD + 1 doc nuevo + 1 patch port-v0 + 1 archive dir). Bien por debajo del budget 4000.

## 6. Review workload forecast

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | **~250-300** (1 handoff report ~250-300 + 1 patch port-v0 ~6 + 7 SDD artifacts ~110 average + 1 archive dir sin contenido) |
| Riesgo de exceder presupuesto de 400 líneas | **Low** (well under 400; similar a F3-04 forecast) |
| PRs encadenados recomendados | **No** (single PR sobre `qa/frontend-release-readiness`) |
| Estrategia de chain | No aplica |
| Decisión necesaria antes de apply | **No** (Mati ya dio el scope en el prompt del orquestador; la única decisión es naming del archivo `05-handoff-marcos-f3-06.md` vs `handoff-marcos-f3-06.md`, recomendada la primera por numeración existente) |

**Notas sobre el forecast**:

- **Single PR** es la opción correcta: F3-06 no toca código, sólo agrega 1 doc nuevo + 1 patch menor + mueve un change dir. No hay forma natural de dividir.
- **Budget 400** se respeta holgadamente: el handoff es de 250-300 líneas, los SDD artifacts suman ~600 (repartidos en 7 archivos), el patch port-v0 son 6 líneas. Total tracked: ~850, **muy por debajo del límite 4000** (F3-04 cerró con ~1010 inserciones, F3-05 con ~250 tracked + build report ~280; F3-06 está en el mismo orden).
- **Pre-push safety** ya no requiere `--set-upstream` porque la rama `qa/frontend-release-readiness` ya está tracked en `origin` (per Engram #98). El comando será `git push origin qa/frontend-release-readiness`, no `git push -u origin qa/frontend-release-readiness`.

## 7. Risks

| # | Riesgo | Severidad | Mitigación |
|---|---|---|---|
| R1 | `docs/frontend/03-qa-manual-f3-04.md` NO está en este árbol (`Test-Path` ⇒ `False`; commit `70008f0` sólo en `frontend/v0-design-system`). El handoff no puede enlazar al archivo como si existiera. | **MEDIO** | El handoff describe el F3-04 **abstractamente** (5 secciones con placeholders "Pendiente" por diseño, Engram #85 + #86) y enlaza al archive de F3-04 si existe (`openspec/changes/archive/2026-06-30-f3-04-qa-manual-completo/`, que NO está en el árbol — confirmar con Engram o pedirle a Mati que mergee el commit `70008f0` antes de aceptar el handoff). |
| R2 | Las 5 secciones del F3-04 QA manual tienen placeholders "Pendiente" por diseño (Mati completa la pasada visual en navegador). Si Mati no la corre antes del handoff, el handoff hereda la deuda. | **MEDIO** | El handoff documenta explícitamente que F3-04 está "cerrado con placeholders" y que la pasada visual en navegador queda como acción de Mati antes de aceptar release-readiness. Esto es honestidad documental, no bloqueo. |
| R3 | Los 2 warnings de CSS budget (`certification-preview-page.css` 14.31 kB + `certification-pdf-preview-page.css` 13.70 kB, < 16 kB error) son carry-forward desde F4-01/F4-02. El handoff los reporta como "pendiente futuro" pero NO como blocker. | **BAJO** | Documentar el trade-off (paridad visual vs. budget) en el handoff; señalar que `angular.json:249` ya ajustó el budget a 8 kB warn / 16 kB error. Code-splitting o ajuste de budget queda para ciclo futuro. |
| R4 | Los 2 chunks unnamed (`chunk-JQPWM6M7.js` 141.49 kB, `chunk-7EIYO3ES.js` 114.56 kB) no tienen nombre de feature en el output del build. Causa probable: dependencias vendorizadas (Angular core, Router, Forms). | **BAJO** | Documentar en el handoff como "pendiente de investigación"; el F3-05 ya lo registró (sección 8 del build report). No es blocker para release. |
| R5 | `.htaccess` SPA fallback para deep links en cPanel **no se valida** en F3-05 ni en F3-06. Sin esta config, rutas como `/admin/login` directo fallan en producción (cPanel necesita `FallbackResource` o `RewriteRule` para SPA). | **MEDIO** | El handoff lo lista como decisión de Marcos: ¿se agrega `.htaccess` en F4-04 (detalle de curso) o como ciclo dedicado antes de F4-01? El F3-05 ya documentó esto como pendiente de F3-06 o ciclo dedicado; F3-06 lo confirma y lo entrega a Marcos. |
| R6 | Mati debe correr la pasada visual de F3-04 en navegador antes de que F3-06 sea "completo" (per F3-04 design). Si no lo hace, F3-06 hereda la deuda. | **MEDIO** | El handoff documenta explícitamente esta dependencia; no es blocker para el cierre de F3-06, pero es un "próximo paso" claro para Mati. |
| R7 | **7 PRs en cola para Marcos** (F0-02, F0-03, F1-01, F1-02, F3-04, F3-05, 2 policies). El handoff debe listarlos todos con status, no sólo los pendientes. | **BAJO** | Sección 3 del handoff (tabla). Los 5 ya mergeados se listan como "ninguna acción"; los 2 pendientes (F3-04 + F3-05) requieren decisión explícita. |
| R8 | **Auto-commit trap**: per AGENTS.md:21 + guía línea 1298, `git add` + `git commit` + `git push` requieren aprobación explícita de Mati en el mismo turno + diff-confirmation gate + pre-push safety. El handoff NO se commitea solo. | **BAJO** | Los comandos Git se documentan como PROPUESTOS (no ejecutados). El `verify-report.md` y el `archive-report.md` incluyen los comandos exactos + el pre-push safety; Mati decide en su turno. |
| R9 | La rama `qa/frontend-release-readiness` es la misma de F3-05. F3-06 es **un nuevo commit encima** de `e8b3f56`, no una rama nueva. Si Mati prefiere un PR dedicado para F3-06, el handoff debe sugerir crear `qa/f3-06-handoff-a-marcos` desde `e8b3f56`. | **BAJO** | El handoff propone continuar sobre `qa/frontend-release-readiness` (single PR) como recomendación; deja abierta la opción de PR dedicado si Mati lo prefiere. Decisión humana. |
| R10 | **Off-limits**: Marcos's active change (`openspec/changes/backend-public-endpoint-hardening/`), F0 unmerged branches (`frontend/v0-design-system`, etc.), `muestra_pagina/`, `material_privado_no_versionar/`. F3-06 no toca nada de esto. | **BAJO** | Verificación explícita en `verify-report.md` con `git diff --stat` sobre los paths off-limits. Out of scope documentado en §2.2. |
| R11 | F3-06 podría tentarse a "empezar" F4-01 (detalle de certificación) en el mismo commit. NO — F3-06 es cierre de F3, no inicio de F4. La guía línea 1312 lo dice explícitamente. | **MEDIO** | El handoff es roadmap, no implementación. El explore, proposal, design y tasks de F3-06 no contienen código de F4+. La sección "Roadmap F4-F6" es una tabla con referencias a la guía, no specs. |
| R12 | Naming del archivo del handoff: `05-handoff-marcos-f3-06.md` vs `handoff-marcos-f3-06.md` vs `05-handoff-f3-06.md`. La decisión afecta futuros ciclos. | **BAJO** | Recomendado `05-handoff-marcos-f3-06.md` (sigue numeración 00/01/02/03/04 existente; self-descriptive). Decisión final en `sdd-propose`. |
| R13 | Si el push de F3-05 (rama `qa/frontend-release-readiness`) no se mergea antes de F3-06, el PR de F3-06 incluye ambos cambios (F3-05 + F3-06). Esto es operacionalmente válido pero puede diluir el review. | **BAJO** | El handoff documenta esta opción: Mati puede (a) merge F3-05 primero y crear PR limpio para F3-06, o (b) aceptar PR combinado con F3-05 + F3-06. Decisión humana. |
| R14 | El bloqueador ambiental `node_modules` no instalado que apareció en F3-04 y F3-05 (mitigado por `npm ci` antes del build) puede reaparecer si Mati corre el build de F3-05 de cero. F3-06 no ejecuta build, pero el handoff debe mencionarlo. | **BAJO** | El handoff sección "Riesgos y pendientes" menciona `node_modules` como nota: "el build de F3-05 requirió `npm ci` previo; cualquier ciclo futuro que ejecute build debe repetir este paso". |
| R15 | El patch a `00-angular20-port-v0.md` puede crear conflicto de merge si Marcos ya tiene un patch pendiente en la misma sección "Ver también". | **BAJO** | Verificar con `git log --all --oneline` antes de patchar; si hay conflicto, abrir issue con Marcos antes de aplicar. Out of scope resolver conflictos fuera de `qa/frontend-release-readiness`. |

## 8. Next recommended phase

**`sdd-propose`**.

Razones:

1. **Scope claro y acotado**: 1 doc nuevo + 1 patch + 7 SDD artifacts. Cero código de producto. Cero specs.
2. **Precedente estructural directo en F3-05** (mismo carácter documental, misma rama, mismo `defaultConfiguration`).
3. **Precedente adicional en F3-04** (mismo `## Ver también` patch, mismo flujo "explore → propose → design → tasks → apply → verify → archive").
4. **Hallazgo favorable confirmado**: rama `qa/frontend-release-readiness` ya existe y está tracked en origin (per Engram #98), 1 commit adelante de `ca2f9c3`. F3-06 continúa sobre esta base sin crear rama nueva.
5. **Riesgo de revisión bajo**: ~250-300 líneas estimadas, ~7% del budget 4000.
6. **Cero modificaciones a código de Marcos**: `apps/frontend-angular/` intacto; `openspec/changes/backend-public-endpoint-hardening/` intacto; `muestra_pagina/`, `material_privado_no_versionar/`, `database/`, `deploy/`, `apps/backend-php/` intactos.
7. **Decisiones humanas explícitas**: el handoff deja 5-7 decisiones para Marcos (merge F3-05 antes o después, merge F3-04 o re-correr, PR combinado o separado, etc.). Esto cierra Fase 3 con honestidad documental.

**Punto a confirmar por Mati al inicio de `sdd-propose`**:

- **Naming del archivo**: `docs/frontend/05-handoff-marcos-f3-06.md` (recomendado) vs `handoff-marcos-f3-06.md` vs `05-handoff-f3-06.md`.
- **Estructura de las 9 secciones del handoff**: la lista de §4.1 es una recomendación; Mati puede ajustar el orden o合并 secciones si lo prefiere.
- **Frecuencia de las decisiones humanas**: ¿5, 7 o más? El explore recomienda 5-7 balanceadas (cubren merge, scope, prioridad, formato).

## 9. Listo para propuesta

**Sí**, con las siguientes condiciones para el orquestador:

- Indicar al usuario que la fase siguiente recomendada es `sdd-propose`, con el scope descrito en §2-§4.
- Confirmar el naming del archivo del handoff (`05-handoff-marcos-f3-06.md` recomendado).
- Confirmar que la rama de trabajo sigue siendo `qa/frontend-release-readiness` (1 commit adelante de `origin/main`, HEAD `e8b3f56`).
- Recordar al usuario que F3-06 NO inicia F4-F6: es cierre de F3, no apertura de F4. Los 12 ciclos F4-F6 son roadmap, no implementación.

## 10. Observaciones Engram referenciadas

- `#80` — Explore F3-04 (precedente directo, mismo flujo documental).
- `#81-#86` — Proposal, design, tasks, apply-progress, verify-report, archive-report de F3-04.
- `#87` — Session summary F3-04.
- `#89-#98` — Explore, proposal, design, tasks, apply-progress, verify-report, archive-report, session summary, decision F3-05 (ciclo recién cerrado).
- `#85` — Verify report F3-04 (las 5 secciones con placeholders "Pendiente" por diseño).

Topic key para la observación de este explore: `sdd/f3-06-handoff-a-marcos/explore`.
