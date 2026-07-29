# Exploration: audit-p14-asist-marcado

**Cambio**: `audit-p14-asist-marcado`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-29
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p14-asist-marcado`
**Alcance de fase**: marcado `/admin/cursos/:id/fechas/:fechaId/asistencias` → `attendance-marking-page.*`
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P14 (CRÍTICA); `openspec/specs/admin-attendances-frontend/spec.md` (Hub de fecha + Guardar y generar); `openspec/specs/pdf-regeneration/spec.md`; `openspec/specs/admin-certificate-emission/spec.md`; `openspec/specs/frontend-http-services/spec.md` (survey HTTP); AGENTS.md (token/QR permanente; DNI completo UI; sin PII en logs)

## Exploration: Marcado de asistencias + emisión (P14)

### Current State

`AttendanceMarkingPage` es el hub de fecha: roster con toggles presente/ausente, `dniMostrar` completo, búsqueda, selector de fechas del curso, CTA primario «Guardar y generar certificados», aside con enlace a `…/asistencias/certificados` (sin listar certs). `effect` + `loadGen` recargan ante cambio de `:id`/`:fechaId` y descartan cargas/guardados stale. Tras marcar asistencias, lista vigentes del curso y **en serie** (`for` + `await`) emite o `regenerarPdf`; navega a la página de certificados con `state: { resumenGen, mensaje }`.

| Checklist CRITICAL P14 | Estado hoy | Evidencia |
|---|---|---|
| Marcar presentes/ausentes; guardar | **OK** | Toggles `aria-pressed`, dirty/descartar, `attendance.marcar`; tests de contador, persistencia y redirección. |
| Emitir / regenerar PDF **en serie** (no 401 session lock) | **OK en página** | Comentario + bucle serial en `guardarYGenerar`; backend `session_write_close` tras auth. Test emite/regenera pero **no** afirma orden serial vs `Promise.all`. |
| Mensajes 400 (fecha futura/programada, sin presentes) | **Parcial** | Futura: pre-check cliente → `fallidos` + copy claro, sin llamar emitir. Sin presentes: CTA deshabilitado. 400 API por alumno vía `mensajeErrorApi`. Catch externo de `marcar` usa `(e as Error).message` (no envelope). Sin test dedicado de fecha futura. |
| Token no rota al regenerar | **OK (hard rule)** | Backend `regenerarPdf` reusa token; test marca `tokenPrefix` estable. |
| Feedback UX claro post-emisión | **OK con matices** | Navigate + `DateCertificatesPage` muestra `mensajeOk` y resumen Emitidos/Actualizados/Con error. Banner en marcado casi invisible por redirección inmediata. |

**Comportamiento técnico vigente**

- Ruta: `/admin/cursos/:id/fechas/:fechaId/asistencias` (entrada desde detalle/intermedia/hub).
- Datos carga: `Promise.all` de `courses.obtener`, `attendance.listarAlumnos`, `attendance.listarAsistencias` (lectura paralela OK).
- Guardar: `ATTENDANCE_SOURCE.marcar` con todos los alumnos (presente true/false). HTTP orquesta GET + DELETE/POST; **DELETE y POST van en `Promise.all` (paralelo)** — survey, no bug de página.
- Emisión: si `fechaClase > hoy (AR)` → no emite; cuenta todos los presentes como `fallidos` con mensaje de fecha futura/programada. Si no: `certs.listar({ cursoId, estado: 'vigente' })` → por alumno `regenerarPdf` o `emitir({ issuedAt: hoy, expiresAt: null })` en serie; errores parciales no abortan el lote.
- Regeneración: backend no rota token; si PDF ya vigente alineado responde `{ regenerado: false }` y la página **igual suma `actualizados++`** (honesty menor).
- Copy CTA: «Guardar y generar certificados» / «Guardando y generando…»; `puedeGuardarYGenerar` = dirty **o** ≥1 presente.
- PII: DNI completo en UI; sin legajo/email/token completo en template; tests anti-legajo/email; sin `console.*` en la página.
- Spec canónica «Guardar y generar certificados» ya exige persistir, emitir/regenerar sin rotar token, redirección con resumen, errores parciales, sin DNI/token en logs/mensajes. `pdf-regeneration` / emisión backend cubren token permanente y 400 sin asistencias certificables.

**Residuos / gaps**

1. **Reintentar / honesty de carga** — fallo de `cargar` solo pinta `error` en línea; **no** hay `Reintentar` ni `errorRecuperable` (paridad P08/P11/P13). `loadGen` ya existe.
2. **Catch de `marcar`** — no usa `mensajeErrorApi`; `HttpErrorResponse` puede mostrar mensaje genérico en vez del 400 del envelope.
3. **Tests CRITICAL incompletos** — falta: fecha futura → mensaje + `fallidos` sin `emitir`; orden serial de emit/regen (spies en secuencia); Reintentar recuperable si se agrega; opcional staging smoke multi-PDF sin 401.
4. **HTTP `marcar` paralelo** — `Promise.all` en DELETE/POST; con `session_write_close` el riesgo es menor que PDF paralelo, pero sigue siendo superficie de contención bajo carga. Fuera del núcleo de página salvo evidencia staging.
5. **`actualizados` vs `regenerado: false`** — contador puede decir «actualizados» cuando el backend no regeneró (PDF ya al día).
6. **Survey HTTP (solo lectura)** — `HttpCertificationsService.emitir` / `regenerarPdf` son POST delgados; no rotan token en cliente. No hace falta tocar HTTP de certificaciones para P14 salvo bugs de mapeo (no observados).

### Affected Areas

- `apps/frontend-angular/.../attendances/pages/marking/attendance-marking-page.ts` — honesty carga/errores; conservar bucle serial y hard rule de no rotar token.
- `apps/frontend-angular/.../attendances/pages/marking/attendance-marking-page.html` — Reintentar condicional si se adopta; copy error recuperable.
- `apps/frontend-angular/.../attendances/pages/marking/attendance-marking-page.spec.ts` — tests CRITICAL (futura, serial, Reintentar); no debilitar tokenPrefix.
- `apps/frontend-angular/.../attendances/pages/date-certificates/date-certificates-page.*` — **solo lectura** en P14 (feedback ya consume `state`); cambios de copy de banner → P15 salvo bug bloqueante.
- `apps/frontend-angular/.../attendances/data/http-attendance.service.ts` — survey; serializar `marcar` **solo** si propose confirma tras evidencia 401.
- `apps/frontend-angular/.../certifications/http-certifications.service.ts` — survey; no cambiar contrato emitir/regenerar.
- `openspec/specs/admin-attendances-frontend/spec.md` — delta corto si se formaliza Reintentar / mensajes 400 / serial explícito.
- **Fuera de alcance (defaults)**: P15 listado certs, P12 hub, P13 intermedia, rotación de token, SMTP, rediseño vs `muestra_pagina/`, backend de emisión/regen salvo bug CRITICAL demostrado.

### Approaches

1. **Auditoría quirúrgica de página (recomendada)** — Conservar flujo CRITICAL ya implementado; cerrar honesty (Reintentar recuperable + `mensajeErrorApi` en catch de marcar); tests de fecha futura y serialidad; delta spec mínimo. HTTP solo documentado.
   - Pros: cierra gaps del plan sin reabrir camino crítico; blast radius acotado; paridad P11–P13.
   - Cons: no endurece `marcar` HTTP paralelo por sí solo.
   - Effort: Low–Medium

2. **Página + serializar `HttpAttendanceService.marcar`** — Además del enfoque 1, DELETE/POST en serie (o lotes pequeños) para reducir contención de sesión.
   - Pros: endurece camino HTTP del guardar bajo cPanel.
   - Cons: toca HTTP; más LOC; puede alargar guardados grandes; necesita evidencia o aceptación explícita (camino crítico).
   - Effort: Medium

3. **Refactor amplio del flujo emitir/guardar** — Extraer orquestador, progress UI, batch API, etc.
   - Pros: UX de progreso más rica.
   - Cons: scope creep; riesgo alto en camino CRITICAL; supera presupuesto 400 LOC.
   - Effort: High

### Recommendation

Adoptar **enfoque 1** por defecto. Alcance propuesto para `sdd-propose`:

1. **Checklist CRITICAL como aceptación (no romper)**
   - Marcar/guardar; emit/regen **en serie**; token estable al regenerar; feedback vía navigate+state; DNI completo UI; sin PII en logs/mensajes.
2. **Honesty de carga/errores**
   - `errorRecuperable` + Reintentar solo en catch de carga (paridad P13); id/fecha inválidos o not-found sin Reintentar.
   - Catch de `marcar` → `mensajeErrorApi`.
3. **Tests / verify**
   - Fecha futura: asistencias guardadas, `emitir`/`regenerarPdf` no llamados (o fallidos con copy), mensaje claro.
   - Orden serial: spies de emit/regen en secuencia (no solapados).
   - Conservar assert `tokenPrefix` estable.
   - Verify: smoke staging multi-presentes sin 401 (gate, no implementación).
4. **HTTP**
   - No modificar `http-certifications` ni `http-attendance` en apply salvo default confirmado (enfoque 2).

### Defaults a confirmar (camino CRITICAL — cuidado)

1. ¿Alcance = **enfoque 1** (página + tests + delta corto), sin tocar HTTP `marcar`? (**recomendado: sí**)
2. ¿Si staging muestra 401 en **guardar** (no solo en PDF), escalar a enfoque 2 en el mismo ciclo o en hotfix? (**recomendado: hotfix/follow-up con evidencia; no serializar `marcar` a ciegas**)
3. ¿Agregar Reintentar recuperable en fallo de carga (paridad P13)? (**recomendado: sí**)
4. ¿Contar `regenerado: false` como «actualizado» o como no-op en el resumen? (**recomendado: dejar como está en P14; honesty menor diferida — evitar cambiar semántica de resumen sin diseño**)
5. ¿Delta spec explícito de emisión en serie + mensajes 400 de fecha futura? (**recomendado: sí, ADDED/MODIFIED corto en `admin-attendances-frontend`**)
6. ¿Prohibido tocar backend `regenerarPdf` / rotación de token en este change? (**recomendado: sí, hard rule**)

### Questions (para propose)

1. Confirmar defaults 1–6 arriba antes de apply.
2. ¿Incluir smoke staging 401 multi-PDF en verify-report como evidencia obligatoria? (**recomendado: sí**)
3. ¿Algún cambio de copy del CTA o del mensaje de fecha futura? (**recomendado: no, salvo typo**)

### Risks

- Tocar el bucle serial o paralelizar emit/regen → **401 session lock** en cPanel (regresión CRITICAL).
- Cualquier cambio que regenere token/QR → viola AGENTS.md / `pdf-regeneration`.
- Serializar `marcar` HTTP sin evidencia → latencia alta y diff HTTP innecesario.
- Ampliar a P15 (date-certificates) o backend de emisión → scope creep y presupuesto 400 LOC.
- Introducir PII (DNI/token) en mensajes de error o logs de test.
- Contar mal `fallidos`/`actualizados` tras «arreglar» honesty del resumen sin tests de navegación.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `attendance-marking-page.*`: checklist CRITICAL mayormente OK en código; cerrar honesty (Reintentar, envelope 400, tests futura/serial); HTTP solo survey salvo default confirmado; **no** rotar token.
