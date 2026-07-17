# Verify — frontend-alumnos-list-polish (Ciclo 7: Lista alumnos + Nuevo alumno)

**Fecha:** 2026-07-16  
**Change:** `sdd/frontend-alumnos-list-polish/` (mirror: `openspec/changes/frontend-alumnos-list-polish/`)  
**cwd:** `apps/frontend-angular/`  
**Modo:** Standard (proposal + spec + design + tasks + apply-progress)  
**Veredicto:** **PASS WITH WARNINGS**

```yaml
schema: gentle-ai.verify-result/v1
evidence_revision: sha256:15023897957f0b7cd75e1d0b1ccace2236f5f1a24d441a53a0a3b331f4b97939
verdict: pass_with_warnings
blockers: 0
critical_findings: 0
requirements: 11/11
scenarios: 13/14
test_command: CHROME_BIN=apps/frontend-angular/.verify-tmp/chrome-wrapper.sh npm run test:ci
test_exit_code: 0
test_output_hash: sha256:f7c977d331af56bfeaaf321e72cc7de20e96c15920ba66ece03354a40451dcd6
build_command: npm run build
build_exit_code: 0
build_output_hash: sha256:ad6bc9c82fd51def639e968b387efa629a54af9079dfa260018a7d611265e93e
tsc_command: npx tsc --noEmit -p tsconfig.app.json
tsc_exit_code: 0
tsc_output_hash: sha256:ff63851439f41c4bd0169f582040e068eea30757f1f0e32317dee7f0f14672eb
```

---

## 1. Gates técnicos

| # | Comando | Exit | Resultado |
|---|---------|------|-----------|
| 1 | `npm run test:ci` | **0** | `TOTAL: 710 SUCCESS` |
| 2 | `npx tsc --noEmit -p tsconfig.app.json` | **0** | Sin errores TS |
| 3 | `npm run build` | **0** | Bundle OK (`students-list-page` lazy 15.70 kB; editor bajo chunk lazy) |

### Gate 1 — entorno Chrome

`ChromeHeadless` requiere `--no-sandbox` en este entorno. Se usó el wrapper del ciclo:

```bash
export CHROME_BIN="/home/marcos/Escritorio/ifts14/apps/frontend-angular/.verify-tmp/chrome-wrapper.sh"
# → /usr/bin/google-chrome --no-sandbox --headless=new --disable-gpu
#   --user-data-dir=.../apps/frontend-angular/.verify-tmp/chrome-home
cd apps/frontend-angular && npm run test:ci
```

Notas: mensajes `dbus`/`dconf`/`OOM score` son ruido headless, no fallas. Con permisos completos el exit fue **0**.

### Gate 3 — build

Warnings de presupuesto CSS **preexistentes** (páginas ajenas al ciclo o detail legacy): `certification-pdf-preview`, `student-detail-page`, `certification-preview`, `certification-revoke`. No bloquean el gate (exit 0).

---

## 2. Completitud de tareas

| Fase | Tareas | Estado |
|------|--------|--------|
| Phase 1 — modelo + seam crear | 1.1, 1.2, 1.3 | ✅ `[x]` |
| Phase 2 — lista polish | 2.1, 2.2 | ✅ `[x]` |
| Phase 3 — editor + ruta | 3.1, 3.2, 3.3, 3.4 | ✅ `[x]` |
| Phase 4 — tracking | 4.1, 4.2 | ✅ `[x]` |

**11/11 tareas completadas.** Sin incompletas que bloqueen archive.  
Apply-progress: `ready_for_verify` → este verify cierra el gate.

---

## 3. Spec compliance matrix (REQ-SLIST + REQ-SEDIT)

