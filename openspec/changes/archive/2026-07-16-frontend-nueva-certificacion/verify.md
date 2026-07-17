# Verify — frontend-nueva-certificacion (Ciclo 2: Nueva certificación)

**Fecha:** 2026-07-16
**Change:** `sdd/frontend-nueva-certificacion/`
**cwd:** `apps/frontend-angular/`
**Modo artefactos:** proposal + spec + design + tasks + apply-progress (verificación completa)
**Veredicto:** **verified**

---

## 1. Gates técnicos obligatorios

| # | Comando | Exit code | Resultado |
|---|---------|-----------|-----------|
| 1 | `npm run test:ci` | **0** | Verde — `686 SUCCESS`, 0 fallas |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | `TypeScript: No errors found` |
| 3 | `npm run build` | **0** | `Application bundle generation complete` |

### Detalle gate 1 (`test:ci`)

`test:ci` = `no-focused-tests.test.mjs` + `no-focused-tests.mjs` + `ng test --watch=false --browsers=ChromeHeadless`.

- Precheck `no-focused-tests.test.mjs`: exit `0`.
- Precheck `no-focused-tests.mjs`: `no-focused-tests: ok` (exit `0`).
- Suite Karma/Jasmine: `TOTAL: 686 SUCCESS`, 0 fallas (grep de `FAILED` solo devuelve ruido de Chrome `Failed to adjust OOM score`, no specs).

**Nota de entorno (no afecta veredicto):** el runner corre como `root`; `ChromeHeadless` no arranca sin `--no-sandbox`. Se ejecutó vía wrapper `CHROME_BIN` con `--no-sandbox --headless=new --user-data-dir` y `HOME` escribible. Karma reporta `686 SUCCESS` pero no cierra el proceso limpio en teardown headless-root (se mató tras capturar el resumen). El resultado de specs es completo y verde. Los mensajes `dbus`/`dconf`/`OOM score` son ruido inofensivo del entorno sandbox.

### Detalle gate 3 (`build`)

Build OK. Warnings de presupuesto CSS **preexistentes** en páginas ajenas a este ciclo:
`certification-revoke-page.css`, `student-detail-page.css`, `certification-preview-page.css`, `certification-pdf-preview-page.css`.
`certification-new-page.css` (nuevo) **no** excede presupuesto. No introducido por este ciclo.

---

## 2. Spec coverage (REQ-EMIT-001…010)

| REQ | Escenario | Evidencia (código + test) | Estado |
|-----|-----------|---------------------------|--------|
| **001** Ruta estática | Con sesión | `app.routes.ts` `certificaciones/nueva` (L138–146) **antes** de `certificaciones/:id` (L176); `app.routes.spec.ts` "orden seguro: nueva ANTES :id", "navegación real …carga CertificationNewPage", harness runtime | COMPLIANT |
| **001** | Sin sesión | Ruta hija bajo `path:'admin'` con `canActivate:[adminGuard]` (L55–68); guard cubierto por specs de rutas admin | COMPLIANT |
| **002** Selectores activos | Solo activos | `cargarCatalogos()` → `courses.listar({estado:'activo'})` + `alumnos.filter(estado==='activo')`; test "lista solo alumnos activos en el selector" | COMPLIANT |
| **003** Presentes elegibles | Presentes | `attendance.listarAsistenciasPorPar()` + `mapPresentes()` filtra `fechaEstado==='realizada'`; test "muestra presentes sobre fechas realizadas y preview tipográfica" (fecha + `Clase 1`) | COMPLIANT |
| **003** | Stale | `loadGen` (`++this.loadGen`, descarte `gen !== this.loadGen`); test "descarta resultado stale al cambiar de par" | COMPLIANT |
| **004** Vacíos bloqueantes | Sin fechas realizadas | `sinFechasRealizadas()` computed + aviso + botón disabled; test "bloquea emitir si el curso no tiene fechas realizadas" | COMPLIANT |
| **004** | Sin presentes | `sinPresentes()` computed + aviso + disabled; test "bloquea emitir si hay fechas pero el alumno no tiene presentes" | COMPLIANT |
| **005** Preview tipográfica | Datos sustentados | `certification-new-page.html` nombre, `dniMostrar`, curso, jornadas, firmantes desde config; test asserts `Demo Alumno`, `46****01`, curso, `Rector Demo`, `Asesor Demo` | COMPLIANT |
| **005** | Sin fantasma | Sin email/upload/logos/folio en template; test `not.toContain('@')` y `not.toContain('folio')` | COMPLIANT |
| **006** Defaults de fecha | Defaults | `hoyBuenosAires()` (Intl TZ BA) + `expiresAt:null`; test body `issuedAt: hoyBuenosAires(), expiresAt: null` | COMPLIANT |
| **007** Emitir + handoff | Éxito | `onEmitir()` → `certs.emitir()` → `router.navigate(['/admin/certificaciones', result.id])`; test navega con `77` | COMPLIANT |
| **007** | Doble submit | Guard `emitiendo()` + `[disabled]="!puedeEmitir()"`; test: botón disabled tras 1er click, `emitir` llamado 1 vez | COMPLIANT |
| **008** Errores | 409 | Mensaje "Ya existe un certificado vigente…", conserva selección, no navega; test 409 | COMPLIANT |
| **008** | 400/500 | Mensajes seguros ("datos no son válidos" / "Error del servidor"), no navega; tests 400 y 500 (HTTP) + page 400 | COMPLIANT |
| **009** Aviso anticipado | Anticipado | `certs.listar({estado:'vigente',cursoId,alumnoId})` → `avisoDuplicado()`; `409` tratado como autoridad en `onEmitir()` | COMPLIANT (MAY) |
| **010** Seam emitir | HTTP | `HttpCertificationsService.emitir` POST `${apiBaseUrl}/admin/certificados`, body exacto, `return envelope.data`; test "emitir hace POST … body exacto y mapea data" + 400/409/500 | COMPLIANT |
| **010** | InMemory | `InMemoryCertificationsService.emitir` DTO compatible + `409` por par; tests "emitir crea certificado vigente…" y "emitir 409 si ya hay vigente" | COMPLIANT |

