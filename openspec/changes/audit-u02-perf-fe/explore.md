# Exploration: audit-u02-perf-fe

**Cambio**: `audit-u02-perf-fe`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/u02-perf-fe`
**Alcance de fase**: Performance / carga FE — mejoras de bajo riesgo (dedupe fetch, lazy deps pesadas, menos trabajo sync); sin rediseño de modelo API
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §U2 (L1021–1041); hard locks PLAN (D0; leave U1 archive alone; no UX redesign; no honesty rewrite; prefer front-only surgical; small reviewable diff)

## Exploration: Carga / performance FE (U2)

### Current State

Angular 20 standalone bajo `apps/frontend-angular/`:

- **Routing**: 100% `loadComponent` en `app.routes.ts` (pública, login, shell admin + children, NotFound). No hay `loadChildren` de NgModules; el code-split es por página.
- **Deps pesadas PDF**: `html2canvas-pro` + `jspdf` import estático en `certification-pdf-preview-page.ts` L16–17 → van al **chunk lazy de `/admin/certificaciones/:id/pdf`**, no al initial (mientras nadie entre a PDF). `angular.json` las lista en `allowedCommonJsDependencies`. Budgets initial: warn 500kB / error 1MB. **Sin dist versionado** en este checkout → no hay tamaños de chunk medidos aquí; el estado “lazy routes OK” se infiere del grafo de imports + `loadComponent`.
- **Hub asistencias**: un solo endpoint `GET /admin/hub/asistencias` (`HttpAttendanceService.listarHub`). Payload = `cursos` + `fechas` + **todas** las `asistencias` + `alumnosActivos`. El hub listado y la intermedia de fechas **vuelven a pedir el hub completo** al navegar. Ya existe coalescing en `asistenciasPorCurso` / `alumnosActivosCache` / `fechasPorCurso`, pero **`listarHub` no coalescea**.
- **Listados**: alumnos / cursos / certificaciones / hub asistencias traen **todo** por HTTP y filtran + paginan en cliente (`PAGE_SIZE` / `PAGINA_TAMANO` / `ATTENDANCES_PAGE_SIZE` = **20**). Backend ya acepta algunos query filters en certs (`estado`, `cursoId`, `alumnoId`); el texto `q` sigue client-side.
- **Firmas**: `previewFirma` = `GET …/firmas/{role}` blob, **sin cache FE**. Backend API usa `Cache-Control: no-store` global (`Response.php`); test de firmas exige `no-store` en preview. “Cacheable” en U2 = **cache de sesión en memoria FE**, no CDN/browser HTTP.
- **Double-fetch**: ver tabla abajo. Patrón de mitigación ya existe (Maps de `Promise` en HTTP services).

| Checklist U2 | Estado hoy | Evidencia |
|---|---|---|
| Lazy routes OK (loadComponent; heavy html2canvas/jspdf) | **OK parcial** | Todas las rutas usan `loadComponent`. Pesados viven en chunk PDF vía import estático; **no** deferred hasta click de descarga |
| Hub asistencias payload / client processing | **Gap** | Payload full-asistencias; list + course-dates reprocesan; sin coalesce de `listarHub` |
| Listados client-filter scale | **Documentar** | Full fetch + filter client; page size 20; sin paginación server |
| Firmas/logos cacheable | **Gap FE** | Sin cache de blob/`obtener` entre preview/PDF/config; HTTP `no-store` intencional |
| Evitar double-fetch al navegar | **Gap claro** | Hub list→fechas; config+firmas preview↔PDF; `contar` certs = full list |

### Top gaps (con evidencia)

1. **`html2canvas-pro` + `jspdf` static import en chunk PDF (lazy de ruta OK; lazy de uso no)**
   - `…/pdf/certification-pdf-preview-page.ts` L16–17: `import html2canvas from 'html2canvas-pro'`; `import { jsPDF } from 'jspdf'`.
   - Uso real solo en `exportarFolioVisibleComoPdf()` / `descargarPdf()` (L384+).
   - Fix de bajo riesgo: `await import('html2canvas-pro')` + `await import('jspdf')` **dentro** de la descarga → el chunk pesado no se descarga al solo abrir el folio.
   - `qrcode` en `certifications/qr-png.ts` es estático; entra donde se importe ese helper (preview/PDF). Defer opcional / menor.

2. **Double-fetch `listarHub` al navegar hub → fechas de curso**
   - Callers producto (no specs): `attendances-list-page.ts` L94; `attendance-course-dates-page.ts` L137.
   - `HttpAttendanceService.listarHub` L126–160: GET fresco cada vez; rellena `asistenciasPorCurso` pero **no** cachea el Promise del hub.
   - Course-dates filtra `hub.asistencias` por `cursoId` en cliente (L151–157) tras haber bajado **todas** las asistencias.
   - Fix: coalescing `hubPending` / TTL corto (mismo patrón que `fechasPorCurso` L141–150), invalidate en `marcar`/`anular`.

3. **Procesamiento sync del hub en main thread (escala con N asistencias)**
   - List: loops sobre `hub.fechas` + `hub.asistencias` + map/sort de cursos (`attendances-list-page.ts` L97–129).
   - Course-dates: otro pase completo de asistencias (`attendance-course-dates-page.ts` L150–178).
   - Mitigación FE baja: reusar hub coalescido (evita 2× red + 2× parse JSON). Reducir trabajo sync (índices compartidos) es opcional y más riesgoso → prefer defer si el coalesce alcanza.

4. **Firmas / config institucional sin cache de sesión**
   - `HttpInstitutionalConfigService.previewFirma` L119–123: GET blob directo.
   - Callers: `institutional-config-page`, `certification-preview-page` L328, `certification-pdf-preview-page` L278.
   - Preview y PDF cada uno hacen `obtener()` + hasta 2× `previewFirma` al entrar.
   - Fix FE: Map role→Promise\<Blob\> (+ invalidate en subir/quitar); opcional coalesce de `obtener()`.
   - **No** cambiar `Cache-Control: no-store` en PHP en este ciclo (security contract + tests).

5. **Listados: full-fetch + client filter (límite consciente)**
   - Students / courses / certs: `listar()` sin paginación server; UI pagina a 20.
   - Certs HTTP ya filtra `estado`/`cursoId`/`alumnoId` server-side; `q` client (`http-certifications.service.ts` L70–96). Spec vigente: *“fetch all… apply filters client-side”* (`frontend-http-services`).
   - Dashboard: `certs.listar()` + `courses.listar()` + `students.contar()` (`admin-dashboard-page.ts` ~L152–163); `contar()` certs = GET lista completa + `.length` (L133–138).
   - U2: **documentar límite** (escala aceptable para Bedelía staging; umbral cualitativo: cientos de filas OK; miles → U6/API). **No** rediseñar paginación server.

### Double-fetch sites (mapa)

| Navegación / escenario | Requests duplicados | Archivos |
|---|---|---|
| `/admin/asistencias` → `/admin/asistencias/curso/:id` | 2× `GET /admin/hub/asistencias` | `attendances-list-page.ts`, `attendance-course-dates-page.ts`, `http-attendance.service.ts` |
| Expediente preview → `/pdf` | 2× `obtener(cert)`, 2× `config.obtener`, 2× firmas (si presentes), QR/entrega solapados | `certification-preview-page.ts`, `certification-pdf-preview-page.ts` |
| Abrir PDF (solo vista) | Baja html2canvas+jspdf con el chunk aunque no se descargue | static imports L16–17 |
| Dashboard métricas | `listar` cursos + `listar` certs (full) + `contar` alumnos | `admin-dashboard-page.ts`, `http-certifications.service.ts#contar` |

