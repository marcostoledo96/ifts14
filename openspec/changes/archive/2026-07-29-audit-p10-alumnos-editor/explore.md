# Exploration: audit-p10-alumnos-editor

**Cambio**: `audit-p10-alumnos-editor`
**Tipo**: exploration (sin implementación)
**Proyecto**: `ifts14`
**Fecha**: 2026-07-28
**Almacén**: openspec (+ Engram)
**Rama**: `audit/p10-alumnos-editor`
**Alcance de fase**: editor `/admin/alumnos/nuevo` y `/admin/alumnos/:id/editar` → `student-editor-page.*` (+ contrato mínimo `StudentDuplicateError` / HTTP create-update si hace falta)
**Referencias**: `docs/qa/PLAN-AUDITORIA-EXHAUSTIVA-STAGING-1.0.md` §P10; `openspec/specs/admin-students-frontend/spec.md` (post-archive P9); `muestra_pagina` (solo enlace a `/editar` en detalle; sin pantalla editor); patrón `course-editor-page` (mode input + `withComponentInputBinding`)

## Exploration: Editor de alumnos admin (P10)

### Current State

`StudentEditorPage` es un editor maduro compartido create/edit: inputs `mode` + `id` vía `withComponentInputBinding()` (`data.mode` en rutas; param `:id` en editar). Alta admite lote (varias filas); edición carga una fila desde `obtener` y al guardar navega al detalle. Validación inline de apellido/nombre/DNI/email; conflictos 409 vía `StudentDuplicateError` (servicio + resumen de lote / enlace en edit).

| Checklist P10 | Estado hoy | Evidencia |
|---|---|---|
| Validación DNI / email / nombre | **OK** | `validar()`: apellido/nombre obligatorios; DNI 6–10 dígitos (strip no-dígitos); email opcional con regex simple; DNI repetido entre filas del lote. Tests create cubren vacío / email opcional / body mínimo. |
| Errores duplicado / 409 (`StudentDuplicateError`) | **OK con matices** | Create: lote clasifica 409 → «Ya estaban registrados» + link si hay `existingId`. Edit: catch externo → mensaje sin DNI + «Ver perfil» si hay id. HTTP `crear` mapea 409→`StudentDuplicateError` (con fallback `findIdByDni`); `actualizar` solo si el envelope trae `existingStudentId` (sin fallback listado). Backend suele enviar `existingStudentId`. |
| create vs edit | **OK en código; tests sesgados a create** | Copy/CTAs distintos; alta multi-fila vs edit single; create no navega (resumen lote); edit navega a `/admin/alumnos/:id`. Spec del componente **sin** casos edit (carga, 409 update, cancelar). Rutas: `alumnos/nuevo` antes que `:id`. |

**Comportamiento técnico vigente**

- Rutas: `app.routes.ts` → `alumnos/nuevo` (`mode: create`), `alumnos/:id/editar` (`mode: edit`); orden estático antes de detalle.
- `mensajeErrorAlta`: mensajes genéricos; **no** incluye DNI tipado (test explícito). UI sí muestra DNI completo en resumen de lote (hard rule UI).
- Fuentes: `STUDENTS_SOURCE` → HTTP o in-memory; ambos lanzan `StudentDuplicateError` en DNI duplicado.
- Spec canónica post-P9: requisitos de alta con email opcional + escenario «Alta con DNI duplicado» (ubicado bajo «Búsqueda y filtros» — drift de organización). **No** hay requirement explícito de modo edit / lote / copy del editor.

**Paridad `muestra_pagina/`**

- No hay pantalla React de alta/edición de alumno; el detalle v0 enlaza a `/admin/alumnos/:id/editar`.
- Intención: formulario admin prolijo (labels, errores `aria-invalid`/`role="alert"`, kicker «Registro académico»), no portar React.
- Residuo honesty vs P9: ayuda de email dice «legajo del alumno» aunque el listado ya eliminó «legajo» inventado.

**Residuos / gaps (checklist + a11y/copy)**

1. Copy ayuda email: «…disponible en el **legajo** del alumno» — contradice honesty P9.
2. Error de carga: mensaje «…Reintentá.» sin botón Reintentar (solo «Volver a Alumnos»).
3. Cobertura de tests: create/lote/409 create OK; **falta** edit (setInput mode/id, `obtener`→form, `actualizar`, 409 edit + link, id inválido/not-found).
4. Spec canónica incompleta para editor (edit, lote, copy sin legajo, a11y mínima).
5. HTTP `actualizar` 409 sin `existingStudentId`: queda sin link (raro si backend siempre envía id).

### Affected Areas

