# Exploración — f2-06-admin-certifications

> Estado: exploración. Esta fase NO implementa producto.
> Rama activa: `frontend/admin-certifications`. Cambio OpenSpec: `f2-06-admin-certifications`.
> Idioma: español argentino formal, conciso. Especificaciones, copy de UI y comentarios en español. Identificadores de código según convención del proyecto (TypeScript/Angular existente). No inyectar voseo rioplatense en artefactos.

## Goal y alcance confirmados

Origen de verdad: `MATIAS_PROMPTS_SDD_3_SEMANAS_CICLOS_GIT.md` (F0-F6 unificado, semana 2) y los specs `admin-foundation` / `admin-courses-frontend` / `admin-attendances-frontend`.

| Campo | Valor |
|---|---|
| Ciclo | F2-06 — Certificaciones |
| Rama sugerida | `frontend/admin-certifications` (ya activa en local) |
| Objetivo | Preparar la UI administrativa para listar/previsualizar certificaciones con mocks explícitos, dejando clara la frontera con PDF, QR y backend real |
| Alcance | Activar navegación de Certificaciones (sidebar + dashboard + ruta `/admin/certificaciones`); mostrar listado navegable y previsualización segura de una certificación mock a partir de curso + alumno + snapshot de fechas; marcar como placeholders las acciones que viven en F4-01 (detalle), F4-02 (PDF), F5-01 (listado real), F5-04 (entrega manual), F6-01 (revocación) |
| Fuera de alcance | Emisión real, generación de PDF/QR reales, revocación, integración HTTP/HttpClient, `X-Admin-Key`, storage/cookies, datos reales o sensibles, dependencias nuevas, Tailwind, copia literal de `muestra_pagina/` |

Restricción obligatoria del prompt raíz: "**No expongas DNI completo en pantallas públicas ni token completo.**"

## Estado actual post F2-05

