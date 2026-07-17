# Verify — frontend-dashboard (Ciclo 3: Dashboard)

**Fecha:** 2026-07-16
**Change:** `sdd/frontend-dashboard/`
**cwd:** `apps/frontend-angular/`
**Modo artefactos:** proposal + spec + design + tasks + apply-progress (verificación completa)
**Veredicto:** **PASS WITH WARNINGS**

---

## 1. Gates técnicos obligatorios

| # | Comando | Exit code | Resultado |
|---|---------|-----------|-----------|
| 1 | `npm run test:ci` | **0** | Verde — `685 SUCCESS`, 0 fallas |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | `TypeScript: No errors found` |
| 3 | `npm run build` | **0** | `Application bundle generation complete` |

### Detalle gate 1 (`test:ci`)

`test:ci` = `no-focused-tests.test.mjs` + `no-focused-tests.mjs` + `ng test --watch=false --browsers=ChromeHeadless`.

- Precheck `no-focused-tests.test.mjs`: exit `0` (1 test pass).
- Precheck `no-focused-tests.mjs`: `no-focused-tests: ok` (exit `0`).
- Suite Karma/Jasmine: `TOTAL: 685 SUCCESS`, 0 fallas.

**Nota de entorno (mismo workaround que Ciclo 2):** el runner corre como `root` (uid 0); `ChromeHeadless` requiere `--no-sandbox`. Se ejecutó con wrapper `CHROME_BIN`:

```bash
WRAPPER_DIR="apps/frontend-angular/.verify-tmp"
# chrome-wrapper.sh → google-chrome --no-sandbox --headless=new --disable-gpu --user-data-dir=$WRAPPER_DIR/chrome-home
export CHROME_BIN="$WRAPPER_DIR/chrome-wrapper.sh"
export HOME="$WRAPPER_DIR/chrome-home"
npm run test:ci
```

Karma reportó `685 SUCCESS` (exit 0). Los mensajes `dbus`/`dconf`/`OOM score` son ruido del entorno root/headless, no fallas de specs.

### Detalle gate 3 (`build`)

Build OK. Warnings de presupuesto CSS **preexistentes** en páginas ajenas a este ciclo (`certification-revoke-page.css`, `student-detail-page.css`, `certification-preview-page.css`, `certification-pdf-preview-page.css`). `admin-dashboard-page` lazy chunk generado (`chunk-GDKYHMQ4.js`, 13.61 kB raw). No introducido por este ciclo.

---

## 2. Completitud de tareas

| Fase | Tareas | Estado |
|------|--------|--------|
| Phase 1 — RED | 1.1, 1.2 | ✅ `[x]` |
| Phase 2 — GREEN | 2.1, 2.2, 2.3, 2.4 | ✅ `[x]` |
| Phase 3 — Cierre | 3.1, 3.2 | ✅ `[x]` |

**10/10 tareas completadas.** Sin tareas pendientes que bloqueen archive.

---

## 3. Spec coverage (REQ-DASH-01…06 + foundation delta)

| REQ | Escenario | Evidencia (código + test) | Estado |
|-----|-----------|---------------------------|--------|
| **REQ-DASH-01** | Encabezado visible | `admin-dashboard-page.html` `#dash-title` “Panel de certificaciones”, intro con QR; sin `.cards`; test “muestra el encabezado de mesa de trabajo y no las 4 cards placeholder” | **COMPLIANT** |
| **REQ-DASH-02** | Nueva certificación primaria | `routerLink` `/admin/certificaciones/nueva`, clase `accion--primary`; test assert href + `accion--primary` | **COMPLIANT** |
| **REQ-DASH-02** | Nuevo curso | `routerLink` `/admin/cursos/nuevo`; test assert href | **COMPLIANT** |
| **REQ-DASH-02** | Alumnos | `routerLink` `/admin/alumnos`; test assert href | **COMPLIANT** |
| **REQ-DASH-02** | Configuración | `routerLink` `/admin/configuracion`; test assert href | **COMPLIANT** |
| **REQ-DASH-02** | Carga masiva deshabilitada | `button` `disabled`, `aria-disabled="true"`, `title` + `sr-only`; test assert disabled + title | **COMPLIANT** |
| **REQ-DASH-03** | Hidratación exitosa | `cargarMetricas()` → `Promise.allSettled` sobre `listar`/`contar`; filtros `vigente\|vencido` / `revocado`; tests “hidrata el resumen…” y “acepta fakes tipados…” | **COMPLIANT** |
| **REQ-DASH-03** | Fallo parcial o total | Código: por-seam `null` + `errorMetricas`; test “si los seams rechazan…” (fallo total) | **PARTIAL** — fallo parcial no tiene test dedicado |
| **REQ-DASH-04** | Placeholders sin fingir datos | `DASHBOARD_PENDIENTES`, badges “—”, meta “Sin totales”; test bandeja honesta | **COMPLIANT** |
| **REQ-DASH-05** | Sin eventos inventados | empty state `role="status"`; sin link “Ver registro completo”; test sin PII seed | **COMPLIANT** |
| **REQ-DASH-06** | Landmarks y foco | Template: `aria-labelledby` en Acciones/Pendientes/Actividad, `aria-label` en Resumen; carga masiva con `sr-only` | **PARTIAL** — atributos en template, sin assert automatizado |
| **REQ-DASH-06** | OnPush y signals | `ChangeDetectionStrategy.OnPush`, signals `cursosCargados` etc.; tests “usa OnPush” + hidratación | **COMPLIANT** |
| **foundation** | Sin placeholder 4 cards | Mismo test encabezado; `openspec/specs/admin-foundation/spec.md` delta aplicado | **COMPLIANT** |

