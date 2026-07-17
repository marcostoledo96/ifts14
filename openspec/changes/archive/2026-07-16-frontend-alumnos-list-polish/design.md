# Design: Lista alumnos polish + Nuevo alumno

## Technical Approach

Ciclo único Angular 20: polish in-place de `StudentsListPage` + página `student-editor-page` (alta) + seam `StudentsService.crear`. Cumple REQ-SLIST-* y REQ-SEDIT-*. Sin wizard; sin campos fantasma.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|--------------|-----------|
| Scope | Lista polish + editor POST | Solo polish / stub | POST real existe; CTA activo |
| Nullables | `tieneEmail: boolean \| null`; conteos `number \| null` | Hardcode false/0 | Honesty HTTP; filtros no mienten |
| Estado UI | Sin selector; omitir o `activo` | Toggle estado | Lock: default activo |
| Handoff | Detalle `:id` | Volver a lista | Lock orquestador |
| Iconos | SVG inline | lucide | Paridad sin deps |
| DNI create | Input completo → API | Solo máscara | Contrato POST; lista sigue `dniMostrar` |

## Data Model

```ts
interface Alumno {
  id: number;
  apellido: string;
  nombre: string;
  dniMostrar: string;
  estado: "activo" | "inactivo";
  tieneEmail: boolean | null;
  cursosConAsistencia: number | null;
  certificacionesValidas: number | null;
}

interface AlumnoDraft {
  apellidoNombre: string;
  dni: string;
  estado?: "activo" | "inactivo";
}
```

HTTP `toAlumno`: `tieneEmail/cursos/certs → null`. Seed: valores boolean/number reales.

## Data Flow

```
List
  STUDENTS.listar() → map nullables → filtros (null no match) → tabla/cards
  CTA → /admin/alumnos/nuevo

Create
  validate apellidoNombre + dni
  guardando=true
  STUDENTS.crear({ apellidoNombre, dni })  // estado omitido → backend default
  201 → Router /admin/alumnos/:id
  400|409|5xx → error visible (sin DNI en copy); guardando=false
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `students.models.ts` | Modify | nullables + `AlumnoDraft` |
| `students.service.ts` | Modify | `crear(draft)` |
| `http-students.service.ts` (+spec) | Modify | null map + POST |
| `in-memory-students.service.ts` (+spec) | Modify | `crear` + seed mutable |
| `pages/list/students-list-page.*` | Modify | CTA, badges, SVG, helpers |
| `pages/new/student-editor-page.*` | Create | Form + TDD |
| `app.routes.ts` (+spec) | Modify | `alumnos/nuevo` before `:id` |
| Specs openspec admin-students / http | Modify on archive | Deltas en change |

## Route Order

1. `alumnos/nuevo` ← estático **nuevo**
2. `alumnos/:id`
3. `alumnos`

## UI helpers (list)

- `etiquetaContacto(a)` / `mostrarWarningSinEmail(a)`
- `formatoMetrica(n: number | null): string` → número o `—`
- `mostrarShield(a)` ↔ `a.certificacionesValidas != null`

## Testing Strategy

| Layer | What |
|-------|------|
| HTTP | crear body; nullables list; 409 |
| In-memory | crear + list incluye nuevo |
| List page | CTA; badges; SVG states; filtros null |
| Editor | validación; disable; navigate; error sin DNI |
| Routes | `nuevo` ≠ detail |

Focused: `ng test --include=**/students/** --include=**/app.routes.spec.ts --watch=false` (o includes más finos).

## Migration / Rollout

Sin migration. `useRealApi` conmuta mock/HTTP.

## Risks

- Tests HTTP esperan `tieneEmail === false` → actualizar a `null`.
- In-memory seed inmutable hoy → mutar array interno para `crear`.
- Detail page puede asumir boolean; revisar usos de `tieneEmail`/conteos.
