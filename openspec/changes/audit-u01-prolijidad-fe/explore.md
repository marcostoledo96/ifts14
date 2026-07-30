# Exploration: audit-u01-prolijidad-fe

**Cambio**: `audit-u01-prolijidad-fe`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/u01-prolijidad-fe`
**Alcance de fase**: Barrido transversal FE (prolijidad) sin rediseñar UX
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U1; hard locks PLAN (D0; leave P23 archive alone; no rewrite honesty P15–P23 salvo dead code; front-only quirúrgico; diff chico)

## Exploration: Prolijidad FE transversal (U1)

### Current State

Angular 20 standalone bajo `apps/frontend-angular/`:

- **Routing canónico** (`app.routes.ts`): `''` → `/admin/login`; `validar/:token`; árbol admin + catch-all admin; `**` → `NotFoundPage`. **No** hay ruta a `LandingPage`.
- **Change detection**: **32/32** `@Component` usan `ChangeDetectionStrategy.OnPush` (scan completo). Signals ya son el patrón dominante en pages admin.
- **tsc**: limpio (`npx tsc --noEmit -p tsconfig.app.json`).
- **Ponytails**: ~33 comentarios `// ponytail:` — casi todos documentan constraints vivos (DI tokens mock↔HTTP, loadGen anti-stale, gaps de backend, clipboard `execCommand`). No son TODOs “ya resueltos” de forma masiva.
- **Duplicación real**:
  - `paginasVisibles` **byte-idéntico** en 4 listados (students / courses / certifications / attendances).
  - Formatters `YYYY-MM-DD → dd/mm/yyyy es-AR` casi iguales en delivery (`formatearFecha`), public (`formatearFechaFolio`), new (`formatearFechaCorta`), list (`formatEmision`).
  - `clipboardFallback` triplicado (delivery ≡ preview; date-certificates variante menor).
  - `mensajeErrorApi` privado copiado en varias pages (variantes de honesty distintas).

| Checklist U1 | Estado hoy | Evidencia |
|---|---|---|
| Dead code / imports unused | **Gaps claros** | `LandingPage` + `FolioShell` huérfanos; alias `guardar()` sin callers |
| Comentarios ponytail obsoletos | **Mayormente vivos** | 33 comentarios; no purgar en masa |
| Duplicación formatters/paginadores | **Parcial** | pager window idéntico×4; fechas dd/mm×4; extract solo si reduce riesgo |
| Specs rotos / mocks irrelevantes | **Parcial** | specs de Landing/FolioShell testean código sin ruta/uso; `formatearFechaAsistida` identity + no-secrets |
| OnPush / signals | **OK** | 32/32 OnPush; no trabajo obligatorio |

### Top gaps (con evidencia)

1. **`LandingPage` muerto (ruta + producto)**
   - `apps/frontend-angular/src/app/features/landing/landing-page.ts` (+ `.spec.ts`)
   - Evidencia: `app.routes.ts` redirige `''` → `/admin/login`; grep de `LandingPage`/`landing-page` solo en el feature y su spec. Specs de rutas ya aserten redirect a login (`app.routes.spec.ts`).
   - Specs asociados testean scaffold histórico, no el contrato actual.

2. **`FolioShell` muerto (shared UI sin consumidores)**
   - `apps/frontend-angular/src/app/shared/ui/folio-shell.ts` (+ `.html`/`.css`/`.spec.ts`)
   - Evidencia: cero usos de `FolioShell` / `app-folio-shell` fuera de sí mismo; folio público vive inline en `public-validation-page.*`.

3. **Alias muerto `AttendanceMarkingPage.guardar()`**
   - `…/marking/attendance-marking-page.ts` (~L301–304): `/** Alias de compatibilidad… */ async guardar() { return this.guardarYGenerar(); }`
   - Evidencia: HTML y specs llaman solo `guardarYGenerar()`; ningún `.guardar()` en specs de marking.

4. **`paginasVisibles` duplicado idéntico×4 (candidato a extract de bajo riesgo)**
   - `students-list-page.ts`, `courses-list-page.ts`, `certifications-list-page.ts`, `attendances-list-page.ts`
   - Evidencia: mismo cuerpo (ventana ≤5 / elipsis). Extract de función pura `paginasVisiblesWindow(total, actual)` reduce drift sin tocar UX/HTML.

5. **Formatters dd/mm/yyyy duplicados (extract condicional / prefer defer parcial)**
   - delivery `formatearFecha`, public `formatearFechaFolio`, new `formatearFechaCorta`, list `formatEmision`
   - Unificar **incluyendo** public toca P22 archive / honesty dates → **riesgo de scope**. Prefer: (a) defer total, o (b) shared solo admin si hace falta; no reabrir validación pública salvo dead code.

6. **`formatearFechaAsistida` identity stub + spec narrativa**
   - `certification-pdf-preview-page.ts` L140–142: `return fecha;` usado en template; spec espera ISO crudo; `no-secrets.spec.ts` inspecciona el body del método.
   - No es bug visual; limpiar a binding directo **sin** cambiar a es-AR (eso sería copy/UX → U3 / fuera de U1). O defer.

