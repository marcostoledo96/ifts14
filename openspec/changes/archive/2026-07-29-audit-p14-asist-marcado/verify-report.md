```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:66696de84a6c3faee523ad439e208aec4745622d036c771a027b9b056ace164f
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 2/2
scenarios: 11/11
test_command: ./node_modules/.bin/ng test --include='**/attendance-marking-page.spec.ts' --no-watch --browsers=ChromeHeadless
test_exit_code: 0
test_output_hash: sha256:748c4e4d5ff10677e91516ed2212b19faa42274364e7de2715419131e727caab
build_command: npx tsc --noEmit -p tsconfig.app.json
build_exit_code: 0
build_output_hash: sha256:9636e1d7b8c1607f4fe80b92c2822e2e87e7149faf88854c34379f8b69c2c26a
```

## Verification Report

**Change**: audit-p14-asist-marcado
**Version**: N/A (delta OpenSpec)
**Mode**: Standard
**Branch**: `audit/p14-asist-marcado`
**Base prevista**: `staging1.0`

### Completeness

| Metric | Value |
|--------|-------|
| Tasks total | 17 |
| Tasks complete | 16 |
| Tasks incomplete | 1 |

Fases 1–3 y 4.1–4.3 marcadas `[x]`. Tarea **4.4** (smoke staging multi-PDF/multi-presentes sin 401) permanece `[ ]` — gate de verify, no de apply; se documenta como WARNING.

### Build & Tests Execution

**Build**: Passed

```text
cd apps/frontend-angular && npx tsc --noEmit -p tsconfig.app.json
TypeScript: No errors found
EXIT:0
```

**Tests**: 36 passed / 0 failed / 0 skipped

```text
cd apps/frontend-angular && ./node_modules/.bin/ng test --include='**/attendance-marking-page.spec.ts' --no-watch --browsers=ChromeHeadless
Chrome Headless: Executed 36 of 36 SUCCESS
TOTAL: 36 SUCCESS
EXIT:0
```

**Coverage**: Not available → umbral N/A

**Trailing whitespace**: sin coincidencias en `attendance-marking-page.{ts,html,spec.ts}`.

### Hard locks (inspección + diff)

| Lock | Evidencia | Estado |
|------|-----------|--------|
| Emit/regen SERIAL (`for`+`await`, sin `Promise.all`) | `guardarYGenerar` L358–378; tests serie emit y regen | Intactos |
| `HttpAttendanceService.marcar` sin tocar | Ausente del diff vs `staging1.0`; `Promise.all` DELETE/POST permanece | Intactos |
| Sin rotación token/QR | Solo `regenerarPdf`/`emitir`; assert `tokenPrefix` estable | Intactos |
| `errorRecuperable` + honesty not-found | false en id inválido / 404 / fechaNoEncontrada; true solo catch recuperable | OK |
| `mensajeErrorApi` en catch marcar | `guardarYGenerar` catch externo L402; test envelope 400 | OK |
| Sin P15 / backend / HTTP marcar | Diff FE acotado a `marking/*` + docs/openspec | OK |

### Spec Compliance Matrix

Requisitos delta: **Hub de fecha — asistencias** y **Guardar y generar certificados** (`admin-attendances-frontend`).

| Requirement | Scenario | Test | Result |
|-------------|----------|------|--------|
| Hub de fecha — asistencias | Marcado de presentes | `attendance-marking-page.spec.ts` > guardar persiste; descartar restaura baseline; toggles | COMPLIANT |
| Hub de fecha — asistencias | CTA a certificados del curso | `…` > sidebar CTA; CTA hub sin lista lateral | COMPLIANT |
| Hub de fecha — asistencias | Búsqueda por nombre o documento | `…` > búsqueda filtra por nombre; filtro TS incluye `dniMostrar` | COMPLIANT |
| Hub de fecha — asistencias | Fallo recuperable de carga con Reintentar | `…` > fallo recuperable re-llama fuentes sin PII | COMPLIANT |
| Hub de fecha — asistencias | Id o fecha inválidos sin Reintentar | `…` > id inválido; fechaId 999; API not-found | COMPLIANT |
| Hub de fecha — asistencias | Envelope 400 al marcar | `…` > envelope 400 vía mensajeErrorApi sin PII | COMPLIANT |
| Guardar y generar certificados | Emisión, regeneración y redirección | `…` > emite nuevos, regenera vigentes y navega | COMPLIANT |
| Guardar y generar certificados | Emisión y regeneración en serie | `…` > emisión serie; regeneración serie (maxInFlight) | COMPLIANT |
| Guardar y generar certificados | Fecha futura o programada | `…` > fecha futura AR: sin emit/regen; fallidos + copy | COMPLIANT |
| Guardar y generar certificados | Sin presentes ni cambios | `…` > Guardar y generar deshabilitado sin presentes ni dirty | COMPLIANT |
| Guardar y generar certificados | Token permanente al regenerar | `…` > tokenPrefix estable post-regenerar | COMPLIANT |

**Compliance summary**: 11/11 escenarios COMPLIANT.

### Correctness (Static Evidence)

| Requirement | Status | Notes |
|------------|--------|-------|
| `errorRecuperable` | Implemented | `signal(false)`; false inicio/id inválido/OK/not-found; true solo catch recuperable de `cargar` |
| Reintentar condicional | Implemented | HTML `@if (errorRecuperable())`; `onReintentar` no-op si false |
| Catch `marcar` | Implemented | `this.error.set(this.mensajeErrorApi(e))` |
| Bucle serial emit/regen | Intact | `for (const alumnoId of presentesIds) { await regenerarPdf|emitir }` |
| `regenerado: false` as-is | Intact | `actualizados++` sin ramificar por `regenerado` |
| Fecha futura | Implemented | `fechaClase > hoy AR` → fallidos + copy; sin listar/emit/regen |
| HTTP `marcar` / backend / P15 | Unchanged | Fuera del diff de producto |
| Sin PII | Implemented | Mensajes fijos/API; asserts sin DNI/token |

### Coherence (Design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Alcance página+tests+delta | Yes | Diff acotado a marking + openspec/docs |
| HTTP `marcar` Promise.all intacto | Yes | Sin cambios en `http-attendance.service` |
| `errorRecuperable` solo catch carga | Yes | Paridad P08/P11/P13 |
| Catch marcar → `mensajeErrorApi` | Yes | |
| Bucle emit/regen DO NOT TOUCH | Yes | Solo tests de orden |
| Token/QR solo documentar | Yes | Sin tocar backend ni specs de emisión |
| Smoke staging = gate verify | Partial | 4.4 no ejecutado en esta corrida |

### Issues Found

**CRITICAL**: None

**WARNING**:
- Tarea 4.4 pendiente: smoke staging multi-PDF/multi-presentes sin 401 session lock no corrido en verify. El riesgo de 401 queda mitigado por código serial + tests unitarios de no-solapamiento, pero no hay evidencia runtime en staging.

**SUGGESTION**:
- El filtro de búsqueda por DNI comparte el mismo predicado que el test de nombre; un assert explícito por `dniMostrar` reforzaría la trazabilidad del escenario (no bloquea).

### Verdict

**PASS WITH WARNINGS**

Implementación y suite focalizada (36/36) cumplen el delta P14 y los hard locks; el único faltante es el smoke staging 4.4 (WARNING documentado, no blocker de merge del producto unitario).
