# Exploration: audit-p11-alumnos-detail

**Cambio**: `audit-p11-alumnos-detail`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-28
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p11-alumnos-detail`
**Alcance de fase**: detalle `/admin/alumnos/:id` → `student-detail-page.*` (+ contrato mínimo HTTP `obtener`/métricas si hace falta para honesty)
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P11; `openspec/specs/admin-students-frontend/spec.md` (post-archive P9/P10); `openspec/specs/frontend-http-services/spec.md` (`ingreso` → `''`); `muestra_pagina/components/admin/alumno-detalle.tsx` (intención visual; no portar legajo/LEG-*)

## Exploration: Detalle de alumno admin (P11)

### Current State

`StudentDetailPage` es una ficha madura con carga vía `STUDENTS_SOURCE.obtener(id)`, panel de métricas, trayectoria de cursos con estados de certificación y acciones (expediente / emitir), panel opcional de asistencias read-only, y estados de error con Reintentar + volver al listado. `loadGeneration` / `asistenciasGeneration` evitan carreras al cambiar `:id` o reintentar.

| Checklist P11 | Estado hoy | Evidencia |
|---|---|---|
| Trayectoria cursos + estados cert | **OK** | Tabla desktop + cards mobile; badges Emitida / Pendiente / En curso; fechas abreviadas `es-AR` vía `fechasCortas`; vacío honesto sin cursos. Seed in-memory cubre los tres estados. |
| Links a expediente | **OK** | `emitida` + `certificacionId` → `/admin/certificaciones/:id` («Ver certificación»). `pendiente` → `/admin/certificaciones/nueva?alumno=&curso=` (`queryEmitir`). `en-curso` → copy «Disponible al finalizar». CTA «Nueva certificación» con `?alumno=`. Tests de href presentes. |
| Métricas válidas/revocadas | **Parcial** | `cursosConAsistencia` y `certificacionesValidas`: null → «—», número (incl. 0) visible. `certificacionesRevocadas`: computed fuerza `null → 0` (nunca «—»). Acento destructive si > 0. |
| Id inválido | **OK con matices** | No-numérico → «Identificador de alumno inválido.»; 999/null → «Alumno no encontrado.»; shell + «Volver a Alumnos». El mismo panel de error muestra **Reintentar** también en id inválido (click no-op: `parseInt` → NaN). |

**Comportamiento técnico vigente**

- Ruta: `app.routes.ts` → `alumnos/:id` lazy `StudentDetailPage` (después de `nuevo` y `:id/editar`).
- DNI: UI muestra `dniMostrar` completo (test seed `20111222`). Catch de carga usa mensaje genérico sin DNI/token; no hay `console.*` con PII en la página.
- Email en detalle: literal si existe; «Sin email registrado» / «Sin dato…» si no (contrato de detalle distinto del listado con badges).
- HTTP `obtener`: 404 → `null`; otros errores propagan. `toAlumnoDetalle`: métricas vía `optionalCount`; `ingreso: ''` fijo (DTO sin campo; alineado a `frontend-http-services`). Estados cert desconocidos → fallback `'pendiente'`.
- Reintentar/loadGen: presentes en ficha y en panel asistencias; tests cubren Reintentar de asistencias, **no** el de carga principal ni carrera de generación.

**Paridad `muestra_pagina/`**

- v0 inventa `legajo` / `LEG-*` y breadcrumb «Legajo». Angular ya evita `LEG-*` (chip `#{{ id }}` + title honesto) pero **conserva copy «Legajo»** (kicker + título de error «No pudimos cargar el legajo»).
- Intención visual: ficha + métricas + tabla/cards de trayectoria; no portar CTA «Compartir» ni rutas nested de v0 (Angular ya omite Compartir; asistencias son toggle in-page).

**Residuos / gaps (checklist + copy/métricas/tests)**

