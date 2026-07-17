## Exploration: frontend-cursos-list-polish (Lista de cursos — UI polish)

### Current State

**Angular hoy** (`CoursesListPage` + `COURSES_SOURCE`): listado funcional post F4-03 / HTTP P5-02.

| Pieza | Estado |
|---|---|
| Header “Archivo académico / Cursos / Nuevo curso” | Existe |
| Buscador q + chips Con/Sin fechas | Existe |
| Filtro estado | `<select>` con `borrador\|activo\|cerrado\|archivado\|todos` (no chips) |
| Tabla desktop + cards mobile | Existe |
| Columnas Presentes / Certificaciones | Placeholders honestos `—` + title/sr-only “Dato disponible con integración real” |
| Badge estado | Texto plano `.estado-chip` (solo `.estado-activo` tipado); sin dot ni borde v0 |
| Acento lateral / franja mobile | Ausente |
| Loading / error / empty / sin coincidencias | Texto plano; sin skeleton ni iconos; empty sin CTA “Crear primer curso” |
| Vista QA (Con datos/Cargando/Error/Sin cursos) | Ausente (sí en certs list y v0) |
| Banner demo | Existe |
| `loadGeneration` anti-stale | Existe |
| Specs | Cubren select estado, chips fechas, placeholders implícitos vía markup, error/retry |

**Modelos** (`courses.models.ts`):

```ts
Curso: id, codigo, nombre, estado, createdAt, updatedAt, cuatrimestre,
       cantidadFechas, alumnosPresentes?: number | null, certificaciones?: number | null
EstadoCurso: 'borrador' | 'activo' | 'cerrado' | 'archivado'
CursosFiltros: estado?, q?, conFechas?
```

**Servicios — qué devuelven hoy**

| Campo | In-memory | HTTP (`HttpCoursesService`) | Backend real (`AdminMasterDataService::courseDto`) |
|---|---|---|---|
| id/codigo/nombre/estado/timestamps | Sí | Sí (DTO) | Sí: `id, codigo, nombre, estado, createdAt, updatedAt` |
| cuatrimestre | Seed string | Hardcode `'Sin programar'` | **No existe** en API |
| cantidadFechas | `fechas.length` | `0` en listado (salvo filtro `conFechas` que hace N×`GET …/fechas`) | **No** en list; hay `GET /admin/cursos/{id}/fechas` |
| alumnosPresentes | Siempre `null` | Siempre `null` | **No existe** |
| certificaciones | Siempre `null` | Siempre `null` | **No existe** |

Tests ya fijan: `alumnosPresentes`/`certificaciones` → `null` (`courses.service.spec.ts`, `http-courses.service.spec.ts`).

Spec vigente `openspec/specs/admin-courses-frontend/spec.md`: métricas presentes/certificaciones **DEBEN** ser placeholders explícitos y **NO** consultar otros features.

**Referencia v0** (`muestra_pagina/components/admin/lista-cursos.tsx` + capturas `cursos-desktop.png` / `cursos-375.png` + prompt §13):

- Chips Estado: **Activos / Inactivos** (binario mock) con dots; chips Fechas Con/Sin.
- Tabla: métricas numéricas inventadas en seed; badge ACTIVO/INACTIVO con dot+borde; barra lateral teal vs muted; mobile card con franja superior + iconos métricas + botones icono.
- Estados: skeleton loading, error con AlertTriangle, empty FolderOpen + CTA, sin-resultados Search.
- Vista QA demo (solo mock visual).

**Prompt §13** pide filtros activos/inactivos + columnas de conteos. El contrato real del producto usa **4 estados** (`borrador|activo|cerrado|archivado`), no el binario v0.

**AGENTS.md frontend**: Angular 20, no portar React literal, paridad visual vía `muestra_pagina/`, servicios/modelos claros hacia API.

### Qué existe vs qué falta (gap v0)

| Elemento v0 / plan | Angular | Acción ciclo |
|---|---|---|
| Chips estado con dots | Select | Reemplazar por chips toggle |
| Labels Activos/Inactivos | N/A (4 estados reales) | Mapear a **Activos / Cerrados / Archivados** (+ decidir Borrador) |
| Chips fechas | Ya | Mantener / alinear estilo |
| Badge estado + dot + borde | Parcial | Polish CSS + etiqueta humana |
| Acento lateral fila / franja card | No | Agregar |
| Métricas Presentes/Certif. números | `—` honestos | **Mantener** (API no expone) |
| Métrica Fechas con unidad | Número crudo | Mostrar `N fechas` si se quiere paridad copy |
| Loading skeleton + iconos empty/error | Texto | Portar patrón visual (icons SVG/CSS, no lucide React) |
| Empty CTA “Crear primer curso” | Solo texto | Agregar link |
| Vista QA | No | Opcional (patrón certs); no bloqueante |
| Icon-only actions | Links texto | Opcional polish (accesible `aria-label` ya existe) |