### Anti-patrones verificados

| Criterio | Evidencia | Estado |
|----------|-----------|--------|
| Sin 4 cards placeholder | `.cards` ausente; copy “Vista placeholder…” ausente | ✅ |
| Sin endpoints inventados | Solo `COURSES_SOURCE`, `STUDENTS_SOURCE`, `CERTIFICATIONS_SOURCE`; sin `HttpClient` en página | ✅ |
| 5 acciones + Carga masiva disabled | 4× `routerLink` + 1× `button[disabled]` | ✅ |
| Métricas derivadas / “—” en error | `formatoMetrica(null)` → “—”; `.metricas-error` con `role="status"` | ✅ |
| Bandeja/actividad honestos | Badges “—”, “Sin totales”, empty actividad | ✅ |

**Cobertura:** 11/13 escenarios **COMPLIANT**, 2/13 **PARTIAL** (sin falla de gates ni de requisitos core).

---

## 4. Coherencia con design

| Decisión de diseño | Implementación | Estado |
|--------------------|----------------|--------|
| Composición in-place en `AdminDashboardPage` | Sin subcomponentes extra; todo en ts/html/css | ✅ |
| `Promise.allSettled` + signals nullables | `cargarMetricas()` L66–112 | ✅ |
| Sin N+1 / sin `ATTENDANCE_SOURCE` | No inyectado ni llamado | ✅ |
| `optional: true` en seams | `inject(..., { optional: true })` | ✅ |
| Acciones según tabla de rutas | Coincide con design/proposal del ciclo | ✅ |
| Placeholders bandeja/actividad | `DASHBOARD_PENDIENTES` + empty state | ✅ |
| CSS tokens locales, sin Tailwind | `admin-dashboard-page.css` | ✅ |
| Ruta título actualizado | `app.routes.ts` “Panel de certificaciones” | ✅ |

Sin desviaciones que rompan spec.

---

## 5. Issues

### CRITICAL

_Ninguno._

### WARNING

- **W1 — REQ-DASH-03 fallo parcial:** el código maneja rechazos por seam (`Promise.allSettled` individual), pero solo hay test de fallo total. Recomendación: agregar test con un seam rechazando y otro resolviendo.
- **W2 — REQ-DASH-06 landmarks:** `aria-labelledby` / `aria-label` presentes en template pero sin assert en `admin-dashboard-page.spec.ts`. Recomendación: test DOM de landmarks en archive o ciclo de a11y.
- **W3 — Entorno de tests:** mismo workaround `CHROME_BIN` + `--no-sandbox` que Ciclo 2 bajo root. Considerar `ChromeHeadlessNoSandbox` en Karma/CI para contenedores.

### SUGGESTION

- **S1 — Paridad visual:** `apply-progress.md` marca revisión rápida vs `muestra_pagina/capturas/admin-*.png` como pendiente de verify manual; no bloquea archive técnico.
- **S2 — Limpiar `.verify-tmp/`** tras verify (artefacto local del wrapper Chrome).

---

## 6. Veredicto final

| Dimensión | Resultado |
|-----------|-----------|
| Gates técnicos | ✅ 3/3 verdes |
| Tareas | ✅ 10/10 |
| Spec compliance | ✅ 11 COMPLIANT, 2 PARTIAL (no bloqueantes) |
| Design coherence | ✅ |
| **Veredicto** | **PASS WITH WARNINGS** |

**Siguiente fase recomendada:** `sdd-archive`