### Locked defaults (desde PLAN + prompt)

- Implementar **solo** mejoras de bajo riesgo: dedupe fetch, lazy heavy deps, menos sync work obvio.
- Si hace falta cambio de API: **documentar y limitar**; **no** rediseñar el modelo (hub shape, paginación server).
- Hard locks: **D0**; leave **U1 archive** alone; **no** UX redesign; **no** honesty rewrite; prefer **front-only** surgical; **small reviewable diff**.
- Spec target: capability correcta (shell y/o admin modules) — o lean docs + tiny code.
- **No commit** en explore.

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/certifications/pages/pdf/certification-pdf-preview-page.ts` — dynamic import html2canvas/jspdf.
- `apps/frontend-angular/src/app/features/admin/attendances/data/http-attendance.service.ts` — coalesce `listarHub` (+ invalidate en mutaciones).
- Opcional: `http-institutional-config.service.ts` — cache sesión `previewFirma` / `obtener`.
- Docs: `docs/qa/PLAN-…` §U2 checkboxes en apply; nota de escala de listados (docs/frontend o comentario PLAN).
- Specs: ver Spec target.
- **No tocar**: archives U1/P*; backend Response Cache-Control; token/QR permanente (D0); copy/UX; `muestra_pagina/`.

### Approaches

1. **Surgical FE dedupe + deferred PDF deps (recomendada)** — Dynamic `import()` de html2canvas/jspdf en descarga; coalesce `listarHub`; opcional cache blob firmas en HTTP service; documentar límite client-filter en PLAN/docs. Spec ADDED liviano.
   - Pros: cierra checklist U2 con evidencia; alinea con patrones ya usados (`fechasPorCurso`); diff chico; cero UX.
   - Cons: no reduce payload hub en red (solo reusa); listados grandes siguen full-fetch.
   - Effort: **Low–Medium**

2. **API hub slim / server pagination** — Endpoints paginados o hub por `cursoId` sin todas las asistencias.
   - Pros: escala real a miles de filas.
   - Cons: rediseño de contrato; toca PHP + specs backend + FE; viola “no redesign model” / diff chico.
   - Effort: **High** — **DEFER** (U6 / ciclo aparte)

3. **Docs-only** — Solo documentar límites y defer código.
   - Pros: cero regresión.
   - Cons: deja double-fetch hub y deps PDF estáticas; checklist U2 incompleto.
   - Effort: Low (**incompleto** vs gaps 1–2)

### Spec target

**Primario — ADDED lean en `frontend-http-services`** (coalesce / no double-fetch de `listarHub` en la misma sesión de navegación; opcional cache de preview de firmas en `HttpInstitutionalConfigService` sin cambiar semántica HTTP).

**Secundario — ADDED mínimo en `frontend-angular-shell` o `admin-certifications-frontend`**: deps de captura PDF (html2canvas/jspdf) no deben cargarse hasta la acción de descarga / o hasta entrar al chunk PDF con import dinámico documentado.

**No** crear capability nueva. **No** MODIFIED masivo de “fetch all client-side” en listados — eso es **documentación de límite**, no cambio de contrato.

Si el delta HTTP se siente forzado: **docs + tiny code** sin escenarios nuevos de paginación server.

### Recommendation

Aplicar **Approach 1**: (1) dynamic import PDF deps, (2) coalesce `listarHub`, (3) opcional cache firmas en memoria, (4) documentar escala client-filter. Spec ADDED en `frontend-http-services` ± shell/certs. **DEFER** API slim hub, paginación server, Cache-Control firmas, dashboard metrics redesign, worker html2canvas. Listo para `sdd-propose`.

### DEFER (explícito)

| Ítem | Por qué defer |
|---|---|
| Paginación / filtros server en alumnos·cursos·certs | Rediseño de contrato; spec HTTP ya fija client-side; U6 |
| Slim `GET /admin/hub/asistencias?cursoId=` o payload sin asistencias globales | Cambio de modelo hub; fuera de “limit fix” |
| `Cache-Control` público/privado en firmas/logos | `no-store` es contrato de seguridad API; tests lo exigen |
| Deduplicar preview↔PDF (shared store de cert detalle) | Más acoplamiento; coalesce config/firmas alcanza para U2 |
| Dashboard: evitar `listar` full para métricas / `contar` sin full body | Superficie UX/métricas; no checklist U2 central |
| `import()` de `qrcode` / Web Worker para html2canvas | Ganancia menor o complejidad alta vs presupuesto de review |
| Medición formal de bundles en CI (size report) | Útil; no bloquea fixes; puede ir a U8/CI |
| Leave U1 archive / honesty / UX / D0 | Hard locks |

### Risks

- Coalesce `listarHub` stale tras `marcar` si falta invalidate → métricas hub desactualizadas al volver atrás.
- Dynamic import de PDF deps: specs que asumen sync import pueden necesitar ajuste (async path en `descargarPdf`).
- Cache de firmas sin invalidar en upload → preview viejo en config page.
- Diff >400 líneas si se mete dashboard + listados + API docs en el mismo PR → encadenar o recortar a hub+PDF+doc límite.

### Ready for Proposal

**Yes** — orquestador: `sdd-propose` con Approach 1, locks arriba, DEFER list intacta, spec target `frontend-http-services` (+ opcional shell/certs).
