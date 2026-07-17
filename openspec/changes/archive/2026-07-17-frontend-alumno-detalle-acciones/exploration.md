## Exploration: Detalle de alumno (habilitar acciones)

### Current State

**v0** (`muestra_pagina/components/admin/alumno-detalle.tsx`): CTAs activos como links — Nueva certificación → `/admin/alumnos/:id/certificaciones/nueva`; Compartir → `.../entregar-certificado`; Ver asistencias → `.../asistencias`; Editar → `.../editar`. Por fila pendiente: Emitir → `.../nueva?curso=`. Capturas presentes: `muestra_pagina/capturas/alumno-desktop.png`, `alumno-375.png`, `detalle-desktop.png`, `detalle-360.png`.

**Angular** (`student-detail-page.*`): ficha + cursos carga vía `STUDENTS_SOURCE.obtener(id)`. Acciones:

| Acción | Estado hoy | Motivo UI |
|--------|------------|-----------|
| Nueva certificación | `disabled` | “fase posterior” |
| Compartir por canal externo | `disabled` | F5-04 Entrega manual |
| Ver asistencias | `disabled` | F2-05 Asistencias (handoff **obsoleto**: F2-05 ya archivado) |
| Editar datos | `disabled` | “fase posterior” |
| Emitir certificación (fila `pendiente`) | `disabled` | “fase posterior” |
| Ver certificación (fila `emitida`) | **habilitado** | `/admin/certificaciones/:id` |

Specs actuales esperan Nueva certificación y Emitir **disabled**, más textos F5-04/F2-05.

**Emisión (Ciclo 2)**: `/admin/certificaciones/nueva` existe y emite. `CertificationNewPage` **no** lee query params: `alumnoId`/`cursoId` solo por `<select>`. Design/verify diferían preselección `alumnoId` como nice-to-have.

**Asistencias**: backend `GET /admin/asistencias?cursoId=&alumnoId=` — ambos opcionales; `listAttendances` filtra por `alumno_id` solo. Adapter Angular: `listarAsistenciasPorPar(cursoId, alumnoId)` exige ambos. No hay `listar…PorAlumno`. `AttendancesListPage` (`/admin/asistencias`) es por curso/fecha, sin filtro alumno ni query. No existe ruta `/admin/alumnos/:id/asistencias`.

**Editar**: `StudentEditorPage` solo alta (`crear`). Backend: `GET /admin/alumnos/:id`, `PATCH .../estado`; **sin** PATCH de datos personales.

**Compartir**: entrega real es por certificación (`/admin/certificaciones/:id/entrega`, F5-04), no por legajo.

### Affected Areas

- `students/pages/detail/student-detail-page.{html,ts,spec.ts}` — habilitar CTAs; actualizar tests/motivos
- `certifications/pages/new/certification-new-page.ts` (+spec) — preselect `?alumno=` / opcional `?curso=`
- `attendances/...` — solo si se habilita Ver asistencias: seam `listarAsistenciasPorAlumno` + destino UI
- `app.routes.ts` — solo si se agrega ruta legajo-asistencias

### Approaches

1. **Habilitar solo emisión (mínimo)** — Links a `/admin/certificaciones/nueva?alumno=:id` (+ fila pendiente con `&curso=:cursoId`); implementar lectura de query en `CertificationNewPage`. Compartir/Editar/Asistencias siguen disabled con motivos honestos.
   - Pros: bajo acoplamiento; cierra nice-to-have Ciclo 2; alinea focus principal
   - Cons: Ver asistencias sigue placeholder pese a endpoint backend
   - Effort: Low

2. **Emisión + asistencias honestas** — (1) + `listarAsistenciasPorAlumno` HTTP/mock + vista solo-lectura (sección en detalle o ruta liviana) usando `GET ?alumnoId=`
   - Pros: cumple focus usuario sin mentir; corrige handoff F2-05 obsoleto
   - Cons: más UI/tests; no es paridad v0 de ruta anidada
   - Effort: Medium

3. **Paridad v0 de rutas anidadas** — `/admin/alumnos/:id/{certificaciones/nueva,asistencias,editar,entregar}`
   - Pros: URLs como muestra
   - Cons: editar/compartir sin backend útil; reescritura de rutas sin ganancia
   - Effort: High — **no recomendado**

### Recommendation

**Approach 2 acotado**, o **Approach 1** si el presupuesto del ciclo prioriza solo emisión:

1. **Habilitar** “Nueva certificación” → `/admin/certificaciones/nueva?alumno=:id` (y “Emitir” en fila pendiente con `curso`).
2. **Agregar** preselección query en `CertificationNewPage` (`alumno`, opcional `curso`) tras cargar catálogos; invalid → ignore + select vacío.
3. **Ver asistencias**: habilitar solo con seam `alumnoId` + destino solo-lectura; **no** enlazar al listado global sin filtro.
4. **Mantener disabled**: Compartir (entrega es por cert, F5-04) y Editar (sin API de update de datos).
5. Actualizar motivos/specs (retirar “F2-05” como bloqueo).

### Risks

- Specs actuales afirman botones disabled: hay que invertir asserts.
- Query param sin soporte en `nueva` deja el link “habilitado” pero sin preselect (UX incompleta).
- Enlazar `/admin/asistencias` sin filtro = acción falsa.
- `certificacionesRevocadas` computed es heurística frágil (fuera de scope salvo que se toque).
- Motivo “F5-04” en compartir a nivel alumno es impreciso: F5-04 es por `:id` de certificación.

### Ready for Proposal

**Yes.** Scope claro: emisión + query preselect obligatorio; asistencias solo con adapter+UI o defer explícito; editar/compartir disabled honestos.
