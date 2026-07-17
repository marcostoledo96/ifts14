```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:c92c87cde0ff8cd21aa4a4e312bc3cf978146ddb93d4d838d2be8054d52acdaa
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 4/4
scenarios: 9/9
test_command: CHROME_BIN=.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:c92c87cde0ff8cd21aa4a4e312bc3cf978146ddb93d4d838d2be8054d52acdaa
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:a35ced061bed1e9c19b06088cc6c47b17e2e6ca183fcee456ab224542e134598
```

# Verify — frontend-asistencias-marking (Ciclo 10: Marcado de asistencias)

**Fecha:** 2026-07-17  
**Change:** `openspec/changes/frontend-asistencias-marking/`  
**cwd:** `apps/frontend-angular/`  
**Modo:** Standard (proposal + spec + design + tasks + apply-progress)  
**Veredicto:** **PASS WITH WARNINGS**

---

## 1. Gates técnicos

| # | Comando | Exit | Resultado |
|---|---------|------|-----------|
| 1 | `CHROME_BIN=$PWD/.verify-tmp/chrome-wrapper.sh npm run test:ci` | **0** | `TOTAL: 734 SUCCESS` |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | sin errores (`TypeScript` limpio) |
| 3 | `npm run build` | **0** | bundle OK; warnings CSS budget ajenos al ciclo |

**Entorno gate 1:** wrapper `google-chrome --no-sandbox --headless=new --disable-gpu --user-data-dir=…/.verify-tmp/chrome-home`. Digests: test `sha256:c92c87c…`, tsc `sha256:ff63851…`, build `sha256:a35ced0…`.

```text
SDD_VERIFY_EXIT_CODES test_ci=0 tsc=0 build=0
```

---

## 2. Completitud de tareas

| Métrica | Valor |
|---------|-------|
| Tasks total | 17 |
| Tasks complete (`[x]`) | 17 |
| Tasks incomplete | 0 |

Checklist 1.1–5.2 alineado con `apply-progress.md` y código en `attendance-marking-page.{ts,html,css,spec.ts}`.

---

## 3. Spec compliance matrix (REQ-AMARK)

| Requirement | Scenario | Test (runtime verde en `test:ci`) | Result |
|-------------|----------|-----------------------------------|--------|
| Lista y marcado (MODIFIED) | Lista de fechas asistibles | `attendances-list-page.spec.ts` — tarjetas seed, conteos, enlace Tomar asistencia | ✅ COMPLIANT |
| Lista y marcado (MODIFIED) | Marcado con toggle + Descartar | `attendance-marking-page.spec.ts` — toggle `aria-pressed` / «✓ Presente»; «descartar restaura baseline» | ✅ COMPLIANT |
| Lista y marcado (MODIFIED) | Guardar deshabilitado sin cambios | «Guardar deshabilitado sin cambios y habilitado con cambios» | ✅ COMPLIANT |
| REQ-AMARK-02 | Cambio de fecha sin dirty | «selector cambia fecha sin cambios: navega…» | ✅ COMPLIANT |
| REQ-AMARK-02 | Dirty + confirm → navega | «selector con cambios pendientes: confirmar descarte navega» | ✅ COMPLIANT |
| REQ-AMARK-02 | Dirty + cancel → no navega / select revert | «…cancelar no navega y revierte el select» | ✅ COMPLIANT |
| REQ-AMARK-02 | Cancelada disabled | «fecha cancelada aparece deshabilitada en el selector» | ✅ COMPLIANT |
| REQ-AMARK-03 | Resumen refleja diferencias | «muestra resumen…»; «resumen muestra cambios sin guardar»; contadores Presentes | ✅ COMPLIANT |
| REQ-AMARK-04 | Sin aviso impacto certificados | «no muestra aviso de impacto de certificados (non-goal)» | ✅ COMPLIANT |

**Compliance summary:** 9/9 escenarios COMPLIANT.

### Cobertura pedida (checklist verify)

| Ítem | Evidencia | Estado |
|------|-----------|--------|
| Selector fecha + navigate + confirm dirty | 3 specs de selector + `onFechaSeleccionada` / `window.confirm` | ✅ |
| Canceladas disabled | option `disabled` con texto cancelada | ✅ |
| Toggle ✓ Presente / + Marcar (sin checkbox) | 0 `input[type=checkbox]`; `aria-pressed` + copy | ✅ |
| Resumen fecha/presentes/dirty; Guardar gated | `.resumen` + Guardar `disabled` sin dirty | ✅ |
| Impacto certificados OMITIDO | assert sin «certificado» / «entregar nuevamente» | ✅ |
| Privacy `dniMostrar` | «dniMostrar visible y enmascarado (XX****XX)» | ✅ |

---

## 4. Correctness (estática)

| Requisito | Status | Notes |
|-----------|--------|-------|
| Toggle accesible | ✅ Implemented | `button.toggle-presente` + `aria-pressed`; sin checkbox |
| Selector + dirty guard | ✅ Implemented | `Router` + `window.confirm`; revert select |
| Canceladas disabled | ✅ Implemented | `[disabled]` en opción `cancelada` |
| Resumen dirty | ✅ Implemented | computeds `agregados`/`quitados`/`cambios`/`dirty` |
| Guardar gated | ✅ Implemented | `!dirty() \|\| guardando()` |
| Non-goal certificados | ✅ Implemented | sin aviso en template |
| Privacy | ✅ Implemented | solo `apellidoNombre` + `dniMostrar` |

---

## 5. Coherence (design)

| Decisión (lock) | Followed? | Notes |
|-----------------|-----------|-------|
| Dirty → `window.confirm`; cancel revierte select | ✅ Yes | Spec + tests |
| Cancelada visible disabled | ✅ Yes | |
| Toggle «✓ Presente» / «+ Marcar» | ✅ Yes | |
| Confirm = descartar (no Guardar primero) | ✅ Yes | |
| Impacto certificados omitido | ✅ Yes | |
| Sin tocar AttendanceService / HTTP / rutas | ✅ Yes | Solo página marking |

---

## 6. Issues

**CRITICAL:** ninguno.

**WARNING:**
- **W1 — CSS budget preexistente:** build advierte excedentes en `course-editor-page.css`, `student-detail-page.css`, `certification-revoke-page.css`, `certification-pdf-preview-page.css`, `certification-preview-page.css`. `attendance-marking-page` **no** figura. Deuda ajena al ciclo.

**SUGGESTION:**
- **S1:** documentar `ChromeHeadlessNoSandbox` / wrapper en CI para entornos root/sandbox (ruido dbus/dconf/OOM score no afecta specs).

---

## 7. Veredicto

**PASS WITH WARNINGS** — Gates `0/0/0`, `734 SUCCESS`, 17/17 tasks, 9/9 escenarios REQ-AMARK COMPLIANT (incl. non-goal certificados y privacy `dniMostrar`). Único warning: CSS budget preexistente fuera de marking.

**Próximo paso:** `sdd-archive`.
