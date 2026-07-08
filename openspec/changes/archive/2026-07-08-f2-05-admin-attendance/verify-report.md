## Verification Report

**Change**: `f2-05-admin-attendance`  
**Version**: N/A  
**Mode**: Standard, Strict TDD desactivado  
**Fecha**: 2026-07-08  
**Artifact store**: OpenSpec + Engram

### Resumen ejecutivo

Verificación aprobada para la implementación Angular F2-05 de Asistencias admin. Los tests y el build pasan; las rutas, proveedores, lista, marcado, conteos visibles, protección de route reuse y checks negativos quedan cubiertos por evidencia runtime. Quedan como trabajo de cierre `sdd-archive` y la actualización documental final de `docs/frontend/00-angular20-port-v0.md`.

### Completeness

| Métrica | Valor |
|---|---:|
| Tasks total | 22 |
| Tasks completas | 20 |
| Tasks incompletas | 2 |
| Implementación core incompleta | 0 |
| Pendiente de cierre | 5.1 documentación frontend y 5.3 `sdd-archive` |

### Scope y estado Git

| Check | Resultado |
|---|---|
| Rama | `frontend/admin-attendance` |
| Diff tracked | 11 archivos, 324 altas / 90 bajas antes de excluir `.atl`; 10 archivos, 248 altas / 29 bajas excluyendo `.atl/skill-registry.md` |
| Untracked esperado | `apps/frontend-angular/src/app/features/admin/attendances/**`, OpenSpec F2-05 y este `verify-report.md` |
| Drift fuera de alcance | `.atl/skill-registry.md` modificado y `openspec/changes/f2-05-admin-attendance/.atl/skill-registry.md` untracked: excluidos de evidencia/staging |
| Alcance intencional | Angular frontend admin + OpenSpec F2-05. Sin backend, deploy, base, material privado, dependencias ni entorno |

### Review-size gate

| Métrica | Valor |
|---|---:|
| Presupuesto de revisión | 1.500 líneas cambiadas |
| Diff real estimado, excluyendo `.atl` | 2.870 líneas cambiadas (2.841 altas / 29 bajas, incluye código frontend, OpenSpec untracked y este reporte) |
| Estado | ⚠️ Overrun aceptado |
| Decisión | `size:exception` aprobada por Matías antes de apply, registrada en Engram `Accepted F2-05 size exception before apply` |

### Build & Tests Execution

**Tests**: ✅ Passed

```text
cd apps/frontend-angular && npm run test:ci
Resultado: TOTAL: 315 SUCCESS
Incluye: no-focused-tests ok, specs de rutas, provider ATTENDANCE_SOURCE, lista, marcado, route reuse out-of-order, checks negativos.
```

**Build**: ✅ Passed

```text
cd apps/frontend-angular && npm run build
Resultado: Application bundle generation complete.
Initial total: 310.43 kB raw / 89.66 kB transfer.
Lazy chunks relevantes: attendance-marking-page 11.44 kB; attendances-list-page 7.48 kB.
```

**Coverage**: ➖ No disponible; el proyecto no reporta cobertura en `test:ci`.

### Negative checks

| Check | Evidencia | Resultado |
|---|---|---|
| Sin `X-Admin-Key` / headers admin exactos | Python scan sobre 9 archivos fuente no-spec de `features/admin/attendances` + chunks dist `attendance-marking-page` y `attendances-list-page` | ✅ 0 matches |
| Sin storage/cookies/IndexedDB | Mismo scan + specs `__checks__/no-secrets.spec.ts` en `test:ci` | ✅ 0 matches |
| Sin HTTP/fetch/HttpClient | Mismo scan + specs runtime `no llama fetch` | ✅ 0 matches |
| Sin DNI completo/email/token-like/legajo/matrícula | Mismo scan, comentarios TS excluidos; `no-real-data.spec.ts` valida `dniMostrar` `XX****XX` | ✅ 0 matches |

### Spec Compliance Matrix

