# Exploración: audit-u05-estados-error

**Cambio:** `audit-u05-estados-error`
**Rama:** `audit/u05-estados-error` @ `7b7d3db` (staging1.0 post-merge PR #112; U4 archivado)
**Plan:** `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U5
**Locks:** D0 · sin rediseño business/API · sin design system nuevo · alinear a patrones P9–P23 (`errorRecuperable`, `mensajeErrorApi`, Reintentar gated, honesty) · no tocar archive U4 · sin commit

---

## Exploration: Estados loading / empty / error (U5)

### Current State

La base de estados ya existe desde P9–P23 y no requiere reinventar UI:

- **Listados admin (cursos / alumnos / certificaciones / asistencias):** patrón `estado-panel` con skeleton (`cargando`), `estado-error` + **Reintentar**, `empty-total` con CTA, `no-results` / filtro vacío con «Limpiar…». Mensajes de carga fijos tipo «No se pudo cargar el listado… Reintentá.» (honesty; sin raw HTTP).
- **QA vista forzada:** cursos, alumnos y certificaciones usan `InjectionToken` (`*_QA_ENABLED`) con factory `isDevMode`; barra `@if (qaEnabled)` y `VistaQa = datos|cargando|error|vacio-total`. Asistencias **no** tiene harness QA (aceptable; no es regresión). Docs FE afirman ausencia en prod/staging.
- **Detalle / flujos críticos:** `errorRecuperable` load-only + Reintentar gated en preview, delivery, revoke, PDF, course-detail, student-detail/editor, attendances marking/course-dates/date-certificates, certification-new (catálogos/par). Acciones/not-found **sin** Reintentar.
- **`mensajeErrorApi`:** helpers **locales** por página (no util compartido). Envelope API + genérico; sin URL/raw. Alineación profunda de códigos backend → **U6**.
- **Interceptor 401 (`csrf.interceptor.ts`):** ante 401 (excepto login) → `clearSession()` + `navigateByUrl('/admin/login')` con latch anti-doble-redirect + `NEVER` (no propaga error a la página). Spec unitario presente. Comentario en logout: timeout porque NEVER puede colgar `firstValueFrom`.
- **U4:** cerrado/archivado; a11y no reabrir. Este explore no toca `openspec/changes/archive/2026-07-30-audit-u04-a11y-responsive/`.

### Affected Areas

| Área | Archivos / specs | Por qué |
|------|------------------|---------|
| Listados | `courses-list-page.*`, `students-list-page.*`, `certifications-list-page.*`, `attendances-list-page.*` | Micro-inconsistencias CTA/botón Reintentar/empty |
| Outlier carga | `course-editor-page.*` | Error de carga recuperable **sin** Reintentar |
| Config / hub | `institutional-config-page.*`, `admin-dashboard-page.*` | Reintentar presente; smoke de paridad, no rediseño |
| Auth FE | `csrf.interceptor.ts` (+ spec) | Regresión 401 redirect limpio |
| QA harness | tokens `*_QA_ENABLED` + templates listados | Solo `isDevMode`; verificar staging |
| Specs | `frontend-angular-shell` (ADDED lean) | Contratos de patrón estados |
| Fuera | archive U4, backend mensajes, smokes staging | DEFER U6/U9 |

### Inventory — gaps rankeados

| # | Gap | Severidad | Fix quirúrgico | DEFER |
|---|-----|-----------|----------------|-------|
| 1 | Listados: Reintentar `btn-secondary` (cursos) vs `btn-primary` (alumnos/certs/asistencias); empty certs usa `cta-nueva` vs `btn-primary` | Media | Alinear clases al patrón mayoritario existente (`btn-primary` + empty CTA con `btn-primary`/`routerLink` útil) | No inventar componente EmptyState |
| 2 | `course-editor`: fallo recuperable de `obtener` muestra mensaje pero **sin** Reintentar (detalle curso sí tiene `errorRecuperable`) | Media | Gated Reintentar load-only + not-found sin retry (paridad student-editor / course-detail) | — |
| 3 | QA vista forzada: depende solo de `isDevMode`; `environment*` no tiene flag `production`; `angular.json` production/staging no declara `optimization` explícito | Media | Verificar build staging (`isDevMode===false`); tests con token `false` ocultan barra; si falla → gate explícito o `optimization: true` | Smoke visual U9 |
| 4 | Interceptor 401: implementación + tests OK; riesgo de regresión si alguien propaga error o muestra panel error+Reintentar en 401 | Baja–Media | Mantener NEVER+latch; no cambiar contrato salvo bug; incluir escenario en shell spec | Smokes sesión U9 / TTL U6–U7 |
| 5 | Copy títulos error entre listados («archivo» / «registro» / «cursos») | Baja | Solo si hay inconsistencia **estructural**; no reabrir glosario U3 | U3 cerrado |
| 6 | Asistencias list sin harness QA | Baja | Ninguno (o paridad opcional) | Opcional |
| 7 | Unificar `mensajeErrorApi` en util compartido | — | **No** en U5 (blast radius alto) | U6 / deuda FE |
| 8 | Mensajes backend 400/409 alineados UI | — | **No tocar** | **U6** |
| 9 | Smokes staging reales de estados | — | **No tocar** | **U9** |
| 10 | Design system / EmptyState component library | — | **Prohibido** | — |

### Approaches

1. **Alineación quirúrgica a patrones P9–P23 (recomendado)** — Pass corto: (A) listados micro-CSS/HTML CTA+Reintentar, (B) course-editor Reintentar gated, (C) verificar/reforzar QA solo-dev + tests token false, (D) regresión interceptor 401 (tests existentes + escenario spec). Spec lean **ADDED** en `frontend-angular-shell`.
   - Pros: cierra checklist U5; bajo riesgo visual; no toca API/D0/U4.
   - Cons: no unifica helpers ni copy de dominio.
   - Effort: Low

2. **Extracción de componente/util compartido de estados** — `UiEstadoPanel` + `mensajeErrorApi` shared + harness QA único.
   - Pros: DRY futuro.
   - Cons: design system de facto; >400 líneas; viola hard lock.
   - Effort: High

3. **Solo documentar + defer U9** — Sin código.
   - Pros: cero regresión.
   - Cons: no cierra PLAN §U5.
   - Effort: Low (no cumple objetivo)

### Recommendation

**Approach 1.** Orden de trabajo:

1. Inventario cerrado → alinear listados al patrón ya dominante (panel + Reintentar primary + empty con CTA navegable).
2. Outlier `course-editor`: `errorRecuperable` load-only (o equivalente) + Reintentar; not-found sin retry.
3. QA: confirmar `isDevMode` false en `production-staging`; tests que con token false no rendericen barra; reforzar solo si verificación falla.
4. 401: no reescribir interceptor; preservar NEVER + latch + exclusión login; spec ADDED de contrato.

Specs lean: **ADDED** en `frontend-angular-shell` (p. ej. SHELL-STATE-01 listados loading/error/empty; SHELL-STATE-02 Reintentar gated en carga recuperable; SHELL-STATE-03 QA solo no-prod; SHELL-STATE-04 interceptor 401 redirect limpio). Evitar abrir specs de cada feature salvo escenario mínimo si un outlier no cabe en shell.

### Risks

- Scope creep a util compartido / EmptyState component.
- Reabrir copy U3 o a11y U4.
- Cambiar clases de botón percibido como «rediseño» si se tocan demasiadas hojas.
- Reforzar QA gate mal y romper harness local `ng serve`.
- Tocar interceptor y romper login 401 (mensaje de credenciales) o logout colgado.
- Presupuesto ~400 líneas: Approach 1 debe caber en un PR; si crece → encadenar listados vs editor/QA.

### Ready for Proposal

**Sí.** Alcance claro, gaps priorizados, DEFER explícitos (U6 mensajes backend, U9 smokes, util compartido, archive U4). Siguiente: `sdd-propose` con Approach 1 locked y targets de spec lean.

---

## Spec targets (propuestos para propose/spec)

| Spec | Delta | Contenido tentativo |
|------|-------|---------------------|
| `frontend-angular-shell` | **ADDED** (principal) | Listados críticos: loading / error+Reintentar / empty con CTA útil / no-results; detalle: Reintentar solo si recuperable; QA forced views solo fuera de prod; 401 → login sin panel error espurio |
| Specs por feature (certs/courses/…) | Evitar | Solo si un outlier no se expresa en shell |
| Backend / public-validation | No | U6 / fuera de U5 |

**Fuera:** U6 envelope/mensajes · U9 smokes · archive U4 · API/business · design system nuevo · unificar `mensajeErrorApi` global

## DEFER (locked)

- U6: códigos/mensajes backend alineados a UI; envelope; TTL sesión
- U9: smokes staging de estados / sesión / QA visual
- Extracción util/componente compartido de estados
- Harness QA en asistencias (paridad opcional)
- Copy glosario (U3 cerrado)
- Archive U4 intacto
- Backend / D0 / rotación token-QR
