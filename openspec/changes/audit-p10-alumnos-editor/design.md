# Design: Auditoría P10 — editor de alumnos

## Technical Approach

Auditoría quirúrgica in-place sobre `StudentEditorPage` (proposal + explore #1). Conservar validación, lote create, 409/`StudentDuplicateError` y create vs edit. Cerrar gaps: copy sin «legajo»; **Reintentar** en carga recuperable (P8/detalle); tests edit; delta `admin-students-frontend`. HTTP `actualizar` solo si se prueba 409 sin `existingStudentId`. Sin listado, detalle (P11), backend ni rediseño de lote.

## Architecture Decisions

| Decisión | Opciones | Tradeoff | Elección |
|----------|----------|----------|----------|
| Alcance de archivos | Solo editor vs + HTTP/servicio | HTTP ensancha blast radius sin evidencia | **`student-editor-page.*` (+ CSS solo si hace falta)** |
| Copy «legajo» | Diferir vs eliminar | Confirmado orquestador / honesty P9 | **Eliminar** ayuda email (ficha/registro/perfil) |
| Error carga | Solo Volver vs Reintentar+Volver | Mensaje ya dice «Reintentá.» sin acción | **Reintentar** si recuperable + **Volver** siempre |
| Recuperable vs no | Siempre Reintentar vs flag | Id inválido / no encontrado no se curan con retry | **`errorCargaRecuperable`**: true solo en `catch` de `cargarEdicion` |
| Lote create | Navegar si 1 OK vs resumen | Confirmado KEEP | **Resumen lote sin navegar**; edit → detalle |
| HTTP `actualizar` 409 | Fallback `findIdByDni` preventivo vs gate | Create ya tiene fallback; backend suele enviar id | **No tocar** hasta prueba de 409 sin id |
| DNI | Máscara vs completo UI | Hard rule AGENTS | **`dniMostrar` completo** en resumen lote; mensajes/`mensajeErrorAlta` sin DNI |
| Fuente | Cambiar seam vs `STUDENTS_SOURCE` | Patrón vigente | Conservar **HTTP staging / in-memory tests** |

## Data Flow

```
mode+id (input binding)
        │
   edit ──► cargarEdicion(id)
              │
              ├─ id inválido → errorCarga (no recuperable) → Volver
              ├─ obtener → null → no encontrado (no recuperable) → Volver
              ├─ catch → errorCarga + recuperable → Reintentar|Volver
              └─ OK → filas[0] = draft
        │
guardar ──► validar()
        │
   create: loop crear → resultadoLote (DNI UI; 409 → yaRegistrados + link si id)
   edit:   actualizar → navigate /admin/alumnos/:id
              │
              └─ 409 → mensajeErrorAlta + Ver perfil si existingStudentId
```

Gate HTTP (condicional):

```
Prueba 409 update sin existingStudentId
   │
   ├─ con id / rareza aceptable → no tocar http-students.service.ts
   └─ sin id y falta link → mínimo findIdByDni en actualizar (como crear)
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `.../students/pages/new/student-editor-page.ts` | Modify | `errorCargaRecuperable`; `onReintentar()` → `cargarEdicion(id)`; copy/mensajes sin legajo si aplica |
| `.../student-editor-page.html` | Modify | Ayuda email sin «legajo»; botón Reintentar si recuperable + Volver |
| `.../student-editor-page.css` | Modify | Solo si hace falta layout de acciones error (esperable: mínimo o no) |
| `.../student-editor-page.spec.ts` | Modify | Edit: carga OK, no encontrado, id inválido, Reintentar, actualizar→navigate, 409+link; sin legajo; DNI UI; sin PII |
| `.../http-students.service.ts` | Conditional | Fallback `findIdByDni` en `actualizar` solo con evidencia |
| `.../http-students.service.spec.ts` | Conditional | Solo junto al cambio HTTP |
| `openspec/changes/.../specs/admin-students-frontend/spec.md` | Create | Delta editor: create/edit, lote, Reintentar, 409, DNI UI, sin PII; reubicar duplicado si se toca «Búsqueda y filtros» |
| `openspec/changes/.../specs/frontend-http-services/spec.md` | Conditional | Solo si entra el cambio HTTP |

**No modificar**: listado, detalle, backend PHP, token/QR, chip email listado, navegación post-alta (incluso 1 alumno).

## Interfaces / Contracts

Sin cambios de API. Contratos UI a preservar o añadir:

- Create: multi-fila + `resultadoLote`; no navegar.
- Edit: una fila; `actualizar` → `/admin/alumnos/:id`.
- `mensajeErrorAlta`: sin DNI/token; lote UI sí muestra `dniMostrar`.
- 409 → `StudentDuplicateError` + enlace si hay id.
- `errorCargaRecuperable` ↔ Reintentar; id inválido / no encontrado → solo Volver.
- Validación: apellido/nombre; DNI 6–10; email opcional.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Copy sin legajo; Reintentar llama `obtener` de nuevo | `student-editor-page.spec.ts` + stub `STUDENTS_SOURCE` |
| Unit | Edit: carga OK, null→no encontrado, id inválido, `actualizar`+navigate | `setInput('mode'|'id')` |
| Unit | 409 edit con `existingStudentId` → enlace; mensajes sin DNI | stub throw `StudentDuplicateError` |
| Unit | Create lote + DNI completo en resumen (regresión) | asserts existentes + refuerzo |
| Unit | HTTP 409 update sin id (solo si se toca) | `http-students.service.spec.ts` |
| Integration / E2E | — | Fuera; smoke staging opcional para gate HTTP |

## Threat Matrix

N/A — sin routing/shell/subprocess/VCS/PR ni process-integration nuevos. Rutas `nuevo` / `:id/editar` ya existen.

## Migration / Rollout

No migration required. Frontend-only; rollback = revert `student-editor-page.*` (+ HTTP/spec si aplica).

## Open Questions

- Ninguna bloqueante (defaults confirmados).
- Pendiente `sdd-spec`: Given/When/Then del delta editor.
- Pendiente apply: evidencia 409 update sin id → gate HTTP.