| Requirement / Scenario | Evidencia runtime | Resultado |
|---|---|---|
| `admin-attendances-frontend` — acceso con sesión mock a `/admin/asistencias` y ruta profunda | `app.routes.spec.ts`: runtime instancia `AttendancesListPage` y `AttendanceMarkingPage` vía route injector | ✅ COMPLIANT |
| `admin-attendances-frontend` — acceso sin sesión mock | `app.routes.spec.ts`: `/admin/asistencias` redirige a `/admin/login` | ✅ COMPLIANT |
| Lista de fechas asistibles con conteos demo | `attendances-list-page.spec.ts`: 11 tarjetas, excluye canceladas, `presentes/total`, curso 4 `[7,8]`, curso 1 total `13` | ✅ COMPLIANT |
| Marcado de presentes, guardar y descartar en memoria | `attendance-marking-page.spec.ts`: checkboxes, guardar persiste 3 presentes, descartar restaura baseline | ✅ COMPLIANT |
| Cambio de URL actualiza datos | `attendance-marking-page.spec.ts`: route reuse curso 1/fecha 11 → curso 2/fecha 21 recarga datos | ✅ COMPLIANT |
| Carga obsoleta ignorada | `attendance-marking-page.spec.ts`: resolución out-of-order conserva curso 2 | ✅ COMPLIANT |
| Frontera segura sin red/storage/secretos/datos sensibles | `__checks__`, runtime `fetch` spy y scan fuente/dist | ✅ COMPLIANT |
| Enlace desde detalle de curso | `course-detail-page.html/spec.ts`: link `Tomar asistencia` a `/admin/cursos/:id/fechas/:fechaId/asistencias` con `aria-label` | ✅ COMPLIANT |
| Sidebar/dashboard activan Asistencias y preservan Certificaciones como handoff | `sidebar-admin.ts/spec.ts`, `admin-dashboard-page.html/spec.ts` | ✅ COMPLIANT |
| Documentación y handoff final | Pendiente de `sdd-archive`: `docs/frontend/00-angular20-port-v0.md` aún no fue actualizado en este ciclo | ⚠️ PARTIAL |

**Compliance summary**: 9/10 grupos compliant; 1/10 partial por cierre documental pendiente de archive.

### Correctness (Static Evidence)

| Requisito | Estado | Notas |
|---|---|---|
| Rutas/lista/marcado | ✅ Implementado | `app.routes.ts` agrega `asistencias` y `cursos/:id/fechas/:fechaId/asistencias` en orden seguro. |
| Provider `ATTENDANCE_SOURCE` | ✅ Implementado | Provider route-level junto a `COURSES_SOURCE`; test de regresión falla si se quita. |
| Route reuse `loadGen` | ✅ Implementado | `AttendanceMarkingPage` usa `effect()` + `loadGen`; test out-of-order passed. |
| Conteos visibles | ✅ Implementado | `AttendancesListPage` deriva `presentes/total` desde `ATTENDANCE_SOURCE`; HTML muestra `Presentes`. |
| Datos enmascarados | ✅ Implementado | `dniMostrar` formato `XX****XX`; sin campos reales en `AsistenciaAlumno`. |
| Link detalle curso | ✅ Implementado | Cada fecha tiene `Tomar asistencia` con ruta profunda y `aria-label`. |
| Activación sidebar/dashboard | ✅ Implementado | `Asistencias` link real; `Certificaciones` sigue placeholder. |

### Coherence (Design)

| Decisión de diseño | ¿Seguida? | Notas |
|---|---|---|
| Mock-only, sin HTTP/storage/deps | ✅ Sí | Sin cambios en `package.json`, backend, deploy ni environments. |
| Dos rutas admin | ✅ Sí | `/admin/asistencias` + ruta profunda por fecha. |
| Orden seguro antes de `cursos/:id` y wildcard | ✅ Sí | Cubierto por `app.routes.spec.ts`. |
| `ATTENDANCE_SOURCE` route provider | ✅ Sí | Runtime y regresión cubiertos. |
| `effect()` + `loadGen` anti-stale | ✅ Sí | Cubierto por test out-of-order. |
| Reuso de tokens/primitivos F1-02 | ✅ Sí | UI usa CSS existente, checkbox nativo, `<dl>`, `<output aria-live>` y `<p role="alert">` nativos; no Tailwind. No usa `appCampoDato` ni `BandaEstado` en esta capacidad. |

### Issues Found

**CRITICAL**: None.

**WARNING**:
- El diff real supera el presupuesto de 1.500 líneas; aceptado por `size:exception` previa.
- `docs/frontend/00-angular20-port-v0.md` y `sdd-archive` siguen pendientes; corresponde cerrarlos en la próxima fase.
- `.atl/skill-registry.md` y `openspec/changes/f2-05-admin-attendance/.atl/skill-registry.md` son drift de tooling fuera de alcance; no stagear.

**SUGGESTION**:
- Resuelto en post-PR review: removido el `void marcados` residual en `AttendanceMarkingPage.guardar()`; el contrato real (`marcar()` recibe set completo) quedó documentado en el código.

### Verdict

**PASS WITH WARNINGS**

La implementación core cumple specs y diseño con evidencia runtime. Las advertencias corresponden a tamaño aceptado, documentación/archive pendiente y drift `.atl` fuera de alcance.
