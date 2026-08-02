# Exploration: audit-p12-asist-hub

**Cambio**: `audit-p12-asist-hub`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-28
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p12-asist-hub`
**Alcance de fase**: hub `/admin/asistencias` → `attendances-list-page.*` (+ `listarHub` en HTTP/mock solo si hay evidencia PERF/métricas sin cambiar contrato)
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P12; `openspec/specs/admin-attendances-frontend/spec.md` (Listado global solo por curso); `openspec/specs/frontend-http-services/spec.md` (HttpAttendanceService; sin escenario `listarHub`); `openspec/specs/admin-master-data-api/spec.md` (`GET /admin/hub/asistencias`)

## Exploration: Hub de asistencias admin (P12)

### Current State

`AttendancesListPage` es el hub secundario de cursos → intermedia de fechas. Carga un solo `ATTENDANCE_SOURCE.listarHub()`, deriva métricas client-side (fechas asistibles ≠ `cancelada` y fechas con ≥1 presente), filtra por nombre/código, pagina de a 20 y enlaza a `/admin/asistencias/curso/:id`. `loadGen` + Reintentar cubren carreras y fallo recuperable. No hay DNI ni roster en esta pantalla.

| Checklist P12 | Estado hoy | Evidencia |
|---|---|---|
| Listado cursos con métricas de fechas | **OK** | Una fila/card por curso; `textoMetricas` → «N fechas asistibles» (+ «· M con presentes» si M>0); no usa `alumnosActivos` como total; orden por `codigo`; CTA «Ver fechas». Spec canónica + tests de métricas/CUR-005. |
| Búsqueda, paginación, vacío | **OK** | `type=search` nombre/código; pager 20 + reset a pág. 1; `vacioTotal` / `vacioFiltro` con copy claro; sin chips de estado de fecha. Tests cubren filtro, vacío de filtro y paginación. |
| Performance hub (evitar O(n²) client) | **Gap** | En `cargar()`, por cada curso se hace `[...Set].filter(fechaId => hub.fechas.some(...))`: coste ~ O(cursos × ids_con_presente × fechas). Contrato de métricas OK; el algoritmo es innecesariamente cuadrático. |

**Comportamiento técnico vigente**

- Ruta: `app.routes.ts` → `/admin/asistencias` lazy `AttendancesListPage`.
- Derivación de métricas (una sola pasada deseable, hoy no):
  1. Contar fechas ≠ `cancelada` por `cursoId` → `fechasAsistibles`.
  2. Agrupar `cursoFechaId` con presentes por curso.
  3. Contar solo ids cuya fecha exista, sea del curso y no esté `cancelada` → `fechasConPresentes` (el `some` anidado es el hot path O(n²)).
- Copy/errores: mensaje genérico «No se pudo cargar el registro de asistencias. Reintentá.»; panel «No pudimos cargar las asistencias» + botón Reintentar. Sin `console.*` ni PII en la página.
- `loadGen`: incrementa en `cargar`; descarta éxito/error/finally obsoletos; test de reintento solapado presente.
- HTTP `listarHub`: un GET `/admin/hub/asistencias`; mapea DTOs; precarga `asistenciasPorCurso`. **Detalle PERF menor**: `toAsistencia` corre dos veces sobre el mismo array (loop de cache + `asistencias` del return) — O(n) duplicado, no O(n²); contrato intacto.
- Mock `listarHub`: arma cursos + `listarFechas` en paralelo; luego, por cada curso, `await listarAlumnos` secuencial solo para `alumnosActivos = max(activos)`. El listado **no consume** `alumnosActivos`. No es O(n²); es N awaits secuenciales innecesarios para el hub UI.
- Specs: `admin-attendances-frontend` ya exige filas=cursos, métricas honestas, búsqueda, paginación 20, sin chips de fecha. `frontend-http-services` implementa AttendanceService pero **no** documenta escenario `listarHub`. `admin-master-data-api` define el hub consolidado backend (fuera de apply FE salvo lectura de contrato).

**Residuos / gaps**

1. **PERF O(n²) en página** — reemplazar `hub.fechas.some` por un índice O(1) (p. ej. `Set` de ids asistibles por curso, o Set global `cursoId:fechaId` / id de fecha asistible) y contar intersección en O(n). Misma semántica.
2. **HTTP double-map** (opcional, bajo costo) — reutilizar el array ya mapeado al armar el return de `listarHub`.
3. **Mock `alumnosActivos`** (opcional / fuera si no se toca mock) — no bloquea el hub UI; no priorizar en P12 salvo que se edite el mock por otra razón.
4. **Tests PERF** — no hay assert de complejidad; sí hay de métricas. Conviene un caso con fecha `cancelada` + presentes huérfanos (si aplica) y/o muchos cursos para no regresionar el conteo tras el refactor O(n).
5. **Spec** — checklist de comportamiento ya cubierta; PUEDE ADDED un escenario «agregación de métricas en tiempo lineal» o dejarlo solo en design/tasks. `listarHub` en `frontend-http-services` es gap documental opcional (solo si se toca el servicio).

### Affected Areas

- `apps/frontend-angular/.../attendances/pages/list/attendances-list-page.ts` — refactor de agregación de métricas (foco PERF).
- `apps/frontend-angular/.../attendances/pages/list/attendances-list-page.html` — solo si copy/error/vacío requieren ajuste (hoy OK).
- `apps/frontend-angular/.../attendances/pages/list/attendances-list-page.spec.ts` — conservar métricas/paginación/vacío; reforzar cancelada / no regresión.
- `apps/frontend-angular/.../attendances/data/http-attendance.service.ts` — **solo si** se confirma micro-fix double `toAsistencia` sin cambiar contrato.
- `apps/frontend-angular/.../attendances/data/attendance-mock.service.ts` — **no prioritario**; fuera salvo decisión explícita.
- `openspec/specs/admin-attendances-frontend/spec.md` — delta opcional PERF / loadGen-Reintentar si propose lo pide.
- `openspec/specs/frontend-http-services/spec.md` — delta `listarHub` solo si se toca HTTP.
- **Fuera de alcance**: intermedia P13 (`attendance-course-dates-page`), marcado P14, certificados por fecha, backend PHP, rediseño visual vs `muestra_pagina/`.

### Approaches

1. **Auditoría quirúrgica in-place (recomendada)** — Cerrar gap PERF en `AttendancesListPage.cargar` con índice O(n); conservar UI/contrato/tests; HTTP double-map solo si se abre el archivo; delta spec mínimo o nulo.
   - Pros: alineado al plan P12; blast radius bajo; checklist funcional ya OK; sin tocar P13/P14.
   - Cons: no documenta `listarHub` en HTTP specs si se omite el servicio.
   - Effort: Low

2. **PERF página + HTTP + mock** — Además: un solo `toAsistencia` en HTTP; paralelizar o simplificar `alumnosActivos` en mock.
   - Pros: limpia los tres hotspots del hub.
   - Cons: más archivos/tests; riesgo de scope creep; mock no afecta staging HTTP.
   - Effort: Medium

3. **Solo documental / tests** — Spec + tests sin cambiar algoritmo.
   - Pros: cero riesgo de UI.
   - Cons: deja el O(n²) que el plan P12 pide evitar.
   - Effort: Low

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Checklist P12 como aceptación**
   - Conservar listado por curso, métricas N/M, búsqueda, paginación 20, vacíos, CTA intermedia.
   - Conservar copy/errores/Reintentar/`loadGen`; mensajes sin PII; sin DNI en esta pantalla.

2. **PERF**
   - Reescribir el conteo `fechasConPresentes` con Sets/Mapas O(n); no cambiar semántica (excluir `cancelada`; no inventar totales con `alumnosActivos`).

3. **HTTP / mock**
   - HTTP: opcional eliminar double-map si el diff cabe en el mismo PR y hay test `listarHub` verde.
   - Mock: omitir por defecto.

4. **Tests / spec**
   - Mantener suite actual; añadir/ajustar caso que fije semántica post-refactor (p. ej. presentes en fecha cancelada no cuentan).
   - Delta `admin-attendances-frontend` solo si hace falta explicitar agregación lineal o Reintentar/loadGen; no reabrir P13/P14.

5. **Fuera de P12**
   - Course-dates, marking, backend hub payload, rediseño.

### Questions (para propose)

1. ¿Se confirma limitar el fix PERF a `AttendancesListPage.cargar` (recomendado: **sí**) y dejar mock intacto?
2. ¿Incluir micro-fix de double `toAsistencia` en `HttpAttendanceService.listarHub` en el mismo ciclo (recomendado: **sí si cabe**; no bloqueante)?
3. ¿Delta spec con escenario PERF explícito, o solo design/tasks + tests (recomendado: **tests + design; delta solo si propose quiere contrato explícito**)?
4. ¿Documentar `listarHub` en `frontend-http-services` solo si se toca HTTP (recomendado: **sí**)?

### Risks

- Ampliar a P13/P14 o «optimizar» el endpoint PHP → scope creep y presupuesto 400 LOC.
- Cambiar semántica de métricas al refactorizar (p. ej. contar canceladas o usar `alumnosActivos`).
- Tocar mock/`alumnosActivos` sin consumidores en el listado → ruido de review.
- Inventar DNI/PII en logs o copy de error (hoy ausente; no introducir).

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `attendances-list-page.*`: checklist P12 OK salvo PERF O(n²) en agregación; fix lineal sin cambiar contrato; HTTP/mock opcionales; sin intermedia ni marcado.