| REQ | Escenario | Test / evidencia | Resultado |
|-----|-----------|------------------|-----------|
| **SLIST-001** | CTA presente | `students-list-page.spec` → CTA “Nuevo alumno” href `/admin/alumnos/nuevo` | ✅ COMPLIANT |
| **SLIST-002** | Sin email real | `muestra warning Sin email y ShieldCheck…` → `.contacto-badge--warn` + texto “Sin email” | ✅ COMPLIANT |
| **SLIST-002** | Placeholder HTTP | `excluye tieneEmail null…` → “Sin dato” + no afirma “Sin email” para null | ✅ COMPLIANT |
| **SLIST-003** | Dato real | Mismo test: `.metrica .badge-icon` > 0 con seed numérico; no aserta valor `2` en fila conocida | ⚠️ PARTIAL |
| **SLIST-003** | Null HTTP | Mixed null → texto `—`; template `@if (mostrarShield)` | ✅ COMPLIANT |
| **SLIST-004** | Null → guion | Mixed null → `—` vía `formatoMetrica` | ✅ COMPLIANT |
| **SLIST-005** | Empty con CTA | `presenta carga, error… vacío…` → SVG + link `/admin/alumnos/nuevo`; error/retry/no-results con SVG | ✅ COMPLIANT |
| **SLIST-006** | Sin PII completa | búsqueda sin email/legajo; tarjetas con `dniMostrar`; seed `^\d{2}\*{4}\d{2}$` | ✅ COMPLIANT |
| **SLIST-007** | Null no entra en sin-email | `excluye tieneEmail null del filtro Sin email` → solo id 2 | ✅ COMPLIANT |
| **SEDIT-001** | No cae en detalle | `app.routes.spec` → orden `nuevo` antes `:id` + navegación/harness `StudentEditorPage` | ✅ COMPLIANT |
| **SEDIT-002** | Campos requeridos | `valida inline y no llama crear…`; sin email/select estado | ✅ COMPLIANT |
| **SEDIT-003** | POST body | `http-students.service.spec` → body exacto `{apellidoNombre,dni}`; sin campos inventados | ✅ COMPLIANT |
| **SEDIT-003** | 409 | HTTP propaga 409; editor `mensajeErrorAlta` / UI sin eco DNI `30111222` | ✅ COMPLIANT |
| **SEDIT-004** | Éxito | `crea con body mínimo y navega…` → `['/admin/alumnos', 42]`; doble-submit bloqueado | ✅ COMPLIANT |

**Compliance summary:** 13/14 escenarios ✅ COMPLIANT; 1 ⚠️ PARTIAL (ShieldCheck “dato real” sin assert de conteo exacto).

---

## 4. Correctness (evidencia estática)

| Requirement | Status | Notes |
|------------|--------|-------|
| CTA Nuevo alumno | ✅ Implemented | Header list + empty-total |
| Ruta `alumnos/nuevo` antes `:id` | ✅ Implemented | `app.routes.ts` |
| Editor mínimo + POST | ✅ Implemented | `student-editor-page` + `StudentsService.crear` |
| Badges honestos | ✅ Implemented | `etiquetaContacto` / `mostrarWarningSinEmail` / `mostrarShield` / `formatoMetrica` |
| Privacy | ✅ Implemented | Lista `dniMostrar`; errores create sin DNI completo |
| SVG estados | ✅ Implemented | loading / error / empty-total / no-results |
| Filtros nullables | ✅ Implemented | email + cert excluyen `null` (cert sin test dedicado) |

---

## 5. Coherence (design)

| Decision | Followed? | Notes |
|----------|-----------|-------|
| Nullables HTTP → null | ✅ Yes | `toAlumno` placeholders |
| Seed in-memory boolean/number reales | ✅ Yes | |
| Sin selector estado; omitir en POST | ✅ Yes | |
| Handoff a detalle `:id` | ✅ Yes | |
| SVG inline (no lucide) | ✅ Yes | |
| `AlumnoDraft` + `crear` | ✅ Yes | |

---

## 6. Issues found

**CRITICAL:** None

**WARNING:**
1. Escenario ShieldCheck “dato real” solo parcialmente cubierto (iconos presentes, sin assert de `2` + SVG en fila fija).
2. REQ-SLIST-007 texto exige que `null` no matchee `con-cert`/`sin-cert`; implementado en `resultadosFiltrados`, **sin test dedicado** (solo email null tiene escenario).
3. Build CSS budget warnings preexistentes (no introducidos por este ciclo).

**SUGGESTION:**
1. Agregar assert explícito: fila con `certificacionesValidas === 2` muestra `2` + `.badge-icon` (Shield); fila null sin icono.
2. Spec/test: alumno con `certificacionesValidas === null` no aparece en chip Sin cert / Con cert.
3. En archive: promover deltas a `openspec/specs/` + doc `docs/frontend/`.

---

## 7. Coverage checklist (orquestador)

| Tema | Estado |
|------|--------|
| CTA Nuevo alumno | ✅ |
| Ruta estática antes de `:id` | ✅ |
| Editor apellidoNombre+dni, POST body exacto, 201→detalle | ✅ |
| Badges honestos (Sin email solo si `tieneEmail===false`; Shield solo con dato real) | ✅ impl. / ⚠️ test Shield parcial |
| Privacy (sin DNI completo en errores/lista) | ✅ |
| SVG estados | ✅ |

---

## 8. Verdict

**PASS WITH WARNINGS**

Gates 1–3 exit **0** (710 tests, tsc limpio, build OK). 11/11 tasks `[x]`. 13/14 escenarios COMPLIANT + 1 PARTIAL. Listo para `sdd-archive` (docs + openspec specs); opcional endurecer asserts Shield/cert-null en un follow-up menor.
