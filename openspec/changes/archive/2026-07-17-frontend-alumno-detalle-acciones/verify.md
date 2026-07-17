# Verify: Detalle de alumno — acciones

Fecha: 2026-07-17 (re-verify post FAIL)

## Veredicto

**PASS WITH WARNINGS** — gates formales verdes con exit codes limpios; REQ-SDET-001..007 COMPLIANT incluyendo empty/error/loading de asistencias (REQ-SDET-004). Warnings: presupuesto CSS en build (incluye `student-detail-page.css`).

## Artefactos revisados

- Engram `sdd/frontend-alumno-detalle-acciones/spec` → `openspec/changes/frontend-alumno-detalle-acciones/spec.md`
- Engram `sdd/frontend-alumno-detalle-acciones/tasks` → `openspec/changes/frontend-alumno-detalle-acciones/tasks.md`
- Engram `sdd/frontend-alumno-detalle-acciones/design` → `openspec/changes/frontend-alumno-detalle-acciones/design.md`
- Specs nuevas en `student-detail-page.spec.ts` (orquestador): empty / loading+aria-busy / error+Reintentar

## Completeness

| Área | Estado | Evidencia |
|---|---:|---|
| Tasks Phase 1 seam asistencias | Done | `tasks.md` 1.1–1.3 `[x]` |
| Tasks Phase 2 preselect emisión | Done | `tasks.md` 2.1–2.2 `[x]` |
| Tasks Phase 3 CTAs + asistencias UI | Done | `tasks.md` 3.1–3.3 `[x]` |
| Tasks Phase 4 cierre apply | Done | `tasks.md` 4.1–4.3 `[x]` |
| Cobertura REQ-SDET-004 empty/loading/error | Done | 3 specs nuevas en `student-detail-page.spec.ts` |

## Gates ejecutados

Entorno: `required_permissions: ["all"]`, `CHROME_BIN=apps/frontend-angular/.verify-tmp/chrome-wrapper.sh` (`--no-sandbox`), `HOME`/`XDG_*` bajo `.verify-tmp/chrome-home*`.

| Gate | Comando | Exit code | Resultado |
|---|---|---:|---|
| Focused student-detail | `npx ng test --watch=false --browsers=ChromeHeadless --include='**/student-detail-page.spec.ts'` | 0 | **PASS** — `TOTAL: 9 SUCCESS` |
| Tests CI | `CHROME_BIN=.../.verify-tmp/chrome-wrapper.sh npm run test:ci` | 0 | **PASS** — `TOTAL: 718 SUCCESS` (antes 715; +3 specs asistencias) |
| Type check | `npx tsc --noEmit -p tsconfig.app.json` | 0 | **PASS** |
| Build | `npm run build` | 0 | **PASS** con warnings de presupuesto CSS |

`SDD_VERIFY_EXIT_CODES test_ci=0 tsc=0 build=0`

Warnings de build (no bloquean exit 0):

- `student-detail-page.css` excede presupuesto por 921 bytes (total 8.92 kB / budget 8.00 kB).
- `certification-revoke-page.css` excede por 1.77 kB.
- `certification-preview-page.css` excede por 7.65 kB.
- `certification-pdf-preview-page.css` excede por 5.70 kB.

## Matriz de cumplimiento

| Req | Escenario | Evidencia de implementación | Evidencia de test | Estado |
|---|---|---|---|---|
| REQ-SDET-001 | CTA navega con alumno | `student-detail-page.html` `routerLink` a `/admin/certificaciones/nueva` con `{ alumno: a.id }` | `student-detail-page.spec.ts` `cta-nueva-certificacion` `alumno=1`; suite CI 718 SUCCESS exit 0 | **COMPLIANT** |
| REQ-SDET-002 | Fila pendiente con curso id | `queryEmitir()` agrega `curso` si id `/^\d+$/` | `student-detail-page.spec.ts` `emitir-certificacion` `alumno=1&curso=3`; CI exit 0 | **COMPLIANT** |
| REQ-SDET-003 | Alumno y curso válidos | `CertificationNewPage` lee `queryParamMap`, valida catálogos, `cargarPar()` | `certification-new-page.spec.ts` preselect `alumno=46&curso=4`; CI exit 0 | **COMPLIANT** |
| REQ-SDET-003 | Query inválida | `aplicarQueryPreselect()` ignora inválidos + `avisoQuery` | `certification-new-page.spec.ts` `alumno=99999`; CI exit 0 | **COMPLIANT** |
| REQ-SDET-004 | Listado con datos | Sección inline + `listarAsistenciasPorAlumno` | Spec click “Ver asistencias” fecha/curso; CI exit 0 | **COMPLIANT** |
| REQ-SDET-004 | Vacío | Template `Sin asistencias registradas` | Spec `muestra empty state cuando Ver asistencias no tiene registros`; focused + CI verdes | **COMPLIANT** |
| REQ-SDET-004 | Error/loading honestos | Loading `Cargando asistencias` + `aria-busy`; error + Reintentar | Specs loading y error/reintentar; focused + CI verdes | **COMPLIANT** |
| REQ-SDET-005 | Motivos visibles | Compartir/Editar disabled + `aria-describedby`; sin F2-05 | `student-detail-page.spec.ts`; CI exit 0 | **COMPLIANT** |
| REQ-SDET-006 | HTTP query | Seam `listarAsistenciasPorAlumno`; HTTP `?alumnoId=`; mock filtra | `http-attendance` + `attendance-mock` specs; CI exit 0 | **COMPLIANT** |
| REQ-SDET-007 | Sin fuga | `dniMostrar`; asistencias sin DNI/email/legajo/token | Specs detalle + mock; CI exit 0 | **COMPLIANT** |

## Hallazgos

### CRITICAL

Ninguno.

### WARNING

1. `npm run build` pasa con warnings de presupuesto CSS, incluyendo `student-detail-page.css` (+921 bytes). Preexistentes en otras páginas de certificaciones.
2. En corridas sandboxed previas Karma podía colgar tras SUCCESS; con entorno `all` + wrapper `--no-sandbox` el cierre fue limpio (exit 0).

## Resumen de cobertura requerida

- Nueva certificación con `?alumno=ID`: **COMPLIANT**
- Emitir fila con alumno+curso cuando id real: **COMPLIANT**
- `CertificationNewPage` preselecciona query válida e ignora/avisa inválida: **COMPLIANT**
- Ver asistencias inline (datos + empty + loading + error): **COMPLIANT**
- Compartir/Editar disabled con copy honesto: **COMPLIANT**
- Sin DNI completo ni datos inventados: **COMPLIANT**

## Próximo paso recomendado

`sdd-archive` (orquestador). No archive desde apply/re-verify.