- `apps/frontend-angular/src/app/features/admin/students/pages/new/student-editor-page.ts` — validación, create/edit, 409, mensajes seguros.
- `apps/frontend-angular/src/app/features/admin/students/pages/new/student-editor-page.html` — copy, a11y de campos, resumen lote, estados carga/error.
- `apps/frontend-angular/src/app/features/admin/students/pages/new/student-editor-page.css` — solo si hace falta ajuste mínimo de estados/errores.
- `apps/frontend-angular/src/app/features/admin/students/pages/new/student-editor-page.spec.ts` — ampliar create vs edit / 409 / copy.
- `apps/frontend-angular/src/app/features/admin/students/student-duplicate.error.ts` — contrato compartido (tocar solo si hace falta).
- `apps/frontend-angular/src/app/features/admin/students/http-students.service.ts` — **solo si** se confirma gap de 409 en update sin `existingStudentId`.
- `openspec/specs/admin-students-frontend/spec.md` — delta ADDED/MODIFIED para editor (create/edit/409/copy).
- **Fuera de alcance**: listado (`students-list-page`), detalle (`student-detail-page` salvo enlace ya existente), backend PHP, token/QR, chip email del listado.

### Approaches

1. **Auditoría quirúrgica in-place (recomendada)** — Cerrar gaps de copy/a11y/tests del editor; delta spec del editor; HTTP solo ante evidencia de 409 update sin id.
   - Pros: alineado al plan P10; blast radius bajo; reutiliza `StudentDuplicateError` y tests create.
   - Cons: no rediseña UX de lote ni paridad visual inexistente en v0.
   - Effort: Low–Medium

2. **Paridad / rediseño amplio** — Rehacer layout vs curso editor o inventar UI v0 de alta; cambiar flujo lote→navegación.
   - Pros: unificación estética más agresiva.
   - Cons: scope creep; >400 LOC; sin referencia visual de editor en muestra; riesgo de romper lote ya testeado.
   - Effort: High

3. **Solo delta documental + tests** — Spec + tests sin tocar copy HTML.
   - Pros: cero riesgo de UI.
   - Cons: deja «legajo» en ayuda email y mensaje «Reintentá» sin acción.
   - Effort: Low

### Recommendation

Adoptar **enfoque 1**. Alcance propuesto para `sdd-propose`:

1. **Checklist P10 como aceptación**
   - Conservar validación DNI/email/nombre (y DNI completo en UI del resumen).
   - Conservar 409 → mensaje sin PII + enlace a `/admin/alumnos/{id}` cuando hay id.
   - Conservar create (lote + resumen, sin navegar) vs edit (carga + PATCH + navegar a detalle).

2. **Copy / a11y / prolijidad**
   - Sustituir «legajo» en ayuda de email por ficha/registro/perfil.
   - Decidir: botón Reintentar en `errorCarga` recuperable, o suavizar copy sin «Reintentá» si solo se ofrece volver.

3. **Tests**
   - Añadir escenarios edit (carga OK, no encontrado, 409 update con link) sin tocar listado/detalle.

4. **Spec**
   - Delta en `admin-students-frontend`: requirement(s) de editor create/edit, validación, 409/`StudentDuplicateError`, DNI completo UI, sin PII en mensajes de error; reubicar o referenciar el escenario de duplicado fuera de «Búsqueda y filtros» si se modifica ese bloque.

5. **HttpStudentsService**
   - No refactor preventivo. Solo fallback `findIdByDni` en `actualizar` si smoke/staging muestra 409 sin `existingStudentId`.

6. **Fuera de P10**
   - Listado, detalle (copy «Legajo»/#id en detalle es P11), backend, token/QR.

### Questions (para propose)

1. ¿Se confirma reemplazar «legajo» en la ayuda de email del editor en este ciclo (recomendado: **sí**, alineado a P9)?
2. ¿Error de carga en edit debe ofrecer **Reintentar** (como listado/detalle) o basta «Volver a Alumnos» con copy ajustado?
3. ¿El resumen de lote (create multi) se mantiene como está, o se espera navegar al detalle cuando el lote es de un solo creado exitoso?
4. ¿Se toca `HttpStudentsService.actualizar` para fallback de 409, o se asume que el backend siempre envía `existingStudentId`?

### Risks

- Ampliar alcance a detalle/listado (copy «Legajo» en detalle) y mezclar P10 con P11.
- «Arreglar» mostrando menos DNI en UI del resumen (viola hard rule DNI completo en UI).
- Introducir DNI/email en `console`/mensajes de error genéricos al mapear HTTP crudo.
- Tests de edit mal cableados sin `setInput('mode'|'id')` → falsos verdes.
- Presupuesto 400 LOC si se reescribe el lote o el HTTP sin necesidad.

### Ready for Proposal

**Yes.** El orquestador puede lanzar `sdd-propose` con alcance quirúrgico sobre `student-editor-page.*`: checklist P10, copy sin legajo, decisión Reintentar vs copy, tests create+edit/409, delta spec editor; HTTP solo ante evidencia; sin listado/detalle/backend.