### Datos reales vs placeholders honestos

**Reales / derivados disponibles sin inventar backend**

- `nombre`, `codigo`, `estado` (4 valores)
- `cantidadFechas` en mock; en HTTP list suele ser `0` hasta enriquecer (costoso N+1) — **no inventar conteo**
- Filtros q / estado / conFechas (client-side; `conFechas` HTTP ya documentado como N fetches)

**Placeholders obligatorios (gap documentado — NO inventar)**

- `alumnosPresentes` / `certificaciones`: API list y DTO **no** los incluyen; servicios fuerzan `null`; UI debe seguir mostrando `—` (o copy “disponible con integración”) hasta un ciclo backend que agregue agregados.
- `cuatrimestre`: no en API; mock seed sí; HTTP → `'Sin programar'`.

**Prohibido en este ciclo**: inventar números en seed HTTP, agregar N+1 a asistencias/certificados para “parecer” v0, o relajar el spec de placeholders sin cambio de contrato backend.

### Affected Areas

- `apps/frontend-angular/.../courses/courses-list-page.{ts,html,css,spec.ts}` — UI polish principal
- `apps/frontend-angular/.../courses/courses.models.ts` — sin campos nuevos inventados; solo uso honesto de `null`
- `http-courses.service.ts` / `in-memory-courses.service.ts` — **fuera de alcance** salvo bug de mapeo; no fabricar conteos
- `openspec/specs/admin-courses-frontend/spec.md` — posible delta menor (chips vs select; estados empty enriquecidos); placeholders se mantienen
- Referencia solo lectura: `muestra_pagina/components/admin/lista-cursos.tsx`, capturas, prompt §13
- Patrón hermano: `certifications-list-page` (chips `aria-pressed`, vista QA, skeleton)

### Approaches

1. **UI polish only (recomendado)** — Chips Activos/Cerrados/Archivados (+ opcional Borrador), badges con dot/borde, acento lateral, estados con iconos/skeleton, CTA empty; métricas siguen `—` cuando `null`.
   - Pros: paridad visual; respeta API y spec; TDD local; bajo acoplamiento
   - Cons: columnas Presentes/Certif. no lucen como captura v0 (gap honesto)
   - Effort: Low–Medium

2. **Fabricar conteos en mock/seed** — Rellenar `alumnosPresentes`/`certificaciones` solo en memoria para “verse bien”.
   - Pros: captura-like en demo
   - Cons: contradice spec, tests HTTP (`null`), y “NO inventar campos backend”; divergencia mock vs HTTP
   - Effort: Low — **rechazar**

3. **Agregar agregados en backend + mapear** — Extender `courseDto` / SQL counts.
   - Pros: cierra gap real
   - Cons: fuera de ciclo UI polish; toca PHP/DB/API; review budget
   - Effort: High — **handoff futuro**, documentar gap aquí

### Recommendation

**Approach 1**: polish visual/a11y de lista alineado a v0 **adaptado a estados reales del backend**.

Chips estado (plan usuario): toggle `activo` / `cerrado` / `archivado` con dots (verde / muted / muted-oscuro). Incluir chip **Borrador** o dejarlo solo vía “todos”/limpieza — decidir en propose (recomendación explore: **incluir Borrador** como 4.º chip para no esconder el 4.º estado del contrato). Mutuamente exclusivos o multi-select: v0 usa `Set` multi; Angular actual es single `estado`. Preferir **toggle single** (como certs list) o multi si se quiere paridad v0 — propose debe fijar uno (recomendación: **single toggle** como certs, menos complejidad + `CursosFiltros.estado?` ya es singular).

Presentes/Certificaciones: si `!= null` mostrar número+unidad; si `null`/`undefined` mantener `—` + a11y copy. Hoy siempre null → gap documentado, no fake.

No tocar shell/sidebar (ciclo aparte). No inventar `cuatrimestre` real.

### Risks

- Spec actual exige placeholders; un propose que “rellene” números sin API rompe contrato.
- HTTP `cantidadFechas=0` en listado puede mostrar “0 fechas” engañoso si se formatea como métrica v0 sin enriquecer — preferir mostrar valor derivado solo cuando se conoce, o dejar número mock-only y en HTTP aceptar 0/omitir hasta ciclo datos.
- Chips Activos/Cerrados/Archivados ≠ labels v0 Activos/Inactivos: documentar en propose/verify como adaptación de contrato, no regresión.
- Tests actuales asumen `<select>` de estado → hay que actualizar specs (TDD).
- Budget CSS page (lista ya ~4.2K) — reutilizar tokens F1-02; evitar duplicar patrones de certs.

### Ready for Proposal

**Yes** — scope UI claro; gap de datos Presentes/Certificaciones documentado y aceptable como placeholder honesto; sin dependencia de cambio backend para cerrar el polish.
