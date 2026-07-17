## Exploration: frontend-alumnos-list-polish (Lista de alumnos — UI polish + botón)

### Current State

**Angular hoy** (`StudentsListPage` + `STUDENTS_SOURCE`):

| Pieza | Estado |
|---|---|
| Header “Registro académico / Alumnos” | Existe (intro genérica; sin CTA) |
| Botón “Nuevo alumno” → `/admin/alumnos/nuevo` | **Ausente** |
| Ruta `/admin/alumnos/nuevo` | **Ausente** (solo `alumnos` y `alumnos/:id`) |
| Buscador | Nombre + `dniMostrar` (spec privacy: **no** apellido/legajo/email) |
| Chips contacto + certificaciones | Existen (`con/sin-email`, `con/sin-cert`) |
| Tabla desktop + cards mobile | Existen |
| Badge “Sin email” + MailWarning | Texto plano (“Sin email” / “Contacto disponible”); **sin icono** |
| Badge cert. válidas + ShieldCheck | Número plano; **sin icono ni estilo v0** |
| Loading / error / empty / sin coincidencias | Texto plano; **sin iconos** ni skeleton; empty sin CTA |
| Vista QA (dev) | Existe |
| `loadGeneration` anti-stale | Existe |
| Specs list | Cubren filtros, paginación 5, estados, detalle links, QA |

**Modelos** (`students.models.ts`):

```ts
Alumno: id, apellido, nombre, dniMostrar, estado, tieneEmail, cursosConAsistencia, certificacionesValidas
```

**Servicios — qué devuelven hoy**

| Campo | In-memory | HTTP (`HttpStudentsService`) | Backend real (`studentDto`) |
|---|---|---|---|
| id / apellidoNombre→split / dniMostrar / estado | Sí | Sí | Sí: `id, apellidoNombre, dniMostrar, estado` |
| `tieneEmail` | Seed booleano real | **Hardcode `false`** | **No existe** (ni columna `email` en `cert_alumnos`) |
| `cursosConAsistencia` | Seed número | **Hardcode `0`** | **No existe** en list DTO |
| `certificacionesValidas` | Seed número | **Hardcode `0`** | **No existe** en list DTO |
| `crear()` en `StudentsService` | **No** | **No** | **Sí**: `POST /admin/alumnos` |

**Contrato POST real (verificado, no inventado)**

- Ruta: `POST /admin/alumnos` (`apps/backend-php/index.php` + `AdminMasterDataService::createStudent`)
- Body: `{ apellidoNombre: string, dni: string, estado?: 'activo'|'inactivo' }`
- Respuesta: `201` + `studentDto` (`id`, `apellidoNombre`, `dniMostrar`, `estado`)
- Requiere `dni_cipher_key` en config; DNI duplicado → `409 CONFLICT`
- **Sin email** en create ni en schema DB

**v0 / prompts / capturas**

- Referencia: `muestra_pagina/components/admin/lista-alumnos.tsx` (+ `app/admin/alumnos/page.tsx`)
- Capturas `alumnos-desktop.png` / `alumnos-375.png`: **sanitizadas** (remiten al código fuente)
- v0: header + `UserPlus` “Nuevo alumno” → `/admin/alumnos/nuevo`; MailWarning “Sin email”; ShieldCheck en certs; BookOpen en cursos; estados con AlertTriangle / Search / Users + CTA empty
- **No hay** página v0 `alumnos/nuevo` en `muestra_pagina/`
- Prompt §16: título Alumnos, botón Nuevo alumno, buscador, filtros, tabla, empty — sin exigir editor

**Specs afectadas**

- `openspec/specs/admin-students-frontend/spec.md` — mock/privacy (sin email literal; búsqueda solo nombre+dniMostrar)
- `openspec/specs/frontend-http-services/spec.md` — GET list/detalle; **no** documenta `crear` alumno aún
- Paridad visual obligatoria vs `muestra_pagina` (`AGENTS.md` frontend)

### Affected Areas