1. Copy «legajo» inventado: kicker `Legajo`, título de error «…el legajo», clase CSS `kicker-legajo`. Spec canónica: NO DEBE mostrar legajo inventado. Test actual **exige** `toContain('Legajo')` — contradice honesty P9/P10.
2. Métrica revocadas: coerce `null → 0` vs patrón listado/P9 («—» solo si null). Riesgo de afirmar 0 revocadas cuando la API no aportó el conteo.
3. Panel de error único: Reintentar visible en id inválido (acción inútil); conviene distinguir recuperable vs no recuperable.
4. Cobertura de tests: falta error de carga principal + Reintentar; métricas 0 vs — (sobre todo revocadas null); assert de copy **sin** «legajo»/«legajos»; `emitida` sin `certificacionId` (badge sin enlace).
5. Spec canónica ya tiene «Detalle administrativo consistente» (ficha, cursos, id inválido). Falta explicitar: copy sin legajo en detalle; métricas 0 vs — alineadas al listado; Reintentar solo en fallo recuperable; DNI UI / sin PII en mensajes.

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/students/pages/detail/student-detail-page.ts` — métrica revocadas, estados de error, Reintentar/loadGen.
- `apps/frontend-angular/src/app/features/admin/students/pages/detail/student-detail-page.html` — copy sin legajo; métricas; CTAs expediente; panel error.
- `apps/frontend-angular/src/app/features/admin/students/pages/detail/student-detail-page.css` — rename mínimo de `kicker-legajo` si se toca copy.
- `apps/frontend-angular/src/app/features/admin/students/pages/detail/student-detail-page.spec.ts` — alinear asserts (sin Legajo; métricas; Reintentar carga).
- `apps/frontend-angular/src/app/features/admin/students/http-students.service.ts` — **solo si** se confirma mapear `ingreso` o ajustar fallback de `estadoCert` con evidencia staging; no refactor preventivo.
- `openspec/specs/admin-students-frontend/spec.md` — delta MODIFIED/ADDED sobre detalle (copy, métricas, Reintentar).
- **Fuera de alcance**: listado (`students-list-page`), editor (`student-editor-page`), backend PHP, token/QR, rediseño de asistencias hub (P12).

### Approaches

1. **Auditoría quirúrgica in-place (recomendada)** — Cerrar gaps de copy/métricas/error UX/tests del detalle; delta spec del detalle; HTTP solo ante evidencia.
   - Pros: alineado al plan P11; blast radius bajo; checklist mayormente OK; reutiliza loadGen/Reintentar existentes.
   - Cons: no unifica paridad visual residual con v0 (intencional: v0 miente con legajo).
   - Effort: Low–Medium

2. **Paridad / rediseño amplio** — Rehacer layout vs `muestra_pagina` (breadcrumb, CTAs nested, compartir).
   - Pros: más cercanía estética a v0.
   - Cons: scope creep; >400 LOC; reintroduce conceptos prohibidos (legajo) o rutas inexistentes; mezcla P11/P12.
   - Effort: High

3. **Solo delta documental + tests** — Spec + tests sin tocar HTML/TS de copy/métricas.
   - Pros: cero riesgo de UI.
   - Cons: deja «legajo» en UI y coerce de revocadas; tests seguirían afirmando copy incorrecto o quedarían desalineados.
   - Effort: Low

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Checklist P11 como aceptación**
   - Conservar trayectoria cursos + estados cert + links expediente/emitir.
   - Conservar id inválido / no encontrado con vuelta al listado.
   - Conservar DNI completo en UI; mensajes/errores sin DNI ni token.

2. **Copy / métricas / error**
   - Sustituir «legajo»/«Legajo» por ficha/registro/perfil (p. ej. kicker «Ficha» o solo `#id`; título de error sin «legajo»).
   - Alinear `certificacionesRevocadas` a null → «—», 0 → `0` (como válidas/cursos).
   - Reintentar solo en fallo recuperable de `obtener`; id inválido: solo volver (sin botón inútil).

3. **Tests**
   - Invertir assert de Legajo → omitir legajo/legajos; añadir carga fallida + Reintentar; métricas null/0.

4. **Spec**
   - Delta en `admin-students-frontend` sobre «Detalle administrativo consistente» (+ escenarios métricas/Reintentar/copy si hace falta).

5. **HttpStudentsService**
   - No tocar salvo evidencia (p. ej. API empieza a enviar `ingreso`). Mantener `ingreso: ''` documentado.

6. **Fuera de P11**
   - Listado, editor (P10 cerrado), hub asistencias (P12), backend, token/QR.

### Questions (para propose)

1. ¿Se confirma eliminar toda mención a «legajo»/«Legajo» en el detalle (recomendado: **sí**, alineado a P9/P10 y spec canónica)?
2. ¿`certificacionesRevocadas` null debe mostrar «—» (recomendado: **sí**, paridad listado) o se acepta coerce a 0?
3. ¿Id inválido debe ocultar Reintentar y dejar solo «Volver a Alumnos» (recomendado: **sí**)?
4. ¿`ingreso` vacío en API real se muestra como celda vacía / «—», o queda fuera de P11 hasta que el backend lo exponga?

### Risks

- Ampliar a listado/editor o «arreglar» HTTP/ingreso backend sin contrato → scope creep y presupuesto 400 LOC.
- Reintroducir LEG-* o enmascarar DNI en UI (viola D0 / hard rules).
- Dejar tests que afirman «Legajo» tras cambiar copy → CI rojo o falso verde si no se actualizan.
- Fallback `estadoCert` desconocido → `'pendiente'` puede ofrecer «Emitir» indebido si la API manda un valor nuevo (p. ej. revocado por curso); documentar, no inventar estado «revocada» en trayectoria sin diseño.
- Panel asistencias es accesorio útil; no debe convertirse en rediseño P12.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `student-detail-page.*`: checklist P11, copy sin legajo, métricas 0 vs —, Reintentar solo recuperable, tests y delta spec de detalle; HTTP solo ante evidencia; sin listado/editor/backend.