### Confirmaciones puntuales solicitadas

- **Ruta estática antes de `:id`:** ✅ `app.routes.ts` (nueva L140 < :id L176) + test de orden.
- **Body POST exacto:** ✅ `{ alumnoId, cursoId, issuedAt, expiresAt }` — `http-certifications.service.spec.ts` `req.request.body` `toEqual(payload)` y page test `toEqual({...})`.
- **No wizard:** ✅ pantalla única (selección + preview + emitir en una vista).
- **No campos fantasma:** ✅ sin email/logos/upload/folio/ciclo/horas; asserts de template.
- **Handoff a detalle:** ✅ `router.navigate(['/admin/certificaciones', result.id])` con `data.id`.

**CTA (REQ-001):** `certifications-list-page.html` `a[routerLink="/admin/certificaciones/nueva"]`; test "expone CTA Nueva certificación".

---

## 3. Completitud de tareas

Todas las tareas de `tasks.md` (1.1–5.2) marcadas `[x]` en `apply-progress.md` y verificadas contra código/tests. Sin tareas de implementación pendientes.

---

## 4. Hallazgos

### CRITICAL
- Ninguno.

### WARNING
- **W1 — Presupuesto CSS preexistente:** 4 CSS ajenos al ciclo exceden budget (8 kB) en build. No introducido por esta feature; `certification-new-page.css` cumple. Recomendación: tratar fuera de este ciclo (deuda de estilos existente).
- **W2 — Entorno de tests:** Karma no cierra limpio bajo `root` + headless sin sandbox; requirió wrapper `--no-sandbox` y kill tras capturar `686 SUCCESS`. Es limitación del entorno, no del código. Recomendación: documentar `ChromeHeadlessNoSandbox` para CI en contenedores/root.

### SUGGESTION
- **S1 — Open questions de design (diferidas):** preselección de `alumnoId` por query desde detalle de alumno; fix amplio de `publicValidationUrl` en detalle HTTP. Ambas nice-to-have, fuera de scope; el handoff usa `id`, no requiere esas URLs.

---

## 5. Veredicto

**verified** — Los 3 gates en verde (exit `0`/`0`/`0`), `686 SUCCESS` en la suite, `tsc` sin errores, build OK. REQ-EMIT-001…010 COMPLIANT con evidencia de código + tests en runtime. Warnings son preexistentes o de entorno; no bloquean. Listo para `sdd-archive`.