- `students/pages/list/students-list-page.{ts,html,css,spec.ts}` — polish UI + CTA header
- `app.routes.ts` (+ spec) — `alumnos/nuevo` **antes** de `alumnos/:id`
- `students.service.ts` / in-memory / http (+ specs) — agregar `crear(draft)` si se incluye editor
- `students/pages/new/student-editor-page.*` — **nuevo** (si se elige approach con POST)
- `openspec/specs/admin-students-frontend` + `frontend-http-services` — ampliar contrato
- Patrón análogo: `courses/course-editor-page` + `HttpCoursesService.crear`

### Gaps vs v0 (honestos)

| Gap | Notas |
|---|---|
| CTA Nuevo alumno | Falta en Angular |
| Editor `/nuevo` | Falta FE; **POST backend sí existe** |
| Iconos estados / badges | Faltan |
| Email literal en tabla | v0 muestra email; Angular **no debe** (spec privacy) → badge `tieneEmail` sí |
| Legajo en fila | v0 sí; Angular **no debe** |
| Búsqueda por apellido | v0 sí; Angular tests/spec **prohíben** coincidencia por apellido |
| Conteos cursos/certs vía HTTP | Siempre `0` → mentira visual si se estiliza como dato real |
| Skeleton loading | Solo en v0 |

### Approaches

1. **Polish lista + editor mínimo con POST real** — CTA activo; ruta `alumnos/nuevo`; form `apellidoNombre` + `dni` (+ estado opcional); `StudentsService.crear` + HTTP POST; badges: `tieneEmail` con MailWarning solo cuando el booleano es significativo (in-memory); en HTTP placeholder honesto para contacto/cursos/certs (`—` / “Sin dato en API”, idealmente `number \| null` como cursos).
   - Pros: cierra el CTA de v0 con contrato real; alinea con patrón cursos; sin inventar email.
   - Cons: scope mayor (ruta+servicio+página+specs); riesgo >400 LOC si se mezcla polish pesado.
   - Effort: Medium–High

2. **Solo polish lista; botón disabled / handoff** — CTA visible disabled + texto “Alta pendiente de integración” **aunque POST exista**.
   - Pros: diff chico.
   - Cons: **deshonesto** (POST ya existe); peor UX que cursos (“Nuevo curso” ya navega).
   - Effort: Low

3. **Polish lista + CTA a stub vacío** — ruta placeholder sin POST.
   - Pros: paridad de navegación visual.
   - Cons: pantalla muerta; deuda inmediata.
   - Effort: Low–Medium

### Recommendation

**Approach 1**, acotado:

1. **Lista**: header con “Nuevo alumno”; iconos loading/error/empty/sin coincidencias (estilo v0 / cursos polish); badge “Sin email” + warning **solo** con `tieneEmail === false` cuando la fuente aporta el booleano de verdad (seed); en HTTP, placeholder de contacto/cursos/certs honesto (no fingir `0` / “todos sin email”).
2. **Editor**: `student-editor-page` mínimo (apellidoNombre + DNI completo en form de alta admin; respuesta solo `dniMostrar`); sin campo email; redirect a detalle o listado tras `201`.
3. Si el forecast de líneas es alto: **encadenar** PR1 lista+CTA+placeholders, PR2 editor+`crear` (ambos listos para proposal; no disabled falso).

### Risks

- `alumnos/:id` captura `nuevo` si el orden de rutas es incorrecto.
- Hardcodes HTTP `0`/`false` rompen filtros (`sin-email` marca todo; `con-cert` nunca) y badges v0.
- Spec privacy vs v0 (apellido/legajo/email): no portar búsqueda v0 literal.
- Alta admin envía DNI completo al API (correcto); UI listado/detalle admin debe seguir mostrando solo `dniMostrar`.
- Editor sin mock visual v0: hay que diseñar Angular institucional mínimo, no inventar CRM.
- Ampliar `StudentsService` rompe stubs de tests que solo mockean `listar/contar/obtener`.

### Ready for Proposal

**Yes** — hay contrato POST real, referencia v0 clara (código), y gaps de datos listados sin inventar. Orchestrator: proponer ciclo con approach 1 (polish + editor mínimo) y decidir si un PR o cadena 2 PRs según presupuesto 400 LOC.
