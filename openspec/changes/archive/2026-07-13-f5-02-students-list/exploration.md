# Exploración — f5-02-students-list

> Estado: exploración. Esta fase NO implementa producto.
> Rama activa: `frontend/students-list` (base `3f77fdd` = `Merge pull request #50`, post-F5-01).
> Cambio OpenSpec: `f5-02-students-list`.
> Idioma: español argentino formal, conciso. Artefactos SDD en español por convención del proyecto (`openspec/specs/admin-*/spec.md` están en español). Identificadores de código según convención Angular 20 existente.

## Goal y alcance confirmados

Origen de verdad: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (F0-F6 unificado, semana 5, líneas 1601-1621) y la spec `admin-foundation` (que lista "Alumnos" como ítem de sidebar pendiente de activar).

| Campo | Valor |
|---|---|
| Ciclo | F5-02 — Listado de alumnos |
| Rama sugerida | `frontend/admin-students` (prompt raíz) — en este repo la rama activa es `frontend/students-list`, alias operativo alineado a la F5-02 |
| Objetivo | Activar la entrada `Alumnos` del sidebar (hoy placeholder deshabilitado) e implementar `/admin/alumnos` con datos visibles definidos por spec; **DNI completo solo si la spec lo exige explícitamente en contexto privado/administrativo**. Mock-only, sin backend, sin HTTP, sin storage. |
| Alcance | Lista navegable de alumnos con tabla desktop (≥`md`) y tarjetas mobile (<`md`); búsqueda libre solo sobre nombre y `dniMostrar`; chips de filtro `con-certificaciones` / `sin-certificaciones` / `sin-email` (mutuamente excluyentes los dos primeros); paginación client-side de 5; estados diferenciados (carga, error, vacío total, sin coincidencias); resumen accesible "Mostrando N de M"; limpiar filtros; harness QA conmutable con `isDevMode()` (mismo patrón F5-01); paridad visual con `muestra_pagina/components/admin/lista-alumnos.tsx` (654 líneas) portada a Angular 20 con tokens F1-02; activar sidebar/dashboard hacia `/admin/alumnos`. |
| Fuera de alcance | Detalle de alumno (F5-03); alta/edición real de alumnos; emisión, revocación, PDF, QR, entrega manual; integración HTTP/HttpClient; `X-Admin-Key`; storage/cookies; datos reales; **DNI completo en UI admin**; tokens completos; emails reales; matrículas; UUIDs; legajos plausibles; dependencias nuevas; Tailwind/shadcn/lucide/CVA; copia literal React/Next; datos reales desde backend (F5-03/F5-04/F6-*); cualquier cambio sobre `apps/backend-php/`, `database/`, `deploy/`, `material_privado_no_versionar/` o el `muestra_pagina/` salvo lectura segura. |

Reglas duras heredadas (D0 + AGENTS raíz):

- "**No expongas DNI completo en pantallas públicas ni token completo.**" (prompt raíz F5-02).
- "**DNI completo en UI pública**: visible por decisión institucional aprobada. Logs, auditoría, errores y respuestas administrativas NO deben exponer DNI completo." (AGENTS.md raíz).
- `admin-master-data-api/spec.md` fija a nivel backend: "La API DEBE... responder DTOs administrativos con DNI enmascarado, nunca completo." → la UI admin de F5-02 **debe mostrar `dniMostrar` enmascarado** (patrón `XX****XX`), coherente con `documentMasked` (F5-01) y `dniMostrar` (F2-05). No se requiere spec institucional explícita porque la regla ya está fijada upstream.
- `admin-attendances-frontend/spec.md` y `__checks__/no-real-data.spec.ts` (F2-05) ya institucionalizaron: sin emails, sin DNI completo, sin matrículas, sin nombres propios plausibles, sin UUIDs; `dniMostrar` formato `XX****XX`.

## Estado actual post F5-01

