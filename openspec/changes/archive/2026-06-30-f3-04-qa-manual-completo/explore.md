# Exploración — F3-04 QA manual completo

**Change**: `f3-04-qa-manual-completo`
**Tipo**: exploration (planning, no implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-12
**Almacén de artefactos**: OpenSpec + Engram (hybrid)
**Rama actual**: `frontend/v0-design-system` (post `git reset --hard origin/main`, HEAD `e399833`)
**Rama objetivo sugerida por la guía**: `qa/frontend-release-readiness`. **Decisión recomendada**: continuar sobre `frontend/v0-design-system` (la rama vigente de Mati) salvo instrucción explícita en contrario. Mati ya eligió esta rama en su última indicación.

## Resumen ejecutivo

F3-04 es el **cuarto ciclo de la Fase 3 de Matías** (después de F3-01, F3-02 y F3-03) y un ciclo estrictamente **operativo y documental**: ejecuta una pasada manual transversal de la experiencia frontend Angular 20 (público + admin + landing + not-found) y deja evidencia escrita antes del build de entrega que coordinará Marcos en F3-05. El ciclo **NO introduce código nuevo, NO toca `apps/frontend-angular/` salvo ejecución de `npm run build` y `npm test` para evidencia, NO abre spec delta** (la capacidad ya existe; F3-04 es una verificación de release readiness). Los entregables son (1) un nuevo documento `docs/frontend/03-qa-manual-f3-04.md` con la checklist completa de QA manual (build, responsive 360/390/430/tablet/desktop, teclado y foco, contraste y legibilidad, estados carga/vacío/error/éxito, consola, datos sensibles), y (2) un patch mínimo a `docs/frontend/00-angular20-port-v0.md` con el resumen de QA, pendientes y blockers. La operación manual la hace Mati (clicks reales en navegador con DevTools); OpenCode documenta, ejecuta `npm run build` / `npm test` cuando aplique, y prepara los artefactos SDD (`proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md`).

## Quick path

1. Mati ejecuta manualmente la checklist en navegador (Chrome estable) con DevTools abiertos: responsive 360/390/430 px, tablet 768 px, desktop 1280 px; navegación por teclado (Tab, Shift+Tab, Enter, Escape); foco visible; estados carga/vacío/error/éxito; consola limpia; no exposición de DNI/tokens completos.
2. OpenCode corre `cd apps/frontend-angular && npm run build` y `npm test --watch=false --browsers=ChromeHeadless` desde la rama `frontend/v0-design-system` para documentar evidencia automática.
3. OpenCode produce `docs/frontend/03-qa-manual-f3-04.md` con 8 secciones (Resumen ejecutivo, Build, Responsive, Teclado y foco, Contraste y legibilidad, Estados, Consola del navegador, Datos sensibles, Pendientes y blockers) y un anexo con capturas.
4. OpenCode aplica patch mínimo a `docs/frontend/00-angular20-port-v0.md` con la sección "Estado F3-04 — QA manual completo" y el handoff a F3-05 (build para `/certificados/`).
5. Cierre SDD: `sdd-verify` valida la checklist, `sdd-archive` deja la rama lista para F3-05 (Marcos) o F3-06 (handoff).

## Estado actual (post merge de F4-01 y rama reseteada a `e399833`)

| Capa | Estado | Evidencia |
|---|---|---|
| Frontend Angular 20 | ✅ `apps/frontend-angular/` con Angular CLI 20.3.30 standalone, `baseHref: "/certificados/"` en prod y dev, presupuestos `500 kB warn / 1 MB error` por initial y `4 kB warn / 8 kB error` por `anyComponentStyle` (F4-01 ajustó `anyComponentStyle` a `8 kB warn / 16 kB error`) | `apps/frontend-angular/angular.json`, `apps/frontend-angular/AGENTS.md` (18 líneas) |
| Features | 4 features: `landing`, `not-found`, `public-validation`, `admin` (con sub-features `login`, `dashboard`, `courses`, `attendances`, `certifications`) | `apps/frontend-angular/src/app/features/` |
| Shared | `shared/certificates/` (DTO + mock + http source + result mapper + validation service) y `shared/ui/` (`BandaEstado`, `CampoDato`, `HeaderInstitucional`, `FolioShell` con tokens `--color-*`, `--font-*`, `--space-*`, `--focus-ring`, `--motion-fast`) | `apps/frontend-angular/src/app/shared/` |
| Sistema visual v0 | Tokens en `apps/frontend-angular/src/styles.css` con paleta semántica (`--color-ink`, `--color-valid`, `--color-destructive`, `--color-warning`, `--color-paper`, etc.), tipografía (`--font-sans`, `--font-mono`), `--focus-ring`, `--layout-folio-max: 42rem`, `@media (prefers-reduced-motion: reduce)` | `docs/frontend/02-sistema-visual-v0-f1-02.md` (118 líneas) |
| Build | `npm run build` verde en F2-04 (306.01 kB initial / 88.57 kB transfer), F2-05 (310.43 kB / 89.66 kB), F2-06 (313.84 kB / 90.36 kB), F4-01 verde con warning de budget CSS aceptado | `docs/frontend/00-angular20-port-v0.md` líneas 164, 193, 222, 253 |
| Tests | 420/420 verde post F4-01 (Karma + ChromeHeadless). Históricamente: M3-06 74/74, F2-04 239/239, F2-05 315/315, F2-06 394/394, F4-01 420/420 | `docs/frontend/00-angular20-port-v0.md` línea 253 |
| Specs vigentes | `guia-matias-angular-windows` (capacidad paraguas de Mati), `frontend-angular-shell` (parcial), `admin-certifications-frontend` (F2-06), `admin-certificate-consulta`, `admin-certificate-delivery`, `admin-certificate-revocation`, `backend-contrato-api-certificados`, `repo-seguro`. **No se agrega ni modifica spec base en F3-04.** | `openspec/specs/` |
| D0 contratos | DNI completo solo en validación pública; admin con `documentMasked XX****XX` y `tokenPrefix prefijo_demo_xxx`; QR/token permanente sin rotación; URL pública truncada a 60 chars; auth admin `X-Admin-Key` temporal | `docs/frontend/00-angular20-port-v0.md` líneas 86-90, 162, 220 |
| Rama de trabajo | `frontend/v0-design-system` reseteada a `origin/main` (HEAD `e399833`); origin/remote queda 76 commits atrás (estado stale del remote ref, no afecta el ciclo) | `git log --oneline -5`, `git status --short --branch` |
| Cambios activos | `openspec/changes/` solo tiene `archive/`; no hay F3-04 ni ningún change abierto | `Get-ChildItem openspec/changes` |

### Decisiones D0 que restringen F3-04

- **DNI completo solo en validación pública** (D0). La UI admin no debe mostrar DNI completo, ni tokens completos, ni emails, ni legajos, ni matrículas.
- **QR/token permanente**: el reenvío normal NO rota token. F3-04 no debe encontrar señales de rotación de token en la UI.
- **Auth admin con `X-Admin-Key`**: clave temporal; **no debe llegar al bundle Angular público**. F3-04 debe confirmar que 0 matches del literal en `apps/frontend-angular/src/`.
- **Material privado**: `material_privado_no_versionar/`, `.env*`, dumps, logs y secretos quedan fuera de cualquier revisión.
- **Paridad visual con `muestra_pagina/`**: la UI debe mantener paridad igual o mejor que la referencia v0; QA visual contra capturas de `muestra_pagina/capturas/` cuando estén disponibles.
- **No instalar dependencias sin aprobación**: F3-04 no agrega nada a `package.json` ni a `angular.json`.

## Áreas afectadas

| Archivo / spec | Rol en F3-04 |
|---|---|
| `docs/frontend/03-qa-manual-f3-04.md` | **CREAR** (~150-200 líneas). Reporte completo de QA manual con 8-9 secciones obligatorias y un anexo de capturas. |
| `docs/frontend/00-angular20-port-v0.md` | **MODIFICAR** con patch mínimo: agregar `## Estado F3-04 — QA manual completo` y enlace al nuevo reporte. Sin reescritura. |
| `apps/frontend-angular/AGENTS.md` | **Lectura obligatoria** (18 líneas) para confirmar convenciones antes del QA. No modificar. |
| `apps/frontend-angular/src/styles.css` | **Solo lectura** para confirmar tokens del sistema visual vigentes. No modificar. |
| `apps/frontend-angular/src/app/features/**` | **Solo lectura**; la checklist de QA itera sobre cada feature pero no modifica código. La ejecución de `npm run build` y `npm test` no es una "modificación". |
| `apps/frontend-angular/src/app/shared/ui/**` | **Solo lectura**; QA revisa el render de los primitivos (`BandaEstado`, `CampoDato`, `HeaderInstitucional`, `FolioShell`) en sus consumidores. |
| `docs/frontend/02-sistema-visual-v0-f1-02.md` | **Solo lectura**; el QA valida que los tokens documentados se aplican correctamente. |
| `openspec/changes/f3-04-qa-manual-completo/` | **CREAR** con los artefactos SDD del ciclo (`explore.md` este turno, `proposal.md`, `design.md`, `tasks.md`, `apply-progress.md`, `verify-report.md`, `archive-report.md`; **no** `specs/` porque no hay delta a la spec base). |
| `muestra_pagina/capturas/` | **Solo referencia visual** para comparar paridad; no se compila, no se abre JSX. No se modifica. |
| `muestra_pagina/components/validacion/`, `components/admin/` | **Solo lectura segura**; QA puede comparar contra las capturas del directorio padre. No se portan componentes. |
| `apps/backend-php/`, `database/`, `deploy/`, `docker/`, `.htaccess` | **Out of scope absoluto** (no se tocan en ningún ciclo Mati de Fase 3). |
| `material_privado_no_versionar/`, `.env*`, dumps, logs, secretos | **Out of scope absoluto**. |

## Enfoque de QA

### Opción A — F3-04 en `frontend/v0-design-system` con OpenCode documentando y Mati cliqueando (recomendada)

- **Descripción**: Mati abre `ng serve` localmente, navega con Chrome estable a `http://localhost:4200/certificados/`, recorre los flujos público (`/`, `/validar/:token`), admin (login, dashboard, cursos, asistencias, certificaciones, detalle) y shared (not-found, landing) en cada uno de los 5 anchos (360/390/430/tablet/desktop), valida teclado, foco, contraste, estados, consola y datos sensibles. OpenCode documenta el resultado en `docs/frontend/03-qa-manual-f3-04.md` con tabla de resultados por flujo × criterio.
- **Pros**:
  - Reutiliza la rama `frontend/v0-design-system` que Mati acaba de sincronizar; no hay cambio de rama ni reset adicional.
  - Crea el reporte en `docs/frontend/` siguiendo la convención `00-angular20-port-v0.md` / `01-auditoria-muestra-pagina-f1-01.md` / `02-sistema-visual-v0-f1-02.md`.
  - No introduce código de producto ni diff en `apps/frontend-angular/`; la única modificación viva es la documentación.
  - El patch a `00-angular20-port-v0.md` es de una sección y mantiene la fuente de verdad del port actualizada.
  - Mati conserva control total del juicio visual y de a11y; OpenCode solo estructura el reporte y captura evidencia automática (`npm run build`, `npm test`).
- **Contras**:
  - El reporte depende de la ejecución manual de Mati; OpenCode no puede "hacer la QA" por él. Si Mati no puede hacer la pasada en el ciclo, F3-04 queda parcial y se documenta como "QA bloqueada por falta de ejecución manual".
  - El reporte puede quedar largo si Mati quiere detalle exhaustivo por flujo × criterio; se recomienda tabla compacta con columnas `Flujo / Criterio / Resultado / Evidencia / Notas`.
- **Esfuerzo**: **Bajo-Medio** para OpenCode (estructura del reporte, ejecución de `npm run build` / `npm test`, patch al port doc). **Medio** para Mati (navegación manual exhaustiva en 5 anchos × 4 features × ~6 criterios).

### Opción B — F3-04 en una rama nueva `qa/frontend-release-readiness` (sugerida por la guía)

- **Descripción**: seguir literalmente la sugerencia de `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` línea 1189 y crear la rama `qa/frontend-release-readiness` desde `main` (o desde `frontend/v0-design-system`) para acumular QA + handoff F3-05/F3-06 en una rama dedicada.
- **Pros**:
  - Separa la rama de Mati (`frontend/v0-design-system`, con foco en sistema visual + admin) de la rama de release readiness.
  - Permite a F3-05 (build para `/certificados/`) y F3-06 (handoff a Marcos) sumarse a la misma rama sin contaminar `frontend/v0-design-system`.
- **Contras**:
  - Implica `git checkout -b qa/frontend-release-readiness` con árbol limpio, lo cual es un cambio de rama explícito.
  - Mati ya eligió continuar sobre `frontend/v0-design-system` en su última indicación; cambiar a la rama de la guía requiere su confirmación explícita.
  - Doble mantenimiento si Mati sigue mergeando admin/F4+ sobre `frontend/v0-design-system` mientras la QA queda en `qa/frontend-release-readiness`.
- **Esfuerzo**: **Bajo** (es solo el cambio de nombre de la rama; el contenido del ciclo es el mismo).

### Opción C — F3-04 + F3-05 + F3-06 como un solo ciclo encadenado

- **Descripción**: fusionar QA + build + handoff en un solo change folder y un solo PR.
- **Pros**:
  - Cierre administrativo único de Fase 3; un solo diff, un solo PR.
- **Contras**:
  - Mezcla concerns: QA manual (operativo), build de producción (Marcos), handoff a Marcos (reporte).
  - F3-05 tiene un prompt exacto propio (`MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1234-1277) y debe ejecutarlo Marcos o Mati con aprobación explícita.
  - F3-06 ya tiene rama propia y merge con Marcos como destinatario.
  - Difícil de revertir si F3-05 (build) tiene un blocker técnico no relacionado con QA.
- **Esfuerzo**: **Alto** en revisión; viola la regla "un ciclo SDD por vez" de `openspec/AGENTS.md`.

### Decisión recomendada: Opción A

Razones:
1. **Coherencia con la última decisión de Mati**: ya eligió `frontend/v0-design-system` tras sincronizar con `main`. Cambiar a `qa/frontend-release-readiness` requiere justificación nueva.
2. **F3-04 es operativo, no de capacidad**: la spec base ya cubre la regla de release readiness implícitamente; no se justifica un delta.
3. **Tamaño del diff acotado**: ~150-200 líneas del reporte + ~15-30 líneas del patch al port doc + ~150-200 líneas de artefactos SDD. Margen amplio contra el budget 400.
4. **Reversibilidad**: si Mati prefiere la rama `qa/frontend-release-readiness`, el `git mv` entre ramas es trivial y no afecta el contenido.
5. **Coherencia con F1-01 y F1-02**: ambos usaron `frontend/v0-design-system` para documentar, con patches al port doc durante `sdd-archive`. F3-04 sigue el mismo patrón.

## Criterios de aceptación hard

- **Sin código de producto**: `apps/frontend-angular/src/` no se modifica. El diff de F3-04 toca exclusivamente `docs/frontend/03-qa-manual-f3-04.md` (nuevo), `docs/frontend/00-angular20-port-v0.md` (patch) y `openspec/changes/f3-04-qa-manual-completo/` (artefactos SDD).
- **Reporte de QA completo**: 8 secciones obligatorias (Resumen ejecutivo, Build, Responsive, Teclado y foco, Contraste y legibilidad, Estados, Consola del navegador, Datos sensibles, Pendientes y blockers) con tabla de resultados por flujo × criterio.
- **Build verde o bloqueo verificable**: `npm run build` documentado con exit code, tamaño de bundles, warnings, errores. Si hay blocker, queda registrado con causa probable.
- **5 anchos revisados**: 360 px, 390 px, 430 px, tablet (768 px), desktop (1280 px) en al menos 3 navegadores declarados (Chrome estable, Edge estable, opcional Firefox o Safari iOS).
- **Navegación por teclado y foco visible**: Tab, Shift+Tab, Enter, Escape, foco visible con `outline` o ring sobre cada elemento interactivo.
- **Contraste y legibilidad**: ratio de contraste cumple WCAG AA (4.5:1 para texto normal, 3:1 para texto grande y elementos UI); tipografía legible a 16px mínimo, escala respetada, sin texto recortado ni overflow horizontal.
- **Estados carga/vacío/error/éxito revisados**: cada flujo tiene los 4 estados diferenciados y comunicados al usuario (no estados ambiguos). El primitivo `BandaEstado` es el dueño de la región live.
- **Consola del navegador sin errores nuevos**: 0 errores en consola para los flujos principales; warnings registrados pero no bloquean.
- **Datos sensibles no expuestos**: la UI pública muestra DNI completo (D0); la UI admin muestra `documentMasked` y `tokenPrefix`; logs, auditoría, errores y respuestas administrativas no exponen DNI completo. URLs públicas truncadas a 60 chars. 0 tokens completos en el bundle Angular público.
- **Documentación sincronizada**: `docs/frontend/00-angular20-port-v0.md` tiene la sección "Estado F3-04" con resumen, pendientes y blockers. `docs/00-indice-general.md` no se modifica (no agrega ruta documental nueva en este ciclo).
- **Sin auto-commit / auto-push**: `git add` + `git commit` + `git push` requieren aprobación explícita de Mati en el mismo turno + diff-confirmation gate + pre-push safety. OpenCode solo propone comandos.

## Decisión de rama (adelanto, se confirma en `sdd-propose`)

- **F3-04 va sobre `frontend/v0-design-system`** (Mati ya eligió esta rama tras sincronizar con `main`). Si Mati prefiere la rama sugerida por la guía `qa/frontend-release-readiness`, se renombra durante `sdd-propose` o al preparar el PR (un `git branch -m frontend/v0-design-system qa/frontend-release-readiness` con stash previo es suficiente).
- **Justificación portable**: la rama `frontend/v0-design-system` ya acumuló la F1-01, F1-02, y potencialmente F4-01 (si Mati lo decide) sobre `main`. Continuar QA sobre la misma rama evita fragmentar el release readiness en dos PRs separados.
- **Naming alternativo aceptado**: si Mati confirma `qa/frontend-release-readiness`, F3-04, F3-05 y F3-06 viven juntos; si Mati confirma `frontend/v0-design-system`, F3-05/F3-06 abren cambios separados (recomendado por el prompt exacto de F3-05: "rama `frontend/api-readiness` si lo toma Marcos; `qa/frontend-release-readiness` solo si Matías lo coordina como parte del cierre").

## Riesgos

- **Mati no puede hacer la pasada manual en el ciclo** — Probabilidad: Media. Mitigación: OpenCode estructura la checklist y deja celdas con resultado "pendiente de pasada manual" para que Mati complete durante su navegación; el `verify-report.md` declara el estado real al cierre. Si la pasada no se completa, F3-04 cierra con "QA parcial / blocker: ejecución manual pendiente" y F3-05 (build) puede arrancar igual contra el código actual.
- **`npm run build` puede tener warnings o errores no vistos en merges anteriores** — Probabilidad: Baja. Mitigación: OpenCode corre `npm run build` y `npm test --watch=false --browsers=ChromeHeadless` desde `apps/frontend-angular/`, captura exit code y warnings. Si hay error, F3-04 lo documenta como blocker y propone acción correctiva en `design.md` / `archive-report.md` (no lo corrige salvo aprobación explícita).
- **Modificar código de Marcos o de F4-01** — Probabilidad: Baja (regla clara). Mitigación: el `verify-report.md` exige `git diff --name-only` solo contra `docs/frontend/03-qa-manual-f3-04.md`, `docs/frontend/00-angular20-port-v0.md` y `openspec/changes/f3-04-qa-manual-completo/`. Cualquier otro path en el diff es blocker.
- **Console errors y a11y issues pueden aparecer** — Probabilidad: Media (es esperable en una pasada manual de release readiness). Mitigación: documentar como "pendientes" o "riesgos aceptados" con severidad y próximo paso sugerido; NO auto-corregir. F3-04 es documental, no correctivo.
- **Riesgo de paridad visual con `muestra_pagina/`** — Probabilidad: Media. Mitigación: la checklist de QA incluye una sección "Paridad visual vs `muestra_pagina/`" que compara la captura del flujo contra la captura homóloga de `muestra_pagina/capturas/` cuando esté disponible. Si no hay captura homóloga, se declara "sin referencia v0 explícita" y se documenta el hallazgo.
- **No spec delta a la spec base `guia-matias-angular-windows`** — Probabilidad: Ninguna (decisión deliberada). Mitigación: F3-04 es operativo, no de capacidad. La spec base ya cubre las reglas de release readiness indirectamente (paridad visual, sin tokens completos, sin DNI admin, sin clave admin en bundle, etc.). Si aparece un criterio nuevo portable (por ejemplo, "toda pantalla pública DEBE pasar QA manual antes del build de release"), se documenta como pendiente para un futuro ciclo que sí justifique delta.
- **Trampa de auto-commit / auto-push** — Probabilidad: Baja (regla clara). Mitigación: `AGENTS.md:21` y la sección Git de la guía unificada exigen aprobación explícita de Mati en el mismo turno + diff-confirmation gate (`git status --short` y `git diff --name-only` antes de `git add`; `git log` y `git diff --stat` antes de `git push`). OpenCode solo propone comandos. `git push` a `main`, `git merge`, `git rebase` y merge de PR siguen prohibidos.
- **Rama de trabajo `frontend/v0-design-system` con origin 76 commits atrás** — Probabilidad: Baja. Mitigación: `git status --short --branch` muestra `ahead 76`. El remote ref de `origin/frontend/v0-design-system` está stale; Mati decidió resetear local a `origin/main` (HEAD `e399833`). El `pre-push safety` debe comparar contra `main` (no contra `origin/frontend/v0-design-system`) si Mati decide pushear.
- **Riesgo de confundir F3-03 con F3-04** — Probabilidad: Baja. Mitigación: F3-03 agregó pruebas (35/35 ya verificadas y crecientes: F2-06 cerró 394/394, F4-01 cerró 420/420). F3-04 no agrega pruebas; solo verifica manualmente lo que ya existe. El reporte de F3-04 debe distinguir explícitamente "QA manual" de "tests automatizados" (los tests son evidencia de base, no cobertura de QA).
- **Naming de la rama** — Probabilidad: Media. Mitigación: la guía sugiere `qa/frontend-release-readiness`; Mati eligió `frontend/v0-design-system`. `sdd-propose` confirma el nombre final con Mati antes de crear artefactos que dependan de él.
- **Tech debt del `HeaderInstitucional` raíz en `/admin/*` (F2-03)** — Probabilidad: Media. Mitigación: F3-04 lo documenta como "pendiente" si se observa en la pasada; no lo corrige. Queda para un ciclo posterior.
- **Tech debt del budget `anyComponentStyle` ajustado en F4-01 (8 kB warn / 16 kB error)** — Probabilidad: Baja. Mitigación: el `verify-report.md` verifica que el build sigue verde sin nuevos warnings de budget. Si el ajuste se relajó demasiado, queda como observación pero no se re-balancea en F3-04.

## Revisión y carga de trabajo (forecast)

| Campo | Valor |
|---|---|
| Líneas estimadas modificadas/agregadas | ~250 (1 reporte QA ~150 + 1 patch port doc ~20 + 6 artefactos SDD restantes ~80 promedio + 1 explore.md ~120) |
| Riesgo de exceder el presupuesto de 400 líneas | **Low** (bien por debajo de 400) |
| PRs encadenados recomendados | **No** (single-pr) |
| Estrategia de entrega | single-pr sobre `frontend/v0-design-system` (o `qa/frontend-release-readiness` si Mati confirma) |
| Decisión antes de apply | **Sí** — `sdd-propose` debe confirmar: (a) nombre de la rama (`frontend/v0-design-system` vs `qa/frontend-release-readiness`), (b) nombre del archivo de QA (`03-qa-manual-f3-04.md` vs `qa-manual-f3-04.md`), (c) si la pasada manual la hace Mati antes de `sdd-apply` o durante, (d) si se incluye un anexo de capturas o solo tabla. |
| Tiempo estimado de revisión | Bajo: 1 PR con documentación nueva + 1 patch pequeño al port doc; sin código de producto, sin build nuevo, sin tests runtime modificados. |

## Estructura esperada del change folder

```
openspec/changes/f3-04-qa-manual-completo/
├── explore.md           (este archivo)
├── proposal.md          (sdd-propose)
├── design.md            (sdd-design)
├── tasks.md             (sdd-tasks)
├── apply-progress.md    (sdd-apply)
├── verify-report.md     (sdd-verify)
└── archive-report.md    (sdd-archive)
```

**No** se crea `specs/<capacidad>/spec.md` ni carpeta `specs/` porque F3-04 es operativo y no introduce ni modifica capacidad de la spec base.

## Decisiones a resolver en `sdd-propose`

1. **Nombre de la rama**: `frontend/v0-design-system` (recomendado, ya sincronizada) vs `qa/frontend-release-readiness` (sugerida por la guía). Recomendación: continuar sobre `frontend/v0-design-system`.
2. **Nombre del archivo de QA**: `docs/frontend/03-qa-manual-f3-04.md` (recomendado, sigue numeración de la carpeta) vs `docs/frontend/qa-manual-f3-04.md` (más limpio, sin numerar). Recomendación: la primera, mantiene el patrón `00-`/`01-`/`02-`/`F4-01-` de la carpeta.
3. **Cuándo se hace la pasada manual**: durante `sdd-apply` (OpenCode estructura, Mati navega) vs después de `sdd-apply` (Mati navega, OpenCode documenta retroactivamente). Recomendación: durante; el `apply-progress.md` refleja el avance flujo por flujo.
4. **Anexo de capturas**: sí (captura por flujo × ancho) vs no (solo tabla compacta). Recomendación: opcional. Si Mati quiere capturas, OpenCode las guarda en `openspec/changes/f3-04-qa-manual-completo/evidence/` (no en `docs/frontend/`) y el reporte enlaza a ellas.
5. **Patch al `00-angular20-port-v0.md`**: sección "Estado F3-04 — QA manual completo" (~15-30 líneas) con resumen, pendientes y handoff a F3-05. Recomendación: sí, mantener la fuente de verdad del port actualizada.

## Listo para propuesta

**Sí**, con las siguientes condiciones para el orquestador:

- Confirmar con Mati si la pasada manual la hace él en el mismo turno de `sdd-apply` o en un turno posterior.
- Confirmar el nombre de la rama (recomendado: continuar sobre `frontend/v0-design-system`).
- Mantener el alcance documental: 0 cambios a `apps/frontend-angular/` salvo ejecución de `npm run build` y `npm test` para evidencia.
- Mantener el patch a `docs/frontend/00-angular20-port-v0.md` durante `sdd-archive`, no antes.
- Declarar el handoff explícito a F3-05 (build para `/certificados/`, toma Marcos) y F3-06 (handoff a Marcos, Mati).
- Cerrar cualquier change abierto previo antes de abrir F3-04 (verificado: `openspec/changes/` solo tiene `archive/`, no hay change activo que colisione).
- No aprobar `git add` + `git commit` + `git push` hasta que `sdd-verify` sea PASS y Mati confirme en el mismo turno con diff-confirmation gate y pre-push safety.

## Checklist de exploración (auto-verificación)

- [x] Leído `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` líneas 1167-1233 (definición de F3-04 y criterios de aceptación).
- [x] Leído `apps/frontend-angular/AGENTS.md` (18 líneas, convenciones del frontend Angular).
- [x] Leído `docs/frontend/00-angular20-port-v0.md` (349 líneas, fuente de verdad del port con estado de F2-04, F2-05, F2-06, F4-01 y M3-06).
- [x] Leído `docs/frontend/01-auditoria-muestra-pagina-f1-01.md` (71 líneas, precedente de F1-01 con nota de actualización).
- [x] Leído `docs/frontend/02-sistema-visual-v0-f1-02.md` (118 líneas, tokens y primitivos).
- [x] Confirmada la estructura de `apps/frontend-angular/src/app/features/` (4 features: admin, landing, not-found, public-validation) y `shared/` (certificates + ui con 4 primitivos).
- [x] Confirmado que `openspec/changes/` solo tiene `archive/` (no hay F3-04 ni otro change activo).
- [x] Leído `openspec/changes/archive/2026-06-30-f1-01-auditar-muestra-pagina/explore.md` (131 líneas, precedente estructural de exploración).
- [x] Leído `openspec/changes/archive/2026-07-07-f1-02-v0-design-system/exploration.md` (279 líneas, precedente paralelo de Mati en `frontend/v0-design-system`).
- [x] Leído `openspec/changes/archive/2026-07-12-f4-01-certificate-detail/exploration.md` (185 líneas, precedente más reciente con estructura de explore y naming `exploration.md`).
- [x] Confirmado el estado de la rama: `frontend/v0-design-system` reseteada a `e399833` (mismo HEAD que `origin/main`).
- [x] Leído `openspec/config.yaml` (77 líneas, schema spec-driven, `strict_tdd: false`, `test_command: ""`).
- [x] Buscado Engram: 8 sesiones previas archivadas de ifts14, observación clave para F3-04 es el precedente de F1-01 (ciclo Mati documentation-only sin spec delta) y F1-02 (ciclo Mati con tokens aplicados). No hay observación previa de F3-04.
- [x] No se inspeccionó material privado, secretos, dumps, logs ni descargas del servidor.
- [x] No se editó código de producto; solo se creó `explore.md` en `openspec/changes/f3-04-qa-manual-completo/`.

## Próximo paso

`/sdd-propose` (vía orquestador) para abrir el change `f3-04-qa-manual-completo` con la confirmación de Mati sobre:
1. Nombre de la rama (recomendado: `frontend/v0-design-system`).
2. Nombre del archivo de QA (recomendado: `docs/frontend/03-qa-manual-f3-04.md`).
3. Cuándo se hace la pasada manual (recomendado: durante `sdd-apply`).
4. Si se incluye anexo de capturas (recomendado: opcional, decisión de Mati).
5. Si se aplica patch a `docs/frontend/00-angular20-port-v0.md` durante `sdd-archive` (recomendado: sí, sección "Estado F3-04").

Continuar con `sdd-design` (decisiones de estructura del reporte y validación), `sdd-tasks` (checklist ejecutable), `sdd-apply` (Mati hace la pasada, OpenCode documenta), `sdd-verify` (validación contra los 9 criterios de aceptación de la guía) y `sdd-archive` (patch al port doc + handoff a F3-05/F3-06).