7. **OnPush** — **sin gap**. Documentar como ya cumplido; no “arreglar” lo sano.

### Locked defaults (desde PLAN + prompt)

- Transversal FE cleanup **sin** rediseñar UX.
- Diff **chico y revisable**; listar deferidos.
- **NO** copy/UI salvo rename interno requerido.
- Hard locks: **D0**; leave **P23 archive** alone; no rewrite honesty **P15–P23** unless dead code; prefer surgical front-only.
- No commit en este explore.

### Affected Areas

- `apps/frontend-angular/src/app/features/landing/*` — delete dead scaffold + specs.
- `apps/frontend-angular/src/app/shared/ui/folio-shell.*` — delete dead shell + specs.
- `…/attendances/pages/marking/attendance-marking-page.ts` — remove `guardar()` alias.
- Opcional: `apps/frontend-angular/src/app/shared/…` helper `paginasVisiblesWindow` + 4 list pages (solo TS; HTML igual).
- `openspec/specs/frontend-angular-shell/spec.md` — **primary delta** ADDED (higiene / sin scaffolds huérfanos / OnPush invariant).
- `docs/qa/PLAN-…` §U1 — checkboxes en apply/archive (no en explore).
- **No tocar**: archives P15–P23; `public-validation-page` (salvo dead code demostrado); backend; token/QR (D0); copy visible.

### Approaches

1. **Surgical dead-code + optional pager helper (recomendada)** — Borrar Landing + FolioShell + alias `guardar()`; opcional extract `paginasVisiblesWindow`; ADDED liviano en `frontend-angular-shell`; defer formatters/clipboard/`mensajeErrorApi`/ponytails/honesty.
   - Pros: cierra U1 con evidencia; diff mínimo; cero UX; OnPush ya OK.
   - Cons: deja duplicación de fechas/clipboard documentada como defer.
   - Effort: **Low**

2. **Mega-extract helpers (fechas + clipboard + pager + errores)** — Shared utils transversales.
   - Pros: menos drift futuro.
   - Cons: toca P18–P22 surfaces; riesgo >400 líneas; viola “diff chico” y locks de no reabrir honesty.
   - Effort: **High** — **no** para U1

3. **Docs-only / verify sin código** — Solo PLAN + nota.
   - Pros: cero riesgo de regresión.
   - Cons: deja dead code real (Landing/FolioShell); checklist U1 incompleto.
   - Effort: Low (**incompleto** vs gaps encontrados)

### Spec target

**ADDED** en `frontend-angular-shell` (preferido) — requisitos mínimos de higiene:

- Rutas/producto: no scaffolds de página sin `loadComponent`/ruta canónica (cubre Landing).
- Shared UI: no componentes shared sin consumidores de producto (cubre FolioShell) — o phrasing más suave “código muerto no debe permanecer versionado sin consumidor”.
- Invariante OnPush en components de app (ya true; contrato liviano).
- Opcional: helper de ventana de paginación compartido si se extrae.

**No** crear capability nueva salvo que el delta shell se sienta forzado; `ui-cleanup` es producto histórico (TipoEnvio/firma digital), **no** higiene de código. `frontend-ci-quality-gates` es CI, no dead-code.

**Docs-only** solo si se rechaza borrar dead code — **no** recomendado tras el scan.

### Recommendation

Aplicar **Approach 1**: delete dead (Landing, FolioShell, `guardar` alias) ± extract puro de `paginasVisibles`; ADDED shell; **DEFER** el resto. Listo para `sdd-propose`.

### DEFER (explícito)

| Ítem | Por qué defer |
|---|---|
| Unificar formatters dd/mm en public+admin | Toca P22 / validación pública; riesgo > beneficio U1 |
| Extract `clipboardFallback` ×3 | Toca delivery/preview/date-certs; diff mediano sin bug |
| Unificar `mensajeErrorApi` | Variantes honesty distintas; marking aún puede filtrar `Error.message` — honesty P15 lock |
| Purgar ~33 `ponytail:` | Casi todos documentan constraints vivos |
| Cambiar `formatearFechaAsistida` a es-AR | Sería cambio de presentación → U3/copy |
| Rewrite honesty P15–P23 | Hard lock |
| Performance / lazy / bundles | U2 |
| Copy/glosario global | U3 |
| P23 archive / NotFound rewrite | Hard lock |
| Backend / D0 token-QR | Fuera de alcance |

### Risks

- Borrar `FolioShell` si Matías planeaba reusarlo pronto — mitigar: nota en proposal + easy restore desde git.
- Extract de pager mal tipado rompe 4 listados — mitigar: función pura + specs existentes de paginación.
- Scope creep hacia “cleanup general” → superar presupuesto ~400 líneas.

### Ready for Proposal

**Yes** — orchestrator: proceder a `sdd-propose` con Approach 1, locked defaults arriba, spec target `frontend-angular-shell` ADDED, y lista DEFER intacta.