Rama `frontend/students-list` en `3f77fdd` (Merge PR #50 = F5-01), **limpia, sin commits propios**. Base F2-03/F2-04/F2-05/F2-06/F4-01/F4-02/F4-03/F4-04/F5-01 toda mergeada a main (con 4 commits de docs/maintenance posteriores, no incluidos en esta base — irrelevantes para el alcance de F5-02).

App Angular 20 en `apps/frontend-angular/`:

- Build prod verde al cierre de F5-01. Estructura por features; `src/app/features/admin/` contiene la base común de F2-03 y las features completas de `attendances/`, `certifications/` y `courses/`. **No existe aún `features/admin/students/`.**
- `features/admin/attendances/` (F2-05) ya tiene `AsistenciaAlumno` con `dniMostrar` enmascarado (`XX****XX`), `apellidoNombre` neutro y `estado: 'activo' | 'inactivo'`. Es un derivado **por curso** (12-15 por curso seed), no la entidad `Alumno` global. F5-02 introduce la entidad `Alumno` como **fuente de verdad independiente** (con trayectoria agregada `cursosConAsistencia` y `certificacionesValidas`).
- `features/admin/courses/` (F2-04 + F4-03 + F4-04) tiene `COURSES_SOURCE` (`InjectionToken` + `InMemoryCoursesService`) con 6 cursos seed; el `AttendanceMockService` ya inyecta `COURSES_SOURCE` para resolver fechas activas.
- `features/admin/certifications/` (F2-06 + F5-01) tiene `Certificacion` con `nombreAlumno` ficticio, `documentMasked` y `tokenPrefix` (sin `cursosConAsistencia` ni `certificacionesValidas` agregados). Las métricas de F5-02 deben derivarse del seed mock, no consultar `CERTIFICATIONS_SOURCE` (regla de F2-04: las métricas entre features son placeholders; el seam existe pero la trazabilidad debe ser explícita).
- Ruteo (`app.routes.ts`): `COURSES_SOURCE`/`ATTENDANCE_SOURCE`/`CERTIFICATIONS_SOURCE` se proveen a nivel del bloque `admin` (children). F5-02 debe agregar `STUDENTS_SOURCE` con el mismo patrón. Orden seguro: rutas estáticas antes que dinámicas. `/admin/alumnos` es estática (sin `:id` en F5-02), pero F5-03 introducirá `/admin/alumnos/:id` — el orden debe planearse para que la dinámica no capture `/admin/alumnos/nuevo` ni el placeholder de emisión.
- Sidebar (`sidebar-admin.ts`): ítem `Alumnos` con `route: null` (placeholder deshabilitado) y SVG inline. F5-02 lo activa a `route: '/admin/alumnos'` y extiende `isActive()` con la regla de prefijo (mismo patrón que `Asistencias` y `Certificaciones`).
- Dashboard (`admin-dashboard-page.*`): 3 tarjetas reales (Cursos, Asistencias, Certificaciones). F5-02 debe sumar la 4ª con conteo ficticio desde `STUDENTS_SOURCE.contar()`.
- Especificaciones vigentes: `openspec/specs/admin-foundation/spec.md` (lista `Alumnos` como pendiente), `admin-attendances-frontend/spec.md` (`dniMostrar` enmascarado, sin emails), `admin-courses-frontend/spec.md` (métricas agregadas como placeholders), `admin-certifications-frontend/spec.md` (8 escenarios, `documentMasked` enmascarado), `admin-master-data-api/spec.md` (backend devuelve DNI enmascarado en DTOs administrativos). **No existe `admin-students-frontend/spec.md`** — F5-02 lo crea.

Contrato backend (referencia, NO se conecta): `docs/backend/01-contrato-api-certificados.md` y specs `admin-master-data-api`, `backend-contrato-api-certificados`, `database-cursos-alumnos-asistencias`. La paginación **no está documentada en el contrato backend** (queda para una decisión posterior; F5-02 puede paginar client-side sobre el seed mock, mismo criterio que F5-01).

Inventario v0 en `muestra_pagina/components/admin/lista-alumnos.tsx` (654 líneas, referencia visual, NO se copia):

| Aspecto v0 | Mapeo F5-02 |
|---|---|
| Datos del alumno: `id`, `legajo`, `apellido`, `nombre`, `dni`, `email`, `cursosConAsistencia`, `certificacionesValidas` | `Alumno { id, legajo, apellido, nombre, dniMostrar, email?, cursosConAsistencia, certificacionesValidas }`. **v0 muestra DNI completo**; F5-02 lo reemplaza por `dniMostrar` (`XX****XX`) por regla D0. |
| Búsqueda libre sobre `nombre`, `apellido`, `dni`, `legajo` en v0 | F5-02 restringe `<input type="search">` a nombre y `dniMostrar`, sin icono Lucide |
| Filtros `con-cert` / `sin-cert` (mutuamente excluyentes) / `sin-email` | Replicar como grupo de chips `aria-pressed` con `con-certificaciones`, `sin-certificaciones`, `sin-email`. Mutuamente excluyentes los dos primeros (mismo `toggleFiltro` de v0). |
| Vista conmutable para QA (`datos`/`cargando`/`error`/`vacio-total`) | Misma idea; QA-only, sin persistencia ni URL state; `CERTIFICATIONS_QA_ENABLED` como `InjectionToken<boolean>(isDevMode)` (mismo patrón F5-01) |
| Tabla desktop con 6 columnas (Alumno/Legajo, DNI, Email, Cursos c/asist., Cert. válidas, Acción) | Tabla `<caption>` + `<th scope="col">`; mobile cards con `<dl>` de métricas |
| Cards mobile con `<dl>` y métricas inline | Replicar paridad F5-01 con `<article class="card-alumno-mobile">` |
| Contador "Mostrando N de M" | `<p aria-live="polite">` con resumen de página actual |
| Paginación `1 2 3 …` con `«`/`»` y `aria-current="page"` | Adoptar `PAGINA_TAMANO = 5` y patrón de `paginacion` de F5-01 |
| `PAGINA_TAMANO = 5` (constante v0) | Adoptar como `PAGINA_TAMANO = 5` en `students.models.ts` y `students-list-page.ts` |
| Botón "Limpiar filtros" condicional | Reusar patrón F5-01: `onLimpiarFiltros()` con `hayFiltrosActivos()` computed |
| Botón "Nuevo alumno" (`/admin/alumnos/nuevo`) | **Diferido a una fase posterior o a F5-03** (no emisión real, no en alcance F5-02). El botón **no debe mostrarse** en F5-02; o si se muestra, debe estar `disabled` con copy "Disponible en una fase posterior" — recomendación: omitir. |
| `ChipFiltro` con icono opcional | Replicar como `button[aria-pressed]` con tokens F1-02; sin icono Lucide |
| `ConteoCursos` / `ConteoCertificaciones` con icono | Replicar como `<span class="conteo">` con tokens; sin icono Lucide |
| `TablaCargando` (5 skeleton rows) | Adoptar con `<output aria-busy="true">` |
| `EstadoError` con "Reintentar" | Reusar patrón F5-01 |
| `EstadoSinResultados` con "Limpiar filtros" | Reusar patrón F5-01 |
| `EstadoVacio` con CTA "Registrar primer alumno" | Reusar patrón F5-01 pero **sin CTA** (F5-02 no habilita alta); copy "Sin alumnos registrados" |

## Áreas afectadas (cambio activo)

Frontend Angular 20 (`apps/frontend-angular/src/app/`):

- **Crear** `features/admin/students/` con la estructura:
  - `students.models.ts`: `Alumno`, `AlumnoFiltros { conCertificaciones?, sinCertificaciones?, sinEmail?, q? }`, `EstadoAlumno = 'activo' | 'inactivo'`, `PAGINA_TAMANO = 5`, `TipoFiltroAlumno = 'con-cert' | 'sin-cert' | 'sin-email'`, `VistaQaAlumno = 'datos' | 'cargando' | 'error' | 'vacio-total'`. Sin `cursosConAsistencia`/`certificacionesValidas` derivados de `COURSES_SOURCE`/`CERTIFICATIONS_SOURCE` (regla F2-04: placeholders explícitos); ambos campos son números ficticios del seed.
  - `students.service.ts`: interfaz `StudentsService { listar(filtros?): Promise<readonly Alumno[]>; obtener(id): Promise<Alumno>; contar(): Promise<number> }` + `InjectionToken<StudentsService> STUDENTS_SOURCE`.
  - `in-memory-students.service.ts`: seed de 8-12 alumnos ficticios. **Apellido y nombre neutros, no plausibles** (patrón F2-05: `A1`..`A12` + `B1`..`B12`, o "Persona Demo 01".."Persona Demo 12"). `dniMostrar` formato `XX****XX` (función `dniMostrar(n: number)` ya existe como ejemplo en `attendance-mock.service.ts:26-30` — reusar el patrón, no la función, para evitar acoplamiento entre features). `legajo` formato `LEG-NNNNN` ficticio (5 dígitos; no 4-5 como v0 para no colisionar con plausibles). `email` opcional con dominios `.example.invalid` (mismo patrón v0, no plausible). `cursosConAsistencia` y `certificacionesValidas` derivados en el seed (números fijos, no consultar otros seams). `estado: 'activo' | 'inactivo'` para paridad con F2-05. **No** portar `id: string` (v0 usa `"leg-23910"`) — usar `id: number` para coherencia con el resto del árbol admin.
  - `pages/list/students-list-page.{ts,html,css,spec.ts}`: evolución desde cero siguiendo el patrón F5-01.
    - `ts`: signals para `q`, `filtros: Set<TipoFiltroAlumno>`, `pagina`, `vistaQA`; computed `hayFiltrosActivos`, `vacioTotal`, `sinCoincidencias`, `totalPaginas`, `itemsVisibles`, `paginaSegura`; `loadGen` (patrón F5-01 para descartar respuestas obsoletas); `onSearch`, `toggleFiltro` (con regla de exclusión mutua `con-cert` / `sin-cert` de v0), `onPagina`, `onLimpiarFiltros`, `onReintentar`, `onVistaQA`; `STUDENTS_QA_ENABLED` `InjectionToken<boolean>(isDevMode)`. **El filtro `sin-email` no es mutuamente excluyente con los otros dos** (igual que v0).
    - `html`: bloque `.header-row` con kicker "Admin · Alumnos", `<h1>Alumnos</h1>`, subtítulo "Legajos con trayectoria de cursada y certificaciones vigentes." (adaptación del copy v0, sin "Registro académico"); banner demo con `role="status"`; bloque `.filtros` con `<input type="search">`, grupo `.filter-chips` con tres botones `aria-pressed`; bloque `.results-summary` con "Mostrando N de M" + limpiar; bloque `.vista-qa` (QA-only, no afecta a usuarios reales) con 4 botones `aria-pressed`; bloque `.students-table-wrap` con `<table>` desktop de 6 columnas (`Alumno / Legajo`, `DNI`, `Email`, `Cursos c/asist.`, `Cert. válidas`, `Acción`); `<ul class="cards-mobile">` con `<article>` por alumno (`<dl>` con nombre/legajo, DNI, email, métricas); `<nav class="paginacion">` con `«`/números/`»`; estados `cargando`, `error`, `vacioTotal`, `sinCoincidencias` diferenciados. **No** incluir botón "Nuevo alumno".
    - `css`: tokens F1-02; `.filter-chip` con variante activa via `aria-pressed`; `.conteo` con variante activo/inactivo; `.paginacion` con focus visible; `.vista-qa` botones `aria-pressed`; `.demo-banner` (mismo estilo que F5-01). **Sin** definir tokens nuevos; reusar `--color-*`, `--space-*`, `--radius-*`, `--font-mono`, `--focus-ring`.
    - `spec`: ≥12 tests cubriendo: render del banner demo, búsqueda sobre 4 campos (incluyendo `dniMostrar` y `legajo`), filtro con-cert/sin-cert mutuamente excluyente, filtro sin-email, limpiar filtros, paginación (página 2, «, », aria-current, página inválida → clamp), empty state sin/sin filtros, error con reintento, vista QA conmutable, no expone token/DNI completo/email real/UUID/matrícula, navegación a F5-03 preserva link. Mínimo 12 escenarios para paridad con F5-01 (que tuvo 8 escenarios en spec + 15+ tests).
  - `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts`: creados para `students/`. Cubren: 0 matches para `X-Admin-Key`, `localStorage`, `sessionStorage`, `document.cookie`, `HttpClient`, `fetch(`, `XMLHttpRequest`, `DNI`, `legajo-` sin enmascarar, `matricula`, `prefijo_demo_` (los prefijos son de certificaciones, no alumnos); `dniMostrar` siempre con patrón `^\d{2}\*{4}\d{2}$`; sin emails plausibles (regex `example\.invalid$` o `example\.com$`); sin UUIDs; sin nombres propios plausibles; `id` numérico pequeño (< 100); sin queries `/api/`, `http://`, `https://` excepto el placeholder `/admin/alumnos` local. Adoptar estructura de F2-05 (líneas 28-79) como plantilla.
- **Modificar** `app.routes.ts`: agregar `STUDENTS_SOURCE` al `providers` del bloque `admin` (mismo patrón que `COURSES_SOURCE`/`ATTENDANCE_SOURCE`/`CERTIFICATIONS_SOURCE`) y registrar la ruta hija `alumnos` → `StudentsListPage`. **Orden seguro**: `/admin/alumnos` es estática, no choca con `cursos/*` ni `certificaciones/*`. La ruta `/admin/alumnos/:id` pertenece a F5-03, no a F5-02 — **no se registra en este ciclo** pero el orden debe quedar preparado (estática antes que dinámica, catch-all admin intacto).
- **Modificar** `app.routes.spec.ts`: ≥1 caso para `/admin/alumnos` con sesión mock → renderiza `StudentsListPage`; ≥1 caso sin sesión mock → `adminGuard` redirige; ≥1 caso de orden de rutas (que `/admin/alumnos` no caiga en wildcard público ni en `cursos/:id`).
- **Modificar** `features/admin/sidebar-admin.ts`: ítem `Alumnos` pasa a `route: '/admin/alumnos'`. Extender `isActive()` con la regla de prefijo `startsWith('/admin/alumnos')` para que `/admin/alumnos/:id` (F5-03) también quede activo. Coherente con el patrón actual de Cursos/Asistencias/Certificaciones (líneas 53-59).
- **Modificar** `features/admin/sidebar-admin.spec.ts`: ≥2 casos nuevos (placeholder ya no es `disabled`; `isActive` matchea prefijo `/admin/alumnos`).
- **Modificar** `features/admin/admin-dashboard-page.{ts,html,spec.ts}`: sumar tarjeta "Alumnos" como link real con conteo ficticio desde `STUDENTS_SOURCE.contar()` (signal hidratado con fallback honrado a `0`, mismo patrón que Certificaciones en F2-06). Sumar `STUDENTS_SOURCE` al `inject()`.
- **Crear** `openspec/specs/admin-students-frontend/spec.md`: spec principal del feature, con requirements `Rutas protegidas y entrada de alumnos`, `Listado mock-only con datos seguros`, `Harness y evidencia verificable del listado`, `Documentación y handoff`. Reusar la estructura de `admin-certifications-frontend/spec.md` (post-F5-01) como plantilla; las scenarios deben cubrir: `mock-only sin red`, `DNI enmascarado`, `búsqueda por 4 campos`, `filtros combinables con exclusión mutua`, `paginación de 5 y clamp`, `tabla/cards responsive`, `estados diferenciados`, `harness QA ausente en producción`, `privacidad mock-only`.
- **Modificar** `openspec/specs/admin-foundation/spec.md` (delta `MODIFIED`):
  - `Rutas administrativas aisladas`: agregar `/admin/alumnos` a la lista de rutas que el sistema DEBE exponer.
  - `Sidebar accesible, responsive y alineado a F1-02`: extender la lista de prefijos activos a `/admin/alumnos*` (paridad con Cursos/Asistencias/Certificaciones).
  - `Login y shell explícitamente simulados`: extender `Dashboard` con la tarjeta Alumnos real (hoy no está en el scenario, debe agregarse).
  - `Documentación y límites de handoff`: dejar asentado que F5-02 activa Alumnos y que F5-03 introduce detalle.
- **Modificar** `docs/frontend/00-angular20-port-v0.md`: agregar bloque "Estado F5-02 — Listado de alumnos con paridad v0 (filtros, paginación, harness QA)" siguiendo el patrón de F5-01 (líneas 345-371). Debe incluir: archivos creados, archivos modificados, límites explícitos, verificación, handoff a F5-03/F5-04.
- **Crear** `docs/frontend/F5-02-listado-alumnos-paridad-v0.md` (nuevo): documentar ruta, secciones, filtros, paginación, paridad, frontera de datos, evidencia visual. Mismo shape que `docs/frontend/F4-03-listado-cursos-paridad-v0.md`.

`muestra_pagina/components/admin/lista-alumnos.tsx` y `muestra_pagina/app/admin/alumnos/page.tsx` (carpeta raíz de la página, ya existe) — **solo referencia visual** (lectura segura). No compilar ni portar literalmente; respetar identidad institucional del IFTS 14. Capturas aplicables para `parity-notes.md`: `muestra_pagina/capturas/alumnos-desktop.png` (8.3 kB) y `muestra_pagina/capturas/alumnos-375.png` (103.1 kB).

## Lo que NO se toca

Reglas absolutas (heredadas y reforzadas para F5-02):

- **Backend, deploy, base de datos, `material_privado_no_versionar/`** — Marcos mantiene autoridad total. OpenCode no debe leer ni versionar ese material.
- **Auth real ni `X-Admin-Key`** — la sesión mock de F2-03 sigue siendo el único modo admin en F5-02. La clave admin nunca debe aparecer en bundle, `localStorage`/`sessionStorage`/cookies/IndexedDB, ni en llamadas HTTP desde Angular.
- **HTTP/HttpClient/fetch/XMLHttpRequest desde el browser** — la frontera con la API PHP queda para `frontend/api-readiness` (Marcos). F5-02 sigue mock-only aunque el contrato backend ya defina endpoints administrativos de alumnos en `admin-master-data-api/spec.md`.
- **Storage del navegador** — sin `localStorage`/`sessionStorage`/cookies/IndexedDB; la sesión mock es solo en memoria.
- **DNI completo en UI admin** — regla D0 + `admin-master-data-api/spec.md` líneas 22-43. Usar siempre `dniMostrar` enmascarado (`XX****XX`). La spec institucional para DNI completo solo aplica a `/certificados/validar/:tokenCertificacion` (público), no al admin.
- **Datos reales o sensibles** — sin emails plausibles (usar `*.example.invalid`), sin legajos plausibles (formato `LEG-NNNNN` con 5 dígitos seed-derived), sin matrículas tipo `STD-2024-NNN`, sin tokens completos, sin UUIDs, sin nombres propios plausibles (mantener patrón `A1`..`A12` + `B1`..`B12` de F2-05 o nombres institucionales neutros).
- **Email, SMTP, PHPMailer** — fuera del MVP. F5-02 no envía email.
- **Detalle de alumno (F5-03)** — la ruta `/admin/alumnos/:id` no se registra en F5-02; queda como handoff explícito.
- **Alta/edición real de alumnos** — el botón "Nuevo alumno" del v0 queda fuera; F5-02 no habilita alta.
- **Emisión, revocación, PDF, QR, entrega manual** — siguen deshabilitados; F5-02 no habilita ninguno.
- **Copia literal de React/Next** — `muestra_pagina/` se usa solo como referencia visual y de composición; reimplementar la intención en Angular 20 con tokens F1-02. No usar `lucide-react` ni equivalente, no usar Tailwind/shadcn/CVA, no portar imports React/Next, no usar `AdminShell` ni `next/link`.
- **Dependencias nuevas** — `package.json` y lockfiles sin cambios. Reutilizar `BandaEstado`/HTML semántico nativo (F1-02/F2-05) y tokens CSS.
- **Operaciones Git automáticas** — diff-confirmation gate antes de `git add`, pre-push safety antes de `git push`, ningún `git push` directo a `main`. PR, merge, rebase requieren aprobación explícita con comando exacto y evidencia previa.
- **Cambios fuera del alcance** — no tocar `apps/backend-php/`, `database/`, `deploy/`, ni el `muestra_pagina/` (sólo lectura segura para inventario).
- **Re-pisar features existentes** — no modificar `features/admin/courses/`, `features/admin/attendances/`, `features/admin/certifications/`, `features/admin/admin-guard.ts`, `features/admin/mock-session.ts`, `features/admin/admin-shell.ts`. Solo agregar `students/` y extender `sidebar-admin.ts`/`admin-dashboard-page.{ts,html,spec.ts}`/`app.routes.{ts,spec.ts}`.

## Reuso desde F2-03/F2-04/F2-05/F2-06/F4-01/F4-02/F4-03/F4-04/F5-01

| Recurso | Origen | Reuso en F5-02 |
|---|---|---|
| `MOCK_SESSION` + `adminGuard` | `features/admin/mock-session.ts`, `admin-guard.ts` | Ruta `/admin/alumnos` con `canActivate: [adminGuard]` (a registrar) |
| `AdminShell` + `SidebarAdmin` | `features/admin/admin-shell.*`, `sidebar-admin.*` | Activar ítem Alumnos y extender `isActive()` para prefijo |
| Patrón `*_SOURCE` | `COURSES_SOURCE`, `ATTENDANCE_SOURCE`, `CERTIFICATIONS_SOURCE` | Nuevo `STUDENTS_SOURCE` (mismo `InjectionToken` + `InMemory*` mock) |
| `InMemoryXService` | `in-memory-courses.service.ts`, `in-memory-attendance.service.ts`, `in-memory-certifications.service.ts` | Adoptar el patrón de seed estático module-level clonado en ctor; `__reset()` para tests |
| `dniMostrar(n)` formatter | `attendance-mock.service.ts:26-30` | Replicar la función localmente en `in-memory-students.service.ts` (no importar — evitar acoplamiento entre features) |
| Páginas con `loadGen` (race guard) | `courses-list-page.ts` (F4-03), `certifications-list-page.ts` (F5-01) | Adoptar `loadGen` en `students-list-page.ts` para descartar respuestas obsoletas |
| Tabla desktop + cards mobile | `certifications-list-page.html` (F5-01) | Replicar patrón con 6 columnas; mobile `<article>` con `<dl>` de métricas |
| Chips de filtro con `aria-pressed` | `certifications-list-page.html` (F5-01) | Replicar para con-cert/sin-cert/sin-email |
| Regla de exclusión mutua de filtros | `lista-alumnos.tsx:128-137` (v0) | Replicar el `toggleFiltro()` de v0 en el `.ts` de F5-02 |
| Resumen accesible + limpiar filtros | `certifications-list-page.html` (F5-01) | Replicar con "Mostrando N de M" |
| Estados carga/error/vacío/sin-coincidencias | `certifications-list-page.html` (F5-01) | Replicar las cuatro ramas explícitas |
| `__checks__/no-secrets.spec.ts`, `no-real-data.spec.ts` | `attendances/__checks__/` (F2-05) | Adoptar como plantilla; cubrir `dniMostrar`/`legajo`/`email`/`UUID`/`id` numérico |
| `STUDENTS_QA_ENABLED` `InjectionToken(isDevMode)` | `CERTIFICATIONS_QA_ENABLED` (F5-01, `certifications-list-page.ts:13-15`) | Replicar exactamente el patrón |
| `PAGINA_TAMANO = 5` | `certifications.models.ts:8` (F5-01) | Adoptar en `students.models.ts` (constante independiente) |
| Tokens CSS F1-02 | `apps/frontend-angular/src/styles.css` + `certifications-list-page.css` | Reutilizar sin redefinir; reusar `.filter-chips` y `.paginacion` |
| `RouterTestingHarness` + `withComponentInputBinding()` | `app.routes.spec.ts` | Verificar orden y provider; F5-02 agrega ruta nueva |
| `loadGen` (descarta stale) | `certifications-list-page.ts:72-86` (F5-01) | Replicar patrón en `students-list-page.ts` para evitar regresión de carga obsoleta |
| `signal` + `computed()` + `inject()` | Patrón Angular 20 ya establecido | Adoptar; sin servicios nuevos |

## Gaps identificados (alcance F5-02)

Comparación `muestra_pagina/components/admin/lista-alumnos.tsx` vs `apps/frontend-angular/src/app/features/admin/students/` (a crear):

| Aspecto v0 | Estado Angular actual | Acción F5-02 |
|---|---|---|
| Entidad `Alumno` con trayectoria | Inexistente; `AsistenciaAlumno` (F2-05) es derivado por curso, no entidad global | **Crear** `Alumno { id, legajo, apellido, nombre, dniMostrar, email?, cursosConAsistencia, certificacionesValidas, estado }` |
| Búsqueda libre restringida a nombre/`dniMostrar` | No existe listado | **Crear** `<input type="search">` con búsqueda solo sobre esos dos campos |
| DNI completo visible | (v0) | **Reemplazar por `dniMostrar` enmascarado `XX****XX`** (regla D0 + master-data-api) |
| Chips de filtro de certificaciones (3 estados) | No existe | **Replicar** como grupo de chips `aria-pressed` con exclusión mutua `con-cert` / `sin-cert` |
| Tabla desktop con 6 columnas | No existe | **Crear** tabla ≥`md` con caption + th scope + 6 columnas |
| Cards mobile con `<dl>` de métricas | No existe | **Crear** con `<article class="card-alumno-mobile">` y métricas |
| Contador "Mostrando N de M" | No existe | **Crear** `<p aria-live="polite">` |
| Paginación `« 1 2 3 … »` con `aria-current="page"` | No existe | **Introducir** con `PAGINA_TAMANO = 5` y componente inline (patrón F5-01) |
| Botón "Limpiar filtros" | No existe | **Crear** condicional con `hayFiltrosActivos()` |
| Vista conmutable para QA (4 estados) | No existe en alumnos | **Crear** `vistaQA` QA-only con 4 botones `aria-pressed` (datos/cargando/error/vacío-total) |
| Botón "Nuevo alumno" (`/admin/alumnos/nuevo`) | No existe | **No incluir** (handoff a fase posterior); sin CTA en `EstadoVacio` |
| `ConteoCursos` / `ConteoCertificaciones` con icono | No existe | **Replicar** como `<span class="conteo">` con tokens (sin icono Lucide) |
| `TablaCargando` (5 skeleton rows) | No existe | **Crear** con `<output aria-busy="true">` |
| `EstadoError` con "Reintentar" | No existe | **Crear** con bloque dedicado + botón |
| `EstadoSinResultados` con "Limpiar filtros" | No existe | **Crear** con bloque dedicado + botón |
| `EstadoVacio` con CTA "Registrar primer alumno" | No existe | **Crear** con bloque dedicado **sin CTA** (F5-02 no habilita alta); copy "Sin alumnos registrados" |
| Activar sidebar `Alumnos` | Placeholder deshabilitado (F2-03) | **Activar** `route: '/admin/alumnos'` y extender `isActive()` con prefijo |
| Tarjeta dashboard `Alumnos` | Inexistente | **Agregar** como link real con conteo desde `STUDENTS_SOURCE.contar()` |
| Paridad visual con tokens F1-02 | N/A | **Aplicar** desde cero con `.filter-chips`, `.paginacion`, `.demo-banner` reusados |

## Riesgos y edge cases

| Riesgo | Mitigación |
|---|---|
| Exponer DNI completo en UI admin por port literal de v0 | Reemplazar `dni: "DNI-FICTICIO-001"` por `dniMostrar: dniMostrar(id)`; `__checks__/no-real-data.spec.ts` valida el patrón `^\d{2}\*{4}\d{2}$`; el campo `dni` de v0 NO se incluye en el modelo `Alumno` |
| Email plausible en el seed (alguien escribe `juan.perez@example.com`) | Usar `*.example.invalid` o dominios reservados (RFC 6761); `__checks__` valida con regex |
| Legajo plausible (`12345` real) | Formato `LEG-NNNNN` con 5 dígitos derivados del id del seed; nunca usar `00000`-`00999` (rango plausible); `__checks__` valida |
| Re-pisar `adminGuard` o `MOCK_SESSION` | No modificar `mock-session.ts` ni `admin-guard.ts`; sólo registrar `canActivate: [adminGuard]` en el nuevo bloque de rutas |
| Mezclar paridad visual de v0 con patrón F5-01 | Usar F5-01 (`certifications-list-page.html`) como **plantilla estructural** y v0 (`lista-alumnos.tsx`) como **referencia de composición visual y campos de datos**; los dos convergen en el `.html` final |
| Paginación: ¿client-side o server-side? | **Client-side** sobre el seed mock; el contrato backend aún no define `page`/`pageSize`; la sustitución por `HttpStudentsService` queda para una fase con sesión segura aprobada |
| Página inválida (> `totalPaginas`) | Computed `paginaSegura` corrige a `1`; `aria-current` en la página vigente; sin excepciones |
| Filtros activos sin matches (sin-coincidencias) | Rama `@else if (sinCoincidencias())` con botón "Limpiar filtros" (copy de v0 adaptado) |
| Vista inicial vacía (sin filtros, sin matches) | Rama `@else if (vacioTotal())` con copy "Sin alumnos registrados" (sin CTA) |
| `loadGen` no adoptado y carga obsoleta al cambiar filtro rápido | Adoptar el patrón de F5-01: `loadGen++` en cada `recargar()`, ignorar respuesta si `gen !== loadGen` |
| `con-cert` y `sin-cert` no mutuamente excluyentes (regresión de regla v0) | `toggleFiltro` con la regla `if (valor === 'con-cert' && !next.has('con-cert')) next.delete('sin-cert')` (líneas 132-133 de v0); tests cubren el toggle cruzado |
| `sin-email` no excluyente (correcto en v0, fácil de romper) | Documentar en spec; tests no asumen exclusión |
| Sesión mock no activa al navegar directo a `/admin/alumnos` | `adminGuard` ya redirige a `/admin/login`; el test de `app.routes.spec.ts` lo cubre |
| Sobre-ingeniería: crear `StudentsFilterService`, `PaginationService`, `VistaQaService` cuando el spec dice "mock-only, no emisión" | Limitar el alcance a signals + computed + métodos del componente; sin servicios nuevos. Marcar `ponytail:` cualquier abstracción especulativa |
| Tamaño de revisión > 4000 líneas | Estimación ~1100-1700 líneas (ver Forecast) — dentro del budget. Si supera 2500, dividir en dos PRs (chips+filtros+búsqueda en uno, paginación+tabla+cards+QA en otro) usando `work-unit-commits` antes de `apply` |
| Confusión entre `dniMostrar` (admin) y `documentNumber` (público) | Spec `admin-students-frontend` aclara: en UI admin siempre `dniMostrar`; DNI completo solo en `validar/:tokenCertificacion` pública. Coherente con `documentMasked` (F5-01) |
| Git push directo a `main` | Prohibido por AGENTS.md; toda operación Git con aprobación explícita y comandos exactos |
| Regresión visual en el dashboard o sidebar | Reuso de `<a routerLink>` y conteo ficticio desde `STUDENTS_SOURCE.contar()`; smoke manual contra el listado |
| `app.routes.spec.ts` que prueba orden y provider con mocks se vuelve frágil | Mantener el patrón actual: tests con `RouterTestingHarness` y `withComponentInputBinding()`; agregar caso de "Alumnos navega a `StudentsListPage` con sesión mock" y "orden de rutas preserva catch-all admin" |
| Activar sidebar y dashboard antes de tener el componente listo | Branch protection: en `sdd-apply` primero se commitea el feature `students/` con su spec/scene, luego en el mismo PR (o work unit posterior) se activa sidebar/dashboard. Si el orden se invierte, los tests E2E fallan por sidebar mostrando link roto |
| Tech debt conocido: `HeaderInstitucional` raíz en `/admin/*` | Documentado en F2-03/F5-01; no tocar en F5-02 |
| Vista QA conmutable expone estados de error en producción | Marcar con `STUDENTS_QA_ENABLED` `InjectionToken<boolean>(isDevMode)`; ausente en producción/staging; `onVistaQA` ignora invocaciones cuando QA está deshabilitado (mismo patrón F5-01) |

## Enfoque recomendado y alternativas

| Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|
| **A. Listado nuevo con tabla+cards+chips+paginación+vista QA desde cero (recomendado)** | Cobertura completa del handoff declarado en admin-foundation; reuso pleno de F2-05/F4-03/F5-01; budget cómodo; habilita F5-03 sin reescribir; introduce entidad `Alumno` como fuente de verdad para futuras integraciones | Página más amplia; mezcla paridad v0 con patrón F5-01; primera vez que se crea un feature con entidad nueva desde cero (vs. evolución in-place de F5-01) | Bajo–Medio |
| B. Listado minimal sin paginación ni tabla desktop (solo cards mobile) | Mínimo, dentro del budget; preserva F2-05 | F5-02 dejaría la paginación y la tabla desktop como handoff total; aleja la paridad visual del v0 (v0 tiene tabla); rompe la regla "alcanzar paridad" del prompt raíz | Muy bajo |
| C. Listado con tabla+cards pero sin harness QA ni chips | Centrado en una vista | Rompe paridad con v0 (filtros chips y vista QA son affordances explícitos del v0); mobile pierde el filtro rápido | Bajo–Medio |
| D. Listado + paginación + chips + vista QA, **pero derivando métricas desde `COURSES_SOURCE`/`CERTIFICATIONS_SOURCE`** | Realista, contract-ready | **Rompe mock-only** (filtros que dependen de contar asistencia por alumno y certificaciones vigentes por alumno); excede alcance; métricas entre features son placeholders explícitos por regla F2-04 | Alto + scope creep |
| E. Listado con `id: string` tipo v0 (`"leg-23910"`) | Paridad literal con v0 | Inconsistente con el resto del árbol admin (`Curso.id: number`, `Asistencia.id: number`, `Certificacion.id: number`); fricciona la integración con F5-03 y con futuros endpoints | Bajo |

**Recomendación: A.** Es la lectura literal del prompt raíz ("implementar el listado de alumnos con datos visibles definidos por spec; DNI completo solo si la spec lo exige en contexto privado/administrativo"), la única vía que cumple el handoff declarado en `admin-foundation/spec.md` (Alumnos pendiente en sidebar/dashboard) y el espejo natural de F5-01 (que activó Certificaciones con lista + tabla + chips + métricas). La paginación client-side sobre el seed mock es honesta: la sustitución por `HttpStudentsService` queda para una fase con sesión segura aprobada. La regla D0 + `admin-master-data-api/spec.md` ya fijaron que el DNI admin va enmascarado, así que la spec institucional explícita para DNI completo en admin no se requiere.

## Forecast de tamaño

Estimación contra presupuesto de revisión de **4000 líneas** (`additions + deletions`):

- `features/admin/students/students.models.ts` (definir `Alumno`, `AlumnoFiltros`, `TipoFiltroAlumno`, `VistaQaAlumno`, `PAGINA_TAMANO = 5`): ~40-60 líneas.
- `features/admin/students/students.service.ts` (interfaz + `InjectionToken`): ~15-20 líneas.
- `features/admin/students/in-memory-students.service.ts` (seed 8-12 alumnos ficticios + `__reset` + formatters): ~120-180 líneas.
- `features/admin/students/pages/list/students-list-page.{ts,html,css,spec.ts}` (signals/computed, paginación, QA, estados, tabla/cards): ~600-900 líneas.
- `features/admin/students/__checks__/{no-secrets,no-real-data}.spec.ts`: ~80-120 líneas.
- `app.routes.ts` (alta de `STUDENTS_SOURCE` + ruta `/admin/alumnos`): ~10-20 líneas.
- `app.routes.spec.ts` (≥3 casos nuevos): ~50-100 líneas.
- `features/admin/sidebar-admin.ts` (activar ítem + extender `isActive()`): ~10-20 líneas.
- `features/admin/sidebar-admin.spec.ts` (≥2 casos nuevos): ~30-60 líneas.
- `features/admin/admin-dashboard-page.{ts,html,spec.ts}` (sumar tarjeta Alumnos): ~40-80 líneas.
- `openspec/specs/admin-students-frontend/spec.md` (nuevo, 4 requirements + 8-10 escenarios): ~80-150 líneas.
- `openspec/specs/admin-foundation/spec.md` (delta `MODIFIED` en 3 requirements): ~20-40 líneas.
- `docs/frontend/00-angular20-port-v0.md` (bloque "Estado F5-02"): ~50-80 líneas.
- `docs/frontend/F5-02-listado-alumnos-paridad-v0.md` (nuevo): ~50-100 líneas.
- Tests existentes adaptados y agregados: ~100-200 líneas.

**Total estimado: ~1200-2000 líneas.** Budget risk: **Low**. Si la implementación supera 2500 líneas, dividir en dos PRs (entidad + servicio + página + spec + checks en uno; activación sidebar/dashboard + tests integración + parity-notes en otro) usando `work-unit-commits` antes de `apply`. No se requiere `size:exception` salvo que aparezca scope creep.

**Chained PRs recommended: No** (corte por feature auto-contenido en single PR con work units por fase). **Decision needed before apply: No** (alcance claro y dentro del budget; las preguntas abiertas se resuelven con defaults razonables).

## Preguntas abiertas resueltas con default

| Pregunta | Default propuesto | Justificación |
|---|---|---|
| ¿DNI completo en UI admin? | **No, siempre `dniMostrar` enmascarado** | Regla D0 + `admin-master-data-api/spec.md` líneas 22-43; no requiere spec institucional explícita |
| ¿Métricas `cursosConAsistencia`/`certificacionesValidas` se derivan de seams? | **No, son números fijos del seed** | Regla F2-04: métricas entre features son placeholders explícitos; traceability directa desde el seed |
| ¿Se registra `/admin/alumnos/:id` (F5-03) en este ciclo? | **No, queda como handoff** | F5-03 es ciclo independiente; el orden de rutas debe prepararse pero la ruta no se registra |
| ¿Se muestra el botón "Nuevo alumno"? | **No, queda fuera** | F5-02 no habilita alta; copy "Disponible en una fase posterior" sería ruido sin valor |
| ¿Se activa sidebar y dashboard en este PR o en uno posterior? | **Mismo PR (mismo work unit de feature), al final** | Branch protection: sidebar/dashboard sin componente listo rompen E2E; el orden es componente → spec → sidebar → dashboard dentro del mismo PR |
| ¿`id: number` o `id: string` como v0? | **`id: number`** | Coherencia con el árbol admin; fricciona menos con F5-03 y futuros endpoints |
| ¿Apellido/nombre neutros (`A1`+`B1`) o "Persona Demo 01"? | **`A1`+`B1` (estilo F2-05)** | Reuso del patrón institucionalmente validado; menos plausible como nombre real |
| ¿Email obligatorio o opcional? | **Opcional (algunos alumnos con `null`)** | Paridad con v0; permite probar el chip `sin-email` |
| ¿Estado `activo`/`inactivo` aplica al listado global? | **Sí (campo en `Alumno`)** | Coherencia con F2-05; permite filtros futuros sin cambio de modelo |

## Lista de verificación de exploración (auto-verificación)

- [x] Leído `README.md`, `GUIA.md`, `docs/00-indice-general.md`.
- [x] Leído `AGENTS.md` raíz y `apps/frontend-angular/AGENTS.md`, `openspec/AGENTS.md`, `docs/AGENTS.md`, `docs/opencode/AGENTS.md`.
- [x] Leído `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` sección F5-02 (líneas 1601-1621) y contexto F0-F6.
- [x] Leído `openspec/specs/admin-foundation/spec.md` (ítem Alumnos pendiente), `admin-attendances-frontend/spec.md` (`dniMostrar` enmascarado), `admin-courses-frontend/spec.md` (métricas como placeholders), `admin-certifications-frontend/spec.md` post-F5-01 (8 escenarios + harness), `admin-master-data-api/spec.md` (DNI enmascarado en admin).
- [x] Leído `openspec/changes/archive/2026-07-13-f5-01-certifications-list/{exploration,proposal,design,tasks,verify-report,archive-report,specs/admin-certifications-frontend/spec.md,evidence/parity-notes.md,evidence/network-privacy-check.md}` (análogo más directo).
- [x] Leído `openspec/changes/archive/2026-07-08-f2-05-admin-attendance/{exploration,specs/admin-attendances-frontend/spec.md}` (modelo `dniMostrar`, checks de privacidad).
- [x] Leído `openspec/changes/archive/2026-07-12-f4-03-courses-list/{exploration,proposal,tasks,verify-report,parity-notes.md}` (patrón de tabla+cards+chips+estados+limpiar filtros+sin métricas reales).
- [x] Leído `apps/frontend-angular/src/app/features/admin/attendances/{models/attendance.types.ts,data/attendance-mock.service.ts,pages/list/attendances-list-page.{ts,html},__checks__/no-secrets.spec.ts,__checks__/no-real-data.spec.ts}` (modelo `AsistenciaAlumno`, `dniMostrar` formatter, checks de privacidad).
- [x] Leído `apps/frontend-angular/src/app/features/admin/courses/{courses.models.ts,courses.service.ts,in-memory-courses.service.ts,courses-list-page.{ts,html,css,spec.ts}}` (patrón de tabla/cards/chips, `loadGen` race guard).
- [x] Leído `apps/frontend-angular/src/app/features/admin/certifications/{certifications.models.ts,certifications.service.ts,in-memory-certifications.service.ts,pages/list/certifications-list-page.{ts,html,css,spec.ts}}` (F5-01 base, `STUDENTS_QA_ENABLED` patrón, `PAGINA_TAMANO` constante).
- [x] Leído `apps/frontend-angular/src/app/{app.routes.ts,app.routes.spec.ts,features/admin/sidebar-admin.{ts,html,spec.ts},features/admin/admin-dashboard-page.{ts,html,spec.ts},features/admin/admin-guard.ts,features/admin/mock-session.ts,features/admin/admin-shell.{ts,html,spec.ts}}` (orden de rutas, providers, activación de sidebar/dashboard).
- [x] Leído `muestra_pagina/components/admin/lista-alumnos.tsx` (654 líneas, referencia visual v0 completa).
- [x] Leído `muestra_pagina/app/admin/alumnos/page.tsx` (entrada de ruta v0) y `muestra_pagina/app/admin/alumnos/[id]/page.tsx` (referencia F5-03, no se implementa en F5-02).
- [x] Listado el árbol `muestra_pagina/capturas/` (existe `alumnos-desktop.png` y `alumnos-375.png` para `parity-notes.md`).
- [x] Verificado el estado de las ramas: `frontend/students-list` en `3f77fdd` (base limpia, sin commits propios); F4-01/F4-02/F4-03/F4-04/F5-01 todos mergeados a `main`; `main` está 4 commits adelante de `3f77fdd` (docs/maintenance post-F5-01, irrelevantes para el alcance de F5-02).
- [x] Verificado `git status` limpio y `git diff --name-only HEAD` vacío (regla AGENTS para futuras operaciones Git).
- [x] No se inspeccionó material privado, secretos, dumps, logs ni descargas del servidor.
- [x] No se editó código de producto; solo se creó este `exploration.md` en `openspec/changes/f5-02-students-list/`.

## Ready for proposal

**Yes.** La próxima fase recomendada es `sdd-propose` sobre `openspec/changes/f5-02-students-list/proposal.md`, con el siguiente esqueleto:

1. **Why** — activar el ítem `Alumnos` del sidebar (placeholder deshabilitado desde F2-03) y materializar la entidad `Alumno` como fuente de verdad para la UI admin, mock-only, contract-ready. La regla D0 + `admin-master-data-api/spec.md` ya fijaron que el DNI admin va enmascarado, así que la spec institucional explícita para DNI completo en admin no se requiere. Habilita F5-03 (detalle) y futura integración HTTP sobre la misma estructura de modelo y servicio.
2. **What changes** — spec `admin-students-frontend` (nueva: 4 requirements, 8-10 escenarios) + spec `admin-foundation` (delta `MODIFIED` en 3 requirements: rutas, sidebar, dashboard) + código Angular 20 bajo `features/admin/students/{models,service,in-memory,pages/list,__checks__}` + extensión de `app.routes.{ts,spec.ts}` (provider `STUDENTS_SOURCE` + ruta `/admin/alumnos`) + extensión de `sidebar-admin.{ts,spec.ts}` (activar ítem + prefijo) + extensión de `admin-dashboard-page.{ts,html,spec.ts}` (tarjeta Alumnos) + `docs/frontend/00-angular20-port-v0.md` (bloque "Estado F5-02") + `docs/frontend/F5-02-listado-alumnos-paridad-v0.md` (nuevo) + `evidence/parity-notes.md` (nuevo).
3. **Impact** — sólo frontend; sin backend, sin deploy, sin DB, sin auth real, sin deps nuevas. Mismas rutas admin (`/admin/cursos*`, `/admin/asistencias*`, `/admin/certificaciones*`) intactas. Se agrega `/admin/alumnos` (estática, sin `:id` — F5-03 introducirá la dinámica). Sidebar y dashboard extienden su item de navegación y agregan tarjeta, sin reordenar el resto.
4. **Rollback** — revertir el PR único. El shell admin sigue funcionando con el placeholder deshabilitado como antes de F5-02; las specs quedan revertidas a su estado anterior.
5. **Out of scope** — detalle de alumno (F5-03); alta/edición real; emisión, revocación, PDF, QR, entrega manual; integración HTTP; `X-Admin-Key`; claves admin temporales; backend, deploy, base de datos, `.htaccess`; material privado; auth real; cookies/`localStorage`/`sessionStorage`/IndexedDB; datos reales; **DNI completo administrativo**; tokens completos; emails plausibles; legajos plausibles; UUIDs; matrículas; credenciales demo de `muestra_pagina/`; Tailwind/shadcn/lucide/CVA; copia literal React/Next; dependencias nuevas (`package.json`/lockfiles sin cambios); y la sustitución real por `HttpStudentsService` (queda para una fase con sesión segura aprobada). El botón "Nuevo alumno" del v0 queda fuera (handoff a fase posterior).

Sugerencia de nombre de cambio OpenSpec: `f5-02-students-list` (alineado a la rama y al índice de fases de Matías).

## Siguiente fase sugerida

`sdd-propose` sobre el cambio `f5-02-students-list` en `openspec/changes/f5-02-students-list/proposal.md`.