Evidencia de merges: `d48be55` (PR #36) mergeó `frontend/admin-attendance`; `635f12f` (PR #35) mergeó `frontend/admin-courses-dates`; `9835184` (PR #34) mergeó `frontend/admin-foundation`. La rama `frontend/admin-certifications` ya está creada y limpia (`git status` OK), pero no contiene commits propios todavía.

App Angular 20 en `apps/frontend-angular/`:

- Build prod verde, `npm run test:ci` con 315/315 SUCCESS al cierre de F2-05.
- Estructura por features; `src/app/features/admin/` contiene:
  - Base común: `mock-session.ts` (`MOCK_SESSION` + `InMemoryMockSession`), `admin-guard.ts`, `admin-shell.*`, `sidebar-admin.*`, `login-page.*`, `login-form.*`, `admin-dashboard-page.*`.
  - `courses/`: `COURSES_SOURCE` (`courses.service.ts`) + `InMemoryCoursesService` con seed de 6 cursos ficticios; `CoursesListPage`, `CourseDetailPage`, `CourseEditorPage`; `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts`.
  - `attendances/`: `ATTENDANCE_SOURCE` (`data/attendance.token.ts`) + `AttendanceMockService` con 12-15 personas demo por curso y `dniMostrar` enmascarado `XX****XX`; `AttendancesListPage`, `AttendanceMarkingPage` con guard anti-stale por `loadGen`.
- Componentes `shared/ui/`: `BandaEstado`, `CampoDato`, `HeaderInstitucional`, `FolioShell` (definidos en F1-02, reutilizables).
- Ruteo actual (`app.routes.ts`): admin children con `providers: [COURSES_SOURCE, ATTENDANCE_SOURCE]`. `/admin/certificaciones*` **no está registrado**. Sidebar tiene ítem "Certificaciones" pero como placeholder deshabilitado. Dashboard tiene tarjeta "Certificaciones" como placeholder deshabilitado ("Próximamente: Certificaciones", handoff F2-06).

Contrato backend (referencia, NO se conecta): `docs/backend/01-contrato-api-certificados.md` y specs `admin-certificate-emission` (162 líneas), `admin-certificate-consulta` (63 líneas), `admin-certificate-delivery` (156 líneas), `admin-certificate-revocation` (36 líneas). DTO admin seguro: `documentMasked` (enmascarado), `tokenPrefix` (prefijo no reversible), `publicValidationUrl`, `pdfDownloadUrl`, `attendedDates`, `auditEvents`, `links`. DTO público D0: `documentNumber` + `attendedDates`. Estados admin: `borrador | vigente | revocado | vencido`. Códigos: `CERTIFICATE_ALREADY_EXISTS`, `TOKEN_NOT_RECOVERABLE`, `CERTIFICATE_NOT_FOUND`, `CERTIFICATE_NOT_REVOCABLE`, `VALIDATION_ERROR`, `UNAUTHORIZED`, `UNSUPPORTED_MEDIA_TYPE`, `CONFIGURATION_ERROR`.

Inventario v0 en `muestra_pagina/app/admin/certificaciones/` (referencia visual, NO se copia):

| Archivo v0 | Pantalla/flujo | Mapeo ciclo Matías |
|---|---|---|
| `page.tsx` | Listado de certificaciones | F5-01 (no F2-06) |
| `nueva/page.tsx` | Emitir certificación directa | F2-06 alcance parcial (solo previsualización mock) |
| `[id]/page.tsx` | Detalle de certificación | F4-01 (no F2-06) |
| `[id]/pdf/page.tsx` | Vista previa PDF | F4-02 (no F2-06) |
| `[id]/entrega/page.tsx` | Entrega manual | F5-04 (no F2-06) |
| `[id]/revocar/page.tsx` | Revocar | F6-01 (no F2-06) |

`F2-06` ocupa el lugar que dejó el handoff en `admin-foundation`: "Certificaciones DEBE seguir como handoff F2-06". Es la base navegable y mockeada, no las pantallas finales.

## Áreas afectadas (cambio activo)

Frontend Angular 20 (`apps/frontend-angular/src/app/`):

- `app.routes.ts` — agregar bloque `/admin/certificaciones` (listado) y `/admin/certificaciones/:id` (previsualización) en el orden seguro de children; añadir `CERTIFICATIONS_SOURCE` a `providers` del shell admin. Mantener el catch-all admin (`pathMatch: 'prefix'`) y `**` intactos.
- `features/admin/certifications/` (nuevo) — carpeta espejo de `courses/` y `attendances/`:
  - `certifications.models.ts` — `EstadoCertificado`, `Certificado`, `CertificadoDetalle`, `CertificacionesFiltros` (sin token, sin DNI completo, sin email).
  - `certifications.service.ts` — interfaz `CertificationsService` + token `CERTIFICATIONS_SOURCE`.
  - `in-memory-certifications.service.ts` — seed ficticio (3-6 certificados demo), mutación solo en memoria, banner "Datos de demostración".
  - `pages/list/certifications-list-page.{ts,html,css,spec.ts}` — búsqueda nativa, filtro por estado (`borrador|vigente|revocado|vencido`), `<section>` + `<article>`, banner de demo, enlaces a detalle.
  - `pages/preview/certification-preview-page.{ts,html,css,spec.ts}` — `<dl>` con datos seguros (`documentMasked`, `tokenPrefix`, `publicValidationUrl` truncado, `attendedDates`, `auditEvents` mínimos), CTAs deshabilitados para "Descargar PDF", "Entrega manual", "Revocar" (placeholders con copy explícito del handoff F4-01/F4-02/F5-04/F6-01). Enlace de retorno al listado.
  - `__checks__/no-secrets.spec.ts` y `__checks__/no-real-data.spec.ts` — mismos patrones que F2-04/F2-05.
- `features/admin/sidebar-admin.{ts,html,spec.ts}` — ítem "Certificaciones" pasa a `route: '/admin/certificaciones'` con `isActive()` por prefijo (`startsWith('/admin/certificaciones')`).
- `features/admin/admin-dashboard-page.{ts,html,spec.ts}` — tarjeta "Certificaciones" pasa de placeholder deshabilitado a `<a routerLink="/admin/certificaciones">` con conteo ficticio (`CertificationsService.contar()` o equivalente desde el source).
- `features/admin/admin-shell.{ts,html,spec.ts}` — sin cambios funcionales; sólo se asegura que el `rutaActual` siga funcionando con la nueva ruta.
- `app.routes.spec.ts` — agregar casos de orden, sesión mock con/sin, runtime provider `CERTIFICATIONS_SOURCE`, ids inválidos (`/admin/certificaciones/abc`), carga real de las dos páginas con `RouterTestingHarness` + `withComponentInputBinding()`.

Documentación:

- `docs/frontend/00-angular20-port-v0.md` — agregar bloque "Estado F2-06 — Certificaciones admin (mock)" siguiendo el patrón de F2-04/F2-05, con archivos creados, archivos modificados, límites, verificación y handoff a F4-01/F4-02/F5-01/F5-04/F6-01.
- `openspec/specs/admin-certifications-frontend/spec.md` (nuevo) — spec frontal con escenarios Given/When/Then para F2-06, alineado al patrón de `admin-courses-frontend` y `admin-attendances-frontend` (rutas protegidas, UI contract-ready mock en memoria, frontera segura sin datos reales/red/storage/auth, handoff a F4-F6).
- `openspec/specs/admin-foundation/spec.md` — actualizar el `Scenario: Handoff a certificaciones` (línea 96-98) para reflejar que F2-06 activa Certificaciones como ruta navegable mock, no como placeholder.

Specs backend (referencia, NO se modifican en F2-06): `admin-certificate-emission`, `admin-certificate-consulta`, `admin-certificate-delivery`, `admin-certificate-revocation` ya documentan el contrato; la UI mock debe reflejar su DTO seguro.

## Lo que NO se toca

Reglas absolutas (heredadas y reforzadas para F2-06):

- **Backend, deploy, base de datos, `material_privado_no_versionar/`** — Marcos mantiene autoridad total. OpenCode no debe leer ni versionar ese material.
- **Auth real ni `X-Admin-Key`** — la sesión mock de F2-03 sigue siendo el único modo admin en F2-06. La clave admin nunca debe aparecer en bundle, `localStorage`/`sessionStorage`/cookies/IndexedDB, ni en llamadas HTTP desde Angular.
- **HTTP/HttpClient/fetch/XMLHttpRequest desde el browser** — la frontera con la API PHP queda para `frontend/api-readiness` (Marcos).
- **Storage del navegador** — sin `localStorage`/`sessionStorage`/cookies/IndexedDB; la sesión mock es solo en memoria.
- **Datos reales o sensibles** — sin DNI completo en UI admin (D0 reserva DNI completo solo al DTO público de validación), sin token completo, sin email, sin matrícula, sin legajo. Los mocks usan `documentMasked` y `tokenPrefix`.
- **Generación real de PDF/QR** — la previsualización muestra un placeholder visual que dice "Vista previa no disponible" y enlaza al handoff F4-01/F4-02; no renderiza PDF ni genera QR.
- **Emisión ni revocación reales** — los CTAs están deshabilitados con copy explícito del handoff correspondiente.
- **Dependencias nuevas** — `package.json` y lockfiles sin cambios; sin Tailwind/shadcn/lucide/CVA; reutilizar `BandaEstado`, `CampoDato`, `HeaderInstitucional`, `FolioShell` y tokens CSS de F1-02.
- **Copia literal de React/Next** — `muestra_pagina/` se usa solo como referencia visual y de composición; reimplementar la intención en Angular 20.
- **Operaciones Git automáticas** — diff-confirmation gate antes de `git add`, pre-push safety antes de `git push`, ningún `git push` directo a `main`. PR, merge, rebase requieren aprobación explícita con comando exacto y evidencia previa.
- **Cambios fuera del alcance** — no tocar `apps/backend-php/`, `database/`, `deploy/`, ni el `muestra_pagina/` (sólo lectura segura para inventario).

## Reuso desde F2-04 / F2-05

| Recurso | Origen | Reuso en F2-06 |
|---|---|---|
| `MOCK_SESSION` + `adminGuard` | `features/admin/mock-session.ts`, `admin-guard.ts` | Rutas `/admin/certificaciones*` con `canActivate: [adminGuard]` |
| `AdminShell` + `SidebarAdmin` | `features/admin/admin-shell.*`, `sidebar-admin.*` | Item Certificaciones pasa a ruta real, mismo `isActive()` por prefijo |
| Patrón `*_SOURCE` | `COURSES_SOURCE`, `ATTENDANCE_SOURCE` | Crear `CERTIFICATIONS_SOURCE` (`InjectionToken<CertificationsService>`) |
| `InMemoryXService` | `in-memory-courses.service.ts`, `attendances/data/attendance-mock.service.ts` | `InMemoryCertificationsService` con `listar`, `obtener`, `contar`; mutación solo en instancia |
| Páginas con búsqueda nativa + `<section>` + `<article>` | `courses-list-page`, `attendances-list-page` | `certifications-list-page` con filtro por estado |
| `__checks__/no-secrets.spec.ts`, `__checks__/no-real-data.spec.ts` | Mismo patrón | Aplicar a `features/admin/certifications/` |
| `RouterTestingHarness` + `withComponentInputBinding()` | `app.routes.spec.ts` | Agregar casos para las dos páginas nuevas |
| `BandaEstado` | `shared/ui/banda-estado.*` | Estado del certificado (`borrador|vigente|revocado|vencido`) |
| `CampoDato`, `FolioShell`, `HeaderInstitucional` | `shared/ui/` | Previsualización del certificado, dl/dt/dd nativos |
| Tokens CSS F1-02 | `apps/frontend-angular/src/styles.css` | Reutilizar sin redefinir |
| `apps/frontend-angular/src/app/features/admin/courses/courses.models.ts` y `attendances/models/attendance.types.ts` | F2-04/F2-05 | Alineación de tipos (`EstadoX`, `XFiltros`) sin acoplar runtime |

## Riesgos y edge cases

| Riesgo | Mitigación |
|---|---|
| Re-pisar `adminGuard` o `MOCK_SESSION` | No modificar `mock-session.ts` ni `admin-guard.ts`; sólo registrar `canActivate: [adminGuard]` en el nuevo bloque de rutas |
| Activar CTAs de emisión/revocación/PDF/QR por descuido | Todos los CTAs secundarios arrancan deshabilitados con copy explícito "Disponible en F4-01", "F4-02", "F5-04", "F6-01" |
| Filtro de estado con valor inválido en mock | Validar contra `EstadoCertificado`; estado fuera del enum → 0 resultados y `<output aria-live="polite">` "Sin coincidencias" |
| Orden de rutas admin | `/admin/certificaciones` (estática) y `/admin/certificaciones/:id` (con parámetro) en orden seguro antes del catch-all; el `:id` numérico o string debe validarse y mostrar "no encontrado" sin crashear |
| `documentMasked` accidentalmente completado en el seed | Pattern `XX****XX` o `00******00` (DNI enmascarado). Negative check de `spec` dedicado |
| `publicValidationUrl` truncado a UI admin en previsualización | Mostrar primeros N caracteres (ej. 60) + botón "Copiar" con `aria-live`; nunca el token completo. En mocks, el token en la URL es ficticio |
| `tokenPrefix` mal derivado de un token completo en mock | Construir el prefijo independientemente del token (`prefijo_demo_xxx`); ningún mock debe tener un token verificable real |
| Sesión mock no activa al navegar directo a `/admin/certificaciones` | `adminGuard` ya redirige a `/admin/login`; el test de `app.routes.spec.ts` debe cubrir el caso |
| Sobre-ingeniería: crear un `certificacion-emitir-form`, un `pdf-renderer` o un `qr-svg` cuando el spec dice "no emisión, no PDF, no QR" | Limitar el alcance a `listar` + `obtener` + `contar`; el preview sólo muestra `<dl>` con datos seguros y CTAs deshabilitados. Marcar `ponytail:` cualquier abstracción especulativa |
| Regresión visual en el dashboard o sidebar | Reuso de `<a routerLink>` y conteo ficticio; smoke manual contra el listado |
| `app.routes.spec.ts` que prueba orden y provider con mocks se vuelve frágil | Mantener el patrón actual: tests con `RouterTestingHarness` y `withComponentInputBinding()`; agregar ids inválidos sin tirar runtime |
| Tamaño de revisión > 5000 líneas | F2-04 midió ~3800 y F2-05 ~2870; F2-06 con sólo listado + preview + checks + spec nuevo debería quedar ~1500-2500 líneas → dentro del budget. Si supera, dividir en dos PRs (listado en uno, preview en otro) antes de `apply` |
| Confusión entre `documentMasked` (admin) y `documentNumber` (público) | Spec `admin-certifications-frontend` debe aclarar: en UI admin siempre `documentMasked`; DNI completo solo en `validar/:tokenCertificacion` pública |
| Git push directo a `main` | Prohibido por AGENTS.md; toda operación Git con aprobación explícita y comandos exactos |
| Tech debt conocido: `HeaderInstitucional` raíz en `/admin/*` | Documentado en F2-03/F2-05; no tocar en F2-06 |

## Enfoque recomendado y alternativas

| Enfoque | Pros | Contras | Esfuerzo |
|---|---|---|---|
| **A. Listado + preview + sidebar/dashboard activado (recomendado)** | Cobertura completa del handoff; reuso pleno de F2-04/F2-05; budget cómodo; habilita F4-01 sin reescribir | Página de preview más amplia que F2-04 (sin editor) | Bajo–Medio |
| B. Solo listado + sidebar/dashboard activado | Mínimo, sin preview | F2-06 dejaría la previsualización como handoff total a F4-01, alejándose del "listar/previsualizar" del prompt raíz | Muy bajo |
| C. Listado + preview + emisión mockeada | Mostraría la pantalla de emisión con datos ficticios | El prompt raíz y los specs prohíben emisión real y PDF/QR reales; choca con el límite explícito de F2-06 | Alto + scope creep |

**Recomendación: A.** Es la lectura literal del prompt raíz ("preparar la UI administrativa para listar/previsualizar certificaciones con mocks explícitos") y el espejo natural de F2-05 (que activó Asistencias con lista + marcado). El preview muestra DTO seguro del backend (`documentMasked`, `tokenPrefix`, `publicValidationUrl` truncado, `attendedDates`, `auditEvents`) sin generación real.

## Forecast de tamaño

Estimación contra presupuesto de revisión de **5000 líneas** (`additions + deletions`):

- `features/admin/certifications/` (modelos, service, mock, list, preview, specs, checks): ~600-900 líneas.
- Modificaciones en `app.routes.ts`, `sidebar-admin.*`, `admin-dashboard-page.*`, `app.routes.spec.ts`, `admin-shell.*`: ~200-300 líneas.
- Spec `openspec/specs/admin-certifications-frontend/spec.md` (nuevo): ~50-80 líneas.
- Update `docs/frontend/00-angular20-port-v0.md` + `openspec/specs/admin-foundation/spec.md`: ~50-100 líneas.
- Tests existentes adaptados y agregados: ~200-400 líneas.

**Total estimado: ~1100-1800 líneas.** Budget risk: **Low**. Si la implementación supera 2500 líneas, dividir en dos PRs (listado primero, preview después) usando `work-unit-commits` antes de `apply`. No se requiere `size:exception` salvo que aparezca scope creep.

**Chained PRs recommended: No** (corte por feature auto-contenido). **Decision needed before apply: No** (alcance claro y dentro del budget).

## Ready for proposal

**Yes.** La próxima fase recomendada es `sdd-propose` sobre `openspec/changes/f2-06-admin-certifications/proposal.md`, con el siguiente esqueleto:

1. **Why** — cerrar el handoff de F2-06 ("Certificaciones DEBE seguir como handoff F2-06"), activando la pantalla de Certificaciones con la misma base navegable y mockeada que F2-05 dejó en Asistencias.
2. **What changes** — spec `admin-certifications-frontend` (nuevo) + `admin-foundation` (actualización de handoff) + código Angular 20 bajo `features/admin/certifications/` + activar sidebar/dashboard + actualizar `docs/frontend/00-angular20-port-v0.md`.
3. **Impact** — sólo frontend; sin backend, sin deploy, sin DB, sin auth real, sin deps nuevas. Rutas `/admin/certificaciones` y `/admin/certificaciones/:id`.
4. **Rollback** — revertir PR; el shell admin sigue funcionando con placeholder deshabilitado como antes de F2-06.
5. **Out of scope** — emisión, revocación, PDF, QR, entrega manual, integración HTTP, `X-Admin-Key`, storage, datos reales, DNI completo admin, tokens, deps nuevas, Tailwind.

Sugerencia de nombre de cambio OpenSpec: `f2-06-admin-certifications` (alineado a la rama y al índice de fases de Matías).

## Siguiente fase sugerida

`sdd-propose` sobre el cambio `f2-06-admin-certifications` en `openspec/changes/f2-06-admin-certifications/proposal.md`.
